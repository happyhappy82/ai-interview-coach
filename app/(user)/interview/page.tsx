'use client'

import { useState, useEffect } from 'react'
import { AudioRecorder } from '@/components/interview/audio-recorder'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Loader2, Plus, X, GripVertical, Building2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { CompanyInterviewModal } from '@/components/interview/company-interview-modal'
import type { Company } from '@/types/database.types'

type InterviewMode = 'question-select' | 'interview'

interface Question {
  id: string
  category: string
  title: string
  order: number
  evaluation_context?: string | null
  company_id?: string | null
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
  // 모드 상태
  const [mode, setMode] = useState<InterviewMode>('question-select')

  // 기업 면접 모달 상태
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  const [allQuestions, setAllQuestions] = useState<Question[]>([]) // 모든 질문
  const [questions, setQuestions] = useState<Question[]>([]) // 선택된 질문들
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set())
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false) // 회사 선택 모드에서는 로딩 안 함
  const [isUploading, setIsUploading] = useState(false)
  const [localAnswers, setLocalAnswers] = useState<LocalAnswer[]>([]) // 로컬에 저장 (Blob)
  const [remainingTime, setRemainingTime] = useState(0) // 남은 시간 (초)
  const [showInlineForm, setShowInlineForm] = useState(false) // 인라인 질문 추가 폼 표시
  const [newQuestionTitle, setNewQuestionTitle] = useState('') // 새 질문 제목
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false) // 질문 생성 중
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null) // 드래그 중인 질문 인덱스
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null) // 드래그 오버 중인 위치
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0) // 현재 표시 중인 메시지 인덱스
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null) // 삭제 중인 질문 ID
  const { toast } = useToast()
  const router = useRouter()

  // 분석 중 표시할 메시지들
  const analyzingMessages = [
    '🤖 AI가 답변을 분석하고 있습니다...',
    '💡 잠시만 기다려주세요',
    '✨ 실제 면접은 이것보다 더 쉬울 거예요!',
    '📝 STAR 기법을 기억하세요',
    '🎯 구체적인 사례가 좋은 답변의 핵심입니다',
    '💪 긴장하지 마세요, 충분히 잘하고 있어요',
    '🔍 AI가 꼼꼼하게 분석 중입니다',
    '⭐ 자신감 있게 답변하는 것이 중요합니다',
    '🌟 답변의 일관성을 유지하세요',
    '🎓 경험에서 배운 점을 강조하세요',
    '🚀 거의 다 됐어요, 조금만 더!',
    '💼 실전에서도 이 자신감 그대로!',
  ]

  // 페이지 로드 시 질문 로드
  useEffect(() => {
    if (allQuestions.length === 0) {
      loadQuestions()
    }
  }, [])

  const loadQuestions = async (companyId?: string) => {
    setIsLoading(true)
    try {
      const url = companyId
        ? `/api/questions?company=${companyId}`
        : '/api/questions'
      const response = await fetch(url)
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

  // 기업 면접 모달에서 면접 시작
  const handleStartCompanyInterview = (companyQuestions: Question[], company: Company) => {
    setSelectedCompany(company)
    setQuestions(companyQuestions)
    setSelectedQuestionIds(new Set(companyQuestions.map((q: Question) => q.id)))
    setMode('interview')
    setInterviewStarted(true)

    toast({
      title: `${company.name} 면접 시작!`,
      description: `${companyQuestions.length}개 질문으로 면접을 시작합니다.`,
    })
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

  const handleCreateInlineQuestion = async () => {
    if (!newQuestionTitle.trim()) {
      toast({
        variant: 'destructive',
        title: '질문을 입력하세요',
        description: '면접 질문을 입력해주세요.',
      })
      return
    }

    setIsCreatingQuestion(true)

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newQuestionTitle.trim(),
          evaluationContext: '', // AI가 자동 생성
        }),
      })

      if (!response.ok) {
        throw new Error('질문 생성 실패')
      }

      const { data: newQuestion } = await response.json()

      // 새 질문을 리스트에 추가
      setAllQuestions((prev) => [...prev, newQuestion])

      // 자동으로 선택
      setSelectedQuestionIds((prev) => {
        const newSet = new Set(prev)
        if (newSet.size < 10) {
          newSet.add(newQuestion.id)
        }
        return newSet
      })

      toast({
        title: '질문 추가 완료!',
        description: '새로운 질문이 추가되고 자동으로 선택되었습니다.',
      })

      // 폼 초기화
      setNewQuestionTitle('')
      setShowInlineForm(false)
    } catch (error) {
      console.error('질문 생성 에러:', error)
      toast({
        variant: 'destructive',
        title: '질문 생성 실패',
        description: '다시 시도해주세요.',
      })
    } finally {
      setIsCreatingQuestion(false)
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newQuestions = [...allQuestions]
    const draggedQuestion = newQuestions[draggedIndex]

    // 드래그한 항목 제거
    newQuestions.splice(draggedIndex, 1)

    // dropIndex 조정: 드래그한 항목이 앞쪽에 있었다면 인덱스를 1 감소
    const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex

    // 새 위치에 삽입
    newQuestions.splice(adjustedDropIndex, 0, draggedQuestion)

    setAllQuestions(newQuestions)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDeleteClick = async (id: string, title: string, isCustom: boolean) => {
    // 이미 삭제 중인 질문이면 무시
    if (deletingQuestionId === id) return

    setDeletingQuestionId(id)

    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete question')
      }

      const { deletionType } = await response.json()

      // 로컬 상태에서 제거
      setAllQuestions(prev => prev.filter(q => q.id !== id))
      setSelectedQuestionIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })

      toast({
        title: deletionType === 'hard' ? '질문 삭제 완료' : '질문 숨기기 완료',
        description: deletionType === 'hard'
          ? '커스텀 질문이 삭제되었습니다.'
          : '질문이 목록에서 숨겨졌습니다.',
      })
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        variant: 'destructive',
        title: '삭제 실패',
        description: error instanceof Error ? error.message : '질문 삭제 중 오류가 발생했습니다.',
      })
    } finally {
      setDeletingQuestionId(null)
    }
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

    // 선택된 질문들만 필터링 (현재 순서 유지)
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
      setCurrentMessageIndex(0)

      // 메시지 순환 타이머 (3초마다 메시지 변경)
      const timer = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % analyzingMessages.length)
      }, 3000)

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

      // 타이머 정리
      clearInterval(timer)

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
    } catch (error) {
      console.error('=== 업로드/분석 에러 ===')
      console.error('Error:', error)
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
  if (mode === 'question-select' && !interviewStarted) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] p-4 md:p-6 lg:p-12">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <button className="inline-flex items-center justify-center bg-white text-gray-700 hover:bg-gray-50 border border-gray-200/50 rounded-full px-4 py-2 text-[14px] font-medium transition-all">
                <ArrowLeft className="mr-2 h-4 w-4" />
                대시보드
              </button>
            </Link>
          </div>

          {/* Title */}
          <div className="glass-card rounded-3xl p-6 md:p-10">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#0071e3] flex items-center justify-center text-white">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                  질문 선택
                </h1>
                <p className="text-sm md:text-base text-gray-500 mt-2">
                  면접에서 답변할 질문을 선택하세요 (최소 3개, 최대 10개)
                </p>
              </div>
            </div>

            {/* Selection Counter & Score Info */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-blue-50 border border-blue-200/50">
                <span className="text-2xl font-bold text-[#0071e3] mr-2">{selectedQuestionIds.size}</span>
                <span className="text-sm text-gray-500 font-medium">/ 10개 선택됨</span>
              </div>
              {selectedQuestionIds.size >= 3 && (
                <div className="inline-flex items-center px-4 py-3 rounded-full bg-green-50 border border-green-200/50">
                  <span className="text-sm font-medium text-green-700">
                    총 100점 = 문항당 <span className="font-bold">{Math.round(100 / selectedQuestionIds.size * 10) / 10}점</span>
                  </span>
                </div>
              )}
            </div>

            {/* Company Interview & Add Question Buttons */}
            {!isLoading && (
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {/* 기업 면접 버튼 */}
                <button
                  onClick={() => setShowCompanyModal(true)}
                  className="flex-1 p-4 rounded-2xl border border-blue-200/50 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300 transition-all group"
                >
                  <div className="flex items-center justify-center space-x-2 text-[#0071e3]">
                    <Building2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">기업 면접 보기</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    네이버, 삼성, 카카오 등 실제 면접 질문
                  </p>
                </button>

                {/* 나만의 질문 추가 버튼 */}
                {!showInlineForm && (
                  <button
                    onClick={() => setShowInlineForm(true)}
                    className="flex-1 p-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#0071e3] hover:bg-blue-50/30 transition-all group"
                  >
                    <div className="flex items-center justify-center space-x-2 text-[#0071e3]">
                      <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold">나만의 질문 추가하기</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      직접 질문을 만들어 연습하세요
                    </p>
                  </button>
                )}
              </div>
            )}

            {/* Inline Question Creation Form */}
            {showInlineForm && (
              <div className="mb-4 p-4 rounded-2xl border border-[#0071e3] bg-blue-50/50 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-gray-900">새 질문 추가</h3>
                  <button
                    onClick={() => {
                      setShowInlineForm(false)
                      setNewQuestionTitle('')
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <Input
                  value={newQuestionTitle}
                  onChange={(e) => setNewQuestionTitle(e.target.value)}
                  placeholder="예: 프로젝트에서 가장 어려웠던 문제는 무엇인가요?"
                  maxLength={200}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isCreatingQuestion) {
                      handleCreateInlineQuestion()
                    }
                  }}
                  className="rounded-xl border-gray-200 focus:border-[#0071e3] focus:ring-[#0071e3]"
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    AI가 평가 기준을 자동 생성합니다. 질문을 자세히 입력해주세요. ({newQuestionTitle.length}/200)
                  </p>
                  <button
                    onClick={handleCreateInlineQuestion}
                    disabled={isCreatingQuestion || !newQuestionTitle.trim()}
                    className="inline-flex items-center justify-center bg-[#0071e3] text-white hover:bg-[#0077ed] rounded-full px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingQuestion ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        생성 중...
                      </>
                    ) : (
                      '추가'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Questions List */}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full bg-gray-100 rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {allQuestions.map((question, index) => {
                  const isSelected = selectedQuestionIds.has(question.id)
                  const isDragging = draggedIndex === index

                  // 선택된 질문들의 순서 계산
                  let selectedOrder = 0
                  if (isSelected) {
                    const selectedQuestions = allQuestions.filter(q => selectedQuestionIds.has(q.id))
                    selectedOrder = selectedQuestions.findIndex(q => q.id === question.id) + 1
                  }

                  return (
                    <div key={question.id} className="relative">
                      {/* 드롭 위치 표시 가로선 */}
                      {dragOverIndex === index && draggedIndex !== null && draggedIndex !== index && dragOverIndex !== draggedIndex + 1 && (
                        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-[#0071e3] z-10">
                          <div className="absolute left-0 -top-1 w-2 h-2 rounded-full bg-[#0071e3]"></div>
                          <div className="absolute right-0 -top-1 w-2 h-2 rounded-full bg-[#0071e3]"></div>
                        </div>
                      )}

                      <div
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`w-full text-left p-4 rounded-2xl border transition-all cursor-move group relative ${
                          isDragging
                            ? 'opacity-50'
                            : isSelected
                            ? 'border-[#0071e3] bg-blue-50/50 shadow-md'
                            : 'border-gray-200 hover:border-[#0071e3]/50 hover:bg-gray-50'
                        }`}
                      >
                      <div className="flex items-start space-x-3">
                        <GripVertical className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5 cursor-grab active:cursor-grabbing" />
                        <button
                          onClick={() => toggleQuestionSelection(question.id)}
                          className="flex items-start space-x-3 flex-1 text-left"
                        >
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                            isSelected
                              ? 'border-[#0071e3] bg-[#0071e3]'
                              : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {isSelected && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-[#0071e3] text-xs font-semibold">
                                  질문 {selectedOrder}
                                </span>
                              )}
                              <p className="font-medium text-sm sm:text-base text-gray-900">{question.title}</p>
                            </div>
                            {question.category && (
                              <p className="text-xs text-gray-500 mt-1">
                                {question.category === 'custom' ? '커스텀 질문' : question.category}
                              </p>
                            )}
                          </div>
                        </button>

                        {/* 삭제 버튼 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(question.id, question.title, question.category === 'custom')
                          }}
                          disabled={deletingQuestionId === question.id}
                          className="absolute top-3 right-3 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`${question.title} 삭제`}
                        >
                          {deletingQuestionId === question.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Start Button */}
            <button
              onClick={startInterview}
              disabled={selectedQuestionIds.size < 3 || isLoading}
              className="w-full bg-[#0071e3] text-white hover:bg-[#0077ed] rounded-full py-4 text-lg font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {selectedQuestionIds.size < 3
                ? `최소 ${3 - selectedQuestionIds.size}개 더 선택해주세요`
                : '면접 시작하기'}
            </button>
          </div>
        </div>

        {/* 기업 면접 모달 */}
        <CompanyInterviewModal
          open={showCompanyModal}
          onOpenChange={setShowCompanyModal}
          onStartInterview={handleStartCompanyInterview}
        />
      </div>
    )
  }

  // 면접 진행 화면
  return (
    <div className="min-h-screen bg-[#F5F5F7] p-4 md:p-6 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <Link href="/dashboard">
              <button className="inline-flex items-center justify-center bg-white text-gray-700 hover:bg-gray-50 border border-gray-200/50 rounded-full px-4 py-2 text-[14px] font-medium transition-all">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">뒤로 가기</span>
                <span className="sm:hidden">뒤로</span>
              </button>
            </Link>
            {!isLoading && (
              <div className="flex items-center gap-2">
                <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-xs font-semibold text-gray-600">Live</span>
                </div>
                <div className="glass-panel px-4 py-2 rounded-full">
                  <span className="text-sm font-semibold whitespace-nowrap">
                    <span className="text-[#0071e3]">{currentQuestionIndex + 1}</span>
                    <span className="text-gray-500"> / {questions.length}</span>
                  </span>
                </div>
                <div className="hidden sm:block glass-panel px-4 py-2 rounded-full">
                  <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
                    문항당 <span className="text-[#0071e3] font-bold">{Math.round(100 / questions.length * 10) / 10}점</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {!isLoading && questions.length > 0 && (
            <div className="glass-card rounded-full p-1">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0071e3] transition-all duration-500 rounded-full"
                  style={{
                    width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Question Card */}
          {isLoading ? (
            <div className="glass-card rounded-3xl p-6 md:p-10">
              <Skeleton className="h-6 w-32 mb-4 bg-gray-100 rounded-xl" />
              <Skeleton className="h-12 w-full bg-gray-100 rounded-xl" />
            </div>
          ) : currentQuestion ? (
            <div className="glass-card rounded-3xl p-6 md:p-10">
              <div className="space-y-4 md:space-y-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100">
                  <span className="text-sm font-semibold text-[#0071e3]">질문 {currentQuestionIndex + 1}</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-relaxed text-gray-900 break-keep">
                  {currentQuestion.title}
                </h2>
                {/* 기업 판단기준 힌트 */}
                {currentQuestion.evaluation_context && (
                  <div className="flex items-start space-x-3 p-4 rounded-2xl bg-amber-50 border border-amber-200/50">
                    <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-amber-700 mb-1">기업 판단기준</p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {currentQuestion.evaluation_context}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start space-x-3 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                  <div className="w-6 h-6 rounded-full bg-[#0071e3] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">💡</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    아래 버튼을 눌러 녹음을 시작하고, 질문에 대한 답변을 말씀해주세요.
                    답변이 끝나면 정지 버튼을 누르세요.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-3xl p-6 md:p-10">
              <p className="text-center text-gray-500">
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
            <div className="glass-card rounded-3xl p-8 md:p-10">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#0071e3] flex items-center justify-center shadow-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-semibold text-lg text-gray-900">면접 분석 중</p>
                  <div className="mt-4">
                    <div className="inline-flex items-center px-6 py-4 rounded-2xl bg-blue-50 border border-blue-100 min-h-[70px]">
                      <p className="text-base font-medium text-[#0071e3] animate-fade-in">
                        {analyzingMessages[currentMessageIndex]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="glass-card rounded-3xl p-6 md:p-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <span className="text-xl">💡</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">면접 팁</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0071e3] mt-2 flex-shrink-0" />
                <p className="text-sm text-gray-600 leading-relaxed">
                  <span className="font-semibold text-[#0071e3]">STAR 기법</span>을 활용하세요
                </p>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0071e3] mt-2 flex-shrink-0" />
                <p className="text-sm text-gray-600 leading-relaxed">
                  구체적인 사례와 수치를 포함하세요
                </p>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0071e3] mt-2 flex-shrink-0" />
                <p className="text-sm text-gray-600 leading-relaxed">
                  명확하고 자신감 있게 답변하세요
                </p>
              </li>
            </ul>
          </div>
        </div>
    </div>
  )
}
