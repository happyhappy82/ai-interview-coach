/**
 * 일괄 AI 분석 API - 모든 답변을 한 번에 분석 (비용 절감)
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface Answer {
  questionId: string
  questionTitle: string
  audioUrl: string
  transcript: string
  duration: number
}

export async function POST(request: Request) {
  try {
    console.log('=== 일괄 분석 API 시작 ===')
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
    const { answers }: { answers: Answer[] } = body

    console.log(`총 ${answers.length}개 답변 분석 시작`)

    if (!answers || answers.length === 0) {
      console.error('답변 없음')
      return NextResponse.json(
        { error: 'No answers provided' },
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

    console.log('프롬프트 가져오기 성공')

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

    // 전체 답변을 하나의 프롬프트로 만들기
    const answersText = answers
      .map(
        (answer, index) =>
          `질문 ${index + 1}: ${answer.questionTitle}\n답변: ${answer.transcript || '(음성 인식 실패)'}\n`
      )
      .join('\n')

    const prompt = `${promptData.content}\n\n면접자가 다음 질문들에 답변했습니다:\n\n${answersText}\n\n위 답변들을 종합적으로 분석하여 JSON 형식으로 반환해주세요.`

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
            maxOutputTokens: 2048,
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
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        feedback = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      feedback = {
        good: ['답변을 제공해주셔서 감사합니다.'],
        bad: ['AI 분석 중 오류가 발생했습니다. 다시 시도해주세요.'],
        keywords: [],
        raw: generatedText,
      }
    }

    // DB에 결과 저장
    console.log('DB 저장 시작...')

    // 대표 오디오 URL (첫 번째 답변)
    const representativeAudioUrl = answers[0]?.audioUrl || ''

    const { data: insertData, error: dbError } = await supabase
      .from('interview_results')
      .insert({
        user_id: user.id,
        audio_url: representativeAudioUrl,
        ai_feedback: feedback,
      })
      .select()

    if (dbError) {
      console.error('DB 저장 실패:', dbError)
      console.error('DB 에러 코드:', dbError.code)
      console.error('DB 에러 메시지:', dbError.message)
    } else {
      console.log('DB 저장 성공!', insertData)
    }

    console.log('=== 일괄 분석 API 완료 ===')
    return NextResponse.json({
      success: true,
      feedback,
      analyzedCount: answers.length,
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
