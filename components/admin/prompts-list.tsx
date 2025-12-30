'use client'

import { useState } from 'react'
import { PromptEditor } from './prompt-editor'

interface SystemPrompt {
  id: string
  key_name: string
  content: string
  is_active: boolean
  description: string | null
}

interface PromptsListProps {
  initialPrompts: SystemPrompt[]
}

export function PromptsList({ initialPrompts }: PromptsListProps) {
  const [prompts, setPrompts] = useState(initialPrompts)

  const handleUpdate = async () => {
    // 프롬프트 목록 다시 불러오기
    const response = await fetch('/api/prompts')
    if (response.ok) {
      const { data } = await response.json()
      setPrompts(data)
    }
  }

  return (
    <div className="space-y-6">
      {prompts.map((prompt) => (
        <PromptEditor key={prompt.id} prompt={prompt} onUpdate={handleUpdate} />
      ))}
    </div>
  )
}
