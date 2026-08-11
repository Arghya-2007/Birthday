import gsap from 'gsap';
import { RefObject } from 'react';

export function playLoaderEntrance(refs: {
  date: RefObject<HTMLElement | null>;
  message: RefObject<HTMLElement | null>;
  bar: RefObject<HTMLElement | null>;
  percent: RefObject<HTMLElement | null>;
}): void {
  if (refs.date.current) {
    gsap.fromTo(refs.date.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    );
  }

  if (refs.message.current) {
    gsap.fromTo(refs.message.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: 'power2.out' }
    );
  }

  if (refs.percent.current) {
    gsap.fromTo(refs.percent.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, delay: 0.5, ease: 'power2.out' }
    );
  }

  if (refs.bar.current) {
    gsap.fromTo(refs.bar.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, delay: 0.5, ease: 'power2.out' }
    );
  }
}

export function playLoaderExit(containerRef: RefObject<HTMLElement | null>): Promise<void> {
  return new Promise((resolve) => {
    if (!containerRef.current) {
      resolve();
      return;
    }

    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 1.2,
      ease: 'power2.inOut',
      onComplete: resolve
    });
  });
}
