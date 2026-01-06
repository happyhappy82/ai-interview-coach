/**
 * 결제 성공 페이지
 * 경로: /payments/success?paymentKey={key}&orderId={id}&amount={amount}
 *
 * 역할:
 * 1. URL 쿼리 파라미터 추출 (paymentKey, orderId, amount)
 * 2. 서버에 결제 승인 요청 (/api/payments/confirm)
 * 3. 승인 완료 후 성공 화면 표시
 */

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get('paymentKey')
      const orderId = searchParams.get('orderId')
      const amount = searchParams.get('amount')

      // 파라미터 검증
      if (!paymentKey || !orderId || !amount) {
        setStatus('error')
        setErrorMessage('결제 정보가 올바르지 않습니다.')
        return
      }

      try {
        // 서버에 승인 요청
        const response = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || '결제 승인 실패')
        }

        // 승인 성공
        setStatus('success')
      } catch (error: any) {
        console.error('결제 승인 에러:', error)
        setStatus('error')
        setErrorMessage(error.message || '결제 승인 중 오류가 발생했습니다.')
      }
    }

    confirmPayment()
  }, [searchParams])

  // 로딩 중
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-6 animate-fade-in">
          <Loader2 className="h-16 w-16 animate-spin text-emerald-500 mx-auto" />
          <div>
            <h2 className="text-2xl font-bold mb-2">결제 승인 중입니다</h2>
            <p className="text-muted-foreground">잠시만 기다려주세요...</p>
          </div>
        </div>
      </div>
    )
  }

  // 에러 발생
  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-10 max-w-md text-center space-y-6 shadow-soft animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-3">결제 실패</h1>
            <p className="text-muted-foreground">{errorMessage}</p>
          </div>
          <Link href="/expert">
            <Button className="w-full rounded-xl py-6">다시 시도하기</Button>
          </Link>
        </Card>
      </div>
    )
  }

  // 성공
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="p-10 max-w-md text-center space-y-8 shadow-soft animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <CheckCircle className="h-12 w-12 text-emerald-600" />
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold">
            <span className="text-gradient">결제 완료!</span>
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            전문가 피드백 서비스 결제가 완료되었습니다.
            <br />
            48시간 이내 전문가가 연락드릴 예정입니다.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>안내:</strong> 등록하신 이메일로 결제 확인 메일이 발송됩니다.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/dashboard" className="block">
            <Button className="w-full rounded-xl py-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
              대시보드로 돌아가기
            </Button>
          </Link>
          <Link href="/expert" className="block">
            <Button
              variant="outline"
              className="w-full rounded-xl py-6 shadow-soft hover:shadow-glow transition-all"
            >
              전문가 프로필 보기
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
