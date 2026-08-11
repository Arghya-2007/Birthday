import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

gsap.defaults({
  ease: 'power2.out',
  duration: 1.0,
})

export default gsap
export { ScrollTrigger }
