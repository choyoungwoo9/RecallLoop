package com.study.app.domain.quiz

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.ColumnDefault
import java.time.LocalDateTime

@Entity
@Table(name = "quiz_attempt_history")
data class QuizAttemptHistory(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    val quiz: Quiz,
    val submittedAnswer: String,
    val elapsedSeconds: Int,
    @Enumerated(EnumType.STRING)
    @ColumnDefault("'OK'")
    val selfEvaluation: SelfEvaluation = SelfEvaluation.OK,
    val attemptedAt: LocalDateTime,
    @CreationTimestamp
    val migratedAt: LocalDateTime = LocalDateTime.now()
)
