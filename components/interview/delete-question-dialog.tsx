'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface DeleteQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  questionTitle: string
  isCustomQuestion: boolean
  isDeleting: boolean
}

export function DeleteQuestionDialog({
  open,
  onOpenChange,
  onConfirm,
  questionTitle,
  isCustomQuestion,
  isDeleting,
}: DeleteQuestionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-xl">
              {isCustomQuestion ? '질문 삭제' : '질문 숨기기'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-base leading-relaxed pt-2">
            {isCustomQuestion ? (
              <>
                <span className="font-semibold text-foreground">
                  &quot;{questionTitle}&quot;
                </span>
                <br />
                이 커스텀 질문을 완전히 삭제하시겠습니까?
                <br />
                <span className="text-destructive font-medium">
                  삭제 후 복구할 수 없습니다.
                </span>
              </>
            ) : (
              <>
                <span className="font-semibold text-foreground">
                  &quot;{questionTitle}&quot;
                </span>
                <br />
                이 질문을 목록에서 숨기시겠습니까?
                <br />
                <span className="text-muted-foreground text-sm">
                  (숨긴 질문은 나중에 다시 표시할 수 없습니다)
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="rounded-xl"
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-xl"
          >
            {isDeleting ? (
              <>처리 중...</>
            ) : isCustomQuestion ? (
              '삭제'
            ) : (
              '숨기기'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
