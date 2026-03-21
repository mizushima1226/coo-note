import { type RefObject } from 'react'

type WaveformPlaybackControlsProps = {
  audioRef: RefObject<HTMLAudioElement | null>
  currentTime: number
  duration: number
  isPlaying: boolean
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
    <div className="poster-transport-fab-cluster">
      <span
        className="poster-transport-time poster-transport-time--overlay"
        aria-live="polite"
      >
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
      <button
        type="button"
        className="poster-transport-fab"
        disabled={disabled}
        onClick={toggle}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? '一時停止' : '再生'}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>
    </div>
  )
}
