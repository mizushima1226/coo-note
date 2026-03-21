import { useCallback, useState, type RefObject } from 'react'
import { downloadCanvasAsPng } from '../utils/exportCanvas'

type ExportButtonProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>
  /** PNG のベース名（拡張子なし）。空なら waveform */
  basename?: string
  disabled?: boolean
  /** 見出しなし・ツールバー用（プレビュー横に並べる） */
  compact?: boolean
}

function safeFilenamePart(s: string): string {
  const t = s.replace(/[/\\?%*:|"<>]/g, '_').trim()
  return t || 'waveform'
}

export function ExportButton({
  canvasRef,
  basename = '',
  disabled,
  compact = false,
}: ExportButtonProps) {
  const [exportError, setExportError] = useState<string | null>(null)

  const handleClick = useCallback(async () => {
    setExportError(null)
    const canvas = canvasRef.current
    if (!canvas) {
      setExportError('キャンバスが見つかりません。')
      return
    }
    try {
      const name = `${safeFilenamePart(basename)}.png`
      await downloadCanvasAsPng(canvas, name)
    } catch {
      setExportError('PNG の保存に失敗しました。')
    }
  }, [canvasRef, basename])

  const btnClass = compact
    ? 'box-border inline-flex min-h-[2.65rem] w-full min-w-0 cursor-pointer items-center justify-center rounded-lg border border-violet-800 bg-violet-600 px-4 py-0 text-[0.9rem] font-semibold text-white shadow-sm transition-[background,filter] duration-100 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45 disabled:filter-none max-[380px]:w-full min-[420px]:w-auto min-[420px]:min-w-[8.5rem]'
    : 'cursor-pointer rounded-lg border border-violet-800 bg-violet-600 px-4 py-[0.45rem] text-[0.9rem] font-semibold text-white shadow-sm transition-[background,filter] duration-100 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45 disabled:filter-none'

  return (
    <div
      className={
        compact
          ? 'flex flex-col items-stretch gap-1.5'
          : 'flex flex-col items-stretch gap-1.5'
      }
    >
      {compact ? null : (
        <h2
          id="section-export"
          className="mb-0 text-[0.7rem] font-semibold uppercase tracking-[0.06em] text-stone-500"
        >
          書き出し
        </h2>
      )}
      <button
        type="button"
        className={btnClass}
        disabled={disabled}
        onClick={() => void handleClick()}
        aria-label={compact ? 'PNG で保存' : undefined}
      >
        PNG で保存
      </button>
      {exportError ? (
        <p className="m-0 text-[0.82rem] text-red-800">{exportError}</p>
      ) : null}
    </div>
  )
}
