'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { blogService } from '@/lib/services/api.service'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
  ArrowRight,
  HelpCircle,
  AlertTriangle,
  Image as ImageIcon,
  MessageCircle,
} from 'lucide-react'

const Footer = dynamic(() => import('@/components/Footer'), {
  ssr: false,
  loading: () => (
    <div className="h-28 bg-slate-50 dark:bg-zinc-950 animate-pulse flex items-center justify-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
      Loading footer...
    </div>
  ),
})

interface BlogPost {
  id: string
  title: string
  slug: string
  summary: string
  content: string
  coverImage?: string
  category: string
  readTime: number
  published: boolean
  createdAt: string
}

export default function BlogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const [blog, setBlog] = useState<BlogPost | null>(null)
  const [moreBlogs, setMoreBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  // Sidebar table of contents state
  const [activeSection, setActiveSection] = useState('why-france')

  useEffect(() => {
    if (slug) {
      fetchBlogDetails()
    }
  }, [slug])

  // Track active section on scroll for the roadmap article
  useEffect(() => {
    if (slug !== 'complete-roadmap-first-internship-france') return

    const handleScroll = () => {
      const sections = [
        'why-france',
        'who-can-apply',
        'how-it-works',
        'documents',
        'preparing',
        'life-in-france',
        'tips',
      ]

      const scrollPosition = window.scrollY + 200

      for (const section of sections) {
        const el = document.getElementById(section)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [slug, loading])

  const fetchBlogDetails = async () => {
    try {
      setLoading(true)
      const data = await blogService.getBySlug(slug)
      setBlog(data)

      // Fetch other posts for recommendations
      const allBlogs = await blogService.getAll()
      const filtered = (allBlogs || [])
        .filter((b: BlogPost) => b.published && b.slug !== slug)
        .slice(0, 3)
      setMoreBlogs(filtered)
    } catch (error) {
      console.error('Failed to load article:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 100,
        behavior: 'smooth',
      })
      setActiveSection(id)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0b9940]" />
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-6 space-y-6">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Article Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm text-center max-w-md">
          The article you are looking for does not exist or has been unpublished by the administrator.
        </p>
        <Link href="/blog">
          <button className="bg-[#0b9940] hover:bg-[#0b9940]/90 text-white font-semibold text-xs px-6 py-3 rounded-full uppercase tracking-wider transition-all flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </button>
        </Link>
      </div>
    )
  }

  const isFlagshipRoadmap = blog.slug === 'complete-roadmap-first-internship-france'

  return (
    <div className="relative w-full min-h-screen bg-white dark:bg-zinc-950 overflow-x-hidden font-Gilroy">
      
      {/* ─── CASE A: FLAGSHIP SEEDED ARTICLE (Pixel-Perfect High-Fidelity Custom Template) ─── */}
      {isFlagshipRoadmap ? (
        <div className="w-full">
          {/* Header Fold */}
          <header className="pt-32 pb-16 px-4 sm:px-12 lg:px-20 max-w-7xl mx-auto w-full">
            
            {/* Back Button */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-800 dark:hover:text-white text-xs font-bold uppercase tracking-wider transition-colors mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Blog
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Heading, Subtitle & Meta */}
              <div className="lg:col-span-7 space-y-6">
                <h1 className="text-3xl sm:text-[44px] lg:text-[50px] font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                  How to Get a Hospitality Internship in{' '}
                  <span className="text-[#2563EB]">France</span>: A{' '}
                  <span className="text-[#16A34A]">Complete</span> Guide
                </h1>
                
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
                  Everything you need to know about finding, applying for, and starting your hospitality internship journey in France.
                </p>

                {/* Author Card & Date Info */}
                <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-zinc-900 max-w-md">
                  {/* Mock profile image */}
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-slate-600 shrink-0 border border-slate-100 overflow-hidden">
                    <span className="text-xs">CD</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">Claire Dubois</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Internship Advisor, Grand Tour</p>
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold ml-auto border-l border-slate-200 pl-4 space-y-0.5">
                    <div>July 10, 2026</div>
                    <div className="flex items-center gap-1 text-[#E1000F]">
                      <Clock className="w-3 h-3" />
                      8 min read
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Main Image Banner */}
              <div className="lg:col-span-5 relative w-full aspect-video rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-zinc-900 bg-slate-50 shrink-0">
                <img
                  src="/blog_featured.png"
                  alt="Professor teaching hospitality students in classroom"
                  className="object-cover w-full h-full"
                />
              </div>

            </div>
          </header>

          {/* Two Column Layout Block */}
          <main className="max-w-7xl mx-auto px-4 sm:px-12 lg:px-20 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Sidebar Table of Contents */}
            <aside className="lg:col-span-3 sticky top-28 self-start space-y-8 hidden lg:block select-none">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  On this page
                </h4>
                <nav className="flex flex-col space-y-3">
                  {[
                    { id: 'why-france', label: 'Why Choose France?' },
                    { id: 'who-can-apply', label: 'Who Can Apply?' },
                    { id: 'how-it-works', label: 'How the Application Works' },
                    { id: 'documents', label: "Documents You'll Need" },
                    { id: 'preparing', label: 'Preparing for Your Journey' },
                    { id: 'life-in-france', label: 'Life as an Intern in France' },
                    { id: 'tips', label: 'Making the Most of It' },
                  ].map(sec => (
                    <button
                      key={sec.id}
                      onClick={() => scrollToSection(sec.id)}
                      className={`text-left text-xs font-bold transition-all border-l-2 pl-4 py-0.5 cursor-pointer ${
                        activeSection === sec.id
                          ? 'border-[#0b9940] text-[#0b9940] dark:text-emerald-400'
                          : 'border-slate-100 dark:border-zinc-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {sec.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Questions Help Card */}
              <div className="bg-[#F2FAF5] dark:bg-emerald-950/20 p-6 rounded-[1.5rem] border border-emerald-100/50 dark:border-emerald-900/30 space-y-3">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">Have questions?</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Our advisors answer within 24 hours.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1 text-xs text-[#0b9940] font-black uppercase tracking-wider group"
                >
                  Talk to us
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </aside>

            {/* Right Main Article Column */}
            <div className="lg:col-span-9 space-y-16 text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-loose font-medium max-w-3xl">
              
              {/* Intro */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-350 leading-relaxed">
                Every year, thousands of students dream of working in France — the birthplace of modern hospitality. Fewer know how to actually get there. This guide walks you through the entire process, from your first search to your first shift, based on what has worked for hundreds of Grand Tour students.
              </p>

              {/* Section 1 */}
              <section id="why-france" className="space-y-6 scroll-mt-24">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Why Choose France for a Hospitality Internship?
                </h2>
                <p className="text-slate-650 leading-relaxed">
                  France sets the global standard for service. Its palace hotels, Michelin-starred kitchens, and family-run auberges share one thing: an obsession with craft. Interning here means learning hospitality at the source — and carrying that credential for the rest of your career.
                </p>

                {/* Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="bg-[#F2FAF5] dark:bg-emerald-950/15 p-5 rounded-2xl border border-emerald-50/50 dark:border-emerald-900/10 space-y-2">
                    <span className="text-2xl sm:text-3xl font-black text-[#16A34A] leading-none block">#1</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-snug">
                      Tourist destination in the world
                    </p>
                  </div>
                  <div className="bg-[#FFF9EA] dark:bg-amber-950/15 p-5 rounded-2xl border border-amber-50/50 dark:border-amber-900/10 space-y-2">
                    <span className="text-2xl sm:text-3xl font-black text-[#D97706] leading-none block">600+</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-snug">
                      Michelin-starred restaurants
                    </p>
                  </div>
                  <div className="bg-[#EEF4FF] dark:bg-blue-950/15 p-5 rounded-2xl border border-blue-50/50 dark:border-blue-900/10 space-y-2">
                    <span className="text-2xl sm:text-3xl font-black text-[#2563EB] leading-none block">2M+</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-snug">
                      Jobs in French tourism & hospitality
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section id="who-can-apply" className="space-y-6 scroll-mt-24">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Who Can Apply?
                </h2>
                <p className="text-slate-650 leading-relaxed">
                  French internships (<em>stages</em>) are tied to education. You qualify if you are:
                </p>
                <ul className="list-disc list-inside space-y-3.5 pl-2 text-slate-650">
                  <li>Currently enrolled in a hospitality, tourism, or culinary program</li>
                  <li>Able to sign a <em>convention de stage</em> (internship agreement) through your school or a partner institution</li>
                  <li>Conversational in English — French is a plus, not a requirement</li>
                  <li>Ready to commit to 3–6 months abroad</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section id="how-it-works" className="space-y-6 scroll-mt-24">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  How the Application Process Works
                </h2>
                <p className="text-slate-650 leading-relaxed">
                  With Grand Tour, the process takes 6–10 weeks from first call to signed offer:
                </p>

                {/* Steps Cards List */}
                <div className="space-y-4 pt-2">
                  {[
                    {
                      num: 1,
                      color: 'bg-[#16A34A] text-white',
                      title: 'Discovery call',
                      desc: 'We map your goals, experience, and preferred regions of France.',
                    },
                    {
                      num: 2,
                      color: 'bg-[#D97706] text-white',
                      title: 'CV & interview prep',
                      desc: 'Your profile is reshaped to French hospitality standards, then rehearsed.',
                    },
                    {
                      num: 3,
                      color: 'bg-[#2563EB] text-white',
                      title: 'Employer matching',
                      desc: 'We introduce you to vetted hotels and restaurants in our partner network.',
                    },
                    {
                      num: 4,
                      color: 'bg-[#E1000F] text-white',
                      title: 'Offer, visa & departure',
                      desc: 'We handle the paperwork with you — agreement, visa, housing, arrival.',
                    },
                  ].map(step => (
                    <div
                      key={step.num}
                      className="bg-white dark:bg-zinc-900/50 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800/80 flex gap-4 items-center shadow-sm"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${step.color}`}>
                        {step.num}
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">{step.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 4 */}
              <section id="documents" className="space-y-6 scroll-mt-24">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Documents You'll Need
                </h2>
                <ul className="list-disc list-inside space-y-3.5 pl-2 text-slate-650">
                  <li>Valid passport (6+ months beyond your stay)</li>
                  <li>Proof of enrollment and the signed <em>convention de stage</em></li>
                  <li>CV in French format, plus a short motivation letter</li>
                  <li>Long-stay visa (for stays over 90 days, non-EU students)</li>
                  <li>Proof of housing and health insurance coverage</li>
                </ul>

                {/* Caution Alert Block */}
                <div className="bg-[#FFF8E6] dark:bg-amber-950/15 border-l-4 border-[#F3A007] p-5 rounded-r-2xl flex gap-4 items-start pt-6">
                  <div className="w-5 h-5 rounded-full bg-[#F3A007] flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5 select-none">
                    !
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-amber-250 leading-relaxed font-semibold">
                      <span className="font-black text-slate-900 dark:text-white">Start early.</span> Visa appointments in peak season (March–June) book out weeks ahead. Grand Tour students receive a document checklist and timeline on day one.
                    </p>
                  </div>
                </div>
              </section>

              {/* Terminal Quote Block */}
              <div className="relative overflow-hidden bg-[#2563EB] rounded-[2rem] p-8 sm:p-12 text-white shadow-xl">
                {/* Decorative translucent circles */}
                <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
                <div className="absolute bottom-[-30px] left-[30%] w-36 h-36 bg-white/10 rounded-full blur-lg pointer-events-none" />
                
                <div className="relative z-10 space-y-6">
                  {/* Mock dots */}
                  <div className="flex gap-1.5 select-none">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E1000F]/90" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#dea306]/90" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A]/90" />
                  </div>
                  
                  <blockquote className="text-lg sm:text-xl font-bold leading-relaxed tracking-wide italic">
                    "An internship abroad isn't just work experience. It's an opportunity to experience a new culture, build global connections, and discover where your career can take you."
                  </blockquote>
                </div>
              </div>

              {/* Section 5 */}
              <section id="preparing" className="space-y-6 scroll-mt-24">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Preparing for Your Journey
                </h2>
                <p className="text-slate-650 leading-relaxed">
                  Once your offer is signed, give yourself 6–8 weeks to prepare. Book housing before flights — student residences and <em>colocations</em> (shared apartments) near your workplace fill quickly. Learn 20 hospitality phrases in French; your first "bonjour, bienvenue" earns more goodwill than a perfect CV. And pack for the job: most employers provide uniforms, but comfortable black shoes are on you.
                </p>

                {/* Packing Image Placeholder Box */}
                <div className="border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center bg-slate-50/50 dark:bg-zinc-900/10 space-y-3 select-none">
                  <ImageIcon className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    Image — student packing / arriving in France
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section id="life-in-france" className="space-y-6 scroll-mt-24">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Life as an Intern in France
                </h2>
                <p className="text-slate-650 leading-relaxed">
                  Expect 35-hour weeks, a legally mandated gratification (stipend) for internships over two months, and real responsibility from week one. French kitchens and front desks run on hierarchy and precision — but also on long shared lunches and genuine mentorship. Weekends are yours: TGV trains put the Alps, the Riviera, and three neighboring countries within a few hours.
                </p>
              </section>

              {/* Section 7 */}
              <section id="tips" className="space-y-6 scroll-mt-24">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Tips for Making the Most of Your Internship
                </h2>
                <ul className="list-disc list-inside space-y-4 pl-2 text-slate-650">
                  <li>
                    <span className="font-black text-slate-900 dark:text-white">Say yes to every department.</span> A week in housekeeping teaches you more about a hotel than a month at reception.
                  </li>
                  <li>
                    <span className="font-black text-slate-900 dark:text-white">Keep a journal.</span> Interview stories come from specific moments, not job titles.
                  </li>
                  <li>
                    <span className="font-black text-slate-900 dark:text-white">Ask for a reference letter early</span> — French managers write generous ones when given time.
                  </li>
                </ul>
              </section>

            </div>

          </main>
        </div>
      ) : (
        /* ─── CASE B: STANDARD ARTICLE TEMPLATE (Fallback for user-added blogs) ─── */
        <div className="w-full">
          <article className="pt-32 pb-16 px-4 sm:px-12 lg:px-20 max-w-4xl mx-auto w-full space-y-6">
            
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-800 dark:hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Blog
            </Link>

            <div>
              <span className="bg-[#E6F4EA] dark:bg-emerald-950/40 text-[#0F8A4E] text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full select-none">
                {blog.category}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
              {blog.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              {blog.summary}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 font-semibold border-y border-slate-100 dark:border-zinc-900 py-4">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>
                  {new Date(blog.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{blog.readTime} min read</span>
              </div>

              <div className="flex items-center gap-1.5 ml-auto">
                <span>By Grand Tour Team</span>
              </div>
            </div>

          </article>

          {blog.coverImage && (
            <div className="w-full max-w-5xl mx-auto px-4 sm:px-12 lg:px-20 select-none">
              <div className="relative aspect-video sm:aspect-[21/9] w-full rounded-[2rem] overflow-hidden shadow-lg border border-slate-100 dark:border-zinc-900 bg-slate-50">
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          )}

          <section className="py-16 px-4 sm:px-12 lg:px-20 max-w-4xl mx-auto w-full">
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-loose font-medium space-y-6 whitespace-pre-wrap">
              {blog.content}
            </div>
          </section>
        </div>
      )}

      {/* ─── RECOMMENDED ARTICLES SECTION ─── */}
      {moreBlogs.length > 0 && (
        <section className="bg-slate-50/50 dark:bg-zinc-900/10 py-20 px-4 sm:px-12 lg:px-20 border-t border-slate-100 dark:border-zinc-900 w-full z-20 relative">
          <div className="w-full max-w-5xl mx-auto space-y-12">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Recommended Articles
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {moreBlogs.map(post => (
                <article
                  key={post.id}
                  className="group flex flex-col justify-between overflow-hidden bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-900 rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div>
                    <div className="relative aspect-video w-full bg-slate-50 dark:bg-zinc-900 overflow-hidden">
                      <img
                        src={post.coverImage || '/blog_featured.png'}
                        alt={post.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-6 space-y-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {post.category}
                      </span>
                      <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-[#0b9940] transition-colors line-clamp-2">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h4>
                    </div>
                  </div>

                  <div className="p-6 pt-0 mt-2">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs text-[#0b9940] font-black uppercase tracking-wider group/link"
                    >
                      Read Now
                      <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer />
    </div>
  )
}
