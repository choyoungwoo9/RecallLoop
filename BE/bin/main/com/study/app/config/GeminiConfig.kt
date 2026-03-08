package com.study.app.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.reactive.function.client.WebClient

@ConfigurationProperties(prefix = "gemini")
data class GeminiProperties(
    var apiKey: String = "",
    var apiUrl: String = ""
)

@Configuration
@EnableConfigurationProperties(GeminiProperties::class)
class GeminiConfig {
    @Bean
    fun geminiWebClient(properties: GeminiProperties): WebClient {
        println("=== GeminiConfig ===")
        println("API Key (first 20 chars): ${properties.apiKey.take(20)}")

        return WebClient.builder()
            .baseUrl("https://generativelanguage.googleapis.com/v1/models")
            .defaultHeader("X-goog-api-key", properties.apiKey)
            .defaultHeader("Content-Type", "application/json")
            .build()
    }
}
