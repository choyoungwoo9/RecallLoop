package com.study.app.domain.attempt

import com.study.app.domain.quiz.QuizAttemptHistoryRepository
import com.study.app.domain.quiz.QuizAttemptRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class AttemptHistoryService(
    private val quizAttemptRepository: QuizAttemptRepository,
    private val quizAttemptHistoryRepository: QuizAttemptHistoryRepository
) {
    fun getAll(studyLogId: Long?): List<AttemptHistoryItem> {
        val currentItems = if (studyLogId != null) {
            quizAttemptRepository.findByStudyLogId(studyLogId)
        } else {
            quizAttemptRepository.findAll()
        }.map { AttemptHistoryItem.fromCurrent(it) }

        val historyItems = if (studyLogId != null) {
            quizAttemptHistoryRepository.findByStudyLogId(studyLogId)
        } else {
            quizAttemptHistoryRepository.findAll()
        }.map { AttemptHistoryItem.fromHistory(it) }

        return (currentItems + historyItems).sortedByDescending { it.attemptedAt }
    }
}
