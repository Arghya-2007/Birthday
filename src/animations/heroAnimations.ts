import gsap from 'gsap';

interface HeroRefs {
  container: HTMLDivElement | null;
  topMarquee: HTMLDivElement | null;
  bottomMarquee: HTMLDivElement | null;
  sceneLabel: HTMLDivElement | null;
  title: HTMLHeadingElement | null;
  subtitle: HTMLParagraphElement | null;
  bgImage: HTMLImageElement | null;
  imageContainer: HTMLDivElement | null;
  image: HTMLImageElement | null;
  description: HTMLParagraphElement | null;
}

export function playHeroEntrance(
  refs: HeroRefs,
  onComplete?: () => void,
  reducedMotion: boolean = false
): gsap.core.Timeline | undefined {
  const { 
    container, 
    topMarquee,
    bottomMarquee,
    sceneLabel, 
    title, 
    subtitle,
    bgImage,
    imageContainer,
    image,
    description
  } = refs;

  if (!container) return;

  const tl = gsap.timeline({
    onComplete: () => {
      if (onComplete) onComplete();
    }
  });

  const fadeDuration = reducedMotion ? 0.1 : 0.8;
  const elementFadeDuration = reducedMotion ? 0.1 : 1.0;
  const titleFadeDuration = reducedMotion ? 0.1 : 1.2;

  // We use absolute timeline positions (e.g., 0, 0.2, 0.8) to prevent 
  // the 8-second bgImage animation from delaying the rest of the sequence.
  
  // 1. Container: starts at opacity 0, fades to opacity 1
  tl.to(container, {
    opacity: 1,
    duration: fadeDuration,
    ease: 'power2.out',
  }, 0);

  // 1.5 Background Image Ken Burns
  if (bgImage && !reducedMotion) {
    tl.to(
      bgImage,
      {
        scale: 1,
        duration: 8,
        ease: 'power1.inOut',
      },
      0
    );
  }

  // 2. Marquees fade in gently
  if (topMarquee && bottomMarquee) {
    tl.to(
      [topMarquee, bottomMarquee],
      {
        opacity: 1,
        duration: elementFadeDuration,
        ease: 'power2.inOut',
      },
      reducedMotion ? 0 : 0.2
    );
  }

  // 3. Scene label: fade in and slide up (Left Content)
  if (sceneLabel) {
    tl.to(
      sceneLabel,
      {
        opacity: 1,
        y: 0,
        duration: elementFadeDuration,
        ease: 'power3.out',
      },
      reducedMotion ? 0 : 0.8
    );
  }

  // 4. Title text: fade in and slide up
  if (title) {
    tl.to(
      title,
      {
        opacity: 1,
        y: 0,
        duration: titleFadeDuration,
        ease: 'power3.out',
      },
      reducedMotion ? 0 : 1.0
    );
  }

  // 5. Subtitle text: fade in and slide up
  if (subtitle) {
    tl.to(
      subtitle,
      {
        opacity: 1,
        y: 0,
        duration: elementFadeDuration,
        ease: 'power2.out',
      },
      reducedMotion ? 0 : 1.2
    );
  }

  // 6. Right Content: Image Container & Image parallax
  if (imageContainer && !reducedMotion) {
    tl.to(
      imageContainer,
      {
        opacity: 1,
        scale: 1,
        duration: 1.5,
        ease: 'power3.out',
      },
      1.4
    );
  } else if (imageContainer) {
    tl.to(imageContainer, { opacity: 1, duration: fadeDuration }, 0);
  }

  if (image && !reducedMotion) {
    tl.to(
      image,
      {
        scale: 1,
        duration: 2.5,
        ease: 'power2.out',
      },
      1.4 
    );
  }

  // 7. Right Content Description: fade in and slide up
  if (description) {
    tl.to(
      description,
      {
        opacity: 1,
        y: 0,
        duration: elementFadeDuration,
        ease: 'power2.out',
      },
      reducedMotion ? 0 : 2.0
    );
  }

  return tl;
}
