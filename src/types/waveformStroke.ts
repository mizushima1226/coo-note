/** 波形ストロークの塗り（単色 or キャンバス上の線形グラデーション） */
export type WaveformFillMode = 'solid' | 'linearGradient'

export type WaveformStrokeStyle =
  | { mode: 'solid'; color: string }
  | {
      mode: 'linearGradient'
      /** 0°＝左（開始色）→右（終了色）。反時計回り。 */
      angleDeg: number
      colorStart: string
      colorEnd: string
    }
