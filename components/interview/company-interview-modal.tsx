'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Building2, ChevronRight, Briefcase } from 'lucide-react'
import type { Company } from '@/types/database.types'

interface Question {
  id: string
  category: string
  title: string
  order: number
}

interface CompanyInterviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStartInterview: (questions: Question[], company: Company) => void
}

type Step = 'company' | 'category'

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
      custom: '기타',
    }
    return labels[category] || category
  }

  const getCategoryColor = (category: string) => {
    return category === 'bigtech'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-purple-100 text-purple-700'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {step === 'company' ? '기업 선택' : `${selectedCompany?.name} 면접`}
          </DialogTitle>
        </DialogHeader>

        {/* 회사 선택 단계 */}
        {step === 'company' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              면접을 준비할 기업을 선택하세요
            </p>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {/* 빅테크/IT */}
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  빅테크 / IT
                </div>
                {companies
                  .filter((c) => c.category === 'bigtech')
                  .map((company) => (
                    <button
                      key={company.id}
                      onClick={() => handleSelectCompany(company)}
                      className="w-full flex items-center justify-between p-3 rounded-xl border hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-500">
                            {company.name.charAt(0)}
                          </span>
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{company.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {company.question_count}개 질문
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  ))}

                {/* 대기업 */}
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4">
                  대기업
                </div>
                {companies
                  .filter((c) => c.category === 'conglomerate')
                  .map((company) => (
                    <button
                      key={company.id}
                      onClick={() => handleSelectCompany(company)}
                      className="w-full flex items-center justify-between p-3 rounded-xl border hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-500">
                            {company.name.charAt(0)}
                          </span>
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{company.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {company.question_count}개 질문
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
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
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              ← 다른 기업 선택
            </button>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-500">
                  {selectedCompany.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-semibold">{selectedCompany.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedCompany.description}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              면접 유형을 선택하고 바로 시작하세요
            </p>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {/* 전체 면접 (기본) */}
                <button
                  onClick={() => handleSelectCategory('general')}
                  disabled={isStarting}
                  className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">전체 면접</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedCompany.question_count}개 질문으로 종합 면접
                      </p>
                    </div>
                  </div>
                  <Button size="sm" disabled={isStarting}>
                    {isStarting ? '준비 중...' : '바로 면접 보기'}
                  </Button>
                </button>

                {/* 카테고리별 (추후 확장) */}
                {categories.filter(c => c !== 'general').map((category) => (
                  <button
                    key={category}
                    onClick={() => handleSelectCategory(category)}
                    disabled={isStarting}
                    className="w-full flex items-center justify-between p-4 rounded-xl border hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{getCategoryLabel(category)}</p>
                        <p className="text-xs text-muted-foreground">
                          {category} 직군 면접
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" disabled={isStarting}>
                      면접 보기
                    </Button>
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
