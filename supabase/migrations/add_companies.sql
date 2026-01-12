-- =============================================
-- 회사별 면접 질문 프리셋 기능
-- =============================================

-- 1. companies 테이블 생성
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('bigtech', 'conglomerate')),
  description TEXT,
  question_count INT DEFAULT 0,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- companies 인덱스
CREATE INDEX IF NOT EXISTS idx_companies_category ON companies(category);
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON companies(is_active);
CREATE INDEX IF NOT EXISTS idx_companies_display_order ON companies(display_order);

-- companies RLS 정책
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active companies"
  ON companies FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can modify companies"
  ON companies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 2. company_presets 테이블 생성 (빠른 시작용 질문 세트)
CREATE TABLE IF NOT EXISTS company_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  question_ids UUID[] NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- company_presets 인덱스
CREATE INDEX IF NOT EXISTS idx_company_presets_company ON company_presets(company_id);
CREATE INDEX IF NOT EXISTS idx_company_presets_is_default ON company_presets(is_default);

-- company_presets RLS 정책
ALTER TABLE company_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view presets"
  ON company_presets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify presets"
  ON company_presets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 3. questions 테이블 컬럼 추가
ALTER TABLE questions
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

ALTER TABLE questions
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

ALTER TABLE questions
ADD COLUMN IF NOT EXISTS source_url TEXT;

ALTER TABLE questions
ADD COLUMN IF NOT EXISTS crawled_at TIMESTAMP WITH TIME ZONE;

-- questions 새 인덱스
CREATE INDEX IF NOT EXISTS idx_questions_company_id ON questions(company_id);
CREATE INDEX IF NOT EXISTS idx_questions_source ON questions(source);

-- 4. question_count 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_company_question_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE companies
    SET question_count = (
      SELECT COUNT(*) FROM questions WHERE company_id = NEW.company_id
    )
    WHERE id = NEW.company_id;
  END IF;

  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    UPDATE companies
    SET question_count = (
      SELECT COUNT(*) FROM questions WHERE company_id = OLD.company_id
    )
    WHERE id = OLD.company_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_company_question_count ON questions;
CREATE TRIGGER trigger_update_company_question_count
  AFTER INSERT OR UPDATE OR DELETE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_company_question_count();

-- 5. updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_companies_updated_at ON companies;
CREATE TRIGGER trigger_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 시드 데이터: 회사 정보
-- =============================================

INSERT INTO companies (name, slug, logo_url, category, description, display_order) VALUES
-- 빅테크/IT
('네이버', 'naver', '/logos/naver.png', 'bigtech', '대한민국 대표 IT 기업, 검색/커머스/핀테크 등 다양한 서비스 운영', 1),
('카카오', 'kakao', '/logos/kakao.png', 'bigtech', '카카오톡 기반 플랫폼 기업, 메신저/핀테크/모빌리티/엔터테인먼트', 2),
('토스', 'toss', '/logos/toss.png', 'bigtech', '비바리퍼블리카가 운영하는 금융 슈퍼앱, 간편송금/투자/보험/은행', 3),
('쿠팡', 'coupang', '/logos/coupang.png', 'bigtech', '로켓배송으로 유명한 이커머스 기업, 쿠팡이츠/쿠팡플레이 운영', 4),
('배달의민족', 'baemin', '/logos/baemin.png', 'bigtech', '우아한형제들이 운영하는 배달앱 1위 기업', 5),
('당근마켓', 'daangn', '/logos/daangn.png', 'bigtech', '지역 기반 중고거래 플랫폼, 동네 커뮤니티 서비스', 6),
-- 대기업
('삼성전자', 'samsung', '/logos/samsung.png', 'conglomerate', '글로벌 반도체/스마트폰/가전 기업, GSAT 채용', 7),
('SK하이닉스', 'skhynix', '/logos/skhynix.png', 'conglomerate', '메모리 반도체 전문기업, DRAM/NAND 세계 2위', 8),
('LG전자', 'lg', '/logos/lg.png', 'conglomerate', '가전/TV/전장 부품 글로벌 기업', 9),
('현대자동차', 'hyundai', '/logos/hyundai.png', 'conglomerate', '글로벌 자동차 그룹, 전기차/수소차 선도', 10)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  logo_url = EXCLUDED.logo_url,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;
