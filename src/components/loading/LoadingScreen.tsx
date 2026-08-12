'use client'

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { playLoaderEntrance, playLoaderExit } from '@/animations/loadingAnimations';

/* ─── Device Gate ─────────────────────────────────────────────────────────── */

const MIN_DESKTOP_WIDTH = 1024;

function useDeviceCheck() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MIN_DESKTOP_WIDTH - 1}px)`);

    const update = () => setIsMobile(mql.matches);
    update();

    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  return isMobile;
}

function MobileBlockScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-bg text-text-primary z-[9999] overflow-hidden select-none">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] bg-champagne/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center px-8 text-center max-w-sm">
        {/* Monitor icon */}
        <svg
          className="w-16 h-16 mb-8 text-champagne opacity-80"
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="6" y="8" width="52" height="36" rx="3" />
          <line x1="32" y1="44" x2="32" y2="52" />
          <line x1="22" y1="52" x2="42" y2="52" />
          <line x1="6" y1="38" x2="58" y2="38" />
        </svg>

        <h1 className="font-display text-3xl sm:text-4xl font-light text-ivory leading-snug mb-4">
          Desktop Only
        </h1>

        <div className="w-12 h-[1px] bg-champagne/40 mb-6" />

        <p className="font-body text-text-secondary text-sm leading-relaxed tracking-wide mb-8">
          This experience has been crafted for larger screens. Please open it on a{' '}
          <span className="text-champagne font-medium">laptop</span> or{' '}
          <span className="text-champagne font-medium">desktop</span> to enjoy the full experience.
        </p>

        <div className="font-body uppercase tracking-[0.3em] text-champagne/50 text-[10px]">
          Minimum 1024px viewport
        </div>
      </div>
    </div>
  );
}

/* ─── Loading Screen ──────────────────────────────────────────────────────── */

interface LoadingScreenProps {
  progress: number;
  onComplete: () => void;
}

export default function LoadingScreen({ progress, onComplete }: LoadingScreenProps) {
  const isMobile = useDeviceCheck();
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLDivElement>(null);
  const barContainerRef = useRef<HTMLDivElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Don't run entrance animation on mobile — we'll show the block screen
    if (isMobile !== false) return;

    playLoaderEntrance({
      date: dateRef,
      message: messageRef,
      percent: percentRef,
      bar: barContainerRef,
    });
  }, [isMobile]);

  const progressObj = useRef({ value: 0 });

  useEffect(() => {
    // Skip progress animation while device check is pending or on mobile
    if (isMobile !== false) return;

    // Update GSAP bar width smoothly
    if (barFillRef.current) {
      gsap.to(barFillRef.current, {
        width: `${progress}%`,
        duration: 0.8,
        ease: 'power2.out',
      });
    }

    // Animate the number counter smoothly
    gsap.to(progressObj.current, {
      value: progress,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: () => {
        if (!percentRef.current) return;
        const currentVal = Math.round(progressObj.current.value);
        if (progress >= 100 && currentVal >= 99) {
          if (percentRef.current.innerText !== 'Begin') {
            percentRef.current.innerText = 'Begin';
          }
        } else {
          percentRef.current.innerText = currentVal.toString();
        }
      }
    });

    if (progress >= 100) {
      const timer = setTimeout(() => {
        setIsReady(true);
        if (messageRef.current) {
          messageRef.current.innerText = 'Click anywhere to enter';
          gsap.to(messageRef.current, {
            opacity: 0.7,
            yoyo: true,
            repeat: -1,
            duration: 1.5,
            ease: "sine.inOut"
          });
        }

        if (percentRef.current) {
          gsap.to(percentRef.current, {
            textShadow: "0px 0px 30px rgba(201, 169, 110, 0.3)",
            duration: 2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
          });
        }

        if (barContainerRef.current) {
          gsap.to(barContainerRef.current, {
            opacity: 0,
            duration: 1,
            ease: "power2.out"
          });
        }
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [progress, onComplete, isMobile]);

  const handleEnter = () => {
    if (!isReady) return;

    // Stop pulsing animations
    if (messageRef.current) gsap.killTweensOf(messageRef.current);
    if (percentRef.current) gsap.killTweensOf(percentRef.current);

    // Gather inner elements to hide before the main curtain exit
    const elementsToHide: HTMLElement[] = [];
    if (dateRef.current) elementsToHide.push(dateRef.current);
    if (messageRef.current) elementsToHide.push(messageRef.current);
    if (percentRef.current) elementsToHide.push(percentRef.current);

    playLoaderExit(containerRef, elementsToHide).then(() => {
      onComplete();
    });
  };

  /* ── Device gate: block mobile / tablet / unknown ── */
  if (isMobile === null) {
    // SSR / hydration: render nothing until client-side check completes
    return <div className="fixed inset-0 bg-bg z-[9999]" />;
  }

  if (isMobile) {
    return <MobileBlockScreen />;
  }

  return (
    <div
      ref={containerRef}
      onClick={handleEnter}
      className={`fixed inset-0 flex flex-col items-center justify-center bg-bg text-text-primary z-[var(--z-loader)] overflow-hidden ${isReady ? 'cursor-pointer' : ''}`}
    >
      {/* Subtle ambient glows for premium lighting effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-champagne/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30vw] h-[30vw] bg-amber/5 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />

      <div className="flex flex-col items-center justify-between w-full h-full z-10 pointer-events-none py-16">

        {/* Top Section */}
        <div className="px-4 py-2">
          <div
            ref={dateRef}
            className="font-body uppercase tracking-[0.4em] text-champagne text-[10px] md:text-xs font-light opacity-0"
          >
            A Special Celebration
          </div>
        </div>

        {/* Middle Section */}
        <div className="flex flex-col items-center justify-center flex-grow w-full">
          <div className="mb-6 px-8 py-4">
            <div
              ref={percentRef}
              className="font-display text-[clamp(5rem,18vw,14rem)] font-light text-ivory opacity-0 leading-none tracking-tight"
            >
              0
            </div>
          </div>

          <div className="h-6 px-4">
            <div
              ref={messageRef}
              className="font-body uppercase tracking-widest text-text-secondary text-[10px] md:text-xs opacity-0"
            >
              Curating memories...
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="w-full max-w-md px-12 flex flex-col items-center">
          <div
            ref={barContainerRef}
            className="w-full h-[1px] bg-white/10 opacity-0 overflow-hidden rounded-full"
          >
            <div
              ref={barFillRef}
              className="h-full bg-gradient-to-r from-champagne/50 to-champagne w-0 origin-left"
            ></div>
          </div>
        </div>

      </div>
    </div>
  );
}
