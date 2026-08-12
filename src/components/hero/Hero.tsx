'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { playHeroEntrance } from '@/animations/heroAnimations';
import { birthdayContent } from '@/data/birthdayContent';
import Marquee from './Marquee';
import Image from 'next/image';

interface HeroProps {
  onEntranceComplete?: () => void;
  isActive?: boolean;
}

export default function Hero({ onEntranceComplete, isActive = true }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Refs for animation
  const topMarqueeRef = useRef<HTMLDivElement>(null);
  const bottomMarqueeRef = useRef<HTMLDivElement>(null);
  
  const leftContentRef = useRef<HTMLDivElement>(null);
  const sceneLabelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  
  const bgImageRef = useRef<HTMLImageElement>(null);
  const rightContentRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  // Set initial states once on mount to prevent flash
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      gsap.set(containerRef.current, { opacity: 0 });
      gsap.set([topMarqueeRef.current, bottomMarqueeRef.current], { opacity: 0 });
      gsap.set(sceneLabelRef.current, { opacity: 0, y: prefersReducedMotion ? 0 : 15 });
      gsap.set(titleRef.current, { opacity: 0, y: prefersReducedMotion ? 0 : 20 });
      gsap.set(subtitleRef.current, { opacity: 0, y: prefersReducedMotion ? 0 : 15 });
      
      gsap.set(bgImageRef.current, { scale: prefersReducedMotion ? 1 : 1.05 });
      gsap.set(imageContainerRef.current, { opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 });
      gsap.set(imageRef.current, { scale: prefersReducedMotion ? 1 : 1.15 });
      gsap.set(descriptionRef.current, { opacity: 0, y: prefersReducedMotion ? 0 : 10 });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Play animation when active
  useLayoutEffect(() => {
    if (!isActive) return;

    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      playHeroEntrance(
        {
          container: containerRef.current,
          topMarquee: topMarqueeRef.current,
          bottomMarquee: bottomMarqueeRef.current,
          sceneLabel: sceneLabelRef.current,
          title: titleRef.current,
          subtitle: subtitleRef.current,
          bgImage: bgImageRef.current,
          imageContainer: imageContainerRef.current,
          image: imageRef.current,
          description: descriptionRef.current,
        },
        onEntranceComplete,
        prefersReducedMotion
      );
    }, containerRef);

    return () => ctx.revert();
  }, [isActive, onEntranceComplete]);

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-bg z-30 flex flex-col justify-between"
    >
      {/* Background Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={bgImageRef}
        src="/sequence/frames/frame-031.jpg"
        alt="Hero background"
        className="absolute inset-0 w-full h-full object-cover object-center will-change-transform opacity-30 md:opacity-40"
      />

      {/* Background vignette layer for depth */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.85) 100%)' }}
      />
      
      {/* 1. Top Container (Marquee) */}
      <div ref={topMarqueeRef} className="w-full z-10 pt-4 pb-2">
        <Marquee text="HAPPY BIRTHDAY ANTARA • " />
      </div>

      {/* 2. Main Container (Left and Right) */}
      <div className="flex-1 w-full flex flex-col md:flex-row items-center justify-between z-10 px-6 md:px-12 lg:px-16 overflow-hidden py-8">
        
        {/* Left Container (Text Content) */}
        <div ref={leftContentRef} className="flex-1 flex flex-col justify-center max-w-2xl pr-0 h-full relative z-10">
          <div
            ref={sceneLabelRef}
            className="font-body text-[0.7rem] md:text-[0.8rem] tracking-cinematic text-champagne uppercase mb-[var(--space-md)] ml-1"
          >
            SCENE 01
          </div>
          <h1
            ref={titleRef}
            className="font-display text-[clamp(3rem,8vw,8.5rem)] font-light text-ivory tracking-[0.01em] leading-[1.05]"
          >
            {birthdayContent.hero.title}
          </h1>
          <p
            ref={subtitleRef}
            className="font-body text-base md:text-xl text-text-secondary tracking-[0.05em] mt-[var(--space-lg)] max-w-lg ml-1 leading-relaxed"
          >
            {birthdayContent.hero.subtitle}
          </p>
        </div>

        {/* Right Container (Image Content) */}
        <div ref={rightContentRef} className="flex-1 flex flex-col items-center md:items-end justify-center w-full max-w-lg mt-8 md:mt-0 h-full relative z-10 ml-auto">
          <div 
            ref={imageContainerRef}
            className="relative w-full max-w-[400px] aspect-[3/4] md:aspect-[4/5] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5"
          >
            <Image
              ref={imageRef}
              src="/images/profile.jpg"
              alt="Hero background"
              fill
              className="object-cover object-center will-change-transform"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            
            {/* Elegant inner shadow/overlay */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.6)] mix-blend-multiply" />
          </div>
          
          <p 
            ref={descriptionRef}
            className="font-body text-[0.8rem] md:text-sm text-champagne italic text-center md:text-right mt-[var(--space-lg)] max-w-sm tracking-wide font-light"
          >
            &quot;Because some days are meant to be celebrated with a little more magic.&quot;
          </p>
        </div>

      </div>

      {/* 3. Bottom Container (Marquee reverse) */}
      <div ref={bottomMarqueeRef} className="w-full z-10 pb-4 pt-2">
        <Marquee text="HAPPY BIRTHDAY ANTARA • " reverse />
      </div>

    </div>
  );
}
