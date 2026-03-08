package com.study.app.domain.quiz

import com.study.app.domain.quiz.dto.QuizConfigRequest
import com.study.app.domain.studylog.StudyLog
import com.study.app.domain.studylog.StudyLogRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.transaction.annotation.Transactional
import com.fasterxml.jackson.databind.ObjectMapper

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class QuizConfigIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var studyLogRepository: StudyLogRepository

    @Autowired
    private lateinit var quizConfigRepository: QuizConfigRepository

    @Autowired
    private lateinit var quizRepository: QuizRepository

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    private lateinit var studyLog: StudyLog
    private var studyLogId: Long = 0

    @BeforeEach
    fun setUp() {
        studyLog = StudyLog(title = "Test Study", content = "Test content")
        val saved = studyLogRepository.save(studyLog)
        studyLogId = saved.id!!
    }

    @Test
    fun testCreateMultipleQuizConfigs() {
        val config1 = QuizConfigRequest(description = "Config 1", questionCount = 5)
        val config2 = QuizConfigRequest(description = "Config 2", questionCount = 3)

        mockMvc.post("/api/study-logs/$studyLogId/quiz-configs") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(config1)
        }.andExpect { status { isCreated() } }

        mockMvc.post("/api/study-logs/$studyLogId/quiz-configs") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(config2)
        }.andExpect { status { isCreated() } }

        val configs = quizConfigRepository.findByStudyLogId(studyLogId)
        assert(configs.size == 2)
    }

    @Test
    fun testDeleteQuizConfigViaApi() {
        val config = QuizConfig(
            studyLog = studyLog,
            description = "Test Config",
            questionCount = 5
        )
        val savedConfig = quizConfigRepository.save(config)
        val configId = savedConfig.id!!

        assert(quizConfigRepository.existsById(configId))

        // Delete the config via controller
        mockMvc.delete("/api/quiz-configs/$configId")
            .andExpect { status { isNoContent() } }

        // Verify config is deleted
        assert(quizConfigRepository.existsById(configId) == false)
    }

    @Test
    fun testGetQuizConfigsByStudyLogId() {
        val config1 = QuizConfigRequest(description = "Config 1", questionCount = 5)
        val config2 = QuizConfigRequest(description = "Config 2", questionCount = 3)

        mockMvc.post("/api/study-logs/$studyLogId/quiz-configs") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(config1)
        }

        mockMvc.post("/api/study-logs/$studyLogId/quiz-configs") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(config2)
        }

        mockMvc.get("/api/study-logs/$studyLogId/quiz-configs")
            .andExpect { status { isOk() } }
    }
}
