import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, AlertCircle, Play } from 'lucide-react'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ResultPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // 최신 면접 결과 조회
  const { data: results, error } = await supabase
    .from('interview_results')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // 결과가 있으면 해당 ID의 상세 페이지로 리다이렉트
  if (results && !error) {
    redirect(`/result/${results.id}`)
  }

  // 결과가 없는 경우
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
              <h3 className="text-2xl font-bold text-gray-900 mb-2">면접 결과가 없습니다</h3>
              <p className="text-gray-500">
                먼저 면접을 진행해주세요.
              </p>
            </div>
            <Link href="/interview">
              <button className="inline-flex items-center justify-center bg-[#0071e3] text-white hover:bg-[#0077ed] rounded-full px-8 py-3 text-[17px] font-medium transition-all active:scale-95">
                <Play className="mr-2 h-5 w-5" fill="currentColor" />
                면접 시작하기
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
