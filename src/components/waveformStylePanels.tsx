import type { ReactNode } from 'react'
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

function RichChoiceRadio({
  variant,
  name,
  optionValue,
  checked,
  onChange,
  disabled,
  title,
  description,
  children,
}: {
  variant: PanelVariant
  name: string
  optionValue: string
  checked: boolean
  onChange: () => void
  disabled?: boolean
  title: string
  description: string
  children: ReactNode
}) {
  const shell =
    variant === 'sheet'
      ? 'border-white/12 bg-white/[0.05] hover:border-white/18 hover:bg-white/[0.08] peer-checked:border-violet-400 peer-checked:bg-violet-500/15 peer-checked:shadow-[inset_0_0_0_1px_rgba(167,139,250,0.35)]'
      : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/90 peer-checked:border-violet-500 peer-checked:bg-violet-50 peer-checked:shadow-[0_1px_2px_rgba(124,58,237,0.08)]'

  const titleClass = variant === 'sheet' ? 'text-white/95' : 'text-stone-900'
  const descClass = variant === 'sheet' ? 'text-white/48' : 'text-stone-500'

  return (
    <label
      className={`flex h-full min-h-0 min-w-0 flex-col ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <input
        type="radio"
        name={name}
        value={optionValue}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        className={`flex min-h-[5.5rem] flex-1 flex-col rounded-xl border-2 p-2.5 transition-[border-color,background-color,box-shadow,transform] duration-150 peer-active:scale-[0.99] peer-focus-visible:outline-none peer-focus-visible:ring-[3px] peer-focus-visible:ring-violet-500/30 peer-disabled:opacity-45 peer-disabled:peer-active:scale-100 sm:p-3 ${shell}`}
      >
        <span className="mb-2 flex h-11 shrink-0 items-center justify-center [&_svg]:shrink-0">
          {children}
        </span>
        <span className={`shrink-0 text-[0.82rem] font-semibold tracking-tight ${titleClass}`}>
          {title}
        </span>
        <span
          className={`mt-1 min-h-0 flex-1 text-[0.68rem] leading-snug ${descClass}`}
        >
          {description}
        </span>
      </span>
    </label>
  )
}

function FillModePreviewSolid({ color }: { color: string }) {
  return (
    <div
      className="h-9 w-[3.25rem] rounded-lg shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)] ring-1 ring-black/5"
      style={{ backgroundColor: normalizeHexColor(color) }}
      aria-hidden
    />
  )
}

function FillModePreviewGradient({
  angleDeg,
  start,
  end,
}: {
  angleDeg: number
  start: string
  end: string
}) {
  return (
    <div
      className="h-9 w-[3.25rem] rounded-lg shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)] ring-1 ring-black/5"
      style={{
        backgroundImage: `linear-gradient(${angleDeg}deg, ${normalizeHexColor(start)}, ${normalizeHexColor(end)})`,
      }}
      aria-hidden
    />
  )
}

function VisualPreviewBars({ variant }: { variant: PanelVariant }) {
  const fill = variant === 'sheet' ? '#c4b5fd' : '#7c3aed'
  const muted = variant === 'sheet' ? 'rgba(196,181,253,0.35)' : 'rgba(124,58,237,0.25)'
  return (
    <svg width="52" height="36" viewBox="0 0 52 36" aria-hidden>
      <rect x="4" y="14" width="7" height="16" rx="3.5" fill={fill} opacity="0.85" />
      <rect x="15" y="8" width="7" height="22" rx="3.5" fill={fill} />
      <rect x="26" y="11" width="7" height="19" rx="3.5" fill={fill} opacity="0.92" />
      <rect x="37" y="6" width="7" height="24" rx="3.5" fill={muted} />
    </svg>
  )
}

function VisualPreviewOscilloscope() {
  return (
    <svg width="52" height="36" viewBox="0 0 52 36" aria-hidden>
      <rect x="2" y="4" width="48" height="28" rx="5" fill="#0c0c0e" />
      <rect x="2" y="4" width="48" height="28" rx="5" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <path
        d="M6 18 Q11 10 16 18 T26 18 T36 12 T46 18"
        fill="none"
        stroke="#4ade80"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.95"
      />
      <path
        d="M6 22 Q12 26 18 22 T30 22 T42 24"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  )
}

function VisualPreviewClassic({ variant }: { variant: PanelVariant }) {
  const stroke = variant === 'sheet' ? '#e9d5ff' : '#6d28d9'
  const fill = variant === 'sheet' ? 'rgba(167,139,250,0.2)' : 'rgba(124,58,237,0.12)'
  return (
    <svg width="52" height="36" viewBox="0 0 52 36" aria-hidden>
      <path
        d="M4 24 Q14 8 26 16 T48 10 L48 30 L4 30 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const VISUAL_STYLE_ORDER: WaveformVisualStyle[] = [
  'roundedBars',
  'oscilloscope',
  'classic',
]

const VISUAL_STYLE_HINT: Record<WaveformVisualStyle, string> = {
  roundedBars: '角丸バーで音量を立体的に表現します',
  oscilloscope: 'CRT 風の発光ラインで波形を表示します',
  classic: 'なめらかなラインと塗りのクラシックな見た目です',
}

const FILL_MODE_HINT: Record<WaveformFillMode, string> = {
  solid: '波形全体をひとつの色で塗ります',
  linearGradient: '2色の線形グラデーションで奥行きを出します',
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
          className="mb-3 grid grid-cols-2 items-stretch gap-2"
          role="radiogroup"
          aria-label="波形の塗り方"
        >
          <RichChoiceRadio
            variant={variant}
            name="design-waveform-fill"
            optionValue="solid"
            checked={waveformFillMode === 'solid'}
            onChange={() => onWaveformFillModeChange('solid')}
            disabled={disabled}
            title="単色"
            description={FILL_MODE_HINT.solid}
          >
            <FillModePreviewSolid color={waveformColor} />
          </RichChoiceRadio>
          <RichChoiceRadio
            variant={variant}
            name="design-waveform-fill"
            optionValue="linearGradient"
            checked={waveformFillMode === 'linearGradient'}
            onChange={() => onWaveformFillModeChange('linearGradient')}
            disabled={disabled}
            title="グラデーション"
            description={FILL_MODE_HINT.linearGradient}
          >
            <FillModePreviewGradient
              angleDeg={waveformGradientAngleDeg}
              start={waveformGradientStart}
              end={waveformGradientEnd}
            />
          </RichChoiceRadio>
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
        <div className="mb-3">
          <span
            id="design-geom-visual-label"
            className={`mb-1.5 block text-[0.82rem] font-semibold ${labelClass(variant)}`}
          >
            ビジュアル
          </span>
          <div
            className="grid grid-cols-3 items-stretch gap-2"
            role="radiogroup"
            aria-labelledby="design-geom-visual-label"
          >
            {VISUAL_STYLE_ORDER.map((value) => (
              <RichChoiceRadio
                key={value}
                variant={variant}
                name="design-geom-visual"
                optionValue={value}
                checked={visualStyle === value}
                onChange={() => onVisualStyleChange?.(value)}
                disabled={disabled}
                title={WAVEFORM_STYLE_LABELS[value]}
                description={VISUAL_STYLE_HINT[value]}
              >
                {value === 'roundedBars' ? (
                  <VisualPreviewBars variant={variant} />
                ) : value === 'oscilloscope' ? (
                  <VisualPreviewOscilloscope />
                ) : (
                  <VisualPreviewClassic variant={variant} />
                )}
              </RichChoiceRadio>
            ))}
          </div>
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
