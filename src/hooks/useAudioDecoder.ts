import { useEffect, useState } from 'react'
import {
  decodeErrorMessage,
  decodeFileToAudioBuffer,
} from '../utils/decodeAudioFromFile'

export type UseAudioDecoderResult = {
  audioBuffer: AudioBuffer | null
  loading: boolean
  error: string | null
}

/**
 * File を AudioBuffer にデコード。
 * decodeAudioData が使えないコンテナ（iPhone の MOV 等）はメディア再生経由で取り込む。
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

    const ac = new AbortController()
    const { signal } = ac
    let cancelled = false
    setLoading(true)
    setError(null)
    setAudioBuffer(null)

    ;(async () => {
      try {
        const decoded = await decodeFileToAudioBuffer(file, signal)
        if (!cancelled) {
          setAudioBuffer(decoded)
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
      ac.abort()
    }
  }, [file])

  return { audioBuffer, loading, error }
}
