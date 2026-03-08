package com.study.app.domain.quiz

import com.study.app.domain.quiz.dto.QuizConfigRequest
import com.study.app.domain.quiz.dto.QuizConfigResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/study-logs/{studyLogId}/quiz-configs")
class QuizConfigController(
    private val quizConfigService: QuizConfigService
) {
    @GetMapping
    fun getQuizConfigs(@PathVariable studyLogId: Long): ResponseEntity<List<QuizConfigResponse>> {
        return ResponseEntity.ok(quizConfigService.findByStudyLogId(studyLogId))
    }

    @PostMapping
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
class QuizConfigDeleteController(
    private val quizConfigService: QuizConfigService
) {
    @DeleteMapping("/{id}")
    fun deleteQuizConfig(@PathVariable id: Long): ResponseEntity<Void> {
        quizConfigService.delete(id)
        return ResponseEntity.noContent().build()
    }
}
