import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { BarChart3, FileText, Clock, TrendingUp } from 'lucide-react'
import { DashboardGuideButton } from '@/components/dashboard/dashboard-guide-button'

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
    <div className="min-h-screen p-1 sm:p-4 md:p-6 lg:p-12">
      <div className="max-w-7xl mx-auto px-0 sm:px-4 space-y-2 sm:space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="text-gradient">대시보드</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-light break-all">
              안녕하세요, <span className="font-medium text-foreground">{user?.email}</span>님
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DashboardGuideButton />
            <form action="/api/auth/signout" method="post">
              <Button variant="outline" type="submit" className="px-6 py-3 transition-all">
                로그아웃
              </Button>
            </form>
          </div>
        </div>

        {/* Stats */}
        {totalInterviews !== null && totalInterviews > 0 && (
          <div className="glass p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-soft hover-lift">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                  <BarChart3 className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">나의 면접 통계</h3>
                  <p className="text-muted-foreground text-sm">성장하는 여정을 확인하세요</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold text-gradient">{totalInterviews}</p>
                <p className="text-sm text-muted-foreground mt-1">총 면접 횟수</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Actions */}
        <div className="grid gap-2 sm:gap-6 md:grid-cols-2">
          <div className="glass p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-soft hover:shadow-glow hover-lift group">
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-3xl shadow-lg group-hover:shadow-xl transition-shadow">
                🎯
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold">면접 시작하기</h3>
                <p className="text-muted-foreground leading-relaxed">
                  질문을 선택하고 AI와 실전 같은 모의 면접을 진행하세요
                </p>
              </div>
              <Link href="/interview" className="block">
                <Button className="w-full rounded-2xl py-6 text-lg shadow-soft hover:shadow-glow transition-all">
                  면접 시작
                </Button>
              </Link>
            </div>
          </div>

          <div className="glass p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-soft hover:shadow-glow hover-lift group">
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white text-3xl shadow-lg group-hover:shadow-xl transition-shadow">
                📊
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold">내 결과 보기</h3>
                <p className="text-muted-foreground leading-relaxed">
                  이전 면접 결과와 AI 분석을 확인하세요
                </p>
              </div>
              <Link href="/result" className="block">
                <Button variant="outline" className="w-full rounded-2xl py-6 text-lg shadow-soft hover:shadow-glow transition-all">
                  최신 결과 확인
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Interview History */}
        {interviewHistory && interviewHistory.length > 0 && (
          <div className="glass p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-soft">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">면접 기록</h3>
                <p className="text-sm text-muted-foreground">과거에 진행했던 면접 결과를 확인하세요</p>
              </div>
            </div>
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
                  timeZone: 'Asia/Seoul',
                })

                return (
                  <Link
                    key={interview.id}
                    href={`/result/${interview.id}`}
                    className="block"
                  >
                    <div className="p-6 rounded-2xl border border-border/50 bg-white/50 backdrop-blur-sm hover:border-primary hover:bg-white/80 hover:shadow-soft transition-all cursor-pointer group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground font-medium">{date}</span>
                        </div>
                        {feedback.score && (
                          <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-glow">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-lg font-bold">
                              {feedback.score}
                            </span>
                          </div>
                        )}
                      </div>
                      {feedback.summary && (
                        <p className="text-sm text-foreground line-clamp-2 leading-relaxed group-hover:text-primary transition-colors">
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
          </div>
        )}
      </div>
    </div>
  )
}
