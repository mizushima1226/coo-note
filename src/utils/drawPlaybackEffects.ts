import type { WaveformData, WaveformVisualStyle } from '../types/poster'
import type { PlaybackVisualEffectId } from '../types/playbackEffect'
import { downsampleWaveformData } from './downsampleWaveform'
import { layoutWaveformArea } from './drawWaveform'

export type DrawPlaybackEffectsOptions = {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  waveformData: WaveformData
  title: string
  date: string
  visualStyle: WaveformVisualStyle
  waveformLineWidth: number
  barGap: number
  barHeightGain: number
  effect: PlaybackVisualEffectId
  isPlaying: boolean
  nowMs: number
}

/** 画面上を左→右へ進む波（x 正規化位相 − 時間） */
const WAVE_CYCLES_ACROSS = 7
const WAVE_TEMPORAL = 1 / 68

function wavePhaseFromX(x: number, width: number, nowMs: number): number {
  const denom = Math.max(1, width - 1)
  const p = x / denom
  return p * Math.PI * 2 * WAVE_CYCLES_ACROSS - nowMs * WAVE_TEMPORAL
}

/** 再生中：進行波に沿った縦方向の振れ */
function vibY(
  y: number,
  isPlaying: boolean,
  x: number,
  width: number,
  nowMs: number,
): number {
  if (!isPlaying) return y
  return y + 2.8 * Math.sin(wavePhaseFromX(x, width, nowMs))
}

/** バー用：同じ進行波で弱い横振れ */
function vibX(
  xBase: number,
  isPlaying: boolean,
  width: number,
  nowMs: number,
): number {
  if (!isPlaying) return xBase
  return xBase + 1.1 * Math.sin(wavePhaseFromX(xBase, width, nowMs))
}

function drawVibratingGhostClassic(
  ctx: CanvasRenderingContext2D,
  width: number,
  midY: number,
  halfRange: number,
  data: WaveformData,
  isPlaying: boolean,
  nowMs: number,
): void {
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  const n = data.length
  for (let i = 0; i < n; i++) {
    const { min, max } = data[i]!
    const x = (i / Math.max(1, n - 1)) * (width - 1)
    const yTop = vibY(midY - max * halfRange, isPlaying, x, width, nowMs)
    const yBot = vibY(midY - min * halfRange, isPlaying, x, width, nowMs)
    ctx.moveTo(x, yTop)
    ctx.lineTo(x, yBot)
  }
  ctx.stroke()
}

function drawVibratingGhostOscilloscope(
  ctx: CanvasRenderingContext2D,
  width: number,
  midY: number,
  halfRange: number,
  data: WaveformData,
  isPlaying: boolean,
  nowMs: number,
): void {
  ctx.lineCap = 'butt'
  ctx.lineJoin = 'miter'
  ctx.miterLimit = 2
  ctx.beginPath()
  const n = data.length
  for (let i = 0; i < n; i++) {
    const x = (i / Math.max(1, n - 1)) * (width - 1)
    const y = vibY(midY - data[i]!.mid * halfRange, isPlaying, x, width, nowMs)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
}

function drawVibratingGhostBars(
  ctx: CanvasRenderingContext2D,
  width: number,
  midY: number,
  halfRange: number,
  data: WaveformData,
  barWidth: number,
  gap: number,
  heightGain: number,
  isPlaying: boolean,
  nowMs: number,
): void {
  const hMargin = 8
  const inner = Math.max(1, width - 2 * hMargin)
  const pitch = barWidth + gap
  const numBars = Math.max(1, Math.floor(inner / pitch))
  const bars = downsampleWaveformData(data, numBars)
  if (bars.length === 0) return

  const totalW = bars.length * barWidth + (bars.length - 1) * gap
  const left = (width - totalW) / 2

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = barWidth

  for (let i = 0; i < bars.length; i++) {
    const { min, max } = bars[i]!
    const amp = Math.max(Math.abs(min), Math.abs(max)) * halfRange * heightGain
    const xRaw = left + barWidth / 2 + i * pitch
    const x = vibX(xRaw, isPlaying, width, nowMs)
    ctx.beginPath()
    ctx.moveTo(x, vibY(midY - amp, isPlaying, xRaw, width, nowMs))
    ctx.lineTo(x, vibY(midY + amp, isPlaying, xRaw, width, nowMs))
    ctx.stroke()
  }
}

/**
 * 再生連動エフェクト（オーバーレイ専用・透明背景想定）
 * `effect` に応じて描画。種類追加時は分岐を増やす。
 */
export function drawPlaybackEffects(opts: DrawPlaybackEffectsOptions): void {
  const {
    ctx,
    width,
    height,
    waveformData,
    title,
    date,
    visualStyle,
    waveformLineWidth,
    barGap,
    barHeightGain,
    effect,
    isPlaying,
    nowMs,
  } = opts

  ctx.clearRect(0, 0, width, height)

  if (!isPlaying || effect === 'none') return

  if (effect === 'vibration') {
    const { midY, halfRange } = layoutWaveformArea(height, title, date)

    ctx.save()
    ctx.globalAlpha = 0.26 + 0.1 * Math.sin(nowMs / 90)
    ctx.strokeStyle = 'rgba(255, 236, 200, 0.92)'
    ctx.shadowColor = 'rgba(255, 200, 100, 0.75)'
    ctx.shadowBlur = 14 + 6 * Math.sin(nowMs / 110)
    ctx.lineWidth = waveformLineWidth * 1.45

    switch (visualStyle) {
      case 'classic':
        drawVibratingGhostClassic(
          ctx,
          width,
          midY,
          halfRange,
          waveformData,
          isPlaying,
          nowMs,
        )
        break
      case 'oscilloscope':
        drawVibratingGhostOscilloscope(
          ctx,
          width,
          midY,
          halfRange,
          waveformData,
          isPlaying,
          nowMs,
        )
        break
      case 'roundedBars':
        drawVibratingGhostBars(
          ctx,
          width,
          midY,
          halfRange,
          waveformData,
          waveformLineWidth,
          barGap,
          barHeightGain,
          isPlaying,
          nowMs,
        )
        break
    }
    ctx.restore()
  }
}
