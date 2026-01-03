import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EmailSignInForm } from '@/components/auth/email-sign-in-form'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
    <div className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 lg:p-12">
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4">
        {/* Hero Section */}
        <div className="text-center space-y-6 sm:space-y-8 mb-12 sm:mb-16 animate-fade-in">
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-tight px-2">
              <span className="text-gradient">AI 면접 코치</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed px-4">
              실전과 같은 AI 면접 경험으로
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              취업 합격률을 높이세요
            </p>
          </div>

          {/* Auth Section */}
          <div className="pt-6 flex flex-col gap-5 items-center justify-center max-w-md mx-auto">
            <GoogleSignInButton />

            <div className="flex items-center gap-4 w-full">
              <div className="h-px bg-border/50 flex-1" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">또는</span>
              <div className="h-px bg-border/50 flex-1" />
            </div>

            <EmailSignInForm />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="glass rounded-3xl p-8 hover-lift space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl shadow-lg group-hover:shadow-xl transition-shadow">
              🎯
            </div>
            <h3 className="text-xl font-semibold">실전 같은 면접</h3>
            <p className="text-muted-foreground leading-relaxed">
              AI가 실제 면접관처럼 질문하고 피드백을 제공합니다
            </p>
          </div>

          <div className="glass rounded-3xl p-8 hover-lift space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl shadow-lg group-hover:shadow-xl transition-shadow">
              📊
            </div>
            <h3 className="text-xl font-semibold">정밀한 분석</h3>
            <p className="text-muted-foreground leading-relaxed">
              답변의 구조, 논리성, 진정성을 AI가 상세히 분석합니다
            </p>
          </div>

          <div className="glass rounded-3xl p-8 hover-lift space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white text-2xl shadow-lg group-hover:shadow-xl transition-shadow">
              ⚡
            </div>
            <h3 className="text-xl font-semibold">즉시 개선</h3>
            <p className="text-muted-foreground leading-relaxed">
              면접 직후 개선점을 확인하고 바로 재도전할 수 있습니다
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
