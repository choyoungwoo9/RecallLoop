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

        try {
            val requestJson = objectMapper.writeValueAsString(request)
            println("=== Gemini API Request ===")
            println("URL: https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent")
            println("Body: $requestJson")

            val response = geminiWebClient.post()
                .uri("/gemini-2.5-flash-lite:generateContent")
                .bodyValue(request)
                .retrieve()
                .onStatus({ it.is4xxClientError || it.is5xxServerError }) { clientResponse ->
                    clientResponse.bodyToMono(String::class.java).flatMap { body ->
                        println("=== Gemini API Error ===")
                        println("Body: $body")
                        Mono.error(Exception("Gemini API error: $body"))
                    }
                }
                .bodyToMono(GeminiResponse::class.java)
                .block()
                ?: return emptyList()

            val text = response.extractText()
            println("=== Gemini API Response ===")
            println(text)
            return parseJsonFromText(text)
        } catch (e: Exception) {
            println("=== Exception ===")
            println("${e.message}")
            e.printStackTrace()
            throw e
        }
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

    fun generateVariantQuiz(
        question: String,
        studyContent: String,
        difficulty: Int
    ): GeneratedQuiz {
        val prompt = buildVariantPrompt(question, studyContent, difficulty)
        val request = GeminiRequest.create(prompt)

        try {
            val response = geminiWebClient.post()
                .uri("/gemini-2.5-flash-lite:generateContent")
                .bodyValue(request)
                .retrieve()
                .onStatus({ it.is4xxClientError || it.is5xxServerError }) { clientResponse ->
                    clientResponse.bodyToMono(String::class.java).flatMap { body ->
                        println("=== Gemini Variant Generation Error ===")
                        println("Body: $body")
                        Mono.error(Exception("Gemini API error: $body"))
                    }
                }
                .bodyToMono(GeminiResponse::class.java)
                .block()
                ?: throw Exception("Empty response from Gemini API")

            val text = response.extractText()
            println("=== Gemini Variant Generation Response ===")
            println(text)
            return parseSingleQuizFromText(text)
        } catch (e: Exception) {
            println("=== Variant Generation Exception ===")
            println("${e.message}")
            e.printStackTrace()
            throw e
        }
    }

    private fun buildVariantPrompt(question: String, studyContent: String, difficulty: Int): String {
        return """
            |아래 원본 문제를 참고하여 같은 학습 내용에 대해 난이도 $difficulty/10 수준의 새로운 문제를 1개 생성해주세요.
            |(1=매우 쉬움/기본 정의만, 5=표준, 10=심화/응용/분석 필요)
            |
            |원본 문제: $question
            |
            |학습 내용:
            |$studyContent
            |
            |JSON 형식으로만 반환 (마크다운 없이):
            |{"question": "...", "answer": "..."}
        """.trimMargin()
    }

    private fun parseSingleQuizFromText(text: String): GeneratedQuiz {
        try {
            val cleanedText = text
                .replace(Regex("```json\\s*"), "")
                .replace(Regex("```\\s*"), "")
                .trim()

            return objectMapper.readValue(cleanedText, GeneratedQuiz::class.java)
        } catch (e: Exception) {
            throw IllegalArgumentException("Failed to parse variant quiz from Gemini response: $text", e)
        }
    }
}
