import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Service role client for public data (bypasses RLS)
function getServiceRoleClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/questions?category=general&company=uuid - 기본 질문 + 사용자 커스텀 질문 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const companyId = searchParams.get('company')

    // 회사 ID가 지정된 경우: service role로 조회 (RLS 우회)
    if (companyId) {
      const serviceClient = getServiceRoleClient()
      const { data, error } = await serviceClient
        .from('questions')
        .select('*')
        .eq('company_id', companyId)
        .order('order', { ascending: true })

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { error: 'Failed to fetch questions' },
          { status: 500 }
        )
      }

      return NextResponse.json({ data })
    }

    // 기존 로직: 기본 질문 + 사용자 커스텀 질문
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. 사용자가 숨긴 질문 ID 목록 조회
    const { data: hiddenQuestions } = await supabase
      .from('hidden_questions')
      .select('question_id')
      .eq('user_id', user.id)

    const hiddenIds = hiddenQuestions?.map(h => h.question_id) || []

    // 2. 기본 질문 (is_custom = false, company_id = null) + 사용자의 커스텀 질문 (is_custom = true, user_id = current user)
    let query = supabase
      .from('questions')
      .select('*')
      .is('company_id', null) // 회사 프리셋이 아닌 질문만
      .or(`and(is_custom.eq.false${category ? `,category.eq.${category}` : ''}),and(is_custom.eq.true,user_id.eq.${user.id})`)
      .order('order', { ascending: true })

    // 3. 숨긴 질문 제외
    if (hiddenIds.length > 0) {
      query = query.not('id', 'in', `(${hiddenIds.join(',')})`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch questions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/questions - 커스텀 질문 생성
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    let { title, evaluationContext } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // 평가 기준이 비어있으면 AI가 자동 생성
    if (!evaluationContext || evaluationContext.trim() === '') {
      console.log('평가 기준 자동 생성 시작...')

      const geminiApiKey = process.env.GEMINI_API_KEY
      if (!geminiApiKey) {
        console.error('Gemini API key 없음')
        evaluationContext = '이 질문에 대한 답변을 STAR 기법에 따라 평가하세요.'
      } else {
        try {
          const prompt = `다음 면접 질문에 대한 평가 기준을 작성해주세요:

질문: "${title}"

위 질문에 답변할 때 AI가 평가해야 할 기준을 작성하세요. 다음 형식으로 작성해주세요:

이 질문은 지원자의 [평가 대상 역량]을 평가합니다.
다음 요소를 중점적으로 분석하세요:
1. [평가 요소 1]
2. [평가 요소 2]
3. [평가 요소 3]
4. [평가 요소 4]

200자 이내로 간결하게 작성하고, 백틱이나 마크다운 없이 순수 텍스트만 출력하세요.`

          const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${geminiApiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.7,
                  topK: 40,
                  topP: 0.95,
                  maxOutputTokens: 500,
                },
              }),
            }
          )

          if (geminiResponse.ok) {
            const geminiData = await geminiResponse.json()
            const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

            if (generatedText) {
              evaluationContext = generatedText.trim()
              console.log('평가 기준 자동 생성 완료:', evaluationContext)
            } else {
              evaluationContext = '이 질문에 대한 답변을 STAR 기법에 따라 평가하세요.'
            }
          } else {
            console.error('Gemini API 호출 실패')
            evaluationContext = '이 질문에 대한 답변을 STAR 기법에 따라 평가하세요.'
          }
        } catch (geminiError) {
          console.error('평가 기준 생성 실패:', geminiError)
          evaluationContext = '이 질문에 대한 답변을 STAR 기법에 따라 평가하세요.'
        }
      }
    }

    // 사용자의 커스텀 질문 개수 확인
    const { count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_custom', true)

    // 다음 order 값 계산
    const nextOrder = (count || 0) + 1

    // 커스텀 질문 생성
    const { data, error } = await supabase
      .from('questions')
      .insert({
        title,
        evaluation_context: evaluationContext,
        category: 'custom',
        order: nextOrder,
        user_id: user.id,
        is_custom: true,
      })
      .select()
      .single()

    if (error) {
      console.error('질문 생성 실패:', error)
      return NextResponse.json({ error: 'Failed to create question', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
