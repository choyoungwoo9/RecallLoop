package com.study.app.domain.attempt

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/attempts")
class AttemptHistoryController(
    private val attemptHistoryService: AttemptHistoryService
) {
    @GetMapping
    fun getAttemptHistory(
        @RequestParam(required = false) studyLogId: Long?
    ): List<AttemptHistoryItem> {
        return attemptHistoryService.getAll(studyLogId)
    }
}
