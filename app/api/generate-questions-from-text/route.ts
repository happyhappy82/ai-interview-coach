import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { text, questionCount = 5 } = await request.json()

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: '자소서 내용이 너무 짧습니다. 최소 50자 이상 입력해주세요.' },
        { status: 400 }
      )
    }

    // 너무 긴 자소서는 앞부분만 사용 (토큰 한도 방지)
    const maxLength = 6000
    const trimmedText = text.length > maxLength
      ? text.substring(0, maxLength) + '\n\n(이하 생략...)'
      : text

    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'AI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    const prompt = `당신은 대한민국 대기업 면접관입니다. 아래 자기소개서를 꼼꼼히 읽고, 자소서 내용을 직접 인용하며 파고드는 질문 ${questionCount}개를 생성해주세요.

[자기소개서]
${trimmedText}

[핵심 규칙 - 반드시 지켜야 함]
1. 모든 질문은 반드시 위 자기소개서의 구체적인 내용을 인용해야 합니다
2. "자기소개서에서 ~라고 쓰셨는데", "~하셨다고 했는데" 등 자소서 내용을 직접 언급하세요
3. 자소서에 없는 내용(최근 사회 이슈, 일반적인 회사 질문 등)은 절대 질문하지 마세요
4. 자소서에 적힌 경험, 성과, 수치, 역할을 파고드는 꼬리질문을 하세요
5. "STAR 기법", "구체적인 사례" 같은 답변 방식 지시는 절대 포함하지 마세요

[좋은 질문 예시 - 자소서 내용을 직접 인용]
- "자기소개서에서 라이브커머스로 매출 40% 달성했다고 쓰셨는데, 그 40%는 어떻게 측정한 건가요?"
- "팀원들을 설득했다고 하셨는데, 구체적으로 어떤 반대 의견이 있었나요?"
- "여기서 '주도적으로 이끌었다'고 하셨는데, 본인이 직접 한 일은 정확히 뭐였나요?"
- "3개월 만에 완성했다고 했는데, 그 기간 동안 가장 어려웠던 부분은요?"

[나쁜 질문 예시 - 이렇게 만들지 마세요]
- "최근 업계 트렌드에 대해 어떻게 생각하시나요?" (X - 자소서와 무관)
- "우리 회사에 지원한 이유가 무엇인가요?" (X - 자소서 내용 인용 없음)
- "본인의 강점을 STAR 기법으로 설명해주세요" (X - 답변 방식 지시)
- "리더십을 발휘한 경험을 말씀해주세요" (X - 자소서 구체적 내용 인용 없음)

[출력 형식]
다음 JSON 형식으로만 출력하세요. 다른 텍스트 없이 JSON만 출력하세요:
{
  "questions": [
    {
      "title": "질문 내용 (반드시 자소서 내용 인용)",
      "evaluation_context": "이 질문으로 확인하려는 것 (평가자용 메모)"
    }
  ]
}
`

    console.log(`자소서 질문 생성 요청: ${text.length}자`)

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 10000,
          },
        }),
      }
    )

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error:', geminiResponse.status, errorText)
      return NextResponse.json(
        { error: `AI 질문 생성에 실패했습니다. (${geminiResponse.status})` },
        { status: 500 }
      )
    }

    const geminiData = await geminiResponse.json()
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!generatedText) {
      return NextResponse.json(
        { error: 'AI 응답이 비어있습니다.' },
        { status: 500 }
      )
    }

    // JSON 파싱 시도
    let questions
    try {
      // ```json ... ``` 형식 처리
      const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/) ||
                        generatedText.match(/```\s*([\s\S]*?)\s*```/)
      const jsonStr = jsonMatch ? jsonMatch[1] : generatedText
      const parsed = JSON.parse(jsonStr.trim())
      questions = parsed.questions
    } catch (parseError) {
      console.error('JSON parse error:', parseError, generatedText)
      return NextResponse.json(
        { error: 'AI 응답 파싱에 실패했습니다.' },
        { status: 500 }
      )
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: '생성된 질문이 없습니다.' },
        { status: 500 }
      )
    }

    // 질문 형식 변환
    const formattedQuestions = questions.map((q: any, index: number) => ({
      id: `cover-letter-${Date.now()}-${index}`,
      title: q.title,
      evaluation_context: q.evaluation_context,
      category: 'cover-letter',
      order: index + 1,
    }))

    return NextResponse.json({ questions: formattedQuestions })
  } catch (error) {
    console.error('Error generating questions:', error)
    return NextResponse.json(
      { error: '질문 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
