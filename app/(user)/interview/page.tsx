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
      const formData = new FormData()
      formData.append('file', blob, `interview_${Date.now()}.webm`)
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

      // 2. 답변을 로컬 배열에 저장 (AI 분석은 마지막에 일괄 처리)
      const newAnswer: Answer = {
        questionId: currentQuestion.id,
        questionTitle: currentQuestion.title,
        audioUrl,
        transcript: transcript || '',
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/dashboard">
              <Button variant="outline" className="rounded-xl">
                <ArrowLeft className="mr-2 h-4 w-4" />
                뒤로 가기
              </Button>
            </Link>
            <div className="text-sm text-muted-foreground">
              {!isLoading && `${currentQuestionIndex + 1} / ${questions.length}`}
            </div>
          </div>

          {/* Progress Bar */}
          {!isLoading && questions.length > 0 && (
            <div className="mb-8">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{
                    width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Question Card */}
          {isLoading ? (
            <Card className="rounded-xl shadow-premium mb-8">
              <CardHeader>
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-8 w-full" />
              </CardHeader>
            </Card>
          ) : currentQuestion ? (
            <Card className="rounded-xl shadow-premium mb-8">
              <CardHeader>
                <CardDescription>질문 {currentQuestionIndex + 1}</CardDescription>
                <CardTitle className="text-2xl leading-relaxed">
                  {currentQuestion.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  아래 버튼을 눌러 녹음을 시작하고, 질문에 대한 답변을 말씀해주세요.
                  답변이 끝나면 정지 버튼을 누르세요.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-xl shadow-premium mb-8">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  질문을 불러올 수 없습니다.
                </p>
              </CardContent>
            </Card>
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
            <Card className="rounded-xl shadow-premium mt-4">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    녹음 파일을 업로드하는 중...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-muted rounded-xl p-6 space-y-3">
            <h3 className="font-semibold">💡 면접 팁</h3>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>STAR 기법(Situation, Task, Action, Result)을 활용하세요</li>
              <li>구체적인 사례와 수치를 포함하면 더 좋은 평가를 받을 수 있습니다</li>
              <li>명확하고 자신감 있게 답변하세요</li>
              <li>녹음은 자동으로 저장되며, 네트워크가 끊겨도 안전합니다</li>
            </ul>
          </div>
        </div>
      </div>
    </InAppBrowserBlocker>
  )
}
