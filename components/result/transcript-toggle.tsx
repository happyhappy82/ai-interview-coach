'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface TranscriptToggleProps {
  transcript: string
}

export function TranscriptToggle({ transcript }: TranscriptToggleProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!transcript) return null

  // 미리보기: 처음 100자만 표시
  const preview = transcript.length > 100 ? transcript.slice(0, 100) + '...' : transcript
  const needsToggle = transcript.length > 100

  return (
    <div className="p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-100">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <p className="text-xs text-gray-500 font-semibold">녹취록</p>
        {needsToggle && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            {isOpen ? (
              <>접기 <ChevronUp className="w-3 h-3" /></>
            ) : (
              <>더보기 <ChevronDown className="w-3 h-3" /></>
            )}
          </span>
        )}
      </button>
      <p className="text-sm text-gray-600 leading-relaxed mt-2">
        {isOpen || !needsToggle ? transcript : preview}
      </p>
    </div>
  )
}
