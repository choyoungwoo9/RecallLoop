package com.study.app.domain.studylog

import com.study.app.domain.quiz.QuizRepository
import com.study.app.domain.studylog.dto.StudyLogRequest
import com.study.app.domain.studylog.dto.StudyLogResponse
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
@Transactional
class StudyLogService(
    private val studyLogRepository: StudyLogRepository,
    private val quizRepository: QuizRepository
) {
    fun create(request: StudyLogRequest): StudyLogResponse {
        val studyLog = StudyLog(
            title = request.title,
            content = request.content
        )
        return StudyLogResponse.from(studyLogRepository.save(studyLog))
    }

    @Transactional(readOnly = true)
    fun findAll(): List<StudyLogResponse> {
        return studyLogRepository.findAll().map { studyLog ->
            val quizCount = quizRepository.findByStudyLogId(studyLog.id!!).size
            StudyLogResponse.from(studyLog, quizCount)
        }
    }

    @Transactional(readOnly = true)
    fun findById(id: Long): StudyLogResponse {
        val studyLog = studyLogRepository.findByIdOrNull(id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "StudyLog not found: $id")
        val quizCount = quizRepository.findByStudyLogId(studyLog.id!!).size
        return StudyLogResponse.from(studyLog, quizCount)
    }

    fun delete(id: Long) {
        if (!studyLogRepository.existsById(id)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "StudyLog not found: $id")
        }
        studyLogRepository.deleteById(id)
    }
}
