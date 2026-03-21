import { useEffect, useMemo, useRef, useState } from 'react'
import { ExportButton } from './components/ExportButton'
import { FileUploader } from './components/FileUploader'
import {
  POSTER_CANVAS_WIDTH,
  WaveformCanvas,
} from './components/WaveformCanvas'
import { WaveformPlaybackControls } from './components/WaveformPlaybackControls'
import { DesignParametersSheet } from './components/DesignParametersSheet'
import { useAudioDecoder } from './hooks/useAudioDecoder'
import { useObjectUrl } from './hooks/useObjectUrl'
import { useWaveformData } from './hooks/useWaveformData'
import type { WaveformVisualStyle } from './types/poster'
import type { WaveformFillMode, WaveformStrokeStyle } from './types/waveformStroke'

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [visualStyle, setVisualStyle] = useState<WaveformVisualStyle>('roundedBars')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [labelColor, setLabelColor] = useState('#000000')
  const [waveformFillMode, setWaveformFillMode] =
    useState<WaveformFillMode>('solid')
  const [waveformColor, setWaveformColor] = useState('#000000')
  const [waveformGradientStart, setWaveformGradientStart] = useState('#a855f7')
  const [waveformGradientEnd, setWaveformGradientEnd] = useState('#22d3ee')
  const [waveformGradientAngleDeg, setWaveformGradientAngleDeg] = useState(0)
  const [waveformLineWidth, setWaveformLineWidth] = useState(5)
  const [barGap, setBarGap] = useState(4)
  const [barHeightGain, setBarHeightGain] = useState(1)

  const [mediaCurrentTime, setMediaCurrentTime] = useState(0)
  const [mediaDuration, setMediaDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const objectUrl = useObjectUrl(file)

  useEffect(() => {
    const el = audioRef.current
    if (!el || !objectUrl) return

    const sync = () => {
      setMediaCurrentTime(el.currentTime)
      const d = el.duration
      setMediaDuration(Number.isFinite(d) && d > 0 ? d : 0)
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => {
      setIsPlaying(false)
      sync()
    }

    el.addEventListener('timeupdate', sync)
    el.addEventListener('loadedmetadata', sync)
    el.addEventListener('durationchange', sync)
    el.addEventListener('seeked', sync)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('ended', onEnded)
    sync()

    return () => {
      el.removeEventListener('timeupdate', sync)
      el.removeEventListener('loadedmetadata', sync)
      el.removeEventListener('durationchange', sync)
      el.removeEventListener('seeked', sync)
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('ended', onEnded)
    }
  }, [objectUrl])

  const handleVisualStyleChange = (next: WaveformVisualStyle) => {
    setVisualStyle(next)
    setWaveformFillMode('solid')
    if (next === 'oscilloscope') {
      setBackgroundColor('#000000')
      setWaveformColor('#ffffff')
      setLabelColor('#ffffff')
      setWaveformLineWidth(1.5)
    } else if (next === 'roundedBars') {
      setBackgroundColor('#ffffff')
      setWaveformColor('#000000')
      setLabelColor('#000000')
      setWaveformLineWidth(5)
      setBarGap(4)
      setBarHeightGain(1)
    } else {
      setBackgroundColor('#ffffff')
      setWaveformColor('#000000')
      setLabelColor('#000000')
      setWaveformLineWidth(1)
      setBarGap(3)
    }
  }

  const waveformStroke = useMemo((): WaveformStrokeStyle => {
    if (waveformFillMode === 'solid') {
      return { mode: 'solid', color: waveformColor }
    }
    return {
      mode: 'linearGradient',
      angleDeg: waveformGradientAngleDeg,
      colorStart: waveformGradientStart,
      colorEnd: waveformGradientEnd,
    }
  }, [
    waveformFillMode,
    waveformColor,
    waveformGradientAngleDeg,
    waveformGradientStart,
    waveformGradientEnd,
  ])

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const { audioBuffer, loading, error } = useAudioDecoder(file)
  const { waveformData } = useWaveformData(audioBuffer, POSTER_CANVAS_WIDTH)

  const canvasPlaceholder = error
    ? 'デコードできませんでした（別の形式を試してください）'
    : loading
      ? '読み込み中…'
      : undefined

  const canExport = Boolean(waveformData?.length && !loading)

  const exportBasename = useMemo(() => {
    if (!file?.name) return ''
    return file.name.replace(/\.[^/.]+$/i, '')
  }, [file])

  const hasFile = Boolean(file)

  return (
    <div
      className={
        hasFile
          ? 'box-border min-h-svh px-[0.85rem] pb-[calc(2rem+env(safe-area-inset-bottom,0px))] pt-4'
          : 'box-border flex min-h-svh flex-col px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] pt-4'
      }
    >
      {!hasFile ? (
        <div className="mx-auto flex w-full min-h-0 max-w-[560px] flex-1 flex-col">
          <header className="shrink-0 px-[0.15rem] pb-3 pt-[0.35rem] text-center">
            <h1 className="mb-0 text-[1.35rem] font-bold tracking-tight text-stone-900">
              Coo Note
            </h1>
          </header>
          <div className="flex min-h-[10rem] flex-1 items-center justify-center py-1 pb-6">
            <div className="w-full max-w-[320px]">
              <FileUploader
                variant="splash"
                onFile={setFile}
                disabled={loading}
                currentFile={null}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-[560px] flex-col gap-5 text-left md:max-w-[640px]">
          {objectUrl ? (
            <audio
              key={objectUrl}
              ref={audioRef}
              src={objectUrl}
              preload="metadata"
              className="pointer-events-none absolute m-[-1px] h-px w-px overflow-hidden border-0 p-0 [clip:rect(0,0,0,0)] whitespace-nowrap"
              aria-label="波形と連動するプレビュー音声"
            />
          ) : null}

          <header className="px-[0.15rem]">
            <h1 className="mb-[0.35rem] text-[1.35rem] font-bold tracking-tight text-stone-900">
              Coo Note
            </h1>
            <p className="text-[0.9rem] leading-normal text-stone-500">
              音声 / 動画から波形を生成し、PNG で保存します。
            </p>
          </header>

          <div className="w-full shrink-0">
            <div className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-[0.6rem]">
              <FileUploader
                variant="compact"
                onFile={setFile}
                disabled={loading}
                currentFile={file}
              />
              <div className="ml-auto flex flex-col items-center min-[420px]:items-end max-[380px]:ml-0 max-[380px]:basis-full max-[380px]:grow max-[380px]:items-stretch">
                <ExportButton
                  canvasRef={canvasRef}
                  basename={exportBasename}
                  disabled={!canExport}
                  compact
                />
              </div>
            </div>
          </div>

          <section className="relative" aria-label="波形プレビュー">
            {error ? (
              <div
                className="mb-2 rounded-lg border border-red-200 bg-red-50 px-[0.65rem] py-[0.55rem] text-[0.85rem] leading-snug text-red-800"
                role="alert"
              >
                {error}
              </div>
            ) : null}
            {loading ? (
              <div
                className="mb-2 rounded-lg border border-stone-200 bg-slate-50 px-[0.65rem] py-[0.55rem] text-[0.85rem] leading-snug text-stone-900"
                aria-live="polite"
              >
                デコードしています…
              </div>
            ) : null}

            <div className="flex w-full justify-center">
              <div className="relative inline-block max-w-full align-top">
                <div
                  className="relative my-[0.35rem] mb-[0.85rem] rounded-[18px] bg-[linear-gradient(125deg,#c084fc_0%,#f472b6_35%,#38bdf8_68%,#4ade80_100%)] p-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.65)_inset,0_20px_48px_-14px_rgba(168,85,247,0.38),0_14px_32px_-12px_rgba(56,189,248,0.22)]"
                >
                  <div
                    className="pointer-events-none absolute bottom-[-28%] left-[5%] right-[5%] z-0 h-[55%] rounded-full bg-[radial-gradient(ellipse_80%_70%_at_50%_100%,rgba(192,132,252,0.5),rgba(56,189,248,0.15)_45%,transparent_70%)] blur-xl"
                    aria-hidden
                  />
                  <div className="relative z-[1] overflow-hidden rounded-[15px] bg-white">
                    <div className="box-border w-fit max-w-full overflow-hidden rounded-none border-0 bg-transparent p-0">
                      <WaveformCanvas
                        ref={canvasRef}
                        waveformData={error ? null : waveformData}
                        title=""
                        date=""
                        visualStyle={visualStyle}
                        backgroundColor={backgroundColor}
                        labelColor={labelColor}
                        waveformStroke={waveformStroke}
                        waveformLineWidth={waveformLineWidth}
                        barGap={barGap}
                        barHeightGain={barHeightGain}
                        isPlaying={isPlaying}
                        placeholderMessage={canvasPlaceholder}
                      />
                    </div>
                  </div>
                </div>
                {objectUrl ? (
                  <div className="pointer-events-none absolute bottom-[1.65rem] right-3 z-[4]">
                    <WaveformPlaybackControls
                      audioRef={audioRef}
                      currentTime={mediaCurrentTime}
                      duration={mediaDuration}
                      isPlaying={isPlaying}
                      disabled={loading}
                    />
                  </div>
                ) : null}
              </div>
            </div>

          </section>

          <DesignParametersSheet
            visualStyle={visualStyle}
            onVisualStyleChange={handleVisualStyleChange}
            backgroundColor={backgroundColor}
            onBackgroundColorChange={setBackgroundColor}
            labelColor={labelColor}
            onLabelColorChange={setLabelColor}
            waveformFillMode={waveformFillMode}
            onWaveformFillModeChange={setWaveformFillMode}
            waveformColor={waveformColor}
            onWaveformColorChange={setWaveformColor}
            waveformGradientStart={waveformGradientStart}
            onWaveformGradientStartChange={setWaveformGradientStart}
            waveformGradientEnd={waveformGradientEnd}
            onWaveformGradientEndChange={setWaveformGradientEnd}
            waveformGradientAngleDeg={waveformGradientAngleDeg}
            onWaveformGradientAngleDegChange={setWaveformGradientAngleDeg}
            waveformLineWidth={waveformLineWidth}
            onWaveformLineWidthChange={setWaveformLineWidth}
            barGap={barGap}
            onBarGapChange={setBarGap}
            barHeightGain={barHeightGain}
            onBarHeightGainChange={setBarHeightGain}
            disabled={loading}
          />
        </div>
      )}
    </div>
  )
}

export default App
