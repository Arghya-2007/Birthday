import { getFrameUrl } from '@/lib/assets'

export type FrameCache = Map<number, ImageBitmap>

/**
 * Global singleton frame cache shared between preloader and sequence engine.
 * Frames loaded during the loading screen are immediately available
 * when the sequence component mounts.
 */
export const globalFrameCache: FrameCache = new Map()

/**
 * Load a single frame from URL and convert to GPU-ready ImageBitmap.
 * Returns null on failure — never throws.
 */
export async function loadFrame(url: string): Promise<ImageBitmap | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const blob = await response.blob()
    return await createImageBitmap(blob)
  } catch {
    return null
  }
}

/**
 * Preload a range of frames concurrently.
 * Skips frames already in cache. Stores each loaded ImageBitmap in the cache.
 * Calls onProgress after each frame loads (loaded count, total in range).
 *
 * Uses a concurrency limit to avoid saturating the network and memory
 * when loading many frames at once.
 */
export async function preloadFrameRange(
  startIndex: number,
  endIndex: number,
  device: 'desktop' | 'mobile',
  cache: FrameCache,
  onProgress?: (loaded: number, total: number) => void,
  concurrency: number = 6
): Promise<void> {
  const indices: number[] = []
  for (let i = startIndex; i <= endIndex; i++) {
    if (!cache.has(i)) {
      indices.push(i)
    }
  }

  const total = indices.length
  if (total === 0) {
    onProgress?.(0, 0)
    return
  }

  let loaded = 0

  // Load with concurrency limit to avoid overwhelming memory
  for (let i = 0; i < indices.length; i += concurrency) {
    const batch = indices.slice(i, i + concurrency)
    await Promise.all(
      batch.map(async (frameIndex) => {
        const url = getFrameUrl(frameIndex, device)
        const bitmap = await loadFrame(url)
        if (bitmap) {
          cache.set(frameIndex, bitmap)
        }
        loaded++
        onProgress?.(loaded, total)
      })
    )
  }
}

/**
 * Release ImageBitmaps that are far from the current frame to manage memory.
 *
 * @param cache        The frame cache to evict from
 * @param currentFrame The frame the user is currently viewing
 * @param behind       Number of frames to keep behind the current frame
 * @param ahead        Number of frames to keep ahead of the current frame
 */
export function releaseFramesOutsideWindow(
  cache: FrameCache,
  currentFrame: number,
  behind: number = 20,
  ahead: number = 30
): void {
  const minKeep = currentFrame - behind
  const maxKeep = currentFrame + ahead

  for (const [index, bitmap] of cache) {
    if (index < minKeep || index > maxKeep) {
      bitmap.close()
      cache.delete(index)
    }
  }
}

/**
 * Dispose all frames in the cache, closing each ImageBitmap.
 * Call this on component unmount to free GPU memory.
 */
export function disposeCache(cache: FrameCache): void {
  for (const [, bitmap] of cache) {
    bitmap.close()
  }
  cache.clear()
}

/**
 * Preload frames ahead of the current position in the background.
 * Returns an AbortController so the caller can cancel if needed.
 */
export function preloadAhead(
  currentFrame: number,
  totalFrames: number,
  device: 'desktop' | 'mobile',
  cache: FrameCache,
  ahead: number = 30
): AbortController {
  const controller = new AbortController()

  const start = currentFrame + 1
  const end = Math.min(currentFrame + ahead, totalFrames)

  // Fire and forget — load in background with low concurrency
  ;(async () => {
    for (let i = start; i <= end; i++) {
      if (controller.signal.aborted) break
      if (cache.has(i)) continue
      const url = getFrameUrl(i, device)
      const bitmap = await loadFrame(url)
      if (bitmap && !controller.signal.aborted) {
        cache.set(i, bitmap)
      }
    }
  })()

  return controller
}
