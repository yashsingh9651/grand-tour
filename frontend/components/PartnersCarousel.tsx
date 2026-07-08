'use client'

import Image from 'next/image'

export default function PartnersCarousel() {
  return (
    <section className="bg-white text-center space-y-8 py-16 px-4 sm:px-6 lg:px-8">
        {/* Eyebrow Badge (using matched hero red #DC2626) */}
        <div className="inline-flex items-center justify-center">
          <span className="text-[10px] font-semibold tracking-[0.25em] text-[#DC2626] uppercase bg-[#FEF2F2] px-4 py-1 rounded-full animate-fade-in">
            Our Partners
          </span>
        </div>

        {/* Heading & Subtitle (using matched hero colors: Green #16A34A and Yellow #F9B302) */}
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-wide text-[#141414] leading-[1.2] font-sans">
            Working With The <span className="text-[#16A34A]">Best</span> In <span className="text-[#F9B302]">France</span>
          </h2>
          <p className="text-xs sm:text-base text-gray-500 font-medium tracking-wide leading-relaxed">
            Proudly connected with leading hotels and hospitality brands across France.
          </p>
        </div>

        {/* Partners Grid (using matched background tints and borders) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Michelin Star (using Green #16A34A) */}
          <div className="bg-[#16a34a1e] rounded-[20px] p-6 flex items-center justify-center min-h-[145px] transition-all hover:scale-[1.02] active:scale-[0.98] duration-300 shadow-sm border border-[#16A34A20]">
            <div className="relative w-full h-[65px]">
              <Image
                src="/partners/michelin.png"
                alt="Michelin Star Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Card 2: Relais & Chateaux (using Blue #2563EB) */}
          <div className="bg-[#2564eb21] rounded-[20px] p-6 flex items-center justify-center min-h-[145px] transition-all hover:scale-[1.02] active:scale-[0.98] duration-300 shadow-sm border border-[#2563EB20]">
            <div className="relative w-full h-[75px]">
              <Image
                src="/partners/relais.png"
                alt="Relais & Chateaux Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Card 3: Campanile (using Yellow #F9B302) */}
          <div className="bg-[#f9b3021c] rounded-[20px] p-6 flex items-center justify-center min-h-[145px] transition-all hover:scale-[1.02] active:scale-[0.98] duration-300 shadow-sm border border-[#F9B30220]">
            <div className="relative w-full h-[50px]">
              <Image
                src="/partners/campanile.png"
                alt="Campanile Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Card 4: Best Western (using Red #DC2626) */}
          <div className="bg-[#dc26261f] rounded-[20px] p-6 flex items-center justify-center min-h-[145px] transition-all hover:scale-[1.02] active:scale-[0.98] duration-300 shadow-sm border border-[#DC262620]">
            <div className="relative w-full h-[65px]">
              <Image
                src="/partners/bestwestern.png"
                alt="Best Western Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

        </div>
    </section>
  )
}