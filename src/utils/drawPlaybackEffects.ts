import type { WaveformData, WaveformVisualStyle } from '../types/poster'
import { downsampleWaveformData } from './downsampleWaveform'
import { layoutWaveformArea, layoutWaveformStrip } from './drawWaveform'

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
  lineWidth: number,
  gap: number,
  heightGain: number,
  isPlaying: boolean,
  nowMs: number,
): void {
  const hMargin = 8
  const inner = width - 2 * hMargin
  const { numColumns, left, pitch, columnWidth } = layoutWaveformStrip(width, lineWidth, gap)
  const bins = downsampleWaveformData(data, numColumns)
  if (bins.length === 0) return

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = columnWidth
  ctx.beginPath()
  const n = bins.length
  const useStripLayout = n >= numColumns && data.length > numColumns
  for (let i = 0; i < n; i++) {
    const { min, max } = bins[i]!
    const xRaw = useStripLayout
      ? left + columnWidth / 2 + i * pitch
      : hMargin + (n === 1 ? inner / 2 : (i / Math.max(1, n - 1)) * inner)
    const yTop = vibY(midY - max * halfRange * heightGain, isPlaying, xRaw, width, nowMs)
    const yBot = vibY(midY - min * halfRange * heightGain, isPlaying, xRaw, width, nowMs)
    ctx.moveTo(xRaw, yTop)
    ctx.lineTo(xRaw, yBot)
  }
  ctx.stroke()
}

function drawVibratingGhostOscilloscope(
  ctx: CanvasRenderingContext2D,
  width: number,
  midY: number,
  halfRange: number,
  data: WaveformData,
  lineWidth: number,
  gap: number,
  heightGain: number,
  isPlaying: boolean,
  nowMs: number,
): void {
  const hMargin = 8
  const inner = width - 2 * hMargin
  const { numColumns, columnWidth, pitch } = layoutWaveformStrip(width, lineWidth, gap)
  const count = Math.max(2, numColumns)
  const totalW = count * columnWidth + (count - 1) * gap
  const left = (width - totalW) / 2
  const bins = downsampleWaveformData(data, count)
  if (bins.length === 0) return

  ctx.lineCap = 'butt'
  ctx.lineJoin = 'miter'
  ctx.miterLimit = 2
  ctx.lineWidth = columnWidth
  ctx.beginPath()
  const n = bins.length
  const useStripLayout = n >= count && data.length > count
  for (let i = 0; i < n; i++) {
    const xRaw = useStripLayout
      ? left + columnWidth / 2 + i * pitch
      : hMargin + (n === 1 ? inner / 2 : (i / Math.max(1, n - 1)) * inner)
    const y = vibY(midY - bins[i]!.mid * halfRange * heightGain, isPlaying, xRaw, width, nowMs)
    if (i === 0) ctx.moveTo(xRaw, y)
    else ctx.lineTo(xRaw, y)
  }
  if (n === 1) {
    const xRaw = hMargin + inner / 2
    const y = vibY(midY - bins[0]!.mid * halfRange * heightGain, isPlaying, xRaw, width, nowMs)
    ctx.lineTo(xRaw + 0.75, y)
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
 * 再生連動の振動オーバーレイ（透明背景想定）
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
    isPlaying,
    nowMs,
  } = opts

  ctx.clearRect(0, 0, width, height)

  if (!isPlaying) return

  const { midY, halfRange } = layoutWaveformArea(height, title, date)

  ctx.save()
  ctx.globalAlpha = 0.26 + 0.1 * Math.sin(nowMs / 90)
  ctx.strokeStyle = 'rgba(255, 236, 200, 0.92)'
  ctx.shadowColor = 'rgba(255, 200, 100, 0.75)'
  ctx.shadowBlur = 14 + 6 * Math.sin(nowMs / 110)
  const ghostLineW = waveformLineWidth * 1.45
  ctx.lineWidth = ghostLineW

  switch (visualStyle) {
    case 'classic':
      drawVibratingGhostClassic(
        ctx,
        width,
        midY,
        halfRange,
        waveformData,
        ghostLineW,
        barGap,
        barHeightGain,
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
        ghostLineW,
        barGap,
        barHeightGain,
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
