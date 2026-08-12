'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { playBackgroundAudio } from '@/lib/audio'

export default function CTAUI() {  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const topHeadingRef = useRef<HTMLHeadingElement>(null)
  const topSubHeadingRef = useRef<HTMLHeadingElement>(null)
  
  const leftCardWrapRef = useRef<HTMLDivElement>(null)
  const leftContentRef = useRef<HTMLDivElement>(null)
  const rightContentRef = useRef<HTMLDivElement>(null)
  
  const footerTextRef = useRef<HTMLDivElement>(null)
  const orbsRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const cleanup = playBackgroundAudio();

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

    // Ambient floating orbs
    if (orbsRef.current) {
      const orbs = orbsRef.current.children
      gsap.to(orbs, {
        y: 'random(-40, 40)',
        x: 'random(-40, 40)',
        rotation: 'random(-25, 25)',
        scale: 'random(0.9, 1.1)',
        duration: 'random(4, 7)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.3
      })
    }

    // Particles animation
    if (particlesRef.current) {
      const particles = particlesRef.current.children
      gsap.set(particles, {
        x: () => Math.random() * window.innerWidth,
        y: () => Math.random() * window.innerHeight,
        opacity: 0
      })
      gsap.to(particles, {
        y: '-=100',
        x: 'random(-50, 50)',
        opacity: 'random(0.2, 0.8)',
        duration: 'random(3, 8)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: {
          each: 0.1,
          from: 'random'
        }
      })
    }

    // Main entrance animations
    tl.fromTo([topHeadingRef.current, topSubHeadingRef.current],
      { y: 60, opacity: 0, filter: 'blur(15px)', scale: 0.9 },
      { y: 0, opacity: 1, filter: 'blur(0px)', scale: 1, duration: 1.5, stagger: 0.2 }
    )

    tl.fromTo(leftCardWrapRef.current,
      { x: -80, opacity: 0, filter: 'blur(15px)', rotationY: -15 },
      { x: 0, opacity: 1, filter: 'blur(0px)', rotationY: 0, duration: 1.5, ease: 'back.out(1.2)' },
      "-=1.0"
    )
    
    tl.fromTo(rightContentRef.current,
      { x: 80, opacity: 0, filter: 'blur(15px)' },
      { x: 0, opacity: 1, filter: 'blur(0px)', duration: 1.5, ease: 'back.out(1.2)' },
      "-=1.2"
    )

    tl.fromTo(footerTextRef.current,
      { y: 100, opacity: 0, scale: 0.8 },
      { y: 0, opacity: 1, scale: 1, duration: 2, ease: 'expo.out' }, 
      "-=1.0"
    )

    return () => {
      cleanup?.();
    }
  }, [])

  // Parallax effect on the left card
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!leftContentRef.current) return
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - left - width / 2) / (width / 2) // -1 to 1
    const y = (e.clientY - top - height / 2) / (height / 2)
    
    gsap.to(leftContentRef.current, {
      rotateX: -y * 8,
      rotateY: x * 8,
      translateZ: 20,
      duration: 0.5,
      ease: 'power2.out'
    })
  }

  const handleCardMouseLeave = () => {
    if (!leftContentRef.current) return
    gsap.to(leftContentRef.current, {
      rotateX: 0,
      rotateY: 0,
      translateZ: 0,
      duration: 0.7,
      ease: 'elastic.out(1, 0.3)'
    })
  }

  // Magnetic button effect
  const handleButtonMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect()
    const x = (e.clientX - (left + width / 2)) * 0.3
    const y = (e.clientY - (top + height / 2)) * 0.3
    
    gsap.to(buttonRef.current, {
      x, y,
      duration: 0.4,
      ease: 'power2.out'
    })
  }

  const handleButtonMouseLeave = () => {
    if (!buttonRef.current) return
    gsap.to(buttonRef.current, {
      x: 0, y: 0,
      duration: 0.7,
      ease: 'elastic.out(1, 0.3)'
    })
  }

  const handleWhatsapp = () => {
    const message = encodeURIComponent("Hi there! I'd love to buy you a coffee ☕")
    window.open(`https://wa.me/919679812235?text=${message}`, '_blank')
  }

  // Generate some particles
  const particles = Array.from({ length: 30 })

  return (
    <div ref={containerRef} className="relative w-full min-h-screen flex flex-col justify-between items-center overflow-hidden bg-[#030106] font-sans selection:bg-amber-500/30">
      
      {/* Dynamic Animated Background Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0514] via-[#16082d] to-[#05020a]"></div>
        
        {/* Animated Orbs */}
        <div ref={orbsRef} className="absolute inset-0 opacity-60 mix-blend-screen overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-[radial-gradient(circle,rgba(112,26,204,0.3)_0%,transparent_70%)] rounded-full blur-[80px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[radial-gradient(circle,rgba(219,39,119,0.2)_0%,transparent_70%)] rounded-full blur-[100px]"></div>
          <div className="absolute top-[20%] left-[40%] w-[35vw] h-[35vw] bg-[radial-gradient(circle,rgba(245,158,11,0.15)_0%,transparent_70%)] rounded-full blur-[90px]"></div>
        </div>

        {/* Floating Particles */}
        <div ref={particlesRef} className="absolute inset-0 pointer-events-none z-0">
          {particles.map((_, i) => (
            <div key={i} className="absolute w-1 h-1 bg-amber-200/50 rounded-full blur-[1px]"></div>
          ))}
        </div>
        
        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('/noise.png')] bg-repeat pointer-events-none"></div>
      </div>

      {/* TOP PART */}
      <div className="relative z-10 w-full flex flex-col items-center justify-end pt-24 pb-4 px-6 text-center">
        <h1 
          ref={topHeadingRef}
          className="text-4xl md:text-6xl lg:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-50 via-yellow-300 to-amber-700 drop-shadow-[0_0_30px_rgba(245,158,11,0.2)] mb-6 tracking-tight"
        >
          Support The Journey
        </h1>
        <h2 
          ref={topSubHeadingRef}
          className="text-base md:text-xl lg:text-2xl text-white/70 font-light max-w-3xl tracking-wide leading-relaxed italic"
        >
          &quot;Every great adventure is fueled by love, support, and perhaps a little bit of caffeine.&quot;
        </h2>
      </div>

      {/* MAIN PART */}
      <div className="relative z-10 flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-6 py-12 lg:py-0">
        
        {/* LEFT CONTAINER (Glass Card with 3D Tilt) */}
        <div 
          ref={leftCardWrapRef}
          className="flex-1 w-full max-w-2xl perspective-1000"
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
        >
          <div 
            ref={leftContentRef}
            className="relative bg-white/[0.02] backdrop-blur-2xl border border-white/[0.08] rounded-[2rem] p-10 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform-style-3d group overflow-hidden"
          >
            {/* Shimmer effect inside card on hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out"></div>
            
            <div className="relative z-10 transform-style-3d transform translate-z-10">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-white/5 to-white/0 border border-white/10 text-amber-200/80 text-xs font-bold tracking-[0.2em] uppercase mb-8 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></div>
                A Token of Appreciation
              </div>
              
              <h3 className="text-3xl md:text-4xl text-white/95 font-serif mb-6 leading-tight drop-shadow-md">
                Help me create more beautiful memories together.
              </h3>
              
              <div className="w-12 h-0.5 bg-gradient-to-r from-amber-500 to-transparent mb-6"></div>
              
              <p className="text-white/60 text-sm md:text-lg leading-relaxed font-light">
                Your support means the world to me. By buying a coffee, you&apos;re not just offering a drink, but you&apos;re giving me the energy and motivation to continue sharing these wonderful moments. 
                <span className="block mt-4 text-white/80 font-medium">Thank you for your support.</span>
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT CONTAINER (Interactive Button) */}
        <div 
          ref={rightContentRef}
          className="flex-1 flex flex-col items-center justify-center w-full"
        >
          <div className="relative group p-10">
            {/* Massive external glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 animate-pulse"></div>
            
            <button
              ref={buttonRef}
              onMouseMove={handleButtonMouseMove}
              onMouseLeave={handleButtonMouseLeave}
              onClick={handleWhatsapp}
              className="relative flex items-center justify-center gap-4 px-12 py-6 bg-gradient-to-b from-[#1c0f38] to-[#120826] border border-amber-500/40 rounded-full shadow-[0_0_40px_rgba(245,158,11,0.2),inset_0_2px_20px_rgba(255,255,255,0.05)] overflow-hidden group-hover:border-amber-400/60 transition-colors duration-300 z-10"
            >
              {/* Internal Sweep effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>
              
              <div className="relative z-10 flex items-center gap-4 transform group-hover:scale-105 transition-transform duration-300">
                {/* Custom Coffee Icon */}
                <div className="p-2 bg-amber-500/10 rounded-full border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors duration-300">
                  <svg className="w-7 h-7 text-amber-400 group-hover:text-amber-300 transition-colors duration-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                    <line x1="6" x2="6" y1="2" y2="4" />
                    <line x1="10" x2="10" y1="2" y2="4" />
                    <line x1="14" x2="14" y1="2" y2="4" />
                  </svg>
                </div>
                
                <span className="text-amber-50 font-semibold tracking-widest text-lg md:text-xl uppercase group-hover:text-white transition-colors duration-300 drop-shadow-lg">
                  Buy Me a Coffee
                </span>
              </div>
            </button>
          </div>
          
          <div className="mt-2 flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity duration-300">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            <span className="text-white/60 text-xs tracking-wider uppercase">Opens WhatsApp</span>
          </div>
        </div>

      </div>

      {/* BOTTOM PART / FOOTER */}
      <div ref={footerTextRef} className="relative z-10 w-full flex flex-col items-center justify-end mt-12 pb-8 overflow-hidden pointer-events-none">
        <div className="text-amber-500/80 text-sm md:text-base tracking-[0.2em] font-medium uppercase mb-4 text-center drop-shadow-lg">
          Presented by ARGHYA ( Your Software Engineer Friend )
        </div>
        <h1 
          className="text-[14vw] font-serif font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/30 to-white/5 select-none drop-shadow-2xl"
          style={{ lineHeight: 0.75 }}
        >
          WELCOME
        </h1>
      </div>

    </div>
  )
}
