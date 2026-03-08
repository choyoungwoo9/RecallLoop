package com.study.app.domain.quiz

import com.study.app.domain.quiz.dto.*
import com.study.app.domain.studylog.StudyLogRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

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

        // 2. QueueState 조회 또는 생성
        var queueState = queueStateRepository.findById(1L).orElse(null)
            ?: QueueState(id = 1L).let { queueStateRepository.save(it) }

        // 3. completedCount + 1
        var isCycleComplete = false
        queueState.completedCount++

        // 4. 다음 queueOrder의 Quiz 조회 또는 한 바퀴 완료 판정
        if (queueState.completedCount >= queueState.totalCount && queueState.totalCount > 0) {
            isCycleComplete = true
            queueState.completedCount = 0
        }

        // 5. 다음 문제 포인터 이동
        val nextQueueOrder = (quiz.queueOrder % queueState.totalCount) + 1
        val nextQuiz = quizRepository.findByQueueOrder(nextQueueOrder).firstOrNull()
        queueState.currentQuiz = nextQuiz

        queueStateRepository.save(queueState)

        // 6. 완주 감지: 현재 studyLog의 모든 quiz가 attempt되었는지 확인
        val currentStudyLogId = quiz.studyLog.id!!
        val quizzesInCurrentStudyLog = quizRepository.findByStudyLogId(currentStudyLogId)
        val attemptedQuizzesInCurrentStudyLog = quizzesInCurrentStudyLog.count { quizInLog ->
            quizAttemptRepository.findLatestAttemptByQuizId(quizInLog.id!!) != null
        }

        val completedStudyLog = if (attemptedQuizzesInCurrentStudyLog == quizzesInCurrentStudyLog.size) {
            val studyLog = studyLogRepository.findById(currentStudyLogId)
                .orElseThrow { IllegalArgumentException("StudyLog not found") }
            StudyLogResponse(
                id = studyLog.id!!,
                title = studyLog.title
            )
        } else {
            null
        }

        return QueueSubmitResponse(
            attempt = QuizAttemptResponse.from(savedAttempt),
            nextQuiz = nextQuiz?.let { quiz ->
                NextQuizResponse(
                    id = quiz.id!!,
                    question = quiz.question
                )
            },
            completedStudyLog = completedStudyLog,
            isCycleComplete = isCycleComplete
        )
    }
}
