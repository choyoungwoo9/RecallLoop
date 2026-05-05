package com.study.app.domain.auth

import com.study.app.config.AuthProperties
import jakarta.annotation.PostConstruct
import jakarta.servlet.http.HttpSession
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

@Service
class AuthService(
    private val authProperties: AuthProperties
) {
    @PostConstruct
    fun validateConfiguration() {
        require(authProperties.accessCode.isNotBlank()) {
            "APP_ACCESS_CODE must be configured before starting the application."
        }
    }

    fun login(accessCode: String, session: HttpSession) {
        if (accessCode != authProperties.accessCode) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid access code")
        }

        session.setAttribute(AUTHENTICATED_SESSION_KEY, true)
    }

    fun ensureAuthenticated(session: HttpSession?) {
        if (!isAuthenticated(session)) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required")
        }
    }

    fun logout(session: HttpSession?) {
        session?.invalidate()
    }

    fun isAuthenticated(session: HttpSession?): Boolean =
        session?.getAttribute(AUTHENTICATED_SESSION_KEY) == true

    companion object {
        const val AUTHENTICATED_SESSION_KEY = "authenticated"
    }
}
