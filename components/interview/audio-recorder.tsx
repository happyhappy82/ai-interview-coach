/**
 * 오디오 녹음 컴포넌트
 * 모든 방어 코드 포함
 */

'use client'

import { useMediaRecorder } from '@/hooks/use-media-recorder'
import { useWakeLock } from '@/hooks/use-wake-lock'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, Square, Pause, Play, Trash2, AlertCircle, Upload } from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number, transcript: string) => void
  disabled?: boolean
}

export function AudioRecorder({ onRecordingComplete, disabled }: AudioRecorderProps) {
  const {
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
  } = useMediaRecorder()

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isSpeechSupported,
  } = useSpeechRecognition()

  // Wake Lock: 녹음 중에만 활성화
  useWakeLock(state === 'recording')

  const handleStart = async () => {
    await startRecording()
    // 음성 인식 시작 (지원되는 경우)
    if (isSpeechSupported) {
      startListening()
    }
  }

  const handleStop = () => {
    stopRecording()
    stopListening()
    // 제출은 사용자가 "제출하고 다음으로" 버튼을 눌렀을 때만
  }

  const handlePause = () => {
    pauseRecording()
    if (isListening) {
      stopListening()
    }
  }

  const handleResume = () => {
    resumeRecording()
    if (isSpeechSupported && !isListening) {
      startListening()
    }
  }

  const handleClear = () => {
    clearRecording()
    resetTranscript()
  }

  const isRecording = state === 'recording'
  const isPaused = state === 'paused'
  const isStopped = state === 'stopped'

  return (
    <div className="space-y-4">
      {/* 에러 메시지 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-destructive bg-destructive/10 rounded-xl">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-semibold text-destructive">오류 발생</p>
                    <p className="text-sm text-destructive/80">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 녹음 UI */}
      <Card className="border-none">
        <CardContent className="pt-4 sm:pt-6 px-2 sm:px-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Duration 표시 */}
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-mono font-bold text-foreground">
                {formatDuration(duration)}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                {isRecording && '녹음 중...'}
                {isPaused && '일시정지'}
                {isStopped && '녹음 완료'}
                {state === 'idle' && '녹음 준비'}
              </p>
            </div>

            {/* 파형 애니메이션 (녹음 중일 때만) */}
            {isRecording && (
              <div className="flex items-center justify-center space-x-1 h-16">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-primary rounded-full"
                    animate={{
                      height: [10, Math.random() * 40 + 20, 10],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.05,
                    }}
                  />
                ))}
              </div>
            )}

            {/* 오디오 플레이어 (녹음 완료 시) */}
            {audioURL && isStopped && (
              <div className="space-y-2">
                <audio src={audioURL} controls className="w-full" />
              </div>
            )}

            {/* Transcript 표시 (실시간) */}
            {isSpeechSupported && transcript && isRecording && (
              <div className="bg-muted rounded-lg p-3 sm:p-4 max-h-24 sm:max-h-32 overflow-y-auto">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">실시간 음성 인식:</p>
                <p className="text-xs sm:text-sm leading-relaxed">{transcript}</p>
              </div>
            )}

            {/* 컨트롤 버튼 */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3">
              {state === 'idle' && (
                <Button
                  onClick={handleStart}
                  disabled={disabled}
                  className="px-6 py-5 sm:px-8 text-sm sm:text-base"
                >
                  <Mic className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  녹음 시작
                </Button>
              )}

              {isRecording && (
                <>
                  <Button
                    onClick={handlePause}
                    variant="outline"
                    className="px-6 py-5 sm:px-8 text-sm sm:text-base"
                  >
                    <Pause className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    일시정지
                  </Button>
                  <Button
                    onClick={handleStop}
                    variant="destructive"
                    className="px-6 py-5 sm:px-8 text-sm sm:text-base"
                  >
                    <Square className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    정지
                  </Button>
                </>
              )}

              {isPaused && (
                <>
                  <Button
                    onClick={handleResume}
                    className="px-6 py-5 sm:px-8 text-sm sm:text-base"
                  >
                    <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    재개
                  </Button>
                  <Button
                    onClick={handleStop}
                    variant="destructive"
                    className="px-6 py-5 sm:px-8 text-sm sm:text-base"
                  >
                    <Square className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    정지
                  </Button>
                </>
              )}

              {isStopped && (
                <>
                  <Button
                    onClick={() => {
                      if (audioBlob) {
                        onRecordingComplete(audioBlob, duration, transcript)
                      }
                    }}
                    className="px-6 py-5 sm:px-8 text-sm sm:text-base"
                    disabled={!audioBlob || disabled}
                  >
                    <Upload className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    제출하고 다음으로
                  </Button>
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    className="px-6 py-5 sm:px-8 text-sm sm:text-base"
                  >
                    <Trash2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    다시 녹음
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 안내 메시지 */}
      {state === 'idle' && !error && (
        <div className="bg-blue-50/30 border border-blue-200/50 p-3 sm:p-4 space-y-1.5 sm:space-y-2">
          <p className="text-xs sm:text-sm text-blue-900 leading-relaxed">
            💡 <strong>팁:</strong> 조용한 환경에서 명확하게 답변해주세요.
          </p>
          {isSpeechSupported && (
            <p className="text-xs text-blue-700">
              🎙️ 실시간 음성 인식이 활성화됩니다.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
