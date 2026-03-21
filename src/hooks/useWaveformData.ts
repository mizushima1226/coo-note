import { useMemo } from 'react'
import type { WaveformBin, WaveformData } from '../types/poster'

export type UseWaveformDataResult = {
  waveformData: WaveformData | null
}

/**
 * 先頭チャンネルを Canvas 幅ぶんのビンに min/max 圧縮する。
 */
export function useWaveformData(
  audioBuffer: AudioBuffer | null,
  widthPx: number,
): UseWaveformDataResult {
  return useMemo(() => {
    if (!audioBuffer || widthPx <= 0) {
      return { waveformData: null }
    }
    if (audioBuffer.numberOfChannels < 1) {
      return { waveformData: null }
    }

    const channel = audioBuffer.getChannelData(0)
    if (channel.length === 0) {
      return { waveformData: null }
    }

    const bins: WaveformBin[] = []
    const sampleCount = channel.length
    const bucketSize = sampleCount / widthPx

    for (let i = 0; i < widthPx; i++) {
      const start = Math.floor(i * bucketSize)
      const end = Math.min(sampleCount, Math.floor((i + 1) * bucketSize))
      let min = 0
      let max = 0
      for (let s = start; s < end; s++) {
        const v = channel[s]!
        if (v < min) min = v
        if (v > max) max = v
      }
      const midIdx = Math.min(sampleCount - 1, Math.floor((start + end) / 2))
      const mid = channel[midIdx] ?? 0
      bins.push({ min, max, mid })
    }

    return { waveformData: bins }
  }, [audioBuffer, widthPx])
}
