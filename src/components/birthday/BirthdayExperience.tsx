'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import BirthdayUI from './BirthdayUI'

export default function BirthdayExperience() {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return

    // Setup the ScrollTrigger for the curtain up transition
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%', // Start animation when the top of the section is 80% down the viewport
          once: true,
        }
      })
      
      // Initial state setup is handled in CSS/tailwind if possible, but GSAP set is safer
      gsap.set(containerRef.current, { y: 200, opacity: 0, borderRadius: '40px 40px 0 0' })
      gsap.set(contentRef.current, { opacity: 0, y: 50 })

      // Curtain up transition
      tl.to(containerRef.current, { 
        y: 0, 
        opacity: 1,
        borderRadius: '0px 0px 0 0', 
        duration: 1.2, 
        ease: 'power3.out' 
      })
      
      // Content fade up
      tl.to(contentRef.current, {
        opacity: 1, 
        y: 0, 
        duration: 1, 
        ease: 'power3.out' 
      }, "-=0.4")
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative z-20 w-full min-h-screen text-white overflow-hidden"
      style={{
        // Premium radial gradient background perfect for a birthday theme
        background: 'radial-gradient(circle at 50% 0%, #2b1055 0%, #05010a 100%)',
      }}
    >
      {/* Decorative ambient lighting / particles */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div ref={contentRef} className="relative z-10 w-full min-h-screen flex items-center justify-center">
        <BirthdayUI />
      </div>
    </div>
  )
}
