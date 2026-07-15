"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Kalam } from "next/font/google";

const kalam = Kalam({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export default function AboutHistory() {
  return (
    <section className="relative w-full bg-white py-20 sm:py-32 px-4 sm:px-8 border-b border-slate-100">
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-8">
        
        {/* Left Column: Story Content & Timeline */}
        <div className="flex-1 text-left space-y-8 max-w-2xl">
          {/* Pill Badge */}
          <div className="inline-flex items-center bg-[#dea306]/10 px-4 py-1.5 rounded-full select-none">
            <span className="text-[#dea306] text-xs font-black uppercase tracking-wider">
              How Grand Tour Began
            </span>
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-black text-slate-900 leading-[1.1] tracking-tight">
            From one dream <br />
            <span className="text-[#E1000F]">internship</span> to a movement
          </h2>

          {/* Main Paragraph */}
          <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed max-w-xl">
            Grand Tour began with a simple frustration: brilliant hospitality students were being shut out of the internships that could actually change their careers buried under paperwork, language barriers, and closed doors. We built the bridge we wished we'd had.
          </p>

          {/* Timeline */}
          <div className="space-y-6 pt-4">
            {/* Point 1 */}
            <div className="flex gap-4 items-start">
              <div className="w-5 h-5 rounded-full border-2 border-[#dea306] flex items-center justify-center shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#dea306]" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#E1000F]">2019 — The Idea</h4>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Two friends, one shared internship in Lyon, and a realization that hundreds of students never got the same chance.
                </p>
              </div>
            </div>

            {/* Point 2 */}
            <div className="flex gap-4 items-start">
              <div className="w-5 h-5 rounded-full border-2 border-[#0055A5] flex items-center justify-center shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0055A5]" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#E1000F]">2021 — Building The Bridge</h4>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  First partner hotels signed across Paris and the Riviera. We stopped "arranging placements" and started building careers.
                </p>
              </div>
            </div>

            {/* Point 3 */}
            <div className="flex gap-4 items-start">
              <div className="w-5 h-5 rounded-full border-2 border-[#0b9940] flex items-center justify-center shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0b9940]" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#E1000F]">Today — A Movement</h4>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  A growing community of students, mentors and hospitality leaders across France, all rooting for each other.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Layered Photo Collage */}
        <div className="flex-1 relative w-full max-w-md lg:max-w-none h-[420px] sm:h-[500px]">
          {/* Top Right Image (Presentation) */}
          <motion.div
            initial={{ opacity: 0, x: 30, y: -20, rotate: 6 }}
            animate={{ opacity: 1, x: 0, y: 0, rotate: 4 }}
            transition={{ duration: 0.7 }}
            whileHover={{ rotate: 1, scale: 1.02 }}
            className="absolute top-4 right-2 sm:right-6 w-[200px] sm:w-[260px] aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.15)] bg-slate-100 z-10"
          >
            <Image
              src="/about_presentation.png"
              alt="Student Presentation Classroom"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 200px, 260px"
            />
          </motion.div>

          {/* Left Middle Image (Chefs) */}
          <motion.div
            initial={{ opacity: 0, x: -30, y: -10, rotate: -5 }}
            animate={{ opacity: 1, x: 0, y: 0, rotate: -3 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            whileHover={{ rotate: -1, scale: 1.02 }}
            className="absolute top-24 sm:top-28 left-2 sm:left-6 w-[180px] sm:w-[220px] aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.18)] bg-slate-100 z-20"
          >
            <Image
              src="/about_chefs.png"
              alt="Culinary Students in Kitchen"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 180px, 220px"
            />
          </motion.div>

          {/* Bottom Left Quote Card */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotate: 3 }}
            animate={{ opacity: 1, y: 0, rotate: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            whileHover={{ rotate: -1, scale: 1.02 }}
            className="absolute bottom-12 sm:bottom-16 left-6 sm:left-12 w-[210px] sm:w-[240px] bg-[#FAF8F5] p-4 sm:p-5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-slate-100 z-30"
          >
            <p className="text-[11px] sm:text-xs font-extrabold text-slate-800 leading-relaxed text-left">
              We didn't want to arrange placements. We wanted to build careers our students would look back on forever.
            </p>
            {/* Quote icon from font-kalam */}
            <div className={`${kalam.className} text-xl sm:text-2xl text-[#dea306] font-bold text-left leading-none mt-1`}>
              "
            </div>
          </motion.div>

          {/* Bottom Right Image (Group Selfie) */}
          <motion.div
            initial={{ opacity: 0, x: 30, y: 20, rotate: -7 }}
            animate={{ opacity: 1, x: 0, y: 0, rotate: -5 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            whileHover={{ rotate: -2, scale: 1.02 }}
            className="absolute bottom-4 right-0 w-[200px] sm:w-[240px] aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.15)] bg-slate-100 z-20"
          >
            <Image
              src="/about_group.png"
              alt="Students Group Selfie Outdoor"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 200px, 240px"
            />
          </motion.div>
        </div>

      </div>
    </section>
  );
}
