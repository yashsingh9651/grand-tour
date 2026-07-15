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

const Testimonials = dynamic(() => import("@/components/Testimonials"), {
  ssr: false,
  loading: () => (
    <div className="h-28 bg-slate-50 dark:bg-zinc-950 animate-pulse flex items-center justify-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
      Loading testimonials...
    </div>
  ),
});

const AboutHistory = dynamic(() => import("@/components/AboutHistory"), {
  ssr: false,
  loading: () => (
    <div className="h-28 bg-slate-50 dark:bg-zinc-950 animate-pulse flex items-center justify-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
      Loading history...
    </div>
  ),
});

const HomeCTA = dynamic(() => import("@/components/HomeCTA"), {
  ssr: false,
  loading: () => (
    <div className="h-28 bg-slate-50 dark:bg-zinc-950 animate-pulse flex items-center justify-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
      Loading home cta...
    </div>
  ),
});

const Footer = dynamic(() => import("@/components/Footer"), {
  ssr: false,
  loading: () => (
    <div className="h-28 bg-slate-50 dark:bg-zinc-950 animate-pulse flex items-center justify-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
      Loading footer...
    </div>
  ),
});

const AboutPage = () => {
  const { data: session, status } = useSession();

  const isLoggedIn = status === "authenticated";
  const user = session?.user as any;

  const dashboardLink =
    user?.role === "SUPER_ADMIN" || user?.role === "ADMIN"
      ? "/admin"
      : "/dashboard";

  return (
    <div className="relative w-full min-h-screen bg-white dark:bg-zinc-950 overflow-x-hidden font-Gilroy">
      {/* ─── Full-screen About Hero wrapper ─── */}
      <div className="relative w-full min-h-screen lg:h-screen overflow-hidden shrink-0 flex flex-col">
        {/* Background Image */}
        <Image
          src="/horizontal-frame.png"
          alt="Hospitality Internship Group"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/45 z-[1]" />

        {/* ── HERO BODY ── */}
        <main className="flex-1 relative z-50 w-full px-4 sm:px-8 md:px-12 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="absolute z-60 top-4 lg:top-32 right-4 lg:right-4 xl:right-12 flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/40 px-6 py-3 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
          >
            <span className="text-2xl sm:text-3xl">🇫🇷</span>
            <div className="text-left leading-tight">
              <div className="text-xs font-bold text-white">500+ Students</div>
              <div className="text-[9px] text-white/60 tracking-widest uppercase mt-0.5">
                placed across France
              </div>
            </div>
          </motion.div>
          <div className="flex flex-col lg:flex-row items-end justify-between gap-12 lg:gap-8 w-full">
            {/* Left Column: Headline and Description */}
            <div className="flex-1 text-left space-y-6 lg:pr-4">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 bg-black/35 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full select-none">
                <span className="text-[#dea306] text-xs">●</span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/95">
                  Hospitality Internships in France
                </span>
              </div>
              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-[68px] font-black text-white leading-[1.08] tracking-tight">
                More Than An<br />
                Internship.<br />
                A Journey That<br />
                <span className="text-[#dea306]">Changes</span> Your Life.
              </h1>
              {/* Paragraph */}
              <p className="text-sm sm:text-base text-white/85 max-w-xl font-medium leading-relaxed">
                Grand Tour is the trusted bridge between ambitious students and international hospitality careers in France – real hotels, real kitchens, real global exposure, and memories that last a lifetime.
              </p>
              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href={isLoggedIn ? dashboardLink : "/login"}
                  className="bg-[#dea306] hover:bg-[#dea306]/90 active:scale-95 text-[#1A1A1A] font-bold text-xs sm:text-sm px-6 py-3 rounded-full uppercase tracking-wider transition-all shadow-lg"
                >
                  Apply Now
                </Link>
                <Link
                  href="#"
                  className="bg-white/10 hover:bg-white/20 border border-white/20 active:scale-95 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full uppercase tracking-wider transition-all"
                >
                  Meet Our Team
                </Link>
              </div>
            </div>
            {/* Right Column: Layered Polaroid and Floating Stats Badge */}
            <div className="relative min-h-[350px] sm:min-h-[420px] w-full lg:w-auto pr-16">
              {/* Layered Polaroid Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: -12 }}
                animate={{ opacity: 1, scale: 1, rotate: -6 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                whileHover={{ rotate: 2, scale: 1.03 }}
                className="relative z-20 bg-white p-3 pb-8 rounded-sm shadow-[0_30px_70px_rgba(0,0,0,0.55)] w-[220px] sm:w-[260px]"
              >
                <div className="relative w-full aspect-3/4 overflow-hidden rounded-sm bg-slate-100">
                  <Image
                    src="/vertical-frame.png"
                    alt="Culinary placements in France"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 640px) 240px, 280px"
                  />
                </div>
                <div className="absolute -top-3 -left-5 z-10 bg-[#2563EB] text-white px-4 py-2 rounded-lg shadow-md rotate-[-12deg] select-none">
                  <span className={`${kalam.className} text-sm sm:text-base font-bold italic tracking-wide`}>
                    Hospitality
                  </span>
                </div>
                {/* Cursive Bottom Label */}
                <div className={`${kalam.className} text-lg sm:text-xl font-bold text-slate-800 text-center tracking-wide block mt-4`}>
                  In the kitchen
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
      <AboutHistory />
      <Testimonials />
      <HomeCTA />
      <Footer />
    </div>
  );
};

export default AboutPage;