import type { WaveformVisualStyle } from '../types/poster'
import type { WaveformFillMode } from '../types/waveformStroke'
import {
  BAR_GAP_MAX,
  BAR_GAP_MIN,
  BAR_GAP_STEP,
  BAR_HEIGHT_GAIN_MAX,
  BAR_HEIGHT_GAIN_MIN,
  BAR_HEIGHT_GAIN_STEP,
  LINE_WIDTH_MAX,
  LINE_WIDTH_MIN,
  LINE_WIDTH_STEP,
  normalizeHexColor,
} from '../lib/waveformStyleUtils'

type ColorProps = {
  disabled?: boolean
}

type BackgroundPanelProps = ColorProps & {
  backgroundColor: string
  onBackgroundColorChange: (value: string) => void
}

export function StylePanelBackground({
  backgroundColor,
  onBackgroundColorChange,
  disabled,
}: BackgroundPanelProps) {
  return (
    <div className="design-panel design-panel--pad">
      <p className="design-panel-title">背景の色</p>
      <div className="poster-color-row">
        <input
          id="design-bg-color"
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
  )
}

type LabelPanelProps = ColorProps & {
  labelColor: string
  onLabelColorChange: (value: string) => void
}

export function StylePanelLabel({
  labelColor,
  onLabelColorChange,
  disabled,
}: LabelPanelProps) {
  return (
    <div className="design-panel design-panel--pad">
      <p className="design-panel-title">ラベル・文字の色</p>
      <div className="poster-color-row">
        <input
          id="design-label-color"
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
          aria-label="ラベルの色"
          onChange={(e) => onLabelColorChange(e.target.value)}
        />
      </div>
    </div>
  )
}

type WaveformPanelProps = ColorProps & {
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
}

export function StylePanelWaveform({
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
  disabled,
}: WaveformPanelProps) {
  return (
    <div className="design-panel design-panel--pad">
      <fieldset className="poster-fieldset design-panel-fieldset" disabled={disabled}>
        <legend className="poster-legend">波形の塗り</legend>
        <div className="poster-radio-row" role="group" aria-label="波形の塗り方">
          <label className="poster-radio-label">
            <input
              type="radio"
              name="design-waveform-fill"
              checked={waveformFillMode === 'solid'}
              disabled={disabled}
              onChange={() => onWaveformFillModeChange('solid')}
            />
            単色
          </label>
          <label className="poster-radio-label">
            <input
              type="radio"
              name="design-waveform-fill"
              checked={waveformFillMode === 'linearGradient'}
              disabled={disabled}
              onChange={() => onWaveformFillModeChange('linearGradient')}
            />
            グラデーション
          </label>
        </div>

        {waveformFillMode === 'solid' ? (
          <div className="poster-field poster-field--compact poster-field--fieldset-inner">
            <span className="poster-label poster-label--inline-block">色</span>
            <div className="poster-color-row">
              <input
                id="design-waveform-color"
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
                placeholder="#000000"
                spellCheck={false}
                aria-label="波形の色"
                onChange={(e) => onWaveformColorChange(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="poster-gradient-fields">
            <div className="poster-field poster-field--compact">
              <label className="poster-label" htmlFor="design-grad-start">
                開始色
              </label>
              <div className="poster-color-row">
                <input
                  id="design-grad-start"
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
              <label className="poster-label" htmlFor="design-grad-end">
                終了色
              </label>
              <div className="poster-color-row">
                <input
                  id="design-grad-end"
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
              <label className="poster-label" htmlFor="design-grad-angle">
                向き（{Math.round(waveformGradientAngleDeg)}°）
              </label>
              <input
                id="design-grad-angle"
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
    </div>
  )
}

type StrokePanelProps = ColorProps & {
  visualStyle: WaveformVisualStyle
  waveformLineWidth: number
  onWaveformLineWidthChange: (value: number) => void
}

export function StylePanelStroke({
  visualStyle,
  waveformLineWidth,
  onWaveformLineWidthChange,
  disabled,
}: StrokePanelProps) {
  const lineLabel =
    visualStyle === 'roundedBars'
      ? `バーの太さ（${waveformLineWidth}px）`
      : `線の太さ（${waveformLineWidth}px）`

  return (
    <div className="design-panel design-panel--pad">
      <p className="design-panel-title">{lineLabel}</p>
      <input
        id="design-waveform-width"
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
  )
}

type BarsPanelProps = ColorProps & {
  barGap: number
  onBarGapChange: (value: number) => void
  barHeightGain: number
  onBarHeightGainChange: (value: number) => void
}

export function StylePanelBars({
  barGap,
  onBarGapChange,
  barHeightGain,
  onBarHeightGainChange,
  disabled,
}: BarsPanelProps) {
  return (
    <div className="design-panel design-panel--pad">
      <div className="poster-field poster-field--compact">
        <label className="poster-label" htmlFor="design-bar-gap">
          バー間の隙間（{barGap}px）
        </label>
        <input
          id="design-bar-gap"
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
        <label className="poster-label" htmlFor="design-bar-height">
          バーの高さ（感度 {Math.round(barHeightGain * 100)}%）
        </label>
        <input
          id="design-bar-height"
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
    </div>
  )
}
