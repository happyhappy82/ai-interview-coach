'use client'

import { useState, useEffect } from 'react'
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

interface LocalAnswer {
  questionId: string
  questionTitle: string
  blob: Blob
  transcript: string
  duration: number
}

export default function InterviewPage() {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]) // 모든 질문
  const [questions, setQuestions] = useState<Question[]>([]) // 선택된 질문들
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set())
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [localAnswers, setLocalAnswers] = useState<LocalAnswer[]>([]) // 로컬에 저장 (Blob)
  const [remainingTime, setRemainingTime] = useState(0) // 남은 시간 (초)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    try {
      const response = await fetch('/api/questions')
      if (!response.ok) {
        throw new Error('Failed to load questions')
      }

      const { data } = await response.json()
      setAllQuestions(data)
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

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestionIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        if (newSet.size >= 10) {
          toast({
            variant: 'destructive',
            title: '최대 10개까지 선택 가능합니다',
          })
          return prev
        }
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const startInterview = () => {
    if (selectedQuestionIds.size < 3) {
      toast({
        variant: 'destructive',
        title: '최소 3개 이상 선택해주세요',
        description: '면접을 시작하려면 최소 3개의 질문을 선택해야 합니다.',
      })
      return
    }

    // 선택된 질문들만 필터링
    const selected = allQuestions.filter((q) => selectedQuestionIds.has(q.id))
    setQuestions(selected)
    setInterviewStarted(true)
  }

  const handleRecordingComplete = async (blob: Blob, duration: number, transcript: string) => {
    if (!questions[currentQuestionIndex]) return

    console.log('=== 녹음 완료 ===')
    console.log('Blob size:', blob.size)
    console.log('Duration:', duration)

    const currentQuestion = questions[currentQuestionIndex]

    // 1. 로컬에 답변 저장 (업로드 X)
    const newLocalAnswer: LocalAnswer = {
      questionId: currentQuestion.id,
      questionTitle: currentQuestion.title,
      blob,
      transcript,
      duration,
    }

    const updatedLocalAnswers = [...localAnswers, newLocalAnswer]
    setLocalAnswers(updatedLocalAnswers)

    console.log(`답변 저장 완료 (${updatedLocalAnswers.length}/${questions.length})`)

    toast({
      title: '답변 저장',
      description: `${updatedLocalAnswers.length}/${questions.length} 질문 완료`,
    })

    // 2. 다음 질문으로 이동 또는 일괄 업로드 & 분석
    if (currentQuestionIndex < questions.length - 1) {
      // 다음 질문으로
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // 모든 질문 완료 → 일괄 업로드 & 분석
      await uploadAndAnalyzeAll(updatedLocalAnswers)
    }
  }

  const uploadAndAnalyzeAll = async (localAnswers: LocalAnswer[]) => {
    try {
      setIsUploading(true)

      // 예상 처리 시간 계산 (업로드: 질문당 2.5초 + AI 분석: 7초)
      const estimatedTime = Math.ceil(localAnswers.length * 2.5 + 7)
      setRemainingTime(estimatedTime)

      // 카운트다운 타이머 시작 (적응형 - 시간이 부족하면 자동 연장)
      const timer = setInterval(() => {
        setRemainingTime((prev) => {
          // 5초 이하로 떨어지면 10초 추가 (처리가 더 오래 걸리는 경우)
          if (prev <= 5) {
            return prev + 10
          }
          return prev - 1
        })
      }, 1000)

      toast({
        title: '면접 완료!',
        description: '답변을 업로드하고 AI 분석을 시작합니다...',
      })

      console.log('=== 일괄 업로드 시작 ===')

      // Blob의 MIME 타입에서 확장자 추출
      const getExtensionFromMime = (mimeType: string) => {
        if (mimeType.includes('webm')) return 'webm'
        if (mimeType.includes('mp4')) return 'mp4'
        if (mimeType.includes('aac')) return 'aac'
        if (mimeType.includes('wav')) return 'wav'
        return 'webm'
      }

      // 모든 답변 업로드
      const uploadedAnswers: Answer[] = []

      for (const localAnswer of localAnswers) {
        const extension = getExtensionFromMime(localAnswer.blob.type)
        const formData = new FormData()
        formData.append('file', localAnswer.blob, `interview_${Date.now()}.${extension}`)
        formData.append('questionId', localAnswer.questionId)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error('파일 업로드 실패')
        }

        const uploadData = await uploadResponse.json()
        const finalTranscript = uploadData.transcript || localAnswer.transcript || ''

        uploadedAnswers.push({
          questionId: localAnswer.questionId,
          questionTitle: localAnswer.questionTitle,
          audioUrl: uploadData.url,
          transcript: finalTranscript,
          duration: localAnswer.duration,
        })

        console.log(`업로드 완료: ${uploadedAnswers.length}/${localAnswers.length}`)
      }

      console.log('=== 모든 업로드 완료 ===')

      toast({
        title: '업로드 완료!',
        description: 'AI가 전체 답변을 분석 중입니다...',
      })

      // 일괄 AI 분석 호출
      const batchAnalyzeResponse = await fetch('/api/batch-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: uploadedAnswers,
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

      // 타이머 정리 및 완료 처리
      setRemainingTime(0)

      router.push('/result')
    } catch (error) {
      console.error('=== 업로드/분석 에러 ===')
      console.error('Error:', error)
      setRemainingTime(0)
      toast({
        variant: 'destructive',
        title: '처리 실패',
        description: error instanceof Error ? error.message : '답변 처리 중 오류가 발생했습니다.',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const currentQuestion = questions[currentQuestionIndex]

  // 질문 선택 화면
  if (!interviewStarted) {
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
          <div className="glass rounded-none sm:rounded-3xl p-4 sm:p-8 md:p-10 shadow-soft">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <span className="text-3xl">📋</span>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                  <span className="text-gradient">질문 선택</span>
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">
                  면접에서 답변할 질문을 선택하세요 (최소 3개, 최대 10개)
                </p>
              </div>
            </div>

            {/* Selection Counter */}
            <div className="mb-6">
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-primary/30">
                <span className="text-2xl font-bold text-gradient mr-2">{selectedQuestionIds.size}</span>
                <span className="text-sm text-muted-foreground font-medium">/ 10개 선택됨</span>
              </div>
            </div>

            {/* Questions List */}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full bg-muted/30" />
                ))}
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {allQuestions.map((question) => {
                  const isSelected = selectedQuestionIds.has(question.id)
                  return (
                    <button
                      key={question.id}
                      onClick={() => toggleQuestionSelection(question.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-muted hover:border-primary/50 hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                          isSelected
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground/30'
                        }`}>
                          {isSelected && (
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm sm:text-base">{question.title}</p>
                          {question.category && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {question.category === 'custom' ? '커스텀 질문' : question.category}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Start Button */}
            <Button
              onClick={startInterview}
              disabled={selectedQuestionIds.size < 3 || isLoading}
              className="w-full rounded-2xl py-7 text-lg shadow-soft hover:shadow-glow transition-all"
            >
              {selectedQuestionIds.size < 3
                ? `최소 ${3 - selectedQuestionIds.size}개 더 선택해주세요`
                : '면접 시작하기'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // 면접 진행 화면
  return (
    <div className="min-h-screen p-1 sm:p-4 md:p-6 lg:p-12">
      <div className="container mx-auto max-w-4xl px-0 sm:px-4 space-y-2 sm:space-y-4 md:space-y-6 lg:space-y-8">
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
            <div className="glass rounded-none sm:rounded-3xl p-4 sm:p-8 shadow-soft">
              <Skeleton className="h-6 w-32 mb-4 bg-muted/30" />
              <Skeleton className="h-12 w-full bg-muted/30" />
            </div>
          ) : currentQuestion ? (
            <div className="glass rounded-none sm:rounded-3xl p-4 sm:p-8 md:p-10 lg:p-12 shadow-soft">
              <div className="space-y-3 sm:space-y-6">
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
            <div className="glass rounded-none sm:rounded-3xl p-4 sm:p-8 shadow-soft">
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
            <div className="glass rounded-none sm:rounded-3xl p-6 sm:p-8 shadow-soft animate-glow">
              <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-glow">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-white" />
                </div>
                <div className="text-center space-y-0.5 sm:space-y-1">
                  <p className="font-semibold text-base sm:text-lg">면접 분석 중</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    답변을 업로드하고 AI가 분석하고 있습니다...
                  </p>
                  {remainingTime > 0 && (
                    <div className="mt-3 sm:mt-4">
                      <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-primary/30">
                        <span className="text-xl sm:text-2xl font-bold text-gradient mr-2">{remainingTime}</span>
                        <span className="text-xs sm:text-sm text-muted-foreground font-medium">초 후 완료 예정</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="glass rounded-none sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-soft">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-6">
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
  )
}
