import { useEffect, useState } from 'react'

function decodeErrorMessage(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === 'EncodingError') {
      return 'このファイルはブラウザでデコードできません（動画コンテナや未対応コーデックの可能性があります）。音声ファイル（例: WAV / MP3）を試してください。'
    }
    return err.message || 'デコードに失敗しました。'
  }
  if (err instanceof Error) {
    return err.message
  }
  return 'デコードに失敗しました。'
}

export type UseAudioDecoderResult = {
  audioBuffer: AudioBuffer | null
  loading: boolean
  error: string | null
}

/**
 * File を ArrayBuffer 経由で decodeAudioData し AudioBuffer を返す。
 */
export function useAudioDecoder(file: File | null): UseAudioDecoderResult {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setAudioBuffer(null)
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    setAudioBuffer(null) // 新しいファイル読み込み開始時は前の波形を消す

    ;(async () => {
      try {
        const raw = await file.arrayBuffer()
        const copy = raw.slice(0)
        const ctx = new AudioContext()
        try {
          const decoded = await ctx.decodeAudioData(copy)
          if (!cancelled) {
            setAudioBuffer(decoded)
          }
        } finally {
          await ctx.close().catch(() => {})
        }
      } catch (e) {
        if (!cancelled) {
          setAudioBuffer(null)
          setError(decodeErrorMessage(e))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [file])

  return { audioBuffer, loading, error }
}
