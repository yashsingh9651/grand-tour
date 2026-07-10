'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function HomeCTA() {
  const { status } = useSession()
  const isLoggedIn = status === 'authenticated'

  return (
    <section className="bg-[#fffcf7] py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Outer Banner Wrapper */}
      <div className="max-w-7xl mx-auto relative rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] bg-slate-900 min-h-[420px] flex items-center justify-center">
        {/* Background Image with Dark Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px]" />

        {/* Content Container */}
        <div className="relative z-10 text-center px-6 py-12 max-w-3xl mx-auto flex flex-col items-center gap-6">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center justify-center">
            <span className="text-[10px] tracking-[0.2em] font-bold text-white/90 bg-white/10 backdrop-blur-xs border border-white/20 px-4 py-1.5 rounded-full uppercase">
              Ready When You Are
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-tight select-none">
            Your Future Career <br />
            Starts In{' '}
            <span className="inline-block bg-[#dea306] text-black px-4 rounded-[0.8rem] font-bold">
              France.
            </span>
          </h2>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <Link href={isLoggedIn ? '/dashboard' : '/login'}>
              <button className="bg-white hover:bg-slate-100 active:scale-95 text-slate-950 font-bold px-8 py-3 rounded-full text-sm uppercase tracking-wider shadow-lg transition-all">
                Apply Now
              </button>
            </Link>
            <Link href="#">
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-xs active:scale-95 border border-white/20 text-white font-bold px-8 py-3 rounded-full text-sm uppercase tracking-wider transition-all">
                Contact Us
              </button>
            </Link>
          </div>

          {/* Trust Banner message */}
          <p className="text-sm text-white/80 font-semibold tracking-wide flex items-center gap-1.5 mt-2">
            🎓 Trusted by 5000+ students across India.
          </p>
        </div>

        {/* Polaroid 1 (Left Overlap) */}
        <motion.div 
          className="absolute -left-10 lg:left-8 top-1/2 -translate-y-1/2 z-20 hidden md:block"
          initial={{ opacity: 0, rotate: -25, x: -30 }}
          whileInView={{ opacity: 1, rotate: -12, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          whileHover={{ rotate: -5, scale: 1.05, zIndex: 30 }}
        >
          <div className="bg-white p-2.5 pb-6 shadow-[0_15px_35px_rgba(0,0,0,0.3)] rounded-sm w-[170px] border border-slate-100">
            <div className="w-full h-[150px] overflow-hidden rounded-sm bg-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=400&q=80" 
                alt="French alleyway" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </motion.div>

        {/* Polaroid 2 (Right Overlap) */}
        <motion.div 
          className="absolute -right-10 lg:right-8 top-1/2 -translate-y-1/2 z-20 hidden md:block"
          initial={{ opacity: 0, rotate: 25, x: 30 }}
          whileInView={{ opacity: 1, rotate: 8, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          whileHover={{ rotate: 3, scale: 1.05, zIndex: 30 }}
        >
          <div className="bg-white p-2.5 pb-6 shadow-[0_15px_35px_rgba(0,0,0,0.3)] rounded-sm w-[170px] border border-slate-100">
            <div className="w-full h-[150px] overflow-hidden rounded-sm bg-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=400&q=80" 
                alt="Eiffel Tower sunset" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </motion.div>

        {/* Waving French Flag Sticker Top-Right */}
        <div className="absolute top-8 right-12 z-20 select-none animate-bounce hidden sm:block">
          <span className="text-4xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)] rotate-[15deg] block">🇫🇷</span>
        </div>
      </div>
    </section>
  )
}
