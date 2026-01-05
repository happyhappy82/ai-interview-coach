'use client'

import { Button } from '@/components/ui/button'
import { Download, Share2, Printer } from 'lucide-react'
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

  // 브라우저 기본 인쇄 기능 사용 (권장)
  const handlePrint = () => {
    window.print()
  }

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

      // 스크롤을 맨 위로 이동
      window.scrollTo(0, 0)

      // DOM이 완전히 렌더링될 때까지 대기
      await new Promise(resolve => setTimeout(resolve, 500))

      // html2canvas로 캡처 (개선된 옵션)
      const canvas = await html2canvas(element, {
        scale: 3, // 더 높은 해상도
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#f5f5f5',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        scrollY: -window.scrollY,
        scrollX: -window.scrollX,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // 클론된 문서에서 스타일 강제 적용
          const clonedElement = clonedDoc.getElementById('result-content')
          if (clonedElement) {
            clonedElement.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", "Malgun Gothic", "맑은 고딕", sans-serif'
            clonedElement.style.fontSize = '14px'
            clonedElement.style.lineHeight = '1.6'
          }
        }
      })

      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      })

      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      // 첫 페이지 추가
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
      heightLeft -= pageHeight

      // 여러 페이지가 필요한 경우
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
        heightLeft -= pageHeight
      }

      // PDF 다운로드
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
      {/* 인쇄/PDF 저장 (권장) */}
      <Button
        onClick={handlePrint}
        className="w-full rounded-2xl py-7 text-lg shadow-soft hover:shadow-glow transition-all"
      >
        <Printer className="mr-2 h-5 w-5" />
        인쇄 / PDF 저장
      </Button>

      {/* 공유 및 고급 옵션 */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Button
          onClick={handleDownloadPDF}
          variant="outline"
          className="rounded-2xl py-6 text-base shadow-soft hover:shadow-glow transition-all"
        >
          <Download className="mr-2 h-4 w-4" />
          PDF 직접 저장
        </Button>
        <Button
          onClick={handleShare}
          variant="outline"
          className="rounded-2xl py-6 text-base shadow-soft hover:shadow-glow transition-all"
        >
          <Share2 className="mr-2 h-4 w-4" />
          공유하기
        </Button>
      </div>

      {/* 안내 메시지 */}
      <div className="bg-blue-50/50 border border-blue-200/50 rounded-xl p-3 text-sm text-blue-800">
        💡 <strong>팁:</strong> &ldquo;인쇄 / PDF 저장&rdquo; 버튼을 클릭한 후, 인쇄 대화상자에서 &ldquo;PDF로 저장&rdquo;을 선택하면 가장 깔끔한 PDF를 얻을 수 있습니다.
      </div>
    </div>
  )
}
