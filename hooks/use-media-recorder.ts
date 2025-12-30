/**
 * MediaRecorder Hook with Defensive Coding
 * scenarios.md 모든 Case 대응
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { getSupportedMimeType, getFileExtension, isOnline } from '@/lib/browser-detect'

export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped'

interface UseMediaRecorderReturn {
  state: RecordingState
  error: string | null
  audioURL: string | null
  audioBlob: Blob | null
  duration: number
  startRecording: () => Promise<void>
  stopRecording: () => void
  pauseRecording: () => void
  resumeRecording: () => void
  clearRecording: () => void
}

export function useMediaRecorder(): UseMediaRecorderReturn {
  const [state, setState] = useState<RecordingState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [duration, setDuration] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mimeTypeRef = useRef<string>('')

  // Case 1-2: 장치 연결 해제 감지
  const handleDeviceChange = useCallback(() => {
    if (state === 'recording') {
      console.warn('Audio device changed, pausing recording')
      pauseRecording()
      setError('오디오 장치가 변경되었습니다. 녹음이 일시정지되었습니다.')
    }
  }, [state])

  // Case 2-3: 전화/알람 등으로 인한 중단 감지
  const handleInterruption = useCallback(() => {
    if (mediaRecorderRef.current && state === 'recording') {
      console.warn('Recording interrupted')
      pauseRecording()
      setError('녹음이 일시정지되었습니다.')
    }
  }, [state])

  useEffect(() => {
    if (typeof window === 'undefined') return

    navigator.mediaDevices?.addEventListener('devicechange', handleDeviceChange)
    document.addEventListener('visibilitychange', handleInterruption)

    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', handleDeviceChange)
      document.removeEventListener('visibilitychange', handleInterruption)
    }
  }, [handleDeviceChange, handleInterruption])

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      chunksRef.current = []
      setDuration(0)

      // Case 1-3: Safari 호환성 - 지원되는 MIME 타입 감지
      mimeTypeRef.current = getSupportedMimeType()
      console.log('Using MIME type:', mimeTypeRef.current)

      // Case 1-1: 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeTypeRef.current,
      })

      mediaRecorderRef.current = mediaRecorder

      // Case 3-2: 10초 단위 청크 저장
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
          // IndexedDB에 청크 저장 (복구용)
          saveChunkToIndexedDB(event.data, chunksRef.current.length - 1)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current })
        setAudioBlob(blob)
        setAudioURL(URL.createObjectURL(blob))
        setState('stopped')

        // 스트림 정리
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }

        // Duration 타이머 정리
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current)
          durationIntervalRef.current = null
        }
      }

      // 10초마다 데이터 요청 (청크 저장)
      mediaRecorder.start(10000)
      setState('recording')

      // Duration 카운터 시작
      const startTime = Date.now()
      durationIntervalRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    } catch (err) {
      console.error('Recording error:', err)

      // Case 1-1: 권한 거부 에러 처리
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError('마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 접근을 허용해주세요.')
        } else if (err.name === 'NotFoundError') {
          setError('마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.')
        } else {
          setError('녹음을 시작할 수 없습니다: ' + err.message)
        }
      } else {
        setError('녹음 중 오류가 발생했습니다.')
      }
      setState('idle')
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state !== 'idle' && state !== 'stopped') {
      mediaRecorderRef.current.stop()
    }
  }, [state])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.pause()
      setState('paused')

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
        durationIntervalRef.current = null
      }
    }
  }, [state])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === 'paused') {
      mediaRecorderRef.current.resume()
      setState('recording')

      const currentDuration = duration
      const resumeTime = Date.now()
      durationIntervalRef.current = setInterval(() => {
        setDuration(currentDuration + Math.floor((Date.now() - resumeTime) / 1000))
      }, 1000)
    }
  }, [state, duration])

  const clearRecording = useCallback(() => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL)
    }
    setAudioURL(null)
    setAudioBlob(null)
    setState('idle')
    setError(null)
    setDuration(0)
    chunksRef.current = []
  }, [audioURL])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL)
      }
    }
  }, [audioURL])

  return {
    state,
    error,
    audioURL,
    audioBlob,
    duration,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
  }
}

// Case 3-2: IndexedDB에 청크 저장 (브라우저 강제 종료 대응)
async function saveChunkToIndexedDB(chunk: Blob, index: number) {
  try {
    if (!('indexedDB' in window)) return

    const dbName = 'interview-recordings'
    const storeName = 'chunks'

    const request = indexedDB.open(dbName, 1)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName)
      }
    }

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      store.put(chunk, `chunk_${Date.now()}_${index}`)
    }
  } catch (err) {
    console.error('Failed to save chunk to IndexedDB:', err)
  }
}
