'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useSequenceContext } from '../sequence/SequenceContext'
import { createTraitReveal } from '@/animations/storyAnimations'

interface TraitsDisplayProps {
  traits: string[]
  devReference: string
  frameStart: number
  frameEnd: number
  totalFrames: number
}

export default function TraitsDisplay({ traits, devReference, frameStart, frameEnd, totalFrames }: TraitsDisplayProps) {
  const { containerRef } = useSequenceContext()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const traitRefs = useRef<(HTMLLIElement | null)[]>([])
  const devRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (!containerRef.current || !wrapperRef.current || !labelRef.current || !descRef.current || !devRef.current) return

    // Filter out nulls in case of odd lengths
    const traitElements = traitRefs.current.filter(Boolean) as HTMLLIElement[]
    
    // label, desc, and devRef need to be included in elements animated.
    const allElements = [labelRef.current, descRef.current, ...traitElements, devRef.current]

    gsap.set(allElements, { opacity: 0, y: 30 })

    const ctx = gsap.context(() => {
      createTraitReveal(
        wrapperRef.current!,
        allElements
      )
    }, wrapperRef)

    return () => ctx.revert()
  }, [traits, frameStart, frameEnd, totalFrames, containerRef])

  const top = (frameStart / totalFrames) * 100

  const half = Math.ceil(traits.length / 2)
  const leftTraits = traits.slice(0, half)
  const rightTraits = traits.slice(half)

  // Organic staggering offsets to create a floating/poetic feel
  const leftOffsets = [0, -20, 10, -30, 15, -10, 20, -15]
  const rightOffsets = [15, -10, 25, 0, 20, -20, 10, -30]

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'absolute',
        top: `calc(${top}% + 50vh)`,
        transform: 'translateY(-50%)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 20, // var(--z-overlay)
      }}
    >
      <div className="flex flex-col items-center mb-[var(--space-xl)] max-w-2xl px-6 text-center">
        <span
          ref={labelRef}
          className="font-body text-[0.7rem] uppercase tracking-[0.4em] text-[#C9A96E] mb-[var(--space-md)] drop-shadow-md"
        >
          What makes her remarkable
        </span>
        <p 
          ref={descRef}
          className="font-body text-[1rem] md:text-[1.2rem] leading-[1.8] text-[#F5F0E8]/90 font-light drop-shadow-md"
        >
          A rare blend of grace and fire. Every little detail and grand gesture that beautifully shapes the incredible person you are.
        </p>
      </div>

      {/* Increased gap significantly to frame the cake perfectly */}
      <div className="flex w-full max-w-[95vw] md:max-w-[85vw] lg:max-w-[75vw] mx-auto px-4 gap-8 md:gap-[25vw] mb-[var(--space-xl)]">
        {/* Left Column */}
        <div className="flex-1 flex flex-col items-end text-right justify-center">
          <ul className="flex flex-col gap-6 md:gap-10 w-full">
            {leftTraits.map((trait, i) => {
              const isItalic = i % 2 !== 0
              const offset = leftOffsets[i % leftOffsets.length]
              return (
                <li
                  key={`left-${trait}`}
                  ref={(el) => { traitRefs.current[i * 2] = el }}
                  className={`font-display text-[#F5F0E8] w-full drop-shadow-xl ${isItalic ? 'italic font-light text-[#C9A96E]' : 'font-extralight'}`}
                  style={{ 
                    fontSize: 'clamp(2rem, 3.5vw, 4.25rem)', 
                    lineHeight: '1',
                    transform: `translateX(${offset}px)`
                  }}
                >
                  {trait}
                </li>
              )
            })}
          </ul>
        </div>

        {/* Right Column */}
        <div className="flex-1 flex flex-col items-start text-left justify-center">
          <ul className="flex flex-col gap-6 md:gap-10 w-full">
            {rightTraits.map((trait, i) => {
              const isItalic = i % 2 === 0 // Alternate differently from left for organic feel
              const offset = rightOffsets[i % rightOffsets.length]
              return (
                <li
                  key={`right-${trait}`}
                  ref={(el) => { traitRefs.current[i * 2 + 1] = el }}
                  className={`font-display text-[#F5F0E8] w-full drop-shadow-xl ${isItalic ? 'italic font-light text-[#C9A96E]' : 'font-extralight'}`}
                  style={{ 
                    fontSize: 'clamp(2rem, 3.5vw, 4.25rem)', 
                    lineHeight: '1',
                    transform: `translateX(${offset}px)`
                  }}
                >
                  {trait}
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <p
        ref={devRef}
        className="font-body text-[0.85rem] text-[#9A9490]/60 italic mt-[var(--space-md)] drop-shadow-sm"
      >
        {devReference}
      </p>
    </div>
  )
}
