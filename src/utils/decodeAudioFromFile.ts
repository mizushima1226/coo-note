/**
 * File から AudioBuffer を得る。
 * - まず decodeAudioData（高速）
 * - 失敗時は HTMLMediaElement + Web Audio でデコード（iPhone 動画 MOV 等の Safari 向け）
 */

const VIDEO_EXT = new Set([
  'mov',
  'mp4',
  'm4v',
  'webm',
  'mkv',
  '3gp',
  'avi',
])

export function isProbablyVideoFile(file: File): boolean {
  if (file.type.startsWith('video/')) return true
  const ext = file.name.split('.').pop()?.toLowerCase()
  return ext != null && VIDEO_EXT.has(ext)
}

function waitLoadedMetadata(el: HTMLMediaElement): Promise<void> {
  return new Promise((resolve, reject) => {
    const ok = () => {
      el.removeEventListener('loadedmetadata', ok)
      el.removeEventListener('error', bad)
      resolve()
    }
    const bad = () => {
      el.removeEventListener('loadedmetadata', ok)
      el.removeEventListener('error', bad)
      reject(
        new DOMException(
          'メディアのメタデータを読み込めませんでした。',
          'NotSupportedError',
        ),
      )
    }
    if (el.readyState >= HTMLMediaElement.HAVE_METADATA) {
      resolve()
      return
    }
    el.addEventListener('loadedmetadata', ok)
    el.addEventListener('error', bad)
    el.load()
  })
}

/**
 * MediaElement から再生しながら PCM を取り込み（1x 再生。長い動画はその分時間がかかる）
 */
async function decodeViaMediaElement(
  file: File,
  kind: 'audio' | 'video',
  signal: AbortSignal,
): Promise<AudioBuffer> {
  const url = URL.createObjectURL(file)
  const el =
    kind === 'video'
      ? document.createElement('video')
      : document.createElement('audio')

  el.src = url
  el.preload = 'auto'

  if (kind === 'video') {
    const v = el as HTMLVideoElement
    v.muted = true
    v.playsInline = true
    v.setAttribute('playsinline', '')
    v.setAttribute('webkit-playsinline', '')
    // iOS Safari は DOM に無い <video> の再生を拒否することがある
    v.className =
      'pointer-events-none fixed left-0 top-0 h-px w-px overflow-hidden opacity-0'
    document.body.appendChild(v)
  }

  try {
    await waitLoadedMetadata(el)
    if (signal.aborted) {
      throw new DOMException('Aborted', 'AbortError')
    }

    const duration = el.duration
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new DOMException('動画・音声の長さが取得できません。', 'NotSupportedError')
    }

    const ctx = new AudioContext()
    await ctx.resume()
    if (signal.aborted) {
      await ctx.close().catch(() => {})
      throw new DOMException('Aborted', 'AbortError')
    }

    const sampleRate = ctx.sampleRate
    const source = ctx.createMediaElementSource(el)
    const bufferSize = 4096
    const processor = ctx.createScriptProcessor(bufferSize, 2, 2)
    const chunks: Float32Array[] = []

    const onAbort = () => {
      el.pause()
    }
    signal.addEventListener('abort', onAbort)

    processor.onaudioprocess = (ev) => {
      const input = ev.inputBuffer
      const nCh = input.numberOfChannels
      const len = input.length
      const mono = new Float32Array(len)
      if (nCh >= 2) {
        const l = input.getChannelData(0)
        const r = input.getChannelData(1)
        for (let i = 0; i < len; i++) {
          mono[i] = (l[i]! + r[i]!) * 0.5
        }
      } else {
        mono.set(input.getChannelData(0))
      }
      chunks.push(mono)
    }

    const gain = ctx.createGain()
    gain.gain.value = 0
    source.connect(processor)
    processor.connect(gain)
    gain.connect(ctx.destination)

    el.currentTime = 0

    try {
      await el.play()
    } catch {
      await ctx.close().catch(() => {})
      throw new DOMException(
        'ブラウザが再生を許可しませんでした。ファイルをもう一度選び直すか、別ブラウザをお試しください。',
        'NotAllowedError',
      )
    }

    await new Promise<void>((resolve, reject) => {
      el.onended = () => resolve()
      el.onerror = () => reject(new Error('再生が中断されました。'))
    })

    signal.removeEventListener('abort', onAbort)
    processor.disconnect()
    source.disconnect()
    gain.disconnect()
    await ctx.close().catch(() => {})

    const total = chunks.reduce((a, c) => a + c.length, 0)
    if (total === 0) {
      throw new DOMException(
        '音声データが取得できませんでした（音声トラックがない、またはブラウザが取り込みに対応していない可能性があります）。',
        'NotSupportedError',
      )
    }

    const merged = new Float32Array(total)
    let off = 0
    for (const c of chunks) {
      merged.set(c, off)
      off += c.length
    }

    const outCtx = new AudioContext({ sampleRate })
    try {
      const buf = outCtx.createBuffer(1, merged.length, sampleRate)
      buf.copyToChannel(merged, 0)
      return buf
    } finally {
      await outCtx.close().catch(() => {})
    }
  } finally {
    if (kind === 'video' && el.parentNode) {
      el.parentNode.removeChild(el)
    }
    URL.revokeObjectURL(url)
    el.removeAttribute('src')
    el.load()
  }
}

async function tryDecodeAudioData(
  file: File,
  signal: AbortSignal,
): Promise<AudioBuffer> {
  const raw = await file.arrayBuffer()
  if (signal.aborted) {
    throw new DOMException('Aborted', 'AbortError')
  }
  const copy = raw.slice(0)
  const ctx = new AudioContext()
  await ctx.resume()
  try {
    return await ctx.decodeAudioData(copy)
  } finally {
    await ctx.close().catch(() => {})
  }
}

export function decodeErrorMessage(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === 'NotSupportedError' && err.message) {
      return err.message
    }
    if (err.name === 'EncodingError') {
      return 'このファイルはブラウザでデコードできません（動画コンテナや未対応コーデックの可能性があります）。音声ファイル（例: WAV / MP3）を試してください。'
    }
    if (err.name === 'NotAllowedError') {
      return err.message
    }
    if (err.name === 'AbortError') {
      return '読み込みがキャンセルされました。'
    }
    return err.message || 'デコードに失敗しました。'
  }
  if (err instanceof Error) {
    return err.message
  }
  return 'デコードに失敗しました。'
}

/**
 * 動画・音声ファイルを AudioBuffer に変換
 */
export async function decodeFileToAudioBuffer(
  file: File,
  signal: AbortSignal,
): Promise<AudioBuffer> {
  try {
    return await tryDecodeAudioData(file, signal)
  } catch {
    if (signal.aborted) {
      throw new DOMException('Aborted', 'AbortError')
    }
    const video = isProbablyVideoFile(file)
    if (video) {
      try {
        return await decodeViaMediaElement(file, 'video', signal)
      } catch (e2) {
        try {
          return await decodeViaMediaElement(file, 'audio', signal)
        } catch {
          throw e2
        }
      }
    }
    return await decodeViaMediaElement(file, 'audio', signal)
  }
}
