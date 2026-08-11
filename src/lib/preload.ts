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
 * Uses the same globalFrameCache and preloadFrameRange from sequenceLoader
 * so that frames loaded here are immediately available to the ImageSequence.
 */
export async function preloadCriticalAssets(
  onProgress: (percent: number) => void
): Promise<void> {
  const device = detectDevice()

  await Promise.all([
    preloadFrameRange(
      1,
      TOTAL_FRAMES,
      device,
      globalFrameCache,
      (loaded, total) => {
        // Map loaded/total to a 0-100 percentage
        const percent = total > 0 ? (loaded / total) * 100 : 100
        onProgress(percent)
      }
    ),
    // Pre-fetch the 3D model during the loading screen so it's instantly available
    fetch('/models/cake-compressed.glb', { priority: 'high' }).catch(() => {})
  ])
}
