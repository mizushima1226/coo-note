import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { WaveformVisualStyle } from '../types/poster'
import type { WaveformFillMode } from '../types/waveformStroke'
import {
  StylePanelBackground,
  StylePanelGeometry,
  StylePanelLabel,
  StylePanelWaveform,
} from './waveformStylePanels'

export type DesignParamId = 'background' | 'label' | 'waveform' | 'geometry'

type DesignParametersSheetProps = {
  visualStyle: WaveformVisualStyle
  onVisualStyleChange: (value: WaveformVisualStyle) => void
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
  geometry: {
    label: '形状',
    title: 'ビジュアル・太さ・隙間・高さ',
    show: () => true,
  },
}

function IconBackground() {
  return (
    <svg className="block" viewBox="0 0 24 24" width="28" height="28" aria-hidden>
      <rect x="4" y="5" width="16" height="14" rx="2" fill="currentColor" opacity="0.2" />
      <rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function IconText() {
  return (
    <svg className="block" viewBox="0 0 24 24" width="28" height="28" aria-hidden>
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
    <svg className="block" viewBox="0 0 24 24" width="28" height="28" aria-hidden>
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

function IconGeometry() {
  return (
    <svg className="block" viewBox="0 0 24 24" width="28" height="28" aria-hidden>
      <path
        d="M4 18h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.45"
      />
      <rect x="5.5" y="6" width="2.5" height="9" rx="1" fill="currentColor" opacity="0.9" />
      <rect x="10.75" y="4" width="2.5" height="11" rx="1" fill="currentColor" />
      <rect x="16" y="7" width="2.5" height="8" rx="1" fill="currentColor" opacity="0.85" />
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
  geometry: <IconGeometry />,
}

const ORDER: DesignParamId[] = ['background', 'label', 'waveform', 'geometry']

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

  const detailParam: DesignParamId | null = active

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
            variant="sheet"
            omitSectionTitle
          />
        )
      case 'label':
        return (
          <StylePanelLabel
            labelColor={props.labelColor}
            onLabelColorChange={props.onLabelColorChange}
            disabled={disabled}
            variant="sheet"
            omitSectionTitle
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
            variant="sheet"
            omitSectionTitle
          />
        )
      case 'geometry':
        return (
          <StylePanelGeometry
            visualStyle={props.visualStyle}
            onVisualStyleChange={props.onVisualStyleChange}
            waveformLineWidth={props.waveformLineWidth}
            onWaveformLineWidthChange={props.onWaveformLineWidthChange}
            barGap={props.barGap}
            onBarGapChange={props.onBarGapChange}
            barHeightGain={props.barHeightGain}
            onBarHeightGainChange={props.onBarHeightGainChange}
            disabled={disabled}
            variant="sheet"
          />
        )
      default:
        return null
    }
  }

  const triggerFab =
    'fixed z-[60] m-0 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-0 bg-white/95 p-0 text-stone-900 shadow-[0_4px_18px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.06)] backdrop-blur-[10px] transition-[transform,box-shadow] duration-100 hover:shadow-[0_6px_22px_rgba(0,0,0,0.16),0_0_0_1px_rgba(0,0,0,0.07)] active:scale-[0.96] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(124,58,237,0.08),0_4px_18px_rgba(0,0,0,0.14)] disabled:cursor-not-allowed disabled:opacity-45'

  const sheetBase =
    'fixed z-[101] mx-auto flex flex-col rounded-[22px] border border-white/10 bg-[rgba(18,18,20,0.92)] px-4 pb-4 pt-[0.65rem] text-white/95 shadow-[0_28px_90px_rgba(0,0,0,0.55),0_12px_36px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] motion-reduce:animate-none animate-[design-sheet-float-in_0.38s_cubic-bezier(0.22,1,0.36,1)] max-w-[520px] left-[max(1rem,env(safe-area-inset-left,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] bottom-[max(1.1rem,env(safe-area-inset-bottom,0px))] top-auto'

  const sheetSize = detailParam
    ? 'max-h-[min(54vh,29rem)] min-h-[min(38vh,15.5rem)]'
    : 'max-h-[min(34vh,15rem)] min-h-[min(30vh,12.5rem)]'

  return (
    <>
      <button
        type="button"
        className={`${triggerFab} bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-[max(0.85rem,env(safe-area-inset-left,0px))]`}
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
            className="motion-reduce:animate-none animate-[design-sheet-fade-in_0.28s_ease] fixed inset-0 z-[100] m-0 cursor-pointer border-0 bg-transparent p-0"
            aria-label="閉じる"
            onClick={closeAll}
          />
          <div
            className={`${sheetBase} ${sheetSize}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="design-sheet-title"
          >
            <div
              className="mb-[0.55rem] h-1 w-[2.35rem] shrink-0 self-center rounded-full bg-white/20"
              aria-hidden
            />
            {!detailParam ? (
              <>
                <h2
                  id="design-sheet-title"
                  className="mb-0.5 text-center text-[1.05rem] font-bold tracking-tight text-white/[0.96]"
                >
                  デザイン
                </h2>
                <p className="mb-3 text-center text-[0.78rem] leading-snug text-white/50">
                  調整する項目を選んでください
                </p>
                <div
                  className="m-0 box-border flex w-full flex-row flex-nowrap items-stretch gap-[0.35rem] px-0 pb-[0.35rem] pt-[0.15rem]"
                  role="list"
                >
                  {visibleIds.map((id) => (
                    <button
                      key={id}
                      type="button"
                      className="flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-start gap-[0.35rem] rounded-[14px] border-0 bg-white/[0.08] px-1 py-[0.45rem] pt-2 font-inherit text-white/92 transition-[background,transform] duration-100 hover:bg-white/[0.14] active:scale-[0.97] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_rgba(167,139,250,0.55)] disabled:cursor-not-allowed disabled:opacity-45"
                      disabled={disabled}
                      onClick={() => setActive(id)}
                      aria-label={PARAM_META[id].title}
                    >
                      <span
                        className="flex h-[2.75rem] w-[2.75rem] items-center justify-center rounded-[11px] bg-black/30 text-white/88"
                        aria-hidden
                      >
                        {ICONS[id]}
                      </span>
                      <span className="max-w-full overflow-hidden text-center text-[0.68rem] font-semibold leading-tight text-white/55 text-ellipsis whitespace-nowrap">
                        {PARAM_META[id].label}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="relative mb-2 flex min-h-9 shrink-0 flex-row items-center gap-[0.35rem]">
                  <button
                    type="button"
                    className="absolute left-0 top-1/2 m-0 -translate-y-1/2 cursor-pointer rounded-lg border-0 bg-transparent px-2 py-[0.35rem] text-[0.88rem] font-semibold text-violet-300 font-inherit hover:bg-white/[0.08] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_rgba(167,139,250,0.45)]"
                    onClick={() => setActive(null)}
                    aria-label="項目一覧に戻る"
                  >
                    一覧
                  </button>
                  <h2
                    id="design-sheet-title"
                    className="box-border flex-1 pr-10 text-center text-[0.95rem] font-bold tracking-tight text-white/[0.96]"
                  >
                    {PARAM_META[detailParam].title}
                  </h2>
                </div>
                <div className="mx-[-0.15rem] min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-[0.15rem] pb-1 [-webkit-overflow-scrolling:touch]">
                  {renderPanel()}
                </div>
              </>
            )}
          </div>
        </>
      ) : null}
    </>
  )
}
