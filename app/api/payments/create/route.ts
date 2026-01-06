/**
 * POST /api/payments/create
 * 역할: 결제 주문 정보를 데이터베이스에 저장
 *
 * 흐름:
 * 1. 인증 확인
 * 2. 고유 주문 ID 생성
 * 3. payments 테이블에 PENDING 상태로 저장
 * 4. orderId 반환 (클라이언트가 토스 결제창 호출 시 사용)
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { CreatePaymentRequest, CreatePaymentResponse } from '@/types/payment'

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

    const body: CreatePaymentRequest = await request.json()
    const { amount, productName, customerName, customerEmail } = body

    // 입력 검증
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (!productName || !customerName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 고유 주문 ID 생성 (타임스탬프 + 사용자 ID 일부)
    const orderId = `ORDER_${Date.now()}_${user.id.substring(0, 8)}`

    // 결제 정보 DB 저장 (상태: PENDING)
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        order_id: orderId,
        amount,
        currency: 'KRW',
        status: 'PENDING',
        product_name: productName,
        customer_email: customerEmail || user.email,
        customer_name: customerName,
      })
      .select()
      .single()

    if (error) {
      console.error('결제 정보 저장 실패:', error)
      return NextResponse.json(
        { error: '결제 정보 저장 실패' },
        { status: 500 }
      )
    }

    const response: CreatePaymentResponse = {
      orderId,
      amount,
      payment,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('결제 생성 에러:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
