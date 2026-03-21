function triggerDownload(href: string, filename: string): void {
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  a.click()
}

/**
 * Canvas を PNG としてダウンロード（toBlob 優先、失敗時は toDataURL）
 */
export function downloadCanvasAsPng(
  canvas: HTMLCanvasElement,
  filename: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const fallback = () => {
      try {
        triggerDownload(canvas.toDataURL('image/png'), filename)
        resolve()
      } catch (e) {
        reject(e)
      }
    }

    if (typeof canvas.toBlob !== 'function') {
      fallback()
      return
    }

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          fallback()
          return
        }
        const url = URL.createObjectURL(blob)
        triggerDownload(url, filename)
        URL.revokeObjectURL(url)
        resolve()
      },
      'image/png',
      1,
    )
  })
}
