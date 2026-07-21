"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { Kalam } from "next/font/google";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { GraduationCap, Cake, MessageSquare, Globe } from "lucide-react";

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
const Testimonials = dynamic(() => import("@/components/Testimonials"), {
  ssr: false,
  loading: () => (
    <div className="h-28 bg-slate-50 dark:bg-zinc-950 animate-pulse flex items-center justify-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
      Loading testimonials...
    </div>
  )
});
const HomeCTA = dynamic(() => import("@/components/HomeCTA"), {
  ssr: false,
  loading: () => (
    <div className="h-28 bg-slate-50 dark:bg-zinc-950 animate-pulse flex items-center justify-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
      Loading home cta...
    </div>
  )
});

const AboutStats = dynamic(() => import("@/components/AboutStats"), {
  ssr: false,
  loading: () => (
    <div className="h-28 bg-slate-50 dark:bg-zinc-950 animate-pulse flex items-center justify-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
      Loading stats...
    </div>
  ),
});

export default function InternshipInFrancePage() {
  const { data: session, status } = useSession();

  const isLoggedIn = status === "authenticated";
  const user = session?.user as any;

  const dashboardLink =
    user?.role === "SUPER_ADMIN" || user?.role === "ADMIN"
      ? "/admin"
      : "/dashboard";

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    college: "",
    department: "",
    city: "",
    country: "India",
    startDate: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone || !formData.college) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    // Simulate API network call
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success("Application submitted successfully! Our admissions team will reach out to you within 24 hours.");
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      college: "",
      department: "",
      city: "",
      country: "India",
      startDate: "",
      message: ""
    });
    setIsSubmitting(false);
  };

  return (
    <div className={`relative w-full min-h-screen bg-white dark:bg-zinc-950 overflow-x-hidden font-Gilroy ${kalam.variable}`}>
      {/* ─── Partner Hero wrapper ─── */}
      <div className="relative w-full min-h-screen lg:h-screen lg:overflow-hidden shrink-0 flex flex-col">
        {/* Background Image */}
        <Image
          src="/blog_featured.png"
          alt="Classroom presentation backdrop"
          fill
          priority
          className="object-cover object-center pointer-events-none select-none"
          sizes="100vw"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/75 z-[1]" />

        {/* Ambient Decorative Circles */}
        {/* Top-Right Yellow Glow */}
        <div className="absolute top-[-10%] right-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-amber-500/10 rounded-full blur-[100px] sm:blur-[130px] z-[2] pointer-events-none" />
        {/* Bottom-Left Blue Glow */}
        <div className="absolute bottom-[-10%] left-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-blue-500/15 rounded-full blur-[100px] sm:blur-[130px] z-[2] pointer-events-none" />

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
        <main className="flex-1 relative z-50 w-full px-4 sm:px-12 lg:px-20 pt-28 pb-16 lg:py-0 flex items-center justify-between">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 lg:gap-8 w-full">
            {/* Left Column: Headline and Description */}
            <div className="flex-1 text-left space-y-6 lg:pr-4">
              {/* Eyebrow Pill Badge */}
              <div className="inline-flex items-center gap-2 border-[0.5px] border-white/30 px-4 py-1.5 rounded-full select-none bg-white/20 backdrop-blur">
                <span className="text-[#dea306] text-[10px] font-semibold uppercase tracking-wider">
                  Internship in France
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-5xl lg:text-[68px] font-black text-white leading-[1.08] tracking-tight">
                Your Hospitality<br />
                Career Begins <span className="text-[#dea306]">In</span><br />
                <span className="text-[#dea306]">France</span>
              </h1>

              {/* Paragraph */}
              <p className="text-sm sm:text-base text-white/80 max-w-lg font-medium leading-relaxed">
                Gain real, paid work experience in France's finest hotels and restaurants — while living, learning, and building an international career in one of the most beautiful countries on earth.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href={isLoggedIn ? dashboardLink : "/login"}
                  className="bg-[#0b9940] hover:bg-[#0b9940]/90 active:scale-95 text-white font-semibold text-xs px-8 py-4 rounded-full uppercase tracking-wider transition-all shadow-lg text-center"
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
                className="relative z-20 bg-white p-3 pb-8 rounded-sm shadow-[0_30px_70px_rgba(0,0,0,0.55)] w-[200px] sm:w-[240px] border border-slate-100 shrink-0"
              >
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-sm bg-slate-100">
                  <Image
                    src="/internship_hero_polaroid.png"
                    alt="Gourmet appetizer plating preview"
                    fill
                    className="object-cover"
                    sizes="(max-w-640px) 200px, 240px"
                  />
                </div>
                {/* Cursive Bottom Label */}
                <div className={`${kalam.className} text-xl sm:text-2xl font-bold text-slate-800 text-center tracking-wide block mt-4`}>
                  fooooddd
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>

      {/* ─── Eligibility Section ("Who Can Apply?") ─── */}
      <section className="bg-white dark:bg-zinc-950 py-20 lg:py-28 px-4 sm:px-12 lg:px-20 w-full text-slate-900 dark:text-white relative z-20 overflow-hidden">
        <div className="w-full max-w-none mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">

          {/* Left Column: Kitchen image with Stamps */}
          <div className="lg:col-span-6 relative flex justify-center lg:block select-none py-12 px-4 sm:px-8">

            {/* Red dashed stamp on top left */}
            <div className="absolute top-10 left-2 sm:left-6 lg:left-[-10px] z-30 bg-white border-[3px] border-dashed border-[#DC2626] p-3 px-5 rounded-2xl shadow-lg -rotate-[10deg] transform">
              <div className="text-[10px] font-black text-[#DC2626] uppercase tracking-widest text-center">Entry Stamp</div>
              <div className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wide mt-0.5 whitespace-nowrap">RÉPUBLIQUE FRANÇAISE</div>
            </div>

            {/* Main Kitchen Image (Rotated left) */}
            <div className="relative w-[280px] sm:w-[580px] aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.18)] bg-slate-50 -rotate-[3deg] transform transition-transform duration-500 hover:rotate-0">
              <Image
                src="/internship_who_can_apply.png"
                alt="Chefs collaborating in commercial kitchen"
                fill
                className="object-cover"
                sizes="(max-w-640px) 280px, 480px"
              />
            </div>

            {/* Blue stamp on bottom right */}
            <div className="absolute bottom-5 right-2 sm:right-6 lg:right-[10px] z-30 bg-[#2563EB] p-3.5 px-5 rounded-2xl shadow-2xl -rotate-[6deg] transform text-white flex items-center gap-3">
              <svg className="w-5 h-5 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div className="text-left leading-none">
                <div className="text-[9px] font-black text-white/70 uppercase tracking-widest">Passport Ready</div>
                <div className="text-xs sm:text-sm font-black text-white uppercase tracking-wide mt-0.5 whitespace-nowrap">Let's Go</div>
              </div>
            </div>

          </div>

          {/* Right Column: Title & Eligibility List */}
          <div className="lg:col-span-6 space-y-8 text-left relative">
            {/* Soft pink glow background */}
            <div className="absolute right-[-20%] top-[10%] w-[350px] h-[350px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

            {/* Eyebrow badge */}
            <div className="space-y-4">
              <div className="inline-flex items-center bg-[#FEE2E2] dark:bg-rose-950/20 text-[#DC2626] text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full select-none">
                Eligibility Criteria
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-[56px] font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                Who Can Apply?
              </h2>
            </div>

            {/* Eligibility Items List (with vertical line) */}
            <div className="relative pl-0 space-y-8">

              {/* Thick vertical dashed line */}
              <div className="absolute left-[26px] sm:left-[28px] top-6 bottom-6 w-0.5 border-l-[3px] border-dashed border-slate-200 dark:border-zinc-800 -z-10" />

              {/* Item 1 */}
              <div className="flex items-center relative min-h-[100px]">
                {/* Green Icon Box */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-[1.25rem] bg-[#008F45] flex items-center justify-center shrink-0 shadow-[0_12px_24px_rgba(0,143,69,0.3)] z-10">
                  <span className="text-2xl select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">🎓</span>
                </div>

                {/* Description Card */}
                <div className="ml-20 flex-1 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800/80 shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    Hotel Management Student
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                    Currently enrolled in a Hotel Management Degree or Diploma program.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-center relative min-h-[100px]">
                {/* Yellow Icon Box */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-[1.25rem] bg-[#F3A007] flex items-center justify-center shrink-0 shadow-[0_12px_24px_rgba(243,160,7,0.35)] z-10">
                  <span className="text-2xl select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">🎂</span>
                </div>

                {/* Description Card */}
                <div className="ml-20 flex-1 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800/80 shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    Age 18–26
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                    Applicants should be between 18 and 26 years old at the time of application.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-center relative min-h-[100px]">
                {/* Red Icon Box */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-[1.25rem] bg-[#B71C1C] flex items-center justify-center shrink-0 shadow-[0_12px_24px_rgba(183,28,28,0.35)] z-10">
                  <span className="text-2xl select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">💬</span>
                </div>

                {/* Description Card */}
                <div className="ml-20 flex-1 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800/80 shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    Communicates Well
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                    Good communication skills in English (French is a bonus, not required).
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ─── Benefits Section ("What You Get") ─── */}
      <section className="bg-slate-50/50 dark:bg-zinc-900/10 py-20 lg:py-28 px-4 sm:px-12 lg:px-20 w-full text-slate-900 dark:text-white relative z-20 overflow-hidden">
        <div className="w-full max-w-none mx-auto space-y-12 sm:space-y-16">

          {/* Section Header */}
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center bg-[#EEF2FF] dark:bg-blue-950/20 text-[#3B82F6] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full select-none">
              What You Get
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-[56px] font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
              Benefits Of The Internship
            </h2>
          </div>

          {/* Grid container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">

            {/* Card 1: Free Accommodation (Left, 6 cols) */}
            <div className="lg:col-span-6 group relative h-[380px] sm:h-[420px] rounded-[2.5rem] overflow-hidden shadow-lg border border-slate-100 dark:border-zinc-800/80 bg-slate-100 shrink-0">
              <Image
                src="/about_chefs.png"
                alt="Chefs smiling in kitchen"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                sizes="(max-w-1024px) 100vw, 50vw"
              />
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent z-[1]" />

              <div className="absolute bottom-8 left-8 right-8 z-10 space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏨</span>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                    Free Accommodation
                  </h3>
                </div>
                <p className="text-white/80 text-xs sm:text-sm font-medium leading-relaxed max-w-md">
                  Comfortable housing provided for the full internship, close to your workplace.
                </p>
              </div>
            </div>

            {/* Card 2: Right Column container (6 cols) */}
            <div className="lg:col-span-6 flex flex-col justify-between gap-6">

              {/* Card 2a: €669+ Monthly Stipend */}
              <div className="relative bg-[#00B853] p-6 sm:p-8 rounded-[2.5rem] shadow-lg text-white flex flex-col justify-between h-[200px] sm:h-[220px] overflow-hidden select-none group">

                {/* Background watermarked Euro icon */}
                <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 text-[140px] sm:text-[180px] font-black text-white/5 select-none pointer-events-none transition-transform duration-500 group-hover:scale-110">
                  €
                </div>

                <div className="text-2xl">
                  💵
                </div>

                <div className="space-y-1 relative z-10 text-left">
                  <span className="text-3xl sm:text-[40px] font-black leading-none block">
                    €669+
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-white/90">
                    Monthly Stipend, guaranteed
                  </p>
                </div>

              </div>

              {/* Row of 2 bottom cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">

                {/* Card 2b: Schengen Visa */}
                <div className="bg-[#EEF4FF] dark:bg-blue-950/15 border-2 border-dashed border-blue-200 dark:border-blue-900/40 p-6 rounded-3xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow select-none text-left">
                  <div className="text-2xl">
                    ✈️
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                      6-Month Schengen Visa
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                      Full visa support included
                    </p>
                  </div>
                </div>

                {/* Card 2c: 5 Days per week */}
                <div className="bg-[#0A1F17] p-6 rounded-3xl flex flex-col justify-between shadow-lg select-none text-left">
                  <div className="text-2xl">
                    📅
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-extrabold text-white">
                      5 Days
                    </h4>
                    <p className="text-[11px] sm:text-xs text-white/60 font-semibold leading-relaxed">
                      per week
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Row 2 Grid container */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full items-stretch">

            {/* Card 3: Duty Meals (4 cols) */}
            <div className="md:col-span-4 group relative h-[260px] sm:h-[300px] rounded-[2rem] overflow-hidden shadow-lg border border-slate-100 dark:border-zinc-800/80 bg-slate-100 shrink-0">
              <Image
                src="/internship_hero_polaroid.png"
                alt="Duty meals preview"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                sizes="(max-w-768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-[1]" />

              <div className="absolute bottom-6 left-6 right-6 z-10 flex items-center gap-2 text-left">
                <span className="text-lg">🍽️</span>
                <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                  Duty Meals Included
                </h3>
              </div>
            </div>

            {/* Card 4: Middle column (4 cols) */}
            <div className="md:col-span-4 flex flex-col justify-between gap-6">

              {/* Card 4a: Hours per week */}
              <div className="bg-[#FFF5F5] dark:bg-rose-950/10 p-5 rounded-3xl flex items-center gap-4 shadow-sm border border-rose-100/50 dark:border-rose-900/10 text-left select-none shrink-0">
                <div className="text-2xl">
                  ⏰
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                    45–55 hrs/week
                  </h4>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold leading-none mt-1">
                    Structured working hours
                  </p>
                </div>
              </div>

              {/* Card 4b: Learn From Experts image card */}
              <div className="group relative flex-1 min-h-[180px] rounded-[2rem] overflow-hidden shadow-lg border border-slate-100 dark:border-zinc-800/80 bg-slate-100">
                <Image
                  src="/internship_learn_experts.png"
                  alt="Mentoring chefs"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-w-768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent z-[1]" />

                <div className="absolute bottom-6 left-6 right-6 z-10 flex items-center gap-2 text-left">
                  <span className="text-lg">🧑‍🍳</span>
                  <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                    Learn From Experts
                  </h3>
                </div>
              </div>

            </div>

            {/* Card 5: International Exposure Eiffel Tower (4 cols) */}
            <div className="md:col-span-4 group relative h-[260px] sm:h-[300px] rounded-[2rem] overflow-hidden shadow-lg border border-slate-100 dark:border-zinc-800/80 bg-slate-100 shrink-0">
              <Image
                src="/vertical-frame.png"
                alt="Eiffel Tower Paris"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                sizes="(max-w-768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent z-[1]" />

              <div className="absolute bottom-6 left-6 right-6 z-10 flex items-center gap-2 text-left">
                <span className="text-lg">🌏</span>
                <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                  International Exposure
                </h3>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── Placements & Credentials Section ("A decade of getting...") ─── */}
      <section className="bg-[#0A1F17] py-20 lg:py-28 px-4 sm:px-12 lg:px-20 w-full text-white relative z-20 overflow-hidden">
        <div className="w-full max-w-none mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* Left Column: Why Grand Tour Features */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center bg-white/10 text-[#dea306] border border-white/10 px-4 py-1.5 rounded-full select-none text-[10px] font-black uppercase tracking-widest gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dea306]" />
              Why Grand Tour
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-5xl font-black leading-[1.15] tracking-tight max-w-xl text-left">
              A decade of getting students <span className="text-[#dea306]">real placements</span>, not just promises.
            </h2>

            {/* Features List */}
            <div className="mt-12 space-y-6">
              
              {/* Item 1 */}
              <div className="flex items-start gap-4 text-left border-b border-white/5 pb-5">
                <div className="w-12 h-12 rounded-xl bg-[#008F45] flex items-center justify-center shrink-0">
                  <span className="text-xl select-none">🤝</span>
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-white">
                    Trusted Industry Network
                  </h4>
                  <p className="text-xs sm:text-sm text-white/60 font-medium leading-relaxed mt-1">
                    A decade of direct relationships with hotel groups across France.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-start gap-4 text-left border-b border-white/5 pb-5">
                <div className="w-12 h-12 rounded-xl bg-[#F3A007] flex items-center justify-center shrink-0">
                  <span className="text-xl select-none">🧭</span>
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-white">
                    Personalized Guidance
                  </h4>
                  <p className="text-xs sm:text-sm text-white/60 font-medium leading-relaxed mt-1">
                    One-on-one support matching you to the right placement.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-start gap-4 text-left border-b border-white/5 pb-5">
                <div className="w-12 h-12 rounded-xl bg-[#B71C1C] flex items-center justify-center shrink-0">
                  <span className="text-xl select-none">📄</span>
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-white">
                    Complete Documentation Support
                  </h4>
                  <p className="text-xs sm:text-sm text-white/60 font-medium leading-relaxed mt-1">
                    Visa, contracts, insurance — we handle the paperwork.
                  </p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="flex items-start gap-4 text-left border-b border-white/5 pb-5">
                <div className="w-12 h-12 rounded-xl bg-[#2563EB] flex items-center justify-center shrink-0">
                  <span className="text-xl select-none">📈</span>
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-white">
                    High Placement Success
                  </h4>
                  <p className="text-xs sm:text-sm text-white/60 font-medium leading-relaxed mt-1">
                    A track record of successful, on-time placements every season.
                  </p>
                </div>
              </div>

              {/* Item 5 */}
              <div className="flex items-start gap-4 text-left border-b border-white/5 pb-5">
                <div className="w-12 h-12 rounded-xl bg-[#008F45] flex items-center justify-center shrink-0">
                  <span className="text-xl select-none">🏨</span>
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-white">
                    Premium Hotel Partnerships
                  </h4>
                  <p className="text-xs sm:text-sm text-white/60 font-medium leading-relaxed mt-1">
                    Access to 4- and 5-star properties across France.
                  </p>
                </div>
              </div>

              {/* Item 6 */}
              <div className="flex items-start gap-4 text-left">
                <div className="w-12 h-12 rounded-xl bg-[#F3A007] flex items-center justify-center shrink-0">
                  <span className="text-xl select-none">🧑‍🏫</span>
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-white">
                    Dedicated Student Mentors
                  </h4>
                  <p className="text-xs sm:text-sm text-white/60 font-medium leading-relaxed mt-1">
                    Support before you fly, and throughout your stay.
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Refrigerator Photo and Stats Grid */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Main Refrigerator Image Card */}
            <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 bg-slate-800">
              <Image
                src="/internship_kitchen_refrigerator.png"
                alt="Student chef working with large commercial refrigerator"
                fill
                className="object-cover"
                sizes="(max-w-1024px) 100vw, 50vw"
              />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Stat 1: 99% Success */}
              <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-5 text-center flex flex-col justify-center min-h-[120px] transition-all hover:bg-white/[0.05]">
                <span className="text-2xl sm:text-3xl font-black text-[#dea306] leading-none block">
                  99%
                </span>
                <span className="text-[10px] sm:text-xs text-white/50 font-bold uppercase tracking-wider mt-2">
                  Placement Success
                </span>
              </div>

              {/* Stat 2: 5000+ Placed */}
              <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-5 text-center flex flex-col justify-center min-h-[120px] transition-all hover:bg-white/[0.05]">
                <span className="text-2xl sm:text-3xl font-black text-[#00B853] leading-none block">
                  5000+
                </span>
                <span className="text-[10px] sm:text-xs text-white/50 font-bold uppercase tracking-wider mt-2">
                  Students Placed
                </span>
              </div>

              {/* Stat 3: 200+ Partners */}
              <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-5 text-center flex flex-col justify-center min-h-[120px] transition-all hover:bg-white/[0.05]">
                <span className="text-2xl sm:text-3xl font-black text-[#3B82F6] leading-none block">
                  200+
                </span>
                <span className="text-[10px] sm:text-xs text-white/50 font-bold uppercase tracking-wider mt-2">
                  Hotel Partners
                </span>
              </div>

              {/* Stat 4: 10+ Years */}
              <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-5 text-center flex flex-col justify-center min-h-[120px] transition-all hover:bg-white/[0.05]">
                <span className="text-2xl sm:text-3xl font-black text-[#EF4444] leading-none block">
                  10+
                </span>
                <span className="text-[10px] sm:text-xs text-white/50 font-bold uppercase tracking-wider mt-2">
                  Years Experience
                </span>
              </div>

            </div>

          </div>

        </div>
      </section>

      <AboutStats />
      <Testimonials />
      <HomeCTA />
      <Footer />
    </div>
  );
}
