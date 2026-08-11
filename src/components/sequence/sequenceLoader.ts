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
 */
export async function preloadFrameRange(
  startIndex: number,
  endIndex: number,
  device: 'desktop' | 'mobile',
  cache: FrameCache,
  onProgress?: (loaded: number, total: number) => void
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

  await Promise.all(
    indices.map(async (frameIndex) => {
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

/**
 * Release ImageBitmaps that are far from the current frame to manage memory.
 * Keeps frames within [currentFrame - 20, currentFrame + 30] in cache.
 * Only call this on low-performance devices.
 */
export function releaseFramesOutsideWindow(
  cache: FrameCache,
  currentFrame: number,
  windowSize: number = 50
): void {
  const behind = 20
  const ahead = windowSize - behind // 30

  const minKeep = currentFrame - behind
  const maxKeep = currentFrame + ahead

  for (const [index, bitmap] of cache) {
    if (index < minKeep || index > maxKeep) {
      bitmap.close()
      cache.delete(index)
    }
  }
}
