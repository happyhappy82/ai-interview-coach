/**
 * 브라우저 및 디바이스 감지 유틸리티
 * scenarios.md Case 1-3, Case 2-1 대응
 */

export function isSafari(): boolean {
  if (typeof window === 'undefined') return false

  const ua = window.navigator.userAgent.toLowerCase()
  return ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1
}

export function isIOS(): boolean {
  if (typeof window === 'undefined') return false

  const ua = window.navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(ua)
}

export function isInAppBrowser(): boolean {
  if (typeof window === 'undefined') return false

  const ua = window.navigator.userAgent.toLowerCase()

  // 카카오톡 인앱 브라우저
  if (ua.indexOf('kakaotalk') !== -1) return true

  // 인스타그램 인앱 브라우저
  if (ua.indexOf('instagram') !== -1) return true

  // 페이스북 인앱 브라우저
  if (ua.indexOf('fbav') !== -1 || ua.indexOf('fban') !== -1) return true

  // 네이버 인앱 브라우저
  if (ua.indexOf('naver') !== -1) return true

  // 라인 인앱 브라우저
  if (ua.indexOf('line') !== -1) return true

  return false
}

export function getSupportedMimeType(): string {
  // Safari는 webm을 지원하지 않음
  if (isSafari() || isIOS()) {
    // Safari는 mp4/aac를 선호
    if (MediaRecorder.isTypeSupported('audio/mp4')) {
      return 'audio/mp4'
    }
    if (MediaRecorder.isTypeSupported('audio/aac')) {
      return 'audio/aac'
    }
  }

  // Chrome 및 기타 브라우저
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
    return 'audio/webm;codecs=opus'
  }
  if (MediaRecorder.isTypeSupported('audio/webm')) {
    return 'audio/webm'
  }

  // Fallback
  return 'audio/mp4'
}

export function getFileExtension(mimeType: string): string {
  if (mimeType.includes('webm')) return 'webm'
  if (mimeType.includes('mp4')) return 'mp4'
  if (mimeType.includes('aac')) return 'aac'
  return 'webm'
}

export function isOnline(): boolean {
  if (typeof window === 'undefined') return true
  return window.navigator.onLine
}
