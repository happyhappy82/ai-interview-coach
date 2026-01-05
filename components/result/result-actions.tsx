'use client'

import { Button } from '@/components/ui/button'
import { Share2, Printer } from 'lucide-react'
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

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    try {
      toast({
        title: 'PDF 생성 중...',
        description: '잠시만 기다려주세요.',
      })

      const element = document.getElementById('result-content')
      if (!element) {
        throw new Error('결과 페이지를 찾을 수 없습니다.')
      }

      window.scrollTo(0, 0)
      await new Promise(resolve => setTimeout(resolve, 500))

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        scrollY: -window.scrollY,
        scrollX: -window.scrollX,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('result-content')
          if (clonedElement) {
            clonedElement.style.fontFamily = 'system-ui, -apple-system, sans-serif'

            // 그라데이션 텍스트를 일반 텍스트로
            const gradientTexts = clonedElement.querySelectorAll('.text-gradient')
            gradientTexts.forEach((el: Element) => {
              const htmlEl = el as HTMLElement
              htmlEl.style.background = 'none'
              htmlEl.style.color = '#5b21b6'
              htmlEl.style.webkitBackgroundClip = 'unset'
              htmlEl.style.backgroundClip = 'unset'
            })

            // glass 효과를 흰색 배경으로
            const glassElements = clonedElement.querySelectorAll('.glass')
            glassElements.forEach((el: Element) => {
              const htmlEl = el as HTMLElement
              htmlEl.style.background = 'white'
              htmlEl.style.backdropFilter = 'none'
              htmlEl.style.border = '1px solid #e5e7eb'
            })
          }
        }
      })

      const imgData = canvas.toDataURL('image/png', 0.95)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      })

      const pdfWidth = 210
      const pdfHeight = 297
      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * pdfWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
      heightLeft -= pdfHeight

      while (heightLeft > 0) {
        position -= pdfHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
        heightLeft -= pdfHeight
      }

      const fileName = `면접결과_${new Date().toLocaleDateString('ko-KR').replace(/\./g, '-').replace(/ /g, '')}.pdf`
      pdf.save(fileName)

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
    <div className="space-y-4">
      {/* 인쇄/PDF 다운로드 및 공유하기 */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Button
          onClick={handleDownloadPDF}
          className="rounded-2xl py-7 text-base sm:text-lg shadow-soft hover:shadow-glow transition-all"
        >
          <Printer className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          인쇄 / PDF 다운로드
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
        💡 <strong>팁:</strong> PDF 다운로드 후 파일을 열어서 인쇄하실 수 있습니다.
      </div>
    </div>
  )
}
