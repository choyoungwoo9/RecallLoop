package com.study.app.domain.dashboard

import com.study.app.domain.quiz.dto.CurrentQuizResponse
import java.time.LocalDateTime

data class DashboardOverviewResponse(
    val totalLoops: Int,
    val totalStudySeconds: Int,
    val todaySolvedCount: Int,
    val todayStudySeconds: Int,
    val totalAttempts: Int,
    val uniqueSolvedQuizCount: Int,
    val studyLogCount: Int,
    val activeQuizCount: Int,
    val avgSecondsPerAttempt: Int,
    val currentStreakDays: Int
)

data class DashboardCurrentCycleResponse(
    val completedCount: Int,
    val totalCount: Int,
    val progressPercent: Int,
    val cycleStartedAt: LocalDateTime?,
    val currentQuizId: Long?
)

data class DashboardActivityDayResponse(
    val date: String,
    val solvedCount: Int,
    val studySeconds: Int
)

data class DashboardEvaluationBreakdownResponse(
    val tooHard: Int,
    val ok: Int,
    val tooEasy: Int
)

data class DashboardQualityBreakdownResponse(
    val dislikedCount: Int,
    val normalCount: Int
)

data class DashboardTopStudyLogResponse(
    val studyLogId: Long,
    val title: String,
    val attemptCount: Int,
    val studySeconds: Int
)

data class DashboardDifficultyBreakdownResponse(
    val easy: Int,
    val medium: Int,
    val hard: Int
)

data class DashboardResponse(
    val overview: DashboardOverviewResponse,
    val currentCycle: DashboardCurrentCycleResponse,
    val activity7d: List<DashboardActivityDayResponse>,
    val evaluationBreakdown: DashboardEvaluationBreakdownResponse,
    val qualityBreakdown: DashboardQualityBreakdownResponse,
    val topStudyLogs: List<DashboardTopStudyLogResponse>,
    val difficultyBreakdown: DashboardDifficultyBreakdownResponse,
    val nextQuiz: CurrentQuizResponse?
)
