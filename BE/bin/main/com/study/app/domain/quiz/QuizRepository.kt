package com.study.app.domain.quiz

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface QuizRepository : JpaRepository<Quiz, Long> {
    fun findByStudyLogIdOrderByQueueOrder(studyLogId: Long): List<Quiz>
    fun findByStudyLogId(studyLogId: Long): List<Quiz>
    fun findByQuizConfigIdOrderByQueueOrder(quizConfigId: Long): List<Quiz>
    fun findByStudyLogIdOrderByQueueOrderDesc(studyLogId: Long): List<Quiz>
    @Query("SELECT MAX(q.queueOrder) FROM Quiz q WHERE q.studyLog.id = :studyLogId")
    fun findMaxQueueOrderByStudyLogId(studyLogId: Long): Int?
    @Query("SELECT q FROM Quiz q ORDER BY q.queueOrder ASC")
    fun findAllOrderByQueueOrder(): List<Quiz>
    @Query("SELECT q FROM Quiz q WHERE q.queueOrder = :queueOrder ORDER BY q.queueOrder ASC")
    fun findByQueueOrder(queueOrder: Int): List<Quiz>
    @Query("SELECT q FROM Quiz q WHERE q.queueOrder > :queueOrder ORDER BY q.queueOrder ASC LIMIT 1")
    fun findNextByQueueOrder(queueOrder: Int): Quiz?
}
