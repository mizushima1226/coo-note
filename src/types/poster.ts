/** 時間ビンごとの min/max と、ビン中央付近の代表サンプル（ライン描画用） */
export type WaveformBin = {
  min: number
  max: number
  mid: number
}

/** 波形のビジュアルテイスト */
export type WaveformVisualStyle = 'classic' | 'oscilloscope' | 'roundedBars'

/** UI 表示用（ドロップダウンなど）。キーの定義順が選択肢の並びになる */
export const WAVEFORM_STYLE_LABELS: Record<WaveformVisualStyle, string> = {
  roundedBars: 'バー',
  oscilloscope: 'オシロ',
  classic: 'オリジナル',
}

export type WaveformData = WaveformBin[]

export type PosterState = {
  file: File | null
  audioBuffer: AudioBuffer | null
  waveformData: WaveformData | null
  title: string
  date: string
}
