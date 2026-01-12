'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Company } from '@/types/database.types'

interface CompanySelectorProps {
  onSelectCompany: (company: Company) => void
  onQuickStart: (companySlug: string) => void
  onSkip: () => void
}

type CategoryFilter = 'all' | 'bigtech' | 'conglomerate'

export function CompanySelector({
  onSelectCompany,
  onQuickStart,
  onSkip
}: CompanySelectorProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all')
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null)

  useEffect(() => {
    const fetchCompanies = async () => {
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

    fetchCompanies()
  }, [])

  const filteredCompanies = companies.filter((company) => {
    if (selectedCategory === 'all') return true
    return company.category === selectedCategory
  })

  const handleQuickStart = async (company: Company) => {
    setLoadingSlug(company.slug)
    await onQuickStart(company.slug)
    setLoadingSlug(null)
  }

  const categories: { value: CategoryFilter; label: string }[] = [
    { value: 'all', label: '전체' },
    { value: 'bigtech', label: '빅테크/IT' },
    { value: 'conglomerate', label: '대기업' }
  ]

  // 회사 로고 fallback (로고 이미지가 없을 때)
  const getCompanyInitial = (name: string) => {
    return name.charAt(0)
  }

  const getCategoryColor = (category: string) => {
    return category === 'bigtech'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-purple-100 text-purple-700'
  }

  const getCategoryLabel = (category: string) => {
    return category === 'bigtech' ? 'IT' : '대기업'
  }

  return (
    <div className="space-y-6">
      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((cat) => (
          <Button
            key={cat.value}
            variant={selectedCategory === cat.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.value)}
            className="rounded-full"
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* 회사 카드 그리드 */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex flex-col items-center space-y-3">
                <Skeleton className="w-16 h-16 rounded-xl" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-16" />
                <div className="space-y-2 w-full pt-2">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredCompanies.map((company) => (
            <Card
              key={company.id}
              className="p-4 hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200"
            >
              <div className="flex flex-col items-center space-y-3">
                {/* 회사 로고 */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm overflow-hidden">
                  {company.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt={company.name}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : null}
                  <span
                    className={`text-2xl font-bold text-gray-500 ${company.logo_url ? 'hidden' : ''}`}
                  >
                    {getCompanyInitial(company.name)}
                  </span>
                </div>

                {/* 회사명 */}
                <h3 className="font-semibold text-center text-sm">
                  {company.name}
                </h3>

                {/* 카테고리 뱃지 */}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(company.category)}`}
                >
                  {getCategoryLabel(company.category)}
                </span>

                {/* 질문 수 */}
                <p className="text-xs text-muted-foreground">
                  {company.question_count}개 질문
                </p>

                {/* 버튼 그룹 */}
                <div className="w-full space-y-2 pt-2">
                  <Button
                    className="w-full text-sm"
                    size="sm"
                    onClick={() => handleQuickStart(company)}
                    disabled={loadingSlug === company.slug}
                  >
                    {loadingSlug === company.slug ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        준비 중...
                      </span>
                    ) : (
                      '빠른 시작'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-sm"
                    size="sm"
                    onClick={() => onSelectCompany(company)}
                    disabled={loadingSlug !== null}
                  >
                    질문 선택
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 회사 없이 시작 옵션 */}
      <div className="text-center pt-4 border-t">
        <Button
          variant="ghost"
          onClick={onSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          회사 없이 직접 질문 선택하기
        </Button>
      </div>
    </div>
  )
}
