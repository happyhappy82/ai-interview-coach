'use client'

import { Button } from '@/components/ui/button'
import { Share2, Printer } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ResultActionsProps {
  resultId: string
  score?: number
  summary?: string
}

export function ResultActions({ resultId, score, summary }: ResultActionsProps) {
  const { toast } = useToast()

  // 인쇄 대화상자 열기 (PDF 저장은 인쇄 창에서 선택)
  const handlePrint = () => {
    window.print()
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/result/${resultId}`
    const shareTitle = `AI 면접 코치 - 분석 결과 ${score ? `(점수: ${score}점)` : ''}`
    const shareText = summary || '면접 분석 결과를 확인해보세요!'

    // Web Share API 지원 확인
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
        toast({
          title: '공유 완료',
          description: '링크가 공유되었습니다.',
        })
      } catch (error) {
        // 사용자가 공유 취소한 경우
        if ((error as Error).name !== 'AbortError') {
          console.error('공유 실패:', error)
        }
      }
    } else {
      // Web Share API 미지원 - 클립보드에 복사
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast({
          title: '링크 복사 완료',
          description: '클립보드에 링크가 복사되었습니다.',
        })
      } catch (error) {
        console.error('클립보드 복사 실패:', error)
        toast({
          variant: 'destructive',
          title: '공유 실패',
          description: '링크를 복사할 수 없습니다.',
        })
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* 인쇄/PDF 저장 및 공유하기 */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Button
          onClick={handlePrint}
          className="rounded-2xl py-7 text-base sm:text-lg shadow-soft hover:shadow-glow transition-all"
        >
          <Printer className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          인쇄 / PDF 저장
        </Button>
        <Button
          onClick={handleShare}
          variant="outline"
          className="rounded-2xl py-7 text-base sm:text-lg shadow-soft hover:shadow-glow transition-all"
        >
          <Share2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          공유하기
        </Button>
      </div>

      {/* 안내 메시지 */}
      <div className="bg-blue-50/50 border border-blue-200/50 rounded-xl p-3 text-sm text-blue-800">
        💡 <strong>팁:</strong> 인쇄 창에서 &quot;PDF로 저장&quot;을 선택하면 PDF 파일로 저장할 수 있습니다.
      </div>
    </div>
  )
}
