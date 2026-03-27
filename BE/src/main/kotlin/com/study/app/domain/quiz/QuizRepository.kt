package com.study.app.domain.quiz

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query

interface QuizRepository : JpaRepository<Quiz, Long> {
    fun findByStudyLogIdOrderByQueueOrder(studyLogId: Long): List<Quiz>
    fun findByStudyLogId(studyLogId: Long): List<Quiz>
    fun findByQuizConfigIdOrderByQueueOrder(quizConfigId: Long): List<Quiz>
    fun findByStudyLogIdAndIsActiveInQueueTrueOrderByQueueOrder(studyLogId: Long): List<Quiz>
    fun findByStudyLogIdAndIsActiveInQueueTrue(studyLogId: Long): List<Quiz>
    fun findByQuizConfigIdAndIsActiveInQueueTrueOrderByQueueOrder(quizConfigId: Long): List<Quiz>
    fun findAllByIsActiveInQueueTrueOrderByQueueOrder(): List<Quiz>
    fun countByStudyLogIdAndIsActiveInQueueTrue(studyLogId: Long): Int
    fun findByStudyLogIdOrderByQueueOrderDesc(studyLogId: Long): List<Quiz>
    @Query("SELECT MAX(q.queueOrder) FROM Quiz q WHERE q.studyLog.id = :studyLogId")
    fun findMaxQueueOrderByStudyLogId(studyLogId: Long): Int?
    @Query("SELECT q FROM Quiz q ORDER BY q.queueOrder ASC")
    fun findAllOrderByQueueOrder(): List<Quiz>
    @Query("SELECT q FROM Quiz q WHERE q.queueOrder = :queueOrder ORDER BY q.queueOrder ASC")
    fun findByQueueOrder(queueOrder: Int): List<Quiz>
    @Query("SELECT q FROM Quiz q WHERE q.isActiveInQueue = true AND q.queueOrder = :queueOrder ORDER BY q.queueOrder ASC")
    fun findActiveByQueueOrder(queueOrder: Int): List<Quiz>
    @Query("SELECT q FROM Quiz q WHERE q.queueOrder > :queueOrder ORDER BY q.queueOrder ASC LIMIT 1")
    fun findNextByQueueOrder(queueOrder: Int): Quiz?
    @Query("""
        SELECT q FROM Quiz q
        WHERE (q.originalQuizId = :originalQuizId OR q.id = :originalQuizId)
        AND q.difficulty = :difficulty
    """)
    fun findByOriginalQuizIdAndDifficulty(originalQuizId: Long, difficulty: Int): Quiz?

    @Modifying
    @Query("DELETE FROM Quiz q WHERE q.studyLog.id = :studyLogId")
    fun deleteByStudyLogId(studyLogId: Long): Int
}
