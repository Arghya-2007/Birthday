'use client'

import React, { useEffect, useRef, useMemo, memo } from 'react'
import gsap from '@/animations/gsap'
import { useSequenceContext } from '../sequence/SequenceContext'
import type { Scene } from '@/data/birthdayContent'
import ImageTrail from './ImageTrail'

// ─── Constants ──────────────────────────────────────────────────────────────
// Hoisted outside render to avoid per-frame allocations
const CURRENT_YEAR = new Date().getFullYear()

interface StorySectionProps {
  scene: Scene
  totalFrames: number
}

// Helper to extract number from scene ID – pure function, no allocations per render
const getSceneNumber = (id: string) => {
  const match = id.match(/\d+/)
  return match ? match[0] : '01'
}

// ─── ElegantText ─────────────────────────────────────────────────────────────
// Memoised to prevent DOM churn; word splitting is a render-time computation
// that shouldn't repeat unless the text actually changes.
const ElegantText = memo(({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) => {
  const words = useMemo(() => text.split(' '), [text])
  return (
    <h2 className={className} style={style}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-2" style={{ verticalAlign: 'top' }}>
          <span
            className="word-inner inline-block opacity-0"
            style={{
              transform: 'translate3d(0, 100%, 0)',
              willChange: 'transform, opacity',
            }}
          >
            {word}
          </span>
          {i !== words.length - 1 && '\u00A0'}
        </span>
      ))}
    </h2>
  )
})
ElegantText.displayName = 'ElegantText'

// ─── RotatingStamp ───────────────────────────────────────────────────────────
// Pure presentational – memo prevents any re-renders from parent.
// will-change: transform promotes the spinning SVG to its own compositor layer.
const RotatingStamp = memo(() => (
  <div
    className="relative w-32 h-32 decorative-stamp flex items-center justify-center"
    style={{ opacity: 0, willChange: 'transform, opacity' }}
  >
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      style={{
        animation: 'spin 12s linear infinite',
        willChange: 'transform',
      }}
    >
      <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
      <text className="font-body text-[7.5px] uppercase tracking-[0.35em] fill-[#C9A96E]">
        <textPath href="#circlePath">
          A SPECIAL MOMENT • CELEBRATING YOU •
        </textPath>
      </text>
    </svg>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-1.5 h-1.5 bg-[#C9A96E] rounded-full shadow-[0_0_10px_rgba(201,169,110,0.8)]" />
    </div>
  </div>
))
RotatingStamp.displayName = 'RotatingStamp'

// ─── Image trail items (hoisted to avoid array recreation) ──────────────────
const TRAIL_IMAGES = [
  './images/image-1.jpg',
  './images/image-2.jpg',
  './images/image-3.jpg',
  './images/image-4.jpg',
  './images/image-5.jpg',
  './images/image-6.jpg',
  './images/image-7.jpg',
]

// ─── Content ─────────────────────────────────────────────────────────────────
// The main text block for each scene. Memoised on scene.id since the scene
// object reference may change between renders even when content is identical.
const Content = memo(({ scene }: { scene: Scene }) => (
  <div className={`relative flex flex-col w-full ${scene.position === 'right' ? 'items-end' : 'items-start'}`}>
    {/* Large background number for editorial look */}
    <div
      className={`absolute top-0 font-display text-[12rem] leading-none text-[#F5F0E8] pointer-events-none select-none ${scene.position === 'right' ? 'right-0 translate-x-[10%]' : 'left-0 -translate-x-[10%]'}`}
      style={{
        opacity: 0.03,
        transform: `translate3d(${scene.position === 'right' ? '10%' : '-10%'}, -50%, 0)`,
      }}
    >
      {getSceneNumber(scene.id)}
    </div>

    {/* Content Wrapper – GPU-promoted layer with will-change for scroll animations */}
    <div
      className={`relative z-10 flex flex-col p-8 md:p-12 rounded-3xl border border-white/5 shadow-2xl ${scene.position === 'right' ? 'items-end text-right' : 'items-start text-left'}`}
      style={{
        // backdrop-blur is compositor-heavy; promote to own layer
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        willChange: 'transform, opacity',
        // force GPU compositing from the start to avoid jank on first animation frame
        transform: 'translate3d(0, 0, 0)',
      }}
    >
      {/* Decorative Corner Accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/10 rounded-tl-3xl" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/10 rounded-br-3xl" />

      <div className="flex items-center gap-4 mb-8 opacity-90">
        {scene.position === 'right' && <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#C9A96E]" />}
        <span
          className="scene-label block font-body text-[0.65rem] uppercase text-[#C9A96E]"
          style={{
            letterSpacing: '0.3em',
            willChange: 'transform, opacity',
            transform: 'translate3d(0, 0, 0)',
          }}
        >
          {scene.sceneLabel}
        </span>
        {scene.position !== 'right' && <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#C9A96E]" />}
      </div>

      {scene.text && (
        <ElegantText
          text={scene.text}
          className={`font-display font-light text-[#F5F0E8] leading-[1.1] mb-8 ${scene.position === 'right' ? 'text-right' : 'text-left'}`}
          style={{ fontSize: 'clamp(2.5rem, 4vw, 5.5rem)', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
        />
      )}

      {scene.subtext && (
        <div className="flex items-center gap-6">
          {scene.position === 'right' && <div className="h-px w-12 bg-white/20" />}
          <p
            className="scene-subtext font-body text-[1.1rem] tracking-[0.04em] text-[#E0DCD5] max-w-md italic"
            style={{ willChange: 'transform, opacity', transform: 'translate3d(0, 0, 0)' }}
          >
            {scene.subtext}
          </p>
          {scene.position !== 'right' && <div className="h-px w-12 bg-white/20" />}
        </div>
      )}

      {/* Cinematic Metadata */}
      <div className="mt-10 flex gap-6 font-body text-[0.55rem] uppercase tracking-[0.25em] text-white/30">
        <span className="metadata-item" style={{ willChange: 'transform, opacity' }}>
          FRM • {String(scene.frameStart).padStart(4, '0')}
        </span>
        <span className="metadata-item" style={{ willChange: 'transform, opacity' }}>
          MEM • {CURRENT_YEAR}
        </span>
        <span className="metadata-item hidden sm:inline-block" style={{ willChange: 'transform, opacity' }}>
          SEQ • {scene.id.split('-')[1]}
        </span>
      </div>
    </div>
  </div>
), (prev, next) => prev.scene.id === next.scene.id)
Content.displayName = 'Content'

// ─── Decorative ──────────────────────────────────────────────────────────────
// The opposite-side decorative panel with ImageTrail.
const Decorative = memo(({ scene }: { scene: Scene }) => (
  <div
    className={`w-full flex flex-col justify-center h-[500px] relative pointer-events-auto group cursor-crosshair ${scene.position === 'right' ? 'items-start pl-12 md:pl-24' : 'items-end pr-12 md:pr-24'}`}
  >
    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none opacity-50 group-hover:opacity-0 transition-opacity duration-500">
      <div className="flex flex-col items-center gap-4">
        <svg className="w-10 h-10 animate-bounce text-[#C9A96E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
        <span className="font-body text-xs md:text-sm uppercase tracking-[0.3em] text-[#C9A96E]">Hover around</span>
      </div>
    </div>
    <div className="absolute inset-0 z-0">
      <ImageTrail items={TRAIL_IMAGES} variant={4} />
    </div>
    <div className="relative z-10 flex flex-col items-center gap-8 pointer-events-none">
      <div
        className="w-[1px] h-24 md:h-40 decorative-line bg-gradient-to-b from-transparent via-[#C9A96E] to-transparent"
        style={{ opacity: 0, willChange: 'transform, opacity', transform: 'translate3d(0, 0, 0)' }}
      />
      <RotatingStamp />
      <div
        className="w-[1px] h-24 md:h-40 decorative-line bg-gradient-to-t from-transparent via-[#C9A96E] to-transparent"
        style={{ opacity: 0, willChange: 'transform, opacity', transform: 'translate3d(0, 0, 0)' }}
      />
    </div>
  </div>
), (prev, next) => prev.scene.id === next.scene.id)
Decorative.displayName = 'Decorative'


// ═════════════════════════════════════════════════════════════════════════════
// Main Component
// ═════════════════════════════════════════════════════════════════════════════
export default function StorySection({ scene, totalFrames }: StorySectionProps) {
  const { containerRef } = useSequenceContext()
  const containerDivRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !containerDivRef.current) return

    const el = containerDivRef.current

    // Batch DOM reads before any GSAP writes
    const words = el.querySelectorAll<HTMLElement>('.word-inner')
    const labels = el.querySelectorAll<HTMLElement>('.scene-label')
    const subtexts = el.querySelectorAll<HTMLElement>('.scene-subtext')
    const lines = el.querySelectorAll<HTMLElement>('.decorative-line')
    const stamps = el.querySelectorAll<HTMLElement>('.decorative-stamp')
    const metadata = el.querySelectorAll<HTMLElement>('.metadata-item')

    const ctx = gsap.context(() => {
      // ── ScrollTrigger-driven timeline ──────────────────────────────────
      // Using `scrub: 1.2` for buttery-smooth interpolation without being
      // so high it feels sluggish. Lower values feel snappier but can
      // expose frame drops.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          end: 'bottom 15%',
          scrub: 1.2,
          // FastScrollEnd prevents the scrub from continuing to interpolate
          // after the user stops scrolling — reduces idle GPU work
          fastScrollEnd: true,
        },
      })

      tl.add('start')

      // ── Entrance: scene-label ──────────────────────────────────────────
      // GPU-only: translate3d + autoAlpha (uses visibility:hidden when 0,
      // saving compositor work vs plain opacity:0).
      // REMOVED letterSpacing animation — it causes full layout reflow on
      // every single scrub tick. The label ships with its final spacing.
      if (labels.length > 0) {
        tl.fromTo(
          labels,
          {
            autoAlpha: 0,
            x: scene.position === 'right' ? 20 : -20,
          },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.6,
            ease: 'power2.out',
            force3D: true,
          },
          'start'
        )
      }

      // ── Entrance: decorative lines ─────────────────────────────────────
      if (lines.length > 0) {
        tl.fromTo(
          lines,
          { scaleY: 0, autoAlpha: 0 },
          {
            scaleY: 1,
            autoAlpha: 0.5,
            duration: 1,
            transformOrigin: 'center',
            ease: 'expo.out',
            force3D: true,
          },
          'start+=0.1'
        )
      }

      // ── Entrance: rotating stamp ───────────────────────────────────────
      if (stamps.length > 0) {
        tl.fromTo(
          stamps,
          { autoAlpha: 0, scale: 0.8, rotation: -45 },
          {
            autoAlpha: 0.7,
            scale: 1,
            rotation: 0,
            duration: 1.2,
            ease: 'back.out(1.5)',
            force3D: true,
          },
          'start+=0.2'
        )
      }

      // ── Entrance: word-by-word reveal ──────────────────────────────────
      // Using yPercent instead of y for sub-pixel GPU compositing
      if (words.length > 0) {
        tl.to(
          words,
          {
            yPercent: 0,
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            stagger: 0.05,
            ease: 'power3.out',
            force3D: true,
          },
          'start+=0.2'
        )
      }

      // ── Entrance: subtext ──────────────────────────────────────────────
      if (subtexts.length > 0) {
        tl.fromTo(
          subtexts,
          { autoAlpha: 0, yPercent: 15 },
          {
            autoAlpha: 1,
            yPercent: 0,
            duration: 0.7,
            ease: 'power2.out',
            force3D: true,
          },
          'start+=0.4'
        )
      }

      // ── Entrance: metadata items ───────────────────────────────────────
      if (metadata.length > 0) {
        tl.fromTo(
          metadata,
          { autoAlpha: 0, yPercent: 30 },
          {
            autoAlpha: 1,
            yPercent: 0,
            stagger: 0.1,
            duration: 0.6,
            ease: 'power2.out',
            force3D: true,
          },
          'start+=0.6'
        )
      }

      // ── Exit ───────────────────────────────────────────────────────────
      // Brief hold at full visibility, then GPU-only exit.
      // yPercent avoids layout-triggering pixel values on the container.
      tl.to({}, { duration: 0.4 }) // pause at full opacity
        .to(el, {
          autoAlpha: 0,
          yPercent: -4,
          duration: 0.7,
          ease: 'power2.inOut',
          force3D: true,
        })
    }, el)

    return () => ctx.revert()
  }, [scene, totalFrames, containerRef])

  // Compute absolute position once — this is a pure calculation
  const top = (scene.frameStart / totalFrames) * 100

  return (
    <div
      ref={containerDivRef}
      style={{
        position: 'absolute',
        top: `calc(${top}% + 40vh)`,
        width: '100%',
        pointerEvents: 'none',
        // Promote to own compositor layer immediately — avoids the
        // "first animation frame" jank where the browser has to
        // promote the layer mid-scroll
        willChange: 'transform, opacity',
        transform: 'translate3d(0, 0, 0)',
      }}
      className="flex w-full px-[4vw] md:px-[8vw] xl:px-[12vw]"
    >
      {scene.position === 'center' ? (
        <div className="w-full flex flex-col items-center text-center max-w-4xl mx-auto">
          <Content scene={scene} />
        </div>
      ) : (
        <>
          {/* LEFT CONTAINER */}
          <div className="w-1/2 flex items-center pr-4 md:pr-12 xl:pr-16">
            {scene.position === 'left' ? <Content scene={scene} /> : <Decorative scene={scene} />}
          </div>

          {/* RIGHT CONTAINER */}
          <div className="w-1/2 flex items-center pl-4 md:pl-12 xl:pl-16">
            {scene.position === 'right' ? <Content scene={scene} /> : <Decorative scene={scene} />}
          </div>
        </>
      )}
    </div>
  )
}
