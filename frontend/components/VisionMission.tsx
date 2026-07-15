"use client";

import { motion } from "framer-motion";
import { Target, Globe2 } from "lucide-react";

export default function VisionMission() {
  return (
    <section className="relative w-full bg-[#0A0B0D] py-20 sm:py-32 px-4 sm:px-8 md:px-12 border-b border-zinc-900 overflow-hidden text-white">

      {/* Premium Glow Background Effects */}
      <div className="absolute top-1/4 -left-20 w-[350px] h-[350px] rounded-full bg-[#0b9940]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-[350px] h-[350px] rounded-full bg-[#dea306]/10 blur-[100px] pointer-events-none" />

      <div className="w-full relative z-10 space-y-16">

        {/* Section Header */}
        <div className="text-center space-y-4">
          <span className="text-[#0b9940] text-xs sm:text-sm font-black uppercase tracking-[0.2em] block">
            What Drives Us
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
            Vision & Mission
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto font-medium">
            The purpose that drives every opportunity we create for students.
          </p>
        </div>

        {/* Cards Row */}
        <div className="relative flex flex-col md:flex-row gap-8 lg:gap-12 items-stretch justify-center max-w-7xl mx-auto">

          {/* Glowing Connecting Line between cards on Desktop */}
          <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-[2px] bg-gradient-to-r from-[#0b9940] to-[#0055A5] opacity-60 blur-[1px] z-20 pointer-events-none" />
          {/* Card 1: Our Mission */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            whileHover={{ y: -5, borderColor: "rgba(255,255,255,0.15)" }}
            className="flex-1 bg-[#121316]/5 border border-white/5 backdrop-blur-xs rounded-[2.2rem] p-6 sm:p-12 text-left space-y-6 shadow-[0_30px_70px_rgba(0,0,0,0.4)] transition-colors duration-300"
          >
            {/* Red Target Icon */}
            <div className="w-12 h-12 rounded-2xl bg-[#E1000F] flex items-center justify-center shadow-lg shadow-[#E1000F]/20">
              <Target className="w-6 h-6 text-white" />
            </div>

            <h3 className="text-2xl font-bold text-white tracking-tight">
              Our Mission
            </h3>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
              To give every ambitious hospitality student real access to world-class internships in France — hands-on training, mentorship, and the confidence that comes from working alongside industry leaders.
            </p>
          </motion.div>

          {/* Card 2: Our Vision */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            whileHover={{ y: -5, borderColor: "rgba(255,255,255,0.15)" }}
            className="flex-1 bg-[#121316]/5 border border-white/5 rounded-[2.2rem] p-6 sm:p-12 text-left space-y-6 shadow-[0_30px_70px_rgba(0,0,0,0.4)] transition-colors duration-300"
          >
            {/* Blue Globe Icon */}
            <div className="w-12 h-12 rounded-2xl bg-[#0055A5] flex items-center justify-center shadow-lg shadow-[#0055A5]/20">
              <Globe2 className="w-6 h-6 text-white" />
            </div>

            <h3 className="text-2xl font-bold text-white tracking-tight">
              Our Vision
            </h3>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
              To become the most trusted platform in the world connecting talented students with global hospitality careers — starting in France, and never stopping there.
            </p>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
