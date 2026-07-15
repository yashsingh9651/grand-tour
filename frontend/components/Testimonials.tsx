'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

interface TestimonialCard {
  id: number
  rating: number
  quote: string
  name: string
  description: string
  avatarUrl: string
  isDark?: boolean
}

export default function Testimonials() {
  const testimonials: TestimonialCard[] = [
    {
      id: 1,
      rating: 5,
      quote: '"I never imagined I\'d be working at a Parisian hotel at 21. Grand Tour handled my visa and housing — I just packed my bags and flew."',
      name: 'Ananya Rao',
      description: 'IHM Bangalore · Le Grand Palais, Paris',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80',
    },
    {
      id: 2,
      rating: 5,
      quote: '"The interview prep was unreal. I walked into my kitchen placement in Lyon feeling ready. Best decision of my life."',
      name: 'Rohan Mehta',
      description: 'Culinary Academy · Château Belrive, Lyon',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
      isDark: true,
    },
    {
      id: 3,
      rating: 5,
      quote: '"From documents to my flight, everything was organised. My parents felt safe, and I got the international career I dreamed of."',
      name: 'Sara Fernandes',
      description: 'WGSHA Manipal · Côte d\'Azur Resorts, Nice',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    },
  ]

  return (
    <section className="relative bg-[#fffcf7] py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative Stickers */}
      {/* Croissant Sticker Left */}
      <motion.div 
        className="absolute left-6 md:left-12 top-1/4 -translate-y-1/2 select-none pointer-events-none hidden sm:block"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-7xl md:text-8xl block filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.1)] -rotate-[15deg]">🥐</span>
      </motion.div>

      {/* Eiffel Tower / Red Sticker Right */}
      <motion.div 
        className="absolute right-6 md:right-12 top-1/4 -translate-y-1/2 select-none pointer-events-none hidden sm:block"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-7xl md:text-8xl block filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.1)] rotate-[10deg]">🗼</span>
      </motion.div>

      {/* Sparks Bottom Left */}
      <div className="absolute left-10 md:left-24 bottom-1/4 select-none pointer-events-none opacity-60 hidden sm:block">
        <span className="text-3xl block text-[#dea306]">✨</span>
      </div>

      <div className="relative z-10 text-center space-y-4 max-w-5xl mx-auto mb-10 lg:mb-20">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center justify-center">
          <span className="text-[11px] font-extrabold tracking-[0.2em] text-[#0b9940] uppercase bg-[#0b9940]/10 border border-[#0b9940]/20 px-4 py-1.5 rounded-full">
            Real Stories
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-[#141414] leading-tight">
          From their words, not ours.
        </h2>
      </div>

      {/* Testimonials Grid */}
      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8 items-start">
        {testimonials.map((t) => (
          <div key={t.id} className="flex flex-col gap-6 group">
            {/* Speech Bubble Card */}
            <div 
              className={`relative p-6 sm:p-8 rounded-[1.8rem] shadow-[0_15px_45px_rgba(0,0,0,0.06)] border border-slate-100/50 flex flex-col gap-4 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_20px_55px_rgba(0,0,0,0.1)] ${
                t.isDark ? 'bg-[#141416] text-white border-transparent' : 'bg-white text-slate-700'
              }`}
            >
              {/* Star Rating */}
              <div className="flex gap-1">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#dea306] stroke-[#dea306]" />
                ))}
              </div>

              {/* Quote text */}
              <p className="text-sm sm:text-base leading-relaxed font-medium">
                {t.quote}
              </p>

              {/* Speech bubble tail pointer */}
              <div 
                className={`absolute -bottom-3 left-10 w-6 h-6 rotate-45 ${
                  t.isDark ? 'bg-[#141416]' : 'bg-white border-r border-b border-slate-100/50'
                }`}
              />
            </div>

            {/* Author Profile Information */}
            <div className="flex items-center gap-3.5 px-4">
              <img
                src={t.avatarUrl}
                alt={t.name}
                className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-sm"
              />
              <div className="text-left">
                <h4 className="font-extrabold text-sm text-[#141414]">
                  {t.name}
                </h4>
                <p className="text-[11px] text-gray-500 font-semibold mt-0.5 leading-none">
                  {t.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
