'use client'
import Image from 'next/image'
import { useState } from 'react'

const PARTNERS: { name: string; src: string }[] = [
  { name: 'Marriott Bonvoy', src: '/hero.png' },
  { name: 'Four Seasons', src: '/horizontal-frame.png' },
  { name: 'Accor Hotels', src: '/logo.png' },
  { name: 'Hyatt', src: '/hero.png' },
  { name: 'Ritz-Carlton', src: '/vertical-frame.png' },
  { name: 'InterContinental', src: '/hero.png' },
  { name: 'Hilton', src: '/hero.png' },
  { name: 'Radisson Blu', src: '/hero.png' },
  { name: 'Sofitel', src: '/hero.png' },
  { name: 'Pullman Hotels', src: '/hero.png' },
  { name: 'Novotel', src: '/hero.png' },
  { name: 'Sheraton', src: '/hero.png' },
]

const STRIPE = ['#2563EB', '#DC2626', '#16A34A', '#F9B302']

function LogoTile({ name, src }: { name: string; src: string }) {
  const [errored, setErrored] = useState(false)
  const initial = name.charAt(0)

  return (
    <div className="group inline-flex items-center justify-center mx-8 shrink-0">
      {errored ? (
        /* ── Fallback: styled initial badge ── */
        <div
          className="h-28 w-80 rounded-xl bg-slate-100 flex items-center justify-center
                     text-slate-400 font-black text-lg select-none
                     group-hover:bg-slate-200 transition-colors duration-300"
          title={name}
        >
          {initial}
        </div>
      ) : (
        /* ── Actual logo image ── */
        <div
          className="relative h-28 w-80 rounded-xl overflow-hidden"
          title={name}
        >
          <Image
            src={src}
            alt={name}
            width={140}
            height={40}
            className="h-full w-full"
            onError={() => setErrored(true)}
            loading="lazy"
          />
        </div>
      )}
    </div>
  )
}

export default function PartnersCarousel() {
  // 4× duplication ensures seamless loop at any viewport width
  const row = [...PARTNERS, ...PARTNERS, ...PARTNERS, ...PARTNERS]

  return (
    <section className="w-full bg-white mb-7">

      {/* ── Top 4-color stripe ── */}
      <div className="flex h-[3px]">
        {STRIPE.map((c) => <div key={c} className="flex-1" style={{ backgroundColor: c }} />)}
      </div>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center
                      justify-between gap-3 px-8 md:px-14 py-8 border-b border-slate-100">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-1">
            Placement Network
          </p>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
            Our Partners
          </h2>
        </div>
        <p className="text-xs text-slate-400 max-w-md leading-relaxed">
          Students are placed at 200+ world-class hotels, restaurants
          and hospitality brands across France and Europe.
        </p>
      </div>

      {/* ── Continuous logo marquee ── */}
      <div className="relative flex overflow-x-hidden py-10 border-b border-slate-100">

        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, white 40%, transparent)' }} />

        {/* Scrolling track */}
        <div className="flex items-center marquee-track">
          {row.map((p, i) => (
            <LogoTile key={i} name={p.name} src={p.src} />
          ))}
        </div>

        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(270deg, white 40%, transparent)' }} />
      </div>

      {/* ── Bottom 4-color stripe ── */}
      <div className="flex h-[3px]">
        {STRIPE.map((c) => <div key={c} className="flex-1" style={{ backgroundColor: c }} />)}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          align-items: center;
          white-space: nowrap;
          animation: marquee-scroll 100s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}} />
    </section>
  )
}
