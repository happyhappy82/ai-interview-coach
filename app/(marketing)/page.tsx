import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AI 면접 코치 - 실전 같은 AI 면접 연습',
  description: '실전과 같은 AI 면접 경험으로 취업 합격률을 높이세요. AI가 실제 면접관처럼 질문하고 정밀한 피드백을 제공합니다.',
  keywords: ['AI 면접', '면접 연습', '취업 준비', '면접 코칭', '모의 면접', 'AI 코치'],
  openGraph: {
    title: 'AI 면접 코치',
    description: '실전과 같은 AI 면접 경험으로 취업 합격률을 높이세요',
    type: 'website',
    locale: 'ko_KR',
    siteName: 'AI 면접 코치',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'AI 면접 코치',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI 면접 코치',
    description: '실전과 같은 AI 면접 경험으로 취업 합격률을 높이세요',
    images: ['/api/og'],
  },
}

export default async function LandingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 이미 로그인된 사용자는 대시보드로 리다이렉트
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7] text-[#1d1d1f]">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#F5F5F7]/80 backdrop-blur-md border-b border-gray-200/50 transition-all duration-300">
        <div className="max-w-[980px] mx-auto px-4 h-12 flex items-center justify-between text-[12px]">
          <Link href="/" className="font-semibold tracking-tight cursor-pointer hover:text-[#0071e3] transition-colors">AI 면접 코치</Link>
          <div className="flex gap-6 items-center">
            <Link href="/guide" className="cursor-pointer hover:text-[#0071e3] transition-colors text-gray-500 hidden sm:inline">소개</Link>
            <GoogleSignInButton variant="compact" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-20 px-4 md:px-0">

        {/* Hero Section */}
        <div className="max-w-[980px] mx-auto text-center animate-fade-in mb-24">
          <h2 className="text-[#F56300] font-semibold text-lg md:text-xl mb-3">New</h2>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-[#1d1d1f] mb-4 leading-[1.05]">
            AI 면접 코치.
          </h1>
          <p className="text-2xl md:text-3xl font-medium text-[#1d1d1f] tracking-tight mb-8">
            합격을 위한 실전 연습.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
            <GoogleSignInButton />
            <Link href="/guide" className="text-[#0066cc] hover:underline flex items-center text-[17px] group">
              자세히 알아보기 <ChevronRight size={16} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Hero Graphic: Interview Chat Mock */}
          <div className="mt-16 mx-auto max-w-2xl bg-white rounded-[28px] shadow-2xl border border-gray-200 overflow-hidden relative">
            <div className="w-full h-7 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
            </div>
            <div className="p-6 md:p-10 flex flex-col space-y-5">
              {/* AI 질문 1 */}
              <div className="self-start">
                <div className="bg-gray-100 text-gray-700 px-5 py-3 rounded-2xl rounded-tl-sm text-sm md:text-base font-medium">
                  본인 소개 해주세요.
                </div>
              </div>
              {/* 사용자 답변 */}
              <div className="self-end">
                <div className="bg-[#0071e3] text-white px-5 py-3 rounded-2xl rounded-br-sm text-sm md:text-base font-medium">
                  안녕하십니까. 지원자 OOO입니다 ....
                </div>
              </div>
              {/* AI 질문 2 */}
              <div className="self-start">
                <div className="bg-gray-100 text-gray-700 px-5 py-3 rounded-2xl rounded-tl-sm text-sm md:text-base font-medium">
                  우리 회사에 지원하신 동기가 어떻게 되나요?
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Box Feature Grid */}
        <div className="max-w-[980px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Card 1: AI 면접 시뮬레이션 */}
            <div className="bg-white rounded-[30px] p-8 md:p-12 overflow-hidden relative group hover:shadow-xl transition-all duration-500 border border-gray-100/50">
              <div className="relative z-10">
                <h3 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-2">시뮬레이션</h3>
                <h4 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] mb-4 tracking-tight">실전 같은 면접.<br/>실제 기업 질문.</h4>
                <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-sm">
                  네이버, 카카오, 삼성 등 실제 기업의 면접 질문으로
                  실전처럼 연습하세요.
                </p>
              </div>
              {/* Visual: Audio Waveform */}
              <div className="mt-12 flex items-center justify-center gap-1.5 h-24 opacity-60 group-hover:opacity-100 transition-opacity">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 bg-[#0071e3] rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 60 + 20}%`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Card 2: Analytics */}
            <div className="bg-white rounded-[30px] p-8 md:p-10 overflow-hidden relative group hover:shadow-xl transition-all duration-500 border border-gray-100/50 min-h-[400px]">
              <div className="relative z-10">
                <h3 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-2">분석</h3>
                <h4 className="text-3xl font-semibold text-[#1d1d1f] mb-3 tracking-tight">정밀한 AI 분석.</h4>
                <p className="text-md text-gray-500 font-medium leading-relaxed">
                  논리성, 구체성, 진정성을 AI가 상세히 분석합니다.
                </p>
              </div>
              {/* Visual: Charts */}
              <div className="absolute bottom-8 right-8 left-8">
                <div className="flex items-end justify-between h-32 gap-4">
                  <div className="w-full bg-gray-100 rounded-t-lg h-[40%] group-hover:h-[50%] transition-all duration-700"></div>
                  <div className="w-full bg-gray-200 rounded-t-lg h-[60%] group-hover:h-[75%] transition-all duration-700 delay-75"></div>
                  <div className="w-full bg-[#1d1d1f] rounded-t-lg h-[80%] group-hover:h-[95%] transition-all duration-700 delay-150 relative">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">98점</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Instant Feedback (Dark) */}
            <div className="md:col-span-2 bg-black rounded-[30px] p-8 md:p-12 overflow-hidden relative group text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                <div className="max-w-md">
                  <h3 className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-2">즉시 피드백</h3>
                  <h4 className="text-3xl md:text-4xl font-semibold mb-4 tracking-tight">
                    연습하고, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">바로 개선</span>하세요.
                  </h4>
                  <p className="text-lg text-gray-400 font-medium leading-relaxed">
                    면접 직후 AI가 STAR 기법 기반의 개선점을 즉시 제공합니다.
                    반복 연습으로 합격에 가까워지세요.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <GoogleSignInButton variant="dark" />
                </div>
              </div>
              {/* Visual: Dark Mode Glow */}
              <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
            </div>

          </div>
        </div>

        {/* Footer / Trusted Text */}
        <div className="max-w-[980px] mx-auto mt-24 text-center border-t border-gray-200 pt-12">
          <p className="text-[12px] text-gray-400 font-medium">
            네이버, 카카오, 삼성 등 주요 기업 면접 합격자들이 사용합니다.
          </p>
        </div>
      </main>
    </div>
  )
}
