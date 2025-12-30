/**
 * 인앱 브라우저 차단 화면
 * scenarios.md Case 2-1
 */

'use client'

import { useEffect, useState } from 'react'
import { isInAppBrowser } from '@/lib/browser-detect'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export function InAppBrowserBlocker({ children }: { children: React.ReactNode }) {
  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => {
    setIsBlocked(isInAppBrowser())
  }, [])

  if (!isBlocked) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <Card className="max-w-md rounded-xl shadow-premium-lg border-destructive">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <CardTitle className="text-destructive">지원하지 않는 브라우저</CardTitle>
          </div>
          <CardDescription>
            인앱 브라우저에서는 녹음 기능이 제한됩니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            AI 면접 코치는 안정적인 녹음을 위해 일반 브라우저 사용을 권장합니다.
          </p>

          <div className="bg-muted rounded-lg p-4 space-y-2">
            <p className="font-semibold text-sm">다음 브라우저로 열어주세요:</p>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>Safari (iOS)</li>
              <li>Chrome (Android)</li>
              <li>삼성 인터넷 (Android)</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>방법:</strong> 우측 상단 메뉴(⋯)를 클릭하고
              &quot;브라우저로 열기&quot; 또는 &quot;Safari로 열기&quot;를 선택하세요.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
