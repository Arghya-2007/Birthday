'use client'

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { playLoaderEntrance, playLoaderExit } from '@/animations/loadingAnimations';

interface LoadingScreenProps {
  progress: number;
  onComplete: () => void;
}

export default function LoadingScreen({ progress, onComplete }: LoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLDivElement>(null);
  const barContainerRef = useRef<HTMLDivElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    playLoaderEntrance({
      date: dateRef,
      message: messageRef,
      percent: percentRef,
      bar: barContainerRef,
    });
  }, []);

  const progressObj = useRef({ value: 0 });

  useEffect(() => {
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
          percentRef.current.innerText = 'Ready.';
        } else {
          percentRef.current.innerText = `${currentVal}%`;
        }
      }
    });

    if (progress >= 100) {
      // 800ms for animation to reach 100, plus a brief pause to read "Ready."
      const timer = setTimeout(() => {
        playLoaderExit(containerRef).then(() => {
          onComplete();
        });
      }, 1400);
      
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 flex flex-col items-center justify-center bg-bg text-text-primary z-[var(--z-loader)]"
    >
      <div className="flex flex-col items-center flex-grow justify-center w-full">
        <div 
          ref={dateRef}
          className="font-display uppercase tracking-cinematic text-text-secondary text-xs mb-4 opacity-0"
        >
          AUGUST 2026
        </div>
        
        <div 
          ref={messageRef}
          className="font-body uppercase tracking-wide text-text-secondary text-xs opacity-0"
        >
          Preparing something special...
        </div>
        
        <div className="h-16"></div> {/* Spacer */}
        
        <div 
          ref={percentRef}
          className="font-display text-[clamp(3rem,6vw,4.5rem)] font-light text-ivory opacity-0 tracking-normal"
        >
          0%
        </div>
      </div>

      <div 
        ref={barContainerRef}
        className="w-full h-[1px] bg-muted absolute bottom-0 opacity-0"
      >
        <div 
          ref={barFillRef}
          className="h-full bg-champagne w-0"
        ></div>
      </div>
    </div>
  );
}
