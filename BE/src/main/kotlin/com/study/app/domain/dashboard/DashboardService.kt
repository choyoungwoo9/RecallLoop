package com.study.app.domain.dashboard

import com.study.app.domain.quiz.*
import com.study.app.domain.quiz.dto.CurrentQuizResponse
import com.study.app.domain.studylog.StudyLogRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId

@Service
@Transactional(readOnly = true)
class DashboardService(
    private val studyLogRepository: StudyLogRepository,
    private val quizRepository: QuizRepository,
    private val quizAttemptRepository: QuizAttemptRepository,
    private val quizAttemptHistoryRepository: QuizAttemptHistoryRepository,
    private val queueStateRepository: QueueStateRepository
) {
    private val zoneId: ZoneId = ZoneId.of("Asia/Seoul")

    fun getDashboard(): DashboardResponse {
        val activeQuizzes = quizRepository.findAllByIsActiveInQueueTrueOrderByQueueOrder()
        val currentAttempts = quizAttemptRepository.findAll().mapNotNull { attempt ->
            runCatching { AttemptSnapshot.fromCurrent(attempt) }.getOrNull()
        }
        val historyAttempts = quizAttemptHistoryRepository.findAll().mapNotNull { history ->
            runCatching { AttemptSnapshot.fromHistory(history) }.getOrNull()
        }
        val attempts = (currentAttempts + historyAttempts).sortedByDescending { it.attemptedAt }
        val today = LocalDate.now(zoneId)
        val todayAttempts = attempts.filter { it.attemptedAt.toLocalDate() == today }

        val totalAttempts = attempts.size
        val totalStudySeconds = attempts.sumOf { it.elapsedSeconds }
        val dislikedCount = attempts.count { it.problemFeedback == ProblemFeedback.DISLIKED }
        val queueState = queueStateRepository.findById(1L).orElse(null)

        val nextQuiz = queueState?.currentQuiz?.let { quiz ->
            CurrentQuizResponse(
                id = quiz.id!!,
                question = quiz.question,
                studyLogId = quiz.studyLog?.id,
                studyLogTitle = quiz.studyLog?.title ?: "(삭제된 기록)",
                queueOrder = quiz.queueOrder,
                difficulty = quiz.difficulty
            )
        }

        return DashboardResponse(
            overview = DashboardOverviewResponse(
                totalLoops = quizAttemptHistoryRepository.countDistinctCycles().toInt(),
                totalStudySeconds = totalStudySeconds,
                todaySolvedCount = todayAttempts.size,
                todayStudySeconds = todayAttempts.sumOf { it.elapsedSeconds },
                totalAttempts = totalAttempts,
                uniqueSolvedQuizCount = attempts.map { it.quizId }.toSet().size,
                studyLogCount = studyLogRepository.count().toInt(),
                activeQuizCount = activeQuizzes.size,
                avgSecondsPerAttempt = if (totalAttempts > 0) {
                    kotlin.math.round(totalStudySeconds.toDouble() / totalAttempts).toInt()
                } else {
                    0
                },
                currentStreakDays = calculateCurrentStreakDays(attempts, today)
            ),
            currentCycle = DashboardCurrentCycleResponse(
                completedCount = queueState?.completedCount ?: 0,
                totalCount = queueState?.totalCount ?: 0,
                progressPercent = if ((queueState?.totalCount ?: 0) > 0) {
                    ((queueState?.completedCount ?: 0) * 100) / (queueState?.totalCount ?: 1)
                } else {
                    0
                },
                cycleStartedAt = queueState?.cycleStartedAt,
                currentQuizId = queueState?.currentQuiz?.id
            ),
            activity7d = buildActivity7d(attempts, today),
            evaluationBreakdown = DashboardEvaluationBreakdownResponse(
                tooHard = attempts.count { it.selfEvaluation == SelfEvaluation.TOO_HARD },
                ok = attempts.count { it.selfEvaluation == SelfEvaluation.OK },
                tooEasy = attempts.count { it.selfEvaluation == SelfEvaluation.TOO_EASY }
            ),
            qualityBreakdown = DashboardQualityBreakdownResponse(
                dislikedCount = dislikedCount,
                normalCount = attempts.size - dislikedCount
            ),
            topStudyLogs = buildTopStudyLogs(attempts),
            difficultyBreakdown = DashboardDifficultyBreakdownResponse(
                easy = activeQuizzes.count { it.difficulty in 1..3 },
                medium = activeQuizzes.count { it.difficulty in 4..7 },
                hard = activeQuizzes.count { it.difficulty in 8..10 }
            ),
            nextQuiz = nextQuiz
        )
    }

    private fun calculateCurrentStreakDays(
        attempts: List<AttemptSnapshot>,
        today: LocalDate
    ): Int {
        val solvedDates = attempts.map { it.attemptedAt.toLocalDate() }.toSet()
        var streak = 0
        var cursor = today

        while (solvedDates.contains(cursor)) {
            streak += 1
            cursor = cursor.minusDays(1)
        }

        return streak
    }

    private fun buildActivity7d(
        attempts: List<AttemptSnapshot>,
        today: LocalDate
    ): List<DashboardActivityDayResponse> {
        val attemptsByDate = attempts.groupBy { it.attemptedAt.toLocalDate() }

        return (6 downTo 0).map { offset ->
            val date = today.minusDays(offset.toLong())
            val items = attemptsByDate[date].orEmpty()
            DashboardActivityDayResponse(
                date = date.toString(),
                solvedCount = items.size,
                studySeconds = items.sumOf { it.elapsedSeconds }
            )
        }
    }

    private fun buildTopStudyLogs(attempts: List<AttemptSnapshot>): List<DashboardTopStudyLogResponse> {
        return attempts
            .groupBy { it.studyLogId }
            .map { (studyLogId, items) ->
                DashboardTopStudyLogResponse(
                    studyLogId = studyLogId,
                    title = items.first().studyLogTitle,
                    attemptCount = items.size,
                    studySeconds = items.sumOf { it.elapsedSeconds }
                )
            }
            .sortedWith(
                compareByDescending<DashboardTopStudyLogResponse> { it.attemptCount }
                    .thenByDescending { it.studySeconds }
                    .thenBy { it.title }
            )
            .take(5)
    }

    private data class AttemptSnapshot(
        val quizId: Long,
        val studyLogId: Long,
        val studyLogTitle: String,
        val attemptedAt: LocalDateTime,
        val elapsedSeconds: Int,
        val selfEvaluation: SelfEvaluation,
        val problemFeedback: ProblemFeedback
    ) {
        companion object {
            fun fromCurrent(attempt: QuizAttempt) = AttemptSnapshot(
                quizId = attempt.quiz.id!!,
                studyLogId = attempt.quiz.studyLog?.id ?: 0L,
                studyLogTitle = attempt.quiz.studyLog?.title ?: "(삭제된 기록)",
                attemptedAt = attempt.attemptedAt,
                elapsedSeconds = attempt.elapsedSeconds,
                selfEvaluation = attempt.selfEvaluation,
                problemFeedback = attempt.problemFeedback
            )

            fun fromHistory(history: QuizAttemptHistory) = AttemptSnapshot(
                quizId = history.quiz.id!!,
                studyLogId = history.quiz.studyLog?.id ?: 0L,
                studyLogTitle = history.quiz.studyLog?.title ?: "(삭제된 기록)",
                attemptedAt = history.attemptedAt,
                elapsedSeconds = history.elapsedSeconds,
                selfEvaluation = history.selfEvaluation,
                problemFeedback = history.problemFeedback
            )
        }
    }
}
