"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import { UserGuideModal } from "./user-guide-modal"

const GUIDE_SHOWN_KEY = "interview-coach-guide-shown"

export function DashboardGuideButton() {
  const [showGuide, setShowGuide] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // 첫 방문 체크
    const hasSeenGuide = localStorage.getItem(GUIDE_SHOWN_KEY)
    if (!hasSeenGuide) {
      setShowGuide(true)
      localStorage.setItem(GUIDE_SHOWN_KEY, "true")
    }
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" className="gap-2" disabled>
        <HelpCircle className="h-4 w-4" />
        <span className="hidden sm:inline">사용 가이드</span>
      </Button>
    )
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowGuide(true)}
        className="gap-2"
      >
        <HelpCircle className="h-4 w-4" />
        <span className="hidden sm:inline">사용 가이드</span>
      </Button>

      <UserGuideModal open={showGuide} onOpenChange={setShowGuide} />
    </>
  )
}
