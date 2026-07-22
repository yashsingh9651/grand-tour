"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Compass,
  MessageSquare,
  Clock,
  Gift,
  Heart,
  ChevronDown
} from "lucide-react";

export default function ContactFormSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    college: "",
    program: "",
    message: ""
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/contact/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        const { toast } = await import('sonner');
        toast.success(data.message || 'Message sent successfully!');
        setForm({ name: '', email: '', phone: '', city: '', college: '', program: '', message: '' });
      } else {
        const { toast } = await import('sonner');
        toast.error(data.message || 'Failed to send message');
      }
    } catch (err) {
      const { toast } = await import('sonner');
      toast.error('Error sending message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <section className="w-full bg-white dark:bg-zinc-950 py-20 sm:py-28 px-4 sm:px-8 md:px-12 relative overflow-hidden">
      {/* Decorative Glow elements */}
      <div className="absolute top-1/4 right-0 w-[350px] h-[350px] rounded-full bg-[#dea306]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] rounded-full bg-[#0055A5]/5 blur-[100px] pointer-events-none" />
      <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
        {/* Left Column: Info, Image & Badges */}
        <div className="w-full lg:w-[45%] space-y-4 text-left">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center bg-[#E1000F]/10 px-4 py-1.5 rounded-full select-none">
            <span className="text-[#E1000F] text-xs font-semibold uppercase tracking-wider">
              Why're Here to Help
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
            Tell Us About Your <br />
            <span className="text-[#0055A5] dark:text-blue-500">Dream</span> Internship.
          </h2>

          {/* Paragraph */}
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-medium leading-relaxed max-w-xl">
            Drop us a message and one of our advisors will reachout with a personalized plan for your internship, visa,and life in France.
          </p>

          {/* Group Photo with Speech Testimonial */}
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/6] bg-slate-100 dark:bg-zinc-900 shadow-xl border border-slate-100 dark:border-zinc-800">
            <Image
              src="/about_group.png"
              alt="Students group photo in park"
              fill
              className="object-cover rounded-[2rem]"
              sizes="(max-width: 1024px) 100vw, 600px"
            />
            {/* Overlay speech pointer bubble */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute right-4 sm:-right-24 md:-right-32 bottom-4 sm:bottom-8 backdrop-blur z-20 bg-white/80 dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 p-3 sm:p-4 rounded-2xl shadow-xl max-w-[200px] sm:max-w-[260px] text-left"
            >
              <div className="flex gap-2.5 items-start">
                <span className="text-slate-500 dark:text-slate-400 text-lg leading-none">💬</span>
                <p className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-white leading-relaxed">
                  "They guided me through every step, from CV to visa."
                </p>
              </div>
            </motion.div>
          </div>

          {/* Badges Grid (2x2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Badge 1: Response within 24 Hours */}
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-[1.2rem] bg-[#0b9940]/10 border border-[#0b9940]/15 transition-all hover:bg-[#0b9940]/15">
              <div className="w-8 h-8 rounded-lg bg-[#0b9940]/15 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-[#0b9940]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#0b9940] tracking-wide leading-tight">
                Response within 24 Hours
              </span>
            </div>

            {/* Badge 2: Expert Guidance */}
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-[1.2rem] bg-[#0055A5]/10 border border-[#0055A5]/15 transition-all hover:bg-[#0055A5]/15">
              <div className="w-8 h-8 rounded-lg bg-[#0055A5]/15 flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4 text-[#0055A5]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#0055A5] tracking-wide leading-tight">
                Expert Guidance
              </span>
            </div>

            {/* Badge 3: Free Consultation */}
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-[1.2rem] bg-[#dea306]/10 border border-[#dea306]/15 transition-all hover:bg-[#dea306]/15">
              <div className="w-8 h-8 rounded-lg bg-[#dea306]/15 flex items-center justify-center shrink-0">
                <Gift className="w-4 h-4 text-[#dea306]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#dea306] tracking-wide leading-tight">
                Free Consultation
              </span>
            </div>

            {/* Badge 4: Personalized Support */}
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-[1.2rem] bg-[#E1000F]/10 border border-[#E1000F]/15 transition-all hover:bg-[#E1000F]/15">
              <div className="w-8 h-8 rounded-lg bg-[#E1000F]/15 flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4 text-[#E1000F]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#E1000F] tracking-wide leading-tight">
                Personalized Support
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Send Us a Message Form Card */}
        <div className="w-full lg:w-[55%] flex justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-[520px] bg-white dark:bg-zinc-900 shadow-[0_30px_70px_rgba(0,0,0,0.06)] rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 p-8 sm:p-10 text-left relative z-20"
          >
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight mb-8">
              Send Us a Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name & Email in Row on Tablet+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 dark:text-zinc-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-white text-sm font-medium placeholder-slate-400 focus:outline-none focus:border-[#0055A5] focus:ring-1 focus:ring-[#0055A5] transition-all"
                  />
                </div>

                {/* Email Address */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 dark:text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-white text-sm font-medium placeholder-slate-400 focus:outline-none focus:border-[#0055A5] focus:ring-1 focus:ring-[#0055A5] transition-all"
                  />
                </div>
              </div>

              {/* Phone & City in Row on Tablet+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone Number */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 dark:text-zinc-500">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-white text-sm font-medium placeholder-slate-400 focus:outline-none focus:border-[#0055A5] focus:ring-1 focus:ring-[#0055A5] transition-all"
                  />
                </div>

                {/* City */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 dark:text-zinc-500">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-white text-sm font-medium placeholder-slate-400 focus:outline-none focus:border-[#0055A5] focus:ring-1 focus:ring-[#0055A5] transition-all"
                  />
                </div>
              </div>

              {/* Course / College */}
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 dark:text-zinc-500">
                  <GraduationCap className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Course / College"
                  value={form.college}
                  onChange={(e) => setForm({ ...form, college: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-white text-sm font-medium placeholder-slate-400 focus:outline-none focus:border-[#0055A5] focus:ring-1 focus:ring-[#0055A5] transition-all"
                />
              </div>

              {/* Interested Internship Program Select */}
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 dark:text-zinc-500">
                  <Compass className="w-4 h-4" />
                </span>
                <select
                  required
                  value={form.program}
                  onChange={(e) => setForm({ ...form, program: e.target.value })}
                  className="w-full pl-11 pr-10 py-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-white text-sm font-medium appearance-none focus:outline-none focus:border-[#0055A5] focus:ring-1 focus:ring-[#0055A5] transition-all"
                >
                  <option value="" disabled hidden>Interested Internship Program</option>
                  <option value="culinary">Culinary Arts & Pastry</option>
                  <option value="fb">Food & Beverage Service</option>
                  <option value="front-office">Front Office & Rooms Division</option>
                  <option value="management">Hospitality Management</option>
                </select>
                <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                  <ChevronDown className="w-4 h-4" />
                </span>
              </div>

              {/* Message Textarea */}
              <div className="relative">
                <span className="absolute left-4 top-4 text-slate-400 dark:text-zinc-500">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <textarea
                  required
                  rows={4}
                  placeholder="Message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-white text-sm font-medium placeholder-slate-400 focus:outline-none focus:border-[#0055A5] focus:ring-1 focus:ring-[#0055A5] transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#0b9940] hover:bg-[#0b9940]/90 active:scale-[0.98] text-white font-bold py-4 rounded-full uppercase tracking-wider shadow-lg shadow-[#0b9940]/25 transition-all text-center mt-6 text-sm"
              >
                Send Message
              </button>
            </form>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
