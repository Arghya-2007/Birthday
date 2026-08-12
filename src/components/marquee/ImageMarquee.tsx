'use client'

import Image from 'next/image'

const images = [
  '/images/image-1.jpg',
  '/images/image-2.jpg',
  '/images/image-3.jpg',
  '/images/image-4.jpg',
  '/images/image-5.jpg',
  '/images/image-6.jpg',
  '/images/image-7.jpg',
  '/images/profile.jpg',
]

export default function ImageMarquee() {
  return (
    <div className="relative z-20 w-full overflow-hidden bg-bg py-24 flex flex-col gap-10">
      <div className="absolute top-0 left-0 w-32 md:w-64 h-full bg-gradient-to-r from-bg to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 md:w-64 h-full bg-gradient-to-l from-bg to-transparent z-10 pointer-events-none" />
      
      {/* Decorative text */}
      <div className="w-full text-center relative z-20 mb-4 px-4">
        <h2 className="font-display text-3xl md:text-5xl text-champagne tracking-cinematic opacity-80 font-light italic">
          Beautiful Memories
        </h2>
        <div className="w-24 h-[1px] bg-champagne/30 mx-auto mt-6" />
      </div>

      <div className="flex w-fit animate-marquee hover:[animation-play-state:paused] gap-6 md:gap-8 pl-6 md:pl-8">
        {[...images, ...images].map((src, idx) => (
          <div 
            key={`row1-${idx}`} 
            className="relative w-[240px] h-[320px] md:w-[320px] md:h-[420px] rounded-xl overflow-hidden shrink-0 group border border-white/5 shadow-2xl"
          >
            <Image
              src={src}
              alt={`Memory ${idx}`}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              sizes="(max-width: 768px) 240px, 320px"
              priority={idx < 4}
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/0 transition-colors duration-500" />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
          </div>
        ))}
      </div>

      <div className="flex w-fit animate-marquee-reverse hover:[animation-play-state:paused] gap-6 md:gap-8 pl-6 md:pl-8">
        {[...images].reverse().concat([...images].reverse()).map((src, idx) => (
          <div 
            key={`row2-${idx}`} 
            className="relative w-[240px] h-[320px] md:w-[320px] md:h-[420px] rounded-xl overflow-hidden shrink-0 group border border-white/5 shadow-2xl"
          >
            <Image
              src={src}
              alt={`Memory ${idx}`}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              sizes="(max-width: 768px) 240px, 320px"
              priority={idx < 4}
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/0 transition-colors duration-500" />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}
