"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isLoggedIn = status === "authenticated";
  const user = session?.user as any;

  const dashboardLink =
    user?.role === "SUPER_ADMIN" || user?.role === "ADMIN"
      ? "/admin"
      : "/dashboard";

  // Check which link is active
  const isActive = (path: string) => pathname === path;

  return (
    <header className="absolute top-0 left-0 right-0 z-100 w-full shrink-0">
      <div className="px-4 sm:px-8 py-2 flex items-center justify-between">
        <Link href="/" id="nav-logo" className="flex items-center">
          <Image src="/logo.png" alt="logo" width={200} height={200} className="h-10 w-auto" />
        </Link>

        {/* Desktop navigation links */}
        <nav className="hidden md:flex items-center gap-10">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors select-none ${
              isActive("/")
                ? "text-white border-b-2 border-white pb-0.5"
                : "text-white/80 hover:text-white"
            }`}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`text-sm font-medium transition-colors select-none ${
              isActive("/about")
                ? "text-white border-b-2 border-white pb-0.5"
                : "text-white/80 hover:text-white"
            }`}
          >
            About
          </Link>
          <Link
            href="/contact"
            className={`text-sm font-medium transition-colors select-none ${
              isActive("/contact")
                ? "text-white border-b-2 border-white pb-0.5"
                : "text-white/80 hover:text-white"
            }`}
          >
            Contact Us
          </Link>
          <Link
            href="/internship-in-france"
            className={`text-sm font-medium transition-colors select-none ${
              isActive("/internship-in-france")
                ? "text-white border-b-2 border-white pb-0.5"
                : "text-white/80 hover:text-white"
            }`}
          >
            Internship in France
          </Link>
          <Link
            href="/partner"
            className={`text-sm font-medium transition-colors select-none ${
              isActive("/partner")
                ? "text-white border-b-2 border-white pb-0.5"
                : "text-white/80 hover:text-white"
            }`}
          >
            Become a Partner
          </Link>
          <Link
            href="/blog"
            className={`text-sm font-medium transition-colors select-none ${
              isActive("/blog")
                ? "text-white border-b-2 border-white pb-0.5"
                : "text-white/80 hover:text-white"
            }`}
          >
            Blog
          </Link>
        </nav>

        {/* Become a Partner CTA */}
        <div className="hidden md:flex">
          <Link
            href={isLoggedIn ? dashboardLink : "/login"}
            id="btn-desktop-partner"
            className="bg-[#0055A5] hover:bg-[#0055A5]/90 active:scale-95 text-white text-xs font-medium px-6 py-3 rounded-full uppercase tracking-wider transition-all shadow-lg select-none"
          >
            {isLoggedIn ? "Go to Dashboard" : "Sign In / Register"}
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
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`font-semibold ${isActive("/") ? "text-white" : "text-white/80"}`}
              >
                Home
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`font-semibold ${isActive("/about") ? "text-white" : "text-white/80"}`}
              >
                About
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className={`font-semibold ${isActive("/contact") ? "text-white" : "text-white/80"}`}
              >
                Contact Us
              </Link>
              <Link
                href="/internship-in-france"
                onClick={() => setMobileMenuOpen(false)}
                className={`font-semibold ${isActive("/internship-in-france") ? "text-white" : "text-white/80"}`}
              >
                Internship in France
              </Link>
              <Link
                href="/partner"
                onClick={() => setMobileMenuOpen(false)}
                className={`font-semibold ${isActive("/partner") ? "text-white" : "text-white/80"}`}
              >
                Become a Partner
              </Link>
              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className={`font-semibold ${isActive("/blog") ? "text-white" : "text-white/80"}`}
              >
                Blog
              </Link>
              <Link
                href={isLoggedIn ? dashboardLink : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="bg-[#0055A5] text-white font-bold text-center py-3 rounded-full text-sm uppercase tracking-wider"
              >
                {isLoggedIn ? "Go to Dashboard" : "Sign In / Register"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
