package com.study.app.domain.auth

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "단일 접근 코드 인증 API")
class AuthController(
    private val authService: AuthService
) {
    @PostMapping("/login")
    @Operation(summary = "접근 코드 로그인")
    fun login(
        @RequestBody request: LoginRequest,
        httpRequest: HttpServletRequest
    ): ResponseEntity<Void> {
        authService.login(request.accessCode, httpRequest.getSession(true))
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/session")
    @Operation(summary = "현재 세션 인증 상태 확인")
    fun getSessionStatus(httpRequest: HttpServletRequest): ResponseEntity<Void> {
        authService.ensureAuthenticated(httpRequest.getSession(false))
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/logout")
    @Operation(summary = "로그아웃")
    fun logout(httpRequest: HttpServletRequest): ResponseEntity<Void> {
        authService.logout(httpRequest.getSession(false))
        return ResponseEntity.noContent().build()
    }
}

data class LoginRequest(
    val accessCode: String = ""
)
