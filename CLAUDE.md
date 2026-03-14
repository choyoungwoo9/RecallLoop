# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Recall Loop**: 학습 내용을 기록하면 AI가 문제를 자동 생성하고, 앱이 최적의 타이밍에 반복 학습을 도와주는 시스템.

- **Frontend**: React 18 + Vite (포트 5173)
- **Backend**: Kotlin + Spring Boot 3.5 (포트 8080)
- **Database**: SQLite (./data/study.db)
- **AI Engine**: Google Gemini API

## Quick Start

### Prerequisites
- Node.js 18+
- Java 17+
- SQLite 3.44.1+
- Google Gemini API Key

### Setup & Run

```bash
# 1. .env 파일 설정 (BE/.env, 이미 있음)
# GEMINI_API_KEY=your_actual_key
# → 자동으로 로드됨 (dotenv-java 사용)

# 개발 서버 시작 (모두 자동으로 시작)
./start-dev.sh

# 개발 서버 중지
./stop-dev.sh

# 또는 수동으로 시작:

# BE (별도 터미널)
cd BE && ./gradlew bootRun

# FE (별도 터미널)
cd FE && npm install && npm run dev

# Access: http://localhost:5173
```

## Build & Deployment

```bash
# Backend JAR 빌드
cd BE && ./gradlew build
java -jar build/libs/app.jar

# Frontend 정적 파일 빌드
cd FE && npm run build
# dist/ 폴더 → 웹 서버 배포 (Nginx, Vercel 등)
```

## Testing

```bash
# Backend (Kotlin)
cd BE && ./gradlew test

# Frontend (React)
cd FE && npm run test
```

## Code Architecture

### Backend Structure (Kotlin + Spring Boot)

```
BE/src/main/kotlin/com/study/app/
├── config/
│   ├── CorsConfig.kt          # CORS 설정
│   └── GeminiConfig.kt        # Gemini API 설정
├── domain/
│   ├── studylog/              # 학습 기록 (StudyLog 엔티티)
│   │   ├── StudyLog.kt
│   │   ├── StudyLogRepository
│   │   ├── StudyLogController
│   │   └── StudyLogService
│   ├── quiz/                  # 문제 & Queue (핵심 시스템)
│   │   ├── Quiz.kt
│   │   ├── QuizRepository
│   │   ├── QuizController
│   │   ├── QuizService.kt (queueOrder, 문제 생성)
│   │   ├── QueueState.kt      # 순환 상태
│   │   ├── QueueStateRepository (원자적 UPDATE)
│   │   ├── QueueService.kt    # 제출 & 진행
│   │   └── QueueController
│   ├── quizconfig/            # 문제 생성 설정
│   │   ├── QuizConfig.kt
│   │   ├── QuizConfigRepository
│   │   ├── QuizConfigController
│   │   └── QuizConfigService
│   └── attempt/               # 시도 기록
│       ├── QuizAttempt.kt
│       ├── QuizAttemptRepository
│       ├── QuizAttemptController
│       └── QuizAttemptService
└── infrastructure/
    └── GeminiApiClient.kt     # Gemini API 호출
```

### Frontend Structure (React + Vite)

```
FE/src/
├── api/                       # API 호출 모듈 (axios)
│   ├── studyLog.js
│   ├── quiz.js
│   ├── queue.js
│   ├── quizConfig.js
│   └── completionSummary.js
├── pages/                     # 페이지 컴포넌트 (라우팅)
│   ├── StudyLogListPage.jsx   # 기록 목록
│   ├── StudyLogCreatePage.jsx # 기록 작성
│   ├── StudyLogDetailPage.jsx # 기록 상세 (3개 탭)
│   ├── QuizSolvePage.jsx      # 문제 풀이 (메인)
│   └── QueueStatusPage.jsx    # 진행률 (대시보드)
├── components/
│   ├── common/                # 공통 컴포넌트
│   │   ├── Header.jsx
│   │   ├── Layout.jsx
│   │   ├── Icons.jsx (SVG 중앙집중식)
│   │   ├── ConfirmModal.jsx
│   │   └── ...
│   ├── queue/                 # 문제 풀이 관련
│   │   ├── QueueProgressBar.jsx
│   │   ├── CompletionQuizzesModal.jsx (완주 모달)
│   │   ├── StudyLogSummaryModal.jsx
│   │   └── QuizForm.jsx
│   ├── studylog/              # 학습 기록 관련
│   │   ├── StudyLogCard.jsx
│   │   ├── Tabs.jsx
│   │   └── ...
│   └── quiz/
│       └── QuizList.jsx
├── store/                     # 상태 관리 (Zustand)
│   └── ...
├── assets/                    # 로고, 이미지
│   ├── logo.svg
│   └── ...
└── App.jsx                    # 라우팅 설정
```

## Core Concepts

### 1. Queue System (학습 순환)

**목표**: 모든 문제를 반복적으로 순환하며 최적의 학습 간격 제공

**흐름**:
```
Quiz 1 → Quiz 2 → ... → Quiz 14 → [한 바퀴 완료] → Quiz 1 → ...
```

**중요 필드**:
- `Quiz.queueOrder`: 전역 고유값 (1~N, 모든 Quiz에서 유일)
- `QueueState.currentQuizId`: 현재 풀어야 할 문제 ID
- `QueueState.completedCount`: 이번 사이클 완료 개수
- `QueueState.totalCount`: 전체 문제 개수

**원자적 업데이트** (동시성 안전):
```kotlin
// QueueStateRepository.kt
@Query("UPDATE queue_state SET completed_count = completed_count + 1, ...")
fun incrementCompletedAndSetNextQuiz(nextQuizId: Long)

@Query("UPDATE queue_state SET completed_count = 0 WHERE id = 1")
fun resetCompletedCount()
```

### 2. Completion Detection (완주 감지)

**로직**: 특정 StudyLog의 모든 문제가 "최근 사이클 내에서" 시도되었는지 확인

```kotlin
// QuizService.kt submitAnswer()에서:
val completedStudyLog = checkCompletedStudyLog(currentQuizId)
// → QuizAttemptRepository.findRecentByStudyLogId() 사용
// → 최근 totalCount개 시도 중 StudyLog의 모든 문제 포함 확인
```

### 3. AI Problem Generation

**흐름**:
```
사용자: "문제 생성"
  ↓
QuizConfigService.generateQuizzes()
  ↓
GeminiApiClient.generateQuizzes() (Gemini API 호출)
  ↓
JSON 응답 파싱: [{"question": "...", "answer": "..."}, ...]
  ↓
Quiz 엔티티 생성 및 저장
  ↓
QuizService.reorderAllQuizzes() (queueOrder 재정렬)
```

## API Endpoints

### StudyLog (학습 기록)
- `GET /api/study-logs` - 전체 기록 조회
- `POST /api/study-logs` - 새로운 기록 작성
- `GET /api/study-logs/{id}` - 상세 조회
- `DELETE /api/study-logs/{id}` - 삭제

### Quiz (문제) & Queue (순환)
- `GET /api/queue/status` - Queue 상태 (진행률, 총 개수)
- `GET /api/queue/current` - 현재 문제
- `POST /api/queue/submit` - 제출 & 다음 문제로 이동 (**핵심**)
- `POST /api/queue/initialize` - Queue 초기화

### QuizConfig (생성 설정)
- `POST /api/quiz-configs/{configId}/generate` - AI로 문제 생성

### QuizAttempt (시도 기록)
- `GET /api/study-logs/{studyLogId}/completion-summary` - 학습 완주 데이터

## Key Development Tasks

### Add a new Quiz field
1. `Quiz.kt` 엔티티에 필드 추가
2. `QuizRepository` 필요시 쿼리 추가
3. `QuizService` 로직 업데이트
4. `QuizController` 응답 변경
5. FE API 모듈 업데이트 (`api/quiz.js`)

### Modify Queue Logic
**주의**: Queue는 원자성이 중요함
1. `QueueStateRepository.kt`에 SQL UPDATE 쿼리 추가
2. `QueueService.submitAnswer()`에서 DB 업데이트 호출
3. 메모리 로드/수정 피할 것 (동시성 이슈)

### Add UI Component
1. `FE/src/components/` 폴더 선택 (common, queue, studylog, quiz 등)
2. JSX 파일 생성 (CSS 파일도 함께)
3. 필요시 API 모듈 호출 (`FE/src/api/*.js`)
4. `App.jsx` 또는 부모 컴포넌트에 등록

## Color Palette

- **Primary**: `#0052CC` (진한 파란색)
- **Secondary**: `#00BFA5` (청록색)
- **Accent**: `#FF6B6B` (빨간색)
- **Background**: `#f5f8fd` (파란색 톤)

## Important Notes

1. **SVG Icons**: 모든 아이콘은 `Icons.jsx`에서 관리 (emoji 제거됨)
2. **Modal System**: `window.confirm/alert` 대신 `ConfirmModal.jsx` 사용
3. **Responsive Design**: 모바일/태블릿/데스크톱 모두 지원
4. **State Management**: FE에서 Zustand 사용 (간단한 상태 관리)
5. **API Proxy**: Vite 설정에서 `/api` → `http://localhost:8080` 자동 프록시

## Debugging Tips

```bash
# Backend 로그 확인
tail -f /tmp/be.log

# Frontend 로그 확인
tail -f /tmp/fe.log

# SQLite 데이터 확인
sqlite3 ./data/study.db
sqlite> SELECT * FROM quiz WHERE study_log_id = 1;

# Kotlin 컴파일 에러
cd BE && ./gradlew --stacktrace build
```

## Git Workflow

### ⚠️ **작업 완료 체크리스트 (필수)**

**모든 작업 후에는 반드시 이 3단계를 순서대로 수행하세요:**

```
1️⃣ 커밋 → 2️⃣ 빌드 → 3️⃣ 실행
```

#### 1️⃣ **커밋** (Commit)

**언제**: 기능/버그/리팩토링 완료 후
- ✅ 기능 추가 완료
- ✅ 버그 수정 완료
- ✅ 리팩토링 완료
- ✅ 문서 작성 완료

**커밋 메시지 규칙**:
- 형식: `[범주]: 한국어 설명`
- 범주: `기능`, `버그`, `리팩토링`, `문서`, `UI`, `테스트`, `성능` 등
- 예시:
  - ✅ `기능: Queue 아키텍처 DB 기반 원자적 업데이트로 변경`
  - ✅ `버그: 완주 감지 로직 사이클 내 시도로 판정하도록 수정`
  - ✅ `UI: StudyLogDetailPage 탭 레이아웃 추가`

**커밋 전 확인**:
- [ ] `git status`로 원치 않는 파일 포함되지 않았는지 확인
- [ ] `.env`, 크레덴셜, 임시 파일은 `.gitignore`에 있는지 확인

#### 2️⃣ **빌드** (Build)

**백엔드**:
```bash
cd BE
./gradlew build
# 확인: BUILD SUCCESSFUL 메시지
```

**프론트엔드**:
```bash
cd FE
npm run build
# 확인: dist/ 폴더 생성됨
```

**빌드 실패 시**:
- 에러 메시지 읽고 코드 수정
- 수정 후 **새로운 커밋** 생성
- 다시 빌드

#### 3️⃣ **실행** (Run)

**백엔드**:
```bash
cd BE
./gradlew bootRun
# 확인: "Started StudyAppApplication" 메시지
# 포트 8080이 정상 실행
```

**프론트엔드**:
```bash
cd FE
npm run dev
# 확인: "Local: http://localhost:5173"
```

**또는 전체 자동화**:
```bash
./start-dev.sh  # BE + FE 동시 시작
```

**실행 실패 시**:
- 로그 확인 (`tail -f /tmp/be.log`, `tail -f /tmp/fe.log`)
- 원인 파악 후 코드 수정
- 다시 커밋 → 빌드 → 실행

## Recent Architecture Changes

### Queue Refactoring (2026-03-09)
**Before**: 메모리 기반 로드/수정
**After**: DB 기반 SQL UPDATE (원자성 보장)

- `QueueStateRepository.incrementCompletedAndSetNextQuiz()` - SQL 직접 실행
- `QueueStateRepository.resetCompletedCount()` - 한 바퀴 완료 시 리셋

### Completion Modal Integration (2026-03-09)
- `CompletionQuizzesModal` + `StudyLogSummaryModal` 통합
- `isCycleComplete` 여부로 축하 메시지 조건부 표시

### Problem Reordering (2026-03-09)
- `QuizService.reorderAllQuizzes()` - 통합 재정렬 메서드
- ID 기준 정렬 후 queueOrder를 1부터 재정렬

## Next Priority

1. 사용자 피드백 수집 (모달 UX 테스트)
2. 통계/분석 기능 (학습 성과 분석)
3. 사용자 인증 (로그인/회원가입)
4. 멀티 사용자 지원
