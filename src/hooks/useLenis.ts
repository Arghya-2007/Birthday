import Lenis from 'lenis'
import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from '@/animations/gsap'

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis()

    lenis.on('scroll', ScrollTrigger.update)

    // Store the callback so we can remove the exact same reference on cleanup
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tickerCallback)

    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove(tickerCallback)
    }
  }, [])
}
