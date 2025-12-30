import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { BarChart3, FileText, Clock, TrendingUp } from 'lucide-react'

export default async function UserDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 면접 결과 통계
  const { count: totalInterviews } = await supabase
    .from('interview_results')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)

  // 과거 면접 기록 가져오기 (최신 10개)
  const { data: interviewHistory } = await supabase
    .from('interview_results')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            대시보드
          </h1>
          <p className="text-muted-foreground mt-2">
            안녕하세요, {user?.email}님
          </p>
        </div>
        <form action="/api/auth/signout" method="post">
          <Button variant="outline" type="submit">
            로그아웃
          </Button>
        </form>
      </div>

      {/* Stats */}
      {totalInterviews !== null && totalInterviews > 0 && (
        <Card className="rounded-xl shadow-premium mb-6">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle>나의 면접 통계</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-8">
              <div>
                <p className="text-3xl font-bold text-primary">{totalInterviews}</p>
                <p className="text-sm text-muted-foreground">총 면접 횟수</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-xl shadow-premium">
          <CardHeader>
            <CardTitle>면접 시작하기</CardTitle>
            <CardDescription>
              AI와 실전 같은 모의 면접을 진행하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/interview" className="block">
              <Button className="w-full rounded-xl">
                면접 시작
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-premium">
          <CardHeader>
            <CardTitle>내 결과 보기</CardTitle>
            <CardDescription>
              이전 면접 결과와 AI 분석을 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/result" className="block">
              <Button variant="outline" className="w-full rounded-xl">
                최신 결과 확인
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Interview History */}
      {interviewHistory && interviewHistory.length > 0 && (
        <Card className="rounded-xl shadow-premium mt-8">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>면접 기록</CardTitle>
            </div>
            <CardDescription>
              과거에 진행했던 면접 결과를 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {interviewHistory.map((interview, index) => {
                const feedback = interview.ai_feedback as {
                  score?: number
                  summary?: string
                }
                const date = new Date(interview.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <Link
                    key={interview.id}
                    href={`/result/${interview.id}`}
                    className="block"
                  >
                    <div className="p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-all cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{date}</span>
                        </div>
                        {feedback.score && (
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <span className="text-lg font-bold text-primary">
                              {feedback.score}
                            </span>
                          </div>
                        )}
                      </div>
                      {feedback.summary && (
                        <p className="text-sm text-foreground line-clamp-2">
                          {feedback.summary}
                        </p>
                      )}
                      {!feedback.summary && (
                        <p className="text-sm text-muted-foreground">
                          면접 #{index + 1} - 결과 보기
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
