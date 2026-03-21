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
     * 한 바퀴 완료 후 원자적으로 completedCount 리셋 및 사이클 시작 시간 갱신
     */
    @Modifying(clearAutomatically = true)
    @Transactional
    @Query(
        """
        UPDATE queue_state
        SET completed_count = 0,
            cycle_started_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
        """,
        nativeQuery = true
    )
    fun resetCompletedCount(): Int

    /**
     * 한 바퀴 완료 후 한 번의 원자적 UPDATE로 처리
     * - completedCount = 1 (0에서 바로 +1)
     * - cycle_started_at = 현재 시간 (사이클 재시작)
     * - currentQuizId = 다음 문제
     * - cycleJustCompleted = true (다음 submit에서 이관하기 위한 플래그)
     * - updatedAt = 현재 시간
     */
    @Modifying(clearAutomatically = true)
    @Transactional
    @Query(
        """
        UPDATE queue_state
        SET completed_count = 1,
            cycle_started_at = CURRENT_TIMESTAMP,
            current_quiz_id = :nextQuizId,
            cycle_just_completed = true,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
        """,
        nativeQuery = true
    )
    fun resetAndSetNextQuiz(nextQuizId: Long?): Int

    /**
     * 이관 완료 후 플래그 리셋
     */
    @Modifying(clearAutomatically = true)
    @Transactional
    @Query(
        """
        UPDATE queue_state
        SET cycle_just_completed = false
        WHERE id = 1
        """,
        nativeQuery = true
    )
    fun clearCycleJustCompletedFlag(): Int
}
