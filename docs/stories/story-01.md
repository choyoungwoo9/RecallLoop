# Story 1: 프로젝트 초기화

## 설명
BE/FE 프로젝트의 기반 구조를 세팅하여 개발을 시작할 수 있는 환경을 만든다.

## BE 작업
- [x] Gradle 프로젝트 생성 (build.gradle.kts)
- [x] Spring Boot + Kotlin + JPA + SQLite 의존성 설정
- [x] application.yml (SQLite) / application-test.yml (H2) 설정
- [x] GeminiConfig (WebClient Bean), CorsConfig 작성
- [x] 도메인/인프라 디렉토리 구조 생성
- [x] contextLoads 테스트 통과

## FE 작업
- [x] Vite + React 프로젝트 생성 (package.json)
- [x] react-router-dom, axios, @tanstack/react-query, zustand 설치
- [x] vite.config.js /api → http://localhost:8080 proxy 설정
- [x] main.jsx QueryClient + BrowserRouter 설정
- [x] App.jsx 라우트 5개 정의
- [x] src/api/ 레이어 생성 (studyLog.js, quizConfig.js, quiz.js, queue.js)
- [x] src/pages/ 플레이스홀더 5개 생성

## 검증 기준
- BE: `./gradlew build` 성공
- FE: `npm run build` 성공

---
## 완료 요약
- BE Spring Boot 3.5.0 + Kotlin 1.9.25 프로젝트 생성
- FE Vite + React 프로젝트 생성, 의존성 설치 완료
- 39개 파일 커밋 완료
