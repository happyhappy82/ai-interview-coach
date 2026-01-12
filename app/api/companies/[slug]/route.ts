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

    // 해당 회사의 프리셋 목록 조회
    const { data: presets, error: presetsError } = await supabase
      .from('company_presets')
      .select('*')
      .eq('company_id', company.id)
      .order('is_default', { ascending: false })

    if (presetsError) {
      console.error('Error fetching presets:', presetsError)
    }

    return NextResponse.json({
      data: {
        ...company,
        presets: presets || []
      }
    })
  } catch (error) {
    console.error('Error in company detail API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
