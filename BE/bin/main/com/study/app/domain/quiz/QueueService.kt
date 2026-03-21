package com.study.app.domain.quiz

import com.study.app.domain.quiz.dto.*
import com.study.app.domain.studylog.StudyLogRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional
class QueueService(
    private val queueStateRepository: QueueStateRepository,
    private val quizRepository: QuizRepository,
    private val quizAttemptRepository: QuizAttemptRepository,
    private val quizAttemptHistoryRepository: QuizAttemptHistoryRepository,
    private val studyLogRepository: StudyLogRepository
) {
    fun getCurrentQuiz(): CurrentQuizResponse? {
        val queueState = queueStateRepository.findById(1L).orElse(null) ?: return null
        val currentQuiz = queueState.currentQuiz ?: return null
        return CurrentQuizResponse(
            id = currentQuiz.id!!,
            question = currentQuiz.question,
            studyLogId = currentQuiz.studyLog.id!!,
            studyLogTitle = currentQuiz.studyLog.title,
            queueOrder = currentQuiz.queueOrder
        )
    }

    fun getQueueStatus(): QueueStatusResponse {
        val queueState = queueStateRepository.findById(1L).orElse(null)
            ?: return QueueStatusResponse(
                totalCount = 0,
                completedCount = 0,
                progressPercent = 0,
                currentQuizId = null
            )

        val progressPercent = if (queueState.totalCount > 0) {
            (queueState.completedCount * 100) / queueState.totalCount
        } else {
            0
        }

        return QueueStatusResponse(
            totalCount = queueState.totalCount,
            completedCount = queueState.completedCount,
            progressPercent = progressPercent,
            currentQuizId = queueState.currentQuiz?.id
        )
    }

    fun submitAnswer(
        quizId: Long,
        submittedAnswer: String,
        elapsedSeconds: Int
    ): QueueSubmitResponse {
        // ===== 신규: 사이클 완료 후 이전 사이클 attempt를 history로 이관 =====
        val queueState = queueStateRepository.findById(1L).orElse(null)
            ?: QueueState(id = 1L).let { queueStateRepository.save(it) }

        if (queueState.cycleJustCompleted) {
            migratePreviousCycleAttempts()
            queueStateRepository.clearCycleJustCompletedFlag()
        }
        // =========================================================

        val quiz = quizRepository.findById(quizId)
            .orElseThrow { IllegalArgumentException("Quiz not found") }

        // 1. QuizAttempt 저장 (현재 사이클)
        val attempt = QuizAttempt(
            quiz = quiz,
            submittedAnswer = submittedAnswer,
            elapsedSeconds = elapsedSeconds
        )
        val savedAttempt = quizAttemptRepository.save(attempt)

        // 2. 현재 QueueState 다시 조회 (이관 후 최신 상태)
        val updatedQueueState = queueStateRepository.findById(1L).orElse(null)
            ?: QueueState(id = 1L).let { queueStateRepository.save(it) }

        // 3. completedCount와 한 바퀴 완료 판정 (메모리에서만 계산)
        var isCycleComplete = false
        val nextCompletedCount = updatedQueueState.completedCount + 1
        if (nextCompletedCount >= updatedQueueState.totalCount && updatedQueueState.totalCount > 0) {
            isCycleComplete = true
        }

        // 4. 다음 문제 계산 (메모리에서만)
        val nextQueueOrder = (quiz.queueOrder % updatedQueueState.totalCount) + 1
        val nextQuiz = quizRepository.findByQueueOrder(nextQueueOrder).firstOrNull()

        // 5. 완주 감지: 현재 studyLog의 모든 문제가 현재 사이클에서 완료되었는지 확인
        //    ⭐ 타임스탐프 비교 제거! 현재 QuizAttempt 테이블에만 있으면 현재 사이클
        val currentStudyLogId = quiz.studyLog.id!!
        val quizzesInCurrentStudyLog = quizRepository.findByStudyLogId(currentStudyLogId)

        val completedStudyLog = if (quizzesInCurrentStudyLog.isEmpty()) {
            null
        } else {
            val allQuizzesAttempted = quizzesInCurrentStudyLog.all { quizInLog ->
                if (quizInLog.id == quizId) {
                    true // 현재 제출 중인 문제는 방금 저장됨
                } else {
                    quizAttemptRepository.findLatestByQuizId(quizInLog.id!!) != null
                    // 현재 사이클의 QuizAttempt에 기록이 있으면 true
                }
            }

            if (allQuizzesAttempted) {
                val studyLog = studyLogRepository.findById(currentStudyLogId)
                    .orElseThrow { IllegalArgumentException("StudyLog not found") }
                StudyLogResponse(
                    id = studyLog.id!!,
                    title = studyLog.title
                )
            } else {
                null
            }
        }

        // 6. DB 레벨에서 원자적 업데이트
        if (isCycleComplete) {
            queueStateRepository.resetAndSetNextQuiz(nextQuiz?.id)
        } else {
            queueStateRepository.incrementCompletedAndSetNextQuiz(nextQuiz?.id)
        }

        return QueueSubmitResponse(
            attempt = QuizAttemptResponse.from(savedAttempt),
            nextQuiz = nextQuiz?.let { next ->
                NextQuizResponse(
                    id = next.id!!,
                    question = next.question
                )
            },
            completedStudyLog = completedStudyLog,
            isCycleComplete = isCycleComplete
        )
    }

    /**
     * 사이클 완료 후 이전 사이클의 모든 attempt를 history로 이관
     * - 현재 QuizAttempt에서 모든 레코드 조회
     * - QuizAttemptHistory로 이관
     * - QuizAttempt 비우기
     */
    private fun migratePreviousCycleAttempts() {
        // 현재 QuizAttempt 전체 조회
        val currentAttempts = quizAttemptRepository.findAll()

        if (currentAttempts.isNotEmpty()) {
            // QuizAttemptHistory로 변환 후 저장
            val historyRecords = currentAttempts.map { attempt ->
                QuizAttemptHistory(
                    quiz = attempt.quiz,
                    submittedAnswer = attempt.submittedAnswer,
                    elapsedSeconds = attempt.elapsedSeconds,
                    attemptedAt = attempt.attemptedAt
                )
            }

            quizAttemptHistoryRepository.saveAll(historyRecords)

            // 현재 QuizAttempt 전부 삭제
            quizAttemptRepository.deleteAll()
        }
    }

    fun initializeQueue(): QueueStatusResponse {
        // 모든 문제 조회
        val allQuizzes = quizRepository.findAll()
        val totalCount = allQuizzes.size

        // QueueState 초기화
        var queueState = queueStateRepository.findById(1L).orElse(null)

        if (queueState == null) {
            queueState = QueueState(
                id = 1,
                currentQuiz = allQuizzes.firstOrNull(),
                totalCount = totalCount,
                completedCount = 0,
                cycleStartedAt = LocalDateTime.now(),
                cycleJustCompleted = false
            )
        } else {
            queueState = queueState.copy(
                currentQuiz = allQuizzes.firstOrNull(),
                totalCount = totalCount,
                completedCount = 0,
                cycleStartedAt = LocalDateTime.now(),
                cycleJustCompleted = false
            )
        }

        queueStateRepository.save(queueState)

        // 초기화 시 현재 attempt도 비우기
        quizAttemptRepository.deleteAll()

        return getQueueStatus()
    }
}
