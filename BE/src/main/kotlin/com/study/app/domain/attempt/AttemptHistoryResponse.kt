package com.study.app.domain.attempt

import com.study.app.domain.quiz.QuizAttempt
import com.study.app.domain.quiz.QuizAttemptHistory
import com.study.app.domain.quiz.SelfEvaluation
import java.time.LocalDateTime

data class AttemptHistoryItem(
    val id: Long,
    val quizId: Long,
    val question: String,
    val correctAnswer: String,
    val submittedAnswer: String,
    val elapsedSeconds: Int,
    val attemptedAt: LocalDateTime,
    val studyLogId: Long,
    val studyLogTitle: String,
    val isCurrent: Boolean,
    val migratedAt: LocalDateTime?,
    val selfEvaluation: SelfEvaluation,
    val difficulty: Int
) {
    companion object {
        fun fromCurrent(attempt: QuizAttempt) = AttemptHistoryItem(
            id = attempt.id!!,
            quizId = attempt.quiz.id!!,
            question = attempt.quiz.question,
            correctAnswer = attempt.quiz.answer,
            submittedAnswer = attempt.submittedAnswer,
            elapsedSeconds = attempt.elapsedSeconds,
            attemptedAt = attempt.attemptedAt,
            studyLogId = attempt.quiz.studyLog.id!!,
            studyLogTitle = attempt.quiz.studyLog.title,
            isCurrent = true,
            migratedAt = null,
            selfEvaluation = attempt.selfEvaluation,
            difficulty = attempt.quiz.difficulty
        )

        fun fromHistory(history: QuizAttemptHistory) = AttemptHistoryItem(
            id = history.id!!,
            quizId = history.quiz.id!!,
            question = history.quiz.question,
            correctAnswer = history.quiz.answer,
            submittedAnswer = history.submittedAnswer,
            elapsedSeconds = history.elapsedSeconds,
            attemptedAt = history.attemptedAt,
            studyLogId = history.quiz.studyLog.id!!,
            studyLogTitle = history.quiz.studyLog.title,
            isCurrent = false,
            migratedAt = history.migratedAt,
            selfEvaluation = history.selfEvaluation,
            difficulty = history.quiz.difficulty
        )
    }
}
