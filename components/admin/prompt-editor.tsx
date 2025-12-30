'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Loader2, Save, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SystemPrompt {
  id: string
  key_name: string
  content: string
  is_active: boolean
  description: string | null
}

interface PromptEditorProps {
  prompt: SystemPrompt
  onUpdate: () => void
}

export function PromptEditor({ prompt, onUpdate }: PromptEditorProps) {
  const [content, setContent] = useState(prompt.content)
  const [isActive, setIsActive] = useState(prompt.is_active)
  const [description, setDescription] = useState(prompt.description || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const { toast } = useToast()

  const hasChanges =
    content !== prompt.content ||
    isActive !== prompt.is_active ||
    description !== (prompt.description || '')

  const handleSave = async () => {
    try {
      setIsSaving(true)

      const response = await fetch(`/api/prompts/${prompt.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          is_active: isActive,
          description,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update prompt')
      }

      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)

      toast({
        title: '저장 완료',
        description: '프롬프트가 성공적으로 업데이트되었습니다.',
      })

      onUpdate()
    } catch (error) {
      console.error('Save error:', error)
      toast({
        variant: 'destructive',
        title: '저장 실패',
        description: error instanceof Error ? error.message : '프롬프트 저장에 실패했습니다.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="rounded-xl shadow-premium">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="font-mono text-sm text-primary">
              {prompt.key_name}
            </CardTitle>
            <CardDescription>{prompt.description}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor={`active-${prompt.id}`}>활성화</Label>
            <Switch
              id={`active-${prompt.id}`}
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`content-${prompt.id}`}>프롬프트 내용</Label>
          <Textarea
            id={`content-${prompt.id}`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="font-mono text-sm resize-y"
            placeholder="프롬프트 내용을 입력하세요..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`desc-${prompt.id}`}>설명 (선택)</Label>
          <Textarea
            id={`desc-${prompt.id}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="이 프롬프트에 대한 설명을 입력하세요..."
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving || isSaved}
            className="rounded-xl"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : isSaved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                저장 완료
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                저장
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
