import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient()
    const { slug } = await params

    // 회사 정보 조회
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // 기본 프리셋 조회
    const { data: preset, error: presetError } = await supabase
      .from('company_presets')
      .select('*')
      .eq('company_id', company.id)
      .eq('is_default', true)
      .single()

    if (presetError || !preset) {
      // 프리셋이 없으면 해당 회사의 모든 질문을 반환
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('company_id', company.id)
        .order('order', { ascending: true })
        .limit(10)

      if (questionsError) {
        return NextResponse.json(
          { error: 'Failed to fetch questions' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        data: questions || [],
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
          logo_url: company.logo_url
        }
      })
    }

    // 프리셋의 질문 ID로 질문 조회
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .in('id', preset.question_ids)

    if (questionsError) {
      return NextResponse.json(
        { error: 'Failed to fetch questions' },
        { status: 500 }
      )
    }

    // 프리셋 순서대로 정렬
    const orderedQuestions = preset.question_ids
      .map((id: string) => questions?.find((q) => q.id === id))
      .filter(Boolean)

    return NextResponse.json({
      data: orderedQuestions,
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        logo_url: company.logo_url
      },
      preset: {
        id: preset.id,
        name: preset.name
      }
    })
  } catch (error) {
    console.error('Error in quick-start API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
