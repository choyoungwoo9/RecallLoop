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
        val quiz = quizRepository.findById(quizId)
            .orElseThrow { IllegalArgumentException("Quiz not found") }

        // 1. QuizAttempt 저장
        val attempt = QuizAttempt(
            quiz = quiz,
            submittedAnswer = submittedAnswer,
            elapsedSeconds = elapsedSeconds
        )
        val savedAttempt = quizAttemptRepository.save(attempt)

        // 2. 현재 QueueState 조회 (읽기 전용)
        val queueState = queueStateRepository.findById(1L).orElse(null)
            ?: QueueState(id = 1L).let { queueStateRepository.save(it) }

        // 3. completedCount와 한 바퀴 완료 판정 (메모리에서만 계산)
        var isCycleComplete = false
        val nextCompletedCount = queueState.completedCount + 1
        if (nextCompletedCount >= queueState.totalCount && queueState.totalCount > 0) {
            isCycleComplete = true
        }

        // 4. 다음 문제 계산 (메모리에서만)
        val nextQueueOrder = (quiz.queueOrder % queueState.totalCount) + 1
        val nextQuiz = quizRepository.findByQueueOrder(nextQueueOrder).firstOrNull()

        // 5. 완주 감지: 현재 studyLog의 모든 문제가 현재 사이클에서 완료되었는지 확인
        val currentStudyLogId = quiz.studyLog.id!!
        val quizzesInCurrentStudyLog = quizRepository.findByStudyLogId(currentStudyLogId)
        val cycleStartedAt = queueState.cycleStartedAt

        val completedStudyLog = if (quizzesInCurrentStudyLog.isEmpty()) {
            null
        } else {
            // 이 studyLog의 모든 문제가 현재 사이클 이후에 attempt 기록이 있는가?
            val allQuizzesAttempted = quizzesInCurrentStudyLog.all { quizInLog ->
                quizAttemptRepository.findAttemptByQuizIdAfter(quizInLog.id!!, cycleStartedAt) != null
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
            // 한 바퀴 완료: 한 번의 SQL로 completedCount=1, cycle_started_at=현재, currentQuizId=다음 문제
            queueStateRepository.resetAndSetNextQuiz(nextQuiz?.id)
        } else {
            // 일반적인 경우: completedCount + 1 + 다음 문제 포인터 이동
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
                cycleStartedAt = LocalDateTime.now()
            )
        } else {
            queueState = queueState.copy(
                currentQuiz = allQuizzes.firstOrNull(),
                totalCount = totalCount,
                completedCount = 0,
                cycleStartedAt = LocalDateTime.now()
            )
        }

        queueStateRepository.save(queueState)

        return getQueueStatus()
    }
}
