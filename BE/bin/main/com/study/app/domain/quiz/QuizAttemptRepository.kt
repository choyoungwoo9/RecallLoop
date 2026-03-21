package com.study.app.domain.quiz

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
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
        WHERE qa.quiz.id = :quizId AND qa.attemptedAt > :since
        ORDER BY qa.attemptedAt DESC
        LIMIT 1
    """)
    fun findAttemptByQuizIdAfter(
        @Param("quizId") quizId: Long,
        @Param("since") since: LocalDateTime
    ): QuizAttempt?
}
