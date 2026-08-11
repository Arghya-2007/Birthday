'use client'

import React from 'react'

interface SequenceCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}

/**
 * Isolated canvas element for the image sequence.
 * Contains no logic, no state, no effects — just the canvas DOM element.
 * Drawing is handled by the parent via the canvas ref.
 * Keeping this isolated prevents unnecessary React re-renders.
 */
export default function SequenceCanvas({ canvasRef }: SequenceCanvasProps) {
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 10, // matches --z-canvas
        display: 'block',
      }}
    />
  )
}
