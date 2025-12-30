-- AI Interview Coach Database Setup
-- Supabase SQL Editor에서 실행하세요

-- 1. profiles 테이블 (사용자 프로필)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. system_prompts 테이블 (LiveOps 프롬프트 관리)
CREATE TABLE IF NOT EXISTS public.system_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. questions 테이블 (질문 은행)
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. interview_results 테이블 (면접 결과 & 피드백)
CREATE TABLE IF NOT EXISTS public.interview_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  audio_url TEXT,
  ai_feedback JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_results ENABLE ROW LEVEL SECURITY;

-- profiles 정책
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- system_prompts 정책 (모든 인증된 사용자가 읽을 수 있음)
CREATE POLICY "Anyone can view active prompts"
  ON public.system_prompts FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can manage prompts"
  ON public.system_prompts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- questions 정책 (모든 인증된 사용자가 읽을 수 있음)
CREATE POLICY "Anyone can view questions"
  ON public.questions FOR SELECT
  TO authenticated
  USING (true);

-- interview_results 정책
CREATE POLICY "Users can view own results"
  ON public.interview_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own results"
  ON public.interview_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger: 새 유저 자동 프로필 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 초기 데이터: 시스템 프롬프트
INSERT INTO public.system_prompts (key_name, content, is_active, description) VALUES
('interviewer_persona', '당신은 경험이 풍부한 HR 면접관입니다. 지원자의 답변을 경청하고, 진정성과 논리성을 평가합니다. 답변이 구체적인지, 경험이 실제로 와닿는지 중점적으로 봅니다.', true, '면접관 페르소나'),
('analysis_rules', '다음 기준으로 답변을 분석하세요:
1. 구조: STAR 기법 활용 여부 (Situation, Task, Action, Result)
2. 진정성: 구체적인 경험과 감정 표현
3. 논리성: 일관된 흐름과 명확한 결론
4. 자신감: 말투와 태도의 확신성', true, 'AI 분석 기준');

-- 초기 데이터: 샘플 질문들
INSERT INTO public.questions (category, title, "order") VALUES
('general', '자기소개를 해주세요.', 1),
('general', '지원 동기는 무엇인가요?', 2),
('general', '본인의 강점과 약점을 말씀해주세요.', 3),
('general', '5년 후 자신의 모습은 어떨 것 같나요?', 4),
('general', '팀 프로젝트에서 갈등을 겪었던 경험이 있나요?', 5),
('general', '실패했던 경험과 그로부터 배운 점을 말씀해주세요.', 6),
('dev', '가장 자랑스러운 프로젝트는 무엇인가요?', 1),
('dev', '기술적으로 어려웠던 문제를 해결한 경험을 말씀해주세요.', 2),
('dev', '새로운 기술을 어떻게 학습하시나요?', 3),
('marketing', '성공적인 마케팅 캠페인 사례를 공유해주세요.', 1),
('marketing', '데이터 기반 의사결정을 한 경험이 있나요?', 2);

-- Storage 버킷 생성 (Supabase Dashboard에서 수동으로 해야 함)
-- 1. Storage > Create Bucket
-- 2. Name: "interviews"
-- 3. Public: false
-- 4. Allowed MIME types: audio/* (선택사항)
