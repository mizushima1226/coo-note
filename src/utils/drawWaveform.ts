import type { WaveformData, WaveformVisualStyle } from '../types/poster'
import type { WaveformStrokeStyle } from '../types/waveformStroke'
import { downsampleWaveformData } from './downsampleWaveform'
import { resolveWaveformStrokeStyle } from './resolveWaveformStrokeStyle'

export type DrawWaveformOptions = {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  waveformData: WaveformData
  title: string
  date: string
  visualStyle: WaveformVisualStyle
  backgroundColor: string
  labelColor: string
  waveformStroke: WaveformStrokeStyle
  /** classic / oscilloscope: 線幅。roundedBars: バー（縦線）の太さ */
  waveformLineWidth?: number
  /** roundedBars のみ：バー同士の隙間（px） */
  barGap?: number
  /** roundedBars のみ：振幅に掛ける倍率（1＝従来どおり） */
  barHeightGain?: number
}

export function layoutWaveformArea(
  height: number,
  title: string,
  date: string,
): { midY: number; halfRange: number } {
  const paddingTop = title ? 52 : 20
  const paddingBottom = date ? 40 : 20
  const waveformTop = paddingTop
  const waveformBottom = height - paddingBottom
  const midY = (waveformTop + waveformBottom) / 2
  const halfRange = ((waveformBottom - waveformTop) / 2) * 0.92
  return { midY, halfRange }
}

function drawLabels(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  title: string,
  date: string,
  labelColor: string,
): void {
  ctx.fillStyle = labelColor
  ctx.textAlign = 'center'
  if (title) {
    ctx.textBaseline = 'top'
    ctx.font = '600 18px system-ui, sans-serif'
    ctx.fillText(title, width / 2, 12)
  }
  if (date) {
    ctx.textBaseline = 'bottom'
    ctx.font = '14px system-ui, sans-serif'
    ctx.fillText(date, width / 2, height - 10)
  }
}

function drawClassic(
  ctx: CanvasRenderingContext2D,
  width: number,
  midY: number,
  halfRange: number,
  data: WaveformData,
  strokeStyle: string | CanvasGradient,
  lineWidth: number,
): void {
  ctx.strokeStyle = strokeStyle
  ctx.lineWidth = lineWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  const n = data.length
  for (let i = 0; i < n; i++) {
    const { min, max } = data[i]!
    const x = (i / Math.max(1, n - 1)) * (width - 1)
    const yTop = midY - max * halfRange
    const yBot = midY - min * halfRange
    ctx.moveTo(x, yTop)
    ctx.lineTo(x, yBot)
  }
  ctx.stroke()
}

/** ビン中央サンプルをつないだジグザグライン（オシロ風） */
function drawOscilloscope(
  ctx: CanvasRenderingContext2D,
  width: number,
  midY: number,
  halfRange: number,
  data: WaveformData,
  strokeStyle: string | CanvasGradient,
  lineWidth: number,
): void {
  ctx.strokeStyle = strokeStyle
  ctx.lineWidth = lineWidth
  ctx.lineCap = 'butt'
  ctx.lineJoin = 'miter'
  ctx.miterLimit = 2
  ctx.beginPath()
  const n = data.length
  for (let i = 0; i < n; i++) {
    const y = midY - data[i]!.mid * halfRange
    const x = (i / Math.max(1, n - 1)) * (width - 1)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
}

/** 隙間のある丸帽バー。振幅はビン内の最大絶対値 */
function drawRoundedBars(
  ctx: CanvasRenderingContext2D,
  width: number,
  midY: number,
  halfRange: number,
  data: WaveformData,
  strokeStyle: string | CanvasGradient,
  barWidth: number,
  gap: number,
  heightGain: number,
): void {
  const hMargin = 8
  const inner = Math.max(1, width - 2 * hMargin)
  const pitch = barWidth + gap
  const numBars = Math.max(1, Math.floor(inner / pitch))
  const bars = downsampleWaveformData(data, numBars)
  if (bars.length === 0) return

  const totalW = bars.length * barWidth + (bars.length - 1) * gap
  const left = (width - totalW) / 2

  ctx.strokeStyle = strokeStyle
  ctx.lineWidth = barWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  for (let i = 0; i < bars.length; i++) {
    const { min, max } = bars[i]!
    const amp = Math.max(Math.abs(min), Math.abs(max)) * halfRange * heightGain
    const x = left + barWidth / 2 + i * pitch
    ctx.beginPath()
    ctx.moveTo(x, midY - amp)
    ctx.lineTo(x, midY + amp)
    ctx.stroke()
  }
}

/**
 * 背景・タイトル・日付を含めて波形を描画。visualStyle で描き分け。
 */
export function drawWaveform(opts: DrawWaveformOptions): void {
  const {
    ctx,
    width,
    height,
    waveformData,
    title,
    date,
    visualStyle,
    backgroundColor,
    labelColor,
    waveformStroke,
    waveformLineWidth = 1,
    barGap = 3,
    barHeightGain = 1,
  } = opts

  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)

  const { midY, halfRange } = layoutWaveformArea(height, title, date)
  const resolvedStroke = resolveWaveformStrokeStyle(ctx, width, height, waveformStroke)

  switch (visualStyle) {
    case 'classic':
      drawClassic(ctx, width, midY, halfRange, waveformData, resolvedStroke, waveformLineWidth)
      break
    case 'oscilloscope':
      drawOscilloscope(ctx, width, midY, halfRange, waveformData, resolvedStroke, waveformLineWidth)
      break
    case 'roundedBars':
      drawRoundedBars(
        ctx,
        width,
        midY,
        halfRange,
        waveformData,
        resolvedStroke,
        waveformLineWidth,
        barGap,
        barHeightGain,
      )
      break
  }

  drawLabels(ctx, width, height, title, date, labelColor)
}
