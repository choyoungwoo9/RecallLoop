package com.study.app.domain.quiz

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query

interface QuizAttemptHistoryRepository : JpaRepository<QuizAttemptHistory, Long> {

    @Query("""
        SELECT h FROM QuizAttemptHistory h
        WHERE h.quiz.studyLog.id = :studyLogId
        ORDER BY h.migratedAt DESC
    """)
    fun findByStudyLogId(studyLogId: Long): List<QuizAttemptHistory>

    @Query("""
        SELECT h FROM QuizAttemptHistory h
        WHERE h.quiz.id = :quizId
        ORDER BY h.migratedAt DESC
        LIMIT 1
    """)
    fun findLatestByQuizId(quizId: Long): QuizAttemptHistory?

    @Modifying
    @Query("""
        DELETE FROM quiz_attempt_history
        WHERE quiz_id IN (
            SELECT q.id FROM quiz q WHERE q.study_log_id = :studyLogId
        )
    """, nativeQuery = true)
    fun deleteByStudyLogId(studyLogId: Long): Int
}
