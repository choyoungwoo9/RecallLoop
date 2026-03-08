package com.study.app.domain.quiz

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface QuizRepository : JpaRepository<Quiz, Long> {
    fun findByStudyLogIdOrderByQueueOrder(studyLogId: Long): List<Quiz>
    fun findByQuizConfigIdOrderByQueueOrder(quizConfigId: Long): List<Quiz>
    fun findByStudyLogIdOrderByQueueOrderDesc(studyLogId: Long): List<Quiz>
    @Query("SELECT MAX(q.queueOrder) FROM Quiz q WHERE q.studyLog.id = :studyLogId")
    fun findMaxQueueOrderByStudyLogId(studyLogId: Long): Int?
}
