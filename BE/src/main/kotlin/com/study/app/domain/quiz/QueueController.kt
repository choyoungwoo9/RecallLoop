package com.study.app.domain.quiz

import com.study.app.domain.quiz.dto.QueueStatusResponse
import com.study.app.domain.quiz.dto.QueueSubmitResponse
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/queue")
@CrossOrigin(origins = ["http://localhost:5173"])
class QueueController(
    private val queueService: QueueService
) {
    @GetMapping("/status")
    fun getQueueStatus(): ResponseEntity<QueueStatusResponse> {
        return ResponseEntity.ok(queueService.getQueueStatus())
    }

    @GetMapping("/current")
    fun getCurrentQuiz(): ResponseEntity<Any> {
        val currentQuiz = queueService.getCurrentQuiz()
        return if (currentQuiz != null) {
            ResponseEntity.ok(currentQuiz)
        } else {
            ResponseEntity.ok(mapOf("quiz" to null))
        }
    }

    @PostMapping("/submit")
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
    fun initializeQueue(): ResponseEntity<QueueStatusResponse> {
        return ResponseEntity.ok(queueService.initializeQueue())
    }
}

data class SubmitAnswerRequest(
    val quizId: Long,
    val submittedAnswer: String,
    val elapsedSeconds: Int
)
