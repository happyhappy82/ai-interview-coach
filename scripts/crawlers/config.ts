/**
 * 크롤링 대상 회사 설정
 * jobplanetId는 잡플래닛 회사 페이지 URL에서 확인 가능
 * 예: https://www.jobplanet.co.kr/companies/88738/interviews → jobplanetId: '88738'
 */
export const TARGET_COMPANIES = [
  // 빅테크/IT
  { name: '네이버', jobplanetId: '88738', slug: 'naver', category: 'bigtech' },
  { name: '카카오', jobplanetId: '61054', slug: 'kakao', category: 'bigtech' },
  { name: '토스', jobplanetId: '242785', slug: 'toss', category: 'bigtech' },
  { name: '쿠팡', jobplanetId: '79700', slug: 'coupang', category: 'bigtech' },
  { name: '배달의민족', jobplanetId: '119432', slug: 'baemin', category: 'bigtech' },
  { name: '당근마켓', jobplanetId: '295186', slug: 'daangn', category: 'bigtech' },

  // 대기업
  { name: '삼성전자', jobplanetId: '1', slug: 'samsung', category: 'conglomerate' },
  { name: 'SK하이닉스', jobplanetId: '86665', slug: 'skhynix', category: 'conglomerate' },
  { name: 'LG전자', jobplanetId: '55', slug: 'lg', category: 'conglomerate' },
  { name: '현대자동차', jobplanetId: '173', slug: 'hyundai', category: 'conglomerate' },
] as const

export type TargetCompany = typeof TARGET_COMPANIES[number]

export interface CrawledQuestion {
  companySlug: string
  question: string
  jobPosition: string
  sourceUrl: string
  crawledAt: Date
}

// 크롤링 설정
export const CRAWL_CONFIG = {
  // 페이지당 대기 시간 (ms) - rate limiting 방지
  pageDelay: 2000,
  // 회사당 최대 크롤링 페이지 수
  maxPagesPerCompany: 10,
  // 중복 질문 제거 시 유사도 임계값 (0-1)
  similarityThreshold: 0.8,
}
