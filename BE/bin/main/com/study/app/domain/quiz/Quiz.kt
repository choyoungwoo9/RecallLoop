package com.study.app.domain.quiz

import com.study.app.domain.studylog.StudyLog
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime

@Entity
@Table(name = "quiz")
data class Quiz(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_config_id", nullable = false)
    val quizConfig: QuizConfig,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_log_id", nullable = false)
    val studyLog: StudyLog,
    val question: String,
    val answer: String,
    val queueOrder: Int,
    @CreationTimestamp
    val createdAt: LocalDateTime = LocalDateTime.now()
)
