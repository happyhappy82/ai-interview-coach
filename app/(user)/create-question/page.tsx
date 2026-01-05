'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CreateQuestionPage() {
  const [title, setTitle] = useState('')
  const [evaluationContext, setEvaluationContext] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        variant: 'destructive',
        title: '질문을 입력하세요',
        description: '면접 질문을 입력해주세요.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          evaluationContext: evaluationContext.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('질문 생성 실패')
      }

      toast({
        title: '질문 생성 완료!',
        description: '새로운 면접 질문이 생성되었습니다.',
      })

      router.push('/dashboard')
    } catch (error) {
      console.error('질문 생성 에러:', error)
      toast({
        variant: 'destructive',
        title: '질문 생성 실패',
        description: '다시 시도해주세요.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen p-1 sm:p-4 md:p-6 lg:p-12">
      <div className="container mx-auto max-w-4xl px-0 sm:px-4 space-y-2 sm:space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-2xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 shadow-soft hover:shadow-glow transition-all text-sm sm:text-base">
              <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">대시보드</span>
              <span className="sm:hidden">뒤로</span>
            </Button>
          </Link>
        </div>

        {/* Title */}
        <div className="glass rounded-none sm:rounded-3xl p-4 sm:p-8 md:p-10 lg:p-12 shadow-soft">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                <span className="text-gradient">질문 만들기</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                나만의 맞춤형 면접 질문을 만들어보세요
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            {/* 질문 입력 */}
            <div className="space-y-3">
              <Label htmlFor="title" className="text-base font-semibold">
                면접 질문
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 지원 동기는 무엇인가요?"
                className="rounded-xl py-6 text-base"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                면접에서 물어보고 싶은 질문을 입력하세요 ({title.length}/200)
              </p>
            </div>

            {/* 평가 기준 입력 (선택사항 - 접기/펼치기) */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <span>평가 기준 직접 작성 (선택사항)</span>
              </button>

              {showAdvanced && (
                <div className="space-y-3 animate-in slide-in-from-top-2">
                  <Label htmlFor="evaluationContext" className="text-sm font-medium text-muted-foreground">
                    평가 기준 및 맥락
                  </Label>
                  <Textarea
                    id="evaluationContext"
                    value={evaluationContext}
                    onChange={(e) => setEvaluationContext(e.target.value)}
                    placeholder="비워두면 AI가 질문에 맞는 평가 기준을 자동으로 생성합니다"
                    className="rounded-xl min-h-[200px] text-base"
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground">
                    AI가 답변을 분석할 때 어떤 기준으로 평가해야 하는지 설명해주세요 ({evaluationContext.length}/1000)
                  </p>
                </div>
              )}
            </div>

            {/* 안내 메시지 */}
            <div className="bg-blue-50/50 border border-blue-200/50 rounded-xl p-4 text-sm text-blue-800">
              <p className="font-semibold mb-2">✨ AI가 자동으로 평가 기준을 생성합니다</p>
              <p className="text-xs leading-relaxed">
                질문만 입력하시면 AI가 자동으로 해당 질문에 최적화된 평가 기준을 만들어드립니다.
                직접 평가 기준을 작성하고 싶다면 위의 &ldquo;평가 기준 직접 작성&rdquo; 버튼을 클릭하세요.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl py-7 text-lg shadow-soft hover:shadow-glow transition-all"
            >
              {isSubmitting ? '생성 중...' : '질문 생성하기'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
