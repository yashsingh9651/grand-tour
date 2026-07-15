"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ContactWays() {
  const row1 = [
    {
      icon: "📍",
      title: "Office (INDIA)",
      desc: "Office 19 & 20, Indulal Complex, Lal Bahadur Shastri Rd, Lokamanya Nagar, Navi Peth, Sadashiv Peth, Pune, Maharashtra 411030",
      bgColor: "bg-[#0b9940]/5 border-[#0b9940]/10 hover:bg-[#0b9940]/8"
    },
    {
      icon: "📞",
      title: "Phone Number (INDIA)",
      links: [
        { href: "tel:+917350235552", text: "+91 73502 35552" },
        { href: "tel:+917350325552", text: "+91 73503 25552" }
      ],
      bgColor: "bg-[#dea306]/5 border-[#dea306]/10 hover:bg-[#dea306]/8"
    },
    {
      icon: "📧",
      sections: [
        { title: "General Enquiries", link: "mailto:contact@grandtour.in", text: "contact@grandtour.in" },
        { title: "Partner Hotels", link: "mailto:partners@grandtour.co.in", text: "partners@grandtour.co.in" }
      ],
      bgColor: "bg-[#0055A5]/5 border-[#0055A5]/10 hover:bg-[#0055A5]/8"
    },
    {
      icon: "📍",
      title: "Office(FRANCE)",
      desc: "5 Rue du Nord, Dijon 21000, France",
      bgColor: "bg-[#E1000F]/5 border-[#E1000F]/10 hover:bg-[#E1000F]/8"
    }
  ];

  const row2 = [
    {
      icon: "🕒",
      title: "Working Hours",
      desc: "Mon - Sat: 9:00 AM - 6:00 PM (IST)",
      bgColor: "bg-[#0b9940]/5 border-[#0b9940]/10 hover:bg-[#0b9940]/8"
    },
    {
      icon: "📞",
      title: "Phone Number (FRANCE)",
      links: [
        { href: "tel:+33746546220", text: "+33 7 46 54 62 20" }
      ],
      bgColor: "bg-[#dea306]/5 border-[#dea306]/10 hover:bg-[#dea306]/8"
    },
    {
      icon: "📱",
      title: "Social Media",
      desc: "@grandtour.internships",
      bgColor: "bg-[#0055A5]/5 border-[#0055A5]/10 hover:bg-[#0055A5]/8"
    }
  ];

  return (
    <section className="w-full bg-white dark:bg-zinc-950 py-20 px-4 sm:px-8 md:px-12 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-10 left-10 w-[250px] h-[250px] rounded-full bg-[#0b9940]/5 blur-[80px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] rounded-full bg-[#0055A5]/5 blur-[100px] pointer-events-none" />

      {/* Main container - max-w-6xl used instead of max-w-7xl */}
      <div className="max-w-6xl mx-auto space-y-16 relative z-10 text-center">
        
        {/* Header Block */}
        <div className="space-y-4">
          <div className="inline-flex items-center bg-[#0055A5]/10 px-4 py-1.5 rounded-full select-none">
            <span className="text-[#0055A5] text-xs font-semibold uppercase tracking-wider">
              Stay Connected
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Every Way To Reach Us
          </h2>
        </div>

        {/* Staggered Row Layout for Cards */}
        <div className="space-y-6">
          {/* Row 1 (4 Cards on large screens, wraps on smaller screens) */}
          <div className="flex flex-wrap items-end justify-center gap-6">
            {row1.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.04)" }}
                className={`w-full sm:w-[260px] rounded-[2rem] p-6 text-left border flex flex-col justify-start gap-4 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.01)] ${card.bgColor}`}
              >
                <div className="text-3xl select-none">{card.icon}</div>
                
                {/* Check if it's card 3 (General Enquiries & Partner Hotels) or standard card */}
                {card.sections ? (
                  <div className="space-y-3">
                    {card.sections.map((sect, j) => (
                      <div key={j} className="space-y-0.5">
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white leading-tight">
                          {sect.title}
                        </h4>
                        <a 
                          href={sect.link}
                          className="text-[11px] font-semibold text-slate-500 hover:text-[#0055A5] dark:text-slate-400 underline block break-all leading-tight"
                        >
                          {sect.text}
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1.5 flex-1 flex flex-col justify-start">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white leading-tight">
                      {card.title}
                    </h4>
                    
                    {card.desc && (
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                        {card.desc}
                      </p>
                    )}

                    {card.links && (
                      <div className="space-y-1 mt-1">
                        {card.links.map((link, j) => (
                          <a
                            key={j}
                            href={link.href}
                            className="text-[11px] font-semibold text-slate-500 hover:text-[#dea306] dark:text-slate-400 underline block leading-tight"
                          >
                            {link.text}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Row 2 (3 Cards, staggered and centered on large screens) */}
          <div className="flex flex-wrap items-start justify-center gap-6">
            {row2.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i + 4) * 0.1 }}
                whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.04)" }}
                className={`w-full sm:w-[260px] rounded-[2rem] p-6 text-left border flex flex-col justify-start gap-4 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.01)] ${card.bgColor}`}
              >
                <div className="text-3xl select-none">{card.icon}</div>
                <div className="space-y-1.5 flex-1 flex flex-col justify-start">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white leading-tight">
                    {card.title}
                  </h4>
                  
                  {card.desc && (
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                      {card.desc}
                    </p>
                  )}

                  {card.links && (
                    <div className="space-y-1 mt-1">
                      {card.links.map((link, j) => (
                        <a
                          key={j}
                          href={link.href}
                          className="text-[11px] font-semibold text-slate-500 hover:text-[#dea306] dark:text-slate-400 underline block leading-tight"
                        >
                          {link.text}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
