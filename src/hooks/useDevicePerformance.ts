import { useMemo } from 'react'

export type DeviceTier = 'high' | 'low'

/**
 * Detects device performance tier based on hardware heuristics.
 * Used to decide memory management strategy (frame cache cleanup)
 * and whether to use mobile sequence on wider screens.
 */
export function useDevicePerformance(): DeviceTier {
  return useMemo(() => {
    if (typeof window === 'undefined') return 'high'

    const cores = navigator.hardwareConcurrency ?? 4
    const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 4
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)

    if (cores < 4 || memory < 4 || isMobile) return 'low'
    return 'high'
  }, [])
}
