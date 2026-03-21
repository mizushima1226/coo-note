/** 時間ビンごとの min/max と、ビン中央付近の代表サンプル（ライン描画用） */
export type WaveformBin = {
  min: number
  max: number
  mid: number
}

/** 波形のビジュアルテイスト */
export type WaveformVisualStyle = 'classic' | 'oscilloscope' | 'roundedBars'

export const WAVEFORM_STYLE_LABELS: Record<WaveformVisualStyle, string> = {
  classic: 'オリジナル（min / max）',
  oscilloscope: 'ライン（オシロ風）',
  roundedBars: 'バー（丸み・隙間）',
}

export type WaveformData = WaveformBin[]

export type PosterState = {
  file: File | null
  audioBuffer: AudioBuffer | null
  waveformData: WaveformData | null
  title: string
  date: string
}
