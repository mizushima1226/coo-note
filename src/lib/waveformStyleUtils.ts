export const LINE_WIDTH_MIN = 0.5
export const LINE_WIDTH_MAX = 12
export const LINE_WIDTH_STEP = 0.5

export const BAR_GAP_MIN = 0
export const BAR_GAP_MAX = 14
export const BAR_GAP_STEP = 1

export const BAR_HEIGHT_GAIN_MIN = 0.15
export const BAR_HEIGHT_GAIN_MAX = 2.5
export const BAR_HEIGHT_GAIN_STEP = 0.05

/** color input は #rrggbb 形式のみ。不正時はフォールバック */
export function normalizeHexColor(css: string): string {
  const t = css.trim()
  if (/^#[0-9A-Fa-f]{6}$/.test(t)) return t
  if (/^#[0-9A-Fa-f]{3}$/.test(t)) {
    const r = t[1]!
    const g = t[2]!
    const b = t[3]!
    return `#${r}${r}${g}${g}${b}${b}`
  }
  return '#000000'
}
