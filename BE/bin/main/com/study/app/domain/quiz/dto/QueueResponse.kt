package com.study.app.domain.quiz.dto

data class QueueStatusResponse(
    val totalCount: Int,
    val completedCount: Int,
    val progressPercent: Int,
    val currentQuizId: Long?
)

data class CurrentQuizResponse(
    val id: Long,
    val question: String,
    val studyLogId: Long,
    val studyLogTitle: String,
    val queueOrder: Int
)

data class CurrentQuizEmptyResponse(
    val quiz: QuizResponse? = null
)

data class QuizAttemptResponse(
    val id: Long,
    val submittedAnswer: String,
    val elapsedSeconds: Int
) {
    companion object {
        fun from(attempt: com.study.app.domain.quiz.QuizAttempt): QuizAttemptResponse {
            return QuizAttemptResponse(
                id = attempt.id ?: 0,
                submittedAnswer = attempt.submittedAnswer,
                elapsedSeconds = attempt.elapsedSeconds
            )
        }
    }
}

data class StudyLogResponse(
    val id: Long,
    val title: String
)

data class NextQuizResponse(
    val id: Long,
    val question: String
)

data class QueueSubmitResponse(
    val attempt: QuizAttemptResponse,
    val nextQuiz: NextQuizResponse?,
    val completedStudyLog: StudyLogResponse?,
    val isCycleComplete: Boolean
)
