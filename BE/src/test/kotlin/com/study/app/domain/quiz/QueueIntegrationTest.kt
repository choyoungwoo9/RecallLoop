package com.study.app.domain.quiz

import com.study.app.domain.studylog.StudyLog
import com.study.app.domain.studylog.StudyLogRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import com.fasterxml.jackson.databind.ObjectMapper

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Queue 순환 시스템 통합 테스트")
class QueueIntegrationTest @Autowired constructor(
    private val mockMvc: MockMvc,
    private val studyLogRepository: StudyLogRepository,
    private val quizConfigRepository: QuizConfigRepository,
    private val quizRepository: QuizRepository,
    private val quizAttemptRepository: QuizAttemptRepository,
    private val queueStateRepository: QueueStateRepository,
    private val objectMapper: ObjectMapper
) {
    private lateinit var studyLog: StudyLog
    private lateinit var quizConfig: QuizConfig
    private val quizzes = mutableListOf<Quiz>()

    @BeforeEach
    fun setup() {
        // StudyLog 생성
        studyLog = studyLogRepository.save(
            StudyLog(title = "테스트", content = "테스트 내용")
        )

        // QuizConfig 생성
        quizConfig = quizConfigRepository.save(
            QuizConfig(
                studyLog = studyLog,
                description = "테스트 문제",
                questionCount = 3
            )
        )

        // 3개의 Quiz 생성
        for (i in 1..3) {
            val quiz = Quiz(
                quizConfig = quizConfig,
                studyLog = studyLog,
                question = "문제 $i",
                answer = "답 $i",
                queueOrder = i
            )
            quizzes.add(quizRepository.save(quiz))
        }

        // QueueState 초기화
        val queueState = QueueState(
            id = 1L,
            currentQuiz = quizzes[0],
            totalCount = 3,
            completedCount = 0
        )
        queueStateRepository.save(queueState)
    }

    @Test
    @DisplayName("순환 테스트: 3개 Quiz → submit 3회 → isCycleComplete: true")
    fun testQueueCycle() {
        // Quiz 1 제출
        var response = mockMvc.perform(
            post("/api/queue/submit")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(
                    mapOf(
                        "quizId" to quizzes[0].id,
                        "submittedAnswer" to "사용자 답 1",
                        "elapsedSeconds" to 30
                    )
                ))
        ).andExpect(status().isOk).andReturn()

        val result1 = objectMapper.readValue(response.response.contentAsString, Map::class.java)
        assert(result1["isCycleComplete"] == false)
        assert(result1["nextQuiz"] != null)

        // Quiz 2 제출
        response = mockMvc.perform(
            post("/api/queue/submit")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(
                    mapOf(
                        "quizId" to quizzes[1].id,
                        "submittedAnswer" to "사용자 답 2",
                        "elapsedSeconds" to 45
                    )
                ))
        ).andExpect(status().isOk).andReturn()

        val result2 = objectMapper.readValue(response.response.contentAsString, Map::class.java)
        assert(result2["isCycleComplete"] == false)

        // Quiz 3 제출 (마지막)
        response = mockMvc.perform(
            post("/api/queue/submit")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(
                    mapOf(
                        "quizId" to quizzes[2].id,
                        "submittedAnswer" to "사용자 답 3",
                        "elapsedSeconds" to 60
                    )
                ))
        ).andExpect(status().isOk).andReturn()

        val result3 = objectMapper.readValue(response.response.contentAsString, Map::class.java)
        assert(result3["isCycleComplete"] == true) // 한 바퀴 완료!
    }

    @Test
    @DisplayName("반복 테스트: 한 바퀴 후 첫 번째 문제로 돌아오기")
    fun testQueueRepeat() {
        // 3개 문제 모두 제출
        for (i in 0..2) {
            mockMvc.perform(
                post("/api/queue/submit")
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(
                        mapOf(
                            "quizId" to quizzes[i].id,
                            "submittedAnswer" to "답 $i",
                            "elapsedSeconds" to 30
                        )
                    ))
            ).andExpect(status().isOk)
        }

        // 현재 상태 확인: completedCount = 0, currentQuiz = 첫 문제
        val response = mockMvc.perform(get("/api/queue/current"))
            .andExpect(status().isOk)
            .andReturn()

        val current = objectMapper.readValue(response.response.contentAsString, Map::class.java)
        assert(current["question"] == "문제 1") // 첫 문제로 돌아옴
    }

    @Test
    @DisplayName("완주 감지: 특정 StudyLog 모든 문제 제출 → completedStudyLog 반환")
    fun testCompletionDetection() {
        // 3개 문제 모두 제출
        for (i in 0..2) {
            mockMvc.perform(
                post("/api/queue/submit")
                    .contentType("application/json")
                    .content(objectMapper.writeValueAsString(
                        mapOf(
                            "quizId" to quizzes[i].id,
                            "submittedAnswer" to "답 $i",
                            "elapsedSeconds" to 30
                        )
                    ))
            ).andExpect(status().isOk)
        }

        // 마지막 제출 결과 확인
        val response = mockMvc.perform(
            post("/api/queue/submit")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(
                    mapOf(
                        "quizId" to quizzes[0].id,
                        "submittedAnswer" to "답",
                        "elapsedSeconds" to 30
                    )
                ))
        ).andExpect(status().isOk).andReturn()

        val result = objectMapper.readValue(response.response.contentAsString, Map::class.java)
        @Suppress("UNCHECKED_CAST")
        val completedStudyLog = result["completedStudyLog"] as? Map<String, Any>
        assert(completedStudyLog != null)
        assert(completedStudyLog!!["title"] == "테스트")
    }

    @Test
    @DisplayName("빈 Queue 테스트: currentQuiz=null → /queue/current null 응답")
    fun testEmptyQueue() {
        // QueueState만 업데이트 (currentQuiz = null)
        val queueState = queueStateRepository.findById(1L).get()
        queueState.currentQuiz = null
        queueStateRepository.save(queueState)

        // 현재 문제 조회
        val response = mockMvc.perform(get("/api/queue/current"))
            .andExpect(status().isOk)
            .andReturn()

        val result = objectMapper.readValue(response.response.contentAsString, Map::class.java)
        assert(result["quiz"] == null)
    }

    @Test
    @DisplayName("진행률 확인: GET /api/queue/status")
    fun testQueueStatus() {
        mockMvc.perform(get("/api/queue/status"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.totalCount").value(3))
            .andExpect(jsonPath("$.completedCount").value(0))
            .andExpect(jsonPath("$.progressPercent").value(0))
    }
}
