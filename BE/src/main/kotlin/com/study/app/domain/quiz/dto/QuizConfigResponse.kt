package com.study.app.domain.quiz.dto

import com.study.app.domain.quiz.QuizConfig
import java.time.LocalDateTime

data class QuizConfigResponse(
    val id: Long?,
    val description: String,
    val questionCount: Int,
    val createdAt: LocalDateTime
) {
    companion object {
        fun from(quizConfig: QuizConfig): QuizConfigResponse {
            return QuizConfigResponse(
                id = quizConfig.id,
                description = quizConfig.description,
                questionCount = quizConfig.questionCount,
                createdAt = quizConfig.createdAt
            )
        }
    }
}
