package com.study.app.config

import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Contact
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.servers.Server
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class OpenApiConfig {
    @Bean
    fun studyAppOpenAPI(): OpenAPI {
        return OpenAPI()
            .info(
                Info()
                    .title("Study Auto Manage API")
                    .version("v1")
                    .description("학습 로그, 퀴즈 생성, 큐 진행 상태를 관리하는 백엔드 API 문서")
                    .contact(Contact().name("study-auto-manage-app"))
            )
            .servers(
                listOf(
                    Server()
                        .url("http://localhost:8080")
                        .description("Local development server")
                )
            )
    }
}
