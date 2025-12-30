/**
 * Gemini AI 분석 API
 * LiveOps 프롬프트 사용
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    console.log('=== Analyze API 시작 ===')
    const supabase = await createClient()

    // 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error('인증 실패: 사용자 없음')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User ID:', user.id)

    const body = await request.json()
    const { transcription, questionId, audioUrl } = body

    console.log('Request body:', { transcription, questionId, audioUrl })

    if (!transcription) {
      console.error('Transcription 없음')
      return NextResponse.json(
        { error: 'No transcription provided' },
        { status: 400 }
      )
    }

    // LiveOps: analysis_rules 프롬프트 가져오기
    console.log('프롬프트 가져오기 시작...')
    const { data: promptData, error: promptError } = await supabase
      .from('system_prompts')
      .select('content')
      .eq('key_name', 'analysis_rules')
      .eq('is_active', true)
      .single()

    if (promptError || !promptData) {
      console.error('프롬프트 가져오기 실패:', promptError)
      return NextResponse.json(
        { error: 'Analysis rules not found' },
        { status: 500 }
      )
    }

    console.log('프롬프트 가져오기 성공:', promptData.content.substring(0, 100) + '...')

    // Gemini API 호출
    const geminiApiKey = process.env.GEMINI_API_KEY

    if (!geminiApiKey) {
      console.error('Gemini API key 없음')
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    console.log('Gemini API key 확인됨')

    const prompt = `${promptData.content}\n\n사용자의 답변:\n${transcription}`

    console.log('Gemini API 호출 시작...')
    console.log('Prompt 길이:', prompt.length)

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
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    )

    console.log('Gemini API response status:', geminiResponse.status)

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error:', errorText)
      return NextResponse.json(
        { error: 'AI analysis failed', details: errorText },
        { status: 500 }
      )
    }

    const geminiData = await geminiResponse.json()
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!generatedText) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      )
    }

    // JSON 파싱 시도
    let feedback
    try {
      // Gemini가 반환한 텍스트에서 JSON 부분만 추출
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        feedback = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      // JSON 파싱 실패 시 기본 구조 반환
      feedback = {
        good: ['답변을 제공해주셔서 감사합니다.'],
        bad: ['AI 분석 중 오류가 발생했습니다. 다시 시도해주세요.'],
        keywords: [],
        raw: generatedText,
      }
    }

    // DB에 결과 저장
    console.log('DB 저장 시작...')
    console.log('저장할 데이터:', { user_id: user.id, audio_url: audioUrl || '', feedback })

    const { data: insertData, error: dbError } = await supabase
      .from('interview_results')
      .insert({
        user_id: user.id,
        audio_url: audioUrl || '',
        ai_feedback: feedback,
      })
      .select()

    if (dbError) {
      console.error('DB 저장 실패:', dbError)
      console.error('DB 에러 코드:', dbError.code)
      console.error('DB 에러 메시지:', dbError.message)
      // DB 저장 실패해도 분석 결과는 반환
    } else {
      console.log('DB 저장 성공!', insertData)
    }

    console.log('=== Analyze API 완료 ===')
    return NextResponse.json({
      success: true,
      feedback,
    })
  } catch (error) {
    console.error('=== Unexpected error ===')
    console.error('Error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
