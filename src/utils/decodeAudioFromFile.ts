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

/** 再生終了を ended / currentTime / タイムアウトのいずれかで検知（iOS で ended だけだと進まないことがある） */
function waitPlaybackEnded(
  el: HTMLMediaElement,
  durationSec: number,
  signal: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let finished = false
    let intervalId = 0
    let timeoutId = 0

    const cleanup = () => {
      if (intervalId) clearInterval(intervalId)
      if (timeoutId) clearTimeout(timeoutId)
      el.removeEventListener('ended', onEnded)
      el.removeEventListener('error', onErr)
      signal.removeEventListener('abort', onAbort)
    }

    const done = () => {
      if (finished) return
      finished = true
      cleanup()
      resolve()
    }

    const fail = (err: Error) => {
      if (finished) return
      finished = true
      try {
        el.pause()
      } catch {
        /* ignore */
      }
      cleanup()
      reject(err)
    }

    const onEnded = () => done()

    const onErr = () => fail(new Error('再生が中断されました。'))

    const onAbort = () =>
      fail(new DOMException('Aborted', 'AbortError'))

    el.addEventListener('ended', onEnded)
    el.addEventListener('error', onErr)
    signal.addEventListener('abort', onAbort)

    intervalId = window.setInterval(() => {
      if (el.ended) {
        done()
        return
      }
      const d = el.duration
      if (Number.isFinite(d) && d > 0 && el.currentTime >= d - 0.08) {
        done()
      }
    }, 40)

    const wallMs = Math.ceil(durationSec * 1000) + 20_000
    timeoutId = window.setTimeout(() => {
      fail(
        new DOMException(
          '再生の完了を確認できませんでした。別の動画形式や短いクリップを試してください。',
          'TimeoutError',
        ),
      )
    }, Math.min(Math.max(wallMs, 45_000), 600_000))
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
    // iOS Safari は muted だと音声トラックを Web Audio に載せないことがある（デコードが終わらない原因になる）
    v.muted = false
    v.volume = 0
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

    await waitPlaybackEnded(el, duration, signal)

    el.pause()
    // 終了直後にまだ ScriptProcessor のバッファが残っていることがある
    await new Promise<void>((r) => setTimeout(r, 200))
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

/** 動画で decodeAudioData が固まるブラウザ向け。成功時は高速、タイムアウト後はメディア経路へ。 */
async function tryDecodeAudioDataWithTimeout(
  file: File,
  signal: AbortSignal,
  timeoutMs: number,
): Promise<AudioBuffer> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new DOMException('decodeAudioData timeout', 'TimeoutError'))
    }, timeoutMs)
  })
  try {
    return await Promise.race([
      tryDecodeAudioData(file, signal),
      timeoutPromise,
    ])
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId)
  }
}

const VIDEO_DECODE_AUDIO_DATA_TIMEOUT_MS = 12_000

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
    if (err.name === 'TimeoutError' && err.message) {
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
 *
 * 動画はデスクトップでは decodeAudioData が速く通ることが多いので先に試す。
 * Safari 等で固まる場合はタイムアウト後にメディア再生経路へフォールバックする。
 */
export async function decodeFileToAudioBuffer(
  file: File,
  signal: AbortSignal,
): Promise<AudioBuffer> {
  if (isProbablyVideoFile(file)) {
    try {
      return await tryDecodeAudioDataWithTimeout(
        file,
        signal,
        VIDEO_DECODE_AUDIO_DATA_TIMEOUT_MS,
      )
    } catch {
      if (signal.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }
      try {
        return await decodeViaMediaElement(file, 'video', signal)
      } catch (eVideo) {
        try {
          return await decodeViaMediaElement(file, 'audio', signal)
        } catch {
          throw eVideo
        }
      }
    }
  }

  try {
    return await tryDecodeAudioData(file, signal)
  } catch {
    if (signal.aborted) {
      throw new DOMException('Aborted', 'AbortError')
    }
    return await decodeViaMediaElement(file, 'audio', signal)
  }
}
