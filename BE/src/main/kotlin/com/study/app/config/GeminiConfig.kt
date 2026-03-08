package com.study.app.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.reactive.function.client.WebClient

@ConfigurationProperties(prefix = "gemini")
data class GeminiProperties(
    val apiKey: String = "",
    val apiUrl: String = ""
)

@Configuration
class GeminiConfig {
    @Bean
    fun geminiWebClient(properties: GeminiProperties): WebClient {
        return WebClient.builder()
            .baseUrl(properties.apiUrl)
            .build()
    }
}
