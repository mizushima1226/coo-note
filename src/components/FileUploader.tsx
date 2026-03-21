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
      className="block"
      viewBox="0 0 32 24"
      width={w}
      height={h}
      aria-hidden
    >
      <path
        className="stroke-violet-700"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        d="M2 12 Q6 4 10 12 T18 12 T26 12 T30 12"
      />
      <path
        className="stroke-cyan-600"
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

  const pickWrap = isSplash ? 'relative w-full' : 'relative w-auto max-w-full'

  const buttonBase =
    'relative m-0 cursor-pointer border-0 bg-[linear-gradient(128deg,#7c3aed_0%,#c026d3_38%,#db2777_58%,#0891b2_100%)] p-0.5 text-left font-inherit shadow-[0_4px_14px_rgba(124,58,237,0.22),0_1px_3px_rgba(0,0,0,0.06)] transition-[transform,box-shadow,filter] duration-150 hover:brightness-[1.03] hover:shadow-[0_6px_20px_rgba(124,58,237,0.28),0_2px_6px_rgba(0,0,0,0.06)] active:scale-[0.992] disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale-[0.15] disabled:shadow-none focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(124,58,237,0.08),0_4px_14px_rgba(124,58,237,0.22)]'

  const buttonSplash = `${buttonBase} block w-full rounded-[18px]`
  const buttonCompact = `${buttonBase} inline-block w-auto rounded-[11px] p-px shadow-[0_2px_8px_rgba(124,58,237,0.16),0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_3px_12px_rgba(124,58,237,0.2),0_1px_3px_rgba(0,0,0,0.05)] focus-visible:shadow-[0_0_0_3px_rgba(124,58,237,0.08),0_2px_8px_rgba(124,58,237,0.16)]`

  return (
    <div className={pickWrap}>
      <input
        ref={inputRef}
        id="poster-audio-input"
        type="file"
        accept="audio/*,video/*"
        disabled={disabled}
        className="pointer-events-none fixed m-[-1px] h-px w-px overflow-hidden border-0 p-0 opacity-0 [clip:rect(0,0,0,0)] whitespace-nowrap"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const next = e.target.files?.[0] ?? null
          onFile(next)
        }}
      />
      <button
        type="button"
        className={isSplash ? buttonSplash : buttonCompact}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        aria-label={ariaLabel}
      >
        {isSplash ? (
          <span className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/85 bg-gradient-to-b from-neutral-50 via-white to-[#f8f7ff] px-[1.35rem] pb-7 pt-[1.65rem] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            <span
              className="flex h-[4.25rem] w-[4.25rem] shrink-0 items-center justify-center rounded-[14px] border border-violet-500/20 bg-gradient-to-br from-violet-500/15 to-cyan-600/10"
              aria-hidden
            >
              <WaveIcon />
            </span>
            <span className="text-[1.05rem] font-bold tracking-tight text-stone-900">
              ファイルを選ぶ
            </span>
          </span>
        ) : (
          <span className="box-border flex min-h-[2.65rem] items-center gap-[0.45rem] rounded-[10px] border border-white/85 bg-gradient-to-b from-neutral-50 via-white to-[#f8f7ff] py-[0.35rem] pl-[0.45rem] pr-[0.65rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-500/20 bg-gradient-to-br from-violet-500/15 to-cyan-600/10"
              aria-hidden
            >
              <WaveIcon compact />
            </span>
            <span className="pr-0.5 text-[0.8rem] font-semibold tracking-wide text-stone-900">
              変更
            </span>
          </span>
        )}
      </button>
    </div>
  )
}
