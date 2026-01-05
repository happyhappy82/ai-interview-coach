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

    // 각 질문의 평가 기준 가져오기
    console.log('질문별 평가 기준 가져오기 시작...')
    const questionIds = answers.map(a => a.questionId)

    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select('id, evaluation_context')
      .in('id', questionIds)

    if (questionsError) {
      console.error('질문 정보 가져오기 실패:', questionsError)
      return NextResponse.json(
        { error: 'Failed to fetch question contexts' },
        { status: 500 }
      )
    }

    // questionId를 키로 하는 맵 생성
    const questionContextMap = new Map<string, string>()
    questionsData?.forEach(q => {
      questionContextMap.set(q.id, q.evaluation_context || '이 질문에 대한 답변을 STAR 기법에 따라 평가하세요.')
    })

    console.log('질문별 평가 기준 가져오기 성공')

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

    // 1단계: 각 질문마다 개별적으로 Gemini 호출하여 피드백 생성 (병렬 처리)
    console.log('=== 1단계: 각 질문별 개별 분석 시작 (병렬 처리) ===')

    const questionFeedbackPromises = answers.map(async (answer, i) => {
      console.log(`질문 ${i + 1}/${answers.length} 분석 시작...`)

      // 이 질문의 평가 기준 가져오기
      const evaluationContext = questionContextMap.get(answer.questionId) || '이 질문에 대한 답변을 STAR 기법에 따라 평가하세요.'

      const questionPrompt = `${evaluationContext}

면접 질문: ${answer.questionTitle}
면접자의 답변: ${answer.transcript || '(음성 인식 실패)'}

위 답변을 분석하여 **반드시 아래 형식의 순수 JSON만** 출력하세요:

{
  "feedback": "이 답변에 대한 상세 평가 (3-5문장)",
  "strengths": ["강점 1", "강점 2"],
  "improvements": ["개선점 1", "개선점 2"],
  "score": 80
}

중요: 백틱 없이 { 로 시작하는 순수 JSON만 출력하세요.`

      try {
        const questionResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: questionPrompt }] }],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
              },
            }),
          }
        )

        if (questionResponse.ok) {
          const questionData = await questionResponse.json()
          const questionText = questionData.candidates?.[0]?.content?.parts?.[0]?.text

          if (questionText) {
            // JSON 파싱
            const cleanedText = questionText.replace(/```json\s*/g, '').replace(/```\s*/g, '')
            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)

            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0])
              console.log(`질문 ${i + 1} 분석 완료`)
              return {
                questionTitle: answer.questionTitle,
                ...parsed,
              }
            } else {
              throw new Error('JSON 파싱 실패')
            }
          }
        } else {
          throw new Error('Gemini API 호출 실패')
        }
      } catch (error) {
        console.error(`질문 ${i + 1} 분석 실패:`, error)
        // 실패 시 기본 피드백 생성
        return {
          questionTitle: answer.questionTitle,
          feedback: `이 질문에 대한 답변을 제출하셨습니다.`,
          strengths: ['답변 완료'],
          improvements: ['더 구체적인 답변이 필요합니다'],
          score: 70,
        }
      }
    })

    // 모든 질문 분석을 병렬로 실행하고 결과 기다리기
    const questionFeedbacks = await Promise.all(questionFeedbackPromises)

    console.log('=== 1단계 완료: 모든 질문 분석 완료 ===')

    // 2단계: 전체 평가 (good, bad, summary, keywords 생성)
    console.log('=== 2단계: 전체 종합 평가 시작 ===')

    const allAnswersText = answers
      .map((answer, index) => `질문 ${index + 1}: ${answer.questionTitle}\n답변: ${answer.transcript || '(음성 인식 실패)'}`)
      .join('\n\n')

    const exampleOverall = {
      score: 85,
      summary: "전체 면접에 대한 종합 평가 (2-3문장)",
      good: ["전체적으로 잘한 점 1", "잘한 점 2", "잘한 점 3"],
      bad: ["전체적으로 개선할 점 1", "개선할 점 2"],
      keywords: ["키워드1", "키워드2", "키워드3"]
    }

    const overallPrompt = `다음은 면접자의 전체 답변입니다:

${allAnswersText}

위 전체 답변을 종합적으로 분석하여 **반드시 아래 형식의 순수 JSON만** 출력하세요:

${JSON.stringify(exampleOverall, null, 2)}

중요: 백틱 없이 { 로 시작하는 순수 JSON만 출력하세요.`

    let overallFeedback = {
      score: 70,
      summary: '면접을 완료하셨습니다.',
      good: ['답변을 제공해주셔서 감사합니다.'],
      bad: ['더 구체적인 답변이 필요합니다.'],
      keywords: [],
    }

    try {
      const overallResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: overallPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        }
      )

      if (overallResponse.ok) {
        const overallData = await overallResponse.json()
        const overallText = overallData.candidates?.[0]?.content?.parts?.[0]?.text

        if (overallText) {
          const cleanedText = overallText.replace(/```json\s*/g, '').replace(/```\s*/g, '')
          const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)

          if (jsonMatch) {
            overallFeedback = JSON.parse(jsonMatch[0])
            console.log('전체 평가 생성 완료')
          }
        }
      }
    } catch (error) {
      console.error('전체 평가 생성 실패:', error)
    }

    console.log('=== 2단계 완료: 전체 종합 평가 완료 ===')

    // 최종 feedback 객체 구성
    const feedback = {
      ...overallFeedback,
      questionFeedbacks,
    }

    // DB에 결과 저장
    console.log('DB 저장 시작...')

    // 대표 오디오 URL (첫 번째 답변)
    const representativeAudioUrl = answers[0]?.audioUrl || ''

    // ai_feedback에 각 질문별 답변 정보 추가
    const feedbackWithAnswers = {
      ...feedback,
      answers: answers.map(answer => ({
        questionTitle: answer.questionTitle,
        audioUrl: answer.audioUrl,
        transcript: answer.transcript,
        duration: answer.duration,
      })),
    }

    const { data: insertData, error: dbError } = await supabase
      .from('interview_results')
      .insert({
        user_id: user.id,
        audio_url: representativeAudioUrl,
        ai_feedback: feedbackWithAnswers,
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
