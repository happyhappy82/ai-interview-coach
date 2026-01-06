/**
 * 결제 페이지
 * 경로: /payments/checkout?amount=30000
 *
 * 역할:
 * 1. 서버에 주문 생성 요청 (/api/payments/create)
 * 2. 토스페이먼츠 결제창 호출 (loadTossPayments SDK)
 */

'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { loadTossPayments } from '@tosspayments/tosspayments-sdk'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, CreditCard } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage() {
  const searchParams = useSearchParams()

  const amount = Number(searchParams.get('amount')) || 100
  const productName = '결제 테스트'

  const [isLoading, setIsLoading] = useState(false)

  const handlePayment = async () => {
    setIsLoading(true)

    try {
      // 1. 서버에 주문 생성 요청
      const createResponse = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          productName,
          customerName: '고객', // 서버에서 실제 사용자 정보로 대체됨
        }),
      })

      if (!createResponse.ok) {
        const error = await createResponse.json()
        throw new Error(error.error || '주문 생성 실패')
      }

      const { orderId } = await createResponse.json()

      // 2. 토스페이먼츠 SDK 로드
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY
      if (!clientKey) {
        throw new Error('토스페이먼츠 클라이언트 키가 설정되지 않았습니다')
      }

      const tossPayments = await loadTossPayments(clientKey)

      // 3. 결제창 호출
      const payment = tossPayments.payment({ customerKey: 'ANONYMOUS' })
      await payment.requestPayment({
        method: 'CARD',
        amount: {
          currency: 'KRW',
          value: amount,
        },
        orderId,
        orderName: productName,
        successUrl: `${window.location.origin}/payments/success`,
        failUrl: `${window.location.origin}/payments/fail`,
      })
    } catch (error: any) {
      console.error('결제 에러:', error)
      alert(error.message || '결제 중 오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-12">
      <div className="container mx-auto max-w-2xl px-4 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <Link href="/expert">
            <Button
              variant="outline"
              className="rounded-2xl px-4 py-3 shadow-soft hover:shadow-glow transition-all"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              뒤로 가기
            </Button>
          </Link>
        </div>

        {/* Title */}
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 mb-4 shadow-lg">
            <CreditCard className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gradient">결제하기</span>
          </h1>
          <p className="text-muted-foreground">
            토스페이먼츠로 안전하게 결제하세요
          </p>
        </div>

        {/* Payment Form */}
        <Card className="p-8 shadow-soft animate-fade-in">
          <div className="space-y-6">
            {/* 상품 정보 */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
              <h3 className="text-sm font-semibold mb-2 text-foreground/70">
                결제 상품
              </h3>
              <p className="text-lg font-bold">{productName}</p>
            </div>

            {/* 결제 금액 */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
              <h3 className="text-sm font-semibold text-emerald-800 mb-1">
                결제 금액
              </h3>
              <p className="text-3xl font-bold text-emerald-600">
                {amount.toLocaleString()}원
              </p>
            </div>

            {/* 결제 버튼 */}
            <Button
              onClick={handlePayment}
              disabled={isLoading}
              className="w-full rounded-2xl py-6 text-lg shadow-soft hover:shadow-glow transition-all bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            >
              {isLoading ? '처리 중...' : '결제하기'}
            </Button>

            {/* 안내 문구 */}
            <p className="text-xs text-center text-muted-foreground">
              결제 버튼을 누르면 토스페이먼츠 결제창으로 이동합니다
            </p>
          </div>
        </Card>

        {/* 결제 안내 */}
        <div className="glass rounded-none sm:rounded-3xl p-6 border border-blue-200/50 animate-fade-in">
          <h3 className="text-sm font-semibold mb-3 flex items-center">
            <span className="text-xl mr-2">💳</span>
            결제 안내
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>안전한 결제를 위해 토스페이먼츠를 사용합니다</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>결제 완료 후 48시간 이내 전문가가 연락드립니다</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>문의사항은 고객센터로 연락주세요</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
