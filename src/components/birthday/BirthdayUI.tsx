'use client'

import { Canvas } from '@react-three/fiber'
import { Environment, Sparkles } from '@react-three/drei'
import { CakeModel } from './CakeModel'
import { Suspense, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'

export default function BirthdayUI() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [animationDone, setAnimationDone] = useState(false)
  // Refs for GSAP animations
  const titleRef = useRef<HTMLHeadingElement>(null)
  const cardLeftRef = useRef<HTMLDivElement>(null)
  const cardRightRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const textRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect() // Only trigger once
        }
      },
      { threshold: 0.3 } // Trigger when 30% of the component is visible
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (isVisible) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // Title reveal: Premium cinematic 3D reveal with blur, zoom, and rotation
      tl.fromTo(titleRef.current,
        {
          y: 100,
          opacity: 0,
          scale: 1.25,
          rotationX: 45,
          transformPerspective: 1000,
          filter: 'blur(15px)'
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotationX: 0,
          filter: 'blur(0px)',
          duration: 3,
          delay: 0.2,
          ease: 'expo.out'
        }
      )

      // Cards reveal: slide up from below
      tl.fromTo([cardLeftRef.current, cardRightRef.current, buttonRef.current],
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5 },
        "-=1.2" // Overlap heavily with title animation
      )

      // Text inside card: elegant staggered fade up
      tl.fromTo(textRefs.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.15 },
        "-=0.8"
      )
    }
  }, [isVisible])

  return (
    <div ref={containerRef} className="relative w-full h-screen flex flex-col items-center justify-between py-6 md:py-10 overflow-hidden bg-gradient-to-b from-[#05020a] via-[#0f051a] to-[#05020a]">

      {/* Premium Cinematic Vignette & Grain */}
      <div className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay opacity-30 bg-[url('/noise.png')] bg-repeat"></div>
      <div className="absolute inset-0 pointer-events-none z-20 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)]"></div>

      {/* Animated Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[radial-gradient(circle,rgba(147,51,234,0.3)_0%,transparent_70%)] rounded-full animate-pulse pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[radial-gradient(circle,rgba(219,39,119,0.3)_0%,transparent_70%)] rounded-full animate-pulse pointer-events-none z-0" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-[radial-gradient(circle,rgba(245,158,11,0.15)_0%,transparent_70%)] rounded-full pointer-events-none z-0"></div>

      {/* 3D Canvas Interactive Area */}
      <div className="absolute inset-0 z-10 h-100vh w-screen" style={{ touchAction: 'none' }}>
        <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 1.5]}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <Suspense fallback={null}>
            <Environment preset="city" />
            <CakeModel playAnimation={isVisible} onAnimationComplete={() => setAnimationDone(true)} />

            {/* Base ambient sparkles */}
            <Sparkles count={150} scale={14} size={1.5} speed={0.3} opacity={0.4} color="#f0abfc" />

            {/* Premium magical burst sparkles when animation finishes */}
            {animationDone && (
              <>
                <Sparkles count={250} scale={18} size={2.5} speed={0.7} opacity={0.8} color="#ffd700" noise={0.2} />
                <Sparkles count={150} scale={12} size={3} speed={1.2} opacity={0.6} color="#ffb6c1" noise={0.5} />
              </>
            )}
          </Suspense>
        </Canvas>
      </div>

      {/* Foreground UI - Top */}
      <div className="z-10 flex flex-col items-center text-center px-4 pointer-events-none w-full mt-2 md:mt-8">
        <h1
          ref={titleRef}
          className="text-7xl md:text-8xl lg:text-[10rem] font-serif font-light tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-[#FFF7D6] via-[#D4AF37] to-[#AA7C11] drop-shadow-[0_0_50px_rgba(212,175,55,0.6)] opacity-0 py-4 px-4 leading-tight"
          style={{ transformStyle: 'preserve-3d' }}
        >
          Happy Birthday
        </h1>
      </div>

      {/* Foreground UI - Bottom */}
      <div className="z-10 flex flex-row justify-between items-end px-4 md:px-12 pointer-events-none w-full mt-auto mb-6 md:mb-12 relative">

        {/* Bottom Center Button */}
        <div className="absolute left-1/2 -bottom-15 md:-bottom-20 -translate-x-1/2 pointer-events-auto z-20">
          <button
            ref={buttonRef}
            onClick={() => {
              if (buttonRef.current) buttonRef.current.style.pointerEvents = 'none';

              const overlay = document.createElement('div');
              overlay.className = 'fixed inset-0 z-[9999] pointer-events-none bg-[#030106]';
              overlay.style.transform = 'translateY(100%)';
              document.body.appendChild(overlay);

              gsap.to(overlay, {
                y: '0%',
                duration: 1,
                ease: 'expo.inOut',
                onComplete: () => {
                  router.push('/cta');
                  
                  setTimeout(() => {
                    gsap.to(overlay, {
                      y: '-100%',
                      duration: 1,
                      ease: 'expo.inOut',
                      onComplete: () => {
                        if (document.body.contains(overlay)) {
                          document.body.removeChild(overlay);
                        }
                      }
                    });
                  }, 400);
                }
              });
            }}
            className="px-6 py-3 md:px-8 md:py-3.5 bg-gradient-to-r from-purple-500/60 to-pink-500/20 hover:from-purple-500/80 hover:to-pink-500/80 backdrop-blur-xl border border-white/20 rounded-full text-white/95 font-medium tracking-[0.15em] uppercase text-xs md:text-sm transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(219,39,119,0.3)] opacity-0 shadow-[0_0_20px_rgba(0,0,0,0.5)] whitespace-nowrap"
          >
            Continue Journey
          </button>
        </div>

        {/* Left Side Container */}
        <div
          ref={cardLeftRef}
          className="relative overflow-hidden bg-white/5 backdrop-blur-2xl p-6 md:p-10 rounded-[2rem] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] opacity-0 w-full max-w-[48%] md:max-w-sm text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none opacity-50"></div>
          <div className="relative flex flex-col items-start">
            <span
              ref={el => { textRefs.current[0] = el }}
              className="text-[10px] md:text-sm font-semibold tracking-[0.2em] uppercase text-pink-300/80 mb-3 opacity-0"
            >
              A Special Day
            </span>
            <p
              ref={el => { textRefs.current[1] = el }}
              className="text-lg md:text-3xl text-white/95 font-light leading-snug font-serif opacity-0"
            >
              The best is yet to come.
            </p>
          </div>
        </div>

        {/* Right Side Container */}
        <div
          ref={cardRightRef}
          className="relative overflow-hidden bg-white/5 backdrop-blur-2xl p-6 md:p-10 rounded-[2rem] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] opacity-0 w-full max-w-[48%] md:max-w-sm text-right"
        >
          <div className="absolute inset-0 bg-gradient-to-bl from-white/10 to-transparent pointer-events-none opacity-50"></div>
          <div className="relative flex flex-col items-end">
            <span
              ref={el => { textRefs.current[2] = el }}
              className="text-[10px] md:text-sm font-semibold tracking-[0.2em] uppercase text-indigo-300/80 mb-3 opacity-0"
            >
              Endless Joy
            </span>
            <p
              ref={el => { textRefs.current[3] = el }}
              className="text-xs md:text-base text-purple-200/90 font-light leading-relaxed opacity-0"
            >
              Welcome to a year of endless possibilities, boundless joy, and beautiful moments. Let every day be a celebration.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
