'use client'

import { useState, useEffect } from 'react'
import { InAppBrowserBlocker } from '@/components/interview/in-app-browser-blocker'
import { AudioRecorder } from '@/components/interview/audio-recorder'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Upload, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Question {
  id: string
  category: string
  title: string
  order: number
}

interface Answer {
  questionId: string
  questionTitle: string
  audioUrl: string
  transcript: string
  duration: number
}

export default function InterviewPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [answers, setAnswers] = useState<Answer[]>([]) // 모든 답변 저장
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    try {
      const response = await fetch('/api/questions?category=general')
      if (!response.ok) {
        throw new Error('Failed to load questions')
      }

      const { data } = await response.json()
      setQuestions(data)
    } catch (error) {
      console.error('Error loading questions:', error)
      toast({
        variant: 'destructive',
        title: '질문 로딩 실패',
        description: '질문을 불러오는 중 오류가 발생했습니다.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecordingComplete = async (blob: Blob, duration: number, transcript: string) => {
    if (!questions[currentQuestionIndex]) return

    console.log('=== 녹음 완료 ===')
    console.log('Blob size:', blob.size)
    console.log('Duration:', duration)
    console.log('Transcript:', transcript)

    try {
      setIsUploading(true)

      const currentQuestion = questions[currentQuestionIndex]
      console.log('Current question:', currentQuestion)

      // 1. Storage 업로드만 수행 (AI 분석은 나중에 일괄 처리)
      console.log('1. 파일 업로드 시작...')

      // Blob의 MIME 타입에서 확장자 추출 (Safari/macOS 호환성)
      const getExtensionFromMime = (mimeType: string) => {
        if (mimeType.includes('webm')) return 'webm'
        if (mimeType.includes('mp4')) return 'mp4'
        if (mimeType.includes('aac')) return 'aac'
        if (mimeType.includes('wav')) return 'wav'
        return 'webm' // fallback
      }

      const extension = getExtensionFromMime(blob.type)
      console.log('Blob MIME type:', blob.type, 'Extension:', extension)

      const formData = new FormData()
      formData.append('file', blob, `interview_${Date.now()}.${extension}`)
      formData.append('questionId', currentQuestion.id)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      console.log('Upload response status:', uploadResponse.status)

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json()
        console.error('업로드 실패:', error)

        if (error.retryable) {
          toast({
            variant: 'destructive',
            title: '네트워크 오류',
            description: '인터넷 연결을 확인하고 다시 시도해주세요.',
          })
          return
        }

        throw new Error(error.error || 'Upload failed')
      }

      const uploadData = await uploadResponse.json()
      console.log('Upload success:', uploadData)
      const audioUrl = uploadData.url

      // 서버에서 Gemini로 변환한 transcript 사용 (Safari/iOS 지원)
      const finalTranscript = uploadData.transcript || transcript || ''
      console.log('Final transcript:', finalTranscript ? '있음' : '없음')

      // 2. 답변을 로컬 배열에 저장 (AI 분석은 마지막에 일괄 처리)
      const newAnswer: Answer = {
        questionId: currentQuestion.id,
        questionTitle: currentQuestion.title,
        audioUrl,
        transcript: finalTranscript,
        duration,
      }

      const updatedAnswers = [...answers, newAnswer]
      setAnswers(updatedAnswers)

      console.log(`답변 저장 완료 (${updatedAnswers.length}/${questions.length})`)

      toast({
        title: '답변 저장 완료',
        description: `${updatedAnswers.length}/${questions.length} 질문 완료`,
      })

      // 3. 다음 질문으로 이동 또는 전체 분석
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      } else {
        // 모든 질문 완료 → 일괄 AI 분석
        console.log('모든 질문 완료 - 일괄 AI 분석 시작')

        toast({
          title: '면접 완료!',
          description: 'AI가 전체 답변을 분석 중입니다...',
        })

        // 일괄 AI 분석 호출
        const batchAnalyzeResponse = await fetch('/api/batch-analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            answers: updatedAnswers,
          }),
        })

        if (batchAnalyzeResponse.ok) {
          console.log('일괄 분석 성공')
          toast({
            title: '분석 완료!',
            description: '모든 답변 분석이 완료되었습니다.',
          })
        } else {
          console.error('일괄 분석 실패')
          toast({
            variant: 'destructive',
            title: '분석 실패',
            description: 'AI 분석 중 오류가 발생했습니다.',
          })
        }

        router.push('/result')
      }
    } catch (error) {
      console.error('=== 전체 프로세스 에러 ===')
      console.error('Error:', error)
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
      toast({
        variant: 'destructive',
        title: '업로드 실패',
        description: error instanceof Error ? error.message : '파일 업로드에 실패했습니다.',
      })
    } finally {
      console.log('=== 프로세스 완료 ===')
      setIsUploading(false)
    }
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <InAppBrowserBlocker>
      <div className="min-h-screen gradient-mesh p-2 sm:p-4 md:p-6 lg:p-12">
        <div className="container mx-auto max-w-4xl space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between animate-fade-in gap-2">
            <Link href="/dashboard">
              <Button variant="outline" className="rounded-2xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 shadow-soft hover:shadow-glow transition-all text-sm sm:text-base">
                <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">뒤로 가기</span>
                <span className="sm:hidden">뒤로</span>
              </Button>
            </Link>
            {!isLoading && (
              <div className="glass px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-2xl shadow-soft">
                <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
                  <span className="text-gradient">{currentQuestionIndex + 1}</span>
                  <span className="text-muted-foreground"> / {questions.length}</span>
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {!isLoading && questions.length > 0 && (
            <div className="glass rounded-full p-1 shadow-soft">
              <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 rounded-full shadow-glow"
                  style={{
                    width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Question Card */}
          {isLoading ? (
            <div className="glass rounded-3xl p-8 shadow-premium-lg">
              <Skeleton className="h-6 w-32 mb-4 bg-muted/30" />
              <Skeleton className="h-12 w-full bg-muted/30" />
            </div>
          ) : currentQuestion ? (
            <div className="glass rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-premium-lg">
              <div className="space-y-4 sm:space-y-6">
                <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-primary/20">
                  <span className="text-xs sm:text-sm font-semibold text-primary">질문 {currentQuestionIndex + 1}</span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-relaxed text-gradient break-keep">
                  {currentQuestion.title}
                </h2>
                <div className="flex items-start space-x-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">💡</span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    아래 버튼을 눌러 녹음을 시작하고, 질문에 대한 답변을 말씀해주세요.
                    답변이 끝나면 정지 버튼을 누르세요.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass rounded-3xl p-8 shadow-premium-lg">
              <p className="text-center text-muted-foreground">
                질문을 불러올 수 없습니다.
              </p>
            </div>
          )}

          {/* Audio Recorder */}
          {!isLoading && currentQuestion && (
            <AudioRecorder
              key={currentQuestionIndex}
              onRecordingComplete={handleRecordingComplete}
              disabled={isUploading}
            />
          )}

          {/* Upload Loading */}
          {isUploading && (
            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-premium-lg animate-glow">
              <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-glow">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-white" />
                </div>
                <div className="text-center space-y-0.5 sm:space-y-1">
                  <p className="font-semibold text-base sm:text-lg">답변 처리 중</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    녹음 파일을 업로드하고 있습니다...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-soft">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg">
                <span className="text-xl sm:text-2xl">💡</span>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold">면접 팁</h3>
            </div>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-start space-x-2 sm:space-x-3">
                <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-primary mt-1.5 sm:mt-2 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                  <span className="font-semibold text-primary">STAR 기법</span>을 활용하세요
                </p>
              </li>
              <li className="flex items-start space-x-2 sm:space-x-3">
                <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-primary mt-1.5 sm:mt-2 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                  구체적인 사례와 수치를 포함하세요
                </p>
              </li>
              <li className="flex items-start space-x-2 sm:space-x-3">
                <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-primary mt-1.5 sm:mt-2 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                  명확하고 자신감 있게 답변하세요
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </InAppBrowserBlocker>
  )
}
