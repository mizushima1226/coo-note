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

const fabShadow =
  'shadow-[0_4px_18px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.16),0_0_0_1px_rgba(0,0,0,0.07)] active:scale-[0.96] focus-visible:shadow-[0_0_0_3px_rgba(124,58,237,0.08),0_4px_18px_rgba(0,0,0,0.14)] focus-visible:outline-none'

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
    <div className="pointer-events-auto flex flex-row items-center gap-[0.45rem]">
      <span
        className="whitespace-nowrap rounded-full bg-white/95 px-[0.6rem] py-[0.38rem] text-[0.76rem] font-semibold tabular-nums text-stone-900 shadow-[0_2px_12px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.06)] backdrop-blur-md"
        aria-live="polite"
      >
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
      <button
        type="button"
        className={`m-0 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-0 bg-white/95 p-0 text-[1.05rem] leading-none text-stone-900 backdrop-blur-md transition-[transform,box-shadow] duration-100 disabled:cursor-not-allowed disabled:opacity-45 ${fabShadow}`}
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
