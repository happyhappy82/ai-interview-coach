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

-- 인덱스 생성 (중복 생성 방지)
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_key ON payments(payment_key);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- RLS (Row Level Security) 활성화
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policy 생성 (이미 존재하면 무시)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Users can view own payments'
  ) THEN
    CREATE POLICY "Users can view own payments"
      ON public.payments FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Users can create own payments'
  ) THEN
    CREATE POLICY "Users can create own payments"
      ON public.payments FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Users can update own payments'
  ) THEN
    CREATE POLICY "Users can update own payments"
      ON public.payments FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Admins can view all payments'
  ) THEN
    CREATE POLICY "Admins can view all payments"
      ON public.payments FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- 완료!
COMMENT ON TABLE public.payments IS '토스페이먼츠 결제 정보';
