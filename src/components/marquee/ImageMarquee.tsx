'use client'

import Image from 'next/image'

const memories = [
  { src: '/images/image-1.jpg', title: 'The First Spark', date: '2019' },
  { src: '/images/image-2.jpg', title: 'Midnight Strolls', date: '2020' },
  { src: '/images/image-3.jpg', title: 'Endless Laughter', date: '2021' },
  { src: '/images/image-4.jpg', title: 'A New Chapter', date: '2021' },
  { src: '/images/image-5.jpg', title: 'Ocean Whispers', date: '2022' },
  { src: '/images/image-6.jpg', title: 'Golden Hours', date: '2023' },
  { src: '/images/image-7.jpg', title: 'City Lights', date: '2023' },
  { src: '/images/profile.jpg', title: 'Forever Us', date: '2024' },
]

export default function ImageMarquee() {
  return (
    <div className="relative z-20 w-full overflow-hidden bg-bg py-32 flex flex-col gap-16">
      {/* Gradients for smooth fade out at edges */}
      <div className="absolute top-0 left-0 w-32 md:w-80 h-full bg-gradient-to-r from-bg via-bg/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 md:w-80 h-full bg-gradient-to-l from-bg via-bg/80 to-transparent z-10 pointer-events-none" />
      
      {/* Decorative text */}
      <div className="w-full text-center relative z-20 mb-8 px-4 flex flex-col items-center">
        <span className="text-champagne/60 uppercase tracking-[0.3em] text-xs font-semibold mb-4 block">
          A Journey Through Time
        </span>
        <h2 className="font-display text-4xl md:text-6xl text-champagne tracking-cinematic opacity-90 font-light italic">
          Beautiful Memories
        </h2>
        <div className="flex items-center gap-4 mt-8">
          <div className="w-12 h-[1px] bg-champagne/20" />
          <div className="w-2 h-2 rounded-full bg-champagne/40" />
          <div className="w-12 h-[1px] bg-champagne/20" />
        </div>
      </div>

      <div className="flex w-fit animate-marquee hover:[animation-play-state:paused] gap-8 md:gap-12 pl-8 md:pl-12">
        {[...memories, ...memories].map((memory, idx) => (
          <div 
            key={`row1-${idx}`} 
            className={`relative w-[260px] h-[360px] md:w-[340px] md:h-[460px] rounded-2xl overflow-hidden shrink-0 group shadow-2xl transition-all duration-700 hover:z-30 hover:-translate-y-4 hover:shadow-[0_20px_50px_rgba(201,169,110,0.15)] ${idx % 2 === 0 ? 'mt-8' : '-mt-8'}`}
          >
            <div className="absolute inset-0 bg-walnut/20 mix-blend-overlay z-10 pointer-events-none group-hover:opacity-0 transition-opacity duration-700" />
            <Image
              src={memory.src}
              alt={memory.title}
              fill
              className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 blur-[2px] grayscale-[30%] group-hover:blur-0 group-hover:grayscale-0"
              sizes="(max-width: 768px) 260px, 340px"
              priority={idx < 4}
            />
            {/* Elegant overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-700" />
            
            <div className="absolute inset-0 ring-1 ring-inset ring-champagne/20 rounded-2xl group-hover:ring-champagne/50 transition-colors duration-700" />

            <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out flex flex-col items-center text-center">
              <span className="text-champagne font-display italic text-2xl mb-2">{memory.title}</span>
              <div className="w-8 h-[1px] bg-champagne/50 mb-3" />
              <span className="text-white/60 font-body text-xs tracking-widest uppercase">{memory.date}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex w-fit animate-marquee-reverse hover:[animation-play-state:paused] gap-8 md:gap-12 pl-8 md:pl-12 mt-4">
        {[...memories].reverse().concat([...memories].reverse()).map((memory, idx) => (
          <div 
            key={`row2-${idx}`} 
            className={`relative w-[260px] h-[360px] md:w-[340px] md:h-[460px] rounded-2xl overflow-hidden shrink-0 group shadow-2xl transition-all duration-700 hover:z-30 hover:-translate-y-4 hover:shadow-[0_20px_50px_rgba(201,169,110,0.15)] ${idx % 2 === 0 ? '-mt-8' : 'mt-8'}`}
          >
            <div className="absolute inset-0 bg-walnut/20 mix-blend-overlay z-10 pointer-events-none group-hover:opacity-0 transition-opacity duration-700" />
            <Image
              src={memory.src}
              alt={memory.title}
              fill
              className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 blur-[2px] grayscale-[30%] group-hover:blur-0 group-hover:grayscale-0"
              sizes="(max-width: 768px) 260px, 340px"
              priority={idx < 4}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-700" />
            <div className="absolute inset-0 ring-1 ring-inset ring-champagne/20 rounded-2xl group-hover:ring-champagne/50 transition-colors duration-700" />

            <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out flex flex-col items-center text-center">
              <span className="text-champagne font-display italic text-2xl mb-2">{memory.title}</span>
              <div className="w-8 h-[1px] bg-champagne/50 mb-3" />
              <span className="text-white/60 font-body text-xs tracking-widest uppercase">{memory.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
