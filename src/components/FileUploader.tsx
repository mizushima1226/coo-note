import { useRef } from 'react'

type FileUploaderVariant = 'splash' | 'compact'

type FileUploaderProps = {
  onFile: (file: File | null) => void
  disabled?: boolean
  currentFile: File | null
  variant: FileUploaderVariant
}

function WaveIcon({ compact }: { compact?: boolean }) {
  const w = compact ? 22 : 36
  const h = compact ? 16 : 27
  return (
    <svg
      className={
        compact
          ? 'poster-file-pick-icon-svg poster-file-pick-icon-svg--sm'
          : 'poster-file-pick-icon-svg'
      }
      viewBox="0 0 32 24"
      width={w}
      height={h}
      aria-hidden
    >
      <path
        className="poster-file-pick-icon-path"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        d="M2 12 Q6 4 10 12 T18 12 T26 12 T30 12"
      />
      <path
        className="poster-file-pick-icon-path poster-file-pick-icon-path--ghost"
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.45"
        d="M2 16 Q6 8 10 16 T18 16 T26 16 T30 16"
      />
    </svg>
  )
}

export function FileUploader({
  onFile,
  disabled,
  currentFile,
  variant,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isSplash = variant === 'splash'

  const ariaLabel = isSplash
    ? '音声または動画ファイルを選択'
    : currentFile
      ? `${currentFile.name}の代わりに別のファイルを選ぶ`
      : '音声または動画ファイルを選択'

  return (
    <div
      className={
        isSplash ? 'poster-file-pick poster-file-pick--splash' : 'poster-file-pick poster-file-pick--compact'
      }
    >
      <input
        ref={inputRef}
        id="poster-audio-input"
        type="file"
        accept="audio/*,video/*"
        disabled={disabled}
        className="poster-file-input--hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const next = e.target.files?.[0] ?? null
          onFile(next)
        }}
      />
      <button
        type="button"
        className={
          isSplash
            ? 'poster-file-pick-button poster-file-pick-button--splash'
            : 'poster-file-pick-button poster-file-pick-button--compact'
        }
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        aria-label={ariaLabel}
      >
        {isSplash ? (
          <span className="poster-file-pick-inner poster-file-pick-inner--splash">
            <span className="poster-file-pick-icon-wrap poster-file-pick-icon-wrap--splash" aria-hidden>
              <WaveIcon />
            </span>
            <span className="poster-file-pick-title poster-file-pick-title--splash">ファイルを選ぶ</span>
          </span>
        ) : (
          <span className="poster-file-pick-inner poster-file-pick-inner--compact">
            <span className="poster-file-pick-icon-wrap poster-file-pick-icon-wrap--compact" aria-hidden>
              <WaveIcon compact />
            </span>
            <span className="poster-file-pick-compact-label">変更</span>
          </span>
        )}
      </button>
    </div>
  )
}
