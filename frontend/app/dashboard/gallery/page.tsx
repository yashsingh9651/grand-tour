'use client'

import { useState } from 'react'
import { StudentLayout } from '@/components/student/student-layout'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Quote, Heart, ArrowRight } from 'lucide-react'

/* ─── Gallery Data ─── */
const GALLERY: GalleryItem[] = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80',
    name: 'Arjun Patel',
    hotel: 'Le Meurice, Paris',
    location: 'Paris, France',
    quote: 'Walking into the kitchen of a Michelin-star restaurant on my first day — that moment changed everything.',
    span: 'tall',
    accent: '#E1000F',
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    name: 'Priya Sharma',
    hotel: 'Four Seasons George V',
    location: 'Paris, France',
    quote: 'The concierge team treated me like family from day one. France taught me hospitality is about heart.',
    span: 'normal',
    accent: '#0055A5',
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    name: 'Rahul Deshmukh',
    hotel: 'Hôtel Plaza Athénée',
    location: 'Paris, France',
    quote: 'Every morning I cycled past the Eiffel Tower to work. Pinch-me moments became my daily routine.',
    span: 'wide',
    accent: '#dea306',
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80',
    name: 'Meera Nair',
    hotel: 'Château de Bagnols',
    location: 'Lyon, France',
    quote: 'Lyon is the food capital of the world, and I was learning from the best chefs in it.',
    span: 'normal',
    accent: '#0b9940',
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=800&q=80',
    name: 'Vikram Singh',
    hotel: 'Sofitel Marseille',
    location: 'Marseille, France',
    quote: 'The Mediterranean sun, the people, the food — Marseille gave me confidence I never knew I had.',
    span: 'tall',
    accent: '#0055A5',
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    name: 'Ananya Gupta',
    hotel: 'Le Bristol Paris',
    location: 'Paris, France',
    quote: 'From making croissants at 5 AM to exploring Montmartre at night — these were the best months of my life.',
    span: 'normal',
    accent: '#E1000F',
  },
  {
    id: 7,
    src: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80',
    name: 'Karan Mehta',
    hotel: 'InterContinental Bordeaux',
    location: 'Bordeaux, France',
    quote: 'The vineyards, the architecture, the energy — Bordeaux feels like a film you never want to end.',
    span: 'wide',
    accent: '#0b9940',
  },
  {
    id: 8,
    src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
    name: 'Sara Fernandes',
    hotel: 'Hôtel Negresco',
    location: 'Nice, France',
    quote: 'Nice was everything I dreamed of and more. The Côte d\'Azur sunset from the hotel terrace was unreal.',
    span: 'normal',
    accent: '#dea306',
  },
  {
    id: 9,
    src: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
    name: 'Riya Joshi',
    hotel: 'Pullman Toulouse',
    location: 'Toulouse, France',
    quote: 'I landed in Toulouse knowing no French. I left with a new language, new friends, and a new career path.',
    span: 'normal',
    accent: '#0055A5',
  },
]

interface GalleryItem {
  id: number
  src: string
  name: string
  hotel: string
  location: string
  quote: string
  span: 'normal' | 'tall' | 'wide'
  accent: string
}

/* ─── Lightbox Component ─── */
function Lightbox({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

      {/* Content */}
      <motion.div
        className="relative z-10 w-full max-w-4xl rounded-[2rem] overflow-hidden shadow-2xl"
        style={{ backgroundColor: 'var(--sp-surface)' }}
        initial={{ scale: 0.85, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Photo side */}
          <div className="relative aspect-square md:aspect-auto md:min-h-[480px]">
            <img
              src={item.src}
              alt={item.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {/* Location badge on image */}
            <div className="absolute bottom-5 left-5 flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5">
              <MapPin className="w-3 h-3 text-white" />
              <span className="text-[10px] font-bold text-white tracking-wider uppercase">{item.location}</span>
            </div>
          </div>

          {/* Story side */}
          <div className="p-8 md:p-10 flex flex-col justify-center relative">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: 'var(--sp-surface-2)', color: 'var(--sp-text-muted)' }}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Decorative quote mark */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
              style={{ backgroundColor: `${item.accent}15` }}
            >
              <Quote className="w-5 h-5" style={{ color: item.accent }} />
            </div>

            {/* Quote */}
            <p
              className="text-lg md:text-xl font-medium leading-relaxed mb-8 italic"
              style={{ color: 'var(--sp-text)', fontFamily: 'Georgia, serif' }}
            >
              &ldquo;{item.quote}&rdquo;
            </p>

            {/* Author info */}
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-offset-2"
                style={{ '--tw-ring-color': item.accent, '--tw-ring-offset-color': 'var(--sp-surface)' } as any}
              >
                <img src={item.src} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--sp-text)' }}>
                  {item.name}
                </h3>
                <p className="text-xs font-medium" style={{ color: 'var(--sp-text-muted)' }}>
                  {item.hotel}
                </p>
              </div>
            </div>

            {/* Accent bar */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1"
              style={{ background: `linear-gradient(90deg, ${item.accent}, transparent)` }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── Main Gallery Page ─── */
export default function GalleryPage() {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  return (
    <StudentLayout currentStep="gallery">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Hero Header ── */}
        <div className="relative overflow-hidden rounded-[2rem] p-8 sm:p-12 lg:min-h-[380px]" style={{ backgroundColor: '#0d0f12' }}>
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle,rgba(0,85,165,0.18)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[radial-gradient(circle,rgba(225,0,15,0.12)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(222,163,6,0.06)_0%,transparent_70%)] pointer-events-none" />

          {/* Subtle dot grid pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Right-side photo collage — larger, more prominent */}
          <div className="absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-4">
            {/* Main large photo */}
            <div
              className="w-36 lg:w-44 h-48 lg:h-56 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border-2 border-white/10 -rotate-3"
            >
              <img src={GALLERY[0].src} alt="" className="w-full h-full object-cover" />
            </div>
            {/* Stacked smaller photos */}
            <div className="flex flex-col gap-3 -ml-4">
              <div
                className="w-28 lg:w-32 h-24 lg:h-28 rounded-xl overflow-hidden shadow-xl shadow-black/30 border-2 border-white/10 rotate-4"
              >
                <img src={GALLERY[3].src} alt="" className="w-full h-full object-cover" />
              </div>
              <div
                className="w-28 lg:w-32 h-24 lg:h-28 rounded-xl overflow-hidden shadow-xl shadow-black/30 border-2 border-white/10 -rotate-2"
              >
                <img src={GALLERY[5].src} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <div className="relative z-10 max-w-xl lg:max-w-lg">
            {/* Badge */}
            <div className="inline-flex items-center mb-5">
              <span className="text-[10px] font-bold tracking-[0.25em] text-white/70 uppercase bg-white/8 border border-white/10 px-4 py-1.5 rounded-full">
                Student Gallery
              </span>
            </div>

            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.15] mb-4"
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              Moments that
              <br />
              defined their{' '}
              <span
                className="inline-block px-2 py-0.5 rounded-lg"
                style={{ backgroundColor: '#dea306', color: '#000' }}
              >
                journey
              </span>
            </h1>

            <p className="text-sm text-white/50 font-medium leading-relaxed max-w-lg">
              Real photos, real stories — from students who traded textbooks for Parisian kitchens,
              Mediterranean sunsets, and careers they never imagined possible.
            </p>
            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-6 mt-7">
              {[
                { num: '5,000+', label: 'Students Placed', color: '#0b9940' },
                { num: '200+', label: 'Partner Hotels', color: '#0055A5' },
                { num: '15+', label: 'Cities in France', color: '#E1000F' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2.5">
                  <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: stat.color }} />
                  <div>
                    <p className="text-lg font-bold text-white leading-none">{stat.num}</p>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-0.5">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Masonry Photo Wall ── */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {GALLERY.map((item, idx) => {
            const isHovered = hoveredId === item.id
            const heightClass =
              item.span === 'tall'
                ? 'h-[420px] sm:h-[480px]'
                : item.span === 'wide'
                  ? 'h-[260px] sm:h-[300px]'
                  : 'h-[280px] sm:h-[340px]'

            return (
              <motion.div
                key={item.id}
                className="break-inside-avoid"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
              >
                {/* Separate div for CSS hover transitions — Framer doesn't touch this */}
                <div
                  className={`relative ${heightClass} rounded-2xl overflow-hidden cursor-pointer group`}
                  onClick={() => setSelectedItem(item)}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Photo */}
                  <img
                    src={item.src}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110"
                    style={{ transition: 'scale 700ms ease-out' }}
                  />

                  {/* Permanent subtle vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {/* Accent color strip at top */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100"
                    style={{ backgroundColor: item.accent, transition: 'opacity 500ms ease' }}
                  />

                  {/* Heart badge top-right */}
                  <div
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                    style={{ transition: 'opacity 500ms ease, translate 500ms ease' }}
                  >
                    <div
                      className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center"
                    >
                      <Heart className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>

                  {/* Bottom info bar */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    {/* Name & hotel (always visible) */}
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-white tracking-tight leading-tight">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin className="w-2.5 h-2.5 text-white/60" />
                          <span className="text-[10px] font-semibold text-white/60 tracking-wider uppercase">
                            {item.hotel}
                          </span>
                        </div>
                      </div>

                      {/* Read story arrow */}
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                        style={{ backgroundColor: item.accent, transition: 'opacity 500ms ease, translate 500ms ease' }}
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>

                    {/* Quote preview (visible on hover) */}
                    <div
                      className="overflow-hidden max-h-0 group-hover:max-h-16"
                      style={{ transition: 'max-height 500ms ease-out' }}
                    >
                      <p className="text-[11px] text-white/70 leading-relaxed mt-2.5 italic line-clamp-2" style={{ fontFamily: 'Georgia, serif' }}>
                        &ldquo;{item.quote.slice(0, 80)}...&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Colored border on hover */}
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      border: `2px solid ${isHovered ? `${item.accent}40` : 'transparent'}`,
                      transition: 'border-color 500ms ease',
                    }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ── Bottom CTA Strip ── */}
        <div
          className="rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ backgroundColor: 'var(--sp-surface)', border: '1px solid var(--sp-border)' }}
        >
          <div className="text-center sm:text-left">
            <h3 className="text-base font-bold tracking-tight mb-1" style={{ color: 'var(--sp-text)' }}>
              Want to be featured here?
            </h3>
            <p className="text-xs font-medium" style={{ color: 'var(--sp-text-muted)' }}>
              Complete your journey and share your story with the next generation of students.
            </p>
          </div>
          <a
            href="/dashboard/application"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: '#E1000F', color: '#fff' }}
          >
            Continue Journey
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedItem && (
          <Lightbox item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </AnimatePresence>
    </StudentLayout>
  )
}
