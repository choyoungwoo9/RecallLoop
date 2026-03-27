package com.study.app.domain.quiz

import com.study.app.domain.quiz.dto.QueueStatusResponse
import com.study.app.domain.quiz.dto.QueueSubmitResponse
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/queue")
@CrossOrigin(origins = ["http://localhost:5173"])
@Tag(name = "Queue", description = "퀴즈 풀이 큐 상태 및 제출 API")
class QueueController(
    private val queueService: QueueService
) {
    @GetMapping("/status")
    @Operation(summary = "큐 진행 상태 조회")
    fun getQueueStatus(): ResponseEntity<QueueStatusResponse> {
        return ResponseEntity.ok(queueService.getQueueStatus())
    }

    @GetMapping("/current")
    @Operation(summary = "현재 퀴즈 조회")
    fun getCurrentQuiz(): ResponseEntity<Any> {
        val currentQuiz = queueService.getCurrentQuiz()
        return if (currentQuiz != null) {
            ResponseEntity.ok(currentQuiz)
        } else {
            ResponseEntity.ok(mapOf("quiz" to null))
        }
    }

    @PostMapping("/submit")
    @Operation(summary = "퀴즈 답안 제출")
    fun submitAnswer(@RequestBody request: SubmitAnswerRequest): ResponseEntity<QueueSubmitResponse> {
        return ResponseEntity.ok(
            queueService.submitAnswer(
                quizId = request.quizId,
                submittedAnswer = request.submittedAnswer,
                elapsedSeconds = request.elapsedSeconds
            )
        )
    }

    @PostMapping("/initialize")
    @Operation(summary = "큐 초기화")
    fun initializeQueue(): ResponseEntity<QueueStatusResponse> {
        return ResponseEntity.ok(queueService.initializeQueue())
    }

    @PatchMapping("/attempts/{id}/evaluate")
    @Operation(summary = "문제 풀이 자가 평가 등록")
    fun evaluateAttempt(
        @PathVariable id: Long,
        @RequestBody request: EvaluateAttemptRequest
    ): ResponseEntity<Any> {
        return ResponseEntity.ok(queueService.evaluateAttempt(id, request.selfEvaluation))
    }
}

data class SubmitAnswerRequest(
    val quizId: Long,
    val submittedAnswer: String,
    val elapsedSeconds: Int
)

data class EvaluateAttemptRequest(
    val selfEvaluation: SelfEvaluation
)
