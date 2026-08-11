'use client'

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { playLoaderEntrance, playLoaderExit } from '@/animations/loadingAnimations';

interface LoadingScreenProps {
  progress: number;
  onComplete: () => void;
}

export default function LoadingScreen({ progress, onComplete }: LoadingScreenProps) {
  const [isReady, setIsReady] = useState(false);
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
          // If we haven't set the 'Enter' text yet, just say Ready
          if (percentRef.current.innerText !== 'Enter') {
            percentRef.current.innerText = 'Ready.';
          }
        } else {
          percentRef.current.innerText = `${currentVal}%`;
        }
      }
    });

    if (progress >= 100) {
      // 800ms for animation to reach 100, plus a brief pause to read "Ready."
      const timer = setTimeout(() => {
        setIsReady(true);
        if (percentRef.current) {
          percentRef.current.innerText = 'Enter';
          // Add a subtle pulse to invite the click
          gsap.to(percentRef.current, {
            scale: 1.05,
            opacity: 0.8,
            duration: 1,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
          });
        }
      }, 1400);
      
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  const handleEnter = () => {
    if (!isReady) return;
    
    // Stop the pulsing animation before exiting
    if (percentRef.current) gsap.killTweensOf(percentRef.current);
    
    playLoaderExit(containerRef).then(() => {
      onComplete();
    });
  };

  return (
    <div 
      ref={containerRef}
      onClick={handleEnter}
      className={`fixed inset-0 flex flex-col items-center justify-center bg-bg text-text-primary z-[var(--z-loader)] ${isReady ? 'cursor-pointer' : ''}`}
    >
      <div className="flex flex-col items-center flex-grow justify-center w-full pointer-events-none">
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
          className="font-display text-[clamp(3rem,6vw,4.5rem)] font-light text-ivory opacity-0 tracking-normal transition-colors hover:text-champagne"
        >
          0%
        </div>
      </div>

      <div 
        ref={barContainerRef}
        className="w-full h-[1px] bg-muted absolute bottom-0 opacity-0 pointer-events-none"
      >
        <div 
          ref={barFillRef}
          className="h-full bg-champagne w-0"
        ></div>
      </div>
    </div>
  );
}
