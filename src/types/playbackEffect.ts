/**
 * プレビュー再生時にオーバーレイへ描くビジュアルエフェクト。
 * 種類を増やすときはここに id を足し、`drawPlaybackEffects` の分岐を追加する。
 */
export type PlaybackVisualEffectId = 'none' | 'vibration'

export const PLAYBACK_VISUAL_EFFECT_OPTIONS: {
  id: PlaybackVisualEffectId
  label: string
}[] = [
  { id: 'none', label: 'なし' },
  { id: 'vibration', label: '振動' },
]
