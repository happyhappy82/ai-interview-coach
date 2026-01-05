'use client'

import { useEffect, useState } from 'react'
import { Chrome } from 'lucide-react'

export function AutoChromeRedirect() {
  const [showFallback, setShowFallback] = useState(false)
  const [isInAppBrowser, setIsInAppBrowser] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent

    // 인앱 브라우저 감지
    const inAppPatterns = [
      /KAKAOTALK/i,
      /NAVER/i,
      /Line/i,
      /Instagram/i,
      /FBAV/i,
      /FB_IAB/i,
      /Twitter/i,
      /Snapchat/i,
      /WeChat/i,
      /TikTok/i,
      /messenger/i,
      /WhatsApp/i,
      /Telegram/i,
      /wv/i,
    ]

    const detected = inAppPatterns.some(pattern => pattern.test(ua))

    if (!detected) {
      return // 인앱 브라우저가 아니면 아무것도 안 함
    }

    setIsInAppBrowser(true)
    console.log('인앱 브라우저 감지됨, Chrome으로 리다이렉트 시도')

    // 자동으로 Chrome 열기 시도
    const currentUrl = window.location.href
    const isAndroid = /Android/i.test(ua)
    const isIOS = /iPhone|iPad|iPod/i.test(ua)

    if (isAndroid) {
      // Android: Chrome Intent 사용
      const intentUrl = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`

      // 즉시 리다이렉트 시도
      window.location.href = intentUrl

      // 3초 후에도 페이지가 그대로면 fallback UI 표시
      setTimeout(() => {
        setShowFallback(true)
      }, 3000)
    } else if (isIOS) {
      // iOS: Chrome URL Scheme 사용
      const chromeUrl = currentUrl.replace(/^https?:\/\//, 'googlechrome://')

      window.location.href = chromeUrl

      // 3초 후 fallback UI 표시
      setTimeout(() => {
        setShowFallback(true)
      }, 3000)
    }
  }, [])

  const handleManualOpen = () => {
    const currentUrl = window.location.href
    const ua = navigator.userAgent
    const isAndroid = /Android/i.test(ua)

    if (isAndroid) {
      // Android
      const intentUrl = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`
      window.location.href = intentUrl
    } else {
      // iOS
      const chromeUrl = currentUrl.replace(/^https?:\/\//, 'googlechrome://')
      window.location.href = chromeUrl

      // Chrome 미설치 시 앱스토어로
      setTimeout(() => {
        window.location.href = 'https://apps.apple.com/app/google-chrome/id535886823'
      }, 2000)
    }
  }

  // 인앱 브라우저가 아니거나 fallback UI가 필요없으면 아무것도 표시 안함
  if (!isInAppBrowser || !showFallback) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Chrome 아이콘 */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
            <Chrome className="w-10 h-10" />
          </div>

          {/* 제목 */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Chrome에서 열기
            </h2>
            <p className="text-gray-600 leading-relaxed">
              현재 브라우저에서는 일부 기능이 제한됩니다.
              <br />
              Chrome 브라우저에서 열어주세요.
            </p>
          </div>

          {/* 버튼 */}
          <button
            onClick={handleManualOpen}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl py-4 px-6 font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Chrome className="w-5 h-5" />
            Chrome에서 열기
          </button>

          {/* 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            💡 <strong>자동으로 열리지 않았나요?</strong>
            <br />
            위 버튼을 눌러 수동으로 Chrome을 실행해주세요.
          </div>
        </div>
      </div>
    </div>
  )
}
