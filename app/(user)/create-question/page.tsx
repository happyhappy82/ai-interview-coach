'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CreateQuestionPage() {
  const [title, setTitle] = useState('')
  const [evaluationContext, setEvaluationContext] = useState(
    '이 질문에 대한 답변을 STAR 기법(Situation, Task, Action, Result)에 따라 평가하세요. 구체성, 논리성, 진정성을 중점적으로 분석해주세요.'
  )
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

            {/* 평가 기준 입력 */}
            <div className="space-y-3">
              <Label htmlFor="evaluationContext" className="text-base font-semibold">
                평가 기준 및 맥락
              </Label>
              <Textarea
                id="evaluationContext"
                value={evaluationContext}
                onChange={(e) => setEvaluationContext(e.target.value)}
                placeholder="AI가 이 질문을 어떻게 평가해야 하는지 설명해주세요"
                className="rounded-xl min-h-[200px] text-base"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">
                AI가 답변을 분석할 때 어떤 기준으로 평가해야 하는지 설명해주세요 ({evaluationContext.length}/1000)
              </p>
            </div>

            {/* 안내 메시지 */}
            <div className="bg-blue-50/50 border border-blue-200/50 rounded-xl p-4 text-sm text-blue-800">
              <p className="font-semibold mb-2">💡 평가 기준 작성 팁:</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>STAR 기법 활용 여부 (Situation, Task, Action, Result)</li>
                <li>구체적인 수치나 사례 포함 여부</li>
                <li>논리적 전개와 일관성</li>
                <li>직무와의 연관성</li>
              </ul>
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
