/**
 * 결제 실패 페이지
 * 경로: /payments/fail?message={message}&code={code}
 *
 * 역할: 사용자가 결제를 취소하거나 실패한 경우 표시
 */

'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { XCircle } from 'lucide-react'
import Link from 'next/link'

export default function PaymentFailPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || '결제가 취소되었습니다.'
  const code = searchParams.get('code') || 'USER_CANCEL'

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="p-10 max-w-md text-center space-y-6 shadow-soft animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <XCircle className="h-12 w-12 text-red-600" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold">결제 실패</h1>
          <p className="text-muted-foreground">{message}</p>
          {code && (
            <p className="text-xs text-muted-foreground">오류 코드: {code}</p>
          )}
        </div>

        <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
          <p className="text-sm text-yellow-800">
            문제가 지속되면 고객센터로 문의해주세요.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/payments/checkout?amount=30000"
            className="block"
          >
            <Button className="w-full rounded-xl py-6">다시 시도하기</Button>
          </Link>
          <Link href="/expert" className="block">
            <Button
              variant="outline"
              className="w-full rounded-xl py-6 shadow-soft hover:shadow-glow transition-all"
            >
              전문가 프로필로 돌아가기
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
