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

    // Gemini로 음성 인식 (Safari/iOS 지원)
    let transcript = ''
    try {
      console.log('Gemini 음성 인식 시작...')
      const geminiApiKey = process.env.GEMINI_API_KEY

      if (geminiApiKey) {
        // 파일을 ArrayBuffer로 읽기
        const arrayBuffer = await file.arrayBuffer()
        const base64Audio = Buffer.from(arrayBuffer).toString('base64')

        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      inline_data: {
                        mime_type: file.type,
                        data: base64Audio,
                      },
                    },
                    {
                      text: '이 오디오에서 실제로 들리는 한국어 음성을 있는 그대로 텍스트로 변환하세요.\n\n중요:\n- 실제로 들린 말만 정확히 변환하세요\n- 추측하거나 예시를 만들지 마세요\n- 내용을 추가하거나 상상하지 마세요\n- 짧은 음성이라도 들린 그대로만 쓰세요\n- 만약 음성이 잘 들리지 않으면 "(알아들을 수 없음)"이라고 쓰세요',
                    },
                  ],
                },
              ],
            }),
          }
        )

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json()
          transcript = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''
          console.log('Gemini 음성 인식 완료:', transcript.substring(0, 50))
        } else {
          console.error('Gemini 음성 인식 실패:', await geminiResponse.text())
        }
      }
    } catch (transcriptError) {
      console.error('음성 인식 중 오류 (계속 진행):', transcriptError)
      // 음성 인식 실패해도 업로드는 성공으로 처리
    }

    return NextResponse.json({
      success: true,
      path: uploadData.path,
      url: urlData.publicUrl,
      transcript, // 음성 인식 결과 추가
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
