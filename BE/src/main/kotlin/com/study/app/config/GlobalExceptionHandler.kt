package com.study.app.config

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

/**
 * 전역 예외 처리 핸들러
 * - IllegalArgumentException → HTTP 400 Bad Request
 * - 기타 예외 → HTTP 500 Internal Server Error
 */
@ControllerAdvice
class GlobalExceptionHandler {

    data class ErrorResponse(
        val timestamp: LocalDateTime,
        val status: Int,
        val error: String,
        val message: String,
        val path: String? = null
    )

    /**
     * IllegalArgumentException (주로 유효하지 않은 요청)
     */
    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgumentException(
        ex: IllegalArgumentException,
        request: jakarta.servlet.http.HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse(
            timestamp = LocalDateTime.now(),
            status = HttpStatus.BAD_REQUEST.value(),
            error = "Bad Request",
            message = ex.message ?: "Invalid argument",
            path = request.requestURI
        )
        return ResponseEntity(errorResponse, HttpStatus.BAD_REQUEST)
    }

    /**
     * ResponseStatusException (서비스 계층에서 명시적으로 내려준 상태 코드 유지)
     */
    @ExceptionHandler(ResponseStatusException::class)
    fun handleResponseStatusException(
        ex: ResponseStatusException,
        request: jakarta.servlet.http.HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        val statusCode = ex.statusCode.value()
        val errorResponse = ErrorResponse(
            timestamp = LocalDateTime.now(),
            status = statusCode,
            error = ex.statusCode.toString(),
            message = ex.reason ?: ex.message ?: "Request failed",
            path = request.requestURI
        )
        return ResponseEntity(errorResponse, ex.statusCode)
    }

    /**
     * 일반적인 예외 (예상 밖의 에러)
     */
    @ExceptionHandler(Exception::class)
    fun handleGeneralException(
        ex: Exception,
        request: jakarta.servlet.http.HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse(
            timestamp = LocalDateTime.now(),
            status = HttpStatus.INTERNAL_SERVER_ERROR.value(),
            error = "Internal Server Error",
            message = ex.message ?: "An unexpected error occurred",
            path = request.requestURI
        )
        return ResponseEntity(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR)
    }
}
