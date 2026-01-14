'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Building2, ChevronRight, Briefcase, Loader2 } from 'lucide-react'
import type { Company } from '@/types/database.types'

interface Question {
  id: string
  category: string
  title: string
  order: number
  evaluation_context?: string | null
  company_id?: string | null
}

interface CompanyInterviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStartInterview: (questions: Question[], company: Company) => void
}

type Step = 'company' | 'category'

// 한국 기업 로고 매핑 (회사명 기준)
const COMPANY_LOGOS: Record<string, string> = {
  '네이버': '/logos/Naver_Logotype.svg',
  '카카오': '/logos/Kakao_CI_yellow.svg',
  '토스': '/logos/Toss-logo.svg',
  '쿠팡': '/logos/Coupang_logo.png',
  '배달의민족': '/logos/baemin.svg',
  '당근마켓': '/logos/DaangnMarket_logo.png',
  '삼성전자': '/logos/Samsung_logo_blue.png',
  'LG전자': '/logos/LG_Electronics_Logo_(modern).svg',
  '현대자동차': '/logos/Hyundai_Motor_Company_logo.svg',
  'SK하이닉스': '/logos/SK_Hynix.svg',
}

// 회사명에서 로고 URL 가져오기
const getCompanyLogo = (companyName: string): string | null => {
  return COMPANY_LOGOS[companyName] || null
}

// 회사 배경색 (로고 fallback용)
const COMPANY_COLORS: Record<string, string> = {
  '네이버': '#03C75A',
  '카카오': '#FEE500',
  '토스': '#0064FF',
  '쿠팡': '#E31837',
  '배달의민족': '#2AC1BC',
  '당근마켓': '#FF6F0F',
  '삼성전자': '#1428A0',
  'LG전자': '#A50034',
  '현대자동차': '#002C5F',
  'SK하이닉스': '#E4002B',
}

const getCompanyColor = (companyName: string): string => {
  return COMPANY_COLORS[companyName] || '#6B7280'
}

export function CompanyInterviewModal({
  open,
  onOpenChange,
  onStartInterview,
}: CompanyInterviewModalProps) {
  const [step, setStep] = useState<Step>('company')
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set())

  // 회사 목록 로드
  useEffect(() => {
    if (open && companies.length === 0) {
      fetchCompanies()
    }
  }, [open])

  // 모달 닫힐 때 초기화
  useEffect(() => {
    if (!open) {
      setStep('company')
      setSelectedCompany(null)
      setCategories([])
    }
  }, [open])

  const fetchCompanies = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/companies')
      const { data } = await response.json()
      setCompanies(data || [])
    } catch (error) {
      console.error('Failed to fetch companies:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectCompany = async (company: Company) => {
    setSelectedCompany(company)
    setIsLoading(true)

    try {
      // 해당 회사의 질문 카테고리 조회
      const response = await fetch(`/api/questions?company=${company.id}`)
      const { data: questions } = await response.json()

      // 카테고리 추출 (중복 제거)
      const categorySet = new Set<string>(questions?.map((q: Question) => q.category) || [])
      const uniqueCategories = Array.from(categorySet)
      setCategories(uniqueCategories.length > 0 ? uniqueCategories : ['general'])
      setStep('category')
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectCategory = async (category: string) => {
    if (!selectedCompany) return

    setIsStarting(true)
    try {
      // 해당 회사 + 카테고리의 질문 가져오기
      const response = await fetch(`/api/questions?company=${selectedCompany.id}`)
      const { data: questions } = await response.json()

      // 카테고리 필터링 (general이면 전체)
      const filteredQuestions = category === 'general'
        ? questions
        : questions?.filter((q: Question) => q.category === category)

      if (filteredQuestions && filteredQuestions.length > 0) {
        onStartInterview(filteredQuestions, selectedCompany)
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Failed to start interview:', error)
    } finally {
      setIsStarting(false)
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      general: '일반/인성',
      dev: '개발/기술',
      marketing: '마케팅',
      design: '디자인',
      pm: '기획/PM',
      sales: '영업',
      hr: '인사',
      finance: '재무/회계',
      engineer: 'SW/엔지니어',
      operations: '물류/운영',
      production: '생산/품질',
      custom: '기타',
    }
    return labels[category] || category
  }

  const handleImageError = (companyName: string) => {
    setFailedLogos(prev => new Set(prev).add(companyName))
  }

  // 회사 로고 렌더링 컴포넌트
  const CompanyLogo = ({ company, size = 'sm' }: { company: Company, size?: 'sm' | 'lg' }) => {
    const logoUrl = getCompanyLogo(company.name)
    const bgColor = getCompanyColor(company.name)
    const showFallback = !logoUrl || failedLogos.has(company.name)
    const sizeClasses = size === 'lg' ? 'w-12 h-12' : 'w-10 h-10'
    const textSize = size === 'lg' ? 'text-xl' : 'text-lg'
    const imgSize = size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'

    return (
      <div
        className={`${sizeClasses} rounded-xl flex items-center justify-center overflow-hidden`}
        style={{ backgroundColor: showFallback ? bgColor : '#f3f4f6' }}
      >
        {!showFallback ? (
          <img
            src={logoUrl}
            alt={company.name}
            className={`${imgSize} object-contain`}
            onError={() => handleImageError(company.name)}
          />
        ) : (
          <span className={`${textSize} font-bold text-white`}>
            {company.name.charAt(0)}
          </span>
        )}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-gray-200/50 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <div className="w-8 h-8 rounded-xl bg-[#0071e3] flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            {step === 'company' ? '기업 선택' : `${selectedCompany?.name} 면접`}
          </DialogTitle>
        </DialogHeader>

        {/* 회사 선택 단계 */}
        {step === 'company' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              면접을 준비할 기업을 선택하세요
            </p>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-14 w-full bg-gray-100 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {/* 빅테크/IT */}
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  빅테크 / IT
                </div>
                {companies
                  .filter((c) => c.category === 'bigtech')
                  .map((company) => (
                    <button
                      key={company.id}
                      onClick={() => handleSelectCompany(company)}
                      className="w-full flex items-center justify-between p-3 rounded-2xl border border-gray-200 hover:border-[#0071e3] hover:bg-blue-50/50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <CompanyLogo company={company} />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{company.name}</p>
                          <p className="text-xs text-gray-500">
                            {company.question_count}개 질문
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#0071e3] transition-colors" />
                    </button>
                  ))}

                {/* 대기업 */}
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">
                  대기업
                </div>
                {companies
                  .filter((c) => c.category === 'conglomerate')
                  .map((company) => (
                    <button
                      key={company.id}
                      onClick={() => handleSelectCompany(company)}
                      className="w-full flex items-center justify-between p-3 rounded-2xl border border-gray-200 hover:border-[#0071e3] hover:bg-blue-50/50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <CompanyLogo company={company} />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{company.name}</p>
                          <p className="text-xs text-gray-500">
                            {company.question_count}개 질문
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#0071e3] transition-colors" />
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* 직군/카테고리 선택 단계 */}
        {step === 'category' && selectedCompany && (
          <div className="space-y-4">
            <button
              onClick={() => setStep('company')}
              className="text-sm text-gray-500 hover:text-[#0071e3] flex items-center gap-1 transition-colors"
            >
              ← 다른 기업 선택
            </button>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
              <CompanyLogo company={selectedCompany} size="lg" />
              <div>
                <p className="font-semibold text-gray-900">{selectedCompany.name}</p>
                <p className="text-sm text-gray-500">
                  {selectedCompany.description}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              면접 유형을 선택하고 바로 시작하세요
            </p>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full bg-gray-100 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {/* 전체 면접 (기본) */}
                <button
                  onClick={() => handleSelectCategory('general')}
                  disabled={isStarting}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-[#0071e3] bg-blue-50/50 hover:bg-blue-50 transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0071e3]/10 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-[#0071e3]" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">전체 면접</p>
                      <p className="text-xs text-gray-500">
                        {selectedCompany.question_count}개 질문으로 종합 면접
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center justify-center bg-[#0071e3] text-white hover:bg-[#0077ed] rounded-full px-4 py-2 text-sm font-medium transition-all">
                    {isStarting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        준비 중...
                      </>
                    ) : (
                      '바로 면접 보기'
                    )}
                  </span>
                </button>

                {/* 카테고리별 (추후 확장) */}
                {categories.filter(c => c !== 'general').map((category) => (
                  <button
                    key={category}
                    onClick={() => handleSelectCategory(category)}
                    disabled={isStarting}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-200 hover:border-[#0071e3] hover:bg-blue-50/50 transition-all group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{getCategoryLabel(category)}</p>
                        <p className="text-xs text-gray-500">
                          {category} 직군 면접
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center justify-center bg-white text-[#0071e3] hover:bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm font-medium transition-all">
                      면접 보기
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
