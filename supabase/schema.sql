-- =============================================
-- AI 면접 코치 - Supabase Database Schema
-- =============================================
-- 이 파일을 Supabase SQL Editor에서 실행하세요.

-- 1. profiles 테이블 생성
-- Supabase Auth의 users 테이블과 1:1 매핑
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- profiles 테이블 RLS (Row Level Security) 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로필만 조회 가능
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- 사용자는 자신의 프로필만 수정 가능 (role 제외)
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admin은 모든 프로필 조회 가능
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- 2. system_prompts 테이블 생성 (LiveOps 핵심)
-- =============================================
CREATE TABLE IF NOT EXISTS public.system_prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key_name TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- system_prompts RLS
ALTER TABLE public.system_prompts ENABLE ROW LEVEL SECURITY;

-- 모든 인증된 사용자는 활성화된 프롬프트 조회 가능
CREATE POLICY "Authenticated users can view active prompts"
    ON public.system_prompts FOR SELECT
    USING (is_active = true AND auth.role() = 'authenticated');

-- Admin만 프롬프트 수정 가능
CREATE POLICY "Admins can manage prompts"
    ON public.system_prompts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.system_prompts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 초기 프롬프트 데이터 삽입
INSERT INTO public.system_prompts (key_name, content, description, is_active) VALUES
(
    'interviewer_persona',
    '당신은 10년 경력의 전문 면접관입니다. 따뜻하지만 날카로운 질문으로 지원자의 진정한 역량을 파악합니다. 질문은 간결하고 명확하게 하며, 지원자가 편안하게 답변할 수 있는 분위기를 조성합니다.',
    'AI 면접관의 기본 페르소나',
    true
),
(
    'analysis_rules',
    '면접 답변을 분석할 때 다음 기준을 사용하세요:
1. 구체성: 추상적인 답변보다 구체적인 사례를 높게 평가
2. 논리성: 답변의 구조가 명확하고 논리적인지 확인
3. 진정성: 암기한 답변이 아닌 본인의 경험에서 우러나온 답변
4. 직무 적합성: 지원 직무와 연관성이 높은 경험과 스킬
5. 의사소통: 명확하고 자신감 있게 전달하는지

결과는 반드시 JSON 형식으로 출력:
{
  "good": ["잘한 점 1", "잘한 점 2"],
  "bad": ["개선할 점 1", "개선할 점 2"],
  "keywords": ["핵심키워드1", "핵심키워드2", "핵심키워드3"]
}',
    'AI 분석 기준 및 JSON 출력 규칙',
    true
),
(
    'question_generation',
    '지원자의 직무와 경력에 맞는 질문을 생성하세요. 질문은 STAR 기법(Situation, Task, Action, Result)으로 답변할 수 있도록 설계합니다. 너무 어렵거나 모호한 질문은 피하고, 실제 업무 상황을 반영한 현실적인 질문을 만듭니다.',
    '맞춤형 질문 생성 규칙',
    true
);

-- =============================================
-- 3. questions 테이블 생성 (질문 은행)
-- =============================================
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- questions RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- 모든 인증된 사용자는 질문 조회 가능
CREATE POLICY "Authenticated users can view questions"
    ON public.questions FOR SELECT
    USING (auth.role() = 'authenticated');

-- Admin만 질문 관리 가능
CREATE POLICY "Admins can manage questions"
    ON public.questions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 초기 질문 데이터
INSERT INTO public.questions (category, title, "order") VALUES
('marketing', '지금까지 진행한 마케팅 캠페인 중 가장 성공적이었던 사례를 설명해주세요.', 1),
('marketing', '데이터를 활용해 마케팅 전략을 개선한 경험이 있나요?', 2),
('dev', '가장 어려웠던 버그를 해결한 경험을 말씀해주세요.', 1),
('dev', '코드 리뷰에서 동료와 의견이 충돌했을 때 어떻게 해결하셨나요?', 2),
('general', '팀 프로젝트에서 갈등이 발생했을 때 어떻게 해결하셨나요?', 1),
('general', '실패한 프로젝트에서 배운 점은 무엇인가요?', 2);

-- =============================================
-- 4. interview_results 테이블 생성 (면접 결과)
-- =============================================
CREATE TABLE IF NOT EXISTS public.interview_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    audio_url TEXT NOT NULL,
    ai_feedback JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- interview_results RLS
ALTER TABLE public.interview_results ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 결과만 조회 가능
CREATE POLICY "Users can view own results"
    ON public.interview_results FOR SELECT
    USING (auth.uid() = user_id);

-- 사용자는 자신의 결과만 삽입 가능
CREATE POLICY "Users can insert own results"
    ON public.interview_results FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admin은 모든 결과 조회 가능
CREATE POLICY "Admins can view all results"
    ON public.interview_results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- 5. Storage 버킷 및 정책 설정
-- =============================================
-- 주의: Storage 버킷은 Supabase Dashboard에서 수동으로 생성해야 합니다.
-- 버킷 이름: 'interviews'
-- Public: false

-- Storage 정책 SQL (버킷 생성 후 실행)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('interviews', 'interviews', false);

-- 인증된 사용자만 업로드 가능
-- CREATE POLICY "Authenticated users can upload"
--     ON storage.objects FOR INSERT
--     WITH CHECK (bucket_id = 'interviews' AND auth.role() = 'authenticated');

-- 사용자는 자신의 파일만 읽기 가능
-- CREATE POLICY "Users can view own files"
--     ON storage.objects FOR SELECT
--     USING (bucket_id = 'interviews' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- 6. 신규 사용자 자동 프로필 생성 트리거
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users에 새 유저 생성 시 자동으로 profiles 생성
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 완료!
-- =============================================
-- 다음 단계:
-- 1. Supabase Dashboard > Storage에서 'interviews' 버킷 수동 생성
-- 2. 위의 Storage 정책 주석 해제하여 실행
-- 3. 첫 번째 Admin 계정의 role을 'admin'으로 수동 변경
