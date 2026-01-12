-- =============================================
-- 회사별 샘플 면접 질문 시드 데이터
-- 각 회사별 5개씩 실제 면접에서 자주 나오는 질문들
-- =============================================

-- 네이버 질문
INSERT INTO questions (company_id, category, title, "order", source, evaluation_context, is_custom)
SELECT
  c.id,
  'general',
  q.title,
  q.ord,
  'manual',
  q.eval_context,
  false
FROM companies c
CROSS JOIN (VALUES
  ('네이버의 어떤 서비스에 가장 관심이 있고, 어떻게 개선하고 싶으신가요?', 1, '지원자의 네이버 서비스에 대한 이해도와 문제 해결 능력을 평가합니다. STAR 기법을 활용하여 구체적인 개선 아이디어와 그 근거를 제시하는지 확인하세요.'),
  ('최근 진행한 프로젝트에서 기술적으로 가장 어려웠던 문제와 해결 과정을 설명해주세요.', 2, '기술적 문제 해결 능력과 논리적 사고력을 평가합니다. 문제 정의, 해결 방안 탐색, 실행, 결과 순으로 구조화된 답변인지 확인하세요.'),
  ('팀 프로젝트에서 의견 충돌이 있었던 경험과 어떻게 해결했는지 말씀해주세요.', 3, '협업 능력과 갈등 해결 역량을 평가합니다. 상대방의 의견을 경청하고 합리적인 해결책을 도출하는 과정을 확인하세요.'),
  ('네이버가 글로벌 시장에서 경쟁력을 갖추려면 어떤 전략이 필요할까요?', 4, '비즈니스 인사이트와 전략적 사고력을 평가합니다. 시장 분석과 구체적인 실행 방안을 제시하는지 확인하세요.'),
  ('5년 후 본인의 커리어 목표와 네이버에서 이루고 싶은 것은 무엇인가요?', 5, '장기적인 비전과 회사와의 적합성을 평가합니다. 구체적이고 실현 가능한 목표인지 확인하세요.')
) AS q(title, ord, eval_context)
WHERE c.slug = 'naver'
ON CONFLICT DO NOTHING;

-- 카카오 질문
INSERT INTO questions (company_id, category, title, "order", source, evaluation_context, is_custom)
SELECT
  c.id,
  'general',
  q.title,
  q.ord,
  'manual',
  q.eval_context,
  false
FROM companies c
CROSS JOIN (VALUES
  ('카카오의 "더 나은 세상을 만드는 기술"이라는 미션에 대해 어떻게 생각하시나요?', 1, '회사의 미션과 가치에 대한 이해도를 평가합니다. 본인의 가치관과 연결지어 설명하는지 확인하세요.'),
  ('사용자 경험(UX)을 개선하기 위해 데이터를 활용한 경험이 있나요?', 2, '데이터 기반 의사결정 능력과 UX 마인드셋을 평가합니다. 구체적인 지표와 개선 결과를 제시하는지 확인하세요.'),
  ('빠르게 변화하는 IT 트렌드에 어떻게 대응하고 학습하시나요?', 3, '자기 개발 의지와 학습 능력을 평가합니다. 구체적인 학습 방법과 실제 적용 사례를 확인하세요.'),
  ('카카오톡 외에 카카오가 집중해야 할 새로운 사업 영역은 무엇이라고 생각하시나요?', 4, '사업적 통찰력과 창의적 사고를 평가합니다. 시장 분석을 바탕으로 한 논리적인 제안인지 확인하세요.'),
  ('실패한 프로젝트 경험이 있다면, 그로부터 배운 점은 무엇인가요?', 5, '실패에서 배우는 자세와 성장 마인드셋을 평가합니다. 구체적인 교훈과 이후 변화를 확인하세요.')
) AS q(title, ord, eval_context)
WHERE c.slug = 'kakao'
ON CONFLICT DO NOTHING;

-- 토스 질문
INSERT INTO questions (company_id, category, title, "order", source, evaluation_context, is_custom)
SELECT
  c.id,
  'general',
  q.title,
  q.ord,
  'manual',
  q.eval_context,
  false
FROM companies c
CROSS JOIN (VALUES
  ('토스의 "금융을 쉽게"라는 비전에 공감하는 부분과 본인이 기여할 수 있는 점은?', 1, '회사 비전에 대한 이해와 개인의 역량 연결을 평가합니다. 구체적인 기여 방안을 제시하는지 확인하세요.'),
  ('복잡한 문제를 단순하게 해결한 경험을 말씀해주세요.', 2, '문제 단순화 능력과 본질을 파악하는 역량을 평가합니다. 복잡성을 줄이면서도 효과적인 해결책인지 확인하세요.'),
  ('높은 수준의 완성도를 추구했던 프로젝트 경험이 있나요?', 3, '퀄리티에 대한 집착과 디테일 지향성을 평가합니다. 어떤 기준으로 완성도를 판단했는지 확인하세요.'),
  ('스타트업 환경에서 빠르게 결정하고 실행해야 했던 경험을 말씀해주세요.', 4, '스피드와 실행력을 평가합니다. 불확실한 상황에서의 의사결정 과정을 확인하세요.'),
  ('토스 앱에서 개선하고 싶은 기능이 있다면 무엇인가요?', 5, '제품에 대한 관심과 개선 아이디어를 평가합니다. 사용자 관점에서의 분석인지 확인하세요.')
) AS q(title, ord, eval_context)
WHERE c.slug = 'toss'
ON CONFLICT DO NOTHING;

-- 쿠팡 질문
INSERT INTO questions (company_id, category, title, "order", source, evaluation_context, is_custom)
SELECT
  c.id,
  'general',
  q.title,
  q.ord,
  'manual',
  q.eval_context,
  false
FROM companies c
CROSS JOIN (VALUES
  ('쿠팡의 "고객 집착(Customer Obsession)" 문화에 대해 어떻게 생각하시나요?', 1, '고객 중심 마인드셋을 평가합니다. 실제 고객 경험을 개선한 사례가 있는지 확인하세요.'),
  ('대용량 트래픽이나 데이터를 처리한 경험이 있나요?', 2, '기술적 스케일링 역량을 평가합니다. 구체적인 수치와 해결 방법을 확인하세요.'),
  ('로켓배송 시스템의 효율성을 높이기 위한 아이디어가 있다면?', 3, '물류/운영 최적화에 대한 이해도를 평가합니다. 실현 가능하고 논리적인 제안인지 확인하세요.'),
  ('빠른 성장을 하는 조직에서 일하는 것에 대해 어떻게 생각하시나요?', 4, '빠른 변화에 대한 적응력과 태도를 평가합니다. 과거 경험과 연결지어 설명하는지 확인하세요.'),
  ('이커머스 시장의 미래와 쿠팡의 성장 전략에 대해 의견을 말씀해주세요.', 5, '시장 이해도와 전략적 사고를 평가합니다. 트렌드 분석과 인사이트를 확인하세요.')
) AS q(title, ord, eval_context)
WHERE c.slug = 'coupang'
ON CONFLICT DO NOTHING;

-- 배달의민족 질문
INSERT INTO questions (company_id, category, title, "order", source, evaluation_context, is_custom)
SELECT
  c.id,
  'general',
  q.title,
  q.ord,
  'manual',
  q.eval_context,
  false
FROM companies c
CROSS JOIN (VALUES
  ('배민다움이라고 생각하는 것은 무엇인가요?', 1, '회사 문화와 브랜드에 대한 이해를 평가합니다. 배민의 마케팅이나 조직문화를 알고 있는지 확인하세요.'),
  ('"송파구에서 일을 더 잘하는 11가지 방법" 중 공감가는 항목이 있나요?', 2, '우아한형제들의 핵심 가치에 대한 이해를 평가합니다. 본인의 경험과 연결지어 설명하는지 확인하세요.'),
  ('음식 배달 플랫폼의 사회적 책임에 대해 어떻게 생각하시나요?', 3, 'ESG와 기업의 사회적 책임에 대한 인식을 평가합니다. 균형잡힌 시각인지 확인하세요.'),
  ('배달의민족 앱에서 가장 마음에 드는 기능과 개선점은?', 4, '제품에 대한 관심과 분석력을 평가합니다. 사용자 경험 관점에서 구체적인 의견인지 확인하세요.'),
  ('재미있게 일하면서도 성과를 냈던 경험이 있나요?', 5, '업무에 대한 태도와 성과 창출 능력을 평가합니다. 재미와 성과의 균형을 어떻게 맞추는지 확인하세요.')
) AS q(title, ord, eval_context)
WHERE c.slug = 'baemin'
ON CONFLICT DO NOTHING;

-- 당근마켓 질문
INSERT INTO questions (company_id, category, title, "order", source, evaluation_context, is_custom)
SELECT
  c.id,
  'general',
  q.title,
  q.ord,
  'manual',
  q.eval_context,
  false
FROM companies c
CROSS JOIN (VALUES
  ('당근마켓의 "하이퍼로컬" 전략에 대해 어떻게 생각하시나요?', 1, '비즈니스 모델에 대한 이해를 평가합니다. 지역 기반 서비스의 장단점을 분석하는지 확인하세요.'),
  ('커뮤니티 기반 서비스에서 신뢰를 구축하는 방법은 무엇이라고 생각하나요?', 2, '플랫폼 신뢰 구축에 대한 이해를 평가합니다. 구체적인 방안을 제시하는지 확인하세요.'),
  ('당근마켓이 중고거래 외에 확장할 수 있는 영역은?', 3, '사업 확장에 대한 아이디어를 평가합니다. 하이퍼로컬 맥락에서 논리적인 제안인지 확인하세요.'),
  ('사용자들의 매너 온도를 높이기 위한 아이디어가 있다면?', 4, '제품/서비스 개선 아이디어를 평가합니다. 사용자 행동을 이해하고 있는지 확인하세요.'),
  ('스타트업에서 성장하면서 어려웠던 점과 극복 방법은?', 5, '성장통에 대한 경험과 대처 능력을 평가합니다. 구체적인 사례와 교훈을 확인하세요.')
) AS q(title, ord, eval_context)
WHERE c.slug = 'daangn'
ON CONFLICT DO NOTHING;

-- 삼성전자 질문
INSERT INTO questions (company_id, category, title, "order", source, evaluation_context, is_custom)
SELECT
  c.id,
  'general',
  q.title,
  q.ord,
  'manual',
  q.eval_context,
  false
FROM companies c
CROSS JOIN (VALUES
  ('삼성전자에 지원한 이유와 입사 후 이루고 싶은 목표는 무엇인가요?', 1, '지원 동기와 목표의 구체성을 평가합니다. 삼성전자만의 장점과 연결지어 설명하는지 확인하세요.'),
  ('반도체/스마트폰 시장에서 삼성의 경쟁력은 무엇이라고 생각하시나요?', 2, '산업에 대한 이해도와 분석력을 평가합니다. 경쟁사 대비 차별점을 파악하고 있는지 확인하세요.'),
  ('팀 프로젝트에서 리더십을 발휘한 경험을 말씀해주세요.', 3, '리더십 역량과 팀워크를 평가합니다. STAR 기법으로 구체적인 상황과 결과를 설명하는지 확인하세요.'),
  ('글로벌 기업에서 일하기 위해 어떤 준비를 해왔나요?', 4, '글로벌 역량과 준비성을 평가합니다. 어학, 문화 이해, 해외 경험 등을 확인하세요.'),
  ('인생에서 가장 도전적이었던 경험과 그것을 통해 배운 점은?', 5, '도전 정신과 성장 마인드셋을 평가합니다. 어려움을 극복한 과정을 구체적으로 설명하는지 확인하세요.')
) AS q(title, ord, eval_context)
WHERE c.slug = 'samsung'
ON CONFLICT DO NOTHING;

-- SK하이닉스 질문
INSERT INTO questions (company_id, category, title, "order", source, evaluation_context, is_custom)
SELECT
  c.id,
  'general',
  q.title,
  q.ord,
  'manual',
  q.eval_context,
  false
FROM companies c
CROSS JOIN (VALUES
  ('반도체 산업의 미래와 SK하이닉스의 역할에 대해 어떻게 생각하시나요?', 1, '산업 이해도와 회사에 대한 관심을 평가합니다. AI/HBM 등 최신 트렌드를 알고 있는지 확인하세요.'),
  ('DRAM과 NAND의 차이점과 각각의 시장 전망은?', 2, '전공 지식과 시장 분석 능력을 평가합니다. 기술적 이해와 비즈니스 인사이트를 확인하세요.'),
  ('문제 상황에서 창의적으로 해결한 경험을 말씀해주세요.', 3, '창의적 문제 해결 능력을 평가합니다. 기존과 다른 접근법을 시도한 사례인지 확인하세요.'),
  ('SK 그룹의 SKMS(경영철학)에 대해 알고 있는 것을 말씀해주세요.', 4, '회사 문화와 철학에 대한 이해를 평가합니다. 사전 조사를 충실히 했는지 확인하세요.'),
  ('입사 후 5년, 10년 후의 커리어 계획은 무엇인가요?', 5, '장기적 비전과 성장 의지를 평가합니다. 구체적이고 실현 가능한 계획인지 확인하세요.')
) AS q(title, ord, eval_context)
WHERE c.slug = 'skhynix'
ON CONFLICT DO NOTHING;

-- LG전자 질문
INSERT INTO questions (company_id, category, title, "order", source, evaluation_context, is_custom)
SELECT
  c.id,
  'general',
  q.title,
  q.ord,
  'manual',
  q.eval_context,
  false
FROM companies c
CROSS JOIN (VALUES
  ('LG전자의 "Life''s Good" 브랜드 철학에 대해 어떻게 생각하시나요?', 1, '브랜드와 회사 철학에 대한 이해를 평가합니다. 본인의 가치관과 연결지어 설명하는지 확인하세요.'),
  ('가전제품 시장에서 LG전자가 경쟁 우위를 유지하려면 어떤 전략이 필요할까요?', 2, '시장 분석과 전략적 사고를 평가합니다. 구체적인 제안과 근거를 제시하는지 확인하세요.'),
  ('고객의 니즈를 파악하고 제품/서비스에 반영한 경험이 있나요?', 3, '고객 중심 사고와 실행력을 평가합니다. 구체적인 프로세스와 결과를 확인하세요.'),
  ('다양한 배경의 사람들과 협업한 경험을 말씀해주세요.', 4, '다양성과 포용성, 협업 역량을 평가합니다. 문화적 차이를 극복한 사례가 있는지 확인하세요.'),
  ('LG전자 제품 중 가장 인상 깊었던 것과 개선 아이디어가 있다면?', 5, '제품에 대한 관심과 개선 아이디어를 평가합니다. 사용자 경험 관점의 분석인지 확인하세요.')
) AS q(title, ord, eval_context)
WHERE c.slug = 'lg'
ON CONFLICT DO NOTHING;

-- 현대자동차 질문
INSERT INTO questions (company_id, category, title, "order", source, evaluation_context, is_custom)
SELECT
  c.id,
  'general',
  q.title,
  q.ord,
  'manual',
  q.eval_context,
  false
FROM companies c
CROSS JOIN (VALUES
  ('자동차 산업의 패러다임 변화(전동화, 자율주행)에 대해 어떻게 생각하시나요?', 1, '산업 트렌드에 대한 이해를 평가합니다. 현대차의 전략과 연결지어 설명하는지 확인하세요.'),
  ('현대자동차가 테슬라나 BYD와 경쟁하기 위한 전략은 무엇이라고 생각하나요?', 2, '경쟁 분석과 전략적 사고를 평가합니다. 구체적인 차별화 방안을 제시하는지 확인하세요.'),
  ('팀에서 의견이 맞지 않을 때 어떻게 해결하시나요?', 3, '갈등 해결 능력과 커뮤니케이션 스킬을 평가합니다. 실제 사례를 바탕으로 설명하는지 확인하세요.'),
  ('현대자동차의 친환경 전략(수소, 전기차)에 대한 의견을 말씀해주세요.', 4, '친환경 트렌드와 회사 전략에 대한 이해를 평가합니다. 기술적/비즈니스적 관점을 확인하세요.'),
  ('가장 자랑스러운 성과와 그 과정에서 배운 점은 무엇인가요?', 5, '성과 창출 능력과 자기 성찰을 평가합니다. STAR 기법으로 구체적으로 설명하는지 확인하세요.')
) AS q(title, ord, eval_context)
WHERE c.slug = 'hyundai'
ON CONFLICT DO NOTHING;

-- =============================================
-- 회사별 기본 프리셋 생성
-- =============================================

-- 각 회사의 기본 프리셋 (해당 회사의 모든 질문 포함)
INSERT INTO company_presets (company_id, name, question_ids, is_default)
SELECT
  c.id,
  '기본 면접',
  ARRAY(
    SELECT q.id
    FROM questions q
    WHERE q.company_id = c.id
    ORDER BY q."order"
  ),
  true
FROM companies c
ON CONFLICT DO NOTHING;

-- question_count 업데이트
UPDATE companies c
SET question_count = (
  SELECT COUNT(*) FROM questions q WHERE q.company_id = c.id
);
