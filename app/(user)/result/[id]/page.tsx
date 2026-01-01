import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, XCircle, Tag, AlertCircle } from 'lucide-react'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-xl">
              <ArrowLeft className="mr-2 h-4 w-4" />
              대시보드
            </Button>
          </Link>
        </div>

        {/* Title & Score */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">AI 분석 결과</h1>
              <p className="text-sm text-muted-foreground mt-2">{date}</p>
            </div>
            {feedback.score && (
              <div className="flex flex-col items-center">
                <div className="text-5xl font-bold text-primary">{feedback.score}</div>
                <div className="text-sm text-muted-foreground">종합 점수</div>
              </div>
            )}
          </div>
          <p className="text-muted-foreground mb-4">
            면접 답변에 대한 AI의 정밀 분석 결과입니다
          </p>
          {feedback.summary && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
              <p className="text-sm leading-relaxed text-gray-800">{feedback.summary}</p>
            </div>
          )}
        </div>

        {/* Good Points */}
        {feedback.good && feedback.good.length > 0 && (
          <Card className="rounded-xl shadow-premium mb-6">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <CardTitle>잘한 점</CardTitle>
              </div>
              <CardDescription>강점으로 부각된 부분입니다</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {feedback.good.map((point, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-xs font-semibold">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{point}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Improvement Points */}
        {feedback.bad && feedback.bad.length > 0 && (
          <Card className="rounded-xl shadow-premium mb-6">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-orange-500" />
                <CardTitle>개선할 점</CardTitle>
              </div>
              <CardDescription>보완하면 더 좋을 부분입니다</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {feedback.bad.map((point, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-orange-600 text-xs font-semibold">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{point}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Keywords */}
        {feedback.keywords && feedback.keywords.length > 0 && (
          <Card className="rounded-xl shadow-premium mb-6">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Tag className="h-5 w-5 text-primary" />
                <CardTitle>핵심 키워드</CardTitle>
              </div>
              <CardDescription>답변에서 감지된 주요 키워드입니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {feedback.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
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

        {/* Audio Player */}
        {results.audio_url && (
          <Card className="rounded-xl shadow-premium mb-6">
            <CardHeader>
              <CardTitle>내 답변 다시 듣기</CardTitle>
              <CardDescription>녹음된 답변을 다시 확인해보세요</CardDescription>
            </CardHeader>
            <CardContent>
              <audio src={results.audio_url} controls className="w-full" />
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/interview" className="flex-1">
            <Button className="w-full rounded-xl" size="lg">
              다시 면접 보기
            </Button>
          </Link>
          <Button variant="outline" className="flex-1 rounded-xl" size="lg" disabled>
            전문가 상담 신청 (준비 중)
          </Button>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-3">
          <h3 className="font-semibold text-blue-900">💡 다음 면접을 위한 팁</h3>
          <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
            <li>개선할 점을 메모하고, 다음 면접에서 보완하세요</li>
            <li>잘한 점은 계속 강조하여 일관성을 유지하세요</li>
            <li>STAR 기법을 활용하면 답변이 더 구조적이 됩니다</li>
            <li>반복 연습을 통해 자신감을 높이세요</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
