package com.study.app.domain.quiz

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime

@Entity
@Table(name = "quiz_attempt")
data class QuizAttempt(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    val quiz: Quiz,
    val submittedAnswer: String,
    val elapsedSeconds: Int,
    @CreationTimestamp
    val attemptedAt: LocalDateTime = LocalDateTime.now()
)
