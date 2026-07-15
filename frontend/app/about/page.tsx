"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Menu, X, FileText, Loader2 } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

        {/* Bottom Fade Gradient to match testimonials background (#fffcf7) */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#fffcf7] via-[#fffcf7]/40 to-transparent z-[2] pointer-events-none" />

        <div className="relative lg:absolute lg:inset-0 z-[10] flex flex-col min-h-screen lg:min-h-0 justify-between">
          {/* ── HEADER ── */}
          <header className="w-full shrink-0">
            <div className="px-4 sm:px-8 py-2 flex items-center justify-between">
              <Link href="/" id="nav-logo" className="flex items-center">
                <Image src="/logo.png" alt="logo" width={200} height={200} className="h-10 w-auto" />
              </Link>

              {/* Desktop navigation links */}
              <nav className="hidden md:flex items-center gap-10">
                <Link
                  href="/"
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors select-none"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="text-sm font-medium text-white border-b-2 border-white pb-0.5 select-none"
                >
                  About
                </Link>
                <Link
                  href="#"
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors select-none"
                >
                  Contact Us
                </Link>
                <Link
                  href="#"
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors select-none"
                >
                  Internship in France
                </Link>
              </nav>

              {/* Become a Partner CTA */}
              <div className="hidden md:flex">
                <Link
                  href={isLoggedIn ? dashboardLink : "/login"}
                  id="btn-desktop-partner"
                  className="bg-[#0055A5] hover:bg-[#0055A5]/90 active:scale-95 text-white text-xs font-medium px-6 py-3 rounded-full uppercase tracking-wider transition-all shadow-lg select-none"
                >
                  {isLoggedIn ? "Go to Dashboard" : "Become a Partner"}
                </Link>
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white"
                aria-label="Toggle menu"
                id="mobile-menu-toggle"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile drawer */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:hidden bg-black/90 backdrop-blur-md"
                >
                  <div className="px-6 py-6 flex flex-col gap-5">
                    <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-white/80 font-semibold">Home</Link>
                    <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-white font-semibold">About</Link>
                    <Link href="#" onClick={() => setMobileMenuOpen(false)} className="text-white/80 font-semibold">Contact Us</Link>
                    <Link href="#" onClick={() => setMobileMenuOpen(false)} className="text-white/80 font-semibold">Internship in France</Link>
                    <Link
                      href={isLoggedIn ? dashboardLink : "/login"}
                      onClick={() => setMobileMenuOpen(false)}
                      className="bg-[#0055A5] text-white font-bold text-center py-3 rounded-full text-sm uppercase tracking-wider"
                    >
                      {isLoggedIn ? "Go to Dashboard" : "Become a Partner"}
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          {/* ── HERO BODY ── */}
          <main className="flex-1 relative flex items-center justify-center pt-8 pb-32 lg:py-0">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
              
              {/* Left Column: Headline and Description */}
              <div className="flex-1 text-left space-y-6 max-w-2xl lg:pr-4">
                {/* Pill badge */}
                <div className="inline-flex items-center gap-2 bg-black/35 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full select-none">
                  <span className="text-[#FCD679] text-xs">●</span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/95">
                    Hospitality Internships in France
                  </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-4xl sm:text-5xl lg:text-[68px] font-black text-white leading-[1.08] tracking-tight">
                  More Than An<br />
                  Internship.<br />
                  A Journey That<br />
                  <span className="text-[#FCD679]">Changes</span> Your Life.
                </h1>

                {/* Paragraph */}
                <p className="text-sm sm:text-base text-white/85 max-w-xl font-medium leading-relaxed">
                  Grand Tour is the trusted bridge between ambitious students and international hospitality careers in France – real hotels, real kitchens, real global exposure, and memories that last a lifetime.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href={isLoggedIn ? dashboardLink : "/login"}
                    className="bg-[#FCD679] hover:bg-[#FCD679]/90 active:scale-95 text-[#1A1A1A] font-extrabold text-xs sm:text-sm px-8 py-4 rounded-full uppercase tracking-wider transition-all shadow-lg"
                  >
                    Apply Now
                  </Link>
                  <Link
                    href="#"
                    className="bg-white/10 hover:bg-white/20 border border-white/20 active:scale-95 text-white font-extrabold text-xs sm:text-sm px-8 py-4 rounded-full uppercase tracking-wider transition-all"
                  >
                    Meet Our Team
                  </Link>
                </div>
              </div>

              {/* Right Column: Layered Polaroid and Floating Stats Badge */}
              <div className="flex-1 relative flex items-center justify-center lg:justify-end min-h-[350px] sm:min-h-[420px] w-full lg:w-auto">
                
                {/* Floating Stats Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="absolute z-30 top-4 lg:-top-6 left-4 lg:-left-4 xl:-left-12 flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                >
                  <span className="text-2xl sm:text-3xl">🇫🇷</span>
                  <div className="text-left leading-tight">
                    <div className="text-xs sm:text-sm font-black text-white">500+ Students</div>
                    <div className="text-[9px] text-white/60 font-black tracking-widest uppercase mt-0.5">
                      placed across France
                    </div>
                  </div>
                </motion.div>

                {/* Layered Polaroid Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, rotate: 12 }}
                  animate={{ opacity: 1, scale: 1, rotate: 5 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  whileHover={{ rotate: 2, scale: 1.03 }}
                  className="relative z-20 bg-white p-3 pb-8 rounded-sm shadow-[0_30px_70px_rgba(0,0,0,0.55)] w-[260px] sm:w-[300px]"
                >
                  {/* Photo Frame Container */}
                  <div className="relative w-full h-[240px] sm:h-[280px] overflow-hidden rounded-sm bg-slate-100">
                    <Image
                      src="/vertical-frame.png"
                      alt="Culinary placements in France"
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 640px) 240px, 280px"
                    />
                  </div>

                  {/* Blue Cursive Badge Overlapping top-left of the photo */}
                  <div className="absolute -top-3 -left-5 z-10 bg-[#2563EB] text-white px-4 py-1.5 rounded-lg shadow-md rotate-[-12deg] select-none">
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
      </div>

      {/* Testimonials section */}
      <Testimonials />

      {/* CTA section */}
      <HomeCTA />

      {/* Footer section */}
      <Footer />
    </div>
  );
};

export default AboutPage;