'use client'

import { useEffect, useRef } from 'react'
import gsap from '@/animations/gsap'
import { ScrollTrigger } from '@/animations/gsap'
import SequenceCanvas from './SequenceCanvas'
import { useImageSequence } from '@/hooks/useImageSequence'
import { SequenceContext } from './SequenceContext'

interface ImageSequenceProps {
  totalFrames: number
  children?: React.ReactNode
  onSequenceComplete?: () => void
}

/**
 * Scroll-controlled image sequence component.
 * 
 * - Renders a tall scroll container creating scrollable height
 * - Renders the pinned SequenceCanvas
 * - Uses GSAP ScrollTrigger to map scroll progress → frame index
 * - Calls drawFrame on every scroll tick (via ScrollTrigger onUpdate)
 * - Story overlays injected as children (Phase 5)
 */
export default function ImageSequence({
  totalFrames,
  children,
  onSequenceComplete,
}: ImageSequenceProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const currentFrameRef = useRef<number>(0)

  const { canvasRef, isReady, drawFrame } = useImageSequence({
    totalFrames,
    onReady: () => {
      // Draw frame 1 as soon as critical frames are ready
      drawFrame(1)
    },
  })

  // GSAP ScrollTrigger: map scroll → frame index
  useEffect(() => {
    if (!isReady) return
    if (!containerRef.current || !canvasRef.current) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const frameIndex = Math.min(
            Math.floor(self.progress * totalFrames) + 1,
            totalFrames
          )
          if (frameIndex !== currentFrameRef.current) {
            currentFrameRef.current = frameIndex
            drawFrame(frameIndex)
          }
        },
        onLeave: () => {
          onSequenceComplete?.()
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [isReady, totalFrames, drawFrame, onSequenceComplete, canvasRef])

  // Scroll height: 35px per frame creates the scroll distance
  // For 240 frames: 8400px total scroll distance
  const scrollHeight = totalFrames * 35

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        height: `${scrollHeight}px`,
      }}
    >
      <SequenceCanvas canvasRef={canvasRef} />

      {/* Story overlay slot — used in Phase 5 */}
      <div
        style={{
          position: 'relative',
          zIndex: 20, // matches --z-overlay
          height: '100%',
        }}
      >
        <SequenceContext.Provider value={{ containerRef, totalFrames }}>
          {children}
        </SequenceContext.Provider>
      </div>
    </div>
  )
}
