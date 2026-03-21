package com.study.app.domain.quiz

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
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
    val attemptedAt: LocalDateTime,
    @CreationTimestamp
    val migratedAt: LocalDateTime = LocalDateTime.now()
)
