type PosterControlsProps = {
  title: string
  date: string
  onTitleChange: (value: string) => void
  onDateChange: (value: string) => void
  disabled?: boolean
}

export function PosterControls({
  title,
  date,
  onTitleChange,
  onDateChange,
  disabled,
}: PosterControlsProps) {
  return (
    <div className="poster-controls">
      <div className="poster-field">
        <label className="poster-label" htmlFor="poster-title">
          タイトル
        </label>
        <input
          id="poster-title"
          type="text"
          value={title}
          disabled={disabled}
          className="poster-text-input"
          placeholder="例: Session 01"
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>
      <div className="poster-field">
        <label className="poster-label" htmlFor="poster-date">
          日付
        </label>
        <input
          id="poster-date"
          type="text"
          value={date}
          disabled={disabled}
          className="poster-text-input"
          placeholder="例: 2025-03-21"
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>
    </div>
  )
}
