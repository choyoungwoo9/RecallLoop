package com.study.app.domain.quiz

import com.study.app.domain.studylog.StudyLog
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime

@Entity
@Table(name = "quiz_config")
data class QuizConfig(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_log_id", nullable = false)
    val studyLog: StudyLog,
    val description: String,
    val questionCount: Int,
    @OneToMany(mappedBy = "quizConfig", cascade = [CascadeType.ALL], orphanRemoval = true)
    val quizzes: List<Quiz> = emptyList(),
    @CreationTimestamp
    val createdAt: LocalDateTime = LocalDateTime.now()
)
