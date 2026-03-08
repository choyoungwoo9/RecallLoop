package com.study.app.domain.quiz

import com.study.app.domain.quiz.dto.GeneratedQuiz
import com.study.app.domain.studylog.StudyLog
import com.study.app.domain.studylog.StudyLogRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.transaction.annotation.Transactional
import com.fasterxml.jackson.databind.ObjectMapper
import org.mockito.Mockito.`when`

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class QuizIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var studyLogRepository: StudyLogRepository

    @Autowired
    private lateinit var quizConfigRepository: QuizConfigRepository

    @Autowired
    private lateinit var quizRepository: QuizRepository

    @Autowired
    private lateinit var queueStateRepository: QueueStateRepository

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockBean
    private lateinit var geminiClient: GeminiClient

    private lateinit var studyLog: StudyLog
    private var studyLogId: Long = 0

    @BeforeEach
    fun setUp() {
        studyLog = StudyLog(title = "Test Study", content = "Test content for quiz generation")
        val saved = studyLogRepository.save(studyLog)
        studyLogId = saved.id!!
    }

    @Test
    fun testGenerateQuizzes() {
        val config = QuizConfig(
            studyLog = studyLog,
            description = "Generate test quizzes",
            questionCount = 3
        )
        val savedConfig = quizConfigRepository.save(config)
        val configId = savedConfig.id!!

        val mockQuizzes = listOf(
            GeneratedQuiz(question = "Q1", answer = "A1"),
            GeneratedQuiz(question = "Q2", answer = "A2"),
            GeneratedQuiz(question = "Q3", answer = "A3")
        )
        `when`(geminiClient.generateQuizzes(studyLog.content, config.description, 3))
            .thenReturn(mockQuizzes)

        mockMvc.post("/api/quiz-configs/$configId/generate")
            .andExpect { status { isCreated() } }

        val savedQuizzes = quizRepository.findByStudyLogIdOrderByQueueOrder(studyLogId)
        assert(savedQuizzes.size == 3)
        assert(savedQuizzes[0].queueOrder == 1)
        assert(savedQuizzes[1].queueOrder == 2)
        assert(savedQuizzes[2].queueOrder == 3)
    }

    @Test
    fun testDeleteQuizReorders() {
        val config = QuizConfig(
            studyLog = studyLog,
            description = "Test config",
            questionCount = 3
        )
        val savedConfig = quizConfigRepository.save(config)
        val configId = savedConfig.id!!

        val mockQuizzes = listOf(
            GeneratedQuiz(question = "Q1", answer = "A1"),
            GeneratedQuiz(question = "Q2", answer = "A2"),
            GeneratedQuiz(question = "Q3", answer = "A3")
        )
        `when`(geminiClient.generateQuizzes(studyLog.content, config.description, 3))
            .thenReturn(mockQuizzes)

        mockMvc.post("/api/quiz-configs/$configId/generate")
            .andExpect { status { isCreated() } }

        val allQuizzes = quizRepository.findByStudyLogIdOrderByQueueOrder(studyLogId)
        val secondQuizId = allQuizzes[1].id!!

        mockMvc.delete("/api/quizzes/$secondQuizId")
            .andExpect { status { isNoContent() } }

        val remainingQuizzes = quizRepository.findByStudyLogIdOrderByQueueOrder(studyLogId)
        assert(remainingQuizzes.size == 2)
        assert(remainingQuizzes[0].queueOrder == 1)
        assert(remainingQuizzes[1].queueOrder == 2)
    }

    @Test
    fun testGetQuizzesByStudyLogId() {
        val config = QuizConfig(
            studyLog = studyLog,
            description = "Test config",
            questionCount = 2
        )
        val savedConfig = quizConfigRepository.save(config)
        val configId = savedConfig.id!!

        val mockQuizzes = listOf(
            GeneratedQuiz(question = "Q1", answer = "A1"),
            GeneratedQuiz(question = "Q2", answer = "A2")
        )
        `when`(geminiClient.generateQuizzes(studyLog.content, config.description, 2))
            .thenReturn(mockQuizzes)

        mockMvc.post("/api/quiz-configs/$configId/generate")
            .andExpect { status { isCreated() } }

        mockMvc.get("/api/study-logs/$studyLogId/quizzes")
            .andExpect { status { isOk() } }

        val quizzes = quizRepository.findByStudyLogIdOrderByQueueOrder(studyLogId)
        assert(quizzes.size == 2)
    }
}
