import { WAVEFORM_STYLE_LABELS, type WaveformVisualStyle } from '../types/poster'
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

export type PanelVariant = 'default' | 'sheet'

type ColorProps = {
  disabled?: boolean
  variant?: PanelVariant
  /** シート詳細では見出しを非表示（シート見出しと重複するため） */
  omitSectionTitle?: boolean
}

function labelClass(v: PanelVariant) {
  return v === 'sheet' ? 'text-white/88' : 'text-stone-900'
}

function textInputClass(v: PanelVariant) {
  const sheet =
    'border-white/14 bg-black/35 text-white/95 placeholder:text-white/35 focus-visible:border-violet-400 focus-visible:shadow-[0_0_0_3px_rgba(124,58,237,0.35)] [&>option]:bg-[#1c1c1f] [&>option]:text-white/95'
  const light =
    'border-stone-200 bg-white text-stone-900 focus-visible:border-violet-600 focus-visible:shadow-[0_0_0_3px_rgba(124,58,237,0.08)]'
  return `block w-full max-w-none box-border rounded-lg border px-2.5 py-2 text-[0.95rem] font-inherit transition focus-visible:outline-none ${v === 'sheet' ? sheet : light}`
}

function colorInputClass(v: PanelVariant) {
  return `h-[2.1rem] w-[2.6rem] shrink-0 cursor-pointer rounded-lg border bg-transparent p-0 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-violet-500/20 ${v === 'sheet' ? 'border-white/20' : 'border-stone-200'}`
}

function rangeClass(v: PanelVariant) {
  return `mt-0.5 block w-full max-w-none ${v === 'sheet' ? 'accent-[#c4b5fd]' : 'accent-violet-600'}`
}

function sectionTitleClass(v: PanelVariant) {
  return v === 'sheet'
    ? 'mb-2 text-[0.72rem] font-bold uppercase tracking-[0.04em] text-white/55'
    : 'mb-2 text-[0.72rem] font-bold uppercase tracking-[0.04em] text-stone-500'
}

type BackgroundPanelProps = ColorProps & {
  backgroundColor: string
  onBackgroundColorChange: (value: string) => void
}

export function StylePanelBackground({
  backgroundColor,
  onBackgroundColorChange,
  disabled,
  variant = 'default',
  omitSectionTitle = false,
}: BackgroundPanelProps) {
  return (
    <div className="m-0 py-[0.35rem] pb-2">
      {!omitSectionTitle ? (
        <p className={sectionTitleClass(variant)}>背景の色</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-[0.45rem]">
        <input
          id="design-bg-color"
          type="color"
          value={normalizeHexColor(backgroundColor)}
          disabled={disabled}
          className={colorInputClass(variant)}
          onChange={(e) => onBackgroundColorChange(e.target.value)}
        />
        <input
          type="text"
          value={backgroundColor}
          disabled={disabled}
          className={`${textInputClass(variant)} min-w-24 max-w-48 flex-1`}
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
  variant = 'default',
  omitSectionTitle = false,
}: LabelPanelProps) {
  return (
    <div className="m-0 py-[0.35rem] pb-2">
      {!omitSectionTitle ? (
        <p className={sectionTitleClass(variant)}>ラベル・文字の色</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-[0.45rem]">
        <input
          id="design-label-color"
          type="color"
          value={normalizeHexColor(labelColor)}
          disabled={disabled}
          className={colorInputClass(variant)}
          onChange={(e) => onLabelColorChange(e.target.value)}
        />
        <input
          type="text"
          value={labelColor}
          disabled={disabled}
          className={`${textInputClass(variant)} min-w-24 max-w-48 flex-1`}
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
  variant = 'default',
  omitSectionTitle = false,
}: WaveformPanelProps) {
  const fieldsetSurface =
    variant === 'sheet'
      ? 'rounded-[10px] border border-solid border-white/10 bg-black/22 px-[0.85rem] pt-3 pb-[0.9rem]'
      : ''

  return (
    <div className="m-0 py-[0.35rem] pb-2">
      <fieldset
        className={`m-0 w-full border-0 p-0 ${fieldsetSurface}`}
        disabled={disabled}
      >
        <legend
          className={
            omitSectionTitle
              ? 'sr-only'
              : `px-1 text-[0.82rem] font-semibold ${labelClass(variant)}`
          }
        >
          波形の塗り
        </legend>
        <div
          className="mb-2 flex flex-wrap gap-[0.85rem]"
          role="group"
          aria-label="波形の塗り方"
        >
          <label
            className={`inline-flex cursor-pointer items-center gap-1.5 text-[0.88rem] ${labelClass(variant)}`}
          >
            <input
              type="radio"
              name="design-waveform-fill"
              checked={waveformFillMode === 'solid'}
              disabled={disabled}
              onChange={() => onWaveformFillModeChange('solid')}
            />
            単色
          </label>
          <label
            className={`inline-flex cursor-pointer items-center gap-1.5 text-[0.88rem] ${labelClass(variant)}`}
          >
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
          <div className="mt-0.5 mb-0">
            <span
              className={`mb-1.5 block text-[0.82rem] font-semibold ${labelClass(variant)}`}
            >
              色
            </span>
            <div className="flex flex-wrap items-center gap-[0.45rem]">
              <input
                id="design-waveform-color"
                type="color"
                value={normalizeHexColor(waveformColor)}
                disabled={disabled}
                className={colorInputClass(variant)}
                onChange={(e) => onWaveformColorChange(e.target.value)}
              />
              <input
                type="text"
                value={waveformColor}
                disabled={disabled}
                className={`${textInputClass(variant)} min-w-32 flex-1`}
                placeholder="#000000"
                spellCheck={false}
                aria-label="波形の色"
                onChange={(e) => onWaveformColorChange(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="mt-0.5 flex flex-col gap-[0.45rem]">
            <div className="mb-0">
              <label
                className={`mb-1.5 block text-[0.82rem] font-semibold ${labelClass(variant)}`}
                htmlFor="design-grad-start"
              >
                開始色
              </label>
              <div className="flex flex-wrap items-center gap-[0.45rem]">
                <input
                  id="design-grad-start"
                  type="color"
                  value={normalizeHexColor(waveformGradientStart)}
                  disabled={disabled}
                  className={colorInputClass(variant)}
                  onChange={(e) =>
                    onWaveformGradientStartChange(e.target.value)
                  }
                />
                <input
                  type="text"
                  value={waveformGradientStart}
                  disabled={disabled}
                  className={`${textInputClass(variant)} min-w-32 flex-1`}
                  spellCheck={false}
                  aria-label="グラデーション開始色"
                  onChange={(e) =>
                    onWaveformGradientStartChange(e.target.value)
                  }
                />
              </div>
            </div>
            <div className="mb-0">
              <label
                className={`mb-1.5 block text-[0.82rem] font-semibold ${labelClass(variant)}`}
                htmlFor="design-grad-end"
              >
                終了色
              </label>
              <div className="flex flex-wrap items-center gap-[0.45rem]">
                <input
                  id="design-grad-end"
                  type="color"
                  value={normalizeHexColor(waveformGradientEnd)}
                  disabled={disabled}
                  className={colorInputClass(variant)}
                  onChange={(e) => onWaveformGradientEndChange(e.target.value)}
                />
                <input
                  type="text"
                  value={waveformGradientEnd}
                  disabled={disabled}
                  className={`${textInputClass(variant)} min-w-32 flex-1`}
                  spellCheck={false}
                  aria-label="グラデーション終了色"
                  onChange={(e) => onWaveformGradientEndChange(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-0">
              <label
                className={`mb-1.5 block text-[0.82rem] font-semibold ${labelClass(variant)}`}
                htmlFor="design-grad-angle"
              >
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
                className={rangeClass(variant)}
                onChange={(e) =>
                  onWaveformGradientAngleDegChange(Number(e.target.value))
                }
              />
            </div>
          </div>
        )}
      </fieldset>
    </div>
  )
}

const GEOMETRY_VISUAL_OPTIONS = (
  Object.entries(WAVEFORM_STYLE_LABELS) as [WaveformVisualStyle, string][]
).map(([value, label]) => ({ value, label }))

type GeometryPanelProps = Omit<ColorProps, 'omitSectionTitle'> & {
  visualStyle?: WaveformVisualStyle
  onVisualStyleChange?: (value: WaveformVisualStyle) => void
  waveformLineWidth: number
  onWaveformLineWidthChange: (value: number) => void
  barGap: number
  onBarGapChange: (value: number) => void
  barHeightGain: number
  onBarHeightGainChange: (value: number) => void
}

/** ビジュアル種類・太さ・隙間・高さ */
export function StylePanelGeometry({
  visualStyle,
  onVisualStyleChange,
  waveformLineWidth,
  onWaveformLineWidthChange,
  barGap,
  onBarGapChange,
  barHeightGain,
  onBarHeightGainChange,
  disabled,
  variant = 'default',
}: GeometryPanelProps) {
  const showVisual = visualStyle != null && onVisualStyleChange != null

  return (
    <div className="m-0 py-[0.35rem] pb-2">
      {showVisual ? (
        <div className="mb-0">
          <label
            className={`mb-1.5 block text-[0.82rem] font-semibold ${labelClass(variant)}`}
            htmlFor="design-geom-visual"
          >
            ビジュアル
          </label>
          <select
            id="design-geom-visual"
            className={textInputClass(variant)}
            value={visualStyle}
            disabled={disabled}
            onChange={(e) =>
              onVisualStyleChange(e.target.value as WaveformVisualStyle)
            }
          >
            {GEOMETRY_VISUAL_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div className="mb-0">
        <label
          className={`mb-1.5 block text-[0.82rem] font-semibold ${labelClass(variant)}`}
          htmlFor="design-geom-width"
        >
          太さ（{waveformLineWidth}px）
        </label>
        <input
          id="design-geom-width"
          type="range"
          min={LINE_WIDTH_MIN}
          max={LINE_WIDTH_MAX}
          step={LINE_WIDTH_STEP}
          value={waveformLineWidth}
          disabled={disabled}
          className={rangeClass(variant)}
          onChange={(e) => onWaveformLineWidthChange(Number(e.target.value))}
        />
      </div>
      <div className="mb-0">
        <label
          className={`mb-1.5 block text-[0.82rem] font-semibold ${labelClass(variant)}`}
          htmlFor="design-geom-gap"
        >
          隙間（{barGap}px）
        </label>
        <input
          id="design-geom-gap"
          type="range"
          min={BAR_GAP_MIN}
          max={BAR_GAP_MAX}
          step={BAR_GAP_STEP}
          value={barGap}
          disabled={disabled}
          className={rangeClass(variant)}
          onChange={(e) => onBarGapChange(Number(e.target.value))}
        />
      </div>
      <div className="mb-0">
        <label
          className={`mb-1.5 block text-[0.82rem] font-semibold ${labelClass(variant)}`}
          htmlFor="design-geom-height"
        >
          高さ（感度 {Math.round(barHeightGain * 100)}%）
        </label>
        <input
          id="design-geom-height"
          type="range"
          min={BAR_HEIGHT_GAIN_MIN}
          max={BAR_HEIGHT_GAIN_MAX}
          step={BAR_HEIGHT_GAIN_STEP}
          value={barHeightGain}
          disabled={disabled}
          className={rangeClass(variant)}
          onChange={(e) => onBarHeightGainChange(Number(e.target.value))}
        />
      </div>
    </div>
  )
}
