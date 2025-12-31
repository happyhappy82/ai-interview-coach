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
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-3xl">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-foreground tracking-tight">
            AI 면접 코치
          </h1>
          <p className="text-xl text-muted-foreground">
            실전과 같은 AI 면접 경험으로 취업 합격률을 높이세요
          </p>
        </div>

        <div className="pt-8 flex flex-col gap-4 items-center justify-center max-w-md mx-auto">
          <GoogleSignInButton />

          <div className="flex items-center gap-4 w-full">
            <div className="h-px bg-border flex-1" />
            <span className="text-sm text-muted-foreground">또는</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <EmailSignInForm />
        </div>

        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="space-y-2">
            <div className="text-2xl font-bold">🎯</div>
            <h3 className="font-semibold">실전 같은 면접</h3>
            <p className="text-sm text-muted-foreground">
              AI가 실제 면접관처럼 질문하고 피드백을 제공합니다
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-2xl font-bold">📊</div>
            <h3 className="font-semibold">정밀한 분석</h3>
            <p className="text-sm text-muted-foreground">
              답변의 구조, 논리성, 진정성을 AI가 상세히 분석합니다
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-2xl font-bold">⚡</div>
            <h3 className="font-semibold">즉시 개선</h3>
            <p className="text-sm text-muted-foreground">
              면접 직후 개선점을 확인하고 바로 재도전할 수 있습니다
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
