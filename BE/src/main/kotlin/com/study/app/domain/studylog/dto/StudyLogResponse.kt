package com.study.app.domain.studylog.dto

import com.study.app.domain.studylog.StudyLog
import java.time.LocalDateTime

data class StudyLogResponse(
    val id: Long,
    val title: String,
    val content: String,
    val createdAt: LocalDateTime,
    val quizCount: Int = 0
) {
    companion object {
        fun from(studyLog: StudyLog, quizCount: Int = 0) = StudyLogResponse(
            id = studyLog.id!!,
            title = studyLog.title,
            content = studyLog.content,
            createdAt = studyLog.createdAt,
            quizCount = quizCount
        )
    }
}
