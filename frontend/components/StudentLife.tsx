'use client'

import { motion } from 'framer-motion'
import { Kalam } from 'next/font/google'

const kalam = Kalam({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-kalam',
})

interface PolaroidCard {
  id: number
  title: string
  imageUrl: string
  tilt: string
  badge?: {
    text: string
    color: string
    shadow: string
  }
}

export default function StudentLife() {
  const cards: PolaroidCard[] = [
    {
      id: 1,
      title: 'First view of the Tower',
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
      tilt: '-rotate-[4deg]',
      badge: {
        text: 'Paris Bound',
        color: 'bg-[#E1000F] text-white',
        shadow: 'shadow-[#E1000F]/30',
      },
    },
    {
      id: 2,
      title: 'Bon appétit 🥐',
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
      tilt: 'rotate-[3deg]',
    },
    {
      id: 3,
      title: 'Where I work now',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
      tilt: '-rotate-[2deg]',
      badge: {
        text: 'New Life',
        color: 'bg-[#0b9940] text-white',
        shadow: 'shadow-[#0b9940]/30',
      },
    },
    {
      id: 4,
      title: 'My new family',
      imageUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=600&q=80',
      tilt: 'rotate-[2deg]',
    },
    {
      id: 5,
      title: 'In the kitchen',
      imageUrl: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=600&q=80',
      tilt: '-rotate-[3deg]',
      badge: {
        text: 'Hospitality',
        color: 'bg-[#0055A5] text-white',
        shadow: 'shadow-[#0055A5]/30',
      },
    },
    {
      id: 6,
      title: 'Evening walks',
      imageUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=600&q=80',
      tilt: 'rotate-[4deg]',
      badge: {
        text: 'Wanderlust',
        color: 'bg-[#dea306] text-black',
        shadow: 'shadow-[#dea306]/30',
      },
    },
  ]

  const duplicatedCards = [...cards, ...cards]

  return (
    <section className={`relative bg-[#0d0f12] py-24 px-4 sm:px-6 lg:px-8 overflow-hidden ${kalam.variable}`}>
      {/* Inline styles for the infinite marquee */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-infinite {
          animation: marquee 100s linear infinite;
        }
        .animate-marquee-infinite:hover {
          animation-play-state: paused;
        }
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      {/* Subtle French Flag-themed background glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(0,85,165,0.08)_0%,rgba(0,85,165,0)_70%)] pointer-events-none select-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(225,0,15,0.08)_0%,rgba(225,0,15,0)_70%)] pointer-events-none select-none" />

      <div className="relative z-10 text-center space-y-4 max-w-5xl mx-auto mb-4">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center justify-center">
          <span className="text-[11px] font-extrabold tracking-[0.2em] text-[#dea306] uppercase bg-[#dea306]/10 border border-[#dea306]/20 px-4 py-1.5 rounded-full">
            Student Life
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-tight">
          Life in <span className="text-[#dea306]">France</span>, unfiltered.
        </h2>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
          Real moments from real students — the food, the streets, the friends, the hotels. Hover to pause.
        </p>
      </div>

      {/* Infinite scrolling marquee container */}
      <div className="relative w-full overflow-hidden py-14 scrollbar-hidden">
        <div className="flex flex-row gap-8 md:gap-12 w-max px-4 animate-marquee-infinite">
          {duplicatedCards.map((card, idx) => (
            <motion.div
              key={`${card.id}-${idx}`}
              className={`relative ${card.tilt} shrink-0`}
              whileHover={{ 
                scale: 1.06, 
                rotate: 0, 
                zIndex: 50,
                transition: { duration: 0.2, ease: 'easeOut' }
              }}
            >
              {/* Polaroid Card Body - optimized rounded corners and aspect ratio */}
              <div className="bg-white p-3 pb-6 shadow-[0_25px_50px_rgba(0,0,0,0.3)] rounded-[1.1rem] w-[300px] flex flex-col gap-4 border border-slate-100/50">
                {/* Image frame - portrait aspect ratio & rounded corners */}
                <div className="w-full aspect-[3/4] overflow-hidden rounded-[.9rem] bg-slate-100 relative">
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Handwritten title - Kalam Font italic */}
                <span className={`${kalam.className} text-2xl italic font-bold text-slate-800 text-center tracking-wide block mt-2`}>
                  {card.title}
                </span>
              </div>

              {/* Boxy rounded sticker badge overlapping top-right */}
              {card.badge && (
                <div
                  className={`absolute -top-5 -right-2 rotate-[4deg] ${card.badge.color} ${card.badge.shadow} px-5 py-3 font-bold rounded-[0.9rem] shadow-lg select-none ${kalam.className}`}
                >
                  {card.badge.text}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
