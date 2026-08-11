'use client'

import React, { useContext } from 'react'

export const SequenceContext = React.createContext<{
  containerRef: React.RefObject<HTMLElement | null>
  totalFrames: number
} | null>(null)

export function useSequenceContext() {
  const ctx = useContext(SequenceContext)
  if (!ctx) throw new Error('useSequenceContext must be used inside ImageSequence')
  return ctx
}
