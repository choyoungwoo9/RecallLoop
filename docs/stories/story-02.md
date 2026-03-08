# Story 2: 학습 기록 CRUD

## 설명
사용자가 배운 내용을 제목과 내용으로 기록하고, 목록을 보거나 특정 기록을 다시 읽고, 필요 없는 기록은 삭제할 수 있다.

## BE 작업
- [ ] StudyLog Entity (`id`, `title`, `content`, `createdAt`, `updatedAt`)
- [ ] StudyLogRepository (JpaRepository)
- [ ] StudyLogService (create, findAll, findById, delete)
- [ ] StudyLogController (`GET/POST /api/study-logs`, `GET/DELETE /api/study-logs/{id}`)
- [ ] StudyLogRequest / StudyLogResponse DTO
- [ ] StudyLogIntegrationTest
  - 생성 → 목록 조회 → 단건 조회 → 삭제 전체 흐름
  - 없는 ID 조회 → 404 응답 확인
  - 삭제 후 재조회 → 404 응답 확인

## FE 작업
- [ ] `src/api/studyLog.js` — getStudyLogs, getStudyLog, createStudyLog, deleteStudyLog
- [ ] `StudyLogListPage` — 학습 기록 목록 (카드 형태), 새 기록 작성 버튼
- [ ] `StudyLogCreatePage` — 제목 + 내용 입력 폼, 제출 시 목록으로 이동
- [ ] `StudyLogDetailPage` — 제목/내용 표시, 삭제 버튼

## API 계약

### GET /api/study-logs
```json
[{ "id": 1, "title": "...", "content": "...", "createdAt": "..." }]
```

### POST /api/study-logs
Request: `{ "title": "string", "content": "string" }`
Response: `{ "id": 1, "title": "...", "content": "...", "createdAt": "..." }`

### GET /api/study-logs/{id}
Response: `{ "id": 1, "title": "...", "content": "...", "createdAt": "..." }`
Error: 404 (없는 경우)

### DELETE /api/study-logs/{id}
Response: 204 No Content

## 검증 기준
- BE 통합 테스트 전체 통과
- FE: 학습 기록 작성 → 목록에서 확인 → 클릭 시 상세 → 삭제 후 목록으로 돌아오기
