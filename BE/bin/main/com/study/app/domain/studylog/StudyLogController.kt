package com.study.app.domain.studylog

import com.study.app.domain.studylog.dto.StudyLogRequest
import com.study.app.domain.studylog.dto.StudyLogResponse
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/study-logs")
@Tag(name = "Study Logs", description = "학습 로그 관리 API")
class StudyLogController(
    private val studyLogService: StudyLogService
) {
    @GetMapping
    @Operation(summary = "학습 로그 목록 조회")
    fun getAll(): List<StudyLogResponse> = studyLogService.findAll()

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "학습 로그 생성")
    fun create(@RequestBody request: StudyLogRequest): StudyLogResponse =
        studyLogService.create(request)

    @GetMapping("/{id}")
    @Operation(summary = "학습 로그 단건 조회")
    fun getById(@PathVariable id: Long): StudyLogResponse =
        studyLogService.findById(id)

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "학습 로그 삭제")
    fun delete(@PathVariable id: Long) = studyLogService.delete(id)
}
