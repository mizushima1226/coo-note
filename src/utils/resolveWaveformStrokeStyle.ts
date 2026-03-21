import type { WaveformStrokeStyle } from '../types/waveformStroke'

/**
 * Canvas の strokeStyle に渡す値（単色文字列 or LinearGradient）を生成する。
 * グラデーションはキャンバス全体を貫く線分上に配置（位置に応じて色が変化）。
 */
export function resolveWaveformStrokeStyle(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  spec: WaveformStrokeStyle,
): string | CanvasGradient {
  if (spec.mode === 'solid') {
    return spec.color
  }

  const { angleDeg, colorStart, colorEnd } = spec
  const rad = (angleDeg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const cx = width / 2
  const cy = height / 2
  const R = Math.hypot(width, height) / 2 || 0.5
  const x0 = cx - cos * R
  const y0 = cy - sin * R
  const x1 = cx + cos * R
  const y1 = cy + sin * R

  const g = ctx.createLinearGradient(x0, y0, x1, y1)
  try {
    g.addColorStop(0, colorStart)
    g.addColorStop(1, colorEnd)
  } catch {
    return colorStart || '#000000'
  }
  return g
}
