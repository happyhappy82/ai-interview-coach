# 잡플래닛 면접 질문 크롤러

회사별 면접 질문을 잡플래닛에서 수집하는 크롤러입니다.

## 설치

```bash
# puppeteer 설치
npm install puppeteer

# ts-node 설치 (없는 경우)
npm install -D ts-node
```

## 환경 변수 설정

`.env.local`에 다음 환경 변수가 필요합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # anon key가 아닌 service role key 필요
```

## 실행 방법

```bash
# 프로젝트 루트에서 실행
npx ts-node scripts/crawlers/jobplanet-crawler.ts
```

## 크롤링 대상 회사

`config.ts`에서 대상 회사를 설정할 수 있습니다:

- 빅테크/IT: 네이버, 카카오, 토스, 쿠팡, 배달의민족, 당근마켓
- 대기업: 삼성전자, SK하이닉스, LG전자, 현대자동차

## 주의사항

1. **로그인 필요**: 잡플래닛은 면접 후기 조회 시 로그인이 필요할 수 있습니다.
2. **Rate Limiting**: 과도한 크롤링은 IP 차단을 유발할 수 있습니다. `config.ts`에서 딜레이를 조절하세요.
3. **법적 고려**: 크롤링한 데이터의 저작권을 확인하고, 출처를 명시하세요.
4. **교육/연구 목적**: 이 크롤러는 교육/연구 목적으로만 사용하세요.

## 크롤러 흐름

1. 대상 회사 목록 로드
2. 각 회사의 잡플래닛 면접후기 페이지 크롤링
3. 면접 질문 추출
4. 중복 질문 제거
5. Supabase `questions` 테이블에 저장
6. 질문 순서 및 회사별 질문 수 업데이트

## 수동으로 질문 추가

크롤링 대신 수동으로 질문을 추가할 수도 있습니다:

```sql
INSERT INTO questions (company_id, title, category, source, order, is_custom)
SELECT
  c.id,
  '질문 내용',
  'general',
  'manual',
  1,
  false
FROM companies c WHERE c.slug = 'naver';
```
