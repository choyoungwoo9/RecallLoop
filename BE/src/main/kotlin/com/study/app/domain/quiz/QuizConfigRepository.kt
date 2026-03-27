package com.study.app.domain.quiz

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query

interface QuizConfigRepository : JpaRepository<QuizConfig, Long> {
    fun findByStudyLogId(studyLogId: Long): List<QuizConfig>

    @Modifying
    @Query("DELETE FROM QuizConfig qc WHERE qc.studyLog.id = :studyLogId")
    fun deleteByStudyLogId(studyLogId: Long): Int
}
