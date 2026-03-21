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
    var currentQuiz: Quiz? = null,
    var totalCount: Int = 0,
    var completedCount: Int = 0,
    var cycleStartedAt: LocalDateTime = LocalDateTime.now(),
    var cycleJustCompleted: Boolean = false,
    @UpdateTimestamp
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
