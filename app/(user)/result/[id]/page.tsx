import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, XCircle, Tag, AlertCircle, Clock, Play } from 'lucide-react'
import { redirect } from 'next/navigation'
import { ResultActions } from '@/components/result/result-actions'
import { TranscriptToggle } from '@/components/result/transcript-toggle'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

// Open Graph 메타데이터 생성
export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const supabase = await createClient()

  const { data: results } = await supabase
    .from('interview_results')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!results) {
    return {
      title: 'AI 면접 코치 - 분석 결과',
    }
  }

  const feedback = results.ai_feedback as {
    score?: number
    summary?: string
  }

  const title = `AI 면접 분석 결과 ${feedback.score ? `- ${feedback.score}점` : ''}`
  const description = feedback.summary || '면접 답변에 대한 AI의 정밀 분석 결과를 확인해보세요'

  // 동적 OG 이미지 URL 생성
  const ogImageParams = new URLSearchParams()
  if (feedback.score) {
    ogImageParams.set('score', feedback.score.toString())
  }
  ogImageParams.set('title', '면접 분석 결과')
  const ogImageUrl = `/api/og?${ogImageParams.toString()}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ko_KR',
      siteName: 'AI 면접 코치',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'AI 면접 코치 분석 결과',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  }
}

export default async function ResultDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // 특정 면접 결과 조회
  const { data: results, error } = await supabase
    .from('interview_results')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id) // 본인의 결과만 조회
    .single()

  // 결과가 없는 경우
  if (error || !results) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] p-4 md:p-6 lg:p-12">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <button className="inline-flex items-center justify-center bg-white text-gray-700 hover:bg-gray-50 border border-gray-200/50 rounded-full px-4 py-2 text-[14px] font-medium transition-all">
                <ArrowLeft className="mr-2 h-4 w-4" />
                대시보드
              </button>
            </Link>
          </div>

          <div className="glass-card rounded-3xl p-8 md:p-12">
            <div className="text-center py-8 space-y-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-10 w-10 text-gray-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">면접 결과를 찾을 수 없습니다</h3>
                <p className="text-gray-500">
                  해당 면접 결과가 존재하지 않거나 접근 권한이 없습니다.
                </p>
              </div>
              <Link href="/dashboard">
                <button className="inline-flex items-center justify-center bg-[#0071e3] text-white hover:bg-[#0077ed] rounded-full px-8 py-3 text-[17px] font-medium transition-all active:scale-95">
                  대시보드로 돌아가기
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const feedback = results.ai_feedback as {
    good?: string[]
    bad?: string[]
    keywords?: string[]
    score?: number
    summary?: string
    raw?: string
    questionFeedbacks?: {
      questionTitle: string
      feedback: string
      strengths?: string[]
      improvements?: string[]
      score?: number
    }[]
    answers?: {
      questionTitle: string
      audioUrl: string
      transcript: string
      duration: number
    }[]
  }

  // Signed URL 생성 (1시간 유효, 보안 강화)
  if (feedback.answers && feedback.answers.length > 0) {
    const signedAnswers = await Promise.all(
      feedback.answers.map(async (answer) => {
        // Public URL에서 파일 경로 추출
        const urlParts = answer.audioUrl.split('/interviews/')
        if (urlParts.length < 2) return answer

        const filePath = urlParts[1]

        // Signed URL 생성 (1시간 유효)
        const { data: signedData } = await supabase.storage
          .from('interviews')
          .createSignedUrl(filePath, 3600) // 3600초 = 1시간

        return {
          ...answer,
          audioUrl: signedData?.signedUrl || answer.audioUrl,
        }
      })
    )
    feedback.answers = signedAnswers
  }

  const date = new Date(results.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Seoul',
  })

  return (
    <div className="min-h-screen bg-[#F5F5F7] p-1 sm:p-2 md:p-6 lg:p-12">
      <div className="max-w-5xl mx-auto space-y-3 sm:space-y-4 md:space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <button className="inline-flex items-center justify-center bg-white text-gray-700 hover:bg-gray-50 border border-gray-200/50 rounded-full px-4 py-2 text-[14px] font-medium transition-all">
              <ArrowLeft className="mr-2 h-4 w-4" />
              대시보드
            </button>
          </Link>
        </div>

        {/* Result Content - PDF 캡처 영역 */}
        <div id="result-content" className="space-y-4 sm:space-y-6">
          {/* Title & Score */}
          <div className="glass-card rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
                  AI 분석 결과
                </h1>
                <p className="text-sm text-gray-500 font-medium flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{date}</span>
                </p>
              </div>
              {feedback.score && (
                <div className="flex flex-col items-center px-8 py-6 rounded-3xl bg-[#0071e3] shadow-lg">
                  <div className="text-5xl md:text-6xl font-bold text-white">{feedback.score}</div>
                  <div className="text-sm text-white/90 font-medium mt-2">종합 점수</div>
                </div>
              )}
            </div>

            <p className="text-gray-500 mb-6 text-base md:text-lg">
              면접 답변에 대한 AI의 정밀 분석 결과입니다
            </p>

            {feedback.summary && (
              <div className="p-6 rounded-2xl bg-blue-50 border-l-4 border-[#0071e3]">
                <p className="text-sm leading-relaxed text-gray-700 font-medium">{feedback.summary}</p>
              </div>
            )}
          </div>

          {/* 문항별 피드백 */}
          {feedback.questionFeedbacks && feedback.questionFeedbacks.length > 0 && (
            <div className="glass-card rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">문항별 상세 피드백</h3>
                  <p className="text-sm text-gray-500">각 질문에 대한 AI의 상세한 분석입니다</p>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {feedback.questionFeedbacks.map((qf, index) => (
                  <div key={index} className="p-3 sm:p-6 rounded-xl sm:rounded-2xl bg-white border border-gray-100 space-y-3 sm:space-y-4">
                    {/* 질문 제목 - Q 배지 인라인 */}
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-600 text-sm font-bold">Q{index + 1}</span>
                      <h4 className="font-bold text-base sm:text-lg text-gray-900">{qf.questionTitle}</h4>
                    </div>

                    {/* 점수 */}
                    {qf.score !== undefined && (
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#0071e3] text-white text-sm font-semibold">
                        {qf.score}점
                      </div>
                    )}

                    {/* 상세 피드백 - 전체 너비 */}
                    <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{qf.feedback}</p>
                    </div>

                    {/* 강점 - 전체 너비 */}
                    {qf.strengths && qf.strengths.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-green-600 mb-2 flex items-center">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          잘한 점
                        </p>
                        <ul className="space-y-1.5">
                          {qf.strengths.map((strength, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <span className="text-green-500 text-xs mt-0.5">•</span>
                              <span className="text-xs text-gray-600">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 개선점 - 전체 너비 */}
                    {qf.improvements && qf.improvements.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-orange-600 mb-2 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          개선할 점
                        </p>
                        <ul className="space-y-1.5">
                          {qf.improvements.map((improvement, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <span className="text-orange-500 text-xs mt-0.5">•</span>
                              <span className="text-xs text-gray-600">{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Good Points - 총평 */}
          {feedback.good && feedback.good.length > 0 && (
            <div className="glass-card rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-8">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900">잘한 점</h3>
                  <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">전체 면접에서 강점으로 부각된 부분입니다</p>
                </div>
              </div>
              <ul className="space-y-3 sm:space-y-4">
                {feedback.good.map((point, index) => (
                  <li key={index} className="flex items-start space-x-2 sm:space-x-3">
                    <span className="text-green-600 text-sm font-bold flex-shrink-0">{index + 1}.</span>
                    <p className="text-sm leading-relaxed text-gray-700">{point}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvement Points - 총평 */}
          {feedback.bad && feedback.bad.length > 0 && (
            <div className="glass-card rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-8">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-100 flex items-center justify-center">
                  <XCircle className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900">개선할 점</h3>
                  <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">전체 면접에서 보완하면 더 좋을 부분입니다</p>
                </div>
              </div>
              <ul className="space-y-3 sm:space-y-4">
                {feedback.bad.map((point, index) => (
                  <li key={index} className="flex items-start space-x-2 sm:space-x-3">
                    <span className="text-orange-600 text-sm font-bold flex-shrink-0">{index + 1}.</span>
                    <p className="text-sm leading-relaxed text-gray-700">{point}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Keywords */}
          {feedback.keywords && feedback.keywords.length > 0 && (
            <div className="glass-card rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <Tag className="h-6 w-6 text-[#0071e3]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">핵심 키워드</h3>
                  <p className="text-sm text-gray-500">답변에서 감지된 주요 키워드입니다</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {feedback.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-5 py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200/50 text-[#0071e3] rounded-full text-sm font-semibold transition-all"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Raw Feedback (디버깅용 - JSON 파싱 실패 시 표시) */}
          {feedback.raw && (!feedback.good || feedback.good.length === 0) && (
            <div className="glass-card rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-8 border-2 border-yellow-200 bg-yellow-50/50">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-yellow-900">AI 상세 분석</h3>
                  <p className="text-sm text-yellow-700">AI가 제공한 전체 피드백입니다</p>
                </div>
              </div>
              <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
                {feedback.raw}
              </div>
            </div>
          )}

          {/* 질문별 답변 & 오디오 */}
          {feedback.answers && feedback.answers.length > 0 && (
            <div className="glass-card rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center">
                  <span className="text-2xl">🎧</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">내 답변 다시 듣기</h3>
                  <p className="text-sm text-gray-500">각 질문별 녹음된 답변을 확인해보세요</p>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {feedback.answers.map((answer, index) => (
                  <div key={index} className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-gray-100 space-y-3">
                    {/* 질문 제목 */}
                    <div className="flex items-center space-x-2">
                      <span className="text-rose-600 text-sm font-bold">Q{index + 1}</span>
                      <h4 className="font-bold text-base sm:text-lg text-gray-900">{answer.questionTitle}</h4>
                    </div>
                    {/* 오디오 플레이어 - 전체 너비 */}
                    {answer.audioUrl ? (
                      <audio src={answer.audioUrl} controls className="w-full rounded-lg" />
                    ) : (
                      <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                        <p className="text-sm text-yellow-800">오디오 파일을 찾을 수 없습니다.</p>
                      </div>
                    )}
                    {/* 녹취록 - 전체 너비 */}
                    {answer.transcript && (
                      <TranscriptToggle transcript={answer.transcript} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* PDF 캡처 영역 종료 */}

        {/* PDF 다운로드 & 공유 */}
        <ResultActions
          resultId={params.id}
          score={feedback.score}
          summary={feedback.summary}
        />

        {/* 다시 면접 보기 */}
        <Link href="/interview" className="block">
          <button className="w-full bg-[#0071e3] text-white hover:bg-[#0077ed] rounded-full py-4 text-lg font-semibold transition-all active:scale-95 shadow-lg">
            <Play className="inline-block mr-2 h-5 w-5" fill="currentColor" />
            다시 면접 보기
          </button>
        </Link>

        {/* Tips */}
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-blue-200/50">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <span className="text-xl">💡</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">다음 면접을 위한 팁</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0071e3] mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-600 leading-relaxed">
                개선할 점을 메모하고, 다음 면접에서 보완하세요
              </p>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0071e3] mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-600 leading-relaxed">
                잘한 점은 계속 강조하여 일관성을 유지하세요
              </p>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0071e3] mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-600 leading-relaxed">
                STAR 기법을 활용하면 답변이 더 구조적이 됩니다
              </p>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0071e3] mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-600 leading-relaxed">
                반복 연습을 통해 자신감을 높이세요
              </p>
            </li>
          </ul>
        </div>

        {/* 전문가 피드백 */}
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-emerald-200/50">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <span className="text-xl">👨‍💼</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">더 전문적인 피드백이 필요하신가요?</h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            실제 취업 합격자들이 당신의 면접 답변을 직접 분석하고 1:1 맞춤 피드백을 제공합니다.
          </p>
          <Link href="/expert">
            <button className="w-full bg-emerald-500 text-white hover:bg-emerald-600 rounded-full py-4 text-lg font-semibold transition-all active:scale-95 shadow-lg">
              전문가에게 피드백받기
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
