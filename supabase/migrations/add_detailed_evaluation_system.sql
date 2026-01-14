-- 상세 면접 평가 시스템 구축
-- 회사별 + 질문별 구조화된 평가 기준

-- ==========================================
-- 1. companies 테이블 구조 확장
-- ==========================================

ALTER TABLE companies ADD COLUMN IF NOT EXISTS core_values TEXT[];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS good_traits TEXT[];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS red_flags TEXT[];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS answer_style TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS interview_tip TEXT;

-- ==========================================
-- 2. questions 테이블 구조 확장
-- ==========================================

ALTER TABLE questions ADD COLUMN IF NOT EXISTS key_points TEXT[];
ALTER TABLE questions ADD COLUMN IF NOT EXISTS good_keywords TEXT[];
ALTER TABLE questions ADD COLUMN IF NOT EXISTS bad_keywords TEXT[];
ALTER TABLE questions ADD COLUMN IF NOT EXISTS evaluation_guide TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS sample_structure TEXT;

-- ==========================================
-- 3. 회사별 평가 기준 데이터
-- ==========================================

-- 네이버
UPDATE companies SET
  core_values = ARRAY['기술적 깊이', '논리적 사고', '문제해결력', '성장 잠재력'],
  good_traits = ARRAY[
    '기술 선택에 명확한 이유 제시',
    '"왜?"에 대한 깊이 있는 답변',
    '실패 경험에서 배운 점 언급',
    '프로젝트 기여도를 구체적으로 설명',
    '꼬리질문에 일관성 있게 대응'
  ],
  red_flags = ARRAY[
    '단순 암기식 답변',
    '"그냥 했습니다" 식의 이유 없는 답변',
    '기술 트렌드만 언급하고 깊이 없음',
    '협업 경험에서 본인 역할 불명확',
    '포트폴리오와 다른 내용 말함'
  ],
  answer_style = '네이버는 "왜?"를 집요하게 물어봄. 모든 기술 선택, 설계 결정에 논리적 근거 필수. 깊이 > 넓이. 모르면 솔직히 모른다고 하되, 추론 과정을 보여주면 가점.',
  interview_tip = '포트폴리오/GitHub 코드 전부 검토하고 옴. 자소서에 쓴 내용은 100% 질문함. 면접관마다 스타일 다름(기술/인성 비율 변동).'
WHERE slug = 'naver';

-- 카카오
UPDATE companies SET
  core_values = ARRAY['기초 탄탄', '공학적 사고', '협업 능력', 'Trade-off 이해'],
  good_traits = ARRAY[
    '개념 간 연관성 설명',
    'Trade-off를 이해하고 선택 이유 제시',
    '프로젝트에서 기술 도입 배경 설명',
    '협업 시 갈등 해결 과정 구체화',
    '모르는 건 솔직히 인정'
  ],
  red_flags = ARRAY[
    '아는 척하다가 꼬리질문에 무너짐',
    '기술 선택 이유 없이 "많이 쓰니까"',
    '혼자 다 했다는 식의 답변',
    '추상적이고 두루뭉술한 답변',
    '면접관 의도 파악 못하고 엉뚱한 답변'
  ],
  answer_style = '카카오는 큰 질문 던지고 → 꼬리질문으로 깊이 파고듦. 기초 CS를 "왜 그런지"까지 설명해야 함. 거창한 프로젝트보다 작은 프로젝트라도 깊이 있게.',
  interview_tip = '1차는 기술 중심, 2차는 컬처핏(협업 가능성). 면접 후 "뭘 알고 뭘 모르는지" 명확히 파악당함. 애매하게 아는 건 차라리 모른다고.'
WHERE slug = 'kakao';

-- 토스
UPDATE companies SET
  core_values = ARRAY['자율과 책임', '깊은 몰입', '솔직한 소통', '빠른 실행'],
  good_traits = ARRAY[
    '삶의 결정에 명확한 이유 있음',
    '일에 대한 열정과 몰입 경험',
    '실패해도 배운 점 명확',
    '본인만의 가치관이 뚜렷함',
    '기술 선택에 비교 분석 근거'
  ],
  red_flags = ARRAY[
    '가치관이 모호하거나 일관성 없음',
    '남들 다 하니까 따라한 경험만',
    '질문 의도에 맞춰 답변 꾸며냄 (티남)',
    '토스 핵심가치와 안 맞는 태도',
    '깊이 없이 넓게만 아는 척'
  ],
  answer_style = '토스는 "왜 그런 인생 결정을 했나", "왜 열심히 사나" 같은 가치관 질문이 핵심. 문화 면접 1.5~3시간. 꾸미면 100% 걸림. 진솔함이 최고.',
  interview_tip = '토스팀 블로그 필독. 8가지 핵심가치 숙지하되, 억지로 맞추지 말 것. 직무 능력 뛰어나도 컬처핏 안 맞으면 무조건 탈락 (무타협 원칙).'
WHERE slug = 'toss';

-- 쿠팡
UPDATE companies SET
  core_values = ARRAY['고객 집착', '데이터 기반', '빠른 실행', '끈기 있는 성과'],
  good_traits = ARRAY[
    '성과를 정량적 수치로 제시 (%, 건수, 금액)',
    'SBI 구조로 답변 (상황-행동-결과)',
    '15가지 리더십 원칙과 연결된 경험',
    '고객 관점에서 문제 해결',
    '실패해도 끈기 있게 재도전한 사례'
  ],
  red_flags = ARRAY[
    '추상적 성과 ("잘했습니다", "개선했습니다")',
    '고객 언급 없이 기술만 강조',
    '과정만 설명하고 결과 없음',
    '팀 성과를 혼자 한 것처럼 말함',
    '우선순위 없이 모든 걸 다 했다고 함'
  ],
  answer_style = '쿠팡은 철저히 성과 중심. 모든 답변에 숫자 넣기 (30% 개선, 2주 단축 등). 리더십 원칙 중 본인과 맞는 3-5개는 사례와 함께 준비.',
  interview_tip = '1:1 면접을 3-6회 연속 진행 (3-6시간). 각 면접관이 다른 리더십 원칙 검증. 데이터/숫자 없는 답변은 설득력 낮음.'
WHERE slug = 'coupang';

-- 배달의민족
UPDATE companies SET
  core_values = ARRAY['팀워크', '본질에 집중', '솔직한 소통', '재미와 성과'],
  good_traits = ARRAY[
    '협업에서 본인 역할 명확',
    '문제의 본질을 파악한 해결',
    '갈등 상황에서 소통으로 해결',
    '배민 서비스/브랜드에 대한 이해',
    '실패를 인정하고 개선한 경험'
  ],
  red_flags = ARRAY[
    '혼자 스타플레이어처럼 답변',
    '배민 서비스 안 써본 티',
    '왜 배민인지 이유가 약함',
    '갈등 상황에서 남 탓만',
    '일 시작 전 계획 없이 진행'
  ],
  answer_style = '배민은 "왜 배민이어야 하는지" 중요. 팀워크 > 개인 능력. 협업 경험에서 구체적 역할과 기여 설명. 배민다운 위트도 플러스.',
  interview_tip = '90분 대화형 면접. 압박 없이 편안하지만 깊이 있게 검증. "송파구에서 일 잘하는 11가지 방법" 참고. 서비스 실제 사용 경험 필수.'
WHERE slug = 'baemin';

-- 당근마켓
UPDATE companies SET
  core_values = ARRAY['일에 대한 열정', '주도적 문제해결', '빠른 학습', '솔직함'],
  good_traits = ARRAY[
    'Why/How 중심의 깊이 있는 답변',
    '스스로 문제 정의하고 해결한 경험',
    '기술의 원리와 패러다임까지 이해',
    '새로운 것을 빠르게 학습한 사례',
    '삶의 결정에 일관된 논리'
  ],
  red_flags = ARRAY[
    'What만 답하고 Why/How 없음',
    '시킨 일만 한 경험',
    '기술 사용법만 알고 원리 모름',
    '면접용으로 꾸며낸 답변 (티남)',
    '수동적으로 따라간 경험만'
  ],
  answer_style = '당근은 What보다 Why/How 중심. "왜 이 기술?", "어떻게 배웠나?" 깊이 파고듦. 컬처핏 합격률 30-40%로 매우 까다로움. 솔직함이 최고.',
  interview_tip = '직무 면접 난이도 높음. 컬처핏은 준비한다고 바뀌지 않음 - 꾸미면 귀신같이 잡아냄. 실력 + 인성 + 주도성 모두 검증.'
WHERE slug = 'karrot';

-- 삼성전자
UPDATE companies SET
  core_values = ARRAY['열정', '창의혁신', '도덕성', '팀워크'],
  good_traits = ARRAY[
    '목표 향해 끝까지 도전한 경험',
    '기존 방식 개선한 창의적 사례',
    '팀에서 신뢰받은 협업 경험',
    'STAR 구조로 체계적 답변',
    '윤리적 딜레마에서 올바른 선택'
  ],
  red_flags = ARRAY[
    '열정 없이 시킨 것만 한 경험',
    '창의성 면접에서 너무 튀는 아이디어',
    '팀 성과에서 본인 기여 불명확',
    '삼성 로열티/지원동기 약함',
    '비윤리적 상황에서 방관한 경험'
  ],
  answer_style = '삼성은 인성 비중 높음. 창의성 면접은 "적당히 응용한 아이디어"가 고득점. STAR로 경험 정리. 직무 망해도 임원면접 잘 보면 역전 가능.',
  interview_tip = '직무면접 + 창의성면접 + 임원면접. 태도/시선/용모 등 비언어적 요소 중요. 면접 전 뉴스/기술 트렌드 스크랩. A4에 경험 STAR로 정리.'
WHERE slug = 'samsung';

-- SK하이닉스
UPDATE companies SET
  core_values = ARRAY['기술 실현', '소통과 협업', '도전 정신', '패기'],
  good_traits = ARRAY[
    '반도체/직무 관련 자발적 학습',
    '팀 프로젝트에서 소통 역할',
    '어려운 문제에 도전한 경험',
    '데이터 기반 문제해결',
    '반도체 산업에 대한 진심'
  ],
  red_flags = ARRAY[
    '반도체 기초 지식 부족',
    '"삼성 안 가고 왜 SK?" 답변 약함',
    '교대근무/팹근무에 부정적',
    '혼자만 잘하려는 태도',
    '스펙만 나열하고 경험 깊이 없음'
  ],
  answer_style = 'SK하이닉스는 VWBE(자발적 두뇌활용), SUPEX(최고수준 도전), 패기가 핵심. 반도체 지식 + 회사 관심 어필. 인성 질문 비중 높음.',
  interview_tip = '문화적합성(30분) + 직무적합성(30분). 자소서 기반 꼬리질문 많음. 당당하고 자신감 있는 태도 중요. 공정/기술 중 관심 분야 명확히.'
WHERE slug = 'skhynix';

-- LG전자
UPDATE companies SET
  core_values = ARRAY['도전적 실행', '고객 가치', '협력과 소통', '자기주도'],
  good_traits = ARRAY[
    'LG 제품에 대한 관심과 아이디어',
    '경쟁사 대비 차별점 분석',
    '팀에서 협력한 구체적 사례',
    '스스로 목표 세우고 달성한 경험',
    '실패에서 회복한 경험'
  ],
  red_flags = ARRAY[
    'LG 제품 사용/관심 없음',
    '너무 튀거나 공격적인 태도',
    '경쟁사(삼성) 제품만 칭찬',
    '수동적으로 시킨 일만 한 경험',
    '인성검사에서 일관성 없는 답변'
  ],
  answer_style = 'LG는 "똑똑하지만 순한 사람" 선호. 인성검사(LG Way Fit) 매우 중요 - 부적합 시 탈락. PT면접은 발표보다 꼬리질문 대응이 핵심.',
  interview_tip = 'LG Way Fit 인성검사 342문항. 인재상 숙지 후 응시. PT면접 20분 준비 → 발표 → 꼬리질문. 제품/경쟁사 분석 필수.'
WHERE slug = 'lg';

-- 현대자동차
UPDATE companies SET
  core_values = ARRAY['고객 최우선', '도전적 실행', '소통과 협력', '글로벌 지향'],
  good_traits = ARRAY[
    '차량/모빌리티에 대한 관심',
    '도전적 목표 달성 경험',
    '팀에서 소통으로 문제 해결',
    '전기차/자율주행 트렌드 이해',
    '글로벌 관점의 사고'
  ],
  red_flags = ARRAY[
    '자동차 관심/지식 부족',
    '안전/품질 타협한 경험',
    '팀보다 개인 성과 강조',
    '현대차 경쟁력 모름',
    '직무 전문성 부족'
  ],
  answer_style = '현대차는 "도전+소통" 조합이 가장 효과적. 직무 지식 깊이 물어봄. 차량 관련 질문 빈번. 데이터 기반 사고 강조.',
  interview_tip = '직무면접에서 전문 지식 꼬리질문 많음. 자동차/전기차/자율주행 트렌드 숙지. Hyundai Way 10가지 중 본인과 맞는 것 연결.'
WHERE slug = 'hyundai';


-- ==========================================
-- 4. 질문별 상세 평가 기준 데이터 (예시 - 주요 질문들)
-- ==========================================

-- 네이버 개발 질문들
UPDATE questions SET
  key_points = ARRAY['알고리즘 이해', '시간복잡도 분석', '최적화 고려'],
  good_keywords = ARRAY['재귀', 'DP', '메모이제이션', 'O(n)', '공간복잡도'],
  bad_keywords = ARRAY['그냥', '외웠어요', '잘 모르겠지만'],
  evaluation_guide = '단순 구현이 아닌 여러 방법(재귀/DP) 비교 설명 시 가점. 시간/공간 복잡도 트레이드오프 언급 필수.',
  sample_structure = '1) 문제 이해 확인 → 2) 접근법 설명 (재귀 vs DP) → 3) 선택한 방법의 이유 → 4) 복잡도 분석 → 5) 코드 구현'
WHERE company_id = (SELECT id FROM companies WHERE slug = 'naver')
  AND title LIKE '%피보나치%';

UPDATE questions SET
  key_points = ARRAY['CS 기초', '메모리 구조', '동시성 이해'],
  good_keywords = ARRAY['메모리 공유', '컨텍스트 스위칭', '독립적 주소공간', 'IPC', '경량'],
  bad_keywords = ARRAY['비슷해요', '잘 모르겠어요', '들어봤어요'],
  evaluation_guide = '암기식 정의가 아닌, 실제 사용 시 어떤 상황에서 무엇을 선택하는지까지 설명해야 높은 점수.',
  sample_structure = '1) 각각의 정의 → 2) 핵심 차이점 (메모리, 생성비용) → 3) 실제 사용 예시 → 4) 언제 무엇을 선택하는지'
WHERE company_id = (SELECT id FROM companies WHERE slug = 'naver')
  AND title LIKE '%프로세스%스레드%';

-- 카카오 개발 질문들
UPDATE questions SET
  key_points = ARRAY['기술 선택 근거', '대안 비교', '트레이드오프'],
  good_keywords = ARRAY['비교해보니', '장단점', '우리 상황에서는', '트레이드오프', '확장성'],
  bad_keywords = ARRAY['많이 쓰니까', '유명해서', '선배가 추천해서'],
  evaluation_guide = '기술 선택에 반드시 "왜?"가 있어야 함. 대안을 비교하고 상황에 맞게 선택한 과정 설명.',
  sample_structure = '1) 당시 상황/요구사항 → 2) 고려한 대안들 → 3) 각 대안의 장단점 → 4) 최종 선택 이유 → 5) 결과/배운점'
WHERE company_id = (SELECT id FROM companies WHERE slug = 'kakao')
  AND title LIKE '%기술%왜%';

UPDATE questions SET
  key_points = ARRAY['개념 연결', '깊이 있는 이해', '실무 적용'],
  good_keywords = ARRAY['연관되어', '때문에', '반대로', '상충', '균형'],
  bad_keywords = ARRAY['각각', '따로따로', '잘 모르겠지만'],
  evaluation_guide = '개별 개념이 아닌 개념 간 관계를 설명. A를 선택하면 B를 포기해야 하는 상황 등 트레이드오프 이해 필수.',
  sample_structure = '1) 각 개념 간단 설명 → 2) 상호 연관성 → 3) 트레이드오프 관계 → 4) 실제 선택 사례'
WHERE company_id = (SELECT id FROM companies WHERE slug = 'kakao')
  AND title LIKE '%trade-off%';

-- 토스 개발 질문들
UPDATE questions SET
  key_points = ARRAY['논리적 근거', '대안 분석', '성능/유지보수 고려'],
  good_keywords = ARRAY['고민했는데', '비교해보니', '장기적으로', '유지보수', '성능'],
  bad_keywords = ARRAY['익숙해서', '빨리 구현하려고', '일단'],
  evaluation_guide = '모든 구현 결정에 이유가 있어야 함. "왜 이렇게?"에 명확히 답변. 대안과 비교 분석 필수.',
  sample_structure = '1) 구현 의도 설명 → 2) 고려한 대안 → 3) 이 방식 선택 이유 → 4) 장단점 인지 → 5) 개선 여지'
WHERE company_id = (SELECT id FROM companies WHERE slug = 'toss')
  AND title LIKE '%과제%코드%';

UPDATE questions SET
  key_points = ARRAY['진솔함', '일관된 가치관', '성장 마인드'],
  good_keywords = ARRAY['저는', '중요하게 생각', '왜냐하면', '그래서', '배웠습니다'],
  bad_keywords = ARRAY['보통', '남들처럼', '특별히 없어요'],
  evaluation_guide = '토스 문화 면접의 핵심. 꾸미면 100% 티남. 본인만의 가치관을 솔직하게 일관되게 설명.',
  sample_structure = '1) 나의 핵심 가치관 → 2) 이렇게 생각하게 된 경험 → 3) 실제 적용 사례 → 4) 이 가치관의 장단점'
WHERE company_id = (SELECT id FROM companies WHERE slug = 'toss')
  AND title LIKE '%가치관%';

-- 쿠팡 질문들
UPDATE questions SET
  key_points = ARRAY['SBI 구조', '정량적 결과', '행동의 구체성'],
  good_keywords = ARRAY['%개선', '%단축', '건', '명', '원', '결과적으로'],
  bad_keywords = ARRAY['열심히', '잘', '개선했습니다', '노력했습니다'],
  evaluation_guide = '쿠팡은 숫자가 없는 답변은 설득력 낮음. 반드시 정량적 성과 포함. SBI(상황-행동-결과) 구조 필수.',
  sample_structure = '1) Situation: 구체적 상황/문제 → 2) Behavior: 본인이 한 행동 → 3) Impact: 정량적 결과 (숫자!)'
WHERE company_id = (SELECT id FROM companies WHERE slug = 'coupang');

-- 배달의민족 질문들
UPDATE questions SET
  key_points = ARRAY['협업 역할', '소통 방식', '갈등 해결'],
  good_keywords = ARRAY['팀원들과', '논의해서', '역할 분담', '조율', '합의'],
  bad_keywords = ARRAY['제가 다', '혼자서', '시켜서'],
  evaluation_guide = '배민은 팀워크 > 개인능력. 팀에서 본인의 구체적 역할과 소통 방식 설명. 갈등 시 해결 과정 중요.',
  sample_structure = '1) 팀 구성/상황 → 2) 본인 역할 → 3) 협업/소통 방식 → 4) 갈등 있었다면 해결 과정 → 5) 결과'
WHERE company_id = (SELECT id FROM companies WHERE slug = 'baemin')
  AND (title LIKE '%갈등%' OR title LIKE '%협업%' OR title LIKE '%팀%');

-- 당근마켓 질문들
UPDATE questions SET
  key_points = ARRAY['Why/How 중심', '깊이 있는 이해', '자기주도'],
  good_keywords = ARRAY['왜냐하면', '과정에서', '스스로', '찾아서', '원리가'],
  bad_keywords = ARRAY['시켜서', '해야해서', '다들 하니까'],
  evaluation_guide = '당근은 What보다 Why/How. 기술 사용법만 아는 건 부족. 원리/패러다임까지 설명해야 높은 점수.',
  sample_structure = '1) 무엇을 배웠는지 → 2) 왜 배우게 되었는지 → 3) 어떻게 배웠는지 → 4) 배운 것의 원리/패러다임'
WHERE company_id = (SELECT id FROM companies WHERE slug = 'karrot');

-- 삼성전자 질문들
UPDATE questions SET
  key_points = ARRAY['열정', '끈기', '도전 과정'],
  good_keywords = ARRAY['도전', '끝까지', '포기하지 않고', '목표', '달성'],
  bad_keywords = ARRAY['시켜서', '어쩔 수 없이', '적당히'],
  evaluation_guide = '삼성 인재상 "열정" 검증. 단순 노력이 아닌 목표 향해 끝까지 도전한 과정 설명. STAR 구조 권장.',
  sample_structure = 'STAR: Situation(상황) → Task(과제) → Action(행동) → Result(결과)'
WHERE company_id = (SELECT id FROM companies WHERE slug = 'samsung');

-- SK하이닉스 질문들
UPDATE questions SET
  key_points = ARRAY['반도체 이해', '기술적 정확성', '학습 의지'],
  good_keywords = ARRAY['DRAM', 'NAND', '휘발성', '비휘발성', '셀 구조', '공정'],
  bad_keywords = ARRAY['잘 모르겠지만', '들어봤어요', '비슷한 거 아닌가요'],
  evaluation_guide = 'SK하이닉스는 반도체 기초 지식 필수. 단순 정의가 아닌 원리와 차이점 명확히 설명.',
  sample_structure = '1) 각각의 정의 → 2) 핵심 차이점 (휘발성, 구조, 용도) → 3) 실제 적용 사례 → 4) 최근 트렌드'
WHERE company_id = (SELECT id FROM companies WHERE slug = 'skhynix')
  AND title LIKE '%DRAM%NAND%';

-- LG전자 질문들
UPDATE questions SET
  key_points = ARRAY['제품 이해', '창의적 아이디어', '실현 가능성'],
  good_keywords = ARRAY['사용해보니', '개선하면', '고객 입장에서', '차별화'],
  bad_keywords = ARRAY['잘 모르겠지만', '사용 안 해봤는데', '삼성이 더'],
  evaluation_guide = 'LG전자 제품 실제 사용 경험 필수. 아이디어는 실현 가능하고 고객 가치 중심으로.',
  sample_structure = '1) 관심 제품 소개 → 2) 사용 경험 → 3) 개선 아이디어 → 4) 아이디어 구현 방법 → 5) 기대 효과'
WHERE company_id = (SELECT id FROM companies WHERE slug = 'lg')
  AND title LIKE '%제품%관심%';

-- 현대자동차 질문들
UPDATE questions SET
  key_points = ARRAY['전문 지식', '기술적 깊이', '실무 연결'],
  good_keywords = ARRAY['셀', '모듈', '팩', '열관리', 'BMS', '안전성'],
  bad_keywords = ARRAY['잘 모르겠지만', '들어만 봤어요'],
  evaluation_guide = '현대차는 직무 지식 깊이 중요. 배터리 관련 질문은 공정별 핵심 포인트 알아야 함.',
  sample_structure = '1) 질문에 대한 직접적 답변 → 2) 기술적 근거 → 3) 본인 전공/경험과 연결 → 4) 실무 적용 방안'
WHERE company_id = (SELECT id FROM companies WHERE slug = 'hyundai')
  AND title LIKE '%배터리%';


-- ==========================================
-- 5. 확인 쿼리
-- ==========================================

-- 회사별 평가 기준 확인
SELECT
  name,
  array_length(core_values, 1) as value_count,
  array_length(good_traits, 1) as good_trait_count,
  array_length(red_flags, 1) as red_flag_count,
  LEFT(answer_style, 50) as style_preview
FROM companies
WHERE core_values IS NOT NULL;

-- 질문별 평가 기준 확인
SELECT
  c.name as company,
  q.title,
  array_length(q.key_points, 1) as key_point_count,
  array_length(q.good_keywords, 1) as keyword_count
FROM questions q
JOIN companies c ON q.company_id = c.id
WHERE q.key_points IS NOT NULL
LIMIT 20;
