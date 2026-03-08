package com.study.app.domain.quiz.dto

import com.study.app.domain.quiz.Quiz
import java.time.LocalDateTime

data class QuizResponse(
    val id: Long?,
    val question: String,
    val answer: String?,
    val queueOrder: Int,
    val createdAt: LocalDateTime
) {
    companion object {
        fun from(quiz: Quiz): QuizResponse {
            return QuizResponse(
                id = quiz.id,
                question = quiz.question,
                answer = quiz.answer,
                queueOrder = quiz.queueOrder,
                createdAt = quiz.createdAt
            )
        }

        fun fromWithoutAnswer(quiz: Quiz): QuizResponse {
            return QuizResponse(
                id = quiz.id,
                question = quiz.question,
                answer = null,
                queueOrder = quiz.queueOrder,
                createdAt = quiz.createdAt
            )
        }
    }
}
