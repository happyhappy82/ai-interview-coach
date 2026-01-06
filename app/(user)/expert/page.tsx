import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Briefcase, GraduationCap, Award } from 'lucide-react'
import { redirect } from 'next/navigation'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function ExpertPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen p-1 sm:p-4 md:p-6 lg:p-12">
      <div className="container mx-auto max-w-4xl px-0 sm:px-4 space-y-2 sm:space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <Link href="/result">
            <Button variant="outline" className="rounded-2xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 shadow-soft hover:shadow-glow transition-all text-sm sm:text-base">
              <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">결과로 돌아가기</span>
              <span className="sm:hidden">뒤로</span>
            </Button>
          </Link>
        </div>

        {/* Title */}
        <div className="glass rounded-none sm:rounded-3xl p-4 sm:p-8 md:p-10 shadow-soft">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
              <span className="text-3xl">👨‍💼</span>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                <span className="text-gradient">전문가 프로필</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                실제 합격자의 1:1 맞춤 피드백
              </p>
            </div>
          </div>
        </div>

        {/* Expert Profile */}
        <div className="glass rounded-none sm:rounded-3xl p-6 sm:p-10 shadow-soft">
          <div className="grid md:grid-cols-[200px_1fr] gap-8">
            {/* Left - Photo */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-lg overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <span className="text-6xl">👤</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-100 border border-emerald-200">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">인증 전문가</span>
              </div>
            </div>

            {/* Right - Info */}
            <div className="space-y-6">
              {/* Name */}
              <div>
                <h2 className="text-3xl font-bold mb-2">김취업 멘토</h2>
                <p className="text-muted-foreground">면접 전문가 · 취업 컨설턴트</p>
              </div>

              {/* Bio */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <GraduationCap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm mb-1">학력</p>
                    <p className="text-sm text-muted-foreground">서울대학교 경영학과 졸업</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Briefcase className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm mb-1">경력</p>
                    <p className="text-sm text-muted-foreground">
                      전) 삼성전자 인사팀 5년 근무<br />
                      현) 취업 컨설팅 전문가
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm mb-1">전문 분야</p>
                    <p className="text-sm text-muted-foreground">
                      대기업 면접, STAR 기법, 인성 면접
                    </p>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                <h3 className="font-semibold mb-3 flex items-center text-blue-900">
                  <Award className="h-5 w-5 mr-2 text-blue-600" />
                  합격 실적
                </h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-white/80 border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">2024</div>
                    <div className="text-xs text-muted-foreground mt-1">취업 합격</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/80 border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">2025</div>
                    <div className="text-xs text-muted-foreground mt-1">취업 합격</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/80 border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">2026</div>
                    <div className="text-xs text-muted-foreground mt-1">취업 합격</div>
                  </div>
                </div>
                <p className="text-xs text-blue-800 mt-3 text-center">
                  포트폴리오: 대기업/공기업/외국계 다수 합격
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="glass rounded-none sm:rounded-3xl p-6 sm:p-8 shadow-soft">
          <h3 className="text-2xl font-bold mb-6">제공 서비스</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">녹음 답변 정밀 분석</p>
                <p className="text-sm text-muted-foreground">
                  AI 분석을 넘어 실전 면접관의 시각에서 상세 피드백
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">개선 포인트 구체화</p>
                <p className="text-sm text-muted-foreground">
                  막연한 조언이 아닌, 실제로 적용 가능한 구체적 가이드
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">모범 답변 예시 제공</p>
                <p className="text-sm text-muted-foreground">
                  해당 질문에 대한 효과적인 답변 방향 제시
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">1:1 질의응답</p>
                <p className="text-sm text-muted-foreground">
                  궁금한 점은 실시간 채팅으로 직접 질문 가능
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="glass rounded-none sm:rounded-3xl p-6 sm:p-10 shadow-soft border-2 border-emerald-200">
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-100 border border-emerald-200 mb-4">
              <span className="text-sm font-semibold text-emerald-700">특별 프로모션</span>
            </div>
            <h3 className="text-4xl font-bold mb-2">
              <span className="text-gradient">30,000원</span>
            </h3>
            <p className="text-muted-foreground">30분 1:1 피드백 세션</p>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-border/50">
              <span className="text-sm font-medium">피드백 시간</span>
              <span className="text-sm font-bold">30분</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-border/50">
              <span className="text-sm font-medium">분석 답변 수</span>
              <span className="text-sm font-bold">최대 5개</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-border/50">
              <span className="text-sm font-medium">피드백 제공</span>
              <span className="text-sm font-bold">48시간 이내</span>
            </div>
          </div>

          <Link href="/payments/checkout?amount=100">
            <Button className="w-full rounded-2xl py-7 text-lg shadow-soft hover:shadow-glow transition-all bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
              100원 / 테스트 결제
            </Button>
          </Link>
        </div>

        {/* Reviews (준비 중) */}
        <div className="glass rounded-none sm:rounded-3xl p-6 sm:p-8 shadow-soft">
          <h3 className="text-2xl font-bold mb-6">수강생 후기</h3>
          <div className="text-center py-8 space-y-2">
            <p className="text-muted-foreground">곧 실제 수강생 후기가 공개됩니다</p>
            <p className="text-sm text-muted-foreground">현재 베타 서비스 준비 중입니다</p>
          </div>
        </div>
      </div>
    </div>
  )
}
