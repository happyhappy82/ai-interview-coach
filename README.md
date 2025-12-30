# AI 면접 코치 (AI Interview Coach)

🎯 **실전과 유사한 AI 면접 경험으로 취업 합격률을 높이는 High-End SaaS**

> **프로젝트 상태**: ✅ 프로덕션 준비 완료 (2025-12-30)

---

## 핵심 차별점 (Key Features)

### 🔥 LiveOps Architecture
- **앱 재배포 없이 AI 프롬프트 실시간 수정**
- 관리자가 DB만 수정하면 전세계 모든 사용자에게 즉시 반영
- `system_prompts` 테이블 기반 동적 프롬프트 로딩

### 🛡️ Defensive Coding (100% 완료)
- 8개 예외 시나리오 완벽 대응
- 마이크 권한 거부, Safari 호환성, 네트워크 단절 등
- IndexedDB 기반 오프라인 백업
- 10초 단위 청크 저장으로 브라우저 강제 종료 시 복구

### 🎙️ 실시간 음성 인식 (STT)
- Web Speech API 활용
- 녹음과 동시에 실시간 텍스트 변환
- 한국어 음성 인식 지원

### 🤖 AI 분석 (Gemini API)
- LiveOps 프롬프트 기반 맞춤형 분석
- JSON 형식 피드백 (잘한 점, 개선할 점, 핵심 키워드)
- DB 자동 저장 및 히스토리 관리

### ✨ Premium UI/UX
- shadcn/ui + Tailwind CSS 기반 전문적인 디자인
- Deep Indigo (#4F46E5) 컬러 시스템
- Framer Motion 자연스러운 애니메이션
- 완벽한 모바일 반응형

## 기술 스택 (Tech Stack)

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth, Postgres, Storage)
- **AI**: Google Gemini API
- **Icons**: Lucide React
- **Motion**: Framer Motion

## 프로젝트 구조 (Project Structure)

```
ai-interview-coach/
├── app/
│   ├── (marketing)/      # 랜딩 페이지 (Public)
│   ├── (user)/           # 일반 사용자 대시보드 (Private)
│   │   ├── interview/    # 면접/녹음 화면
│   │   └── result/       # 결과 리포트
│   ├── (admin)/          # 관리자 전용 (Protected)
│   │   └── prompts/      # 프롬프트 수정 페이지
│   └── api/              # Route Handlers
├── components/
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── interview/        # 녹음기, 타이머, 파형 UI
│   └── admin/            # 어드민 전용 UI
├── lib/
│   ├── supabase/         # Supabase 클라이언트
│   └── utils.ts          # 유틸리티 함수
└── middleware.ts         # 보안 문지기 (Admin 권한 체크)
```

## 시작하기 (Getting Started)

### 1. 환경 변수 설정

`.env.example` 파일을 `.env.local`로 복사하고 값을 채워주세요:

```bash
cp .env.example .env.local
```

### 2. 패키지 설치

```bash
npm install
```

### 3. Supabase 데이터베이스 설정

`database_schema.md` 파일을 참고하여 Supabase SQL Editor에서 테이블을 생성하세요.

필수 테이블:
- `profiles` - 사용자 프로필 및 역할 관리
- `system_prompts` - LiveOps 프롬프트 관리
- `questions` - 면접 질문 은행
- `interview_results` - 면접 결과 및 AI 피드백

Storage 버킷:
- `interviews` - 녹음 파일 저장

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어주세요.

## 개발 진행 현황

### ✅ Phase 1: 기반 및 보안 (완료)
- [x] shadcn/ui 초기화 및 테마 적용
- [x] Middleware 기반 Admin 권한 체크
- [x] Google OAuth 로그인 구현

### ✅ Phase 2: LiveOps 프롬프트 시스템 (완료)
- [x] system_prompts 테이블 연동
- [x] DB 기반 동적 프롬프트 로딩
- [x] Admin 프롬프트 수정 UI
- [x] 앱 재배포 없는 실시간 업데이트

### ✅ Phase 3: 면접 코어 (완료)
- [x] 마이크 녹음 구현 (방어 코드 100%)
- [x] Safari/Chrome 호환성 처리
- [x] 인앱 브라우저 차단
- [x] Storage 업로드 구현
- [x] Wake Lock API (화면 꺼짐 방지)
- [x] IndexedDB 청크 저장

### ✅ Phase 4: AI 분석 및 최종 완성 (완료)
- [x] 실시간 음성 인식 (STT)
- [x] Gemini API 연동
- [x] JSON 파싱 및 결과 시각화
- [x] DB 결과 저장
- [x] 실제 데이터 기반 결과 페이지
- [x] 대시보드 통계

**완료율: 100%** 🎉

## 참고 문서 (Documentation)

### 설계 문서
- `plan.md` - 프로젝트 전체 플랜 및 사용자 흐름
- `tech_spec.md` - 기술 스펙 및 UI/UX 가이드라인
- `database_schema.md` - 데이터베이스 스키마 설계
- `scenarios.md` - 예외 처리 및 Edge Cases
- `checklist.md` - 개발 및 배포 체크리스트

### 개발 진행 문서
- `PHASE_2_COMPLETE.md` - LiveOps 프롬프트 시스템 완료
- `PHASE_3_COMPLETE.md` - 면접 코어 기능 완료
- `PHASE_4_COMPLETE.md` - AI 분석 및 최종 완성

### 초기 설정
- `SETUP.md` - Supabase, Google OAuth, Gemini API 설정 가이드

---

## 프로젝트 하이라이트

### 🏗️ 아키텍처
- Next.js 14 App Router + TypeScript (Strict Mode)
- Supabase (Auth, Database, Storage)
- Gemini API (AI 분석)
- LiveOps 기반 동적 프롬프트 시스템

### 📊 통계
- **총 라우트**: 16개
- **API 엔드포인트**: 9개
- **방어 코드 적용률**: 100% (8/8 시나리오)
- **빌드 상태**: ✅ 성공

### 🎨 UI 컴포넌트
- shadcn/ui 기반 10+ 컴포넌트
- 완전한 모바일 반응형
- 다크 모드 지원 (준비됨)

---

## 라이선스 (License)

이 프로젝트는 교육 및 개인 용도로 제작되었습니다.

---

**Built with ❤️ by Vibe Coding**
