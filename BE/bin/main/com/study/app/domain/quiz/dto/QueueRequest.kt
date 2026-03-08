package com.study.app.domain.quiz.dto

data class QueueSubmitRequest(
    val quizId: Long,
    val submittedAnswer: String,
    val elapsedSeconds: Int
)
