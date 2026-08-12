'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'
import { useSequenceContext } from '../sequence/SequenceContext'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, TextPlugin)
}

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
  const quoteRef = useRef<HTMLDivElement>(null)

  // Split text by newlines (or simple sentence split for now)
  const lines = text.split('\n').filter(Boolean)

  useEffect(() => {
    if (!containerRef.current || !wrapperRef.current) return

    const lineElements = lineRefs.current.filter(Boolean) as HTMLSpanElement[]
    
    // Initial states
    gsap.set(rightRef.current, { opacity: 0, x: 40 })
    gsap.set(imageRef.current, { scale: 1.1 })
    gsap.set(leftRef.current, { opacity: 0, x: -30 })
    gsap.set(quoteRef.current, { opacity: 0, scale: 0.5, rotation: -20 })

    const ctx = gsap.context(() => {
      // 1. Scrubbed timeline for container animations
      ScrollTrigger.create({
        trigger: wrapperRef.current!,
        start: `top 80%`,
        end: `bottom 20%`,
        scrub: 1.5, // Smooth scrubbing
        animation: gsap.timeline()
          // Animate containers in
          .to(leftRef.current, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }, 0)
          .to(quoteRef.current, { opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.5)' }, 0.1)
          .to(rightRef.current, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }, 0.2)
          .to(imageRef.current, { scale: 1, duration: 0.8, ease: 'power3.out' }, 0.2)
          
          // Hold the animation
          .to(leftRef.current, { opacity: 1, duration: 0.4 })
          .to(rightRef.current, { opacity: 1, duration: 0.4 }, '<')
          
          // Fade out everything smoothly
          .to(rightRef.current, { opacity: 0, x: 20, duration: 0.5, ease: 'power2.inOut' })
          .to(leftRef.current, { opacity: 0, x: -20, duration: 0.5, ease: 'power2.inOut' }, '<0.1')
      })

      // 2. Play-on-view timeline for Typewriter effect (Premium & Elegant)
      // Clear text initially
      lineElements.forEach(el => {
        if (el) el.innerHTML = '';
      });

      const typeWriterTl = gsap.timeline();
      lineElements.forEach((el, i) => {
        typeWriterTl.to(el, {
          duration: 1.5, // Slower for elegance
          text: {
            value: lines[i],
            delimiter: "" 
          },
          ease: "none"
        }, i * 0.8); // stagger of 0.8
      });

      ScrollTrigger.create({
        trigger: wrapperRef.current!,
        start: `top 65%`, // Start typing when it's nicely in view
        toggleActions: 'play reverse play reverse', 
        animation: typeWriterTl
      })
    }, wrapperRef)

    return () => ctx.revert()
  }, [frameStart, frameEnd, totalFrames, containerRef, lines])

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
          <div ref={quoteRef} className="absolute -top-16 -left-8 md:-left-12 text-8xl text-white/10 font-serif select-none pointer-events-none drop-shadow-2xl">
            &quot;
          </div>
          <div className="relative z-10">
            {lines.map((line, i) => (
              <div key={i} className="relative mb-6">
                {/* Ghost element to maintain layout height while typing */}
                <span
                  className="block font-display font-light leading-[1.5] tracking-wide opacity-0 pointer-events-none select-none"
                  style={{ fontSize: 'clamp(1.5rem, 3vw, 3rem)' }}
                  aria-hidden="true"
                >
                  {line}
                </span>
                
                {/* Typewriter element */}
                <span
                  ref={(el) => { lineRefs.current[i] = el }}
                  className="absolute top-0 left-0 block font-display font-light text-[#F5F0E8] leading-[1.5] tracking-wide"
                  style={{ 
                    fontSize: 'clamp(1.5rem, 3vw, 3rem)',
                    textShadow: '0 4px 20px rgba(255,255,255,0.1)'
                  }}
                >
                  {/* GSAP TextPlugin will insert text here */}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-10 h-[1px] w-24 bg-gradient-to-r from-white/40 to-transparent"></div>
        </div>

        {/* Right Container: Image */}
        <div ref={rightRef} className="w-full max-w-[450px] relative flex justify-center md:justify-end">
          <div className="aspect-[4/5] md:aspect-[3/4] w-full overflow-hidden rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative border border-white/10 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-white/10 z-10 pointer-events-none mix-blend-overlay"></div>
            
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
