# Story 5: FE UI/UX 리디자인 (모던하고 깔끔한 디자인)

## 설명
현재 기능을 모두 유지하면서, 전체 FE를 모던하고 깔끔한 디자인으로 리디자인한다. 모바일 반응형, 일관된 색상 팔레트, 부드러운 애니메이션, 직관적인 네비게이션을 제공한다.

## 디자인 시스템
- **Color Palette**:
  - Primary: #3498db (블루)
  - Secondary: #2ecc71 (초록)
  - Accent: #e74c3c (빨강)
  - Background: #f8f9fa (라이트 그레이)
  - Surface: #ffffff (화이트)
  - Text: #2c3e50 (다크)
- **Typography**:
  - Heading: 기울임 없음, Bold (600~700)
  - Body: 정상 (400)
  - Small: 12-14px
- **Spacing**: 8px 단위 (8, 16, 24, 32, 40)
- **Border Radius**: 8px (기본)
- **Shadow**: 0 2px 8px rgba(0,0,0,0.1)

## FE 작업

### 1. Layout & Navigation
- [ ] Layout.jsx: 전체 레이아웃 + 헤더 + 네비게이션 바
  - 로고 + 앱 타이틀
  - 네비게이션: 홈, Queue, 설정 (선택)
  - 반응형 메뉴 (모바일)
- [ ] Header: 하단 경계 분리, 깔끔한 스타일
- [ ] Navigation Bar: 아이콘 + 텍스트

### 2. StudyLogListPage (홈)
- [ ] 헤더 섹션: "내 학습 기록" 제목
- [ ] StudyLogCard.jsx:
  - 카드 디자인 (제목, 내용 미리보기, 생성일, 문제 수)
  - 호버 효과 (섀도우 확대)
  - 클릭 시 상세 페이지로 이동
- [ ] 플로팅 액션 버튼 (FAB): "새 학습 기록" (우측 하단)
- [ ] 그리드 레이아웃 (반응형: 1열 모바일, 2열 태블릿, 3열 데스크탑)
- [ ] 빈 상태: 친절한 메시지 + 생성 버튼

### 3. StudyLogCreatePage
- [ ] 모달 또는 페이지 (URL: /study-logs/new)
- [ ] 폼:
  - 제목 입력 (placeholder: "학습 기록 제목")
  - 내용 입력 (textarea, placeholder: "공부한 내용을 입력하세요")
  - 취소 / 저장 버튼
- [ ] 폼 검증 (필드 필수)
- [ ] 성공 토스트 메시지

### 4. StudyLogDetailPage (학습 기록 상세)
- [ ] 상단: 학습 기록 정보 (제목, 내용, 생성일)
- [ ] 섹션 1: "생성된 문제" (문제 목록)
  - 문제 카드: 질문, 삭제 버튼
- [ ] 섹션 2: "문제 생성 설정"
  - QuizConfig 입력 폼
  - 기존 Config 목록 (삭제 가능)
  - "문제 생성" 버튼 (로딩 상태 표시)
- [ ] 뒤로가기 버튼

### 5. QueueStatusPage (Queue 현황)
- [ ] 상단 배너: "현재 진행 현황"
- [ ] 대형 프로그레스 바 (원형 또는 선형)
  - 중심: completedCount / totalCount
  - 아래: progressPercent (%)
- [ ] 현재 문제 미리보기 카드
- [ ] "문제 풀기" 버튼 (큰 버튼, 중앙)
- [ ] Queue 비어있는 경우: "문제가 없습니다" 안내

### 6. QuizSolvePage (문제 풀기)
- [ ] 헤더:
  - 학습 기록 제목 (좌측)
  - 타이머 (우측, 큰 폰트)
- [ ] 프로그레스 바 (QueueProgressBar) 유지
- [ ] 문제 영역:
  - 배경색: 라이트 블루
  - 큰 폰트, 여백 충분
  - 아이콘 또는 번호 (선택)
- [ ] 답 입력 영역:
  - textarea, 최소 높이 150px
  - placeholder: "여기에 답변을 입력하세요"
- [ ] 버튼:
  - 제출 버튼 (주색상, 큰 버튼)
  - 로딩 상태 스피너
- [ ] 완주 배너: 동적 애니메이션
- [ ] 완주 모달: 깔끔한 디자인

### 7. 공통 컴포넌트
- [ ] Button.jsx: 여러 크기/타입 (primary, secondary, danger)
- [ ] Card.jsx: 재사용 가능한 카드 컴포넌트
- [ ] Modal.jsx: 모달 기본 구조
- [ ] LoadingSpinner.jsx: 로딩 표시
- [ ] Toast.jsx (선택): 알림 토스트
- [ ] Input.jsx: 텍스트 입력 필드
- [ ] Textarea.jsx: 텍스트 영역

### 8. 전역 스타일
- [ ] App.css: 전역 스타일, 색상 변수, 글꼴
- [ ] 반응형 미디어 쿼리 정의
- [ ] 애니메이션: fade-in, slide-in, bounce (선택)

## FE 검증 기준
- ✅ 모든 페이지 로드 및 네비게이션 정상
- ✅ 학습 기록 생성 → 상세 → 문제 생성 → Queue → 풀이 전체 흐름
- ✅ 모바일 반응형 (375px 이상)
- ✅ 애니메이션 부드러움
- ✅ 기존 기능 모두 유지
- ✅ 색상 일관성, 간격 일관성

## 구현 전략
1. Layout 및 전역 스타일 먼저 구성
2. 공통 컴포넌트 작성
3. 각 페이지 리디자인 (홈 → 생성 → 상세 → Queue → 풀이)
4. 반응형 테스트

## 검증 도구
- Chrome DevTools (모바일 시뮬레이션)
- 브라우저 새로고침 후 전체 흐름 테스트
