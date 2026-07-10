"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Menu, X, Award, Building, TrendingUp, Users } from "lucide-react";
import dynamic from "next/dynamic";

const PartnersCarousel = dynamic(() => import("@/components/PartnersCarousel"), {
  ssr: false,
  loading: () => (
    <div className="h-28 bg-slate-50 dark:bg-zinc-950 animate-pulse flex items-center justify-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
      Loading partners...
    </div>
  )
});
import WhyGrandTour from "@/components/WhyGrandTour";
import HowItWorks from "@/components/HowItWorks";

export default function Home() {
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
      {/* ─── Full-screen hero wrapper ─── */}
      <div className="relative w-full h-screen overflow-hidden shrink-0">
      <Image
        src="/hero.png"
        alt="Paris – Eiffel Tower street view"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/25 z-[1]" />

      {/* ── 3. BOTTOM FADE GRADIENT (bg fades to near-white at bottom edge) ── */}
      <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-white/90 via-white/40 to-transparent z-[2] pointer-events-none" />
      <div className="absolute inset-0 z-[10] flex flex-col">
        {/* ── HEADER ── */}
        <header className="w-full shrink-0">
          <div className="px-8 py-2 flex items-center justify-between">
            <Link href="/" id="nav-logo" className="flex items-center">
              <Image src="/logo.png" alt="logo" width={200} height={200} className="h-10 w-auto" />
            </Link>

            {/* Desktop navigation links */}
            <nav className="hidden md:flex items-center gap-10">
              <Link
                href="/"
                className="text-sm font-medium text-white border-b-2 border-white pb-0.5 select-none"
              >
                Home
              </Link>
              <Link
                href="#"
                className="text-sm font-medium text-white/80 hover:text-white transition-colors select-none"
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
                className="bg-[#0055A5] hover:bg-[#1d4ed8] active:scale-95 text-white text-xs font-medium px-6 py-3 rounded-full uppercase tracking-wider transition-all shadow-lg select-none"
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
                  <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-white font-semibold">Home</Link>
                  <Link href="#" onClick={() => setMobileMenuOpen(false)} className="text-white/80 font-semibold">About</Link>
                  <Link href="#" onClick={() => setMobileMenuOpen(false)} className="text-white/80 font-semibold">Contact Us</Link>
                  <Link href="#" onClick={() => setMobileMenuOpen(false)} className="text-white/80 font-semibold">Internship in France</Link>
                  <Link
                    href={isLoggedIn ? dashboardLink : "/login"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="bg-[#2563EB] text-white font-bold text-center py-3 rounded-full text-sm uppercase tracking-wider"
                  >
                    {isLoggedIn ? "Go to Dashboard" : "Become a Partner"}
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* ── HERO BODY — takes remaining vertical space ── */}
        <main className="flex-1 relative flex items-center justify-center">
          {/* === LEFT POLAROID FRAME === */}
          <motion.div
            initial={{ opacity: 0, x: -80, rotate: -20 }}
            animate={{ opacity: 1, x: 0, rotate: -10 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            whileHover={{ rotate: -5, scale: 1.04 }}
            className="hidden lg:block absolute left-12 xl:left-0 top-2/3 -translate-y-2/3"
            style={{ zIndex: 20 }}
          >
            {/* Polaroid shell */}
            <div
              className="bg-white shadow-[0_25px_60px_rgba(0,0,0,0.45)]"
              style={{ padding: "10px 10px 40px 10px", width: "230px" }}
            >
              <div className="overflow-hidden" style={{ width: "100%", height: "300px" }}>
                <img
                  src="/vertical-frame.png"
                  alt="Culinary placement"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
            </div>
          </motion.div>

          {/* === RIGHT POLAROID FRAME === */}
          <motion.div
            initial={{ opacity: 0, x: 80, rotate: 20 }}
            animate={{ opacity: 1, x: 0, rotate: 8 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            whileHover={{ rotate: 3, scale: 1.04 }}
            className="hidden lg:block absolute right-12 xl:right-0 top-11/12 -translate-y-11/12"
            style={{ zIndex: 20 }}
          >
            {/* Polaroid shell */}
            <div
              className="bg-white shadow-[0_25px_60px_rgba(0,0,0,0.45)]"
              style={{ padding: "10px 10px 40px 10px", width: "290px" }}
            >
              <div className="overflow-hidden" style={{ width: "100%", height: "220px" }}>
                <img
                  src="/horizontal-frame.png"
                  alt="Student group"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
            </div>
          </motion.div>

          {/* === CENTER TEXT CONTENT === */}
          <div className="relative z-30 flex flex-col items-center text-center px-4 max-w-4xl">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-tight tracking-tight mb-5 whitespace-nowrap select-none"
            >
              Your{" "}
              <span style={{ color: "#0055A5" }}>Journey</span>
              {" "}Begins In{" "}
              <span
                className="inline-flex items-center justify-center px-1 leading-none"
                style={{ backgroundColor: "#E1000F", color: "#ffffff" }}
              >
                France
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-white/90 text-sm md:text-base leading-relaxed mb-8 max-w-3xl"
            >
              Grand Tour helps students turn ambition into international exposure through guided internship
              programs, seamless processes, and career-focused opportunities in the heart of Europe.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex items-center gap-4"
            >
              <Link
                href={isLoggedIn ? dashboardLink : "/login"}
                id="btn-apply-now"
                className="bg-[#E1000F] border border-[#E1000F] hover:bg-[#c5121e] active:scale-95 text-white text-xs font-medium px-7 py-2.5 rounded-full tracking-widest transition-all shadow-lg select-none"
              >
                Apply Now
              </Link>
              <a
                href="#"
                id="btn-know-more"
                className="border border-white/40 bg-white/15 hover:bg-white/20 active:scale-95 text-white text-xs font-medium px-7 py-2.5 rounded-full tracking-widest transition-all select-none"
              >
                Know More
              </a>
            </motion.div>
          </div>

          {/* Mobile-only: Polaroid row below text */}
          <div className="lg:hidden absolute bottom-4 left-0 right-0 flex justify-center gap-6 px-4" style={{ zIndex: 20 }}>
            <div
              className="bg-white shadow-xl rounded-sm"
              style={{ padding: "8px 8px 28px 8px", width: "140px", transform: "rotate(-5deg)" }}
            >
              <img src="/vertical-frame.png" alt="Culinary" style={{ width: "100%", height: "160px", objectFit: "cover", display: "block" }} />
            </div>
            <div
              className="bg-white shadow-xl rounded-sm"
              style={{ padding: "8px 8px 28px 8px", width: "180px", transform: "rotate(5deg)" }}
            >
              <img src="/horizontal-frame.png" alt="Students" style={{ width: "100%", height: "120px", objectFit: "cover", display: "block" }} />
            </div>
          </div>
        </main>

        {/* ── BOTTOM STATS BAR ── */}
        <div className="w-full shrink-0 pb-28 px-6 relative z-30">
          <div className="flex flex-row flex-wrap justify-center gap-3 max-w-screen-xl mx-auto">
            {/* Pill 1 – Blue (Hotel Partners) */}
            <div className="flex items-center gap-3 border border-white/45 bg-white/25 rounded-full px-3 py-2.5 shadow-md select-none">
              <div className="w-9 h-9 rounded-full bg-[#2563EB] flex items-center justify-center shrink-0">
                <Building className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-base font-semibold text-white leading-none">200+</p>
                <p className="text-[9px] font-bold text-white/75 uppercase tracking-widest mt-0.5">Hotel Partners</p>
              </div>
            </div>

            {/* Pill 2 – Red (Placements Rate) */}
            <div className="flex items-center gap-3 border border-white/45 bg-white/25 rounded-full px-3 py-2.5 shadow-md select-none">
              <div className="w-9 h-9 rounded-full bg-[#E1000F] flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-base font-semibold text-white leading-none">99%</p>
                <p className="text-[9px] font-bold text-white/75 uppercase tracking-widest mt-0.5">Placements Rate</p>
              </div>
            </div>

            {/* Pill 3 – Green (Students Placed) */}
            <div className="flex items-center gap-3 border border-white/45 bg-white/25 rounded-full px-3 py-2.5 shadow-md select-none">
              <div className="w-9 h-9 rounded-full bg-[#E1000F] flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-base font-semibold text-white leading-none">5,000+</p>
                <p className="text-[9px] font-bold text-white/75 uppercase tracking-widest mt-0.5">Students Placed</p>
              </div>
            </div>

            {/* Pill 4 – Yellow (Experience) */}
            <div className="flex items-center gap-3 border border-white/45 bg-white/25 rounded-full px-3 py-2.5 shadow-md select-none">
              <div className="w-9 h-9 rounded-full bg-[#F9B302] flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-base font-semibold text-white leading-none">10Y+</p>
                <p className="text-[9px] font-bold text-white/75 uppercase tracking-widest mt-0.5">Experience</p>
              </div>
            </div>

          </div>
        </div>

      </div>
      {/* end content layer */}

      </div>

      {/* Moving Partners Carousel */}
      <PartnersCarousel />

      {/* Why Grand Tour Section */}
      <WhyGrandTour />

      {/* How It Works Section */}
      <HowItWorks />
    </div>
  );
}
