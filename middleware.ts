import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  // Supabase Session 갱신 (토큰 만료 방지)
  const { supabaseResponse, user } = await updateSession(request)

  const { pathname } = request.nextUrl

  // Admin 경로 보호 로직
  if (pathname.startsWith('/admin')) {
    if (!user) {
      // 로그인하지 않은 경우 메인으로 리다이렉트
      return NextResponse.redirect(new URL('/', request.url))
    }

    // 사용자 역할 확인
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      // 일반 유저는 메인으로 강제 이동
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * 다음을 제외한 모든 경로에서 실행:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public 폴더 내 파일
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
