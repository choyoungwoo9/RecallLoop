package com.study.app.domain.quiz

import com.study.app.domain.quiz.dto.QuizResponse
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/study-logs/{studyLogId}/quizzes")
@Tag(name = "Quizzes", description = "퀴즈 조회 및 생성 API")
class QuizListController(
    private val quizService: QuizService
) {
    @GetMapping
    @Operation(summary = "학습 로그별 퀴즈 목록 조회")
    fun getQuizzes(@PathVariable studyLogId: Long): ResponseEntity<List<QuizResponse>> {
        return ResponseEntity.ok(quizService.findByStudyLogId(studyLogId))
    }
}

@RestController
@RequestMapping("/api/quiz-configs/{configId}/generate")
@Tag(name = "Quizzes", description = "퀴즈 조회 및 생성 API")
class QuizGenerateController(
    private val quizService: QuizService
) {
    @PostMapping
    @Operation(summary = "설정 기준으로 퀴즈 생성")
    fun generateQuizzes(@PathVariable configId: Long): ResponseEntity<List<QuizResponse>> {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(quizService.generateQuizzes(configId))
    }
}

@RestController
@RequestMapping("/api/quizzes")
@Tag(name = "Quizzes", description = "퀴즈 조회 및 생성 API")
class QuizDeleteController(
    private val quizService: QuizService
) {
    @DeleteMapping("/{id}")
    @Operation(summary = "퀴즈 삭제")
    fun deleteQuiz(@PathVariable id: Long): ResponseEntity<Void> {
        quizService.delete(id)
        return ResponseEntity.noContent().build()
    }
}

@RestController
@RequestMapping("/api/study-logs/{studyLogId}/completion-summary")
@Tag(name = "Completion Summary", description = "학습 완료 요약 API")
class CompletionSummaryController(
    private val quizService: QuizService
) {
    @GetMapping
    @Operation(summary = "학습 로그 완료 요약 조회")
    fun getCompletionSummary(@PathVariable studyLogId: Long): ResponseEntity<com.study.app.domain.quiz.dto.CompletionSummaryResponse> {
        return ResponseEntity.ok(quizService.getCompletionSummary(studyLogId))
    }
}
