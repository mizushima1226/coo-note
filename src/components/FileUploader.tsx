type FileUploaderProps = {
  onFile: (file: File | null) => void
  disabled?: boolean
}

export function FileUploader({ onFile, disabled }: FileUploaderProps) {
  return (
    <div className="poster-field">
      <label className="poster-label" htmlFor="poster-audio-input">
        音声 / 動画ファイル
      </label>
      <input
        id="poster-audio-input"
        type="file"
        accept="audio/*,video/*"
        disabled={disabled}
        className="poster-file-input"
        onChange={(e) => {
          const next = e.target.files?.[0] ?? null
          onFile(next)
        }}
      />
    </div>
  )
}
