import type { WaveformBin, WaveformData } from '../types/poster'

/**
 * ビン数を targetCount へ集約（各区間の min/max をマージ、mid は平均）
 */
export function downsampleWaveformData(
  data: WaveformData,
  targetCount: number,
): WaveformData {
  if (targetCount <= 0 || data.length === 0) {
    return []
  }
  if (data.length <= targetCount) {
    return data
  }

  const out: WaveformBin[] = []
  const ratio = data.length / targetCount

  for (let i = 0; i < targetCount; i++) {
    const from = Math.floor(i * ratio)
    const to = Math.min(data.length, Math.floor((i + 1) * ratio))
    let min = 0
    let max = 0
    let midSum = 0
    let midN = 0
    for (let j = from; j < to; j++) {
      const b = data[j]!
      if (b.min < min) min = b.min
      if (b.max > max) max = b.max
      midSum += b.mid
      midN++
    }
    out.push({
      min,
      max,
      mid: midN > 0 ? midSum / midN : 0,
    })
  }

  return out
}
