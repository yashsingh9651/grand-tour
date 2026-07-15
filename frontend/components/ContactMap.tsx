"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ContactMap() {
  return (
    <section className="w-full bg-[#0A0B0D] py-12 md:py-20 px-4 sm:px-8 md:px-12 border-b border-zinc-900 overflow-hidden relative">
      {/* Glow Effects */}
      <div className="absolute top-1/4 -left-20 w-[350px] h-[350px] rounded-full bg-[#0b9940]/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-[350px] h-[350px] rounded-full bg-[#0055A5]/5 blur-[100px] pointer-events-none" />

      {/* Main Container - max-w-6xl used instead of max-w-7xl */}
      <div className="max-w-6xl mx-auto space-y-8 relative z-10 text-center">
        
        {/* Header Content */}
        <div className="space-y-2">
          <div className="inline-flex items-center bg-[#E1000F]/10 px-4 py-1.5 rounded-full select-none">
            <span className="text-[#E1000F] text-xs font-semibold uppercase tracking-wider">
              Find Us
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            Come Say Hello
          </h2>
          <p className="text-slate-400 text-sm sm:text-base font-medium leading-relaxed">
            Stop by our Paris office for a coffee and a conversation about your future in French hospitality.
          </p>
        </div>

        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative w-full aspect-16/5 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl bg-zinc-900"
        >
          {/* Floating Airport Tooltip/Badge */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-slate-100 dark:border-zinc-800 flex items-center gap-2 select-none">
            <span className="text-xs sm:text-sm">✈️</span>
            <span className="text-slate-800 dark:text-white text-[11px] sm:text-xs font-bold tracking-tight">
              20 min from Charles de Gaulle Airport
            </span>
          </div>

          {/* Interactive Google Map embed centered on Saint-Paul / Rue de Rivoli, Paris */}
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2625.228965700816!2d2.359141076939923!3d48.85482570077884!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e6703b60fb41bf%3A0xe54e3d36b8a8ef9f!2sSaint-Paul!5e0!3m2!1sen!2sfr!4v1700000000000!5m2!1sen!2sfr"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full grayscale-[8%] contrast-[102%] saturate-[95%]"
          />
        </motion.div>

      </div>
    </section>
  );
}
