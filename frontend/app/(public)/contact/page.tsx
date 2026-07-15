"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Kalam } from "next/font/google";

const kalam = Kalam({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-kalam",
});

const Footer = dynamic(() => import("@/components/Footer"), {
  ssr: false,
  loading: () => (
    <div className="h-28 bg-slate-50 dark:bg-zinc-950 animate-pulse flex items-center justify-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
      Loading footer...
    </div>
  ),
});

export default function ContactPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const user = session?.user as any;

  const dashboardLink =
    user?.role === "SUPER_ADMIN" || user?.role === "ADMIN"
      ? "/admin"
      : "/dashboard";

  return (
    <div className="relative w-full min-h-screen bg-white dark:bg-zinc-950 overflow-x-hidden font-Gilroy">
      {/* ─── Contact Hero wrapper ─── */}
      <div className="relative w-full min-h-screen lg:h-screen lg:overflow-hidden shrink-0 flex flex-col">
        {/* Background Image */}
        <Image
          src="/horizontal-frame.png"
          alt="Grand Tour Kitchen Environment"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/65 z-[1]" />

        {/* ── 3D Floating Badges (Desktop only) ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="absolute top-[32%] right-[22%] lg:right-[400px] z-30 hidden xl:flex items-center gap-2.5 bg-white/10 backdrop-blur border border-white/10 px-5 py-3 rounded-full shadow-lg"
        >
          {/* Pure CSS Flag replacing flag icon */}
          <div className="w-5 h-3.5 rounded-[2px] overflow-hidden flex border border-white/10 relative shrink-0">
            <div className="w-1/3 bg-[#002395]" />
            <div className="w-1/3 bg-white" />
            <div className="w-1/3 bg-[#ED2939]" />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/5 via-transparent to-white/10 pointer-events-none" />
          </div>
          <span className="text-white text-xs font-bold tracking-wide whitespace-nowrap">
            500+ Students Placed
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.75, duration: 0.8 }}
          className="absolute top-[45%] right-[30%] lg:right-[480px] z-30 hidden xl:flex items-center gap-2.5 bg-white/10 backdrop-blur border border-white/10 px-5 py-3 rounded-full shadow-lg"
        >
          <span className="text-xs">✈️</span>
          <span className="text-white text-xs font-bold tracking-wide whitespace-nowrap">
            98% Visa Success
          </span>
        </motion.div>

        {/* ── HERO BODY ── */}
        <main className="flex-1 relative z-50 w-full px-4 sm:px-8 md:px-12 pt-28 pb-16 lg:py-0 flex items-center justify-between">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 lg:gap-8 w-full">
            {/* Left Column: Headline and Description */}
            <div className="flex-1 text-left space-y-6 lg:pr-4">
              {/* Eyebrow Pill Badge */}
              <div className="inline-flex items-center gap-2 border-[0.5px] border-white/30 px-4 py-1.5 rounded-full select-none bg-white/20 backdrop-blur">
                <span className="text-[#dea306] text-[10px] font-semibold uppercase tracking-wider">
                  Contact Grand Tour
                </span>
              </div>
              
              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-[68px] font-black text-white leading-[1.08] tracking-tight">
                Let's Start Your<br />
                <span className="text-[#dea306]">Journey</span><br />
                Together
              </h1>

              {/* Paragraph */}
              <p className="text-sm sm:text-base text-white/80 max-w-lg font-medium leading-relaxed">
                Whether you have questions about internships, applications, visas, or life in France, our team is here to guide you every step of the way.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="mailto:contact@grandtour.in"
                  className="bg-[#0b9940] hover:bg-[#0b9940]/90 active:scale-95 text-white font-semibold text-xs px-8 py-4 rounded-full uppercase tracking-wider transition-all shadow-lg text-center"
                >
                  Contact Our Team
                </Link>
                <Link
                  href={isLoggedIn ? dashboardLink : "/login"}
                  className="bg-white/10 hover:bg-white/20 border border-white/80 backdrop-blur-xl active:scale-95 text-white font-semibold text-xs px-8 py-4 rounded-full uppercase tracking-wider transition-all text-center"
                >
                  Apply Now
                </Link>
              </div>

              {/* Mobile Badges Row (Visible only on smaller screens) */}
              <div className="flex flex-wrap items-center gap-3 pt-4 xl:hidden">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full shadow-sm">
                  <div className="w-5 h-3.5 rounded-[2px] overflow-hidden flex border border-white/10 relative shrink-0">
                    <div className="w-1/3 bg-[#002395]" />
                    <div className="w-1/3 bg-white" />
                    <div className="w-1/3 bg-[#ED2939]" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/5 via-transparent to-white/10 pointer-events-none" />
                  </div>
                  <span className="text-white text-[11px] font-bold tracking-wide">
                    500+ Students Placed
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full shadow-sm">
                  <span className="text-xs">✈️</span>
                  <span className="text-white text-[11px] font-bold tracking-wide">
                    98% Visa Success
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Layered Polaroid Card */}
            <div className="relative w-full lg:w-auto flex justify-center lg:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: 12 }}
                animate={{ opacity: 1, scale: 1, rotate: 6 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                whileHover={{ rotate: 2, scale: 1.03 }}
                className="relative z-20 bg-white p-3 pb-8 rounded-sm shadow-[0_30px_70px_rgba(0,0,0,0.55)] w-[240px] sm:w-[290px] border border-slate-100 shrink-0"
              >
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-sm bg-slate-100">
                  <Image
                    src="/vertical-frame.png"
                    alt="Kitchen family group"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 240px, 290px"
                  />
                </div>
                {/* Cursive Bottom Label */}
                <div className={`${kalam.className} text-xl sm:text-2xl font-bold text-slate-800 text-center tracking-wide block mt-4`}>
                  My new family
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
