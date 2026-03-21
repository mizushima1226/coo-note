import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import type { WaveformData, WaveformVisualStyle } from '../types/poster'
import type { WaveformStrokeStyle } from '../types/waveformStroke'
import { drawPlaybackEffects } from '../utils/drawPlaybackEffects'
import { drawWaveform } from '../utils/drawWaveform'

export const POSTER_CANVAS_WIDTH = 800
export const POSTER_CANVAS_HEIGHT = 400

type WaveformCanvasProps = {
  waveformData: WaveformData | null
  title: string
  date: string
  visualStyle: WaveformVisualStyle
  backgroundColor: string
  labelColor: string
  waveformStroke: WaveformStrokeStyle
  waveformLineWidth?: number
  barGap?: number
  barHeightGain?: number
  isPlaying: boolean
  placeholderMessage?: string
}

function drawPlaceholder(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  message: string,
) {
  const g = ctx.createLinearGradient(0, 0, width, height)
  g.addColorStop(0, '#faf5ff')
  g.addColorStop(0.45, '#f0f9ff')
  g.addColorStop(1, '#fdf4ff')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#78716c'
  ctx.font =
    '15px "Zen Maru Gothic", "Hiragino Maru Gothic ProN", "Yu Gothic UI", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(message, width / 2, height / 2)
}

function setupCanvasSize(
  canvas: HTMLCanvasElement,
  dpr: number,
  w: number,
  h: number,
): CanvasRenderingContext2D | null {
  canvas.width = Math.round(w * dpr)
  canvas.height = Math.round(h * dpr)
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.scale(dpr, dpr)
  return ctx
}

export const WaveformCanvas = forwardRef<HTMLCanvasElement, WaveformCanvasProps>(
  function WaveformCanvas(
    {
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
      isPlaying,
      placeholderMessage = 'ファイルを選択すると波形が表示されます',
    },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const overlayRef = useRef<HTMLCanvasElement | null>(null)
    const [animTick, setAnimTick] = useState(0)

    useEffect(() => {
      if (!isPlaying) return
      let raf = 0
      const loop = () => {
        setAnimTick((n) => n + 1)
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
      return () => cancelAnimationFrame(raf)
    }, [isPlaying])

    const setCanvasRef = useCallback(
      (node: HTMLCanvasElement | null) => {
        canvasRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref],
    )

    const w = POSTER_CANVAS_WIDTH
    const h = POSTER_CANVAS_HEIGHT
    const hasWaveform = Boolean(waveformData?.length)

    useLayoutEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const dpr = window.devicePixelRatio || 1
      const ctx = setupCanvasSize(canvas, dpr, w, h)
      if (!ctx) return

      if (!waveformData?.length) {
        drawPlaceholder(ctx, w, h, placeholderMessage)
        return
      }

      drawWaveform({
        ctx,
        width: w,
        height: h,
        waveformData,
        title,
        date,
        visualStyle,
        backgroundColor,
        labelColor,
        waveformStroke,
        waveformLineWidth,
        barGap,
        barHeightGain,
      })
    }, [
      w,
      h,
      waveformData,
      title,
      date,
      placeholderMessage,
      visualStyle,
      backgroundColor,
      labelColor,
      waveformStroke,
      waveformLineWidth,
      barGap,
      barHeightGain,
    ])

    useLayoutEffect(() => {
      const overlay = overlayRef.current
      if (!overlay) return
      const dpr = window.devicePixelRatio || 1
      const octx = setupCanvasSize(overlay, dpr, w, h)
      if (!octx) return

      if (!hasWaveform) {
        octx.clearRect(0, 0, w, h)
        return
      }

      octx.clearRect(0, 0, w, h)
      if (waveformData) {
        drawPlaybackEffects({
          ctx: octx,
          width: w,
          height: h,
          waveformData,
          title,
          date,
          visualStyle,
          waveformLineWidth,
          barGap,
          barHeightGain,
          isPlaying,
          nowMs: performance.now(),
        })
      }
    }, [
      w,
      h,
      hasWaveform,
      waveformData,
      title,
      date,
      visualStyle,
      waveformLineWidth,
      barGap,
      barHeightGain,
      isPlaying,
      animTick,
    ])

    return (
      <div className="poster-canvas-stack">
        <canvas
          ref={setCanvasRef}
          className="poster-canvas poster-canvas--main"
          width={POSTER_CANVAS_WIDTH}
          height={POSTER_CANVAS_HEIGHT}
        />
        <canvas
          ref={overlayRef}
          className="poster-canvas poster-canvas--overlay"
          width={POSTER_CANVAS_WIDTH}
          height={POSTER_CANVAS_HEIGHT}
          aria-hidden
        />
      </div>
    )
  },
)
