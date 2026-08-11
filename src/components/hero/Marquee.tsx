'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

interface MarqueeProps {
  text: string;
  reverse?: boolean;
  className?: string;
}

export default function Marquee({ text, reverse = false, className = '' }: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      if (!track) return;

      if (reverse) {
        gsap.set(track, { xPercent: -50 });
      }

      gsap.to(track, {
        xPercent: reverse ? 0 : -50,
        ease: 'none',
        duration: 30, // slow and premium
        repeat: -1,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [reverse]);

  // Repeat the text multiple times to ensure it covers screens gracefully
  const repeatedText = Array(15).fill(text).join('\u00A0\u00A0\u00A0\u00A0'); // Add spaces between repetitions

  return (
    <div
      ref={containerRef}
      className={`w-full overflow-hidden whitespace-nowrap flex items-center bg-bg/50 backdrop-blur-sm border-y border-white/5 py-3 ${className}`}
    >
      <div ref={trackRef} className="flex flex-nowrap w-fit">
        <div className="flex-shrink-0 px-4 flex items-center">
          <span className="text-xl md:text-2xl font-display font-light text-champagne tracking-widest uppercase">
            {repeatedText}
          </span>
        </div>
        <div className="flex-shrink-0 px-4 flex items-center">
          <span className="text-xl md:text-2xl font-display font-light text-champagne tracking-widest uppercase">
            {repeatedText}
          </span>
        </div>
      </div>
    </div>
  );
}
