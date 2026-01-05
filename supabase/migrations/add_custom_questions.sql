-- questions 테이블에 커스텀 질문 기능 추가

-- 1. evaluation_context 컬럼 추가 (각 질문의 평가 기준)
ALTER TABLE questions
ADD COLUMN IF NOT EXISTS evaluation_context TEXT DEFAULT '이 질문에 대한 답변을 STAR 기법(Situation, Task, Action, Result)에 따라 평가하세요. 구체성, 논리성, 진정성을 중점적으로 분석해주세요.';

-- 2. user_id 컬럼 추가 (커스텀 질문 소유자)
ALTER TABLE questions
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. is_custom 컬럼 추가 (커스텀 질문 여부)
ALTER TABLE questions
ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT FALSE;

-- 4. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_category_custom ON questions(category, is_custom);

-- 5. RLS 정책 추가 (사용자는 자신의 커스텀 질문만 수정/삭제 가능)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 기본 질문 및 자신의 커스텀 질문 조회 가능
CREATE POLICY "Users can view default and own custom questions"
ON questions FOR SELECT
TO authenticated
USING (
  is_custom = FALSE OR user_id = auth.uid()
);

-- 사용자는 자신의 커스텀 질문만 생성 가능
CREATE POLICY "Users can create own custom questions"
ON questions FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND is_custom = TRUE
);

-- 사용자는 자신의 커스텀 질문만 수정 가능
CREATE POLICY "Users can update own custom questions"
ON questions FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND is_custom = TRUE)
WITH CHECK (user_id = auth.uid() AND is_custom = TRUE);

-- 사용자는 자신의 커스텀 질문만 삭제 가능
CREATE POLICY "Users can delete own custom questions"
ON questions FOR DELETE
TO authenticated
USING (user_id = auth.uid() AND is_custom = TRUE);
