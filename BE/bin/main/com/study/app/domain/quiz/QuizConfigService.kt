package com.study.app.domain.quiz

import com.study.app.domain.quiz.dto.QuizConfigRequest
import com.study.app.domain.quiz.dto.QuizConfigResponse
import com.study.app.domain.studylog.StudyLogRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
@Transactional
class QuizConfigService(
    private val quizConfigRepository: QuizConfigRepository,
    private val studyLogRepository: StudyLogRepository
) {
    fun create(studyLogId: Long, request: QuizConfigRequest): QuizConfigResponse {
        val studyLog = studyLogRepository.findByIdOrNull(studyLogId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "StudyLog not found: $studyLogId")

        val quizConfig = QuizConfig(
            studyLog = studyLog,
            description = request.description,
            questionCount = request.questionCount
        )
        return QuizConfigResponse.from(quizConfigRepository.save(quizConfig))
    }

    @Transactional(readOnly = true)
    fun findByStudyLogId(studyLogId: Long): List<QuizConfigResponse> {
        return quizConfigRepository.findByStudyLogId(studyLogId)
            .map { QuizConfigResponse.from(it) }
    }

    fun delete(id: Long) {
        if (!quizConfigRepository.existsById(id)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "QuizConfig not found: $id")
        }
        quizConfigRepository.deleteById(id)
    }

    @Transactional(readOnly = true)
    fun findById(id: Long): QuizConfig {
        return quizConfigRepository.findByIdOrNull(id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "QuizConfig not found: $id")
    }
}
