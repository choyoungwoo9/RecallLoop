# Story 4: 순환 Queue 시스템 & 문제 풀이

## 설명
사용자가 문제를 직접 고르지 않고 Queue에서 순서대로 풀 수 있다. 모든 문제를 한 바퀴 돌면 다시 처음부터 반복된다. 특정 학습 기록의 모든 문제를 풀면 해당 기록을 다시 확인할 수 있는 링크를 제공한다. 풀이 기록(답, 시간)이 저장된다.

## BE 작업
- [ ] QuizAttempt Entity (`id`, `quiz(ManyToOne)`, `submittedAnswer`, `elapsedSeconds`, `attemptedAt`)
- [ ] QuizAttemptRepository
- [ ] QueueController
  - `GET /api/queue/status` — 전체 상태 반환
  - `GET /api/queue/current` — 현재 문제 반환 (없으면 빈 응답)
  - `POST /api/queue/submit` — 답 제출 + 다음 문제 포인터 이동
- [ ] QueueService (핵심 로직, 트랜잭션)
  1. QuizAttempt 저장
  2. completedCount + 1
  3. 다음 queueOrder의 Quiz 조회 → currentQuiz 갱신
  4. completedCount == totalCount → completedCount = 0, 처음 Quiz로 리셋 (isCycleComplete = true)
  5. 제출 quiz의 studyLogId 기준 전체 quiz 수 vs 이번 cycle attempt 수 비교 → completedStudyLog 반환
- [ ] QueueIntegrationTest (핵심)
  - 순환 테스트: Quiz 3개 → submit 3회 → `isCycleComplete: true`
  - 반복 테스트: 한 바퀴 후 → 첫 번째 문제로 돌아오는지 확인
  - 완주 감지 테스트: studyLog A 문제 모두 submit → `completedStudyLog` 반환 확인
  - 복합 테스트: studyLog A(2문제) + B(2문제) 혼재 → A 완주 감지 정확도 확인
  - 빈 Queue 테스트: Quiz 0개 → `/queue/current` 적절한 응답 확인

## FE 작업
- [ ] `src/api/queue.js` — getQueueStatus, getCurrentQuiz, submitAnswer
- [ ] `QueueStatusPage` — 진행 현황 (QueueProgressBar, 전체 수 / 완료 수 / 진행률)
- [ ] `QuizSolvePage` — 문제 풀기 핵심 화면
  - 진입 시 `GET /api/queue/current`
  - 문제 표시 + zustand 타이머 시작 (MM:SS)
  - 답 입력 + 제출 → `POST /api/queue/submit`
  - `completedStudyLog` 있으면 StudyLogCompleteModal 표시
    - "학습 기록 보기" → `/study-logs/:id`
    - "계속 풀기" → 다음 문제
  - `isCycleComplete` true면 "한 바퀴 완료!" 표시 후 재시작
  - Queue가 비어있으면 "문제가 없습니다" 안내
- [ ] `components/queue/QueueProgressBar.jsx`
- [ ] `components/queue/StudyLogCompleteModal.jsx`

## API 계약

### GET /api/queue/status
```json
{ "totalCount": 10, "completedCount": 3, "progressPercent": 30, "currentQuizId": 4 }
```

### GET /api/queue/current
```json
{ "id": 4, "question": "...", "studyLogId": 1, "studyLogTitle": "...", "queueOrder": 4 }
```
Queue 비어있는 경우: `{ "quiz": null }`

### POST /api/queue/submit
Request:
```json
{ "quizId": 4, "submittedAnswer": "사용자 답변", "elapsedSeconds": 45 }
```
Response:
```json
{
  "attempt": { "id": 1, "submittedAnswer": "...", "elapsedSeconds": 45 },
  "nextQuiz": { "id": 5, "question": "..." } | null,
  "completedStudyLog": { "id": 1, "title": "..." } | null,
  "isCycleComplete": false
}
```

## 검증 기준
- BE 통합 테스트 전체 통과 (특히 QueueIntegrationTest 5가지 시나리오)
- FE: 문제 표시 → 답 입력 → 제출 → 다음 문제 이어지기
- FE: 한 바퀴 완료 시 알림 → 다시 처음부터 시작
- FE: 특정 학습기록 완주 시 모달 표시 → 기록 보기 또는 계속 풀기 선택
- FE: 타이머 정상 동작 (제출 시 기록됨)
