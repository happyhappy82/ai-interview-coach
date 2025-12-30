import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 인증되지 않은 사용자는 랜딩으로 리다이렉트
  if (!user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
