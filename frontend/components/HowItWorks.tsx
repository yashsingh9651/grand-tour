'use client'

import { ClipboardList, MessageSquareMore, FileText, FileCheck, Plane, Rocket } from 'lucide-react'

export default function HowItWorks() {
  const steps = [
    {
      num: 1,
      title: 'Apply',
      desc: 'Submit your profile in minutes — no paperwork stress.',
      icon: ClipboardList,
      color: 'bg-[#DC2626]', // Red
      offset: 'lg:mt-20',
    },
    {
      num: 2,
      title: 'Interview',
      desc: 'Meet partner hotels through guided virtual interviews.',
      icon: MessageSquareMore,
      color: 'bg-[#2563EB]', // Blue
      offset: 'lg:mt-0',
    },
    {
      num: 3,
      title: 'Process',
      desc: 'We prepare and verify every document for you.',
      icon: FileText,
      color: 'bg-[#16A34A]', // Green
      offset: 'lg:mt-32',
    },
    {
      num: 4,
      title: 'Visa',
      desc: 'Guided, guaranteed visa assistance start to finish.',
      icon: FileCheck,
      color: 'bg-[#F9B302]', // Yellow
      offset: 'lg:mt-0',
    },
    {
      num: 5,
      title: 'Fly to France',
      desc: 'Flights, transfers and arrival — fully supported.',
      icon: Plane,
      color: 'bg-[#2563EB]', // Blue
      offset: 'lg:mt-32',
    },
    {
      num: 6,
      title: 'Start Internship',
      desc: 'Walk into your hotel and begin your career.',
      icon: Rocket,
      color: 'bg-[#16A34A]', // Green
      offset: 'lg:mt-16',
    },
  ]

  return (
    <section className="relative bg-white py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* ── Radial Background Mesh Glowing Effects ── */}
      <div className="absolute top-1/4 left-20 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(37,99,235,0.22)_0%,rgba(37,99,235,0)_70%)] pointer-events-none select-none -translate-x-1/3" />
      <div className="absolute bottom-1/4 right-20 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(22,163,74,0.22)_0%,rgba(22,163,74,0)_70%)] pointer-events-none select-none translate-x-1/3" />

      <div className="relative z-10 text-center space-y-12">
        
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center justify-center">
          <span className="text-[11px] font-extrabold tracking-[0.2em] text-[#16A34A] uppercase bg-[#E6F7F0] border border-[#D1F2E2] px-4 py-1.5 rounded-full">
            The Journey
          </span>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-3 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#141414] leading-[1.2] font-sans">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-semibold leading-relaxed">
            Six guided stops from your application to your first day in. Follow the map. ✈️
          </p>
        </div>

        {/* Journey Map Container */}
        <div className="relative w-full pt-10">
          
          {/* Desktop SVG Dotted Connection Line (Hidden on Mobile) */}
          <svg className="hidden lg:block absolute inset-x-0 top-0 w-full h-[380px] pointer-events-none z-0" viewBox="0 0 1200 400" preserveAspectRatio="none" fill="none">
            <path
              d="M 100 230 C 200 130, 200 70, 300 70 C 400 70, 400 330, 500 330 C 600 330, 600 70, 700 70 C 800 70, 800 330, 900 330 C 1000 330, 1000 180, 1100 180"
              stroke="#A1B3D4"
              strokeWidth="2.5"
              strokeDasharray="6 8"
              strokeLinecap="round"
            />
          </svg>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 relative z-10">
            {steps.map((s, idx) => {
              const Icon = s.icon
              return (
                <div key={idx} className={`flex flex-col items-center ${s.offset} transition-all duration-300`}>
                  
                  {/* Card Shell */}
                  <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-[0_15px_35px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 w-full max-w-[240px] text-left flex flex-col justify-between group hover:scale-[1.03] active:scale-[0.98]">
                    
                    {/* Top Icon Block (matches step brand color) */}
                    <div className={`relative w-12 h-12 flex items-center justify-center rounded-2xl mb-5 shrink-0 shadow-sm ${s.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                      
                      {/* Step Number Dot (black circle with white text) */}
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#141414] text-white font-black text-[10px] flex items-center justify-center shadow-md border-2 border-white">
                        {s.num}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-base text-[#141414] tracking-tight">
                        {s.title}
                      </h4>
                      <p className="text-xs text-gray-400 leading-normal font-medium tracking-tight">
                        {s.desc}
                      </p>
                    </div>

                  </div>

                </div>
              )
            })}
          </div>

        </div>

      </div>
    </section>
  )
}
