import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function createTextOverlayTrigger(el: HTMLElement): ScrollTrigger {
  return ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    end: 'bottom 15%',
    scrub: true,
    animation: gsap.timeline()
      .fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.25 })
      .to(el, { opacity: 1, duration: 0.5 })
      .to(el, { opacity: 0, y: -30, duration: 0.25 })
  })
}

export function createMemoryReveal(
  wrapperEl: HTMLElement,
  imageEl: HTMLElement,
  captionEl: HTMLElement
): ScrollTrigger {
  return ScrollTrigger.create({
    trigger: wrapperEl,
    start: 'top 85%',
    end: 'bottom 15%',
    scrub: true,
    animation: gsap.timeline()
      .fromTo(imageEl, { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1.0, duration: 0.3 })
      .fromTo(captionEl, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.2 }, '<0.1')
      .to([imageEl, captionEl], { opacity: 1, duration: 0.4 })
      .to([imageEl, captionEl], { opacity: 0, y: -20, duration: 0.2 })
  })
}

export function createTraitReveal(
  wrapperEl: HTMLElement,
  traitEls: HTMLElement[]
): ScrollTrigger {
  return ScrollTrigger.create({
    trigger: wrapperEl,
    start: 'top 80%',
    end: 'bottom 20%',
    scrub: true,
    animation: gsap.timeline()
      .fromTo(traitEls, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 })
      .to(traitEls, { opacity: 1, duration: 0.4 })
      .to(traitEls, { opacity: 0, y: -20, duration: 0.2 })
  })
}
