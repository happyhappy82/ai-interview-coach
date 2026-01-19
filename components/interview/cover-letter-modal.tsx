'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { FileText, Loader2, Sparkles, Save, Trash2, ChevronRight, Plus } from 'lucide-react'

interface Question {
  id: string
  category: string
  title: string
  order: number
  evaluation_context?: string | null
}

interface CoverLetter {
  id: string
  title: string
  content: string
  created_at: string
}

interface CoverLetterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStartInterview: (questions: Question[]) => void
}

export function CoverLetterModal({
  open,
  onOpenChange,
  onStartInterview,
}: CoverLetterModalProps) {
  const [coverLetterText, setCoverLetterText] = useState('')
  const [coverLetterTitle, setCoverLetterTitle] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savedCoverLetters, setSavedCoverLetters] = useState<CoverLetter[]>([])
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showSaveForm, setShowSaveForm] = useState(false)

  // 저장된 자소서 목록 불러오기
  useEffect(() => {
    if (open) {
      loadSavedCoverLetters()
    }
  }, [open])

  const loadSavedCoverLetters = async () => {
    setIsLoadingList(true)
    try {
      const response = await fetch('/api/cover-letters')
      if (response.ok) {
        const { data } = await response.json()
        setSavedCoverLetters(data || [])
      }
    } catch (err) {
      console.error('Failed to load cover letters:', err)
    } finally {
      setIsLoadingList(false)
    }
  }

  const handleSelectCoverLetter = (coverLetter: CoverLetter) => {
    setCoverLetterText(coverLetter.content)
    setCoverLetterTitle(coverLetter.title)
    setSelectedId(coverLetter.id)
    setError(null)
    setShowSaveForm(false)
  }

  const handleNewCoverLetter = () => {
    setCoverLetterText('')
    setCoverLetterTitle('')
    setSelectedId(null)
    setError(null)
    setShowSaveForm(false)
  }

  const handleSave = async () => {
    if (!coverLetterTitle.trim()) {
      setError('제목을 입력해주세요. (예: 삼성전자 마케팅)')
      return
    }
    if (coverLetterText.trim().length < 50) {
      setError('자소서 내용을 최소 50자 이상 입력해주세요.')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/cover-letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: coverLetterTitle,
          content: coverLetterText,
        }),
      })

      if (!response.ok) {
        throw new Error('저장에 실패했습니다.')
      }

      const { data } = await response.json()
      setSavedCoverLetters(prev => [data, ...prev])
      setSelectedId(data.id)
      setShowSaveForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 자소서를 삭제하시겠습니까?')) return

    setIsDeleting(id)
    try {
      const response = await fetch(`/api/cover-letters/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSavedCoverLetters(prev => prev.filter(cl => cl.id !== id))
        if (selectedId === id) {
          handleNewCoverLetter()
        }
      }
    } catch (err) {
      console.error('Failed to delete:', err)
    } finally {
      setIsDeleting(null)
    }
  }

  const handleGenerate = async () => {
    if (coverLetterText.trim().length < 50) {
      setError('자소서 내용을 최소 50자 이상 입력해주세요.')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-questions-from-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: coverLetterText,
          questionCount: 5,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '질문 생성에 실패했습니다.')
      }

      if (data.questions && data.questions.length > 0) {
        onStartInterview(data.questions)
        onOpenChange(false)
      } else {
        throw new Error('생성된 질문이 없습니다.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClose = () => {
    if (!isGenerating) {
      onOpenChange(false)
      setError(null)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-hidden bg-white/95 backdrop-blur-xl border-gray-200/50 rounded-3xl p-0">
        <div className="flex h-[75vh]">
          {/* 왼쪽 사이드바: 저장된 자소서 목록 */}
          <div className="w-64 border-r border-gray-100 flex flex-col bg-gray-50/50">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 text-sm">내 자소서</h3>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* 새 자소서 버튼 */}
              <button
                onClick={handleNewCoverLetter}
                className={`w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-white transition-colors ${
                  !selectedId ? 'bg-white border-l-2 border-purple-500' : ''
                }`}
              >
                <Plus className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">새 자소서</span>
              </button>

              {/* 저장된 자소서 목록 */}
              {isLoadingList ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                  불러오는 중...
                </div>
              ) : savedCoverLetters.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-xs">
                  저장된 자소서가 없습니다
                </div>
              ) : (
                savedCoverLetters.map((cl) => (
                  <div
                    key={cl.id}
                    className={`group relative ${
                      selectedId === cl.id ? 'bg-white border-l-2 border-purple-500' : 'hover:bg-white'
                    }`}
                  >
                    <button
                      onClick={() => handleSelectCoverLetter(cl)}
                      className="w-full px-4 py-3 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-800 truncate pr-2">
                          {cl.title}
                        </span>
                        <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                      </div>
                      <span className="text-xs text-gray-400">{formatDate(cl.created_at)}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(cl.id)
                      }}
                      disabled={isDeleting === cl.id}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                    >
                      {isDeleting === cl.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 오른쪽: 자소서 입력/편집 영역 */}
          <div className="flex-1 flex flex-col">
            <DialogHeader className="p-4 border-b border-gray-100">
              <DialogTitle className="flex items-center gap-2 text-gray-900">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                자소서 기반 면접
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <p className="text-sm text-gray-500">
                자기소개서 내용을 붙여넣으면 AI가 맞춤형 면접 질문을 생성합니다.
              </p>

              {/* 제목 입력 (저장할 때) */}
              {(showSaveForm || !selectedId) && (
                <div>
                  <Input
                    placeholder="자소서 제목 (예: 삼성전자 마케팅, 네이버 개발자)"
                    value={coverLetterTitle}
                    onChange={(e) => setCoverLetterTitle(e.target.value)}
                    className="rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                    disabled={isGenerating || isSaving}
                  />
                </div>
              )}

              <Textarea
                placeholder="자기소개서 내용을 여기에 붙여넣으세요...&#10;&#10;예시:&#10;저는 3년간 스타트업에서 프론트엔드 개발자로 근무하며...&#10;대학 시절 팀 프로젝트에서 리더 역할을 맡아...&#10;어려운 상황에서도 포기하지 않고..."
                value={coverLetterText}
                onChange={(e) => {
                  setCoverLetterText(e.target.value)
                  setError(null)
                }}
                className="min-h-[250px] resize-none rounded-2xl border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                disabled={isGenerating || isSaving}
              />

              <div className="flex items-center justify-between text-sm">
                <span className={`${coverLetterText.length < 50 ? 'text-gray-400' : 'text-green-600'}`}>
                  {coverLetterText.length}자 입력됨 {coverLetterText.length < 50 && '(최소 50자)'}
                </span>
                <span className="text-gray-400">5개 질문 생성</span>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>

            {/* 하단 버튼 영역 */}
            <div className="p-4 border-t border-gray-100 space-y-3">
              <div className="flex gap-2">
                {/* 저장 버튼 */}
                {!selectedId && coverLetterText.length >= 50 && (
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || isGenerating}
                    variant="outline"
                    className="flex-1 h-11 rounded-xl border-gray-200 hover:bg-gray-50"
                  >
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    저장하기
                  </Button>
                )}

                {/* 면접 시작 버튼 */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || coverLetterText.trim().length < 50}
                  className={`${!selectedId && coverLetterText.length >= 50 ? 'flex-1' : 'w-full'} h-11 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      질문 생성 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      면접 시작하기
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
