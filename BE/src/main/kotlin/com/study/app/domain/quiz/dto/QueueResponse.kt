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
    val studyLogId: Long?,
    val studyLogTitle: String,
    val queueOrder: Int,
    val difficulty: Int
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

data class CompletionSummaryQuizItem(
    val id: Long,
    val question: String,
    val answer: String,
    val submittedAnswer: String,
    val elapsedSeconds: Int
)

data class CompletionSummaryEvaluationResponse(
    val studyLogId: Long,
    val selfEvaluation: com.study.app.domain.quiz.SelfEvaluation,
    val updatedAttemptCount: Int,
    val poorQualityQuizCount: Int
)

data class CompletionSummaryResponse(
    val studyLog: StudyLogResponse,
    val studyLogContent: String,
    val quizzes: List<CompletionSummaryQuizItem>
) {
    companion object {
        fun from(
            studyLog: com.study.app.domain.studylog.StudyLog,
            quizzes: List<com.study.app.domain.quiz.Quiz>,
            attempts: List<com.study.app.domain.quiz.QuizAttempt>
        ): CompletionSummaryResponse {
            val attemptsMap = attempts.associateBy { it.quiz.id }

            val summaryQuizzes = quizzes.map { quiz ->
                val attempt = attemptsMap[quiz.id]
                CompletionSummaryQuizItem(
                    id = quiz.id!!,
                    question = quiz.question,
                    answer = quiz.answer,
                    submittedAnswer = attempt?.submittedAnswer ?: "미답변",
                    elapsedSeconds = attempt?.elapsedSeconds ?: 0
                )
            }

            return CompletionSummaryResponse(
                studyLog = StudyLogResponse(id = studyLog.id!!, title = studyLog.title),
                studyLogContent = studyLog.content,
                quizzes = summaryQuizzes
            )
        }
    }
}
