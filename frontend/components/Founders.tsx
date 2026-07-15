"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Kalam } from "next/font/google";

const kalam = Kalam({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export default function Founders() {
  return (
    <section className="relative w-full bg-[#FAFAFA] py-20 sm:py-32 px-4 sm:px-8 md:px-12 border-b border-slate-100">
      <div className="w-full text-center">
        {/* Section Header */}
        <div className="space-y-4 mb-20">
          <div className="inline-flex items-center bg-[#0b9940]/10 px-4 py-1.5 rounded-full select-none">
            <span className="text-[#0b9940] text-xs font-semibold uppercase tracking-wider">
              The People Behind It
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-slate-900 tracking-tight">
            Meet The Founders
          </h2>
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto font-medium">
            Meet the visionaries shaping global careers through international opportunities.
          </p>
        </div>
        {/* Founder 1: Vaishanavi Banaitkar */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-0">
          {/* Photo on Left */}
          <motion.div
            initial={{ opacity: 0, x: -30, rotate: -4 }}
            whileInView={{ opacity: 1, x: 0, rotate: -3 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            whileHover={{ scale: 1.02, rotate: -1 }}
            className="relative z-20 w-[270px] sm:w-[330px] md:w-[420px] aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.15)] border-[6px] border-white shrink-0"
          >
            <Image
              src="/founder_vaishanavi.png"
              alt="Vaishanavi Banaitkar - Founder & Director"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 640px) 270px, 330px"
            />
          </motion.div>

          {/* Description Card on Right */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative z-10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-[2.5rem] p-7 sm:p-10 max-w-[700px] border border-slate-100 ml-4 text-left"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              Vaishanavi Banaitkar
            </h3>
            <p className="text-[#E1000F] text-xs font-bold uppercase tracking-widest mt-1">
              Founder & Director
            </p>
            <p className="text-slate-600 text-sm sm:text-base mt-5 font-medium italic">
              “Vaishanavi Banaitkar is the Founder and Director of Grand Tour, helping students access quality hospitality internships and career opportunities in France through trusted international education programs.”
            </p>
            {/* Awards Badges */}
            <div className="flex flex-wrap gap-2.5 mt-6">
              <span className="text-[#0055A5] bg-[#0055A5]/10 text-[10px] sm:text-xs font-bold px-4 py-2 rounded-full">
                Shree Mahatma Gandhi Rashtriya Abhiman Puraskar (2023)
              </span>
              <span className="text-[#0b9940] bg-[#0b9940]/10 text-[10px] sm:text-xs font-bold px-4 py-2 rounded-full">
                Maharashtra Business Tycoon Award (2023)
              </span>
            </div>
            {/* Signature */}
            <span className={`${kalam.className} text-xl sm:text-2xl font-bold text-slate-700 block mt-6`}>
              -Vaishanavi
            </span>
          </motion.div>
        </div>

        {/* Founder 2: Nishad Sutar */}
        <div className="flex -mt-20 flex-col items-center justify-center gap-8 lg:gap-0 lg:flex-row-reverse">
          {/* Photo on Right */}
          <motion.div
            initial={{ opacity: 0, x: 30, rotate: 4 }}
            whileInView={{ opacity: 1, x: 0, rotate: 3 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            whileHover={{ scale: 1.02, rotate: 1 }}
            className="relative z-20 w-[270px] sm:w-[330px] md:w-[420px] aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.15)] border-[6px] border-white shrink-0 ml-4"
          >
            <Image
              src="/founder_nishad.png"
              alt="Nishad Sutar - Co-Founder"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 640px) 270px, 330px"
            />
          </motion.div>

          {/* Description Card on Left */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative z-10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-[2.5rem] p-7 sm:p-10 max-w-[700px] border border-slate-100 ml-4 text-left"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              Nishad Sutar
            </h3>
            <p className="text-[#E1000F] text-xs font-bold uppercase tracking-widest mt-1">
              Co-Founder
            </p>

            <p className="text-slate-600 text-sm sm:text-base mt-5 font-medium italic">
              “Nishad Sutar is the Co-Founder of Grand Tour, leading the organization with strong business expertise and a commitment to helping students access trusted international education and career opportunities in France.”
            </p>

            {/* Awards Badges */}
            <div className="flex flex-wrap gap-2.5 mt-6">
              <span className="text-[#0055A5] bg-[#0055A5]/10 text-[10px] sm:text-xs font-bold px-4 py-2 rounded-full">
                Shree Mahatma Gandhi Rashtriya Abhiman Puraskar (2023)
              </span>
              <span className="text-[#0b9940] bg-[#0b9940]/10 text-[10px] sm:text-xs font-bold px-4 py-2 rounded-full">
                Maharashtra Business Tycoon Award (2023)
              </span>
            </div>

            {/* Signature */}
            <span className={`${kalam.className} text-xl sm:text-2xl font-bold text-slate-700 block mt-6`}>
              -Nishad
            </span>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
