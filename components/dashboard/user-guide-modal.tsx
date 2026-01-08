"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ChevronLeft, ChevronRight, BookOpen, Target, BarChart3, Lightbulb } from "lucide-react"

interface UserGuideModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const guidePages = [
  {
    icon: BookOpen,
    title: "면접 코치 사용법",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          AI 면접 코치와 함께 실전 같은 모의 면접을 연습해보세요.
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
            <span className="text-xl">1</span>
            <div>
              <p className="font-medium">면접 시작</p>
              <p className="text-sm text-muted-foreground">질문을 선택하고 면접을 시작합니다</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30">
            <span className="text-xl">2</span>
            <div>
              <p className="font-medium">음성 녹음</p>
              <p className="text-sm text-muted-foreground">마이크 버튼을 눌러 답변을 녹음합니다</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-pink-50 dark:bg-pink-950/30">
            <span className="text-xl">3</span>
            <div>
              <p className="font-medium">AI 분석</p>
              <p className="text-sm text-muted-foreground">AI가 답변을 분석하고 피드백을 제공합니다</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Target,
    title: "STAR 기법이란?",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          STAR 기법은 경험을 구조적으로 설명하는 면접 답변 방식입니다.
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">S</span>
              <span className="font-semibold text-blue-700 dark:text-blue-300">Situation (상황)</span>
            </div>
            <p className="text-sm text-muted-foreground ml-10">어떤 상황이었는지 배경을 설명합니다</p>
          </div>
          <div className="p-4 rounded-lg border border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">T</span>
              <span className="font-semibold text-purple-700 dark:text-purple-300">Task (과제)</span>
            </div>
            <p className="text-sm text-muted-foreground ml-10">당신이 맡은 역할과 해결해야 할 과제를 설명합니다</p>
          </div>
          <div className="p-4 rounded-lg border border-pink-200 bg-pink-50/50 dark:bg-pink-950/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold">A</span>
              <span className="font-semibold text-pink-700 dark:text-pink-300">Action (행동)</span>
            </div>
            <p className="text-sm text-muted-foreground ml-10">문제 해결을 위해 취한 구체적인 행동을 설명합니다</p>
          </div>
          <div className="p-4 rounded-lg border border-green-200 bg-green-50/50 dark:bg-green-950/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">R</span>
              <span className="font-semibold text-green-700 dark:text-green-300">Result (결과)</span>
            </div>
            <p className="text-sm text-muted-foreground ml-10">행동의 결과와 배운 점을 설명합니다</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: BarChart3,
    title: "점수 배점 방식",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          총점은 <strong>100점 만점</strong>이며, 선택한 문항 수에 따라 배점이 결정됩니다.
        </p>

        {/* 문항별 배점 예시 */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
          <p className="font-semibold mb-3">문항별 배점 예시</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <p className="font-bold text-lg">5문항</p>
              <p className="opacity-90">문항당 20점</p>
            </div>
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <p className="font-bold text-lg">4문항</p>
              <p className="opacity-90">문항당 25점</p>
            </div>
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <p className="font-bold text-lg">3문항</p>
              <p className="opacity-90">문항당 33.3점</p>
            </div>
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <p className="font-bold text-lg">2문항</p>
              <p className="opacity-90">문항당 50점</p>
            </div>
          </div>
        </div>

        {/* 평가 기준 */}
        <div>
          <p className="font-medium mb-2 text-sm">각 문항은 아래 기준으로 평가됩니다</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <span className="text-sm">STAR 구조 충실도</span>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">30%</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30">
              <span className="text-sm">구체성 (숫자, 사례)</span>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">25%</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-pink-50 dark:bg-pink-950/30">
              <span className="text-sm">논리성</span>
              <span className="text-xs text-pink-600 dark:text-pink-400 font-medium">25%</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-950/30">
              <span className="text-sm">전달력</span>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">20%</span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>계산 방법:</strong> 각 문항별 점수(0~100)를 문항 수로 나눈 후 합산합니다.
          </p>
        </div>
      </div>
    ),
  },
  {
    icon: Lightbulb,
    title: "좋은 점수를 받으려면?",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          다음 팁을 참고하면 더 좋은 평가를 받을 수 있습니다.
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-green-500 text-lg">✓</span>
            <div>
              <p className="font-medium">구체적인 숫자와 기간 언급</p>
              <p className="text-sm text-muted-foreground">&ldquo;3개월간 매출 20% 증가&rdquo; 처럼 구체적으로</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-500 text-lg">✓</span>
            <div>
              <p className="font-medium">나의 역할과 기여 명확히</p>
              <p className="text-sm text-muted-foreground">&ldquo;팀에서&rdquo;가 아닌 &ldquo;제가 주도적으로&rdquo;</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-500 text-lg">✓</span>
            <div>
              <p className="font-medium">결과와 배운 점 포함</p>
              <p className="text-sm text-muted-foreground">단순 결과뿐 아니라 인사이트도 공유</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-red-500 text-lg">✗</span>
            <div>
              <p className="font-medium">피해야 할 것</p>
              <p className="text-sm text-muted-foreground">모호한 표현, 결과 누락, 너무 짧은 답변</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <p className="font-medium mb-1">준비되셨나요?</p>
          <p className="text-sm opacity-90">지금 바로 면접을 시작해보세요!</p>
        </div>
      </div>
    ),
  },
]

export function UserGuideModal({ open, onOpenChange }: UserGuideModalProps) {
  const [currentPage, setCurrentPage] = useState(0)

  const handleClose = () => {
    onOpenChange(false)
    setCurrentPage(0)
  }

  const handleNext = () => {
    if (currentPage < guidePages.length - 1) {
      setCurrentPage(currentPage + 1)
    } else {
      handleClose()
    }
  }

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const currentGuide = guidePages[currentPage]
  const Icon = currentGuide.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">{currentGuide.title}</DialogTitle>
              <DialogDescription className="text-xs">
                {currentPage + 1} / {guidePages.length}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          {currentGuide.content}
        </div>

        {/* Page indicators */}
        <div className="flex justify-center gap-1.5 mb-4">
          {guidePages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentPage
                  ? "bg-primary w-6"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between gap-3">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentPage === 0}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            이전
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1"
          >
            {currentPage === guidePages.length - 1 ? (
              "시작하기"
            ) : (
              <>
                다음
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
