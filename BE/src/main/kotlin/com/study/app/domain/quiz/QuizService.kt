package com.study.app.domain.quiz

import com.study.app.domain.quiz.dto.QuizResponse
import com.study.app.domain.studylog.StudyLogRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
@Transactional
class QuizService(
    private val quizRepository: QuizRepository,
    private val quizConfigRepository: QuizConfigRepository,
    private val studyLogRepository: StudyLogRepository,
    private val queueStateRepository: QueueStateRepository,
    private val geminiClient: GeminiClient
) {
    fun generateQuizzes(configId: Long): List<QuizResponse> {
        val quizConfig = quizConfigRepository.findByIdOrNull(configId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "QuizConfig not found: $configId")

        val studyLog = quizConfig.studyLog

        // Generate quizzes from Gemini
        val generatedQuizzes = geminiClient.generateQuizzes(
            studyContent = studyLog.content,
            description = quizConfig.description,
            questionCount = quizConfig.questionCount
        )

        // Find max queueOrder for this studyLog
        val maxQueueOrder = quizRepository.findMaxQueueOrderByStudyLogId(studyLog.id!!) ?: 0

        // Save quizzes with queueOrder
        val savedQuizzes = generatedQuizzes.mapIndexed { index, generatedQuiz ->
            val quiz = Quiz(
                quizConfig = quizConfig,
                studyLog = studyLog,
                question = generatedQuiz.question,
                answer = generatedQuiz.answer,
                queueOrder = maxQueueOrder + index + 1
            )
            quizRepository.save(quiz)
        }

        // Update QueueState
        val studyLogId = studyLog.id!!
        updateQueueState(studyLogId, savedQuizzes)

        return savedQuizzes.map { QuizResponse.from(it) }
    }

    @Transactional(readOnly = true)
    fun findByStudyLogId(studyLogId: Long): List<QuizResponse> {
        return quizRepository.findByStudyLogIdOrderByQueueOrder(studyLogId)
            .map { QuizResponse.from(it) }
    }

    fun delete(id: Long) {
        val quiz = quizRepository.findByIdOrNull(id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found: $id")

        val studyLogId = quiz.studyLog.id!!
        val deletedQueueOrder = quiz.queueOrder

        // Delete the quiz
        quizRepository.deleteById(id)

        // Reorder remaining quizzes
        val remainingQuizzes = quizRepository.findByStudyLogIdOrderByQueueOrder(studyLogId)
        remainingQuizzes.forEach { remainingQuiz ->
            if (remainingQuiz.queueOrder > deletedQueueOrder) {
                val updated = remainingQuiz.copy(queueOrder = remainingQuiz.queueOrder - 1)
                quizRepository.save(updated)
            }
        }

        // Update QueueState
        val newTotalCount = remainingQuizzes.size - 1
        val queueState = queueStateRepository.findByIdOrNull(1L)
        if (queueState != null) {
            val updatedQueueState = queueState.copy(totalCount = newTotalCount)
            queueStateRepository.save(updatedQueueState)
        }
    }

    private fun updateQueueState(studyLogId: Long, newQuizzes: List<Quiz>) {
        var queueState = queueStateRepository.findByIdOrNull(1L)

        if (queueState == null) {
            queueState = QueueState(
                id = 1,
                currentQuiz = newQuizzes.firstOrNull(),
                totalCount = newQuizzes.size,
                completedCount = 0
            )
        } else {
            // Get total count of ALL quizzes in the system
            val allQuizzes = quizRepository.findAll()
            val totalCount = allQuizzes.size

            val currentQuiz = if (queueState.currentQuiz == null) newQuizzes.firstOrNull() else queueState.currentQuiz
            queueState = queueState.copy(
                currentQuiz = currentQuiz,
                totalCount = totalCount
            )
        }

        queueStateRepository.save(queueState)
    }
}
