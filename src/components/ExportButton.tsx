import { useCallback, useState, type RefObject } from 'react'
import { downloadCanvasAsPng } from '../utils/exportCanvas'

type ExportButtonProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>
  title: string
  disabled?: boolean
}

function safeFilenamePart(s: string): string {
  const t = s.replace(/[/\\?%*:|"<>]/g, '_').trim()
  return t || 'waveform'
}

export function ExportButton({ canvasRef, title, disabled }: ExportButtonProps) {
  const [exportError, setExportError] = useState<string | null>(null)

  const handleClick = useCallback(async () => {
    setExportError(null)
    const canvas = canvasRef.current
    if (!canvas) {
      setExportError('キャンバスが見つかりません。')
      return
    }
    try {
      const name = `${safeFilenamePart(title)}.png`
      await downloadCanvasAsPng(canvas, name)
    } catch {
      setExportError('PNG の保存に失敗しました。')
    }
  }, [canvasRef, title])

  return (
    <div className="poster-export">
      <button
        type="button"
        className="poster-button"
        disabled={disabled}
        onClick={() => void handleClick()}
      >
        PNG で保存
      </button>
      {exportError ? <p className="poster-inline-error">{exportError}</p> : null}
    </div>
  )
}
