"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { Kalam } from "next/font/google";
import dynamic from "next/dynamic";
import { toast } from "sonner";

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
const AboutStats = dynamic(() => import("@/components/AboutStats"), {
  ssr: false,
  loading: () => (
    <div className="h-28 bg-slate-50 dark:bg-zinc-950 animate-pulse flex items-center justify-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
      Loading stats...
    </div>
  ),
});

export default function PartnerPage() {
  const { data: session, status } = useSession();

  const isLoggedIn = status === "authenticated";
  const user = session?.user as any;

  const dashboardLink =
    user?.role === "SUPER_ADMIN" || user?.role === "ADMIN"
      ? "/admin"
      : "/dashboard";

  // Form State
  const [formData, setFormData] = useState({
    businessName: "",
    contactPerson: "",
    position: "",
    email: "",
    phone: "",
    city: "",
    country: "France",
    positions: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.contactPerson || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    // Simulate API network call
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success("Partnership request submitted successfully! Our team will reach out to you within 48 hours.");
    setFormData({
      businessName: "",
      contactPerson: "",
      position: "",
      email: "",
      phone: "",
      city: "",
      country: "France",
      positions: "",
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
          src="/partner_hero_bg.png"
          alt="Grand Tour Global Awards Gala Backdrop"
          fill
          priority
          className="object-cover object-center pointer-events-none select-none"
          sizes="100vw"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/65 z-[1]" />

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
          <span className="text-xs">🤝</span>
          <span className="text-white text-xs font-bold tracking-wide whitespace-nowrap">
            100+ Hotel Partners
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
                  Hospitality Network
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-5xl lg:text-[68px] font-black text-white leading-[1.08] tracking-tight">
                Partner with Grand Tour<br />
                & Shape the Future of<br />
                <span className="text-[#dea306]">Hospitality</span>
              </h1>

              {/* Paragraph */}
              <p className="text-sm sm:text-base text-white/80 max-w-lg font-medium leading-relaxed">
                Join our growing network of premium hotels and hospitality brands across France. Connect with skilled hospitality students, build your future workforce, and become part of an international internship ecosystem trusted by thousands.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href={isLoggedIn ? dashboardLink : "/login"}
                  className="bg-[#0b9940] hover:bg-[#0b9940]/90 active:scale-95 text-white font-semibold text-xs px-8 py-4 rounded-full uppercase tracking-wider transition-all shadow-lg text-center"
                >
                  Become a Partner
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
                  <span className="text-xs">🤝</span>
                  <span className="text-white text-[11px] font-bold tracking-wide">
                    100+ Hotel Partners
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
                    src="/partner_award_polaroid.png"
                    alt="Hospitality excellence award presentation"
                    fill
                    className="object-cover"
                    sizes="(max-w-640px) 240px, 290px"
                  />
                </div>
                {/* Cursive Bottom Label */}
                <div className={`${kalam.className} text-xl sm:text-2xl font-bold text-slate-800 text-center tracking-wide block mt-4`}>
                  Award
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>

      {/* ─── Trust Section ─── */}
      <section className="bg-white dark:bg-zinc-950 py-20 lg:py-28 px-4 sm:px-12 lg:px-20 w-full text-slate-900 dark:text-white relative z-20">
        <div className="w-full max-w-none mx-auto space-y-12 sm:space-y-16">

          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6">
            <div className="space-y-4">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center bg-[#E6F4EA] dark:bg-emerald-950/30 text-[#0F8A4E] text-[10px] sm:text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider select-none">
                Why Partner With Us
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-[56px] font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                A Partnership<br />Built On Trust
              </h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base md:text-lg leading-relaxed max-w-md font-medium lg:pb-2">
              We handle the sourcing, screening and coordination — so you can focus on developing exceptional hospitality talent.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">

            {/* Card 1: Collaboration in Action */}
            <div className="md:col-span-6 group relative h-[320px] sm:h-[380px] rounded-3xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.01] bg-slate-100">
              <Image
                src="/partner_trust_1.png"
                alt="Students collaboration"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                sizes="(max-w-1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-[1]" />

              <div className="absolute bottom-6 left-6 right-6 z-10 space-y-2">
                <span className="text-[#dea306] text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                  Collaboration in Action
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-white leading-snug">
                  Real partnerships between hotels and hospitality institutes.
                </h3>
              </div>
            </div>

            {/* Card 2: International Talent Pipeline */}
            <div className="md:col-span-6 group relative h-[320px] sm:h-[380px] rounded-3xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.01] bg-slate-100">
              <Image
                src="/partner_trust_2.png"
                alt="Stacked plates food preparation"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                sizes="(max-w-1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-[1]" />

              <div className="absolute bottom-6 left-6 right-6 z-10">
                <h3 className="text-xl sm:text-[32px] font-black text-white leading-tight flex items-center gap-2">
                  🌍 International Talent Pipeline
                </h3>
              </div>
            </div>

            {/* Card 3: Simplified Internship Coordination */}
            <div className="md:col-span-6 group relative h-[200px] sm:h-[240px] rounded-3xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.01] bg-slate-100">
              <Image
                src="/partner_trust_3.png"
                alt="Kitchen chefs team"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                sizes="(max-w-1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-[1]" />

              <div className="absolute bottom-6 left-6 right-6 z-10 space-y-1">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Simplified Internship Coordination
                </h3>
                <p className="text-white/80 text-xs sm:text-sm font-medium">
                  Scheduling, documentation, and onboarding — handled end-to-end.
                </p>
              </div>
            </div>

            {/* Card 4: Access to Pre-Screened Students */}
            <div className="md:col-span-3 h-[200px] sm:h-[240px] bg-[#00B853] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-lg transition-transform duration-300 hover:scale-[1.01] select-none text-white">
              <div className="text-3xl sm:text-4xl">
                🏫
              </div>
              <h3 className="text-base sm:text-lg font-black leading-snug">
                Access to Pre-Screened Hospitality Students
              </h3>
            </div>

            {/* Card 5: Long-Term Recruitment Relationships */}
            <div className="md:col-span-3 h-[200px] sm:h-[240px] bg-[#FFF5D9] dark:bg-amber-950/15 border-2 border-dashed border-[#F3C472]/70 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-lg transition-transform duration-300 hover:scale-[1.01] select-none text-slate-800 dark:text-amber-200">
              <div className="text-3xl sm:text-4xl">
                ⭐
              </div>
              <h3 className="text-base sm:text-lg font-black leading-snug">
                Long-Term Recruitment Relationships
              </h3>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Form & Contact Section ─── */}
      <section className="bg-slate-50 dark:bg-zinc-900/20 py-20 lg:py-28 px-4 sm:px-12 lg:px-20 w-full text-slate-900 dark:text-white relative z-20">
        <div className="w-full max-w-none mx-auto space-y-12">

          {/* Section Header */}
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Eyebrow tag */}
            <div className="inline-flex items-center bg-[#FFF5D9] dark:bg-amber-950/30 text-[#dea306] text-[10px] sm:text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider select-none">
              Get In Touch
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight max-w-2xl">
              Become An Official Grand Tour Partner
            </h2>
          </div>

          {/* Main Container Card */}
          <div className="max-w-6xl mx-auto bg-white dark:bg-zinc-950 p-6 sm:p-10 lg:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-100 dark:shadow-none border border-slate-100 dark:border-zinc-800/80 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">

            {/* Left Column: Form */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight mb-2">
                  Let's Build Something Great Together
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-lg">
                  Tell us about your business and internship needs — our partnership team will reach out within 48 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

                  {/* Business Name */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                      Hotel / Business Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hôtel Belle Rive"
                      value={formData.businessName}
                      onChange={e => setFormData(p => ({ ...p, businessName: e.target.value }))}
                      className="w-full text-xs sm:text-sm px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all"
                    />
                  </div>

                  {/* Contact Person */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                      Contact Person <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Full name"
                      value={formData.contactPerson}
                      onChange={e => setFormData(p => ({ ...p, contactPerson: e.target.value }))}
                      className="w-full text-xs sm:text-sm px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all"
                    />
                  </div>

                  {/* Position */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                      Position
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HR Director"
                      value={formData.position}
                      onChange={e => setFormData(p => ({ ...p, position: e.target.value }))}
                      className="w-full text-xs sm:text-sm px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@hotel.com"
                      value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      className="w-full text-xs sm:text-sm px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+33 ..."
                      value={formData.phone}
                      onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                      className="w-full text-xs sm:text-sm px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all"
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Nice"
                      value={formData.city}
                      onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                      className="w-full text-xs sm:text-sm px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all"
                    />
                  </div>

                  {/* Country */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                      Country
                    </label>
                    <input
                      type="text"
                      placeholder="France"
                      value={formData.country}
                      onChange={e => setFormData(p => ({ ...p, country: e.target.value }))}
                      className="w-full text-xs sm:text-sm px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all"
                    />
                  </div>

                  {/* Positions */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                      Number of Internship Positions
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5"
                      value={formData.positions}
                      onChange={e => setFormData(p => ({ ...p, positions: e.target.value }))}
                      className="w-full text-xs sm:text-sm px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your internship needs..."
                    value={formData.message}
                    onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                    className="w-full text-xs sm:text-sm px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center bg-gradient-to-r from-[#00A651] to-[#1D4ED8] hover:from-[#008F45] hover:to-[#1E40AF] disabled:opacity-60 text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 sm:py-4 rounded-full transition-all duration-200 active:scale-95 shadow-lg select-none uppercase tracking-wider cursor-pointer"
                >
                  {isSubmitting ? "Submitting Request..." : "Submit Partnership Request"}
                </button>
              </form>
            </div>

            {/* Right Column: Info Card */}
            <div className="lg:col-span-5 bg-[#E8F1EC] dark:bg-zinc-900/60 p-6 sm:p-8 rounded-[2rem] flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                {/* Executive contact tag */}
                <div>
                  <span className="inline-block bg-white/60 dark:bg-white/10 text-slate-700 dark:text-white/80 text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider select-none">
                    Executive Contact
                  </span>
                </div>

                {/* Contact List */}
                <div className="space-y-4 sm:space-y-5 text-slate-700 dark:text-slate-200">

                  {/* Address */}
                  <div className="flex gap-3">
                    <span className="text-lg shrink-0 mt-0.5">📍</span>
                    <div>
                      <h4 className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">Office Address</h4>
                      <p className="text-xs sm:text-sm font-semibold mt-0.5">15 Rue de la Paix, 75002 Paris, France</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex gap-3">
                    <span className="text-lg shrink-0 mt-0.5">📞</span>
                    <div>
                      <h4 className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">Phone Number</h4>
                      <p className="text-xs sm:text-sm font-semibold mt-0.5">+33 1 23 45 67 89</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex gap-3">
                    <span className="text-lg shrink-0 mt-0.5">📩</span>
                    <div>
                      <h4 className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">Email Address</h4>
                      <p className="text-xs sm:text-sm font-semibold mt-0.5">partners@grandtour.fr</p>
                    </div>
                  </div>

                  {/* Website */}
                  <div className="flex gap-3">
                    <span className="text-lg shrink-0 mt-0.5">🌐</span>
                    <div>
                      <h4 className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">Website</h4>
                      <p className="text-xs sm:text-sm font-semibold mt-0.5">www.grandtour.fr</p>
                    </div>
                  </div>

                  {/* Working Hours */}
                  <div className="flex gap-3">
                    <span className="text-lg shrink-0 mt-0.5">🕒</span>
                    <div>
                      <h4 className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">Working Hours</h4>
                      <p className="text-xs sm:text-sm font-semibold mt-0.5">Mon - Fri, 9:00 - 18:00 CET</p>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="flex gap-3">
                    <span className="text-lg shrink-0 mt-0.5">💬</span>
                    <div>
                      <h4 className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">WhatsApp</h4>
                      <p className="text-xs sm:text-sm font-semibold mt-0.5">+33 6 12 34 56 78</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Bottom Tagline & Pills */}
              <div className="pt-4 border-t border-slate-200/50 dark:border-zinc-800/50 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🌎</span>
                  <h4 className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Serving Hospitality Partners Across France
                  </h4>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] sm:text-xs font-semibold bg-white/50 dark:bg-white/5 text-slate-700 dark:text-white/70 px-3 py-1.5 rounded-full border border-white/20">
                    ✓ Fast Response
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold bg-white/50 dark:bg-white/5 text-slate-700 dark:text-white/70 px-3 py-1.5 rounded-full border border-white/20">
                    ✓ Dedicated Partnership Team
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold bg-white/50 dark:bg-white/5 text-slate-700 dark:text-white/70 px-3 py-1.5 rounded-full border border-white/20">
                    ✓ International Network
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold bg-white/50 dark:bg-white/5 text-slate-700 dark:text-white/70 px-3 py-1.5 rounded-full border border-white/20">
                    ✓ Hospitality Specialists
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      <AboutStats />
      <Footer />
    </div>
  );
}
