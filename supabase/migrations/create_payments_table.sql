-- =============================================
-- Payments 테이블 생성 (토스페이먼츠 결제 정보)
-- =============================================

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- 주문 정보
  order_id TEXT UNIQUE NOT NULL,
  payment_key TEXT UNIQUE,

  -- 결제 금액
  amount INTEGER NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'KRW',

  -- 결제 상태: PENDING (대기), PAID (완료), FAILED (실패), CANCELLED (취소)
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'CANCELLED')),

  -- 결제 수단 (카드, 가상계좌, 간편결제 등)
  payment_method TEXT,

  -- 상품 정보
  product_name TEXT NOT NULL,

  -- 고객 정보
  customer_email TEXT,
  customer_name TEXT,

  -- 타임스탬프
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,

  -- 실패 정보
  failure_code TEXT,
  failure_message TEXT,

  -- 영수증 URL
  receipt_url TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_payment_key ON payments(payment_key);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- RLS (Row Level Security) 활성화
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 결제 정보만 조회 가능
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 결제 정보만 생성 가능
CREATE POLICY "Users can create own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 결제 정보만 업데이트 가능 (상태 변경용)
CREATE POLICY "Users can update own payments"
  ON public.payments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin은 모든 결제 정보 조회 가능
CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 완료!
COMMENT ON TABLE public.payments IS '토스페이먼츠 결제 정보';
