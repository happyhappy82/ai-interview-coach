'use client'

import { Button } from '@/components/ui/button'
import { Download, Share2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface ResultActionsProps {
  resultId: string
  score?: number
  summary?: string
}

export function ResultActions({ resultId, score, summary }: ResultActionsProps) {
  const { toast } = useToast()

  const handleDownloadPDF = async () => {
    try {
      toast({
        title: 'PDF 생성 중...',
        description: '잠시만 기다려주세요.',
      })

      // 결과 페이지 전체를 캡처
      const element = document.getElementById('result-content')
      if (!element) {
        throw new Error('결과 페이지를 찾을 수 없습니다.')
      }

      // html2canvas로 캡처
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      // 첫 페이지 추가
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // 여러 페이지가 필요한 경우
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // PDF 다운로드
      pdf.save(`면접결과_${new Date().toLocaleDateString('ko-KR')}.pdf`)

      toast({
        title: 'PDF 다운로드 완료',
        description: '면접 결과가 저장되었습니다.',
      })
    } catch (error) {
      console.error('PDF 생성 실패:', error)
      toast({
        variant: 'destructive',
        title: 'PDF 생성 실패',
        description: '다시 시도해주세요.',
      })
    }
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
    <div className="grid sm:grid-cols-2 gap-4">
      <Button
        onClick={handleDownloadPDF}
        variant="outline"
        className="rounded-2xl py-7 text-lg shadow-soft hover:shadow-glow transition-all"
      >
        <Download className="mr-2 h-5 w-5" />
        PDF 다운로드
      </Button>
      <Button
        onClick={handleShare}
        variant="outline"
        className="rounded-2xl py-7 text-lg shadow-soft hover:shadow-glow transition-all"
      >
        <Share2 className="mr-2 h-5 w-5" />
        공유하기
      </Button>
    </div>
  )
}
