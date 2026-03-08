# Story 3: 문제 생성 설정 & Gemini 문제 생성

## 설명
사용자가 학습 기록마다 "어떤 문제를 만들고 싶은지" 설명을 입력하고, AI(Gemini)가 그 설명을 바탕으로 문제를 자동 생성한다. 생성된 문제는 삭제할 수 있다.

## BE 작업
- [ ] QuizConfig Entity (`id`, `studyLog(ManyToOne)`, `description`, `questionCount`, `createdAt`)
- [ ] QuizConfigRepository / QuizConfigService / QuizConfigController
  - `GET /api/study-logs/{studyLogId}/quiz-configs`
  - `POST /api/study-logs/{studyLogId}/quiz-configs`
  - `DELETE /api/quiz-configs/{id}`
- [ ] Quiz Entity (`id`, `quizConfig(ManyToOne)`, `studyLog(ManyToOne 역정규화)`, `question`, `answer`, `queueOrder`, `createdAt`)
- [ ] QuizRepository / QuizService / QuizController
  - `GET /api/study-logs/{studyLogId}/quizzes`
  - `DELETE /api/quizzes/{id}` (QueueState totalCount 감소 + queueOrder 재정렬 포함)
- [ ] QueueState Entity (`id=1 고정`, `currentQuiz(OneToOne nullable)`, `totalCount`, `completedCount`, `updatedAt`)
- [ ] QueueStateRepository
- [ ] GeminiClient (`POST /api/quiz-configs/{configId}/generate`)
  - WebClient로 Gemini generateContent API 호출
  - 프롬프트: studyLog.content + config.description + questionCount개 JSON 배열 요청
  - 응답 파싱: 마크다운 코드블록 제거 후 Jackson 역직렬화
  - Quiz 저장 시 queueOrder는 현재 최대값 + 1부터 append
  - QueueState totalCount 증가, currentQuiz null이면 첫 번째 Quiz로 설정
- [ ] GeminiRequest / GeminiResponse DTO
- [ ] QuizConfigIntegrationTest
  - 동일 studyLog에 여러 Config 생성 가능 확인
  - Config 삭제 후 연관 Quiz CASCADE 삭제 확인
- [ ] QuizIntegrationTest
  - Gemini MockBean으로 문제 생성 → Quiz 목록 + queueOrder 순서 확인
  - Quiz 삭제 후 queueOrder 재정렬 + QueueState totalCount 감소 확인

## FE 작업
- [ ] `src/api/quizConfig.js` — getQuizConfigs, createQuizConfig, deleteQuizConfig
- [ ] `src/api/quiz.js` — getQuizzes, generateQuizzes, deleteQuiz
- [ ] `StudyLogDetailPage` 확장
  - 하단에 QuizConfig 목록 + 생성 폼 (description, questionCount)
  - 각 Config 아래 "문제 생성" 버튼
  - 생성된 Quiz 목록 표시 (질문 텍스트, 삭제 버튼)

## API 계약

### POST /api/study-logs/{studyLogId}/quiz-configs
Request: `{ "description": "핵심 개념을 설명하는 문제를 만들어줘", "questionCount": 5 }`
Response: `{ "id": 1, "description": "...", "questionCount": 5, "createdAt": "..." }`

### POST /api/quiz-configs/{configId}/generate
Response: `[{ "id": 1, "question": "...", "answer": "...", "queueOrder": 1 }]`

### GET /api/study-logs/{studyLogId}/quizzes
Response: `[{ "id": 1, "question": "...", "queueOrder": 1, "createdAt": "..." }]`

### DELETE /api/quizzes/{id}
Response: 204 No Content

## 검증 기준
- BE 통합 테스트 전체 통과 (Gemini MockBean 사용)
- FE: 학습 기록 상세 → Config 생성 → "문제 생성" 클릭 → 문제 목록 표시 → 개별 삭제
- GEMINI_API_KEY 환경변수 설정 시 실제 API 연동 확인
