-- 실제 면접 질문으로 업데이트
-- 웹 검색을 통해 수집한 실제 면접 후기 기반 질문들

-- 기존 샘플 질문 삭제
DELETE FROM questions WHERE source = 'sample' OR source = 'manual';

-- 네이버 실제 면접 질문
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, q.title, q.category, 'web_search', q.ord, false
FROM companies c,
(VALUES
  ('자기소개와 지원동기를 말씀해주세요.', 'general', 1),
  ('네이버에서 인사팀이 무슨 역할을 할 수 있다고 생각하나요?', 'general', 2),
  ('삶의 철학은 무엇인가요?', 'general', 3),
  ('왜 네이버에 지원했나요?', 'general', 4),
  ('IT에 관심이 많은가요? 어떤 IT 트렌드에 관심이 있나요?', 'general', 5),
  ('네이버에 입사하면 가장 하고 싶은 일이 무엇인가요?', 'general', 6),
  ('네이버에서 시행 중인 인사 제도 중 마음에 드는 것은 무엇인가요? 그 제도의 장단점은?', 'general', 7),
  ('프로젝트에서 가장 어려웠던 문제는 무엇이고 어떻게 해결했나요?', 'dev', 8),
  ('TCP 3-way handshake와 4-way handshake에 대해 설명해주세요.', 'dev', 9),
  ('자소서에 쓴 기술 스택에 대해 자세히 설명해주세요.', 'dev', 10),
  ('GitHub에 있는 프로젝트 코드에 대해 설명해주세요.', 'dev', 11),
  ('팀 프로젝트에서 갈등이 있었던 경험과 해결 방법을 말씀해주세요.', 'general', 12),
  ('본인의 강점과 약점은 무엇인가요?', 'general', 13),
  ('최근에 읽은 기술 관련 아티클이나 책이 있나요?', 'dev', 14),
  ('5년 후 본인의 모습을 그려본다면?', 'general', 15)
) AS q(title, category, ord)
WHERE c.slug = 'naver';

-- 카카오 실제 면접 질문
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, q.title, q.category, 'web_search', q.ord, false
FROM companies c,
(VALUES
  ('자기소개를 해주세요.', 'general', 1),
  ('카카오에 지원한 동기가 무엇인가요?', 'general', 2),
  ('카카오쇼핑라이브를 이용해본 경험이 있나요? 어떤 점이 좋았나요?', 'general', 3),
  ('카카오 서비스 중 아쉬운 점이 있다면? 어떻게 개선하면 좋을까요?', 'general', 4),
  ('업무를 할 때 본인의 장단점은 무엇인가요?', 'general', 5),
  ('단점을 극복하기 위해 어떤 노력을 하고 있나요?', 'general', 6),
  ('본인의 최종 커리어 목표는 무엇인가요?', 'general', 7),
  ('해당 직무가 커리어 목표에 어떻게 도움이 될 것 같나요?', 'general', 8),
  ('TCP 3-way handshake와 4-way handshake를 설명해주세요.', 'dev', 9),
  ('프로젝트에서 사용한 기술 스택을 선택한 이유는 무엇인가요?', 'dev', 10),
  ('협업 시 의견 충돌이 있었던 경험과 해결 방법을 말씀해주세요.', 'general', 11),
  ('카카오의 어떤 가치관이 본인과 잘 맞는다고 생각하나요?', 'general', 12),
  ('최근 진행한 프로젝트에 대해 설명해주세요.', 'dev', 13),
  ('코드 리뷰 경험이 있나요? 어떻게 진행했나요?', 'dev', 14),
  ('스트레스 상황에서 어떻게 대처하나요?', 'general', 15)
) AS q(title, category, ord)
WHERE c.slug = 'kakao';

-- 토스 실제 면접 질문
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, q.title, q.category, 'web_search', q.ord, false
FROM companies c,
(VALUES
  ('자기소개와 지원동기를 말씀해주세요.', 'general', 1),
  ('토스가 다른 핀테크 회사와 다른 경쟁력은 무엇이라고 생각하나요?', 'general', 2),
  ('인생에서 가장 중요한 가치관은 무엇인가요?', 'general', 3),
  ('지금까지 인생에서 가장 어려웠던 결정은 무엇이었나요?', 'general', 4),
  ('토스의 8가지 핵심 가치 중 본인과 가장 맞는 것은 무엇인가요?', 'general', 5),
  ('왜 금융/핀테크 분야에서 일하고 싶나요?', 'general', 6),
  ('팀에서 갈등이 생겼을 때 어떻게 해결하나요?', 'general', 7),
  ('실패한 경험이 있다면 무엇이고, 그로부터 무엇을 배웠나요?', 'general', 8),
  ('과제 코드에서 이 아키텍처를 선택한 이유가 무엇인가요?', 'dev', 9),
  ('프로젝트에서 발생 가능한 문제 상황에 어떻게 대처하겠나요?', 'dev', 10),
  ('이력서에 있는 프로젝트 중 가장 자신 있는 것을 설명해주세요.', 'dev', 11),
  ('본인이 생각하는 좋은 코드란 무엇인가요?', 'dev', 12),
  ('5년 후 어떤 모습이 되어있고 싶나요?', 'general', 13),
  ('토스에서 어떤 임팩트를 만들고 싶나요?', 'general', 14),
  ('최근에 관심 있게 본 기술 트렌드가 있나요?', 'dev', 15)
) AS q(title, category, ord)
WHERE c.slug = 'toss';

-- 쿠팡 실제 면접 질문
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, q.title, q.category, 'web_search', q.ord, false
FROM companies c,
(VALUES
  ('자기소개를 해주세요.', 'general', 1),
  ('쿠팡에 지원한 이유가 무엇인가요?', 'general', 2),
  ('쿠팡 그로스사업에 대해 알고 있나요? 어떤 직무를 할 것 같나요?', 'general', 3),
  ('이커머스 분야에서 일해본 적이 있나요?', 'general', 4),
  ('현재 직장에서 어떤 업무를 담당하고 있나요?', 'general', 5),
  ('업무 중 문제 상황이 발생하면 어떻게 대처하나요?', 'general', 6),
  ('업무 우선순위를 어떻게 정하나요?', 'general', 7),
  ('상사가 본인을 어떻게 평가했나요?', 'general', 8),
  ('쿠팡의 15가지 인재상 중 본인과 가장 맞는 것은 무엇인가요?', 'general', 9),
  ('고객이 강한 클레임을 걸면 어떻게 처리하겠나요?', 'general', 10),
  ('입사 후 어떤 일을 해보고 싶나요?', 'general', 11),
  ('팀원과 의견이 다를 때 어떻게 조율하나요?', 'general', 12),
  ('리더십을 발휘한 경험이 있나요?', 'general', 13),
  ('본인의 강점과 약점은 무엇인가요?', 'general', 14),
  ('쿠팡에 대해 얼마나 알고 있나요?', 'general', 15)
) AS q(title, category, ord)
WHERE c.slug = 'coupang';

-- 배달의민족 실제 면접 질문
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, q.title, q.category, 'web_search', q.ord, false
FROM companies c,
(VALUES
  ('자기소개를 해주세요.', 'general', 1),
  ('배달의민족에 지원한 동기가 무엇인가요?', 'general', 2),
  ('배달의민족 서비스에 대해 얼마나 알고 있나요?', 'general', 3),
  ('구성원들과 갈등이 생겼을 때 어떻게 해결하나요?', 'general', 4),
  ('본인의 장점과 단점은 무엇인가요?', 'general', 5),
  ('우아한형제들에 대해 어떻게 생각하나요?', 'general', 6),
  ('미래 본인의 모습을 설명해주세요.', 'general', 7),
  ('좋은 회사란 무엇이라고 생각하나요?', 'general', 8),
  ('전공 관련해서 가장 자신 있는 분야는 무엇인가요?', 'dev', 9),
  ('프로젝트에서 어떤 역할을 주로 맡았나요?', 'dev', 10),
  ('협업 경험 중 가장 기억에 남는 것은 무엇인가요?', 'general', 11),
  ('문제 해결 능력을 보여줄 수 있는 경험이 있나요?', 'general', 12),
  ('왜 개발자가 되고 싶나요?', 'dev', 13),
  ('기술적으로 가장 어려웠던 문제는 무엇이었나요?', 'dev', 14),
  ('배민다움이란 무엇이라고 생각하나요?', 'general', 15)
) AS q(title, category, ord)
WHERE c.slug = 'baemin';

-- 당근마켓 실제 면접 질문
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, q.title, q.category, 'web_search', q.ord, false
FROM companies c,
(VALUES
  ('자기소개를 해주세요.', 'general', 1),
  ('당근마켓에 지원한 이유가 무엇인가요?', 'general', 2),
  ('프로젝트에서 어떤 문제를 풀고 싶었나요?', 'dev', 3),
  ('만약 다시 의사결정을 한다면 같은 결정을 하실 건가요?', 'dev', 4),
  ('이 기술을 선택한 이유가 무엇인가요? 다른 대안은 고려해보셨나요?', 'dev', 5),
  ('프로젝트에서 가장 어려웠던 부분은 무엇이었나요?', 'dev', 6),
  ('사용한 기술의 내부 동작 원리를 설명해주세요.', 'dev', 7),
  ('시스템 디자인: 대용량 트래픽을 처리하는 방법은?', 'dev', 8),
  ('프로덕트 관점에서 개선하고 싶은 점이 있나요?', 'general', 9),
  ('팀에서 어떤 역할을 주로 맡나요?', 'general', 10),
  ('협업 시 의견 충돌을 어떻게 해결하나요?', 'general', 11),
  ('당근마켓 서비스를 사용해보셨나요? 개선점이 있다면?', 'general', 12),
  ('왜 이 기술을 배우게 되었나요?', 'dev', 13),
  ('본인만의 개발 철학이 있나요?', 'dev', 14),
  ('5년 후 어떤 개발자가 되어있고 싶나요?', 'general', 15)
) AS q(title, category, ord)
WHERE c.slug = 'daangn';

-- 삼성전자 실제 면접 질문
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, q.title, q.category, 'web_search', q.ord, false
FROM companies c,
(VALUES
  ('1분 자기소개를 해주세요.', 'general', 1),
  ('삼성전자가 본인에게 어떤 이미지인가요?', 'general', 2),
  ('반도체 회사 지원동기와 삼성전자 지원동기를 말씀해주세요.', 'general', 3),
  ('다른 회사도 지원했나요? 어디를 지원했나요?', 'general', 4),
  ('반도체 관련 전공을 듣지 않았는데 왜 반도체 회사에 지원했나요?', 'general', 5),
  ('왜 해당 직무(품질관리 등)에 지원했나요?', 'general', 6),
  ('삼성전자에 입사하면 회사에 어떻게 기여할 수 있나요?', 'general', 7),
  ('최근 삼성전자 관련 뉴스 중 인상 깊었던 것이 있나요?', 'general', 8),
  ('이력서에 공백기가 있는데 그때 무엇을 했나요?', 'general', 9),
  ('팀 프로젝트에서 갈등 상황을 어떻게 해결했나요?', 'general', 10),
  ('본인의 강점을 직무와 연결해서 설명해주세요.', 'general', 11),
  ('PT 면접: 주어진 문제를 어떻게 풀었는지 설명해주세요.', 'dev', 12),
  ('입사 후 10년 후의 모습을 그려본다면?', 'general', 13),
  ('리더십을 발휘한 경험이 있나요?', 'general', 14),
  ('삼성전자에서 일하면서 이루고 싶은 목표는 무엇인가요?', 'general', 15)
) AS q(title, category, ord)
WHERE c.slug = 'samsung';

-- SK하이닉스 실제 면접 질문
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, q.title, q.category, 'web_search', q.ord, false
FROM companies c,
(VALUES
  ('1분 자기소개를 해주세요.', 'general', 1),
  ('SK하이닉스에 지원한 이유가 무엇인가요?', 'general', 2),
  ('반도체 회사가 많은데 왜 하이닉스를 선택했나요?', 'general', 3),
  ('SK하이닉스 관련 최신 뉴스를 본 적 있나요? 어떤 내용이었나요?', 'general', 4),
  ('직무와 관련해서 어떤 지식을 가지고 있고, 어떻게 활용할 건가요?', 'dev', 5),
  ('반도체 직무 관련 지식을 쌓기 위해 어떤 노력을 했나요?', 'dev', 6),
  ('SCE(Short Channel Effect)에 대해 설명해주세요.', 'dev', 7),
  ('포토 공정에 대해 설명해주세요.', 'dev', 8),
  ('DRAM과 NAND의 차이점은 무엇인가요?', 'dev', 9),
  ('남들은 당신을 어떤 사람으로 평가하나요?', 'general', 10),
  ('그 연구 분야를 선택한 이유가 무엇인가요?', 'general', 11),
  ('팀 프로젝트 경험과 본인의 역할을 말씀해주세요.', 'general', 12),
  ('입사 후 어떤 업무를 하고 싶나요?', 'general', 13),
  ('본인의 강점과 약점은 무엇인가요?', 'general', 14),
  ('SK 인재상 중 본인과 가장 맞는 것은 무엇인가요?', 'general', 15)
) AS q(title, category, ord)
WHERE c.slug = 'skhynix';

-- LG전자 실제 면접 질문
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, q.title, q.category, 'web_search', q.ord, false
FROM companies c,
(VALUES
  ('자기소개를 해주세요.', 'general', 1),
  ('LG전자에 지원한 이유가 무엇인가요?', 'general', 2),
  ('LG전자 가전제품 중 가장 관심 있는 제품은 무엇인가요?', 'general', 3),
  ('해당 제품 관련 개선 아이디어가 있다면?', 'general', 4),
  ('청소기 소음이 저감되는 것이 무조건 좋은 것일까요?', 'general', 5),
  ('LG전자가 올드한 이미지가 있는데, 젊은 브랜드로 거듭나려면?', 'general', 6),
  ('입사하면 연구개발에 참여하고 싶은 제품은 무엇인가요?', 'dev', 7),
  ('내일 8시까지 두 가지 업무를 끝내야 하는데, 하나에 10시간이 필요하다면?', 'general', 8),
  ('본인을 10점 만점 중 몇 점이라고 평가하나요?', 'general', 9),
  ('함께 일하고 싶지 않은 사람 유형 3가지를 말씀해주세요.', 'general', 10),
  ('딸기, 바나나, 수박 중 하나를 갖고, 하나를 주고, 하나를 버린다면?', 'general', 11),
  ('전공 지식 중 LG전자에 적용할 수 있는 것은 무엇인가요?', 'dev', 12),
  ('PT 면접: 주어진 과제에 대한 해결방안을 발표해주세요.', 'dev', 13),
  ('팀 프로젝트에서 의견 충돌 경험과 해결 방법은?', 'general', 14),
  ('LG전자에서 이루고 싶은 목표는 무엇인가요?', 'general', 15)
) AS q(title, category, ord)
WHERE c.slug = 'lg';

-- 현대자동차 실제 면접 질문
INSERT INTO questions (company_id, title, category, source, "order", is_custom)
SELECT c.id, q.title, q.category, 'web_search', q.ord, false
FROM companies c,
(VALUES
  ('자기소개 PT를 해주세요. (5분)', 'general', 1),
  ('현대자동차에 지원한 동기가 무엇인가요?', 'general', 2),
  ('현대자동차 울산공장에 지원한 이유는 무엇인가요?', 'general', 3),
  ('부품 단위의 직접 원가를 줄이는 것에 대해 어떻게 생각하나요?', 'dev', 4),
  ('본인이 생각하는 소통이란? 소통으로 갈등을 해결한 경험은?', 'general', 5),
  ('본인의 단점이나 고칠 점은 무엇인가요?', 'general', 6),
  ('입사 후 하고 싶은 일은 무엇인가요?', 'general', 7),
  ('자율주행 기술에 대해 어떻게 생각하나요?', 'dev', 8),
  ('전기차 시장의 미래에 대한 본인의 견해는?', 'general', 9),
  ('현대자동차의 경쟁력은 무엇이라고 생각하나요?', 'general', 10),
  ('직무 관련 PT: 과제 문제 풀이 및 발표', 'dev', 11),
  ('영어로 자기소개를 해주세요. (영어 우대 직무)', 'general', 12),
  ('팀워크를 발휘한 경험을 말씀해주세요.', 'general', 13),
  ('스트레스 상황에서 어떻게 대처하나요?', 'general', 14),
  ('현대자동차에서 10년 후 어떤 모습이고 싶나요?', 'general', 15)
) AS q(title, category, ord)
WHERE c.slug = 'hyundai';

-- 회사별 질문 수 업데이트
UPDATE companies SET question_count = (
  SELECT COUNT(*) FROM questions WHERE questions.company_id = companies.id
);
