import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "AI 면접 코치 - 취업 합격률을 높이는 AI 면접 연습",
  description: "실전과 같은 AI 면접 경험으로 취업 합격률을 높이세요. 전문가 수준의 분석 리포트를 제공합니다.",
  keywords: ['AI 면접', '면접 연습', '취업 준비', '면접 코칭', '모의 면접', 'AI 코치', '면접 피드백'],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    title: 'AI 면접 코치',
    description: '실전과 같은 AI 면접 경험으로 취업 합격률을 높이세요',
    siteName: 'AI 면접 코치',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'AI 면접 코치',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI 면접 코치',
    description: '실전과 같은 AI 면접 경험으로 취업 합격률을 높이세요',
    images: ['/api/og'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased min-h-screen gradient-mesh">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
