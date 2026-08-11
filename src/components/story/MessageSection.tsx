'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSequenceContext } from '../sequence/SequenceContext'

interface MessageSectionProps {
  text: string
  frameStart: number
  frameEnd: number
  totalFrames: number
}

export default function MessageSection({ text, frameStart, frameEnd, totalFrames }: MessageSectionProps) {
  const { containerRef } = useSequenceContext()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([])
  const imageRef = useRef<HTMLImageElement>(null)

  // Split text by newlines (or simple sentence split for now)
  const lines = text.split('\n').filter(Boolean)

  useEffect(() => {
    if (!containerRef.current || !wrapperRef.current) return

    const lineElements = lineRefs.current.filter(Boolean) as HTMLSpanElement[]
    
    // Initial states
    gsap.set(lineElements, { opacity: 0, y: 40, rotationX: 15 })
    gsap.set(rightRef.current, { opacity: 0, x: 40 })
    gsap.set(imageRef.current, { scale: 1.1 })
    gsap.set(leftRef.current, { opacity: 0, x: -30 })

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrapperRef.current!,
        start: `top 80%`,
        end: `bottom 20%`,
        scrub: 1, // Add smooth scrubbing
        animation: gsap.timeline()
          // Animate left container in
          .to(leftRef.current, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }, 0)
          // Animate lines in left container
          .fromTo(
            lineElements,
            { opacity: 0, y: 40, rotationX: 15 },
            {
              opacity: 1,
              y: 0,
              rotationX: 0,
              duration: 0.6,
              stagger: 0.15,
              ease: 'power3.out'
            },
            0.1
          )
          // Animate right container image in
          .to(rightRef.current, { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' }, 0.2)
          .to(imageRef.current, { scale: 1, duration: 0.7, ease: 'power3.out' }, 0.2)
          
          // Hold the animation
          .to(lineElements, { opacity: 1, duration: 0.4 })
          .to(rightRef.current, { opacity: 1, duration: 0.4 }, '<')
          
          // Fade out everything
          .to(lineElements, { opacity: 0, y: -20, duration: 0.4, stagger: 0.05, ease: 'power2.inOut' })
          .to(rightRef.current, { opacity: 0, x: 20, duration: 0.4, ease: 'power2.inOut' }, '<')
          .to(leftRef.current, { opacity: 0, x: -20, duration: 0.4, ease: 'power2.inOut' }, '<')
      })
    }, wrapperRef)

    return () => ctx.revert()
  }, [frameStart, frameEnd, totalFrames, containerRef])

  const top = (frameStart / totalFrames) * 100

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'absolute',
        top: `calc(${top}% + 50vh)`,
        transform: 'translateY(-50%)',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 20,
      }}
    >
      <div className="w-full px-6 md:px-12 lg:px-24 xl:px-32 flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20">
        
        {/* Left Container: Message */}
        <div ref={leftRef} className="text-left w-full max-w-[550px] relative">
          <div className="absolute -top-16 -left-8 md:-left-12 text-8xl text-white/5 font-serif select-none pointer-events-none">&quot;</div>
          <div className="relative z-10">
            {lines.map((line, i) => (
              <span
                key={i}
                ref={(el) => { lineRefs.current[i] = el }}
                className="block font-display font-light text-[#F5F0E8] leading-[1.5] tracking-wide mb-6 [transform-style:preserve-3d]"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 3rem)' }}
              >
                {line}
              </span>
            ))}
          </div>
          <div className="mt-10 h-[1px] w-24 bg-gradient-to-r from-white/40 to-transparent"></div>
        </div>

        {/* Right Container: Image */}
        <div ref={rightRef} className="w-full max-w-[450px] relative flex justify-center md:justify-end">
          <div className="aspect-[4/5] md:aspect-[3/4] w-full overflow-hidden rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative border border-white/10 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 z-10 pointer-events-none mix-blend-overlay"></div>
            
            {/* Elegant Image Placeholder */}
            <Image 
              ref={imageRef}
              src="./images/image-1.jpg" 
              alt="A beautiful memory" 
              fill
              unoptimized
              className="object-cover filter brightness-[0.85] contrast-110 sepia-[0.1]"
            />
          </div>
        </div>

      </div>
    </div>
  )
}
