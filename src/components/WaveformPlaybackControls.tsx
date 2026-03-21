import { type RefObject } from 'react'
import {
  PLAYBACK_VISUAL_EFFECT_OPTIONS,
  type PlaybackVisualEffectId,
} from '../types/playbackEffect'
import { WAVEFORM_STYLE_LABELS, type WaveformVisualStyle } from '../types/poster'

type WaveformPlaybackControlsProps = {
  audioRef: RefObject<HTMLAudioElement | null>
  currentTime: number
  duration: number
  isPlaying: boolean
  playbackEffect: PlaybackVisualEffectId
  onPlaybackEffectChange: (value: PlaybackVisualEffectId) => void
  disabled?: boolean
  /** meta 行用。未指定時はビジュアル選択を出さない */
  visualStyle?: WaveformVisualStyle
  onVisualStyleChange?: (value: WaveformVisualStyle) => void
  /** fab: 時間＋再生ボタン（プレビュー上） / meta: ビジュアル＋エフェクト / full: 従来の一行 */
  variant?: 'full' | 'fab' | 'meta'
}

const VISUAL_STYLE_OPTIONS = (
  Object.entries(WAVEFORM_STYLE_LABELS) as [WaveformVisualStyle, string][]
).map(([value, label]) => ({ value, label }))

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '—:—'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function WaveformPlaybackControls({
  audioRef,
  currentTime,
  duration,
  isPlaying,
  playbackEffect,
  onPlaybackEffectChange,
  disabled,
  visualStyle,
  onVisualStyleChange,
  variant = 'full',
}: WaveformPlaybackControlsProps) {
  const toggle = () => {
    const el = audioRef.current
    if (!el || disabled) return
    if (el.paused) {
      void el.play().catch(() => {})
    } else {
      el.pause()
    }
  }

  const isFab = variant === 'fab'

  const playButton = (
    <button
      type="button"
      className={isFab ? 'poster-transport-fab' : 'poster-transport-button'}
      disabled={disabled}
      onClick={toggle}
      aria-pressed={isPlaying}
      aria-label={isPlaying ? '一時停止' : '再生'}
    >
      {isFab ? (isPlaying ? '⏸' : '▶') : isPlaying ? '⏸ 一時停止' : '▶ 再生'}
    </button>
  )

  const timeEl = (
    <span className="poster-transport-time" aria-live="polite">
      {formatTime(currentTime)} / {formatTime(duration)}
    </span>
  )

  const timeOverlay = (
    <span
      className="poster-transport-time poster-transport-time--overlay"
      aria-live="polite"
    >
      {formatTime(currentTime)} / {formatTime(duration)}
    </span>
  )

  const effectEl = (
    <div className="poster-transport-effect">
      <label className="poster-transport-effect-label" htmlFor="poster-playback-effect">
        エフェクト
      </label>
      <select
        id="poster-playback-effect"
        className="poster-transport-select"
        value={playbackEffect}
        disabled={disabled}
        onChange={(e) =>
          onPlaybackEffectChange(e.target.value as PlaybackVisualEffectId)
        }
      >
        {PLAYBACK_VISUAL_EFFECT_OPTIONS.map(({ id, label }) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )

  const visualEl =
    visualStyle != null && onVisualStyleChange != null ? (
      <div className="poster-transport-effect">
        <label className="poster-transport-effect-label" htmlFor="poster-visual-inline">
          ビジュアル
        </label>
        <select
          id="poster-visual-inline"
          className="poster-transport-select"
          value={visualStyle}
          disabled={disabled}
          onChange={(e) =>
            onVisualStyleChange(e.target.value as WaveformVisualStyle)
          }
        >
          {VISUAL_STYLE_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    ) : null

  if (variant === 'fab') {
    return (
      <div className="poster-transport-fab-cluster">
        {timeOverlay}
        {playButton}
      </div>
    )
  }

  if (variant === 'meta') {
    return (
      <div className="poster-waveform-transport poster-waveform-transport--meta">
        {effectEl}
        {visualEl}
      </div>
    )
  }

  return (
    <div className="poster-waveform-transport">
      {playButton}
      {timeEl}
      {effectEl}
    </div>
  )
}
