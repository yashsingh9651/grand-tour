"use client";

import { motion } from "framer-motion";

export default function AboutStats() {
  const stats = [
    {
      value: "500+",
      label: "Students Placed Abroad",
    },
    {
      value: "65+",
      label: "Partner Hotels & Restaurants",
    },
    {
      value: "95%",
      label: "Internship Success Rate",
    },
  ];

  return (
    <section className="w-full bg-white dark:bg-zinc-950 py-16 px-4 sm:px-8 md:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-[2rem] sm:rounded-[3rem] py-14 px-8 sm:px-12 md:px-16 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/10"
          style={{
            background: "linear-gradient(90deg, #0b9940 0%, #dea306 33%, #E1000F 66%, #0055A5 100%)",
          }}
        >
          {/* Grainy Noise Overlay */}
          <div
            className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none select-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
            }}
          />

          {/* Subtle lighting overlay for extra depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/15 pointer-events-none" />

          {/* Content columns */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 items-center text-center">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center">
                <span className="text-5xl sm:text-6xl font-black text-white tracking-tight leading-none drop-shadow-sm">
                  {stat.value}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-white/90 tracking-wide mt-3 max-w-[200px] sm:max-w-none">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
