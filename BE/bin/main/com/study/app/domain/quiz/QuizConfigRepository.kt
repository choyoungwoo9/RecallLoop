package com.study.app.domain.quiz

import org.springframework.data.jpa.repository.JpaRepository

interface QuizConfigRepository : JpaRepository<QuizConfig, Long> {
    fun findByStudyLogId(studyLogId: Long): List<QuizConfig>
}
