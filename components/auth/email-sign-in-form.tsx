'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export function EmailSignInForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    console.log('Form submitted with email:', email)

    if (!email) {
      setError('이메일을 입력해주세요.')
      return
    }

    try {
      setIsLoading(true)
      console.log('Creating Supabase client...')
      const supabase = createClient()

      console.log('Sending OTP...')
      const { data, error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      console.log('OTP response:', { data, error: otpError })

      if (otpError) {
        console.error('Login error:', otpError)
        setError(`로그인 오류: ${otpError.message}`)
      } else {
        console.log('OTP sent successfully!')
        setSent(true)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setError('예상치 못한 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm rounded-xl border-2 border-green-500 bg-green-50 p-6 text-center space-y-2">
        <h3 className="font-semibold text-lg text-green-900">이메일을 확인해주세요!</h3>
        <p className="text-sm text-green-700">
          <strong>{email}</strong>로 로그인 링크를 전송했습니다.
          <br />
          이메일의 링크를 클릭하면 자동으로 로그인됩니다.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleEmailSignIn} className="w-full max-w-sm space-y-4">
      <div className="space-y-2">
        <input
          type="email"
          placeholder="이메일 주소 입력"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-8 py-4 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            전송 중...
          </>
        ) : (
          '로그인 링크 받기'
        )}
      </button>
    </form>
  )
}
