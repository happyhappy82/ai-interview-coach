import { createClient } from '@/lib/supabase/server'
import { PromptsList } from '@/components/admin/prompts-list'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PromptsManagementPage() {
  const supabase = await createClient()

  // 모든 프롬프트 조회 (활성화 여부 무관)
  const { data: prompts, error } = await supabase
    .from('system_prompts')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-red-500">
          프롬프트를 불러오는 중 오류가 발생했습니다: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            프롬프트 관리
          </h1>
          <p className="text-muted-foreground mt-2">
            AI 면접관의 페르소나와 분석 기준을 실시간으로 수정하세요
          </p>
        </div>
        <Link href="/admin">
          <Button variant="outline" className="rounded-xl">
            <ArrowLeft className="mr-2 h-4 w-4" />
            관리자 홈
          </Button>
        </Link>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">💡</div>
          <div className="space-y-1">
            <h3 className="font-semibold text-blue-900">LiveOps 프롬프트 시스템</h3>
            <p className="text-sm text-blue-800">
              여기서 수정한 내용은 <strong>앱 재배포 없이</strong> 즉시 전세계 모든 사용자에게 반영됩니다.
              프롬프트를 수정하면 다음 면접부터 새로운 AI 성향이 적용됩니다.
            </p>
          </div>
        </div>
      </div>

      {!prompts || prompts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          프롬프트가 없습니다. Supabase에서 schema.sql을 실행했는지 확인하세요.
        </div>
      ) : (
        <PromptsList initialPrompts={prompts} />
      )}

      <div className="bg-muted rounded-xl p-6 space-y-2">
        <h3 className="font-semibold">프롬프트 키(key_name) 설명</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li><code className="bg-background px-1 rounded">interviewer_persona</code> - AI 면접관의 기본 성격과 태도</li>
          <li><code className="bg-background px-1 rounded">analysis_rules</code> - 답변 분석 기준 및 JSON 출력 형식</li>
          <li><code className="bg-background px-1 rounded">question_generation</code> - 맞춤형 질문 생성 규칙</li>
        </ul>
      </div>
    </div>
  )
}
