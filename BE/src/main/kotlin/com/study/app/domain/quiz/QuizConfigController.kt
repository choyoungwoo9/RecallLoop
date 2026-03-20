package com.study.app.domain.quiz

import com.study.app.domain.quiz.dto.QuizConfigRequest
import com.study.app.domain.quiz.dto.QuizConfigResponse
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/study-logs/{studyLogId}/quiz-configs")
@Tag(name = "Quiz Configs", description = "퀴즈 생성 설정 관리 API")
class QuizConfigController(
    private val quizConfigService: QuizConfigService
) {
    @GetMapping
    @Operation(summary = "학습 로그별 퀴즈 설정 목록 조회")
    fun getQuizConfigs(@PathVariable studyLogId: Long): ResponseEntity<List<QuizConfigResponse>> {
        return ResponseEntity.ok(quizConfigService.findByStudyLogId(studyLogId))
    }

    @PostMapping
    @Operation(summary = "퀴즈 생성 설정 생성")
    fun createQuizConfig(
        @PathVariable studyLogId: Long,
        @RequestBody request: QuizConfigRequest
    ): ResponseEntity<QuizConfigResponse> {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(quizConfigService.create(studyLogId, request))
    }
}

@RestController
@RequestMapping("/api/quiz-configs")
@Tag(name = "Quiz Configs", description = "퀴즈 생성 설정 관리 API")
class QuizConfigDeleteController(
    private val quizConfigService: QuizConfigService
) {
    @DeleteMapping("/{id}")
    @Operation(summary = "퀴즈 생성 설정 삭제")
    fun deleteQuizConfig(@PathVariable id: Long): ResponseEntity<Void> {
        quizConfigService.delete(id)
        return ResponseEntity.noContent().build()
    }
}
