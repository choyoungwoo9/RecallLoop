package com.study.app.domain.quiz.dto

data class GeminiRequest(
    val contents: List<Content>,
    val generationConfig: GenerationConfig? = null
) {
    data class Content(
        val parts: List<Part>
    ) {
        data class Part(
            val text: String
        )
    }

    data class GenerationConfig(
        val temperature: Double = 0.7
    )

    companion object {
        fun create(prompt: String): GeminiRequest {
            return GeminiRequest(
                contents = listOf(
                    Content(
                        parts = listOf(
                            Content.Part(text = prompt)
                        )
                    )
                ),
                generationConfig = GenerationConfig(temperature = 0.7)
            )
        }
    }
}
