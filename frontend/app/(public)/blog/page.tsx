'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Kalam } from 'next/font/google'
import dynamic from 'next/dynamic'
import { blogService } from '@/lib/services/api.service'
import { BookOpen, Loader2, ArrowRight } from 'lucide-react'

const kalam = Kalam({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-kalam',
})

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

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('ALL')

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const data = await blogService.getAll()
      // Filter out unpublished posts for public display
      const publishedPosts = (data || []).filter((b: BlogPost) => b.published)
      setBlogs(publishedPosts)
    } catch (error) {
      console.error('Failed to fetch blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Categories list
  const categories = ['ALL', 'GUIDES', 'STORIES', 'INSIGHTS']

  // Featured Post is the latest post in 'GUIDES' or simply the very latest post
  const featuredPost = blogs.find(b => b.category === 'GUIDES') || blogs[0]
  
  // Non-featured posts
  const secondaryPosts = blogs.filter(b => b.id !== featuredPost?.id)

  // Filter posts based on Category
  const filteredPosts = activeFilter === 'ALL' 
    ? secondaryPosts 
    : secondaryPosts.filter(b => b.category === activeFilter)

  return (
    <div className={`relative w-full min-h-screen bg-white dark:bg-zinc-950 overflow-x-hidden font-Gilroy ${kalam.variable}`}>
      
      {/* ─── BLOG HERO SECTION ─── */}
      <section className="relative w-full bg-white dark:bg-zinc-950 py-20 px-4 sm:px-12 lg:px-20">
        <div className="w-full max-w-none mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 lg:gap-8">
          
          {/* Left Column: Heading and Subtitle */}
          <div className="flex-1 space-y-6 text-left">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center bg-[#FFF8E6] dark:bg-amber-950/20 text-[#F3A007] text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full select-none">
              Blogs & Stories
            </div>
            
            <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-black text-slate-900 dark:text-white leading-[1.15] tracking-tight max-w-2xl">
              Stories, Guides & Insights<br className="hidden md:inline" />
              {' '}for Your <span className="text-[#00B853]">Journey</span>{' '}
              <span className="relative inline-block whitespace-nowrap">
                Abroad
                <svg className="absolute left-0 bottom-[-2px] w-full h-[8px] text-[#dea306]" viewBox="0 0 100 10" preserveAspectRatio="none" fill="none">
                  <path d="M2 3 C 20 8, 80 8, 98 3" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm md:text-base max-w-xl leading-relaxed">
              Explore practical guides, student experiences, career advice, and everything you need to know about internships and life in France.
            </p>
          </div>

          {/* Right Column: Layered Polaroid Card */}
          <div className="relative w-full lg:w-auto flex justify-center lg:block select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 12 }}
              animate={{ opacity: 1, scale: 1, rotate: 6 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              whileHover={{ rotate: 2, scale: 1.02 }}
              className="relative z-25 bg-white p-3 pb-8 rounded-sm shadow-[0_15px_40px_rgba(0,0,0,0.12)] w-[160px] sm:w-[200px] border border-slate-100 shrink-0"
            >
              <div className="relative w-full aspect-[3/4] overflow-hidden rounded-sm bg-slate-100">
                <Image
                  src="/blog_hero_polaroid.png"
                  alt="Students in kitchen"
                  fill
                  className="object-cover"
                  sizes="(max-w-640px) 220px, 260px"
                />
              </div>
              {/* Cursive Bottom Label */}
              <div className={`${kalam.className} text-xl sm:text-2xl font-bold text-slate-800 text-center tracking-wide block mt-4`}>
                My new family
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ─── MAIN BLOG CONTENT ─── */}
      <section className="pb-20 px-4 sm:px-12 lg:px-20 w-full z-20 relative bg-white dark:bg-zinc-950">
        <div className="w-full max-w-none mx-auto space-y-16">
          
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-8 h-8 animate-spin text-[#0b9940]" />
            </div>
          ) : (
            <>
              {/* FEATURED POST (Top banner card) */}
              {featuredPost && (
                <div className="w-full bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center gap-6 lg:gap-12">
                  
                  {/* Left Column (Image) */}
                  <div className="lg:col-span-6 relative aspect-[4/3] sm:aspect-video lg:aspect-auto lg:h-[450px] w-full bg-slate-50 dark:bg-zinc-800 overflow-hidden">
                    <img
                      src={featuredPost.coverImage || '/blog_featured.png'}
                      alt={featuredPost.title}
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-6 left-6">
                      <span className="bg-[#dea306] text-white text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-md">
                        Featured • {featuredPost.category}
                      </span>
                    </div>
                  </div>

                  {/* Right Column (Info details) */}
                  <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 lg:pl-0 flex flex-col justify-center space-y-4">
                    <span className="text-xs text-slate-400 font-semibold tracking-wide uppercase">
                      {new Date(featuredPost.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      <span className="mx-2">•</span>
                      {featuredPost.readTime} min read
                    </span>
                    
                    <h2 className="text-2xl sm:text-[32px] font-black text-slate-900 dark:text-white leading-tight tracking-tight hover:text-[#0b9940] transition-colors">
                      <Link href={`/blog/${featuredPost.slug}`}>
                        {featuredPost.title}
                      </Link>
                    </h2>
                    
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      {featuredPost.summary}
                    </p>
                    
                    <div className="pt-2">
                      <Link
                        href={`/blog/${featuredPost.slug}`}
                        className="inline-flex items-center gap-2 text-[#0b9940] hover:text-[#0b9940]/90 font-black text-sm uppercase tracking-wider group"
                      >
                        Read Article 
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>

                </div>
              )}

              {/* CATEGORY FILTER BAR */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 border-b border-slate-100 dark:border-zinc-800/80 pb-6 pt-8">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className={`text-xs sm:text-sm font-bold uppercase tracking-wider px-5 py-2.5 rounded-full border transition-all cursor-pointer select-none ${
                      activeFilter === cat
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md'
                        : 'bg-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border-slate-200 dark:border-zinc-800'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Articles' : cat}
                  </button>
                ))}
              </div>

              {/* BLOG GRID */}
              {filteredPosts.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="w-12 h-12 text-slate-300 dark:text-zinc-800 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Articles Found</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Check back later for new stories and guides in this category.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">

                  {filteredPosts.map(blog => (
                    <article
                      key={blog.id}
                      className="group flex flex-col justify-between overflow-hidden bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-900 rounded-[2rem] shadow-md hover:shadow-xl transition-all duration-300"
                    >
                      <div>
                        {/* Cover Image banner */}
                        <div className="relative aspect-video w-full bg-slate-50 dark:bg-zinc-900 overflow-hidden">
                          <img
                            src={blog.coverImage || '/blog_featured.png'}
                            alt={blog.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-4 left-4">
                            <span className="bg-[#E6F4EA] dark:bg-emerald-950/40 text-[#0F8A4E] text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                              {blog.category}
                            </span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-6 space-y-3">
                          <span className="text-[11px] text-slate-400 font-semibold tracking-wide uppercase">
                            {new Date(blog.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                            <span className="mx-2">•</span>
                            {blog.readTime} min read
                          </span>
                          
                          <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug group-hover:text-[#0b9940] transition-colors line-clamp-2">
                            <Link href={`/blog/${blog.slug}`}>
                              {blog.title}
                            </Link>
                          </h3>
                          
                          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-3">
                            {blog.summary}
                          </p>
                        </div>
                      </div>

                      {/* Read Link */}
                      <div className="p-6 pt-0 mt-2">
                        <Link
                          href={`/blog/${blog.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs text-[#0b9940] hover:text-[#0b9940]/90 font-black uppercase tracking-wider group/link"
                        >
                          Read Article 
                          <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>

                    </article>
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
