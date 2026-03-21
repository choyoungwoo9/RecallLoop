package com.study.app.domain.quiz

import com.study.app.domain.quiz.dto.QuizResponse
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
        val savedQuizzes = generatedQuizzes.map { generatedQuiz ->
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

        return savedQuizzes.map { QuizResponse.from(it) }
    }

    @Transactional(readOnly = true)
    fun findByStudyLogId(studyLogId: Long): List<QuizResponse> {
        return quizRepository.findByStudyLogIdOrderByQueueOrder(studyLogId)
            .map { QuizResponse.from(it) }
    }

    fun delete(id: Long) {
        val quiz = quizRepository.findByIdOrNull(id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found: $id")

        // 문제 삭제
        quizRepository.deleteById(id)

        // 전체 queueOrder를 1부터 새로 정렬
        reorderAllQuizzes()
    }

    /**
     * 전체 문제를 queueOrder 기준으로 정렬하고 1부터 재정렬
     */
    private fun reorderAllQuizzes() {
        val allQuizzes = quizRepository.findAll().sortedBy { it.id } // 안정적인 정렬을 위해 ID 기준

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
     * - currentQuiz: 첫 번째 문제로 설정
     * - totalCount: 현재 전체 문제 수로 업데이트
     * - completedCount: 보존 (새로운 totalCount를 초과하지 않도록 조정)
     * - cycleStartedAt: 보존
     */
    private fun resetQueueState() {
        val allQuizzes = quizRepository.findAll()
        val firstQuiz = allQuizzes.minByOrNull { it.queueOrder }
        val newTotalCount = allQuizzes.size

        // 기존 QueueState 조회 (completedCount 보존을 위해)
        val existingQueueState = queueStateRepository.findById(1L).orElse(null)
        val preservedCompletedCount = if (existingQueueState != null) {
            // 새로운 totalCount를 초과하지 않도록 조정
            minOf(existingQueueState.completedCount, newTotalCount)
        } else {
            0
        }

        val queueState = QueueState(
            id = 1,
            currentQuiz = firstQuiz,
            totalCount = newTotalCount,
            completedCount = preservedCompletedCount
        )

        queueStateRepository.save(queueState)
    }

    fun getCompletionSummary(studyLogId: Long): com.study.app.domain.quiz.dto.CompletionSummaryResponse {
        val studyLog = studyLogRepository.findById(studyLogId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "StudyLog not found: $studyLogId") }

        val quizzes = quizRepository.findByStudyLogId(studyLogId)
        // 현재 사이클의 attempt만 조회 (타임스탐프 비교 제거!)
        val attempts = quizAttemptRepository.findCurrentByStudyLogId(studyLogId)

        return com.study.app.domain.quiz.dto.CompletionSummaryResponse.from(studyLog, quizzes, attempts)
    }
}
