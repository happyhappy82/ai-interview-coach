/**
 * POST /api/payments/confirm
 * 역할: 토스페이먼츠 API에 결제 승인 요청 및 DB 업데이트
 *
 * 흐름:
 * 1. 클라이언트로부터 paymentKey, orderId, amount 수신
 * 2. 토스페이먼츠 승인 API 호출 (서버 to 서버)
 * 3. 성공 시 DB 업데이트 (status: PAID, payment_key, receipt_url 등)
 * 4. 실패 시 DB 업데이트 (status: FAILED, failure_code/message)
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { ConfirmPaymentRequest, TossPaymentsResponse } from '@/types/payment'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: ConfirmPaymentRequest = await request.json()
    const { paymentKey, orderId, amount } = body

    // 입력 검증
    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: '필수 파라미터 누락' },
        { status: 400 }
      )
    }

    // 환경 변수 확인
    const secretKey = process.env.TOSS_SECRET_KEY
    if (!secretKey) {
      console.error('TOSS_SECRET_KEY 환경 변수 미설정')
      return NextResponse.json(
        { error: '토스 시크릿 키 미설정' },
        { status: 500 }
      )
    }

    // 토스페이먼츠 승인 API 호출
    // Basic 인증: Base64(시크릿키 + ':')
    const authHeader = `Basic ${Buffer.from(secretKey + ':').toString('base64')}`

    console.log('토스페이먼츠 승인 API 호출 시작...')

    const tossResponse = await fetch(
      'https://api.tosspayments.com/v1/payments/confirm',
      {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
        }),
      }
    )

    const result: TossPaymentsResponse = await tossResponse.json()

    if (!tossResponse.ok) {
      // 결제 승인 실패 - DB 업데이트
      console.error('토스페이먼츠 승인 실패:', result)

      await supabase
        .from('payments')
        .update({
          status: 'FAILED',
          failed_at: new Date().toISOString(),
          failure_code: result.failure?.code || 'UNKNOWN_ERROR',
          failure_message: result.failure?.message || '결제 승인 실패',
        })
        .eq('order_id', orderId)
        .eq('user_id', user.id)

      return NextResponse.json(
        { error: result.failure?.message || '결제 승인 실패' },
        { status: tossResponse.status }
      )
    }

    // 결제 승인 성공 - DB 업데이트
    console.log('토스페이먼츠 승인 성공!')

    const { error: updateError } = await supabase
      .from('payments')
      .update({
        payment_key: paymentKey,
        status: 'PAID',
        payment_method: result.method,
        completed_at: result.approvedAt || new Date().toISOString(),
        receipt_url: result.receipt?.url,
      })
      .eq('order_id', orderId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('결제 정보 업데이트 실패:', updateError)
      return NextResponse.json(
        { error: '결제 정보 업데이트 실패' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      payment: result,
    })
  } catch (error) {
    console.error('결제 승인 에러:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
