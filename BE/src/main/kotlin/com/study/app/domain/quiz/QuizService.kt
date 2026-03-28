package com.study.app.domain.quiz

import com.study.app.domain.quiz.dto.QuizResponse
import com.study.app.domain.quiz.dto.CompletionSummaryEvaluationResponse
import com.study.app.domain.studylog.StudyLogRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
@Transactional
class QuizService(
    private val quizRepository: QuizRepository,
    private val quizConfigRepository: QuizConfigRepository,
    private val studyLogRepository: StudyLogRepository,
    private val queueStateRepository: QueueStateRepository,
    private val quizAttemptRepository: QuizAttemptRepository,
    private val quizAttemptHistoryRepository: QuizAttemptHistoryRepository,
    private val geminiClient: GeminiClient
) {
    fun generateQuizzes(configId: Long): List<QuizResponse> {
        val quizConfig = quizConfigRepository.findByIdOrNull(configId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "QuizConfig not found: $configId")

        val studyLog = quizConfig.studyLog

        // Generate quizzes from Gemini
        val generatedQuizzes = geminiClient.generateQuizzes(
            studyContent = studyLog.content,
            description = quizConfig.description,
            questionCount = quizConfig.questionCount
        )

        // Save quizzes (queueOrder는 재정렬 후 할당)
        generatedQuizzes.forEach { generatedQuiz ->
            val quiz = Quiz(
                quizConfig = quizConfig,
                studyLog = studyLog,
                question = generatedQuiz.question,
                answer = generatedQuiz.answer,
                queueOrder = 0 // 임시값, 재정렬 후 업데이트
            )
            quizRepository.save(quiz)
        }

        // 전체 queueOrder를 1부터 새로 정렬
        reorderAllQuizzes()

        // 재정렬 후 최신 데이터 조회
        val updatedQuizzes = quizRepository.findByQuizConfigIdAndIsActiveInQueueTrueOrderByQueueOrder(configId)
        return updatedQuizzes.map { QuizResponse.from(it) }
    }

    @Transactional(readOnly = true)
    fun findByStudyLogId(studyLogId: Long): List<QuizResponse> {
        return quizRepository.findByStudyLogIdAndIsActiveInQueueTrueOrderByQueueOrder(studyLogId)
            .map { QuizResponse.from(it) }
    }

    fun delete(id: Long) {
        quizRepository.findByIdOrNull(id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found: $id")

        quizAttemptRepository.deleteByQuizId(id)
        quizAttemptHistoryRepository.deleteByQuizId(id)
        quizRepository.deleteById(id)

        reorderAllQuizzes()
    }

    fun syncQueueState() {
        reorderAllQuizzes()
    }

    /**
     * 전체 문제를 queueOrder 기준으로 정렬하고 1부터 재정렬
     */
    private fun reorderAllQuizzes() {
        val allQuizzes = quizRepository.findAll()
            .filter { it.isActiveInQueue }
            .sortedWith(
                compareBy<Quiz>(
                    { if (it.queueOrder > 0) 0 else 1 },
                    { if (it.queueOrder > 0) it.queueOrder else Int.MAX_VALUE },
                    { it.id ?: Long.MAX_VALUE }
                )
            )

        allQuizzes.forEachIndexed { index, quiz ->
            val newQueueOrder = index + 1
            if (quiz.queueOrder != newQueueOrder) {
                val updated = quiz.copy(queueOrder = newQueueOrder)
                quizRepository.save(updated)
            }
        }

        // QueueState 재초기화
        resetQueueState()
    }

    /**
     * QueueState를 초기 상태로 리셋
     * - active queue만 대상으로 재구성
     */
    private fun resetQueueState() {
        val allQuizzes = quizRepository.findAll().filter { it.isActiveInQueue }
        val firstQuiz = allQuizzes.minByOrNull { it.queueOrder }
        val newTotalCount = allQuizzes.size

        val existingQueueState = queueStateRepository.findById(1L).orElse(null)
        val preservedCompletedCount = if (existingQueueState != null) {
            minOf(existingQueueState.completedCount, newTotalCount)
        } else {
            0
        }

        val queueState = QueueState(
            id = 1,
            currentQuiz = firstQuiz,
            totalCount = newTotalCount,
            completedCount = preservedCompletedCount,
            cycleStartedAt = existingQueueState?.cycleStartedAt ?: java.time.LocalDateTime.now(),
            cycleJustCompleted = existingQueueState?.cycleJustCompleted ?: false
        )

        queueStateRepository.save(queueState)
    }

    fun getCompletionSummary(studyLogId: Long): com.study.app.domain.quiz.dto.CompletionSummaryResponse {
        val studyLog = studyLogRepository.findById(studyLogId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "StudyLog not found: $studyLogId") }

        val quizzes = quizRepository.findByStudyLogIdAndIsActiveInQueueTrueOrderByQueueOrder(studyLogId)
        // 현재 사이클의 attempt만 조회 (타임스탐프 비교 제거!)
        val attempts = quizAttemptRepository.findCurrentByStudyLogId(studyLogId)

        return com.study.app.domain.quiz.dto.CompletionSummaryResponse.from(studyLog, quizzes, attempts)
    }

    fun saveCompletionSummaryEvaluation(
        studyLogId: Long,
        selfEvaluation: SelfEvaluation,
        poorQualityQuizIds: List<Long>
    ): CompletionSummaryEvaluationResponse {
        val activeQuizzes = quizRepository.findByStudyLogIdAndIsActiveInQueueTrueOrderByQueueOrder(studyLogId)
        if (activeQuizzes.isEmpty()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Active quizzes not found for StudyLog: $studyLogId")
        }

        val activeQuizIds = activeQuizzes.mapNotNull { it.id }.toSet()
        val attempts = quizAttemptRepository.findCurrentByStudyLogId(studyLogId)
            .filter { it.quiz.id in activeQuizIds }

        val attemptedQuizIds = attempts.mapNotNull { it.quiz.id }.toSet()
        if (attemptedQuizIds != activeQuizIds) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "StudyLog is not completed in current cycle: $studyLogId")
        }

        val poorQualityQuizIdSet = poorQualityQuizIds.toSet()
        if (!activeQuizIds.containsAll(poorQualityQuizIdSet)) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Poor-quality quiz ids are invalid for StudyLog: $studyLogId")
        }

        attempts.forEach { attempt ->
            attempt.selfEvaluation = selfEvaluation
            attempt.problemFeedback = if (attempt.quiz.id in poorQualityQuizIdSet) {
                ProblemFeedback.DISLIKED
            } else {
                ProblemFeedback.NONE
            }
        }
        quizAttemptRepository.saveAll(attempts)

        return CompletionSummaryEvaluationResponse(
            studyLogId = studyLogId,
            selfEvaluation = selfEvaluation,
            updatedAttemptCount = attempts.size,
            poorQualityQuizCount = poorQualityQuizIdSet.size
        )
    }

    /**
     * 특정 난이도의 변형 문제를 찾거나 생성
     * 1. DB에서 같은 originalQuiz의 해당 난이도 변형을 탐색
     * 2. 없으면 Gemini로 생성
     * 3. 저장 후 반환
     */
    fun findOrCreateVariant(quiz: Quiz, targetDifficulty: Int): Quiz {
        val clampedDifficulty = targetDifficulty.coerceIn(1, 10)
        val originalId = quiz.originalQuizId ?: quiz.id!!

        // 1. DB에서 탐색
        val existing = quizRepository.findByOriginalQuizIdAndDifficulty(originalId, clampedDifficulty)
        if (existing != null) {
            return existing
        }

        // 2. Gemini로 생성 (삭제된 기록의 문제는 변형 생성 불가)
        if (quiz.studyLog == null) return quiz
        val generated = try {
            geminiClient.generateVariantQuiz(
                question = quiz.question,
                studyContent = quiz.studyLog.content,
                difficulty = clampedDifficulty
            )
        } catch (e: Exception) {
            println("Failed to generate variant quiz: ${e.message}")
            // Gemini 오류 시 해당 quiz는 교체하지 않고 원본 유지
            return quiz
        }

        // 3. 저장
        val variantQuiz = Quiz(
            quizConfig = quiz.quizConfig,
            studyLog = quiz.studyLog,
            question = generated.question,
            answer = generated.answer,
            queueOrder = 0,  // 임시값, 나중에 재정렬
            difficulty = clampedDifficulty,
            originalQuizId = originalId,
            isActiveInQueue = false
        )
        return quizRepository.save(variantQuiz)
    }

    /**
     * 큐에서 original quiz를 variant quiz로 교체
     * - variant의 queueOrder을 original의 queueOrder로 설정
     * - original의 queueOrder을 0으로 설정 (큐에서 제외)
     */
    fun replaceInQueue(original: Quiz, variant: Quiz) {
        if (original.id == variant.id) {
            // 같은 문제면 교체 불필요
            return
        }

        // variant를 original의 자리에 배치
        val variantWithOrder = variant.copy(
            queueOrder = original.queueOrder,
            isActiveInQueue = true
        )
        quizRepository.save(variantWithOrder)

        // original을 큐에서 제외
        val originalExcluded = original.copy(
            queueOrder = 0,
            isActiveInQueue = false
        )
        quizRepository.save(originalExcluded)
    }

    /**
     * 적응형 난이도 처리
     * 이관된 attempt들의 selfEvaluation에 따라 다음 사이클 문제를 교체
     */
    fun processAdaptiveDifficulty(attempts: List<QuizAttempt>) {
        var changed = false

        for (attempt in attempts) {
            val quiz = attempt.quiz
            if (!quiz.isActiveInQueue) {
                continue
            }

            val targetDifficulty = when (attempt.selfEvaluation) {
                SelfEvaluation.TOO_EASY -> minOf(quiz.difficulty + 1, 10)
                SelfEvaluation.TOO_HARD -> maxOf(quiz.difficulty - 1, 1)
                SelfEvaluation.OK -> quiz.difficulty  // 변경 없음
            }

            if (targetDifficulty != quiz.difficulty) {
                // 새로운 난이도의 변형 문제 찾기/생성
                val variant = findOrCreateVariant(quiz, targetDifficulty)
                // 큐에서 교체
                replaceInQueue(quiz, variant)
                changed = true
            }
        }

        // 변경이 있으면 전체 queueOrder 재정렬
        if (changed) {
            reorderAllQuizzes()
        }
    }
}
