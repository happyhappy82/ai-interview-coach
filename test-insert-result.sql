-- 테스트용 면접 결과 데이터 삽입
-- Supabase SQL Editor에서 실행하세요

-- 먼저 현재 로그인한 사용자 ID 확인
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- 위에서 나온 ID를 복사해서 아래 YOUR_USER_ID 부분에 붙여넣기
-- 예: '12345678-1234-1234-1234-123456789012'

INSERT INTO public.interview_results (user_id, audio_url, ai_feedback)
VALUES (
  'YOUR_USER_ID',  -- ← 여기에 위에서 확인한 user ID 붙여넣기
  'https://example.com/test.mp3',
  '{
    "good": ["테스트 답변 - 구조가 명확했습니다", "자신감 있는 태도가 좋았습니다"],
    "bad": ["좀 더 구체적인 사례가 있으면 좋겠습니다"],
    "keywords": ["테스트", "개발자", "열정"]
  }'::jsonb
);

-- 확인
SELECT * FROM public.interview_results ORDER BY created_at DESC LIMIT 1;
