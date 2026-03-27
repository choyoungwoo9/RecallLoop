package com.study.app.domain.dashboard

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "학습 통계 대시보드 API")
class DashboardController(
    private val dashboardService: DashboardService
) {
    @GetMapping
    @Operation(summary = "학습 통계 대시보드 조회")
    fun getDashboard(): DashboardResponse = dashboardService.getDashboard()
}
