package com.study.app.domain.quiz

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import jakarta.transaction.Transactional

interface QueueStateRepository : JpaRepository<QueueState, Long> {

    /**
     * DB 레벨에서 원자적으로 QueueState 업데이트
     * - completedCount 증가
     * - currentQuizId를 다음 문제로 변경
     * - updatedAt 자동 갱신
     */
    @Modifying(clearAutomatically = true)
    @Transactional
    @Query(
        """
        UPDATE queue_state
        SET completed_count = completed_count + 1,
            current_quiz_id = :nextQuizId,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
        """,
        nativeQuery = true
    )
    fun incrementCompletedAndSetNextQuiz(nextQuizId: Long?): Int

    /**
     * 한 바퀴 완료 후 원자적으로 completedCount 리셋
     */
    @Modifying(clearAutomatically = true)
    @Transactional
    @Query(
        """
        UPDATE queue_state
        SET completed_count = 0,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
        """,
        nativeQuery = true
    )
    fun resetCompletedCount(): Int
}
