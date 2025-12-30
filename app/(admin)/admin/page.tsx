import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">관리 메뉴</h2>
        <p className="text-muted-foreground mt-2">
          LiveOps 프롬프트를 수정하고 사용자 데이터를 관리하세요
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-xl shadow-premium">
          <CardHeader>
            <CardTitle>프롬프트 관리</CardTitle>
            <CardDescription>
              AI 면접관 페르소나와 분석 기준을 수정합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/prompts">
              <Button className="w-full rounded-xl">
                프롬프트 수정
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-premium">
          <CardHeader>
            <CardTitle>사용자 관리</CardTitle>
            <CardDescription>
              가입자 현황 및 권한을 관리합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full rounded-xl" disabled>
              준비 중
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-premium">
          <CardHeader>
            <CardTitle>통계 및 분석</CardTitle>
            <CardDescription>
              전환율 및 사용자 활동을 모니터링합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full rounded-xl" disabled>
              준비 중
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
