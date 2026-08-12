import { TOTAL_FRAMES } from './assets'
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

  // Preload all frames for perfectly smooth rendering
  const totalItems = TOTAL_FRAMES + 2 // +1 for 3D model, +1 for audio
  let framesLoaded = 0
  let modelLoaded = 0
  let audioLoaded = 0

  await Promise.all([
    // Load all opening frames
    preloadFrameRange(
      1,
      TOTAL_FRAMES,
      device,
      globalFrameCache,
      (loaded) => {
        framesLoaded = loaded
        onProgress(((framesLoaded + modelLoaded + audioLoaded) / totalItems) * 100)
      }
    ),

    // Pre-fetch the 3D model during the loading screen so it's instantly available
    fetch('/models/cake-compressed.glb', { priority: 'high' as RequestPriority })
      .catch(() => { })
      .finally(() => {
        modelLoaded = 1
        onProgress(((framesLoaded + modelLoaded + audioLoaded) / totalItems) * 100)
      }),

    fetch('/audio/bg-music.mp3', { priority: 'high' as RequestPriority })
      .catch(() => { })
      .finally(() => {
        audioLoaded = 1
        onProgress(((framesLoaded + modelLoaded + audioLoaded) / totalItems) * 100)
      })
  ])
}
