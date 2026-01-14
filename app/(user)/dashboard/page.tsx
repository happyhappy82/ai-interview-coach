import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Play, FileText, TrendingUp, Calendar, ChevronRight } from 'lucide-react'

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

  // 평균 점수 계산
  const { data: allResults } = await supabase
    .from('interview_results')
    .select('ai_feedback')
    .eq('user_id', user!.id)

  let averageScore = 0
  if (allResults && allResults.length > 0) {
    const scores = allResults
      .map((r) => (r.ai_feedback as { score?: number })?.score)
      .filter((s): s is number => typeof s === 'number')
    if (scores.length > 0) {
      averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    }
  }

  // 과거 면접 기록 가져오기 (최신 10개)
  const { data: interviewHistory } = await supabase
    .from('interview_results')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-[#F5F5F7] pt-8 pb-12 px-4 md:px-6">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">대시보드</h1>
            <p className="text-gray-500 mt-1">환영합니다, {user?.email}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/expert">
              <button className="inline-flex items-center justify-center bg-white text-[#0071e3] hover:bg-gray-50 border border-gray-200/50 rounded-full px-4 py-2 text-[14px] font-medium transition-all">
                전문가 상담
              </button>
            </Link>
            <form action="/api/auth/signout" method="post">
              <button type="submit" className="inline-flex items-center justify-center text-gray-500 hover:text-[#0071e3] rounded-lg px-3 py-2 text-[14px] font-medium transition-colors">
                로그아웃
              </button>
            </form>
          </div>
        </div>

        {/* Stats Row */}
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-transparent">
            <div className="flex items-center gap-3">
              <div className="bg-[#0071e3] p-2.5 rounded-xl text-white">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">나의 성장</h3>
                <p className="text-sm text-gray-500">면접 연습 현황</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-gray-900">{totalInterviews || 0}</span>
              <span className="text-sm text-gray-500 ml-1">회 연습</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="p-6 text-center hover:bg-gray-50 transition-colors">
              <p className="text-sm text-gray-500 mb-1">평균 점수</p>
              <p className="text-2xl font-bold text-gray-900">
                {averageScore || '-'}
                <span className="text-sm text-gray-400 font-normal">/100</span>
              </p>
            </div>
            <div className="p-6 text-center hover:bg-gray-50 transition-colors">
              <p className="text-sm text-gray-500 mb-1">총 면접 횟수</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalInterviews || 0}
                <span className="text-sm text-gray-400 font-normal">회</span>
              </p>
            </div>
            <div className="p-6 text-center hover:bg-gray-50 transition-colors">
              <p className="text-sm text-gray-500 mb-1">상태</p>
              <p className="text-lg font-semibold text-green-600">
                {totalInterviews && totalInterviews >= 5 ? '꾸준히 성장 중' : '시작하기'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/interview" className="block">
            <div className="glass-card rounded-3xl p-6 flex flex-col justify-between min-h-[240px] group cursor-pointer hover:border-blue-200 transition-all relative overflow-hidden hover:-translate-y-1 hover:shadow-xl duration-300">
              {/* Abstract shape decoration */}
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>

              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-[#0071e3] mb-4">
                  <Play size={24} fill="currentColor" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">면접 시작하기</h3>
                <p className="text-gray-500 mt-2 max-w-sm">
                  AI와 실전 같은 모의 면접을 시작하세요. 기업별 질문을 선택할 수 있습니다.
                </p>
              </div>
              <div className="mt-6">
                <button className="w-full inline-flex items-center justify-center bg-[#0071e3] text-white hover:bg-[#0077ed] rounded-full px-5 py-3 text-[14px] font-medium transition-all active:scale-95">
                  면접 시작
                </button>
              </div>
            </div>
          </Link>

          <Link href="/result" className="block">
            <div className="glass-card rounded-3xl p-6 flex flex-col justify-between min-h-[240px] group cursor-pointer hover:border-purple-200 transition-all relative overflow-hidden hover:-translate-y-1 hover:shadow-xl duration-300">
              {/* Abstract shape decoration */}
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>

              <div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4">
                  <FileText size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">결과 분석 보기</h3>
                <p className="text-gray-500 mt-2 max-w-sm">
                  이전 면접 결과와 AI 분석을 확인하고 개선점을 파악하세요.
                </p>
              </div>
              <div className="mt-6">
                <button className="w-full inline-flex items-center justify-center bg-white text-[#0071e3] hover:bg-gray-50 border border-gray-200/50 rounded-full px-5 py-3 text-[14px] font-medium transition-all active:scale-95">
                  결과 확인
                </button>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent History */}
        {interviewHistory && interviewHistory.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 px-1">최근 면접 기록</h2>
            <div className="space-y-3">
              {interviewHistory.map((interview) => {
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
                  <Link key={interview.id} href={`/result/${interview.id}`} className="block">
                    <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group cursor-pointer hover:bg-white/80 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-gray-600 transition-colors">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {feedback.summary ? feedback.summary.slice(0, 30) + '...' : '면접 결과'}
                          </h4>
                          <p className="text-sm text-gray-500 line-clamp-1 max-w-md">
                            {feedback.summary || '상세 분석 결과를 확인하세요'}
                          </p>
                          <span className="text-xs text-gray-400 mt-1 block">{date}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-right">
                          <div className={`text-lg font-bold ${feedback.score && feedback.score >= 80 ? 'text-green-600' : 'text-[#0071e3]'}`}>
                            {feedback.score || '-'}
                          </div>
                          <div className="text-xs text-gray-400">점수</div>
                        </div>
                        <div className="text-gray-300 group-hover:text-gray-600 transition-colors">
                          <ChevronRight size={20} />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!interviewHistory || interviewHistory.length === 0) && (
          <div className="glass-card rounded-3xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">첫 면접을 시작해보세요</h3>
            <p className="text-gray-500 mb-6">AI와 함께 실전 같은 면접 연습을 시작하세요.</p>
            <Link href="/interview">
              <button className="inline-flex items-center justify-center bg-[#0071e3] text-white hover:bg-[#0077ed] rounded-full px-8 py-3 text-[17px] font-medium transition-all active:scale-95">
                면접 시작하기
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
