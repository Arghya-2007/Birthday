/**
 * Frame URL builder and sequence constants.
 * 
 * Desktop uses real frames from /sequence/frames/ (240 JPG frames, 3-digit padding).
 * Mobile uses generated placeholder frames from /sequence/mobile/ (WebP, 4-digit padding).
 * When real mobile frames arrive, update the mobile path/format here.
 */

export const TOTAL_FRAMES = 240

export const CRITICAL_FRAME_COUNT = 10

export function getFrameUrl(index: number, device: 'desktop' | 'mobile'): string {
  if (device === 'desktop') {
    // Real frames: frame-001.jpg through frame-240.jpg (3-digit padded)
    const padded = String(index).padStart(3, '0')
    return `/sequence/frames/frame-${padded}.jpg`
  }
  // Mobile placeholders: frame-001.jpg through frame-240.jpg (3-digit padded)
  // For now, mobile maps to desktop frames since we have real assets
  const padded = String(index).padStart(3, '0')
  return `/sequence/frames/frame-${padded}.jpg`
}

export function getFrameRange(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}
