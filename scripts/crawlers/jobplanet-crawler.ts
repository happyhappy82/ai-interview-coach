/**
 * 잡플래닛 면접 후기 크롤러
 *
 * 사용법:
 * 1. puppeteer 설치: npm install puppeteer
 * 2. 실행: npx ts-node scripts/crawlers/jobplanet-crawler.ts
 *
 * 주의사항:
 * - 잡플래닛은 로그인이 필요할 수 있습니다
 * - 과도한 크롤링은 IP 차단을 유발할 수 있으니 적절한 딜레이를 설정하세요
 * - 이 크롤러는 교육/연구 목적으로만 사용하세요
 */

import puppeteer, { Browser, Page } from 'puppeteer'
import { createClient } from '@supabase/supabase-js'
import { TARGET_COMPANIES, CRAWL_CONFIG, CrawledQuestion, TargetCompany } from './config'

// Supabase 클라이언트 (환경 변수에서 가져옴)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // 서버 사이드용 키 필요

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getCompanyIdBySlug(slug: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('companies')
    .select('id')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    console.error(`회사를 찾을 수 없음: ${slug}`)
    return null
  }

  return data.id
}

async function crawlJobplanetInterviews(
  browser: Browser,
  company: TargetCompany
): Promise<CrawledQuestion[]> {
  const questions: CrawledQuestion[] = []
  const page = await browser.newPage()

  try {
    // User-Agent 설정
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )

    // 잡플래닛 면접후기 페이지 URL
    const baseUrl = `https://www.jobplanet.co.kr/companies/${company.jobplanetId}/interviews`

    console.log(`\n📍 ${company.name} 크롤링 시작: ${baseUrl}`)

    for (let pageNum = 1; pageNum <= CRAWL_CONFIG.maxPagesPerCompany; pageNum++) {
      const pageUrl = pageNum === 1 ? baseUrl : `${baseUrl}?page=${pageNum}`

      console.log(`  페이지 ${pageNum} 크롤링 중...`)

      await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 30000 })

      // 면접 후기 카드들 찾기
      const interviewCards = await page.$$('.content_body_ty1')

      if (interviewCards.length === 0) {
        console.log(`  더 이상 면접 후기가 없습니다.`)
        break
      }

      for (const card of interviewCards) {
        try {
          // 면접 질문 추출
          const questionElements = await card.$$('.interview_question')

          for (const questionEl of questionElements) {
            const questionText = await questionEl.evaluate((el) => el.textContent?.trim() || '')

            if (questionText && questionText.length > 10) {
              // 직무 정보 추출
              const positionEl = await card.$('.txt_job')
              const position = positionEl
                ? await positionEl.evaluate((el) => el.textContent?.trim() || 'general')
                : 'general'

              questions.push({
                companySlug: company.slug,
                question: questionText,
                jobPosition: position,
                sourceUrl: pageUrl,
                crawledAt: new Date(),
              })
            }
          }
        } catch (cardError) {
          console.error('  카드 파싱 에러:', cardError)
        }
      }

      console.log(`  페이지 ${pageNum} 완료: ${questions.length}개 질문 수집`)

      // Rate limiting 방지를 위한 딜레이
      await delay(CRAWL_CONFIG.pageDelay)
    }
  } catch (error) {
    console.error(`${company.name} 크롤링 에러:`, error)
  } finally {
    await page.close()
  }

  return questions
}

function removeDuplicateQuestions(questions: CrawledQuestion[]): CrawledQuestion[] {
  const seen = new Set<string>()
  const unique: CrawledQuestion[] = []

  for (const q of questions) {
    // 질문 정규화 (공백, 특수문자 제거)
    const normalized = q.question
      .toLowerCase()
      .replace(/[^가-힣a-z0-9]/g, '')
      .trim()

    if (!seen.has(normalized) && normalized.length > 10) {
      seen.add(normalized)
      unique.push(q)
    }
  }

  return unique
}

async function saveQuestionsToDatabase(questions: CrawledQuestion[]): Promise<void> {
  console.log(`\n💾 데이터베이스에 ${questions.length}개 질문 저장 중...`)

  for (const q of questions) {
    const companyId = await getCompanyIdBySlug(q.companySlug)
    if (!companyId) continue

    try {
      // 중복 체크 후 삽입
      const { error } = await supabase.from('questions').upsert(
        {
          company_id: companyId,
          title: q.question,
          category: q.jobPosition,
          source: 'jobplanet',
          source_url: q.sourceUrl,
          crawled_at: q.crawledAt.toISOString(),
          is_custom: false,
          order: 0, // 나중에 정렬
        },
        {
          onConflict: 'title,company_id',
          ignoreDuplicates: true,
        }
      )

      if (error) {
        console.error(`질문 저장 실패: ${q.question.substring(0, 30)}...`, error.message)
      }
    } catch (err) {
      console.error('저장 에러:', err)
    }
  }

  console.log('✅ 저장 완료!')
}

async function updateQuestionOrder(): Promise<void> {
  console.log('\n📊 질문 순서 업데이트 중...')

  // 각 회사별로 order 값 재설정
  const { data: companies } = await supabase.from('companies').select('id')

  if (!companies) return

  for (const company of companies) {
    const { data: questions } = await supabase
      .from('questions')
      .select('id')
      .eq('company_id', company.id)
      .order('created_at', { ascending: true })

    if (!questions) continue

    for (let i = 0; i < questions.length; i++) {
      await supabase.from('questions').update({ order: i + 1 }).eq('id', questions[i].id)
    }
  }

  console.log('✅ 순서 업데이트 완료!')
}

async function updateCompanyQuestionCounts(): Promise<void> {
  console.log('\n📈 회사별 질문 수 업데이트 중...')

  const { data: companies } = await supabase.from('companies').select('id')

  if (!companies) return

  for (const company of companies) {
    const { count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company.id)

    await supabase.from('companies').update({ question_count: count || 0 }).eq('id', company.id)
  }

  console.log('✅ 질문 수 업데이트 완료!')
}

async function main(): Promise<void> {
  console.log('🚀 잡플래닛 면접 질문 크롤러 시작\n')
  console.log('대상 회사:', TARGET_COMPANIES.map((c) => c.name).join(', '))

  const browser = await puppeteer.launch({
    headless: true, // true: 브라우저 창 안 보임, false: 보임 (디버깅용)
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const allQuestions: CrawledQuestion[] = []

    for (const company of TARGET_COMPANIES) {
      const questions = await crawlJobplanetInterviews(browser, company)
      allQuestions.push(...questions)
    }

    console.log(`\n📊 총 ${allQuestions.length}개 질문 수집 완료`)

    // 중복 제거
    const uniqueQuestions = removeDuplicateQuestions(allQuestions)
    console.log(`🔄 중복 제거 후: ${uniqueQuestions.length}개`)

    // 데이터베이스 저장
    await saveQuestionsToDatabase(uniqueQuestions)

    // 순서 업데이트
    await updateQuestionOrder()

    // 회사별 질문 수 업데이트
    await updateCompanyQuestionCounts()

    console.log('\n✨ 크롤링 완료!')
  } catch (error) {
    console.error('크롤러 에러:', error)
  } finally {
    await browser.close()
  }
}

// 실행
main().catch(console.error)
