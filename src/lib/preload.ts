import { TOTAL_FRAMES, CRITICAL_FRAME_COUNT } from './assets'
import {
  globalFrameCache,
  preloadFrameRange,
} from '@/components/sequence/sequenceLoader'

export function detectDevice(): 'desktop' | 'mobile' {
  if (typeof window === 'undefined') return 'desktop'
  return window.innerWidth < 768 ? 'mobile' : 'desktop'
}

/**
 * Preload critical assets during the loading screen.
 * 
 * Only loads the first batch of critical frames (not all 240) to keep
 * initial memory low. The sequence engine will progressively load
 * additional frames as the user scrolls.
 */
export async function preloadCriticalAssets(
  onProgress: (percent: number) => void
): Promise<void> {
  const device = detectDevice()

  // Only preload the first CRITICAL_FRAME_COUNT frames + a few key
  // frames spread across the sequence for snappy initial scrub.
  // The rest are loaded on-demand by the sequence engine.
  const criticalEnd = Math.min(CRITICAL_FRAME_COUNT, TOTAL_FRAMES)

  // Key frames at 25%, 50%, 75% for instant visual feedback on fast scroll
  const keyFrames = [
    Math.round(TOTAL_FRAMES * 0.25),
    Math.round(TOTAL_FRAMES * 0.5),
    Math.round(TOTAL_FRAMES * 0.75),
    TOTAL_FRAMES,
  ]

  // Total items to track for progress
  const totalItems = criticalEnd + keyFrames.length + 1 // +1 for 3D model
  let loadedItems = 0

  await Promise.all([
    // Load critical opening frames
    preloadFrameRange(
      1,
      criticalEnd,
      device,
      globalFrameCache,
      (loaded) => {
        loadedItems = loaded
        onProgress((loadedItems / totalItems) * 100)
      }
    ),

    // Load key frames for fast-scroll visual feedback
    ...keyFrames.map(async (frameIndex) => {
      if (globalFrameCache.has(frameIndex)) {
        loadedItems++
        onProgress((loadedItems / totalItems) * 100)
        return
      }
      const { loadFrame } = await import('@/components/sequence/sequenceLoader')
      const { getFrameUrl } = await import('./assets')
      const url = getFrameUrl(frameIndex, device)
      const bitmap = await loadFrame(url)
      if (bitmap) {
        globalFrameCache.set(frameIndex, bitmap)
      }
      loadedItems++
      onProgress((loadedItems / totalItems) * 100)
    }),

    // Pre-fetch the 3D model during the loading screen so it's instantly available
    fetch('/models/cake-compressed.glb', { priority: 'high' as RequestPriority })
      .catch(() => {})
      .finally(() => {
        loadedItems++
        onProgress((loadedItems / totalItems) * 100)
      }),
  ])
}
