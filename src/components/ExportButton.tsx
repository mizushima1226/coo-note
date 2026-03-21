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

  return (
    <div className={compact ? 'poster-export poster-export--inline' : 'poster-export'}>
      {compact ? null : (
        <h2 id="section-export" className="poster-settings-group-title">
          書き出し
        </h2>
      )}
      <button
        type="button"
        className={compact ? 'poster-button poster-button--compact' : 'poster-button'}
        disabled={disabled}
        onClick={() => void handleClick()}
        aria-label={compact ? 'PNG で保存' : undefined}
      >
        PNG で保存
      </button>
      {exportError ? <p className="poster-inline-error">{exportError}</p> : null}
    </div>
  )
}
