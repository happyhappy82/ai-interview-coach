# 프로젝트 초기 설정 가이드

이 문서는 AI 면접 코치 프로젝트를 처음 설정하는 개발자를 위한 단계별 가이드입니다.

## Step 1: Supabase 프로젝트 생성

### 1-1. 프로젝트 생성
1. [Supabase](https://supabase.com) 접속 및 로그인
2. "New Project" 클릭
3. 프로젝트 이름 입력 (예: `ai-interview-coach`)
4. 데이터베이스 비밀번호 설정 (안전하게 보관!)
5. Region 선택 (한국: Northeast Asia - Seoul 권장)
6. "Create new project" 클릭 (약 2분 소요)

### 1-2. API 키 복사
1. 프로젝트 생성 완료 후 좌측 메뉴 "Settings" > "API" 클릭
2. 다음 정보 복사:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (긴 문자열)

### 1-3. 환경 변수 설정
프로젝트 루트의 `.env.local` 파일을 열어 복사한 값 붙여넣기:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 2: 데이터베이스 스키마 생성

### 2-1. SQL Editor에서 스키마 실행
1. Supabase Dashboard 좌측 메뉴 "SQL Editor" 클릭
2. "New query" 버튼 클릭
3. `supabase/schema.sql` 파일의 내용 전체를 복사하여 붙여넣기
4. "Run" 버튼 클릭 (우측 하단)
5. 성공 메시지 확인: "Success. No rows returned"

### 2-2. 테이블 생성 확인
1. 좌측 메뉴 "Table Editor" 클릭
2. 다음 테이블들이 생성되었는지 확인:
   - `profiles`
   - `system_prompts` (3개의 초기 데이터 포함)
   - `questions` (6개의 초기 질문 포함)
   - `interview_results`

---

## Step 3: Storage 버킷 생성

### 3-1. 버킷 생성
1. 좌측 메뉴 "Storage" 클릭
2. "Create a new bucket" 버튼 클릭
3. Bucket 정보 입력:
   - **Name**: `interviews`
   - **Public bucket**: OFF (체크 해제)
4. "Create bucket" 클릭

### 3-2. Storage 정책 설정
1. 생성한 `interviews` 버킷 클릭
2. 상단 "Policies" 탭 클릭
3. "New Policy" 클릭하여 다음 2개의 정책 추가:

**정책 1: 업로드 권한**
```sql
-- Policy name: Authenticated users can upload
-- Target roles: authenticated
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'interviews'
  AND auth.role() = 'authenticated'
);
```

**정책 2: 본인 파일 읽기**
```sql
-- Policy name: Users can view own files
-- Target roles: authenticated
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'interviews'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## Step 4: Google OAuth 설정

### 4-1. Google Cloud Console
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "APIs & Services" > "Credentials" 이동
4. "Create Credentials" > "OAuth 2.0 Client IDs" 선택
5. Application type: "Web application"
6. Authorized redirect URIs 추가:
   ```
   https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
   ```
7. "Create" 클릭하여 Client ID와 Client Secret 복사

### 4-2. Supabase에 Google Provider 연동
1. Supabase Dashboard > "Authentication" > "Providers"
2. "Google" 찾아서 클릭
3. "Enable Google provider" 토글 ON
4. Google Cloud Console에서 복사한 값 입력:
   - **Client ID**: `xxxxx.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xxxxx`
5. "Save" 클릭

---

## Step 5: Gemini API 키 발급

### 5-1. API 키 생성
1. [Google AI Studio](https://aistudio.google.com/app/apikey) 접속
2. "Create API Key" 클릭
3. 프로젝트 선택 (또는 새로 생성)
4. 생성된 API 키 복사

### 5-2. 환경 변수에 추가
`.env.local` 파일에 추가:
```bash
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## Step 6: 첫 Admin 계정 생성

### 6-1. 테스트 계정으로 가입
1. 개발 서버 실행:
   ```bash
   npm run dev
   ```
2. 브라우저에서 http://localhost:3002 접속
3. "Google로 시작하기" 버튼 클릭하여 로그인

### 6-2. Admin 권한 부여
1. Supabase Dashboard > "Table Editor" > "profiles" 테이블
2. 방금 생성된 본인의 계정 찾기 (email 확인)
3. `role` 컬럼 값을 `user` → `admin`으로 수정
4. "Save" 클릭

### 6-3. Admin 페이지 접근 확인
1. 브라우저에서 http://localhost:3002/admin 접속
2. 정상적으로 관리자 대시보드가 보이면 성공!

---

## Step 7: 개발 서버 실행

```bash
# 패키지 설치 (최초 1회)
npm install

# 개발 서버 시작
npm run dev
```

브라우저에서 http://localhost:3002 접속

---

## 트러블슈팅

### 문제: "Invalid API key" 에러
- `.env.local` 파일의 API 키가 정확한지 확인
- 개발 서버 재시작 (환경 변수 변경 후 필수)

### 문제: 로그인 후 리다이렉트 에러
- Supabase > Authentication > URL Configuration 확인
- Site URL: `http://localhost:3002`
- Redirect URLs: `http://localhost:3002/**`

### 문제: RLS 정책 에러
- SQL Editor에서 `supabase/schema.sql` 전체를 다시 실행
- 각 테이블의 RLS가 활성화되었는지 확인

---

## 다음 단계

설정이 완료되면 다음 기능을 개발할 수 있습니다:
- ✅ Google OAuth 로그인
- ✅ LiveOps 프롬프트 시스템
- 🚧 면접 녹음 및 업로드
- 🚧 Gemini AI 분석
- 🚧 결과 리포트 페이지

개발 중 문제가 발생하면 `README.md`와 각 문서(`plan.md`, `tech_spec.md` 등)를 참고하세요.
