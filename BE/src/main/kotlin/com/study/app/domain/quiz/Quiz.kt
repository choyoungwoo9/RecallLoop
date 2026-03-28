package com.study.app.domain.quiz

import com.study.app.domain.studylog.StudyLog
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.ColumnDefault
import java.time.LocalDateTime

@Entity
@Table(name = "quiz")
data class Quiz(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_config_id", nullable = true)
    val quizConfig: QuizConfig?,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_log_id", nullable = true)
    val studyLog: StudyLog?,
    val question: String,
    val answer: String,
    val queueOrder: Int,
    @ColumnDefault("5")
    val difficulty: Int = 5,  // 1~10, default 5 (표준)
    @Column(name = "original_quiz_id", nullable = true)
    val originalQuizId: Long? = null,  // null=원본, non-null=난이도 변형
    @ColumnDefault("true")
    val isActiveInQueue: Boolean = true,
    @CreationTimestamp
    val createdAt: LocalDateTime = LocalDateTime.now()
)
