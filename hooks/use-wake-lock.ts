/**
 * Wake Lock API Hook
 * scenarios.md Case 2-2: 화면 꺼짐 방지
 */

import { useEffect, useRef } from 'react'

export function useWakeLock(enabled: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!enabled) {
      // Wake Lock 해제
      if (wakeLockRef.current) {
        wakeLockRef.current.release()
        wakeLockRef.current = null
      }
      return
    }

    // Wake Lock API 지원 여부 확인
    if (!('wakeLock' in navigator)) {
      console.warn('Wake Lock API is not supported in this browser')
      return
    }

    const requestWakeLock = async () => {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
        console.log('Wake Lock activated')

        wakeLockRef.current.addEventListener('release', () => {
          console.log('Wake Lock released')
        })
      } catch (err) {
        console.error('Failed to activate Wake Lock:', err)
      }
    }

    requestWakeLock()

    // 페이지 visibility 변경 시 재요청
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        requestWakeLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (wakeLockRef.current) {
        wakeLockRef.current.release()
        wakeLockRef.current = null
      }
    }
  }, [enabled])

  return wakeLockRef.current
}
