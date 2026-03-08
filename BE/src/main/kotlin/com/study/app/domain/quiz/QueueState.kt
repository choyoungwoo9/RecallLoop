package com.study.app.domain.quiz

import jakarta.persistence.*
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDateTime

@Entity
@Table(name = "queue_state")
data class QueueState(
    @Id
    val id: Long = 1,
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_quiz_id")
    val currentQuiz: Quiz? = null,
    val totalCount: Int = 0,
    val completedCount: Int = 0,
    @UpdateTimestamp
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
