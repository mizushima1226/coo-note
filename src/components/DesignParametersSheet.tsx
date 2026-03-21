import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { WaveformVisualStyle } from '../types/poster'
import type { WaveformFillMode } from '../types/waveformStroke'
import {
  StylePanelBackground,
  StylePanelBars,
  StylePanelLabel,
  StylePanelStroke,
  StylePanelWaveform,
} from './waveformStylePanels'

export type DesignParamId = 'background' | 'label' | 'waveform' | 'stroke' | 'bars'

type DesignParametersSheetProps = {
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

const PARAM_META: Record<
  DesignParamId,
  { label: string; title: string; show: (v: WaveformVisualStyle) => boolean }
> = {
  background: {
    label: '背景',
    title: '背景の色',
    show: () => true,
  },
  label: {
    label: '文字',
    title: 'ラベル・文字の色',
    show: () => true,
  },
  waveform: {
    label: '波形',
    title: '波形の塗り',
    show: () => true,
  },
  stroke: {
    label: '太さ',
    title: '線・バーの太さ',
    show: () => true,
  },
  bars: {
    label: 'バー',
    title: 'バーの隙間・高さ',
    show: (v) => v === 'roundedBars',
  },
}

function IconBackground() {
  return (
    <svg className="design-sheet-icon-svg" viewBox="0 0 24 24" width="28" height="28" aria-hidden>
      <rect x="4" y="5" width="16" height="14" rx="2" fill="currentColor" opacity="0.2" />
      <rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function IconText() {
  return (
    <svg className="design-sheet-icon-svg" viewBox="0 0 24 24" width="28" height="28" aria-hidden>
      <path
        d="M7 17h10M9 7h6l-1 8H10L9 7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconWave() {
  return (
    <svg className="design-sheet-icon-svg" viewBox="0 0 24 24" width="28" height="28" aria-hidden>
      <path
        d="M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconStroke() {
  return (
    <svg className="design-sheet-icon-svg" viewBox="0 0 24 24" width="28" height="28" aria-hidden>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M5 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
    </svg>
  )
}

function IconBars() {
  return (
    <svg className="design-sheet-icon-svg" viewBox="0 0 24 24" width="28" height="28" aria-hidden>
      <rect x="5" y="14" width="3" height="6" rx="0.5" fill="currentColor" />
      <rect x="10.5" y="10" width="3" height="10" rx="0.5" fill="currentColor" opacity="0.85" />
      <rect x="16" y="12" width="3" height="8" rx="0.5" fill="currentColor" opacity="0.65" />
    </svg>
  )
}

function IconSliders() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path
        d="M4 7h16M8 12h12M6 17h12"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="16" cy="7" r="2" fill="currentColor" />
      <circle cx="10" cy="12" r="2" fill="currentColor" />
      <circle cx="14" cy="17" r="2" fill="currentColor" />
    </svg>
  )
}

const ICONS: Record<DesignParamId, ReactNode> = {
  background: <IconBackground />,
  label: <IconText />,
  waveform: <IconWave />,
  stroke: <IconStroke />,
  bars: <IconBars />,
}

const ORDER: DesignParamId[] = ['background', 'label', 'waveform', 'stroke', 'bars']

export function DesignParametersSheet(props: DesignParametersSheetProps) {
  const { visualStyle, disabled } = props
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<DesignParamId | null>(null)

  const visibleIds = useMemo(
    () => ORDER.filter((id) => PARAM_META[id].show(visualStyle)),
    [visualStyle],
  )

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const detailParam: DesignParamId | null =
    active != null && !(active === 'bars' && visualStyle !== 'roundedBars')
      ? active
      : null

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (detailParam) setActive(null)
      else {
        setOpen(false)
        setActive(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, detailParam])

  const closeAll = () => {
    setOpen(false)
    setActive(null)
  }

  const renderPanel = () => {
    if (!detailParam) return null
    switch (detailParam) {
      case 'background':
        return (
          <StylePanelBackground
            backgroundColor={props.backgroundColor}
            onBackgroundColorChange={props.onBackgroundColorChange}
            disabled={disabled}
          />
        )
      case 'label':
        return (
          <StylePanelLabel
            labelColor={props.labelColor}
            onLabelColorChange={props.onLabelColorChange}
            disabled={disabled}
          />
        )
      case 'waveform':
        return (
          <StylePanelWaveform
            waveformFillMode={props.waveformFillMode}
            onWaveformFillModeChange={props.onWaveformFillModeChange}
            waveformColor={props.waveformColor}
            onWaveformColorChange={props.onWaveformColorChange}
            waveformGradientStart={props.waveformGradientStart}
            onWaveformGradientStartChange={props.onWaveformGradientStartChange}
            waveformGradientEnd={props.waveformGradientEnd}
            onWaveformGradientEndChange={props.onWaveformGradientEndChange}
            waveformGradientAngleDeg={props.waveformGradientAngleDeg}
            onWaveformGradientAngleDegChange={props.onWaveformGradientAngleDegChange}
            disabled={disabled}
          />
        )
      case 'stroke':
        return (
          <StylePanelStroke
            visualStyle={props.visualStyle}
            waveformLineWidth={props.waveformLineWidth}
            onWaveformLineWidthChange={props.onWaveformLineWidthChange}
            disabled={disabled}
          />
        )
      case 'bars':
        return (
          <StylePanelBars
            barGap={props.barGap}
            onBarGapChange={props.onBarGapChange}
            barHeightGain={props.barHeightGain}
            onBarHeightGainChange={props.onBarHeightGainChange}
            disabled={disabled}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      <button
        type="button"
        className="design-params-trigger"
        disabled={disabled}
        onClick={() => setOpen(true)}
        aria-label="デザインパラメータを開く"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <IconSliders />
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="design-sheet-backdrop"
            aria-label="閉じる"
            onClick={closeAll}
          />
          <div
            className={`design-sheet ${detailParam ? 'design-sheet--detail' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="design-sheet-title"
          >
            <div className="design-sheet-handle" aria-hidden />
            {!detailParam ? (
              <>
                <h2 id="design-sheet-title" className="design-sheet-heading">
                  デザイン
                </h2>
                <p className="design-sheet-sub">調整する項目を選んでください</p>
                <div className="design-sheet-icon-rail" role="list">
                  {visibleIds.map((id) => (
                    <button
                      key={id}
                      type="button"
                      className="design-sheet-icon-tile"
                      disabled={disabled}
                      onClick={() => setActive(id)}
                      aria-label={PARAM_META[id].title}
                    >
                      <span className="design-sheet-icon-wrap" aria-hidden>
                        {ICONS[id]}
                      </span>
                      <span className="design-sheet-icon-label">{PARAM_META[id].label}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="design-sheet-panel-header">
                  <button
                    type="button"
                    className="design-sheet-back"
                    onClick={() => setActive(null)}
                    aria-label="項目一覧に戻る"
                  >
                    一覧
                  </button>
                  <h2 id="design-sheet-title" className="design-sheet-heading design-sheet-heading--panel">
                    {PARAM_META[detailParam].title}
                  </h2>
                </div>
                <div className="design-sheet-panel-scroll">{renderPanel()}</div>
              </>
            )}
          </div>
        </>
      ) : null}
    </>
  )
}
