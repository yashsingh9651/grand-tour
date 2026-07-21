'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { blogService } from '@/lib/services/api.service'
import { ArrowLeft, Calendar, Clock, Loader2, ArrowRight } from 'lucide-react'

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

  useEffect(() => {
    if (slug) {
      fetchBlogDetails()
    }
  }, [slug])

  const fetchBlogDetails = async () => {
    try {
      setLoading(true)
      const data = await blogService.getBySlug(slug)
      setBlog(data)

      // Fetch other posts for "Read Next"
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

  return (
    <div className="relative w-full min-h-screen bg-white dark:bg-zinc-950 overflow-x-hidden font-Gilroy">
      
      {/* ─── HEADER / HERO ─── */}
      <article className="pt-32 pb-16 px-4 sm:px-12 lg:px-20 max-w-4xl mx-auto w-full space-y-6">
        
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-800 dark:hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Blog
        </Link>

        {/* Category Badge */}
        <div>
          <span className="bg-[#E6F4EA] dark:bg-emerald-950/40 text-[#0F8A4E] text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full select-none">
            {blog.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
          {blog.title}
        </h1>

        {/* Teaser Summary */}
        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          {blog.summary}
        </p>

        {/* Metadata */}
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

      {/* ─── COVER IMAGE ─── */}
      {blog.coverImage && (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-12 lg:px-20 select-none">
          <div className="relative aspect-[21/9] w-full rounded-[2rem] overflow-hidden shadow-lg border border-slate-100 dark:border-zinc-900 bg-slate-50">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      )}

      {/* ─── BODY CONTENT ─── */}
      <section className="py-16 px-4 sm:px-12 lg:px-20 max-w-4xl mx-auto w-full">
        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-loose font-medium space-y-6 whitespace-pre-wrap">
          {blog.content}
        </div>
      </section>

      {/* ─── READ NEXT ─── */}
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
                    {/* Cover image preview */}
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
