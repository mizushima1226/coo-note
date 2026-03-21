import type { WaveformVisualStyle } from '../types/poster'
import type { WaveformFillMode } from '../types/waveformStroke'

type WaveformStyleControlsProps = {
  visualStyle: WaveformVisualStyle
  backgroundColor: string
  onBackgroundColorChange: (value: string) => void
  labelColor: string
  onLabelColorChange: (value: string) => void
  waveformFillMode: WaveformFillMode
  onWaveformFillModeChange: (value: WaveformFillMode) => void
  waveformColor: string
  onWaveformColorChange: (value: string) => void
  waveformGradientStart: string
  onWaveformGradientStartChange: (value: string) => void
  waveformGradientEnd: string
  onWaveformGradientEndChange: (value: string) => void
  waveformGradientAngleDeg: number
  onWaveformGradientAngleDegChange: (value: number) => void
  waveformLineWidth: number
  onWaveformLineWidthChange: (value: number) => void
  barGap: number
  onBarGapChange: (value: number) => void
  barHeightGain: number
  onBarHeightGainChange: (value: number) => void
  disabled?: boolean
}

const LINE_WIDTH_MIN = 0.5
const LINE_WIDTH_MAX = 12
const LINE_WIDTH_STEP = 0.5

const BAR_GAP_MIN = 0
const BAR_GAP_MAX = 14
const BAR_GAP_STEP = 1

const BAR_HEIGHT_GAIN_MIN = 0.15
const BAR_HEIGHT_GAIN_MAX = 2.5
const BAR_HEIGHT_GAIN_STEP = 0.05

export function WaveformStyleControls({
  visualStyle,
  backgroundColor,
  onBackgroundColorChange,
  labelColor,
  onLabelColorChange,
  waveformFillMode,
  onWaveformFillModeChange,
  waveformColor,
  onWaveformColorChange,
  waveformGradientStart,
  onWaveformGradientStartChange,
  waveformGradientEnd,
  onWaveformGradientEndChange,
  waveformGradientAngleDeg,
  onWaveformGradientAngleDegChange,
  waveformLineWidth,
  onWaveformLineWidthChange,
  barGap,
  onBarGapChange,
  barHeightGain,
  onBarHeightGainChange,
  disabled,
}: WaveformStyleControlsProps) {
  const lineLabel =
    visualStyle === 'roundedBars'
      ? `バーの太さ（${waveformLineWidth}px）`
      : `線の太さ（${waveformLineWidth}px）`

  return (
    <div className="poster-waveform-style-block">
      <div className="poster-waveform-style poster-waveform-style--pair">
        <div className="poster-field poster-field--compact">
          <label className="poster-label" htmlFor="poster-bg-color">
            背景の色
          </label>
          <div className="poster-color-row">
            <input
              id="poster-bg-color"
              type="color"
              value={normalizeHexColor(backgroundColor)}
              disabled={disabled}
              className="poster-color-input"
              onChange={(e) => onBackgroundColorChange(e.target.value)}
            />
            <input
              type="text"
              value={backgroundColor}
              disabled={disabled}
              className="poster-text-input poster-text-input--narrow"
              spellCheck={false}
              aria-label="背景の色"
              onChange={(e) => onBackgroundColorChange(e.target.value)}
            />
          </div>
        </div>

        <div className="poster-field poster-field--compact">
          <label className="poster-label" htmlFor="poster-label-color">
            タイトル・日付の色
          </label>
          <div className="poster-color-row">
            <input
              id="poster-label-color"
              type="color"
              value={normalizeHexColor(labelColor)}
              disabled={disabled}
              className="poster-color-input"
              onChange={(e) => onLabelColorChange(e.target.value)}
            />
            <input
              type="text"
              value={labelColor}
              disabled={disabled}
              className="poster-text-input poster-text-input--narrow"
              spellCheck={false}
              aria-label="タイトル・日付の色"
              onChange={(e) => onLabelColorChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      <fieldset className="poster-fieldset" disabled={disabled}>
        <legend className="poster-legend">波形の塗り</legend>
        <div className="poster-radio-row" role="group" aria-label="波形の塗り方">
          <label className="poster-radio-label">
            <input
              type="radio"
              name="waveform-fill"
              checked={waveformFillMode === 'solid'}
              disabled={disabled}
              onChange={() => onWaveformFillModeChange('solid')}
            />
            単色
          </label>
          <label className="poster-radio-label">
            <input
              type="radio"
              name="waveform-fill"
              checked={waveformFillMode === 'linearGradient'}
              disabled={disabled}
              onChange={() => onWaveformFillModeChange('linearGradient')}
            />
            線形グラデーション
          </label>
        </div>

        {waveformFillMode === 'solid' ? (
          <div className="poster-field poster-field--compact poster-field--fieldset-inner">
            <span className="poster-label poster-label--inline-block">色</span>
            <div className="poster-color-row">
              <input
                id="poster-waveform-color"
                type="color"
                value={normalizeHexColor(waveformColor)}
                disabled={disabled}
                className="poster-color-input"
                onChange={(e) => onWaveformColorChange(e.target.value)}
              />
              <input
                type="text"
                value={waveformColor}
                disabled={disabled}
                className="poster-text-input poster-text-input--grow"
                placeholder="#000000 または rgb() など"
                spellCheck={false}
                aria-label="波形の色"
                onChange={(e) => onWaveformColorChange(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="poster-gradient-fields">
            <div className="poster-field poster-field--compact">
              <label className="poster-label" htmlFor="poster-grad-start">
                開始色（グラデーションの一方の端）
              </label>
              <div className="poster-color-row">
                <input
                  id="poster-grad-start"
                  type="color"
                  value={normalizeHexColor(waveformGradientStart)}
                  disabled={disabled}
                  className="poster-color-input"
                  onChange={(e) => onWaveformGradientStartChange(e.target.value)}
                />
                <input
                  type="text"
                  value={waveformGradientStart}
                  disabled={disabled}
                  className="poster-text-input poster-text-input--grow"
                  spellCheck={false}
                  aria-label="グラデーション開始色"
                  onChange={(e) => onWaveformGradientStartChange(e.target.value)}
                />
              </div>
            </div>
            <div className="poster-field poster-field--compact">
              <label className="poster-label" htmlFor="poster-grad-end">
                終了色（もう一方の端）
              </label>
              <div className="poster-color-row">
                <input
                  id="poster-grad-end"
                  type="color"
                  value={normalizeHexColor(waveformGradientEnd)}
                  disabled={disabled}
                  className="poster-color-input"
                  onChange={(e) => onWaveformGradientEndChange(e.target.value)}
                />
                <input
                  type="text"
                  value={waveformGradientEnd}
                  disabled={disabled}
                  className="poster-text-input poster-text-input--grow"
                  spellCheck={false}
                  aria-label="グラデーション終了色"
                  onChange={(e) => onWaveformGradientEndChange(e.target.value)}
                />
              </div>
            </div>
            <div className="poster-field poster-field--compact">
              <label className="poster-label" htmlFor="poster-grad-angle">
                向き（{Math.round(waveformGradientAngleDeg)}°）・0°＝左→右
              </label>
              <input
                id="poster-grad-angle"
                type="range"
                min={0}
                max={360}
                step={1}
                value={waveformGradientAngleDeg}
                disabled={disabled}
                className="poster-range"
                onChange={(e) => onWaveformGradientAngleDegChange(Number(e.target.value))}
              />
            </div>
          </div>
        )}
      </fieldset>

      <div className="poster-field poster-field--compact">
        <label className="poster-label" htmlFor="poster-waveform-width">
          {lineLabel}
        </label>
        <input
          id="poster-waveform-width"
          type="range"
          min={LINE_WIDTH_MIN}
          max={LINE_WIDTH_MAX}
          step={LINE_WIDTH_STEP}
          value={waveformLineWidth}
          disabled={disabled}
          className="poster-range"
          onChange={(e) => onWaveformLineWidthChange(Number(e.target.value))}
        />
      </div>

      {visualStyle === 'roundedBars' ? (
        <>
          <div className="poster-field poster-field--compact">
            <label className="poster-label" htmlFor="poster-bar-gap">
              バー間の隙間（{barGap}px）
            </label>
            <input
              id="poster-bar-gap"
              type="range"
              min={BAR_GAP_MIN}
              max={BAR_GAP_MAX}
              step={BAR_GAP_STEP}
              value={barGap}
              disabled={disabled}
              className="poster-range"
              onChange={(e) => onBarGapChange(Number(e.target.value))}
            />
          </div>
          <div className="poster-field poster-field--compact">
            <label className="poster-label" htmlFor="poster-bar-height">
              バーの高さ（感度 {Math.round(barHeightGain * 100)}%）
            </label>
            <input
              id="poster-bar-height"
              type="range"
              min={BAR_HEIGHT_GAIN_MIN}
              max={BAR_HEIGHT_GAIN_MAX}
              step={BAR_HEIGHT_GAIN_STEP}
              value={barHeightGain}
              disabled={disabled}
              className="poster-range"
              onChange={(e) => onBarHeightGainChange(Number(e.target.value))}
            />
          </div>
        </>
      ) : null}
    </div>
  )
}

/** color input は #rrggbb 形式のみ。不正時はフォールバック */
function normalizeHexColor(css: string): string {
  const t = css.trim()
  if (/^#[0-9A-Fa-f]{6}$/.test(t)) return t
  if (/^#[0-9A-Fa-f]{3}$/.test(t)) {
    const r = t[1]!
    const g = t[2]!
    const b = t[3]!
    return `#${r}${r}${g}${g}${b}${b}`
  }
  return '#000000'
}
