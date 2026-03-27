package com.study.app.domain.quiz

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import java.time.LocalDateTime

interface QuizAttemptRepository : JpaRepository<QuizAttempt, Long> {
    @Query("SELECT COUNT(qa) FROM QuizAttempt qa WHERE qa.quiz.studyLog.id = :studyLogId")
    fun countByStudyLogId(studyLogId: Long): Int

    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.quiz.id = :quizId ORDER BY qa.attemptedAt DESC LIMIT 1")
    fun findLatestAttemptByQuizId(quizId: Long): QuizAttempt?

    @Query("""
        SELECT qa FROM QuizAttempt qa
        WHERE qa.quiz.studyLog.id = :studyLogId
        ORDER BY qa.attemptedAt DESC
    """)
    fun findByStudyLogId(studyLogId: Long): List<QuizAttempt>

    @Query("""
        SELECT qa FROM QuizAttempt qa
        WHERE qa.quiz.studyLog.id = :studyLogId
        ORDER BY qa.attemptedAt DESC
        LIMIT :limit
    """)
    fun findRecentByStudyLogId(studyLogId: Long, limit: Int): List<QuizAttempt>

    @Query("""
        SELECT qa FROM QuizAttempt qa
        WHERE qa.quiz.id = :quizId
        ORDER BY qa.attemptedAt DESC
        LIMIT 1
    """)
    fun findLatestByQuizId(quizId: Long): QuizAttempt?

    @Query("""
        SELECT qa FROM QuizAttempt qa
        WHERE qa.quiz.studyLog.id = :studyLogId
        ORDER BY qa.attemptedAt DESC
    """)
    fun findCurrentByStudyLogId(studyLogId: Long): List<QuizAttempt>

    @Modifying
    @Query("DELETE FROM QuizAttempt qa WHERE qa.quiz.id = :quizId")
    fun deleteByQuizId(quizId: Long): Int

    @Modifying
    @Query("""
        DELETE FROM quiz_attempt
        WHERE quiz_id IN (
            SELECT q.id FROM quiz q WHERE q.study_log_id = :studyLogId
        )
    """, nativeQuery = true)
    fun deleteByStudyLogId(studyLogId: Long): Int
}
