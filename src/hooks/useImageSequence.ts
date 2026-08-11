'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

import { drawFrameToCanvas } from '@/lib/utils'
import { detectDevice } from '@/lib/preload'
import { useDevicePerformance } from '@/hooks/useDevicePerformance'
import {
  globalFrameCache,
  preloadFrameRange,
  releaseFramesOutsideWindow,
} from '@/components/sequence/sequenceLoader'

interface UseImageSequenceOptions {
  totalFrames: number
  onReady?: () => void
}

interface UseImageSequenceReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  isReady: boolean
  loadedCount: number
  drawFrame: (index: number) => void
}

/**
 * Manages the image sequence engine:
 * - Frame cache (ref, not state)
 * - Current frame index (ref, not state)
 * - Progressive loading (critical frames first, then background)
 * - Canvas sizing (devicePixelRatio for sharp rendering)
 * - Memory management on low-tier devices
 */
export function useImageSequence({
  totalFrames,
  onReady,
}: UseImageSequenceOptions): UseImageSequenceReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const currentFrameRef = useRef<number>(0)
  const cacheRef = useRef(globalFrameCache)
  const deviceRef = useRef<'desktop' | 'mobile'>('desktop')

  const [isReady, setIsReady] = useState(false)
  const [loadedCount, setLoadedCount] = useState(0)

  const deviceTier = useDevicePerformance()

  /**
   * Set canvas dimensions to match viewport at device pixel ratio.
   */
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
  }, [])

  /**
   * Draw a specific frame index to the canvas.
   * If the exact frame isn't cached, draws the nearest available frame.
   * Uses ref — never triggers React re-render.
   */
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cache = cacheRef.current

    // Try exact frame first
    let frame = cache.get(index)

    // If not available, find nearest cached frame
    if (!frame) {
      let nearest: ImageBitmap | undefined
      let minDistance = Infinity

      for (const [cachedIndex, bitmap] of cache) {
        const distance = Math.abs(cachedIndex - index)
        if (distance < minDistance) {
          minDistance = distance
          nearest = bitmap
        }
      }

      if (nearest) {
        frame = nearest
      }
    }

    if (frame) {
      drawFrameToCanvas(ctx, frame, canvas.width, canvas.height)
    }

    // Memory management on low-tier devices
    if (deviceTier === 'low') {
      releaseFramesOutsideWindow(cache, index)
    }
  }, [deviceTier])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const device = detectDevice()
    deviceRef.current = device

    // Set initial canvas size
    updateCanvasSize()

    const cache = cacheRef.current
    let cancelled = false

    async function loadSequence() {
      // Load all frames (these are usually already loaded by the LoadingScreen preloader)
      await preloadFrameRange(1, totalFrames, device, cache, () => {
        if (!cancelled) {
          setLoadedCount(cache.size)
        }
      })

      if (cancelled) return

      // Frames ready — mark as ready, draw frame 1
      setIsReady(true)
      onReady?.()
      drawFrame(1)
    }

    loadSequence()

    // Handle resize: update canvas dimensions and redraw current frame
    let resizeTimeout: ReturnType<typeof setTimeout>
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        updateCanvasSize()
        if (currentFrameRef.current > 0) {
          drawFrame(currentFrameRef.current)
        }
      }, 100) // 100ms debounce
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelled = true
      clearTimeout(resizeTimeout)
      window.removeEventListener('resize', handleResize)

      // Cleanup: close all ImageBitmaps and clear cache
      for (const [, bitmap] of cache) {
        bitmap.close()
      }
      cache.clear()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalFrames])

  return {
    canvasRef,
    isReady,
    loadedCount,
    drawFrame,
  }
}
