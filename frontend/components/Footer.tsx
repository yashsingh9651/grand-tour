'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="pb-16 mt-5 px-4 sm:px-6 lg:px-8 relative z-10">
      {/* Outer Rounded Container */}
      <div className="max-w-8xl mx-auto rounded-[2.5rem] bg-[#121214] text-white shadow-xl relative overflow-hidden">
        
        {/* White Logo Tab (Top Left) */}
        <div className="absolute top-0 left-6 sm:left-20 bg-white px-8 py-5 rounded-b-[.8rem] flex items-center justify-center z-10">
          {/* Left Concave Curve */}
          <div className="absolute top-0 right-full w-5 h-5 bg-white pointer-events-none">
            <div className="absolute inset-0 bg-[#121214] rounded-tr-[.8rem]" />
          </div>
          {/* Right Concave Curve */}
          <div className="absolute top-0 left-full w-5 h-5 bg-white pointer-events-none">
            <div className="absolute inset-0 bg-[#121214] rounded-tl-[.8rem]" />
          </div>
          
          <Image 
            src="/logo.png" 
            alt="Grand Tour Logo" 
            width={120} 
            height={40} 
            className="h-7 w-auto object-contain"
          />
        </div>

        {/* Main Columns Content */}
        <div className="pt-24 pb-12 px-8 sm:px-12 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Column 1: Info & Socials (5 Cols) */}
          <div className="md:col-span-5 space-y-6 text-left">
            <p className="text-sm text-gray-400 font-medium leading-relaxed tracking-wider max-w-sm mt-4">
              Grand Tour helps students gain international internship opportunities in France.
            </p>

            <div className="space-y-3">
              <h4 className="font-bold tracking-wide text-lg text-white">
                Follow Us On!
              </h4>
              <p className="text-xs text-gray-400 font-medium max-w-xs leading-relaxed">
                Follow us to explore real student journeys & updates from Grand Tour.
              </p>
              
              {/* Social Icons Row */}
              <div className="flex items-center gap-3 pt-2">
                <a 
                  href="#" 
                  className="w-10 aspect-square rounded bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
                  aria-label="Instagram"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="w-10 aspect-square rounded bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
                  aria-label="LinkedIn"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="w-10 aspect-square rounded bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
                  aria-label="Facebook"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Links (2 Cols) */}
          <div className="md:col-span-2 text-left space-y-5">
            <h4 className="font-bold text-lg text-white tracking-wider">
              Links
            </h4>
            <ul className="space-y-3 text-gray-400 font-medium tracking-wide">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Partnership
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Start Journey
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal (2 Cols) */}
          <div className="md:col-span-2 text-left space-y-5">
            <h4 className="font-bold text-lg text-white tracking-wider">
              Legal
            </h4>
            <ul className="space-y-3 text-gray-400 font-medium tracking-wide">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info (3 Cols) */}
          <div className="md:col-span-3 text-left space-y-4">
            <h4 className="font-bold text-lg text-white tracking-wider">
              Contact
            </h4>
            <div className="space-y-4 text-sm text-gray-400 font-semibold leading-relaxed">
              <p>
                <strong className="text-white block tracking-wider mb-0.5">India:</strong>
                LBS Rd Navi Peth, Pune, Maharashtra 411030
              </p>
              <p>
                <strong className="text-white block tracking-wider mb-0.5">France:</strong>
                5 Rue du Nord, Dijon 21000
              </p>
              <div>
                <p className="hover:text-white transition-colors">
                  +91 73502 35552
                </p>
                <p className="hover:text-white transition-colors">
                  +33 7 46 54 62 20
                </p>
                <a href="mailto:contact@grandtour.in" className="hover:text-white transition-colors block text-white font-bold tracking-wide underline">
                  contact@grandtour.in
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom Bar Divider */}
        <div className="border-t border-white/10 mx-8 sm:mx-12" />

        {/* Footer Bottom copyright and attribution */}
        <div className="py-8 px-8 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 font-semibold">
          <p>© 2026 Grand Tour. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <span className="text-[#E1000F] animate-pulse">❤️</span> by WebDrave
          </p>
        </div>

      </div>
    </footer>
  )
}
