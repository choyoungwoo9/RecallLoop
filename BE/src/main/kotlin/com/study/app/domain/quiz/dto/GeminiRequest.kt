package com.study.app.domain.quiz.dto

data class GeminiRequest(
    val contents: List<Content>
) {
    data class Content(
        val parts: List<Part>
    ) {
        data class Part(
            val text: String
        )
    }

    companion object {
        fun create(prompt: String): GeminiRequest {
            return GeminiRequest(
                contents = listOf(
                    Content(
                        parts = listOf(
                            Content.Part(text = prompt)
                        )
                    )
                )
            )
        }
    }
}
