'use client'

import Image from 'next/image'

export default function PartnersCarousel() {
  return (
    <section className="bg-white text-center space-y-8 py-20 px-4 sm:px-6 lg:px-8">
        {/* Eyebrow Badge (using matched brand red #E1000F) */}
        <div className="inline-flex items-center justify-center">
          <span className="text-[10px] font-semibold tracking-[0.25em] text-[#E1000F] uppercase bg-[#E1000F]/10 px-4 py-1.5 rounded-full animate-fade-in">
            Our Partners
          </span>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-3">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-[#141414] leading-tight font-sans">
            Working With The <span className="text-[#0b9940]">Best</span> In <span className="text-[#dea306]">France</span>
          </h2>
          <p className="text-xs sm:text-base text-gray-500 font-medium tracking-wide leading-relaxed">
            Proudly connected with leading hotels and hospitality brands across France.
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Michelin Star */}
          <div className="bg-[#0b9940]/10 rounded-[20px] p-6 flex items-center justify-center min-h-[145px] transition-all hover:scale-[1.02] active:scale-[0.98] duration-300 shadow-sm border border-[#0b9940]/20">
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

          {/* Card 2: Relais & Chateaux */}
          <div className="bg-[#0055A5]/10 rounded-[20px] p-6 flex items-center justify-center min-h-[145px] transition-all hover:scale-[1.02] active:scale-[0.98] duration-300 shadow-sm border border-[#0055A5]/20">
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

          {/* Card 3: Campanile */}
          <div className="bg-[#dea306]/10 rounded-[20px] p-6 flex items-center justify-center min-h-[145px] transition-all hover:scale-[1.02] active:scale-[0.98] duration-300 shadow-sm border border-[#dea306]/20">
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

          {/* Card 4: Best Western */}
          <div className="bg-[#E1000F]/10 rounded-[20px] p-6 flex items-center justify-center min-h-[145px] transition-all hover:scale-[1.02] active:scale-[0.98] duration-300 shadow-sm border border-[#E1000F]/20">
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