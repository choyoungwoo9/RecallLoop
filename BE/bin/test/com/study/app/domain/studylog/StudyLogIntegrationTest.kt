package com.study.app.domain.studylog

import com.fasterxml.jackson.databind.ObjectMapper
import com.study.app.domain.studylog.dto.StudyLogRequest
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class StudyLogIntegrationTest {

    @Autowired
    lateinit var mockMvc: MockMvc

    @Autowired
    lateinit var objectMapper: ObjectMapper

    @Test
    fun `생성 - 목록 조회 - 단건 조회 - 삭제 전체 흐름`() {
        // 생성
        val request = StudyLogRequest(title = "테스트 제목", content = "테스트 내용")
        val createResult = mockMvc.perform(
            post("/api/study-logs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.title").value("테스트 제목"))
            .andExpect(jsonPath("$.content").value("테스트 내용"))
            .andReturn()

        val responseJson = objectMapper.readTree(createResult.response.contentAsString)
        val id = responseJson["id"].asLong()

        // 목록 조회
        mockMvc.perform(get("/api/study-logs"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].id").value(id))

        // 단건 조회
        mockMvc.perform(get("/api/study-logs/$id"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(id))
            .andExpect(jsonPath("$.title").value("테스트 제목"))

        // 삭제
        mockMvc.perform(delete("/api/study-logs/$id"))
            .andExpect(status().isNoContent)
    }

    @Test
    fun `없는 ID 조회시 404 응답`() {
        mockMvc.perform(get("/api/study-logs/99999"))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `삭제 후 재조회시 404 응답`() {
        // 생성
        val request = StudyLogRequest(title = "삭제 테스트", content = "내용")
        val createResult = mockMvc.perform(
            post("/api/study-logs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isCreated)
            .andReturn()

        val responseJson = objectMapper.readTree(createResult.response.contentAsString)
        val id = responseJson["id"].asLong()

        // 삭제
        mockMvc.perform(delete("/api/study-logs/$id"))
            .andExpect(status().isNoContent)

        // 재조회 → 404
        mockMvc.perform(get("/api/study-logs/$id"))
            .andExpect(status().isNotFound)
    }
}
