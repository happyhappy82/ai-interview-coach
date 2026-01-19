-- =============================================
-- 자소서 저장 테이블 (cover_letters)
-- =============================================

-- updated_at 자동 갱신 함수 (없을 경우 생성)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.cover_letters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,  -- 예: "삼성전자 마케팅", "네이버 개발자"
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- RLS 활성화
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 자소서만 조회 가능
CREATE POLICY "Users can view own cover letters"
    ON public.cover_letters FOR SELECT
    USING (auth.uid() = user_id);

-- 사용자는 자신의 자소서만 삽입 가능
CREATE POLICY "Users can insert own cover letters"
    ON public.cover_letters FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 자소서만 수정 가능
CREATE POLICY "Users can update own cover letters"
    ON public.cover_letters FOR UPDATE
    USING (auth.uid() = user_id);

-- 사용자는 자신의 자소서만 삭제 가능
CREATE POLICY "Users can delete own cover letters"
    ON public.cover_letters FOR DELETE
    USING (auth.uid() = user_id);

-- updated_at 자동 갱신 트리거
CREATE TRIGGER set_cover_letters_updated_at
    BEFORE UPDATE ON public.cover_letters
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 인덱스 추가 (user_id로 자주 조회하므로)
CREATE INDEX idx_cover_letters_user_id ON public.cover_letters(user_id);
CREATE INDEX idx_cover_letters_created_at ON public.cover_letters(created_at DESC);
