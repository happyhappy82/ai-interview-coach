import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/questions/[id]
 * 질문 삭제 API
 *
 * 동작:
 * - 커스텀 질문 (is_custom=true): DB에서 완전 삭제 (Hard Delete)
 * - 기본 질문 (is_custom=false): 현재 사용자에게만 숨김 (Soft Delete)
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // 1. 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. 질문 조회 (커스텀 여부 확인)
    const { data: question, error: fetchError } = await supabase
      .from('questions')
      .select('id, is_custom, user_id')
      .eq('id', params.id)
      .single()

    if (fetchError || !question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // 3-A. HARD DELETE: 내가 만든 커스텀 질문
    if (question.is_custom && question.user_id === user.id) {
      const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .eq('id', params.id)
        .eq('user_id', user.id) // 이중 검증 (RLS도 확인)

      if (deleteError) {
        console.error('Hard delete error:', deleteError)
        return NextResponse.json(
          { error: 'Failed to delete question' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Question deleted successfully',
        deletionType: 'hard',
      })
    }

    // 3-B. SOFT DELETE: 기본 질문 (현재 사용자에게만 숨김)
    if (!question.is_custom) {
      const { error: hideError } = await supabase
        .from('hidden_questions')
        .insert({
          user_id: user.id,
          question_id: params.id,
        })

      if (hideError) {
        // 이미 숨긴 질문 (unique constraint 위반)
        if (hideError.code === '23505') {
          return NextResponse.json(
            { error: 'Question already hidden' },
            { status: 409 }
          )
        }

        console.error('Soft delete error:', hideError)
        return NextResponse.json(
          { error: 'Failed to hide question' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Question hidden successfully',
        deletionType: 'soft',
      })
    }

    // 3-C. 권한 없음: 다른 사용자의 커스텀 질문
    return NextResponse.json(
      { error: 'Cannot delete questions owned by other users' },
      { status: 403 }
    )
  } catch (error) {
    console.error('Unexpected error in DELETE /api/questions/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
