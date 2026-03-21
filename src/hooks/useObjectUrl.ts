import { useEffect, useMemo } from 'react'

/**
 * File 用の object URL を生成し、アンマウント／ファイル変更時に revoke する。
 */
export function useObjectUrl(file: File | null): string | null {
  const url = useMemo(() => {
    if (!file) return null
    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    if (!url) return
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [url])

  return url
}
