import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/prompts/by-key/[key] - key_name으로 프롬프트 조회
// 예: /api/prompts/by-key/interviewer_persona
export async function GET(
  request: Request,
  { params }: { params: { key: string } }
) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('system_prompts')
      .select('*')
      .eq('key_name', params.key)
      .eq('is_active', true)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
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
