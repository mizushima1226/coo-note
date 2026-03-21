import type { WaveformFillMode } from '../types/waveformStroke'
import {
  StylePanelBackground,
  StylePanelGeometry,
  StylePanelLabel,
  StylePanelWaveform,
} from './waveformStylePanels'

type WaveformStyleControlsProps = {
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

/** 従来の一覧レイアウト（シート以外で使う場合向け） */
export function WaveformStyleControls(props: WaveformStyleControlsProps) {
  const { disabled } = props
  return (
    <div className="poster-waveform-style-block">
      <div className="poster-waveform-style poster-waveform-style--pair">
        <StylePanelBackground
          backgroundColor={props.backgroundColor}
          onBackgroundColorChange={props.onBackgroundColorChange}
          disabled={disabled}
        />
        <StylePanelLabel
          labelColor={props.labelColor}
          onLabelColorChange={props.onLabelColorChange}
          disabled={disabled}
        />
      </div>
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
      <StylePanelGeometry
        waveformLineWidth={props.waveformLineWidth}
        onWaveformLineWidthChange={props.onWaveformLineWidthChange}
        barGap={props.barGap}
        onBarGapChange={props.onBarGapChange}
        barHeightGain={props.barHeightGain}
        onBarHeightGainChange={props.onBarHeightGainChange}
        disabled={disabled}
      />
    </div>
  )
}
