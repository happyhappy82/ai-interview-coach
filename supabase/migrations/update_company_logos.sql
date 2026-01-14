-- =============================================
-- 기업별 로고 URL 업데이트
-- Clearbit Logo API 사용 (안정적인 공개 로고 제공)
-- =============================================

-- 빅테크/IT 기업
UPDATE companies SET logo_url = 'https://logo.clearbit.com/navercorp.com' WHERE slug = 'naver';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/kakaocorp.com' WHERE slug = 'kakao';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/toss.im' WHERE slug = 'toss';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/coupang.com' WHERE slug = 'coupang';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/woowahan.com' WHERE slug = 'baemin';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/daangn.com' WHERE slug = 'daangn';

-- 대기업
UPDATE companies SET logo_url = 'https://logo.clearbit.com/samsung.com' WHERE slug = 'samsung';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/skhynix.com' WHERE slug = 'skhynix';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/lg.com' WHERE slug = 'lg';
UPDATE companies SET logo_url = 'https://logo.clearbit.com/hyundai.com' WHERE slug = 'hyundai';

-- 변경 확인
SELECT slug, name, logo_url FROM companies ORDER BY display_order;
