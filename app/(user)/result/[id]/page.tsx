import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, XCircle, Tag, AlertCircle, Clock } from 'lucide-react'
import { redirect } from 'next/navigation'
import { ResultActions } from '@/components/result/result-actions'
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <Link href="/dashboard">
              <Button variant="outline" className="rounded-xl">
                <ArrowLeft className="mr-2 h-4 w-4" />
                대시보드
              </Button>
            </Link>
          </div>

          <Card className="rounded-xl shadow-premium">
            <CardContent className="pt-6">
              <div className="text-center py-12 space-y-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">면접 결과를 찾을 수 없습니다</h3>
                  <p className="text-sm text-muted-foreground">
                    해당 면접 결과가 존재하지 않거나 접근 권한이 없습니다.
                  </p>
                </div>
                <Link href="/dashboard">
                  <Button className="rounded-xl mt-4">
                    대시보드로 돌아가기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
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
    <div className="min-h-screen p-1 sm:p-4 md:p-6 lg:p-12">
      <div className="container mx-auto max-w-5xl px-0 sm:px-4 space-y-2 sm:space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-2xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 shadow-soft hover:shadow-glow transition-all text-sm sm:text-base">
              <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">대시보드</span>
              <span className="sm:hidden">뒤로</span>
            </Button>
          </Link>
        </div>

        {/* Result Content - PDF 캡처 영역 */}
        <div id="result-content">
        {/* Title & Score */}
        <div className="glass rounded-none sm:rounded-3xl p-4 sm:p-8 md:p-10 lg:p-12 shadow-soft">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                <span className="text-gradient">AI 분석 결과</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium flex items-center space-x-2">
                <Clock className="h-3 sm:h-4 w-3 sm:w-4" />
                <span>{date}</span>
              </p>
            </div>
            {feedback.score && (
              <div className="flex flex-col items-center px-6 sm:px-8 py-4 sm:py-6 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-premium-xl">
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">{feedback.score}</div>
                <div className="text-xs sm:text-sm text-white/90 font-medium mt-1 sm:mt-2">종합 점수</div>
              </div>
            )}
          </div>

          <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base md:text-lg">
            면접 답변에 대한 AI의 정밀 분석 결과입니다
          </p>

          {feedback.summary && (
            <div className="glass rounded-none sm:rounded-2xl p-4 sm:p-6 border-l-4 border-primary shadow-soft">
              <p className="text-sm leading-relaxed text-foreground/90 font-medium">{feedback.summary}</p>
            </div>
          )}
        </div>

        {/* Good Points */}
        {feedback.good && feedback.good.length > 0 && (
          <div className="glass rounded-none sm:rounded-3xl p-4 sm:p-8 shadow-soft">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">잘한 점</h3>
                <p className="text-sm text-muted-foreground">강점으로 부각된 부분입니다</p>
              </div>
            </div>
            <ul className="space-y-4">
              {feedback.good.map((point, index) => (
                <li key={index} className="flex items-start space-x-4 group">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-soft transition-shadow">
                    <span className="text-green-600 text-sm font-bold">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90 pt-1">{point}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvement Points */}
        {feedback.bad && feedback.bad.length > 0 && (
          <div className="glass rounded-none sm:rounded-3xl p-4 sm:p-8 shadow-soft">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg">
                <XCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">개선할 점</h3>
                <p className="text-sm text-muted-foreground">보완하면 더 좋을 부분입니다</p>
              </div>
            </div>
            <ul className="space-y-4">
              {feedback.bad.map((point, index) => (
                <li key={index} className="flex items-start space-x-4 group">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center flex-shrink-0 mt-1 group-hover:shadow-soft transition-shadow">
                    <span className="text-orange-600 text-sm font-bold">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90 pt-1">{point}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Keywords */}
        {feedback.keywords && feedback.keywords.length > 0 && (
          <div className="glass rounded-none sm:rounded-3xl p-4 sm:p-8 shadow-soft">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <Tag className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">핵심 키워드</h3>
                <p className="text-sm text-muted-foreground">답변에서 감지된 주요 키워드입니다</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {feedback.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-primary/20 text-primary rounded-full text-sm font-semibold shadow-soft hover:shadow-glow transition-all"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Raw Feedback (디버깅용 - JSON 파싱 실패 시 표시) */}
        {feedback.raw && (!feedback.good || feedback.good.length === 0) && (
          <Card className="rounded-xl shadow-premium mb-6 border-2 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-yellow-900">AI 상세 분석</CardTitle>
              </div>
              <CardDescription className="text-yellow-800">
                AI가 제공한 전체 피드백입니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
                {feedback.raw}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 질문별 답변 & 오디오 */}
        {feedback.answers && feedback.answers.length > 0 && (
          <div className="glass rounded-none sm:rounded-3xl p-4 sm:p-8 shadow-soft">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg">
                <span className="text-2xl">🎧</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">내 답변 다시 듣기</h3>
                <p className="text-sm text-muted-foreground">각 질문별 녹음된 답변을 확인해보세요</p>
              </div>
            </div>

            <div className="space-y-6">
              {feedback.answers.map((answer, index) => (
                <div key={index} className="p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-border/50 space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-rose-600 text-sm font-bold">Q{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-3">{answer.questionTitle}</h4>
                      {answer.audioUrl ? (
                        <audio src={answer.audioUrl} controls className="w-full rounded-xl shadow-soft mb-3" />
                      ) : (
                        <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 mb-3">
                          <p className="text-sm text-yellow-800">오디오 파일을 찾을 수 없습니다.</p>
                        </div>
                      )}
                      {answer.transcript && (
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                          <p className="text-xs text-muted-foreground font-semibold mb-2">녹취록</p>
                          <p className="text-sm text-foreground/80 leading-relaxed">{answer.transcript}</p>
                        </div>
                      )}
                    </div>
                  </div>
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
          <Button className="w-full rounded-2xl py-7 text-lg shadow-soft hover:shadow-glow transition-all">
            다시 면접 보기
          </Button>
        </Link>

        {/* Tips */}
        <div className="glass rounded-none sm:rounded-3xl p-4 sm:p-8 shadow-soft border-0 sm:border sm:border-blue-200/50">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-lg">
              <span className="text-2xl">💡</span>
            </div>
            <h3 className="text-xl font-bold">다음 면접을 위한 팁</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <p className="text-sm text-foreground/80 leading-relaxed">
                개선할 점을 메모하고, 다음 면접에서 보완하세요
              </p>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <p className="text-sm text-foreground/80 leading-relaxed">
                잘한 점은 계속 강조하여 일관성을 유지하세요
              </p>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <p className="text-sm text-foreground/80 leading-relaxed">
                STAR 기법을 활용하면 답변이 더 구조적이 됩니다
              </p>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <p className="text-sm text-foreground/80 leading-relaxed">
                반복 연습을 통해 자신감을 높이세요
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
