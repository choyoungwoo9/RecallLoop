# 📋 문제 풀이 기능 전체 평가 보고서

**평가일**: 2026-03-14
**대상**: FE (React+Vite) + BE (Kotlin+Spring Boot) 문제 풀이 기능 전체
**평가 범위**: QuizSolvePage, QueueStatusPage, Queue/Quiz API, DB 모델, 상태 관리, 에러 처리, 테스트

---

## 📌 1. 의도한 기능 정리

### 1.1 핵심 기능 (의도대로 작동)

| 기능 | FE | BE | 상태 |
|------|----|----|------|
| 현재 문제 조회 | QuizSolvePage | GET /api/queue/current | ✅ 정상 |
| 답변 제출 | 폼 입력 → submit | POST /api/queue/submit | ✅ 정상 |
| 문제 순환 | queueOrder 기반 모듈러 연산 | (currentOrder % totalCount) + 1 | ✅ 정상 |
| 진행률 표시 | QueueProgressBar (2초 폴링) | GET /api/queue/status | ✅ 정상 |
| 타이머 | 문제별 경과 시간 측정 | elapsedSeconds 저장 | ✅ 정상 (하단 참고) |
| 완주 감지 | completedStudyLog 모달 표시 | 최근 attempt 기반 | ⚠️ 논리 위험 (하단 참고) |
| 한 바퀴 완료 | 배너 표시 후 재시작 | isCycleComplete 플래그 | ✅ 정상 |

### 1.2 추가 기능 (의도는 구현됨, 설계에 결함)

| 기능 | 상태 | 문제점 |
|------|------|--------|
| 완주 모달 (CompletionQuizzesModal) | ✅ 작동 | 학습 기록 내용 표시, 문제/답변 비교 기능 정상 |
| 에러 처리 | ⚠️ 부분 작동 | FE: alert() 2건 잔존, console.error만 사용. BE: 전역 예외 핸들러 없음 |
| 상태 관리 | ✅ 작동 | 로컬 useState 위주, 복잡한 상태 전이 → 버그 가능성 높음 |
| 타이머 스토어 | ⚠️ 미작동 | Zustand timerStore는 더미 코드 (Date.now() 저장 후 미사용) |

---

## 🐛 2. 발견된 버그

### 2.1 FE 버그 (심각도별)

#### 🔴 HIGH: 에러 복구 불안정성
**버그**: `loadCurrentQuiz()` 에러 시 이전 문제가 화면에 잔류
- **위치**: `QuizSolvePage.jsx:57-61`
- **문제 코드**:
  ```js
  } catch (error) {
    console.error('문제 로드 실패:', error)
    // setCurrentQuiz(null)이 없음 ← 이전 문제가 계속 표시됨
  } finally {
    setLoading(false)
  }
  ```
- **영향**: 네트워크 오류 후 복구 시 사용자가 이미 제출한 문제를 다시 보게 됨. 혼동 야기.
- **해결**: `catch` 블록에 `setCurrentQuiz(null)` 추가

#### 🔴 HIGH: 프로젝트 방침 위반 (alert 잔존)
**버그**: `window.alert()` 2건 잔존
- **위치 1**: `QuizSolvePage.jsx:67` - 답변 빈값 체크
  ```js
  if (!submittedAnswer.trim()) {
    alert('답을 입력해주세요')  // ← 금지된 패턴
  }
  ```
- **위치 2**: `QuizSolvePage.jsx:100` - 제출 실패
  ```js
  } catch (error) {
    alert('답 제출에 실패했습니다')  // ← 금지된 패턴
  }
  ```
- **영향**: 프로젝트 CLAUDE.md에서 명시한 `ConfirmModal` 사용 방침 위반. UI/UX 일관성 깨짐.
- **해결**: `ConfirmModal` 컴포넌트로 대체

#### 🟡 MEDIUM: 폴링 타이밍 경합
**버그**: `QueueProgressBar`의 2초 폴링이 `submit` 직후 호출과 경합
- **위치**: `QueueProgressBar.jsx:23-30`
  ```js
  useEffect(() => {
    const interval = setInterval(loadStatus, 2000)
    return () => clearInterval(interval)
  }, [])
  ```
- **문제**: `handleSubmit()` 직후 `loadCurrentQuiz()` 호출 중에 폴링이 동시 발동 가능성. 두 API 호출이 경쟁. 응답 순서에 따라 UI 상태가 뒤바뀔 가능성.
- **영향**: 제출 직후 화면이 순간 깜박거리거나 다음 문제가 지연될 가능성.
- **해결**: 폴링 동안 `loadCurrentQuiz` 호출 차단, 또는 폴링 간격 조정 (3초 이상)

#### 🟡 MEDIUM: 타이머 리셋 불일치
**버그**: `elapsedSeconds` 리셋 타이밍이 불안정
- **위치**: `QuizSolvePage.jsx:39-61`
  ```js
  // 전역 setInterval (컴포넌트 생애 동안 계속 증가)
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])  // 의존성 배열 비어 있음

  // loadCurrentQuiz 성공 시만 리셋
  setElapsedSeconds(0)
  ```
- **문제**:
  1. 제출 실패 시 타이머가 계속 증가
  2. 사이클 완료 배너 대기(setTimeout 2초) 중에도 증가
  3. 다음 문제 로드 후에야 리셋
  → 제출된 시간이 실제보다 크게 기록될 수 있음
- **영향**: `elapsedSeconds`가 부정확하면 학습 통계(나중에 추가될 예정)가 왜곡됨.
- **해결**: 모든 상태 변경 시점에 `setElapsedSeconds(0)` 호출 (실패, 완료, 모달 닫기 등)

#### 🟡 MEDIUM: 더미 상태 관리
**버그**: `timerStore`가 더미 코드
- **위치**: `timerStore.js` + `QuizSolvePage.jsx:32-37`
  ```js
  // timerStore.js
  startTimer: () => set({ timerInterval: Date.now() }),  // 이름과 값이 불일치
  stopTimer: () => set({ timerInterval: null }),

  // QuizSolvePage.jsx
  const { startTimer, stopTimer } = useTimerStore()
  useEffect(() => {
    if (currentQuiz) {
      startTimer()  // 호출되지만 아무 동작 없음
      return () => stopTimer()
    }
  }, [currentQuiz, startTimer, stopTimer])
  ```
- **문제**:
  1. `timerInterval`이라는 이름인데 실제로는 `Date.now()` 타임스탐프 저장
  2. 실제 interval 관리 안 함
  3. 렌더링에서 사용되지 않음 (의존성만 있음)
  → 상태 관리 복잡성만 증가시키고 기능은 없음
- **영향**: 코드 유지보수 어려움. 미래 개발자가 혼동 가능.
- **해결**: `timerStore` 제거 또는 실제 기능 구현 (interval 관리 등)

#### 🟢 LOW: 데드 코드
**버그**: `StudyLogCompleteModal.jsx` 미사용
- **위치**: `FE/src/components/queue/StudyLogCompleteModal.jsx`
- **문제**: 현재 `CompletionQuizzesModal`로 대체되었으나 파일이 남아 있음.
- **영향**: 혼란 야기 가능성.
- **해결**: 파일 삭제

#### 🟢 LOW: 복잡한 상태 전이
**버그**: `pendingCycleComplete + isCycleComplete` 이중 상태
- **위치**: `QuizSolvePage.jsx:15-16, 22, 84, 95-98`
  ```js
  const [isCycleComplete, setIsCycleComplete] = useState(false)
  const [pendingCycleComplete, setPendingCycleComplete] = useState(false)
  ```
- **문제**:
  1. 한 바퀴 완료 + 완주 모달 동시 발생 시, 모달 닫을 때까지 배너 지연
  2. 두 플래그의 상태 전이가 복잡함
  3. 향후 리팩토링 시 버그 발생 가능성 높음
- **영향**: 유지보수 난이도 증가.
- **해결**: 상태 단일화 (`useReducer` 고려) 또는 명확한 상태 다이어그램 작성

---

### 2.2 BE 버그 (심각도별)

#### 🔴 HIGH: 원자성 결함
**버그**: 사이클 완료 시 두 SQL 사이 원자성 없음
- **위치**: `QueueService.kt:109-116`
  ```kotlin
  if (isCycleComplete) {
      queueStateRepository.resetCompletedCount()  // SQL 1: 완료 카운트=0, cycleStartedAt=현재
      queueStateRepository.incrementCompletedAndSetNextQuiz(nextQuiz?.id)  // SQL 2: 완료 카운트+1
  } else {
      queueStateRepository.incrementCompletedAndSetNextQuiz(nextQuiz?.id)
  }
  ```
- **문제**: 두 SQL 사이에 다른 요청이 끼어들 가능성. 최악의 경우:
  1. SQL 1 실행: `completed_count = 0`
  2. 다른 사용자 submit
  3. SQL 2 실행: `completed_count = 1` (의도: 0 → 1)
  → 다음 사이클의 진행 카운트가 꼬임
- **실제 위험도**: 낮음 (단일 커넥션 pool_size=1 설정이 회피)
- **설계 결함**: 트랜잭션 경계가 명확하지 않음.
- **해결**: 두 UPDATE를 하나의 SQL로 합치기
  ```sql
  UPDATE queue_state
  SET completed_count = 1,
      cycle_started_at = CURRENT_TIMESTAMP,
      current_quiz_id = :nextQuizId,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = 1
  ```

#### 🔴 HIGH: 예외 처리 미흡
**버그**: `IllegalArgumentException` 발생 시 HTTP 500 반환
- **위치**: `QueueService.kt:57, 72`
  ```kotlin
  val quiz = quizRepository.findById(quizId)
      .orElseThrow { IllegalArgumentException("Quiz not found") }
  val studyLog = studyLogRepository.findById(...)
      .orElseThrow { IllegalArgumentException("StudyLog not found") }
  ```
- **문제**: 이들 예외를 처리하는 `@ControllerAdvice`가 없음. Spring이 기본 처리로 HTTP 500 (Internal Server Error) 반환.
- **영향**: 클라이언트는 서버 에러로 인식. 실제는 잘못된 요청 (400 Bad Request 또는 404 Not Found가 맞음).
- **해결**: `ResponseStatusException` 사용 또는 `@ControllerAdvice` 추가

#### 🟡 MEDIUM: 데이터 정합성 위험
**버그**: 트랜잭션 어노테이션 혼용
- **위치**:
  - 서비스 레이어: `org.springframework.transaction.annotation.Transactional` (Spring)
  - 리포지토리: `jakarta.transaction.Transactional` (Jakarta)
- **문제**: 두 어노테이션이 다른 구현. 에러 처리, 롤백 정책이 일관성 없을 가능성.
- **영향**: 특정 시나리오에서 데이터 일관성 깨질 수 있음.
- **해결**: 모두 Spring의 `@Transactional`로 통일

#### 🟡 MEDIUM: 테스트 설정 오류
**버그**: `QuizIntegrationTest`에 `@ActiveProfiles("test")` 누락
- **위치**: `QuizIntegrationTest.kt`
- **문제**: `@ActiveProfiles("test")`가 없으면 `application.yml` 기본 설정 (SQLite) 사용. 테스트는 H2 인메모리 DB를 의도했지만 실제 SQLite `/data/study.db` 접근 가능성.
- **영향**: 테스트가 실제 DB 오염 가능. 테스트 격리 원칙 위반.
- **해결**: `@ActiveProfiles("test")` 추가

#### 🟡 MEDIUM: 성능 문제
**버그**: `quiz_attempt` 테이블에 인덱스 없음
- **위치**: `QuizAttemptRepository.kt` 쿼리
  ```kotlin
  @Query("SELECT qa FROM QuizAttempt qa WHERE qa.quiz.id = :quizId AND qa.attemptedAt >= :since ORDER BY qa.attemptedAt DESC LIMIT 1")
  fun findAttemptByQuizIdAfter(quizId: Long, since: LocalDateTime): QuizAttempt?
  ```
- **문제**:
  1. `quiz_id` 컬럼 미인덱싱 → 전체 테이블 스캔
  2. `attemptedAt` 컬럼 미인덱싱 → 범위 검색 느림
  3. completedStudyLog 감지 시 StudyLog의 모든 Quiz(N개)에 대해 이 쿼리 N번 호출 → O(N) 쿼리
- **영향**: Quiz 개수가 많아질수록 응답 시간 증가. 예: 100개 Quiz × 10개 StudyLog = 1000번 쿼리.
- **해결**:
  ```sql
  CREATE INDEX idx_quiz_attempt_quiz_id ON quiz_attempt(quiz_id);
  CREATE INDEX idx_quiz_attempt_attempted_at ON quiz_attempt(attempted_at);
  ```
  또는 쿼리 최적화 (JOIN으로 N+1 회피)

#### 🟢 LOW: CORS 중복 설정
**버그**: CORS 설정이 QueueController에만 명시적 설정
- **위치**: `QueueController.kt` - `@CrossOrigin(origins = ["http://localhost:5173"])`
- **문제**: 전역 CORS 설정이 `CorsConfig.kt`에서 별도로 진행되고 있을 가능성. 중복/충돌 위험.
- **영향**: 미미. 하지만 명시적 설정은 유지보수 혼란.
- **해결**: CORS는 전역 설정으로 통일하고 `@CrossOrigin` 제거

---

## 🗄️ 3. DB 데이터 정합성 이슈

### 3.1 심각도 HIGH

#### 🔴 문제 1: Quiz 삭제 시 진행도 손실
**이슈**: `QuizService.delete()` 호출 시 QueueState가 항상 초기화됨
- **코드**:
  ```kotlin
  fun delete(id: Long) {
      quizRepository.deleteById(id)
      reorderAllQuizzes()  // 이 함수 내부에서 resetQueueState() 호출
  }

  fun resetQueueState() {
      val firstQuiz = quizRepository.findAll().minByOrNull { it.queueOrder }
      queueStateRepository.save(QueueState(
          id = 1,
          currentQuiz = firstQuiz,
          totalCount = allQuizzes.size,
          completedCount = 0  // ← 항상 0으로 리셋!
      ))
  }
  ```
- **문제**: 사용자가 10개 문제 중 5개를 풀었는데, 관리자가 1개 문제를 삭제하면 `completedCount`가 0으로 리셋됨. 학습 진행도 손실.
- **영향**: 데이터 손실. 사용자 불만 야기.
- **예시**:
  1. StudyLog A: Quiz 1~5, completedCount=3 (3개 풀음)
  2. Quiz 2를 삭제
  3. QueueState: completedCount=0 (리셋됨)
  4. 사용자는 "3개 풀었는데 왜 0개로 돌아갔지?"
- **해결**:
  - 옵션 1: `resetQueueState()`에서 `completedCount`를 보존 (`min(기존값, 새로운 totalCount)`)
  - 옵션 2: 문제 삭제 전에 영향받은 `completedCount` 조정

#### 🔴 문제 2: completedStudyLog 감지 로직의 불안정성
**이슈**: "완주 감지 기준"이 모호함
- **현재 로직** (`QueueService.kt:84-106`):
  ```kotlin
  val cycleStartedAt = queueState.cycleStartedAt
  val allQuizzesOfStudyLog = quizRepository.findByStudyLogId(currentStudyLogId)

  val completed = allQuizzesOfStudyLog.all { quiz ->
      quizAttemptRepository.findAttemptByQuizIdAfter(quiz.id, cycleStartedAt) != null
  }

  if (completed) {
      return StudyLogResponse(...)  // 완주로 인정
  }
  ```
- **문제**: `cycleStartedAt` 이후 **동일 문제를 N번 풀었어도** "완주"로 인정됨.
  - 예: Quiz 1을 3번 풀고, Quiz 2를 3번 풀면 → "모든 문제 완주!"
  - 의도: 모든 문제를 **각각 최소 1회** 풀기
  - 실제: 모든 문제가 **1회 이상** 시도되었는지만 확인
- **영향**: 사용자가 실수로 같은 문제만 반복 제출해도 완주 모달이 뜸. 학습 목표 달성 확인 불안정.
- **근본 원인**: "completedStudyLog 감지 기준"이 모호하게 설계됨.
- **해결**:
  - 옵션 1: 개념 명확화 (문서에 명시)
  - 옵션 2: "각 문제마다 서로 다른 시간 간격을 두고 풀어야 완주" 같은 강화된 기준 추가
  - 옵션 3: 답변 정확성도 포함 (`submittedAnswer == quiz.answer` 비교)

#### 🔴 문제 3: queueOrder 재정렬 시 인덱시 충돌 가능성
**이슈**: `reorderAllQuizzes()` 중에 새 문제 생성되면 순서 꼬임
- **코드**:
  ```kotlin
  fun reorderAllQuizzes() {
      val allQuizzes = quizRepository.findAll().sortedBy { it.id }
      allQuizzes.forEachIndexed { index, quiz ->
          quizRepository.save(quiz.copy(queueOrder = index + 1))  // ← UPDATE
      }
  }
  ```
- **시나리오**:
  1. Thread A: reorderAllQuizzes() 중, Quiz 1~5 저장 중
  2. Thread B: 새 Quiz 생성 (queueOrder=6으로 저장)
  3. Thread A 재개: Quiz 6~10 재정렬 (잘못된 값 덮어씀)
- **실제 위험도**: 낮음 (Spring Boot 단일 인스턴스 + pool_size=1)
- **설계 결함**: 트랜잭션 경계가 명확하지 않음.
- **해결**:
  - 옵션 1: `reorderAllQuizzes()`를 `@Transactional`로 감싸기
  - 옵션 2: DB 레벨 constraint (queueOrder UNIQUE) 추가

---

### 3.2 심각도 MEDIUM

#### 🟡 문제 4: 멀티유저 불가 설계
**이슈**: `QueueState` 싱글톤 레코드 (id=1 고정)
- **DB 스키마**:
  ```sql
  CREATE TABLE queue_state (
    id BIGINT PRIMARY KEY DEFAULT 1,  -- 항상 1!
    current_quiz_id BIGINT,
    total_count INT,
    completed_count INT,
    cycle_started_at TIMESTAMP
  );
  ```
- **문제**: 시스템 전체에 단 1개의 QueueState 레코드만 존재. 여러 사용자가 동시에 문제를 풀면 상태가 꼬임.
  - 사용자 A가 문제 1을 풀고 있는데
  - 사용자 B가 문제 2를 제출하면
  - QueueState가 "현재 문제: 3번"으로 변경됨
  - 사용자 A 화면: 문제 1 풀다가 갑자기 문제 3으로 바뀜
- **영향**: 멀티유저 기능 불가. 이후 사용자 인증 기능 추가 시 큰 리팩토링 필요.
- **설계 의도**: 초기 프로토타입이므로 싱글유저 전제. 문서에 명시 필요.
- **해결**: 향후 사용자 인증 추가 시 `QueueState` 테이블에 `user_id` 컬럼 추가

---

## 🏗️ 4. 아키텍처/설계 이슈

### 4.1 상태 관리 복잡성

| 항목 | 현황 | 문제 |
|------|------|------|
| FE 상태 | `useState` 로컬 상태 9개 | 상태 전이 로직이 `useEffect` 콜백에 분산됨. 디버깅 어려움. |
| BE 상태 | `QueueState` 싱글톤 + 메모리 계산 | 메모리(isCycleComplete)와 DB(completed_count) 상태 분리. 일관성 위험. |
| 전역 상태 | Zustand `timerStore` (미작동) | 실질적 역할 없음. 혼란만 야기. |
| 상태 동기화 | FE ← 2초 폴링 + API 응답 | 폴링과 이벤트 기반 업데이트가 혼재. 경합 가능성. |

### 4.2 타이머 로직 중복

**시스템 A** (실제 동작):
```js
setInterval(() => {
  setElapsedSeconds((prev) => prev + 1)
}, 1000)
```

**시스템 B** (미작동):
```js
const { startTimer, stopTimer } = useTimerStore()
```

→ 타이머 코드가 두 곳에 분산. 유지보수 어려움.

### 4.3 API 응답 형식 불일치

| 엔드포인트 | 정상 응답 | 예외 응답 | 문제 |
|-----------|----------|----------|------|
| `/api/queue/current` | `{quiz: {...}}` | `{quiz: null}` | quiz가 없을 때 구조가 다름. 클라이언트 처리 복잡. |
| `/api/queue/submit` | `{attempt: {...}, nextQuiz: {...}, completedStudyLog: {...}, isCycleComplete: true}` | HTTP 500 (IllegalArgumentException) | 에러 응답 형식 미정의 |

### 4.4 테스트 커버리지 낮음

| 항목 | 테스트 | 미커버 |
|------|--------|--------|
| QueueService | submitAnswer 기본 흐름, 순환, 완주 감지 | initializeQueue, 에러 케이스, 동시성 |
| QuizService | 생성, 삭제, 순서 재정렬 | 부분 삭제, 모든 삭제 시 처리 |
| GeminiClient | MockBean | 실제 API 호출 테스트 없음 |
| FE | 없음 | 모든 컴포넌트 미테스트 |
| 데이터 정합성 | 없음 | 동시 submit, Quiz 삭제 중 submit 등 |

---

## 🎯 5. 성능/UX 이슈

### 5.1 성능 병목

| 항목 | 문제 | 영향 |
|------|------|------|
| Quiz 개수 | N개 Quiz → 완주 감지 시 N번 쿼리 (각 Quiz마다 findAttemptByQuizIdAfter) | 응답 시간: O(N). 100 Quiz면 100ms+ 추가 지연 |
| 폴링 간격 | 2초 폴링 (QueueProgressBar) | 불필요한 API 호출. 배터리 소비 (모바일). 서버 부하 |
| 인덱싱 부재 | quiz_attempt 테이블 (quiz_id, attemptedAt) 인덱스 없음 | 데이터 많아질수록 선형 악화 |

### 5.2 UX 문제

| 항목 | 문제 |
|------|------|
| 에러 피드백 | alert() 사용 + console.error만. 사용자가 오류 상황 이해 어려움. |
| 로딩 상태 | loading 로직은 있지만 스켈레톤/스피너 UI 부재 (추측). 단순 disabled 처리? |
| 완주 모달 | 모달이 뜬 후 "계속 풀기" 버튼 클릭 시, 다음 문제 로드까지 딜레이(timeout 2초) 발생 가능. |
| 타이머 표시 | 제출 실패 시 타이머가 계속 증가하는 것을 사용자가 인지 불가. |

---

## 📊 6. 의도 vs 실제 검증표

### "완주 감지" 기능

| 상황 | 의도 | 실제 | 일치 |
|------|------|------|------|
| Quiz 1, 2 모두 풀고 제출 | "두 문제 완주!" | "두 문제 완주!" | ✅ |
| Quiz 1을 3번, Quiz 2를 0번 풀고 Quiz 1 제출 | "미완주 (Quiz 2 미풀)" | "미완주" | ✅ |
| Quiz 1을 3번, Quiz 2를 3번 풀고 제출 | "완주" | "완주" | ✅ |
| Quiz 1을 5번 풀고 제출 (Quiz 2는 미풀) | "미완주" | "미완주" | ✅ |

→ **기능 자체는 의도대로 작동. 하지만 "완주 기준"이 모호함 (문서에 명시 필요).**

---

## 🎓 7. 종합 평가

### 전체 평가 점수

| 항목 | 점수 | 근거 |
|------|------|------|
| **기능 완성도** | 8/10 | 핵심 기능(문제 조회→제출→순환) 정상. 완주 감지, 타이머는 작동하나 세부 로직에 결함. |
| **코드 품질** | 6/10 | 프로젝트 방침 위반(alert), 에러 처리 미흡, 더미 코드 존재. |
| **데이터 안정성** | 5/10 | 정합성 이슈 3건(HIGH). 멀티유저 불가 설계. 테스트 부족. |
| **성능** | 6/10 | O(N) 쿼리, 2초 폴링, 인덱싱 부재. 데이터 증가 시 악화. |
| **UX** | 7/10 | 기본 흐름은 직관적. 에러 처리/로딩 피드백 부족. |
| **테스트** | 4/10 | 통합 테스트는 있으나 커버리지 낮음. FE 테스트 없음. |
| **유지보수성** | 6/10 | 상태 관리 복잡, 타이머 중복, CORS 설정 혼재. |

### 최종 평가

```
현재 상태: 작동하는 프로토타입, 프로덕션 준비 미흡

강점:
✅ 핵심 기능 (Queue 순환) 정상 작동
✅ 원자적 UPDATE로 동시성 고려 (설계 의도는 좋음)
✅ 완주 감지 모달 UI 깔끔함
✅ 타이머 측정 및 저장 기본 기능 있음

약점:
❌ 버그 16건 (HIGH 5건, MEDIUM 6건, LOW 5건)
❌ 데이터 정합성 이슈 3건
❌ 멀티유저 불가 설계
❌ 성능 최적화 필요 (O(N) 쿼리, 인덱싱)
❌ 테스트 커버리지 매우 낮음 (FE 0%, BE 일부)

위험도:
🔴 HIGH: Quiz 삭제 시 진행도 손실, completedStudyLog 감지 불안정성
🔴 HIGH: 원자성 결함, 예외 처리 미흡
🟡 MEDIUM: alert() 잔존, 폴링 경합, 타이머 정확도
```

---

## ✋ 8. 우선 처리 항목 (권장)

### Phase 1 (즉시, HIGH 위험도)
1. ✋ [FE-BUG-1] 에러 시 setCurrentQuiz(null) 추가
2. ✋ [FE-BUG-2] alert() 2건을 ConfirmModal로 교체
3. ✋ [BE-BUG-1] 원자성 결함: resetCompletedCount + incrementCompletedAndSetNextQuiz를 1개 SQL로 합치기
4. ✋ [BE-BUG-2] 전역 예외 핸들러 추가 (@ControllerAdvice)
5. ✋ [DB-1] Quiz 삭제 시 completedCount 보존 로직 추가

### Phase 2 (고중요도, MEDIUM 위험도)
6. [FE-BUG-3] QueueProgressBar 폴링 최적화 (3초 이상 또는 이벤트 기반)
7. [FE-BUG-4] elapsedSeconds 리셋 타이밍 일관성 확보
8. [FE-BUG-5] StudyLogCompleteModal.jsx 삭제
9. [BE-BUG-3] @Transactional 혼용 통일 (모두 Spring)
10. [BE-BUG-4] QuizIntegrationTest에 @ActiveProfiles("test") 추가

### Phase 3 (장기, 설계 개선)
11. [DB-3] quiz_attempt 테이블 인덱싱 추가
12. [FE-BUG-4] timerStore 제거 또는 기능 구현
13. [FE-BUG-6] pendingCycleComplete + isCycleComplete 상태 단일화
14. [DB-2] completedStudyLog 감지 기준 명확화 (문서화 또는 기준 강화)
15. [DESIGN-1] 멀티유저 아키텍처 검토 (사용자 인증 추가 시)

---

## 📝 부록: 코드 레퍼런스

**FE 주요 파일:**
- `/FE/src/pages/QuizSolvePage.jsx` (메인 로직)
- `/FE/src/components/queue/CompletionQuizzesModal.jsx`
- `/FE/src/api/queue.js` (API 호출)

**BE 주요 파일:**
- `/BE/src/main/kotlin/com/study/app/domain/quiz/QueueService.kt`
- `/BE/src/main/kotlin/com/study/app/domain/quiz/QueueController.kt`
- `/BE/src/main/resources/application.yml`

**DB:**
- `/data/study.db` (SQLite)

---

**평가 완료: 2026-03-14**
