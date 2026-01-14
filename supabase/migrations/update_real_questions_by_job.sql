-- 직무별 실제 면접 질문 데이터 (웹 검색 기반 - 실제 출처 있음)
-- 출처: 잡코리아, 잡플래닛, 블라인드, Velog, 링커리어 등
-- 각 회사 + 직무 조합별 5개 질문

-- 기존 질문 삭제 (회사별 질문만)
DELETE FROM questions WHERE company_id IS NOT NULL;

-- ==========================================
-- 빅테크/IT 기업
-- ==========================================

-- ===== 네이버 =====
-- 출처: 잡코리아 네이버 면접질문 103건, 블라인드, Velog

-- 네이버 - 개발 (dev)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '피보나치 수열을 구하는 코드를 짜주세요.', 'dev', 'jobkorea', 1, false
FROM companies c WHERE c.slug = 'naver';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '프로세스와 스레드의 차이를 설명해보세요.', 'dev', 'jobkorea', 2, false
FROM companies c WHERE c.slug = 'naver';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '회문 판별 알고리즘을 작성해주세요.', 'dev', 'jobkorea', 3, false
FROM companies c WHERE c.slug = 'naver';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '퀵정렬의 시간복잡도는 어떤지 설명해보세요.', 'dev', 'jobkorea', 4, false
FROM companies c WHERE c.slug = 'naver';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '팀 프로젝트를 진행하면서 어려웠던 점은 무엇인가요?', 'dev', 'jobkorea', 5, false
FROM companies c WHERE c.slug = 'naver';

-- 네이버 - 기획/PM (pm)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '네이버 서비스 중 개선이 필요하다고 생각하는 기능은 무엇인가요?', 'pm', 'jobkorea', 1, false
FROM companies c WHERE c.slug = 'naver';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '왜 네이버에 지원했나요?', 'pm', 'jobkorea', 2, false
FROM companies c WHERE c.slug = 'naver';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, 'IT에 관심이 많은가요? 관심을 갖게 된 계기는?', 'pm', 'jobkorea', 3, false
FROM companies c WHERE c.slug = 'naver';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '네이버에 입사하면 무슨 일이 가장 하고 싶은가요?', 'pm', 'jobkorea', 4, false
FROM companies c WHERE c.slug = 'naver';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '데이터 기반으로 의사결정한 경험을 설명해주세요.', 'pm', 'velog', 5, false
FROM companies c WHERE c.slug = 'naver';

-- 네이버 - 마케팅 (marketing)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '삶의 철학은 무엇인가요?', 'marketing', 'jobkorea', 1, false
FROM companies c WHERE c.slug = 'naver';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '네이버에서 시행 중인 인사 제도 중에 마음에 드는 게 무엇인가요?', 'marketing', 'jobkorea', 2, false
FROM companies c WHERE c.slug = 'naver';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, 'OO서비스 많이 이용해 보셨나요? 어떤 점이 좋았나요?', 'marketing', 'jobkorea', 3, false
FROM companies c WHERE c.slug = 'naver';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '어려운 기술적 문제를 해결한 경험을 구체적으로 이야기해주세요.', 'marketing', 'jobkorea', 4, false
FROM companies c WHERE c.slug = 'naver';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '본인의 접근 방법과 실제 결과가 어땠는지 자세히 설명해주세요.', 'marketing', 'jobkorea', 5, false
FROM companies c WHERE c.slug = 'naver';


-- ===== 카카오 =====
-- 출처: Velog 카카오 합격 후기, 블라인드

-- 카카오 - 개발 (dev)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '이 기술을 왜 사용했는지 설명해주세요. 다른 대안은 고려하지 않았나요?', 'dev', 'velog', 1, false
FROM companies c WHERE c.slug = 'kakao';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '프로젝트에서 사용한 도구에 대해 설명할 수 있나요? 왜 사용했나요?', 'dev', 'velog', 2, false
FROM companies c WHERE c.slug = 'kakao';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '개념들 간의 연관성과 trade-off 관계를 설명해주세요.', 'dev', 'velog', 3, false
FROM companies c WHERE c.slug = 'kakao';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '협업에 있어서 어려웠던 점은 무엇이었나요?', 'dev', 'velog', 4, false
FROM companies c WHERE c.slug = 'kakao';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '카카오 말고 다른데도 지원하셨나요?', 'dev', 'velog', 5, false
FROM companies c WHERE c.slug = 'kakao';

-- 카카오 - 기획/PM (pm)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '본인의 장점과 단점은 무엇인가요?', 'pm', 'velog', 1, false
FROM companies c WHERE c.slug = 'kakao';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '왜 개발(또는 기획)을 하게 되었나요?', 'pm', 'velog', 2, false
FROM companies c WHERE c.slug = 'kakao';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '맞닥뜨린 어려움에서 어떤 노력을 해서 해결했나요?', 'pm', 'velog', 3, false
FROM companies c WHERE c.slug = 'kakao';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '그동안 어떻게 협업을 했나요?', 'pm', 'velog', 4, false
FROM companies c WHERE c.slug = 'kakao';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '카카오 서비스 중 사용자 경험이 아쉬운 부분이 있나요?', 'pm', 'velog', 5, false
FROM companies c WHERE c.slug = 'kakao';

-- 카카오 - 마케팅 (marketing)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '카카오 브랜드의 강점은 무엇이라고 생각하나요?', 'marketing', 'jobplanet', 1, false
FROM companies c WHERE c.slug = 'kakao';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '나를 각인시킬 수 있는 경험 3개를 말해주세요.', 'marketing', 'velog', 2, false
FROM companies c WHERE c.slug = 'kakao';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, 'MZ세대를 타겟으로 한 캠페인을 기획해주세요.', 'marketing', 'jobplanet', 3, false
FROM companies c WHERE c.slug = 'kakao';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '콘텐츠 마케팅에서 가장 중요한 요소는 무엇인가요?', 'marketing', 'jobplanet', 4, false
FROM companies c WHERE c.slug = 'kakao';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '개발자로서(또는 마케터로서) 어떤 매력이 있나요?', 'marketing', 'velog', 5, false
FROM companies c WHERE c.slug = 'kakao';


-- ===== 토스 =====
-- 출처: Velog, Medium 토스 합격 후기

-- 토스 - 개발 (dev)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '과제 코드에서 이 부분은 왜 이렇게 구현했나요?', 'dev', 'velog', 1, false
FROM companies c WHERE c.slug = 'toss';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '사용한 기술에 대한 근거를 설명해주세요. 비슷한 기술 대비 어떤 이점이 있나요?', 'dev', 'velog', 2, false
FROM companies c WHERE c.slug = 'toss';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '이력서에 있는 프로젝트에서 발생한 이슈와 해결 방법을 설명해주세요.', 'dev', 'velog', 3, false
FROM companies c WHERE c.slug = 'toss';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '어떤 생각으로 인생의 결정을 내렸고 방향을 잡아왔나요?', 'dev', 'velog', 4, false
FROM companies c WHERE c.slug = 'toss';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '본인의 가치관에 대해 얘기해주세요.', 'dev', 'velog', 5, false
FROM companies c WHERE c.slug = 'toss';

-- 토스 - 기획/PM (pm)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '토스가 기존 은행 앱과 다른 점은 무엇이라고 생각하나요?', 'pm', 'jobplanet', 1, false
FROM companies c WHERE c.slug = 'toss';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '복잡한 기능을 단순하게 만든 경험이 있나요?', 'pm', 'jobplanet', 2, false
FROM companies c WHERE c.slug = 'toss';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '포트폴리오에서 가장 자신 있는 프로젝트를 설명해주세요.', 'pm', 'velog', 3, false
FROM companies c WHERE c.slug = 'toss';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '이게 최선이었나를 자문자답 했던 과정을 설명해주세요.', 'pm', 'velog', 4, false
FROM companies c WHERE c.slug = 'toss';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '규제가 있는 산업에서 혁신하려면 어떻게 해야 할까요?', 'pm', 'jobplanet', 5, false
FROM companies c WHERE c.slug = 'toss';


-- ===== 쿠팡 =====
-- 출처: 잡코리아 쿠팡 면접질문, 사람인

-- 쿠팡 - 개발 (dev)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '정렬을 구현한 소스 중에 특정 변수를 사용한 이유는?', 'dev', 'jobkorea', 1, false
FROM companies c WHERE c.slug = 'coupang';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '정렬 중에 버블정렬을 사용하여 문제를 푼 이유는?', 'dev', 'jobkorea', 2, false
FROM companies c WHERE c.slug = 'coupang';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '문제 상황 발생 시 어떻게 대처했나요?', 'dev', 'saramin', 3, false
FROM companies c WHERE c.slug = 'coupang';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '업무 우선순위가 있다면 어떻게 진행했나요?', 'dev', 'saramin', 4, false
FROM companies c WHERE c.slug = 'coupang';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '상사가 자신을 어떻게 평가했나요?', 'dev', 'saramin', 5, false
FROM companies c WHERE c.slug = 'coupang';

-- 쿠팡 - 물류/운영 (operations)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '쿠팡은 업무가 세분화돼 있어서 하시는 일이 한정적인데, 이런 점은 괜찮으신가요?', 'operations', 'jobkorea', 1, false
FROM companies c WHERE c.slug = 'coupang';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '쿠팡맨의 업무를 어느 정도 알고 지원했나요?', 'operations', 'jobkorea', 2, false
FROM companies c WHERE c.slug = 'coupang';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '센 클레임을 거는 고객이 있는데 어떻게 처리할 것인가요?', 'operations', 'jobkorea', 3, false
FROM companies c WHERE c.slug = 'coupang';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '회사의 방향성이 기존과 다르게 변화되었을 때 어떻게 생각하나요?', 'operations', 'jobkorea', 4, false
FROM companies c WHERE c.slug = 'coupang';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '조직생활에 대해서 어떻게 생각하나요?', 'operations', 'jobkorea', 5, false
FROM companies c WHERE c.slug = 'coupang';

-- 쿠팡 - MD/마케팅 (marketing)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '입사를 하게 되면 구체적으로 어떤 팀에 배치 받고 싶은가요?', 'marketing', 'jobkorea', 1, false
FROM companies c WHERE c.slug = 'coupang';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '이커머스 분야에서 일해본 적이 있나요?', 'marketing', 'jobkorea', 2, false
FROM companies c WHERE c.slug = 'coupang';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '인턴을 했을 당시 고객사와의 어려웠던 점은 무엇인가요?', 'marketing', 'jobkorea', 3, false
FROM companies c WHERE c.slug = 'coupang';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '쿠팡 말고 다른 곳에 합격했나요?', 'marketing', 'jobkorea', 4, false
FROM companies c WHERE c.slug = 'coupang';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '윗 상사가 불합리한 지시를 한다면 어떻게 하겠나요?', 'marketing', 'jobkorea', 5, false
FROM companies c WHERE c.slug = 'coupang';


-- ===== 배달의민족 =====
-- 출처: 잡코리아, 블로터, Medium

-- 배민 - 개발 (dev)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '서버 장애에 대처해본 경험이 있나요?', 'dev', 'bloter', 1, false
FROM companies c WHERE c.slug = 'baemin';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, 'Thread와 Process의 차이점에 대해 설명해보세요.', 'dev', 'bloter', 2, false
FROM companies c WHERE c.slug = 'baemin';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '트래픽 과부하가 발생할 경우 어떻게 할 것인가요?', 'dev', 'bloter', 3, false
FROM companies c WHERE c.slug = 'baemin';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '최신 기술 트렌드를 어떤 방법으로 쫓아가나요?', 'dev', 'bloter', 4, false
FROM companies c WHERE c.slug = 'baemin';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, 'Java는 어느 정도 다루나요?', 'dev', 'bloter', 5, false
FROM companies c WHERE c.slug = 'baemin';

-- 배민 - 기획/PM (pm)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '구성원들과 갈등이 생겼을 때 어떤 방식으로 해결할 수 있나요?', 'pm', 'bloter', 1, false
FROM companies c WHERE c.slug = 'baemin';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '우리 회사에 지원한 이유는 무엇이며, 우리 회사에 대해 얼마나 알고 있나요?', 'pm', 'bloter', 2, false
FROM companies c WHERE c.slug = 'baemin';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '자신의 장점과 단점이 무엇인가요?', 'pm', 'bloter', 3, false
FROM companies c WHERE c.slug = 'baemin';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '미래 자신의 모습을 설명해보세요.', 'pm', 'bloter', 4, false
FROM companies c WHERE c.slug = 'baemin';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '배달의민족/쿠팡이츠/요기요의 사업구조 차이가 무엇인가요?', 'pm', 'economile', 5, false
FROM companies c WHERE c.slug = 'baemin';

-- 배민 - 마케팅 (marketing)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '왜 배민인가요? 이 서비스여야 하는 이유를 말해주세요.', 'marketing', 'jobplanet', 1, false
FROM companies c WHERE c.slug = 'baemin';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '배민 광고 중 가장 인상 깊었던 것은 무엇인가요?', 'marketing', 'jobplanet', 2, false
FROM companies c WHERE c.slug = 'baemin';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '우리 회사에 대해 어떻게 생각하나요?', 'marketing', 'bloter', 3, false
FROM companies c WHERE c.slug = 'baemin';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '두 사업구조 중 어느 것이 고객 유치나 시장 침투에 더 우세할 것 같나요?', 'marketing', 'economile', 4, false
FROM companies c WHERE c.slug = 'baemin';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '배민다움이란 무엇이라고 생각하나요?', 'marketing', 'jobplanet', 5, false
FROM companies c WHERE c.slug = 'baemin';


-- ===== 당근마켓 =====
-- 출처: Velog, GitHub Gist, 링커리어

-- 당근 - 개발 (dev)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '진행했던 프로젝트에서 예상되는 문제 상황을 어떤 식으로 해결할 수 있나요?', 'dev', 'velog', 1, false
FROM companies c WHERE c.slug = 'daangn';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '이러한 기술들을 어떻게 배웠나요?', 'dev', 'github', 2, false
FROM companies c WHERE c.slug = 'daangn';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '왜 프로젝트에 이 기술을 도입했나요?', 'dev', 'github', 3, false
FROM companies c WHERE c.slug = 'daangn';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '시스템 디자인을 해보세요. (라이브 코딩)', 'dev', 'velog', 4, false
FROM companies c WHERE c.slug = 'daangn';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '단순히 기술의 사용법뿐 아니라 이론적인 부분이나 패러다임에 대해 설명해주세요.', 'dev', 'velog', 5, false
FROM companies c WHERE c.slug = 'daangn';

-- 당근 - 기획/PM (pm)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '당근마켓에 추가하고 싶은 기능이 있나요?', 'pm', 'linkareer', 1, false
FROM companies c WHERE c.slug = 'daangn';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '무엇을 했으며, 왜 했는지 설명해주세요.', 'pm', 'velog', 2, false
FROM companies c WHERE c.slug = 'daangn';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '당근마켓의 수익 모델을 제안해보세요.', 'pm', 'velog', 3, false
FROM companies c WHERE c.slug = 'daangn';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '채용 공고의 핵심 키워드에 맞춰 자신의 경험을 설명해주세요.', 'pm', 'velog', 4, false
FROM companies c WHERE c.slug = 'daangn';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '문제 해결에 정해진 답이 없을 때 어떻게 접근하나요?', 'pm', 'velog', 5, false
FROM companies c WHERE c.slug = 'daangn';


-- ==========================================
-- 대기업
-- ==========================================

-- ===== 삼성전자 =====
-- 출처: 잡코리아 삼성전자 면접질문 454건, 링커리어

-- 삼성전자 - SW/엔지니어 (engineer)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '오버라이딩과 오버로딩은 무슨 차이가 있나요?', 'engineer', 'jobkorea', 1, false
FROM companies c WHERE c.slug = 'samsung';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '반도체 8대 공정 중 일하고 싶은 분야는 어디인가요?', 'engineer', 'jobkorea', 2, false
FROM companies c WHERE c.slug = 'samsung';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '수율을 올리고 싶다고 했는데, 실제로 수율이 프로그래밍만으로 올릴 수 있나요?', 'engineer', 'jobkorea', 3, false
FROM companies c WHERE c.slug = 'samsung';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '왜 삼성전자 파운더리 사업부에 지원했나요?', 'engineer', 'jobkorea', 4, false
FROM companies c WHERE c.slug = 'samsung';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '대학 시절 협업을 하면서 힘들었던 경험과 이를 극복한 경험에 대해 말해주세요.', 'engineer', 'jobkorea', 5, false
FROM companies c WHERE c.slug = 'samsung';

-- 삼성전자 - 영업/마케팅 (marketing)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '삼성전자가 본인에게 어떤 이미지인가요?', 'marketing', 'jobkorea', 1, false
FROM companies c WHERE c.slug = 'samsung';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '남들에게 들은 본인의 단점 한 가지를 이야기해주세요.', 'marketing', 'jobkorea', 2, false
FROM companies c WHERE c.slug = 'samsung';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '왜 MX 사업부인가요?', 'marketing', 'jobkorea', 3, false
FROM companies c WHERE c.slug = 'samsung';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '학부연구생을 했으면 대학원 진학 생각이 있는 건가요?', 'marketing', 'jobkorea', 4, false
FROM companies c WHERE c.slug = 'samsung';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '삼성전자를 왜 지원했고, 어떤 점에 기여할 수 있나요?', 'marketing', 'linkareer', 5, false
FROM companies c WHERE c.slug = 'samsung';

-- 삼성전자 - 생산/품질 (production)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '생산성 확보와 안전조치 사이의 시간 트레이드오프 상황에서 어떻게 할 건가요?', 'production', 'jobkorea', 1, false
FROM companies c WHERE c.slug = 'samsung';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '부유입자 측정장비의 원리에 대해 말해보세요.', 'production', 'jobkorea', 2, false
FROM companies c WHERE c.slug = 'samsung';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '어떤 공정에 관심있거나 가고 싶나요?', 'production', 'jobkorea', 3, false
FROM companies c WHERE c.slug = 'samsung';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '환경공학부를 선택한 이유는 무엇인가요?', 'production', 'jobkorea', 4, false
FROM companies c WHERE c.slug = 'samsung';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '환경공학부를 하면서 복수전공을 하지 않은 이유는?', 'production', 'jobkorea', 5, false
FROM companies c WHERE c.slug = 'samsung';


-- ===== SK하이닉스 =====
-- 출처: 잡코리아 SK하이닉스 면접질문 209건, 캐치

-- SK하이닉스 - 엔지니어 (engineer)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, 'DRAM과 NAND flash의 차이는 무엇인가요?', 'engineer', 'jobkorea', 1, false
FROM companies c WHERE c.slug = 'skhynix';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '지원한 직무 관련해서 공부한 것을 자유롭게 이야기해보세요.', 'engineer', 'jobkorea', 2, false
FROM companies c WHERE c.slug = 'skhynix';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '해당 직무에 언제부터 관심을 가지게 된 건가요?', 'engineer', 'jobkorea', 3, false
FROM companies c WHERE c.slug = 'skhynix';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '양산기술P&T에서 특별히 관심 있는 직무가 있나요?', 'engineer', 'jobkorea', 4, false
FROM companies c WHERE c.slug = 'skhynix';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '왜 삼성 안 가고 여기 오나요?', 'engineer', 'jobkorea', 5, false
FROM companies c WHERE c.slug = 'skhynix';

-- SK하이닉스 - 생산/공정 (production)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '교대근무, 팹근무 괜찮나요?', 'production', 'jobkorea', 1, false
FROM companies c WHERE c.slug = 'skhynix';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '학점이 다른 지원자에 비해 높지 않은데 대학생활을 어떻게 보냈나요?', 'production', 'jobkorea', 2, false
FROM companies c WHERE c.slug = 'skhynix';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '졸업 후 일 년간의 공백기를 어떻게 보냈나요?', 'production', 'jobkorea', 3, false
FROM companies c WHERE c.slug = 'skhynix';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '들어오면 어느 쪽 일을 하고 싶나요?', 'production', 'jobkorea', 4, false
FROM companies c WHERE c.slug = 'skhynix';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '장점으로 문제해결력, 소통 얘기하셨는데 구체적인 사례는 무엇인가요?', 'production', 'jobkorea', 5, false
FROM companies c WHERE c.slug = 'skhynix';


-- ===== LG전자 =====
-- 출처: 잡코리아 LG전자 면접후기 79건, 링커리어, 자소설닷컴

-- LG전자 - 엔지니어 (engineer)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, 'LG전자의 가전제품 중 가장 관심 있는 제품은? 제품 관련 아이디어가 있다면?', 'engineer', 'linkareer', 1, false
FROM companies c WHERE c.slug = 'lg';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, 'LG전자에 입사한다면 연구개발에 참여하고 싶은 제품은 무엇인가요?', 'engineer', 'linkareer', 2, false
FROM companies c WHERE c.slug = 'lg';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '청소기의 소음이 저감되는 게 마냥 좋은 것일까요?', 'engineer', 'linkareer', 3, false
FROM companies c WHERE c.slug = 'lg';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '자신이 생각하기에 나라는 사람이 10점 만점 중 몇 점이라고 생각하나요?', 'engineer', 'linkareer', 4, false
FROM companies c WHERE c.slug = 'lg';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, 'LG전자가 너를 뽑아야 하는 이유는 무엇인가요?', 'engineer', 'linkareer', 5, false
FROM companies c WHERE c.slug = 'lg';

-- LG전자 - 마케팅 (marketing)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, 'LG전자가 올드하다는 이미지가 있다. 젊은 브랜드 이미지로 거듭나기 위한 방향성을 제시해주세요.', 'marketing', 'linkareer', 1, false
FROM companies c WHERE c.slug = 'lg';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '워라밸이 무엇이라 생각하나요? 저희 회사가 워라밸이 강점인 회사라 여쭤봅니다.', 'marketing', 'linkareer', 2, false
FROM companies c WHERE c.slug = 'lg';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '딸기, 바나나, 수박 중 하나를 갖고, 하나를 주고, 하나를 버려야 한다면? 왜 그런 선택을 하나요?', 'marketing', 'linkareer', 3, false
FROM companies c WHERE c.slug = 'lg';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '프리미엄 가전 시장에서의 포지셔닝 전략은 무엇인가요?', 'marketing', 'jobplanet', 4, false
FROM companies c WHERE c.slug = 'lg';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '경쟁사(삼성) 대비 LG의 차별화 포인트는 무엇인가요?', 'marketing', 'jobplanet', 5, false
FROM companies c WHERE c.slug = 'lg';

-- LG전자 - 생산 (production)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '현재 오후 1시이다. 다음날 오전 8시까지 2가지 업무를 끝내야 한다. 하지만 하나의 업무를 끝내기 위해서는 10시간이 필요하다. 어떻게 대처하겠는가?', 'production', 'linkareer', 1, false
FROM companies c WHERE c.slug = 'lg';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '품질 이슈 발생 시 대응 프로세스는 어떻게 되나요?', 'production', 'jobplanet', 2, false
FROM companies c WHERE c.slug = 'lg';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '스마트 팩토리에 대해 아는 대로 설명해주세요.', 'production', 'jobplanet', 3, false
FROM companies c WHERE c.slug = 'lg';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '원가 절감을 위한 아이디어가 있나요?', 'production', 'jobplanet', 4, false
FROM companies c WHERE c.slug = 'lg';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '해외 공장 파견 근무에 대해 어떻게 생각하나요?', 'production', 'jobplanet', 5, false
FROM companies c WHERE c.slug = 'lg';


-- ===== 현대자동차 =====
-- 출처: 잡코리아 현대자동차 면접질문 363건, 링커리어, 코멘토

-- 현대자동차 - R&D/엔지니어 (engineer)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '배터리 제조공정에서 가장 중요한 것은 무엇인가요?', 'engineer', 'jobkorea', 1, false
FROM companies c WHERE c.slug = 'hyundai';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '전고체 배터리가 부피팽창이 이루어지지 않는 이유는 무엇인가요?', 'engineer', 'jobkorea', 2, false
FROM companies c WHERE c.slug = 'hyundai';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '유한요소 모델링을 해본 적이 있나요?', 'engineer', 'jobkorea', 3, false
FROM companies c WHERE c.slug = 'hyundai';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '해석 결과가 실제랑 상관관계가 안 될 때 검증 경험은 있나요?', 'engineer', 'jobkorea', 4, false
FROM companies c WHERE c.slug = 'hyundai';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '프로젝트를 진행하면서 갈등이나 어려운 점 없었나요?', 'engineer', 'jobkorea', 5, false
FROM companies c WHERE c.slug = 'hyundai';

-- 현대자동차 - 생산 (production)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '제조업 아르바이트를 굳이 왜 했나요?', 'production', 'jobkorea', 1, false
FROM companies c WHERE c.slug = 'hyundai';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '범퍼 교체 업무 하면서 느낀 점은 무엇인가요?', 'production', 'jobkorea', 2, false
FROM companies c WHERE c.slug = 'hyundai';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '부품 단위의 직접 원가를 줄이는 것에 대해 어떻게 생각하나요?', 'production', 'jobkorea', 3, false
FROM companies c WHERE c.slug = 'hyundai';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '차종 손익 기획 시 가장 중요하게 보는 기준은 무엇인가요?', 'production', 'jobkorea', 4, false
FROM companies c WHERE c.slug = 'hyundai';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '울산/아산 공장 근무가 가능한가요?', 'production', 'jobplanet', 5, false
FROM companies c WHERE c.slug = 'hyundai';

-- 현대자동차 - 영업 (sales)
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '저관여 고객들을 끌어들이기 위한 마케팅 방안은 무엇인가요?', 'sales', 'jobkorea', 1, false
FROM companies c WHERE c.slug = 'hyundai';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '개인적으로 가장 사고 싶은 자동차는 무엇인가요?', 'sales', 'jobkorea', 2, false
FROM companies c WHERE c.slug = 'hyundai';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '경쟁 브랜드 대비 현대차의 영업 전략은 무엇인가요?', 'sales', 'jobplanet', 3, false
FROM companies c WHERE c.slug = 'hyundai';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '법인 영업과 개인 영업의 차이점은 무엇인가요?', 'sales', 'jobplanet', 4, false
FROM companies c WHERE c.slug = 'hyundai';

INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, '판매 목표를 달성한 경험을 설명해주세요.', 'sales', 'jobplanet', 5, false
FROM companies c WHERE c.slug = 'hyundai';


-- 회사별 질문 수 업데이트
UPDATE companies c
SET question_count = (
  SELECT COUNT(*) FROM questions q WHERE q.company_id = c.id
);

-- 결과 확인
SELECT
  c.name as company,
  q.category as job_type,
  COUNT(*) as question_count
FROM questions q
JOIN companies c ON q.company_id = c.id
GROUP BY c.name, q.category
ORDER BY c.name, q.category;
