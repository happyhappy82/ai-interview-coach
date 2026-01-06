-- =============================================
-- Hidden Questions 테이블 생성 (질문 숨김 기능)
-- =============================================

-- 숨긴 질문을 저장하는 junction 테이블
CREATE TABLE IF NOT EXISTS public.hidden_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    hidden_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(user_id, question_id)
);

-- 인덱스 생성 (빠른 조회를 위한 복합 인덱스)
CREATE INDEX IF NOT EXISTS idx_hidden_questions_user_question
ON public.hidden_questions(user_id, question_id);

-- RLS (Row Level Security) 활성화
ALTER TABLE public.hidden_questions ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성 (이미 존재하면 무시)
DO $$
BEGIN
  -- 정책 1: 사용자는 자신이 숨긴 질문만 조회
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'hidden_questions'
    AND policyname = 'Users can view own hidden questions'
  ) THEN
    CREATE POLICY "Users can view own hidden questions"
    ON public.hidden_questions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  -- 정책 2: 사용자는 질문을 숨길 수 있음 (INSERT)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'hidden_questions'
    AND policyname = 'Users can hide questions'
  ) THEN
    CREATE POLICY "Users can hide questions"
    ON public.hidden_questions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- 정책 3: 사용자는 숨긴 질문을 다시 표시할 수 있음 (DELETE)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'hidden_questions'
    AND policyname = 'Users can unhide questions'
  ) THEN
    CREATE POLICY "Users can unhide questions"
    ON public.hidden_questions FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- 완료!
COMMENT ON TABLE public.hidden_questions IS '사용자가 숨긴 질문 목록 (Soft Delete)';
