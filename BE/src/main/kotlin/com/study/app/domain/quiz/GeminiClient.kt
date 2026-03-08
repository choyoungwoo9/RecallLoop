package com.study.app.domain.quiz

import com.fasterxml.jackson.databind.ObjectMapper
import com.study.app.config.GeminiProperties
import com.study.app.domain.quiz.dto.GeneratedQuiz
import com.study.app.domain.quiz.dto.GeminiRequest
import com.study.app.domain.quiz.dto.GeminiResponse
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono

@Component
class GeminiClient(
    private val geminiWebClient: WebClient,
    private val geminiProperties: GeminiProperties,
    private val objectMapper: ObjectMapper
) {
    fun generateQuizzes(
        studyContent: String,
        description: String,
        questionCount: Int
    ): List<GeneratedQuiz> {
        val prompt = buildPrompt(studyContent, description, questionCount)
        val request = GeminiRequest.create(prompt)

        val response = geminiWebClient.post()
            .uri("?key=${geminiProperties.apiKey}")
            .bodyValue(request)
            .retrieve()
            .bodyToMono(GeminiResponse::class.java)
            .block()
            ?: return emptyList()

        val text = response.extractText()
        return parseJsonFromText(text)
    }

    private fun buildPrompt(studyContent: String, description: String, questionCount: Int): String {
        return """
            |You are a helpful study assistant. Based on the following study content and description,
            |generate exactly $questionCount quiz questions in JSON format.
            |
            |Study Content:
            |$studyContent
            |
            |Quiz Description:
            |$description
            |
            |Generate exactly $questionCount quiz questions as a JSON array with this format:
            |[
            |  {"question": "...", "answer": "..."},
            |  ...
            |]
            |
            |Return only the JSON array, no markdown formatting or explanation.
        """.trimMargin()
    }

    private fun parseJsonFromText(text: String): List<GeneratedQuiz> {
        try {
            // Remove markdown code blocks if present
            val cleanedText = text
                .replace(Regex("```json\\s*"), "")
                .replace(Regex("```\\s*"), "")
                .trim()

            return objectMapper.readValue(
                cleanedText,
                objectMapper.typeFactory.constructCollectionType(
                    List::class.java,
                    GeneratedQuiz::class.java
                )
            )
        } catch (e: Exception) {
            throw IllegalArgumentException("Failed to parse Gemini response: $text", e)
        }
    }
}
