package com.study.app.domain.quiz

import com.study.app.domain.quiz.dto.QuizResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/study-logs/{studyLogId}/quizzes")
class QuizListController(
    private val quizService: QuizService
) {
    @GetMapping
    fun getQuizzes(@PathVariable studyLogId: Long): ResponseEntity<List<QuizResponse>> {
        return ResponseEntity.ok(quizService.findByStudyLogId(studyLogId))
    }
}

@RestController
@RequestMapping("/api/quiz-configs/{configId}/generate")
class QuizGenerateController(
    private val quizService: QuizService
) {
    @PostMapping
    fun generateQuizzes(@PathVariable configId: Long): ResponseEntity<List<QuizResponse>> {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(quizService.generateQuizzes(configId))
    }
}

@RestController
@RequestMapping("/api/quizzes")
class QuizDeleteController(
    private val quizService: QuizService
) {
    @DeleteMapping("/{id}")
    fun deleteQuiz(@PathVariable id: Long): ResponseEntity<Void> {
        quizService.delete(id)
        return ResponseEntity.noContent().build()
    }
}

@RestController
@RequestMapping("/api/study-logs/{studyLogId}/completion-summary")
class CompletionSummaryController(
    private val quizService: QuizService
) {
    @GetMapping
    fun getCompletionSummary(@PathVariable studyLogId: Long): ResponseEntity<com.study.app.domain.quiz.dto.CompletionSummaryResponse> {
        return ResponseEntity.ok(quizService.getCompletionSummary(studyLogId))
    }
}
