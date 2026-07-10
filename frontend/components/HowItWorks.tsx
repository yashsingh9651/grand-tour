'use client'

import { ClipboardList, MessageSquareMore, FileText, FileCheck, Plane, Rocket } from 'lucide-react'

export default function HowItWorks() {
  const steps = [
    {
      num: 1,
      title: 'Apply',
      desc: 'Submit your profile in minutes — no paperwork stress.',
      icon: ClipboardList,
      iconBg: '#E1000F',
    },
    {
      num: 2,
      title: 'Interview',
      desc: 'Meet partner hotels through guided virtual interviews.',
      icon: MessageSquareMore,
      iconBg: '#2563EB',
    },
    {
      num: 3,
      title: 'Process',
      desc: 'We prepare and verify every document for you.',
      icon: FileText,
      iconBg: '#16A34A',
    },
    {
      num: 4,
      title: 'Visa',
      desc: 'Guided, guaranteed visa assistance start to finish.',
      icon: FileCheck,
      iconBg: '#F9B302',
    },
    {
      num: 5,
      title: 'Fly to France',
      desc: 'Flights, transfers and arrival — fully supported.',
      icon: Plane,
      iconBg: '#2563EB',
    },
    {
      num: 6,
      title: 'Start Internship',
      desc: 'Walk into your hotel and begin your career.',
      icon: Rocket,
      iconBg: '#16A34A',
    },
  ]
  const positions = [
    { left: '0%',     top: '0px'   },  // 1 Apply
    { left: '20%',   top: '90px'  },  // 2 Interview  (zigzag down)
    { left: '38%',   top: '170px' },  // 3 Process    (continue down)
    { left: '55%',   top: '40px'  },  // 4 Visa       (jump back up)
    { left: '70%',   top: '200px' },  // 5 Fly        (back down)
    { left: '88%',   top: '230px' },  // 6 Internship (settle at bottom-right)
  ]

  return (
    <section className="relative bg-white py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">

      {/* ── Radial Background Glows ── */}
      <div className="absolute top-1/4 left-20 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(37,99,235,0.15)_0%,rgba(37,99,235,0)_70%)] pointer-events-none select-none -translate-x-1/3" />
      <div className="absolute bottom-1/4 right-20 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(22,163,74,0.15)_0%,rgba(22,163,74,0)_70%)] pointer-events-none select-none translate-x-1/3" />

      <div className="relative z-10 text-center space-y-10">

        {/* Eyebrow Badge */}
        <div className="inline-flex items-center justify-center">
          <span className="text-[11px] font-extrabold tracking-[0.2em] text-[#16A34A] uppercase bg-[#E6F7F0] border border-[#D1F2E2] px-4 py-1.5 rounded-full">
            The Journey
          </span>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-3 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#141414] leading-[1.2]">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-semibold leading-relaxed">
            Six guided stops from your application to your first day in. Follow the map. ✈️
          </p>
        </div>

        {/* ───── DESKTOP: Scattered diagonal zigzag ───── */}
        <div className="hidden lg:block relative w-full" style={{ height: '420px' }}>

          {/* SVG dashed connector lines between cards */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 1000 420"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M 90 65 C 160 65, 185 155, 255 155"
              stroke="#B0BEC5"
              strokeWidth="2"
              strokeDasharray="5 7"
              strokeLinecap="round"
            />
            <path
              d="M 255 155 C 325 155, 350 235, 420 235"
              stroke="#B0BEC5"
              strokeWidth="2"
              strokeDasharray="5 7"
              strokeLinecap="round"
            />
            <path
              d="M 420 235 C 500 235, 510 105, 585 105"
              stroke="#B0BEC5"
              strokeWidth="2"
              strokeDasharray="5 7"
              strokeLinecap="round"
            />
            <path
              d="M 585 105 C 660 105, 680 270, 755 270"
              stroke="#B0BEC5"
              strokeWidth="2"
              strokeDasharray="5 7"
              strokeLinecap="round"
            />
            <path
              d="M 755 270 C 835 270, 845 295, 920 295"
              stroke="#B0BEC5"
              strokeWidth="2"
              strokeDasharray="5 7"
              strokeLinecap="round"
            />
          </svg>

          {/* Floating Cards */}
          {steps.map((s, idx) => {
            const Icon = s.icon
            const pos = positions[idx]
            return (
              <div
                key={idx}
                className="absolute"
                style={{ left: pos.left, top: pos.top }}
              >
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.07)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)] transition-all duration-300 hover:scale-[1.04] cursor-default text-left w-fit min-w-40 flex flex-col">
                  {/* Icon + Title in same row */}
                  <div className="flex items-center gap-2.5 mb-2.5 shrink-0">
                    <div className={`relative w-9 h-9 flex items-center justify-center rounded shadow-lg shadow-[${s.iconBg}] shrink-0 bg-[${s.iconBg}]`}>
                      <Icon className="w-4 h-4 text-white" />
                      {/* Step number dot */}
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#141414] text-white font-black text-[9px] flex items-center justify-center border border-white">
                        {s.num}
                      </div>
                    </div>
                    <h4 className="font-extrabold text-sm text-[#141414] whitespace-nowrap tracking-wider">
                      {s.title}
                    </h4>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-gray-400 leading-relaxed font-medium w-0 min-w-full">
                    {s.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* ───── MOBILE: Vertical linear list with connector ───── */}
        <div className="lg:hidden flex flex-col items-center gap-0">
          {steps.map((s, idx) => {
            const Icon = s.icon
            return (
              <div key={idx} className="flex flex-col items-center w-full max-w-xs">
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.06)] w-full text-left">
                  {/* Icon + Title in same row */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className={`relative w-9 h-9 flex items-center justify-center rounded-xl shrink-0 shadow-lg shadow-[${s.iconBg}] shrink-0 bg-[${s.iconBg}]`}>
                      <Icon className="w-4 h-4 text-white" />
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#141414] text-white font-black text-[9px] flex items-center justify-center border border-white">
                        {s.num}
                      </div>
                    </div>
                    <h4 className="font-extrabold text-sm text-[#141414] tracking-wider">
                      {s.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed font-medium">{s.desc}</p>
                </div>
                {/* Connector dot line between steps */}
                {idx < steps.length - 1 && (
                  <div className="flex flex-col items-center py-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1 h-1 rounded-full bg-slate-300 my-0.5" />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
