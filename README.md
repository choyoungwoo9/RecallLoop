# 🎯 Recall Loop

> **무한 학습의 순환** — 학습 내용을 기록하면, AI가 문제를 만들고, 앱이 최적의 타이밍에 반복 학습을 도와줍니다.

<div align="center">

![Recall Loop Logo](/FE/src/assets/logo.svg)

[![Spring Boot 3.5](https://img.shields.io/badge/Spring%20Boot-3.5.0-brightgreen?logo=spring)](https://spring.io/projects/spring-boot)
[![React 18](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)
[![SQLite](https://img.shields.io/badge/SQLite-3-blue?logo=sqlite)](https://www.sqlite.org)
[![Gemini API](https://img.shields.io/badge/Google%20Gemini-API-orange)](https://ai.google.dev)

</div>

---

## ✨ 주요 특징

### 🧠 스마트 학습 시스템
- **AI 기반 문제 자동 생성**: Google Gemini API가 학습 내용에서 자동으로 문제를 생성
- **순환 Queue 방식**: 전체 문제를 반복적으로 순환하면서 최적의 학습 간격 제공
- **학습 완주 감지**: 특정 학습 기록의 모든 문제를 풀었을 때 자동 감지

### ⏱️ 효율적인 학습 추적
- **개인 타이머**: 각 문제당 소요 시간을 자동으로 측정
- **진행률 시각화**: 현재 학습 진행 상황을 한눈에 파악 (진행률 바, 퍼센티지)
- **누적 통계**: 학습 기록별 시도 횟수 및 성능 추적

### 🎨 사용자 친화적 인터페이스
- **깔끔한 UI/UX**: 시각적 계층 구조가 명확한 모던 디자인
- **반응형 레이아웃**: 모바일, 태블릿, 데스크톱 모두 최적화
- **직관적 네비게이션**: 헤더 기반 네비게이션으로 언제든 빠른 접근

### 🏗️ 견고한 아키텍처
- **DB 기반 Queue**: 메모리가 아닌 데이터베이스에서 원자적 업데이트로 동시성 안전성 보장
- **RESTful API**: 명확한 엔드포인트로 FE/BE 분리
- **트랜잭션 관리**: 학습 데이터 무결성 보장

---

## 📸 스크린샷

### 학습 현황 대시보드
진행률 바, 현재 문제, 타이머가 한눈에 보이는 학습 페이지
```
┌─────────────────────────────────────────┐
│  이번 사이클                              │
│  1 / 14 인문                             │
│  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░ 7%        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Spring Boot 기초                 00:46   │
│                                         │
│ ┌──────────────────────────────────────┐│
│ │ Q1. Spring Boot는 사용하던 어떤      ││
│ │     종류의 API 개발이 쉬워지나요?    ││
│ └──────────────────────────────────────┘│
│                                         │
│ 답변 *                                  │
│ ┌──────────────────────────────────────┐│
│ │ 여기에 답변을 입력하세요              ││
│ └──────────────────────────────────────┘│
│                  [제출하기]             │
└─────────────────────────────────────────┘
```

### 학습 기록 목록
생성한 학습 기록들을 카드 형식으로 관리
- Spring Boot 기초 (3개 문제)
- Gemini 테스트 (2개 문제)
- Vue.js 완벽 가이드 (2개 문제)
- 등등...

### 학습 기록 상세
탭으로 구분된 학습 콘텐츠, 생성된 문제, 설정 관리
- **학습 내용 탭**: 학습 기록의 원본 콘텐츠 확인
- **생성된 문제 탭**: AI가 생성한 모든 문제와 답변 확인
- **문제 설정 탭**: 문제 개수, 설명 등의 생성 설정 관리

### 문제 생성
AI가 학습 내용을 분석해 자동으로 문제 생성
- 설명: "핵심 개념 정리"
- 문제 개수: 5개
- [설정 추가] 버튼으로 언제든 추가 생성 가능

---

## 🚀 시작하기

### 필수 요구사항
- **Node.js** 18+ (FE)
- **Java** 17+ (BE)
- **SQLite** 3.44.1+ (DB)
- **Google Gemini API Key** (AI 기능)

### 설치 및 실행

#### 1️⃣ 프로젝트 클론
```bash
git clone https://github.com/yourusername/recall-loop.git
cd recall-loop
```

#### 2️⃣ 백엔드 설정 (Spring Boot)
```bash
cd BE

# 환경변수 설정
export GEMINI_API_KEY="your-gemini-api-key"

# 빌드
./gradlew build

# 실행 (포트 8080)
./gradlew bootRun
```

#### 3️⃣ 프론트엔드 설정 (React)
```bash
cd FE

# 의존성 설치
npm install

# 실행 (포트 5177)
npm run dev
```

#### 4️⃣ 브라우저에서 접속
```
http://localhost:5173
```

---

## 📁 프로젝트 구조

```
recall-loop/
├── BE/                           # 백엔드 (Kotlin + Spring Boot)
│   ├── src/main/kotlin/
│   │   └── com/study/app/
│   │       ├── config/           # 설정 (Gemini, CORS, DB)
│   │       └── domain/
│   │           ├── studylog/     # 학습 기록
│   │           ├── quiz/         # 문제 & Queue 시스템
│   │           └── attempt/      # 시도 기록
│   └── build.gradle.kts
│
├── FE/                           # 프론트엔드 (React + Vite)
│   ├── src/
│   │   ├── api/                  # API 호출 모듈
│   │   ├── pages/                # 페이지 컴포넌트
│   │   ├── components/           # 재사용 컴포넌트
│   │   │   ├── common/           # Layout, Header, etc.
│   │   │   ├── studylog/         # 학습 기록 관련
│   │   │   └── queue/            # 문제 풀이 관련
│   │   ├── assets/               # 로고, 이미지
│   │   └── App.jsx
│   └── vite.config.js
│
└── README.md
```

---

## 🔄 핵심 시스템 아키텍처

### Queue 시스템 (학습 순환 관리)
```
[Quiz 1] → [Quiz 2] → [Quiz 3] → ... → [Quiz 14]
   ↓
제출 시 completedCount++
한 바퀴 완료 (completedCount == totalCount) 시 자동 리셋
   ↓
[Quiz 2] → [Quiz 3] → ... → [Quiz 14] → [Quiz 1]
```

**DB 기반 원자적 업데이트**
- `UPDATE queue_state SET completed_count = completed_count + 1` (SQL 직접 실행)
- 메모리 로드/수정 제거로 동시성 안전성 보장

### 학습 완주 감지
```
사용자가 Quiz 제출
   ↓
현재 StudyLog의 모든 Quiz가 attempt되었는지 확인
   ↓
Yes → completedStudyLog 반환 (모달 표시)
No  → 계속 진행
```

### AI 문제 생성
```
사용자가 "문제 생성" 클릭
   ↓
Gemini API 호출 (학습 내용 + 설명 + 개수)
   ↓
JSON 응답 파싱: [{"question": "...", "answer": "..."}, ...]
   ↓
Queue 끝에 문제 append (queueOrder 자동 증가)
   ↓
Queue 재구성 (totalCount 업데이트)
```

---

## 🛠️ 주요 API 엔드포인트

### 학습 기록
| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/study-logs` | 전체 학습 기록 조회 |
| `POST` | `/api/study-logs` | 새로운 학습 기록 작성 |
| `GET` | `/api/study-logs/{id}` | 학습 기록 상세 조회 |
| `DELETE` | `/api/study-logs/{id}` | 학습 기록 삭제 |

### 문제 생성
| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/quiz-configs/{configId}/generate` | AI로 문제 생성 |
| `GET` | `/api/study-logs/{studyLogId}/quizzes` | 학습 기록의 문제 목록 |

### Queue 시스템
| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/queue/status` | Queue 상태 (진행률, 총 개수) |
| `GET` | `/api/queue/current` | 현재 풀어야 할 문제 |
| `POST` | `/api/queue/submit` | 문제 풀이 제출 & 다음 문제로 이동 |
| `POST` | `/api/queue/initialize` | Queue 초기화 |

---

## 📊 데이터 모델

### StudyLog (학습 기록)
```kotlin
data class StudyLog(
    val id: Long,
    val title: String,           // 제목
    val content: String,         // 학습 내용 (마크다운)
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)
```

### Quiz (문제)
```kotlin
data class Quiz(
    val id: Long,
    val quizConfig: QuizConfig,
    val studyLog: StudyLog,      // 역정규화
    val question: String,
    val answer: String,
    val queueOrder: Int          // 전역 고유값 (1~14)
)
```

### QueueState (순환 상태)
```kotlin
data class QueueState(
    val id: Long = 1,            // 항상 1로 고정
    val currentQuiz: Quiz?,       // 현재 풀어야 할 문제
    val totalCount: Int,          // 전체 문제 개수
    val completedCount: Int       // 이번 사이클 완료 개수
)
```

---

## 🎨 색상 팔레트

| 용도 | 색상 | HEX |
|------|------|-----|
| Primary | 진한 파란색 | `#0052CC` |
| Secondary | 청록색 | `#00BFA5` |
| Accent | 빨간색 | `#FF6B6B` |
| Background | 파란색 톤 | `#f5f8fd` |

---

## 🧪 테스트

### 백엔드 테스트
```bash
cd BE
./gradlew test
```

### 프론트엔드 테스트
```bash
cd FE
npm run test
```

---

## 🚢 배포

### 백엔드 배포 (Spring Boot JAR)
```bash
cd BE
./gradlew build
# build/libs/app.jar 생성
java -jar build/libs/app.jar
```

### 프론트엔드 배포 (정적 파일)
```bash
cd FE
npm run build
# dist/ 폴더 → 웹 서버에 배포 (Nginx, Vercel, etc.)
```

---

## 💡 주요 기술 선택

### 왜 이 기술들을 선택했나?

**Spring Boot**
- 엔터프라이즈급 안정성
- 자동 설정으로 빠른 개발
- 트랜잭션 관리 우수

**React + Vite**
- 번개 같은 개발 속도 (HMR)
- 작은 번들 사이즈
- 모던 ES6+ 문법 지원

**SQLite**
- 서버 없이 로컬 DB 관리
- 0 설정으로 즉시 시작
- 전체 학습 데이터 안전 보관

**Gemini API**
- 고성능 텍스트 분석
- 자연스러운 문제 생성
- 한국어 완벽 지원

---

## 🔐 보안

- CORS 설정으로 API 보호
- SQL Injection 방지 (JPA 파라미터 쿼리)
- 사용자 입력 검증

---

## 📈 성능

- **Queue 시스템**: O(1) 조회 및 업데이트 (DB 인덱싱)
- **문제 검색**: O(n) but 캐싱으로 최적화 예정
- **번들 크기**: ~150KB (gzip)

---

## 🗺️ 로드맵

- [ ] 사용자 인증 (로그인/회원가입)
- [ ] 멀티 사용자 지원
- [ ] 학습 통계 및 분석 대시보드
- [ ] 오프라인 모드
- [ ] 모바일 앱 (React Native)
- [ ] 학습 커뮤니티 기능

---

## 📝 라이센스

MIT License - 자유롭게 사용, 수정, 배포 가능

---

## 🤝 기여

버그 리포트, 기능 제안, PR 등 모든 기여를 환영합니다!

```bash
1. Fork the repository
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request
```

---

## 💬 피드백

의견이나 질문이 있으신가요? 이슈를 남겨주세요!

---

<div align="center">

**Made with ❤️ for infinite learning loops**

![visitors](https://visitor-badge.laobi.icu/badge?page_id=study-auto-manage-app)

</div>
