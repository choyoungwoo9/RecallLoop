package com.study.app.config

import com.study.app.domain.auth.AuthService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor

@Component
class AuthInterceptor(
    private val authService: AuthService
) : HandlerInterceptor {
    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any
    ): Boolean {
        if (request.method.equals("OPTIONS", ignoreCase = true)) {
            return true
        }

        authService.ensureAuthenticated(request.getSession(false))
        return true
    }
}
