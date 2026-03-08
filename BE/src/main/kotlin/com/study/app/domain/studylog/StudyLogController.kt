package com.study.app.domain.studylog

import com.study.app.domain.studylog.dto.StudyLogRequest
import com.study.app.domain.studylog.dto.StudyLogResponse
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/study-logs")
class StudyLogController(
    private val studyLogService: StudyLogService
) {
    @GetMapping
    fun getAll(): List<StudyLogResponse> = studyLogService.findAll()

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@RequestBody request: StudyLogRequest): StudyLogResponse =
        studyLogService.create(request)

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): StudyLogResponse =
        studyLogService.findById(id)

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: Long) = studyLogService.delete(id)
}
