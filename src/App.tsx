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
import './App.css'

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
    <div className={hasFile ? 'poster-shell' : 'poster-shell poster-shell--splash'}>
      {!hasFile ? (
        <div className="poster-splash-layout">
          <header className="poster-header-min poster-header-min--splash">
            <h1 className="poster-title-page">Coo Note</h1>
          </header>
          <div className="poster-splash-body">
            <div className="poster-splash">
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
        <div className="poster-app">
          {objectUrl ? (
            <audio
              key={objectUrl}
              ref={audioRef}
              src={objectUrl}
              preload="metadata"
              className="poster-audio-hidden"
              aria-label="波形と連動するプレビュー音声"
            />
          ) : null}

          <header className="poster-header-min">
            <h1 className="poster-title-page">Coo Note</h1>
            <p className="poster-lead">
              音声 / 動画から波形を生成し、PNG で保存します。
            </p>
          </header>

          <div className="poster-file-toolbar-wrap">
            <div className="poster-file-toolbar">
              <FileUploader
                variant="compact"
                onFile={setFile}
                disabled={loading}
                currentFile={file}
              />
              <ExportButton
                canvasRef={canvasRef}
                basename={exportBasename}
                disabled={!canExport}
                compact
              />
            </div>
          </div>

          <section className="poster-stage" aria-label="波形プレビュー">
            {error ? (
              <div className="poster-banner poster-banner--error" role="alert">
                {error}
              </div>
            ) : null}
            {loading ? (
              <div className="poster-banner poster-banner--loading" aria-live="polite">
                デコードしています…
              </div>
            ) : null}

            <div className="poster-canvas-viewport">
              <div className="poster-preview-frame">
                <div className="poster-canvas-pop">
                  <div className="poster-canvas-pop-glow" aria-hidden />
                  <div className="poster-canvas-pop-inner">
                    <div className="poster-canvas-wrap">
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
                  <div className="poster-transport-fab-wrap">
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
