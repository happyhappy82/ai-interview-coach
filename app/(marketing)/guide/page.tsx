import Link from 'next/link'
import { ArrowLeft, Mic, MessageSquare, BarChart3, FileText, Building2, ChevronRight } from 'lucide-react'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '사용 가이드 - AI 면접 코치',
  description: 'AI 면접 코치 사용 방법을 알아보세요. 실전 면접 연습부터 AI 분석까지 완벽 가이드.',
}

export default function GuidePage() {
  const steps = [
    {
      number: '01',
      icon: Building2,
      title: '기업 & 질문 선택',
      description: '네이버, 카카오, 삼성 등 실제 기업의 면접 질문을 선택하거나, 나만의 질문을 직접 추가할 수 있습니다.',
      color: 'bg-blue-500',
    },
    {
      number: '02',
      icon: Mic,
      title: '음성으로 답변',
      description: '실제 면접처럼 음성으로 답변하세요. 녹음 버튼을 누르고 말하면 자동으로 텍스트로 변환됩니다.',
      color: 'bg-green-500',
    },
    {
      number: '03',
      icon: BarChart3,
      title: 'AI 분석 받기',
      description: 'AI가 논리성, 구체성, 진정성 등을 분석하고 STAR 기법 기반의 상세한 피드백을 제공합니다.',
      color: 'bg-purple-500',
    },
    {
      number: '04',
      icon: FileText,
      title: '결과 확인 & 공유',
      description: '문항별 점수와 총평을 확인하고, PDF로 저장하거나 친구에게 공유할 수 있습니다.',
      color: 'bg-orange-500',
    },
  ]

  const features = [
    {
      title: '실제 기업 질문',
      description: '네이버, 카카오, 토스, 삼성 등 실제 기업 면접에서 출제된 질문으로 연습',
    },
    {
      title: '음성 인식 (STT)',
      description: '말한 내용이 자동으로 텍스트로 변환되어 AI가 분석',
    },
    {
      title: 'AI 정밀 분석',
      description: 'GPT-4 기반 AI가 답변의 논리성, 구체성, 진정성을 분석',
    },
    {
      title: 'STAR 기법 피드백',
      description: 'Situation, Task, Action, Result 기법 기반의 개선점 제안',
    },
    {
      title: '기업별 평가 기준',
      description: '각 기업이 중요시하는 평가 기준을 면접 중 확인 가능',
    },
    {
      title: '결과 저장 & 공유',
      description: 'PDF로 저장하거나 카카오톡, SNS로 바로 공유',
    },
  ]

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#F5F5F7]/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-[980px] mx-auto px-4 h-12 flex items-center justify-between text-[12px]">
          <Link href="/" className="font-semibold tracking-tight hover:text-[#0071e3] transition-colors">
            AI 면접 코치
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/guide" className="text-[#0071e3] font-medium hidden sm:inline">소개</Link>
            <GoogleSignInButton variant="compact" />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-[980px] mx-auto">
          <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-[#0071e3] mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로
          </Link>

          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-[#1d1d1f] mb-4">
              사용 가이드
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 font-medium">
              AI 면접 코치로 합격에 한 걸음 더 가까워지세요
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-2 gap-6 mb-20">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 border border-gray-100/50 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className={`${step.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <step.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="text-[#0071e3] font-bold text-sm mb-1">STEP {step.number}</div>
                    <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">{step.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="mb-20">
            <h2 className="text-3xl font-semibold text-center text-[#1d1d1f] mb-12">
              주요 기능
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 border border-gray-100/50 hover:border-[#0071e3]/30 transition-all"
                >
                  <h3 className="font-semibold text-[#1d1d1f] mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-20">
            <h2 className="text-3xl font-semibold text-center text-[#1d1d1f] mb-12">
              자주 묻는 질문
            </h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl p-6 border border-gray-100/50">
                <h3 className="font-semibold text-[#1d1d1f] mb-2">무료로 사용할 수 있나요?</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  네, 현재 모든 기능을 무료로 사용할 수 있습니다. Google 계정으로 로그인하면 바로 면접 연습을 시작할 수 있습니다.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100/50">
                <h3 className="font-semibold text-[#1d1d1f] mb-2">어떤 기업의 질문이 있나요?</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  네이버, 카카오, 토스, 쿠팡, 배달의민족, 당근마켓 등 IT 기업과 삼성, LG, 현대, SK 등 대기업의 실제 면접 질문을 제공합니다.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100/50">
                <h3 className="font-semibold text-[#1d1d1f] mb-2">녹음된 답변은 어떻게 처리되나요?</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  녹음된 답변은 안전하게 암호화되어 저장되며, 본인만 접근할 수 있습니다. 원하시면 언제든지 삭제할 수 있습니다.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100/50">
                <h3 className="font-semibold text-[#1d1d1f] mb-2">모바일에서도 사용할 수 있나요?</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  네, 모바일 브라우저에서도 완벽하게 동작합니다. 어디서든 스마트폰으로 면접 연습을 할 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-black rounded-[30px] p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 tracking-tight">
              지금 바로 시작하세요
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Google 계정으로 간편하게 로그인하고 AI 면접 코치와 함께 합격을 준비하세요.
            </p>
            <GoogleSignInButton variant="dark" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-[980px] mx-auto px-4 text-center">
          <p className="text-[12px] text-gray-400">
            AI 면접 코치 - 합격을 위한 실전 연습
          </p>
        </div>
      </footer>
    </div>
  )
}
