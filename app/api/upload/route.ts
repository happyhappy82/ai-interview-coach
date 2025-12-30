/**
 * Storage 업로드 API
 * scenarios.md Case 3-1, Case 3-3 대응
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Case 3-3: 토큰 만료 체크 및 갱신
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Session expired. Please login again.' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const questionId = formData.get('questionId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 파일명 생성: userId_timestamp_questionId.extension
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const fileName = `${user.id}/${timestamp}_${questionId}.${extension}`

    // Supabase Storage에 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('interviews')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)

      // Case 3-1: 오프라인 에러 처리
      if (uploadError.message.includes('network')) {
        return NextResponse.json(
          {
            error: 'Network error. Please check your connection and try again.',
            retryable: true
          },
          { status: 503 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Public URL 생성
    const { data: urlData } = supabase.storage
      .from('interviews')
      .getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      path: uploadData.path,
      url: urlData.publicUrl,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
