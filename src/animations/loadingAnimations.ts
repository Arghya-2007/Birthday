import gsap from 'gsap';
import { RefObject } from 'react';

export function playLoaderEntrance(refs: {
  date: RefObject<HTMLElement | null>;
  message: RefObject<HTMLElement | null>;
  bar: RefObject<HTMLElement | null>;
  percent: RefObject<HTMLElement | null>;
}): void {
  const tl = gsap.timeline();

  if (refs.percent.current) {
    tl.fromTo(refs.percent.current,
      { opacity: 0, y: 100 },
      { opacity: 1, y: 0, duration: 1.8, ease: 'expo.out' },
      0
    );
  }

  if (refs.date.current) {
    tl.fromTo(refs.date.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1.4, ease: 'expo.out' },
      0.3
    );
  }

  if (refs.message.current) {
    tl.fromTo(refs.message.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1.4, ease: 'expo.out' },
      0.6
    );
  }

  if (refs.bar.current) {
    tl.fromTo(refs.bar.current,
      { opacity: 0, scaleX: 0 },
      { opacity: 1, scaleX: 1, duration: 1.5, ease: 'expo.inOut', transformOrigin: 'center center' },
      0.6
    );
  }
}

export function playLoaderExit(containerRef: RefObject<HTMLElement | null>, elementsToHide: HTMLElement[] = []): Promise<void> {
  return new Promise((resolve) => {
    if (!containerRef.current) {
      resolve();
      return;
    }

    const tl = gsap.timeline({
      onComplete: resolve
    });

    // Fade out inner elements first
    if (elementsToHide.length > 0) {
      tl.to(elementsToHide, {
        y: -30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.inOut'
      }, 0);
    }

    // Slide the whole container up like a curtain
    tl.to(containerRef.current, {
      yPercent: -100,
      duration: 1.2,
      ease: 'expo.inOut'
    }, "-=0.4");
  });
}
