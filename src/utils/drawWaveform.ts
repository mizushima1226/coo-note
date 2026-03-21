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
  /** 線・縦ストロークの太さ（px）。横方向の列幅の基準にも使う */
  waveformLineWidth?: number
  /** 列同士の隙間（px）。全スタイルで横方向の密度に効く */
  barGap?: number
  /** 振幅に掛ける倍率（1＝基準） */
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
    ctx.font =
      '600 18px "Zen Maru Gothic", "Hiragino Maru Gothic ProN", "Yu Gothic UI", sans-serif'
    ctx.fillText(title, width / 2, 12)
  }
  if (date) {
    ctx.textBaseline = 'bottom'
    ctx.font =
      '14px "Zen Maru Gothic", "Hiragino Maru Gothic ProN", "Yu Gothic UI", sans-serif'
    ctx.fillText(date, width / 2, height - 10)
  }
}

/** 横方向の列レイアウト（太さ＋隙間）。波形エリアは左右 8px マージン */
export function layoutWaveformStrip(
  width: number,
  columnWidth: number,
  gap: number,
): { numColumns: number; left: number; pitch: number; columnWidth: number } {
  const hMargin = 8
  const inner = Math.max(1, width - 2 * hMargin)
  const pitch = columnWidth + gap
  const numColumns = Math.max(1, Math.floor(inner / pitch))
  const totalW = numColumns * columnWidth + (numColumns - 1) * gap
  const left = (width - totalW) / 2
  return { numColumns, left, pitch, columnWidth }
}

function drawClassic(
  ctx: CanvasRenderingContext2D,
  width: number,
  midY: number,
  halfRange: number,
  data: WaveformData,
  strokeStyle: string | CanvasGradient,
  lineWidth: number,
  gap: number,
  heightGain: number,
): void {
  const hMargin = 8
  const inner = width - 2 * hMargin
  const { numColumns, left, pitch, columnWidth } = layoutWaveformStrip(width, lineWidth, gap)
  const bins = downsampleWaveformData(data, numColumns)
  if (bins.length === 0) return

  ctx.strokeStyle = strokeStyle
  ctx.lineWidth = columnWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  const n = bins.length
  const useStripLayout = n >= numColumns && data.length > numColumns
  for (let i = 0; i < n; i++) {
    const { min, max } = bins[i]!
    const x = useStripLayout
      ? left + columnWidth / 2 + i * pitch
      : hMargin + (n === 1 ? inner / 2 : (i / Math.max(1, n - 1)) * inner)
    const yTop = midY - max * halfRange * heightGain
    const yBot = midY - min * halfRange * heightGain
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
  gap: number,
  heightGain: number,
): void {
  const hMargin = 8
  const inner = width - 2 * hMargin
  const { numColumns, columnWidth, pitch } = layoutWaveformStrip(width, lineWidth, gap)
  const count = Math.max(2, numColumns)
  const totalW = count * columnWidth + (count - 1) * gap
  const left = (width - totalW) / 2
  const bins = downsampleWaveformData(data, count)
  if (bins.length === 0) return

  ctx.strokeStyle = strokeStyle
  ctx.lineWidth = columnWidth
  ctx.lineCap = 'butt'
  ctx.lineJoin = 'miter'
  ctx.miterLimit = 2
  ctx.beginPath()
  const n = bins.length
  const useStripLayout = n >= count && data.length > count
  for (let i = 0; i < n; i++) {
    const y = midY - bins[i]!.mid * halfRange * heightGain
    const x = useStripLayout
      ? left + columnWidth / 2 + i * pitch
      : hMargin + (n === 1 ? inner / 2 : (i / Math.max(1, n - 1)) * inner)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  if (n === 1) {
    const x = hMargin + inner / 2
    const y = midY - bins[0]!.mid * halfRange * heightGain
    ctx.lineTo(x + 0.75, y)
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
  const { numColumns: numBars, left, pitch, columnWidth } = layoutWaveformStrip(
    width,
    barWidth,
    gap,
  )
  const bars = downsampleWaveformData(data, numBars)
  if (bars.length === 0) return

  ctx.strokeStyle = strokeStyle
  ctx.lineWidth = columnWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  for (let i = 0; i < bars.length; i++) {
    const { min, max } = bars[i]!
    const amp = Math.max(Math.abs(min), Math.abs(max)) * halfRange * heightGain
    const x = left + columnWidth / 2 + i * pitch
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
      drawClassic(
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
    case 'oscilloscope':
      drawOscilloscope(
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
