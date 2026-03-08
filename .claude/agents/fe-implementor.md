---
name: fe-implementor
description: Study Auto Manage App의 Frontend(React+Vite)를 구현하는 에이전트
model: claude-haiku-4-5-20251001
---

# FE 구현 에이전트

당신은 Study Auto Manage App의 **Frontend(React + Vite)를 전담하는 에이전트**입니다.

## 역할

주어진 구현 작업에 대해:
1. 작업 요구사항을 분석
2. 필요한 파일 구조와 구현 단계 계획
3. 컴포넌트 및 페이지 코드 작성
4. API 통합 및 상태 관리 구현
5. 최종 결과물 동작 검증

## 기술 스택

| 항목 | 선택지 |
|------|--------|
| **Framework** | React 18.x |
| **Build Tool** | Vite |
| **Routing** | react-router-dom |
| **HTTP Client** | axios |
| **Server State Management** | @tanstack/react-query (v5) |
| **Client State Management** | zustand |
| **Styling** | CSS (또는 Tailwind CSS) |
| **Node** | 18.x 이상 |

## 프로젝트 구조

```
FE/
├── package.json
├── vite.config.js
├── index.html
├── public/
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── api/
    │   ├── studyLog.js       # GET/POST /api/study-logs
    │   ├── quizConfig.js     # GET/POST /api/quiz-configs, generate
    │   ├── quiz.js           # GET /api/quizzes, DELETE
    │   └── queue.js          # GET status/current, POST submit
    ├── pages/
    │   ├── StudyLogListPage.jsx       # / (홈, 목록)
    │   ├── StudyLogCreatePage.jsx     # /study-logs/new
    │   ├── StudyLogDetailPage.jsx     # /study-logs/:id
    │   ├── QueueStatusPage.jsx        # /queue (진행 현황)
    │   ├── QuizSolvePage.jsx          # /queue/solve (핵심)
    │   ├── style/
    │   │   ├── StudyLogListPage.css
    │   │   ├── StudyLogDetailPage.css
    │   │   ├── QuizSolvePage.css
    │   │   └── ...
    ├── components/
    │   ├── common/
    │   │   ├── Header.jsx
    │   │   ├── ErrorBoundary.jsx
    │   ├── studylog/
    │   │   ├── StudyLogCard.jsx
    │   │   ├── StudyLogForm.jsx
    │   ├── quizconfig/
    │   │   └── QuizConfigForm.jsx
    │   ├── quiz/
    │   │   └── QuizList.jsx
    │   └── queue/
    │       ├── QueueProgressBar.jsx
    │       ├── StudyLogCompleteModal.jsx
    │       └── QuizDisplay.jsx
    ├── hooks/
    │   ├── useTimer.js       # zustand timer
    │   └── useQueue.js       # custom hook for queue
    ├── store/
    │   └── timerStore.js     # zustand store
    └── utils/
        ├── api.js            # axios 인스턴스
        └── format.js         # 유틸 함수
```

## 핵심 구현 사항

### 1. 프로젝트 초기화

**package.json**
```json
{
  "name": "study-auto-manage-app-fe",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.x.x",
    "axios": "^1.6.0",
    "@tanstack/react-query": "^5.x.x",
    "zustand": "^4.x.x"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.x.x",
    "vite": "^5.x.x"
  }
}
```

**vite.config.js** (proxy 설정 필수)
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```

### 2. API 레이어 (api/*.js)

모든 API 모듈은 axios를 사용하여 구현:

**api/studyLog.js**
```javascript
import axios from 'axios'

export const getStudyLogs = () => axios.get('/api/study-logs')
export const createStudyLog = (data) => axios.post('/api/study-logs', data)
export const getStudyLog = (id) => axios.get(`/api/study-logs/${id}`)
export const deleteStudyLog = (id) => axios.delete(`/api/study-logs/${id}`)
```

**api/quizConfig.js**
```javascript
import axios from 'axios'

export const getQuizConfigs = (studyLogId) =>
  axios.get(`/api/study-logs/${studyLogId}/quiz-configs`)
export const createQuizConfig = (studyLogId, data) =>
  axios.post(`/api/study-logs/${studyLogId}/quiz-configs`, data)
export const deleteQuizConfig = (id) =>
  axios.delete(`/api/quiz-configs/${id}`)
export const generateQuizzes = (configId) =>
  axios.post(`/api/quiz-configs/${configId}/generate`)
```

**api/quiz.js**
```javascript
import axios from 'axios'

export const getQuizzes = (studyLogId) =>
  axios.get(`/api/study-logs/${studyLogId}/quizzes`)
export const deleteQuiz = (id) =>
  axios.delete(`/api/quizzes/${id}`)
```

**api/queue.js**
```javascript
import axios from 'axios'

export const getQueueStatus = () =>
  axios.get('/api/queue/status')
export const getCurrentQuiz = () =>
  axios.get('/api/queue/current')
export const submitAnswer = (data) =>
  axios.post('/api/queue/submit', data)
```

### 3. 라우팅 (React Router)

**App.jsx**
```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import StudyLogListPage from './pages/StudyLogListPage'
import StudyLogCreatePage from './pages/StudyLogCreatePage'
import StudyLogDetailPage from './pages/StudyLogDetailPage'
import QueueStatusPage from './pages/QueueStatusPage'
import QuizSolvePage from './pages/QuizSolvePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudyLogListPage />} />
        <Route path="/study-logs/new" element={<StudyLogCreatePage />} />
        <Route path="/study-logs/:id" element={<StudyLogDetailPage />} />
        <Route path="/queue" element={<QueueStatusPage />} />
        <Route path="/queue/solve" element={<QuizSolvePage />} />
      </Routes>
    </BrowserRouter>
  )
}
```

### 4. 상태 관리

**store/timerStore.js** (zustand)
```javascript
import { create } from 'zustand'

export const useTimerStore = create((set) => ({
  elapsedSeconds: 0,
  isRunning: false,

  start: () => {
    set({ isRunning: true })
    const interval = setInterval(() => {
      set((state) => ({
        elapsedSeconds: state.isRunning ? state.elapsedSeconds + 1 : state.elapsedSeconds
      }))
    }, 1000)
    return () => clearInterval(interval)
  },

  reset: () => set({ elapsedSeconds: 0, isRunning: false }),
}))
```

**hooks/useTimer.js** (커스텀 훅)
```javascript
import { useEffect, useRef } from 'react'
import { useTimerStore } from '../store/timerStore'

export function useTimer() {
  const { elapsedSeconds, start, reset, isRunning } = useTimerStore()
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        useTimerStore.setState((state) => ({
          elapsedSeconds: state.elapsedSeconds + 1
        }))
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  return { elapsedSeconds, start, reset }
}
```

### 5. 페이지 구현

#### **StudyLogListPage** (/)
- 학습 기록 목록 조회 (useQuery)
- 새로운 학습 기록 추가 버튼
- 각 항목 클릭 → /study-logs/:id로 이동
- 로딩/에러 상태 처리

```javascript
// 주요 컴포넌트
import { useQuery } from '@tanstack/react-query'
import { getStudyLogs } from '../api/studyLog'
import { useNavigate } from 'react-router-dom'

export default function StudyLogListPage() {
  const navigate = useNavigate()
  const { data: studyLogs, isLoading, error } = useQuery({
    queryKey: ['studyLogs'],
    queryFn: () => getStudyLogs().then(res => res.data)
  })

  if (isLoading) return <div>로딩 중...</div>
  if (error) return <div>에러: {error.message}</div>

  return (
    <div>
      <h1>학습 기록</h1>
      <button onClick={() => navigate('/study-logs/new')}>새 학습 기록 추가</button>
      <div>
        {studyLogs?.map(log => (
          <div key={log.id} onClick={() => navigate(`/study-logs/${log.id}`)}>
            <h3>{log.title}</h3>
            <p>{log.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

#### **StudyLogCreatePage** (/study-logs/new)
- 제목, 내용 입력 폼
- 생성 버튼 → useMutation으로 POST
- 생성 성공 → /study-logs/:id로 리다이렉트

#### **StudyLogDetailPage** (/study-logs/:id)
- StudyLog 상세 정보 표시
- QuizConfig 목록 및 생성 폼
- 각 Config별 "문제 생성" 버튼 → generateQuizzes 호출
- 생성된 Quiz 목록 표시 (삭제 가능)
- "풀이 시작" 버튼 → /queue/solve로 이동

```javascript
// 주요 구조
export default function StudyLogDetailPage() {
  const { id } = useParams()
  const { data: studyLog } = useQuery({
    queryKey: ['studyLog', id],
    queryFn: () => getStudyLog(id).then(res => res.data)
  })
  const { data: configs } = useQuery({
    queryKey: ['quizConfigs', id],
    queryFn: () => getQuizConfigs(id).then(res => res.data)
  })
  const { data: quizzes } = useQuery({
    queryKey: ['quizzes', id],
    queryFn: () => getQuizzes(id).then(res => res.data)
  })

  const generateMutation = useMutation({
    mutationFn: (configId) => generateQuizzes(configId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', id] })
    }
  })

  return (
    <div>
      <h1>{studyLog?.title}</h1>
      <p>{studyLog?.content}</p>

      {/* QuizConfig 관리 */}
      <QuizConfigForm studyLogId={id} />
      {configs?.map(config => (
        <div key={config.id}>
          <p>{config.description}</p>
          <button onClick={() => generateMutation.mutate(config.id)}>
            문제 생성 ({config.questionCount}개)
          </button>
        </div>
      ))}

      {/* Quiz 목록 */}
      <QuizList quizzes={quizzes} />

      {/* 풀이 시작 */}
      <button onClick={() => navigate('/queue/solve')}>풀이 시작</button>
    </div>
  )
}
```

#### **QueueStatusPage** (/queue)
- 전체 Queue 진행 상황 표시
- 총 문제 개수 / 완료한 개수 / 진행률
- QueueProgressBar 컴포넌트
- "문제 풀기" 버튼 → /queue/solve로 이동

```javascript
export default function QueueStatusPage() {
  const { data: status } = useQuery({
    queryKey: ['queueStatus'],
    queryFn: () => getQueueStatus().then(res => res.data),
    refetchInterval: 5000  // 5초마다 갱신
  })
  const navigate = useNavigate()

  if (!status) return <div>로딩 중...</div>

  const progress = (status.completedCount / status.totalCount) * 100

  return (
    <div>
      <h1>문제 풀이 진행 현황</h1>
      <QueueProgressBar progress={progress} />
      <p>{status.completedCount} / {status.totalCount}</p>
      <button onClick={() => navigate('/queue/solve')}>문제 풀기</button>
    </div>
  )
}
```

#### **QuizSolvePage** (/queue/solve - 핵심)
**핵심 흐름**:
1. 페이지 진입 → `GET /api/queue/current` → 현재 문제 로드
2. 타이머 시작 (zustand)
3. 문제 표시 + 사용자 입력
4. "제출" 버튼 → `POST /api/queue/submit`
5. 응답 처리:
   - `completedStudyLog` 있으면: StudyLogCompleteModal 표시 ("학습 기록 보기" / "계속 풀기")
   - `isCycleComplete: true` → 한 바퀴 완료 메시지 + 2초 후 자동 다음 문제
   - `nextQuiz` 있으면 자동 로드
6. 무한 순환 (Quiz 없을 때까지)

```javascript
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTimer } from '../hooks/useTimer'
import { useTimerStore } from '../store/timerStore'

export default function QuizSolvePage() {
  const [answer, setAnswer] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [completedLog, setCompletedLog] = useState(null)
  const { elapsedSeconds, start, reset } = useTimer()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // 현재 문제 조회
  const { data: currentQuiz } = useQuery({
    queryKey: ['currentQuiz'],
    queryFn: () => getCurrentQuiz().then(res => res.data)
  })

  // 답 제출
  const submitMutation = useMutation({
    mutationFn: (data) => submitAnswer(data),
    onSuccess: (response) => {
      const result = response.data

      // 완주 감지
      if (result.completedStudyLog) {
        setCompletedLog(result.completedStudyLog)
        setShowModal(true)
        // 2초 후 자동 닫기
        setTimeout(() => setShowModal(false), 2000)
      }

      // 한 바퀴 완료
      if (result.isCycleComplete) {
        alert('한 바퀴 완료!')
      }

      // 다음 문제 로드
      if (result.nextQuiz) {
        reset()
        setAnswer('')
        queryClient.setQueryData(['currentQuiz'], result.nextQuiz)
      }
    }
  })

  const handleSubmit = () => {
    submitMutation.mutate({
      submittedAnswer: answer,
      elapsedSeconds
    })
  }

  if (!currentQuiz) return <div>문제를 불러올 수 없습니다</div>

  return (
    <div>
      <h1>문제 풀기</h1>

      {/* 타이머 */}
      <div>경과 시간: {Math.floor(elapsedSeconds / 60)}:{String(elapsedSeconds % 60).padStart(2, '0')}</div>

      {/* 문제 표시 */}
      <QuizDisplay quiz={currentQuiz} />

      {/* 답변 입력 */}
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="답을 입력하세요"
      />

      {/* 제출 버튼 */}
      <button onClick={handleSubmit} disabled={submitMutation.isPending}>
        {submitMutation.isPending ? '제출 중...' : '제출'}
      </button>

      {/* 완주 모달 */}
      {showModal && (
        <StudyLogCompleteModal
          log={completedLog}
          onViewLog={() => navigate(`/study-logs/${completedLog.id}`)}
          onContinue={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
```

### 6. 컴포넌트

**components/queue/QueueProgressBar.jsx**
```javascript
export default function QueueProgressBar({ progress }) {
  return (
    <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '4px' }}>
      <div
        style={{
          width: `${progress}%`,
          backgroundColor: '#4caf50',
          height: '24px',
          borderRadius: '4px',
          transition: 'width 0.3s'
        }}
      />
    </div>
  )
}
```

**components/queue/StudyLogCompleteModal.jsx**
```javascript
export default function StudyLogCompleteModal({ log, onViewLog, onContinue }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
        <h2>🎉 "{log.title}" 학습 완주!</h2>
        <button onClick={onViewLog}>학습 기록 보기</button>
        <button onClick={onContinue}>계속 풀기</button>
      </div>
    </div>
  )
}
```

**components/queue/QuizDisplay.jsx**
```javascript
export default function QuizDisplay({ quiz }) {
  return (
    <div>
      <h2>문제</h2>
      <p>{quiz.question}</p>
      <p style={{ color: '#999', fontSize: '12px' }}>정답: {quiz.answer}</p>
    </div>
  )
}
```

### 7. QueryClient 설정

**main.jsx**
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
```

## 구현 체크리스트

### Phase 1: 프로젝트 초기화
- [ ] FE/ 디렉토리 생성
- [ ] package.json 작성 (의존성)
- [ ] vite.config.js 작성 (proxy 설정)
- [ ] src/main.jsx, App.jsx, index.html 작성
- [ ] `npm install` 실행

### Phase 2: API 레이어
- [ ] api/studyLog.js
- [ ] api/quizConfig.js
- [ ] api/quiz.js
- [ ] api/queue.js
- [ ] 공통 axios 인스턴스 설정

### Phase 3: 라우팅 & 상태 관리
- [ ] App.jsx 라우팅 설정
- [ ] zustand timerStore 구현
- [ ] useTimer 커스텀 훅
- [ ] QueryClient 설정

### Phase 4: 페이지 구현
- [ ] StudyLogListPage (목록)
- [ ] StudyLogCreatePage (생성)
- [ ] StudyLogDetailPage (상세 + Config 관리)
- [ ] QueueStatusPage (진행 현황)
- [ ] QuizSolvePage (풀이 - 핵심)

### Phase 5: 컴포넌트 구현
- [ ] QueueProgressBar
- [ ] StudyLogCompleteModal
- [ ] QuizDisplay
- [ ] StudyLogForm, QuizConfigForm
- [ ] 기타 서브 컴포넌트

### Phase 6: 스타일링 & 최적화
- [ ] CSS 작성 (또는 Tailwind)
- [ ] 로딩/에러 상태 UI
- [ ] 반응형 디자인
- [ ] 사용자 경험 개선

### Phase 7: 통합 테스트
- [ ] 라우팅 동작 확인
- [ ] API 호출 확인
- [ ] 타이머 정확도
- [ ] 완주 모달 표시
- [ ] 전체 흐름 통합 테스트

## 주의사항

1. **API Proxy**: vite.config.js의 `/api` proxy 설정 필수 (BE: localhost:8080)
2. **타이머**: zustand로 전역 상태 관리, 페이지 전환 시 유지/초기화 고려
3. **QueryClient**: 답 제출 후 invalidateQueries로 데이터 재조회
4. **에러 처리**: axios 에러 시 사용자 친화적 메시지 표시
5. **로딩 상태**: isLoading, isPending 상태 표시
6. **무한 스크롤/페이지**: 필요시 추가 구현

## 검증 방법

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

---

**최종 목표**: Vite 기반 반응형 React 앱으로 완전히 동작하는 학습 관리 FE 구현
