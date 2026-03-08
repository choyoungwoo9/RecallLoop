package com.study.app.domain.quiz.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty

@JsonIgnoreProperties(ignoreUnknown = true)
data class GeminiResponse(
    val candidates: List<Candidate> = emptyList()
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    data class Candidate(
        val content: Content = Content()
    ) {
        @JsonIgnoreProperties(ignoreUnknown = true)
        data class Content(
            val parts: List<Part> = emptyList()
        ) {
            @JsonIgnoreProperties(ignoreUnknown = true)
            data class Part(
                val text: String = ""
            )
        }
    }

    fun extractText(): String {
        return candidates
            .firstOrNull()
            ?.content
            ?.parts
            ?.firstOrNull()
            ?.text
            ?: ""
    }
}

data class GeneratedQuiz(
    val question: String,
    val answer: String
)
