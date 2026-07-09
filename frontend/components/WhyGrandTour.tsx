'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function WhyGrandTour() {
  const features = [
    {
      text: 'End-to-end placement & documentation',
      color: 'bg-[#16A34A]',
    },
    {
      text: 'Guaranteed visa assistance & housing',
      color: 'bg-[#2563EB]',
    },
    {
      text: 'Career mentorship from day one',
      color: 'bg-[#F9B302]',
    },
  ]

  return (
    <section className="relative bg-white py-20 px-4 sm:px-6 lg:px-8">
      {/* Radial gradient glowing spots (bleeds naturally across sections, parent page hides horizontal overflow) */}
      <div className="absolute -top-[200px] -right-[150px] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(249,179,2,0.22)_0%,rgba(249,179,2,0)_70%)] pointer-events-none select-none" />
      <div className="absolute bottom-0 -left-[150px] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(37,99,235,0.22)_0%,rgba(37,99,235,0)_70%)] pointer-events-none select-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center">
        {/* Left Column: Text Content */}
        <div className="lg:col-span-1 space-y-6 text-left">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center">
            <span className="text-xs font-semibold tracking-[0.25em] text-[#DC2626] uppercase bg-[#FEF2F2] px-4 py-2 rounded-full">
              Why Grand Tour
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-[#141414] leading-[1.12] font-sans">
            We handle everything.<br />
            You live the <span className="text-[#16A34A]">experience.</span>
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-base md:text-lg text-gray-500 font-medium leading-relaxed">
            From your first application to your first day on the job in France — placement,
            paperwork, visa, housing and travel are all taken care of. One team, one seamless
            journey.
          </p>

          {/* Features List */}
          <div className="space-y-4 pt-2">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3.5">
                <div className={`w-8 h-8 rounded-full ${f.color} flex items-center justify-center shrink-0 shadow-sm`}>
                  <Check className="w-5 h-5 text-white stroke-[3]" />
                </div>
                <span className="text-xs sm:text-base md:text-lg font-bold text-[#141414] tracking-tight">
                  {f.text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest text-white bg-[#DC2626] hover:bg-[#B91C1C] active:scale-95 transition-all duration-200 shadow-xl shadow-red-500/20"
            >
              Start Your Application
            </Link>
          </div>

        </div>

        {/* Right Column: Visual Collage */}
        <div className="lg:col-span-1 relative flex items-center justify-center lg:justify-end pt-10 lg:pt-0">

          {/* Soft background yellow glow */}
          <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-gradient-to-tr from-transparent via-amber-500/5 to-[#F9B302]/10 blur-3xl pointer-events-none" />

          {/* Collage Container */}
          <div className="relative w-9/12">

            {/* Main Photo Card */}
            <div className="relative w-full aspect-square ml-auto">
              <Image
                src="/vertical-frame.png"
                alt="Hospitality Mentor and Student Smiling"
                width={800}
                height={800}
                className="w-full h-full object-cover rounded-[32px]"
              />

              {/* Overlapping Bonjour sticker */}
              <div
                className="absolute -top-5 left-1/2 bg-[#F9B302] text-black font-medium px-4 py-2 rounded-[6px] shadow-md -rotate-6 select-none font-serif italic flex items-center gap-1"
                style={{ transformOrigin: 'center' }}
              >
                Bonjour! 👋
              </div>
            </div>
            <Image
              src="/horizontal-frame.png"
              alt="Culinary Kitchen Team Placements"
              width={600}
              height={600}
              className="w-auto h-40 aspect-3/2 absolute top-1/2 rounded-[24px] -left-32 object-cover"
            />

          </div>

        </div>

      </div>
    </section>
  )
}
