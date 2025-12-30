import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "AI 면접 코치 - 취업 합격률을 높이는 AI 면접 연습",
  description: "실전과 같은 AI 면접 경험으로 취업 합격률을 높이세요. 전문가 수준의 분석 리포트를 제공합니다.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
