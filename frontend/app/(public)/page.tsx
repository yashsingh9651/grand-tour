"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { Award, Building, TrendingUp, Users } from "lucide-react";
import dynamic from "next/dynamic";

const PartnersCarousel = dynamic(() => import("@/components/PartnersCarousel"), {
  ssr: false,
  loading: () => (
    <div className="h-28 bg-slate-50 dark:bg-zinc-950 animate-pulse flex items-center justify-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
      Loading partners...
    </div>
  )
});
const WhyGrandTour= dynamic(() => import("@/components/WhyGrandTour"), {
  ssr: false,
  loading: () => (
    <div className="h-28 bg-slate-50 dark:bg-zinc-950 animate-pulse flex items-center justify-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
      Loading why grand tour...
    </div>
  )
});
const HowItWorks= dynamic(() => import("@/components/HowItWorks"), {
  ssr: false,
  loading: () => (
    <div className="h-28 bg-slate-50 dark:bg-zinc-950 animate-pulse flex items-center justify-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
      Loading how it works...
    </div>
  )
});
const StudentLife= dynamic(() => import("@/components/StudentLife"), {
  ssr: false,
  loading: () => (
    <div className="h-28 bg-slate-50 dark:bg-zinc-950 animate-pulse flex items-center justify-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
      Loading student life...
    </div>
  )
});
const Testimonials= dynamic(() => import("@/components/Testimonials"), {
  ssr: false,
  loading: () => (
    <div className="h-28 bg-slate-50 dark:bg-zinc-950 animate-pulse flex items-center justify-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
      Loading testimonials...
    </div>
  )
});
const HomeCTA= dynamic(() => import("@/components/HomeCTA"), {
  ssr: false,
  loading: () => (
    <div className="h-28 bg-slate-50 dark:bg-zinc-950 animate-pulse flex items-center justify-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
      Loading home cta...
    </div>
  )
});
const Footer= dynamic(() => import("@/components/Footer"), {
  ssr: false,
  loading: () => (
    <div className="h-28 bg-slate-50 dark:bg-zinc-950 animate-pulse flex items-center justify-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
      Loading footer...
    </div>
  )
});

export default function Home() {
  const { data: session, status } = useSession();

  const isLoggedIn = status === "authenticated";
  const user = session?.user as any;

  const dashboardLink =
    user?.role === "SUPER_ADMIN" || user?.role === "ADMIN"
      ? "/admin"
      : "/dashboard";

  return (
    <div className="relative w-full min-h-screen bg-white dark:bg-zinc-950 overflow-x-hidden font-Gilroy">
      {/* ─── Full-screen hero wrapper ─── */}
      <div className="relative w-full min-h-screen lg:h-screen overflow-hidden shrink-0 flex flex-col">
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
        <div className="relative lg:absolute lg:inset-0 z-[10] flex flex-col min-h-screen lg:min-h-0 justify-between pt-16">
          {/* ── HERO BODY — takes remaining vertical space ── */}
          <main className="flex-1 relative flex items-center justify-center pt-8 pb-48 lg:py-0">
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
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-tight tracking-tight mb-5 lg:whitespace-nowrap select-none"
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
                className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto"
              >
                <Link
                  href={isLoggedIn ? dashboardLink : "/login"}
                  id="btn-apply-now"
                  className="bg-[#E1000F] border border-[#E1000F] hover:bg-[#E1000F]/90 active:scale-95 text-white text-xs font-medium px-7 py-2.5 rounded-full tracking-widest transition-all shadow-lg select-none w-full sm:w-auto text-center"
                >
                  Apply Now
                </Link>
                <a
                  href="#"
                  id="btn-know-more"
                  className="border border-white/40 bg-white/15 hover:bg-white/20 active:scale-95 text-white text-xs font-medium px-7 py-2.5 rounded-full tracking-widest transition-all select-none w-full sm:w-auto text-center"
                >
                  Know More
                </a>
              </motion.div>

            </div>

            {/* Mobile-only: Polaroid row below text */}
            <div className="lg:hidden absolute bottom-4 left-0 right-0 flex justify-center gap-4 sm:gap-6 px-4" style={{ zIndex: 20 }}>
              <div
                className="bg-white shadow-xl rounded-sm w-[110px] sm:w-[140px] p-1.5 pb-5 sm:p-2 sm:pb-7"
                style={{ transform: "rotate(-5deg)" }}
              >
                <img src="/vertical-frame.png" alt="Culinary" style={{ width: "100%", objectFit: "cover", display: "block" }} className="h-[120px] sm:h-[160px]" />
              </div>
              <div
                className="bg-white shadow-xl rounded-sm w-[140px] sm:w-[180px] p-1.5 pb-5 sm:p-2 sm:pb-7"
                style={{ transform: "rotate(5deg)" }}
              >
                <img src="/horizontal-frame.png" alt="Students" style={{ width: "100%", objectFit: "cover", display: "block" }} className="h-[90px] sm:h-[120px]" />
              </div>
            </div>
          </main>

          {/* ── BOTTOM STATS BAR ── */}
          <div className="w-full shrink-0 pb-10 lg:pb-28 px-4 sm:px-6 relative z-30">
            <div className="flex flex-row flex-wrap justify-center gap-2 sm:gap-3 max-w-screen-xl mx-auto">
              {/* Pill 1 – Blue (Hotel Partners) */}
              <div className="flex items-center gap-2 sm:gap-3 border border-white/45 bg-white/25 rounded-full px-2.5 py-2 sm:px-3 sm:py-2.5 shadow-md select-none">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0055A5] flex items-center justify-center shrink-0">
                  <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm sm:text-base font-semibold text-white leading-none">200+</p>
                  <p className="text-[8px] sm:text-[9px] font-bold text-white/75 uppercase tracking-widest mt-0.5">Hotel Partners</p>
                </div>
              </div>

              {/* Pill 2 – Red (Placements Rate) */}
              <div className="flex items-center gap-2 sm:gap-3 border border-white/45 bg-white/25 rounded-full px-2.5 py-2 sm:px-3 sm:py-2.5 shadow-md select-none">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E1000F] flex items-center justify-center shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm sm:text-base font-semibold text-white leading-none">99%</p>
                  <p className="text-[8px] sm:text-[9px] font-bold text-white/75 uppercase tracking-widest mt-0.5">Placements Rate</p>
                </div>
              </div>

              {/* Pill 3 – Green (Students Placed) */}
              <div className="flex items-center gap-2 sm:gap-3 border border-white/45 bg-white/25 rounded-full px-2.5 py-2 sm:px-3 sm:py-2.5 shadow-md select-none">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0b9940] flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm sm:text-base font-semibold text-white leading-none">5,000+</p>
                  <p className="text-[8px] sm:text-[9px] font-bold text-white/75 uppercase tracking-widest mt-0.5">Students Placed</p>
                </div>
              </div>

              {/* Pill 4 – Yellow (Experience) */}
              <div className="flex items-center gap-2 sm:gap-3 border border-white/45 bg-white/25 rounded-full px-2.5 py-2 sm:px-3 sm:py-2.5 shadow-md select-none">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#dea306] flex items-center justify-center shrink-0">
                  <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm sm:text-base font-semibold text-white leading-none">10Y+</p>
                  <p className="text-[8px] sm:text-[9px] font-bold text-white/75 uppercase tracking-widest mt-0.5">Experience</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
      <PartnersCarousel />
      <WhyGrandTour />
      <HowItWorks />
      <StudentLife />
      <Testimonials />
      <HomeCTA />
      <Footer />
    </div>
  );
}
