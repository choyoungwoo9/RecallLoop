package com.study.app.domain.auth

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.mock.web.MockHttpSession
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@SpringBootTest(
    properties = [
        "APP_ACCESS_CODE=test-access-code",
        "spring.datasource.url=jdbc:h2:mem:auth-test;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "app.db.migration.enabled=false",
        "gemini.api-key=test-key",
        "gemini.api-url=https://example.test"
    ]
)
@AutoConfigureMockMvc
class AuthIntegrationTest(
    @Autowired private val mockMvc: MockMvc
) {
    @Test
    fun `unauthenticated requests to protected api return 401`() {
        mockMvc.perform(get("/api/dashboard"))
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `login grants access to protected api on same session`() {
        val session = login()

        mockMvc.perform(
            get("/api/dashboard")
                .session(session)
        ).andExpect(status().isOk)
    }

    @Test
    fun `logout invalidates session and blocks future requests`() {
        val session = login()

        mockMvc.perform(
            post("/api/auth/logout")
                .session(session)
        ).andExpect(status().isNoContent)

        mockMvc.perform(
            get("/api/dashboard")
                .session(session)
        ).andExpect(status().isUnauthorized)
    }

    private fun login(): MockHttpSession {
        val result = mockMvc.perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"accessCode":"test-access-code"}""")
        ).andExpect(status().isNoContent)
            .andReturn()

        return result.request.session as MockHttpSession
    }
}
