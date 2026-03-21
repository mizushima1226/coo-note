import { type RefObject } from 'react'
import {
  PLAYBACK_VISUAL_EFFECT_OPTIONS,
  type PlaybackVisualEffectId,
} from '../types/playbackEffect'

type WaveformPlaybackControlsProps = {
  audioRef: RefObject<HTMLAudioElement | null>
  currentTime: number
  duration: number
  isPlaying: boolean
  playbackEffect: PlaybackVisualEffectId
  onPlaybackEffectChange: (value: PlaybackVisualEffectId) => void
  disabled?: boolean
}

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

  return (
    <div className="poster-waveform-transport">
      <button
        type="button"
        className="poster-transport-button"
        disabled={disabled}
        onClick={toggle}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? '一時停止' : '再生'}
      >
        {isPlaying ? '⏸ 一時停止' : '▶ 再生'}
      </button>
      <span className="poster-transport-time" aria-live="polite">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
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
    </div>
  )
}
