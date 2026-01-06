/**
 * 결제 관련 TypeScript 타입 정의
 */

export interface Payment {
  id: string
  user_id: string
  order_id: string
  payment_key?: string
  amount: number
  currency: string
  status: PaymentStatus
  payment_method?: string
  product_name: string
  customer_email?: string
  customer_name?: string
  requested_at: string
  completed_at?: string
  failed_at?: string
  failure_code?: string
  failure_message?: string
  receipt_url?: string
  created_at: string
  updated_at: string
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED'

export interface CreatePaymentRequest {
  amount: number
  productName: string
  customerName: string
  customerEmail?: string
}

export interface CreatePaymentResponse {
  orderId: string
  amount: number
  payment: Payment
}

export interface ConfirmPaymentRequest {
  paymentKey: string
  orderId: string
  amount: number
}

export interface TossPaymentsResponse {
  paymentKey: string
  orderId: string
  status: string
  totalAmount: number
  method: string
  receipt?: {
    url: string
  }
  requestedAt: string
  approvedAt?: string
  failure?: {
    code: string
    message: string
  }
}
