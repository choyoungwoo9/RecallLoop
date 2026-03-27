package com.study.app.domain.quiz

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.ColumnDefault
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
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @ColumnDefault("'OK'")
    var selfEvaluation: SelfEvaluation = SelfEvaluation.OK,
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @ColumnDefault("'NONE'")
    var problemFeedback: ProblemFeedback = ProblemFeedback.NONE,
    @CreationTimestamp
    val attemptedAt: LocalDateTime = LocalDateTime.now()
)
