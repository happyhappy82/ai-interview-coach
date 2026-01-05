import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/questions?category=general - 기본 질문 + 사용자 커스텀 질문 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 기본 질문 (is_custom = false) + 사용자의 커스텀 질문 (is_custom = true, user_id = current user)
    let query = supabase
      .from('questions')
      .select('*')
      .or(`and(is_custom.eq.false${category ? `,category.eq.${category}` : ''}),and(is_custom.eq.true,user_id.eq.${user.id})`)
      .order('order', { ascending: true })

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
    const { title, evaluationContext } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
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
        evaluation_context: evaluationContext || '이 질문에 대한 답변을 STAR 기법에 따라 평가하세요.',
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
