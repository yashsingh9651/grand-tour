'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/layout-wrapper'
import { Header } from '@/components/dashboard/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { blogService, uploadService } from '@/lib/services/api.service'
import { toast } from 'sonner'
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  FileText,
  Eye,
  EyeOff,
  Image as ImageIcon,
  BookOpen,
} from 'lucide-react'

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

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form State
  const [form, setForm] = useState({
    title: '',
    summary: '',
    content: '',
    coverImage: '',
    category: 'GUIDES',
    readTime: 5,
    published: true,
  })

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const data = await blogService.getAll()
      setBlogs(data || [])
    } catch (err: any) {
      toast.error(err.message || 'Failed to load blog posts')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingBlog(null)
    setForm({
      title: '',
      summary: '',
      content: '',
      coverImage: '',
      category: 'GUIDES',
      readTime: 5,
      published: true,
    })
    setShowModal(true)
  }

  const openEditModal = (blog: BlogPost) => {
    setEditingBlog(blog)
    setForm({
      title: blog.title,
      summary: blog.summary,
      content: blog.content,
      coverImage: blog.coverImage || '',
      category: blog.category,
      readTime: blog.readTime,
      published: blog.published,
    })
    setShowModal(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const result = await uploadService.upload(file)
      setForm(prev => ({ ...prev, coverImage: result.url }))
      toast.success('Cover image uploaded successfully')
    } catch (error) {
      toast.error('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.summary || !form.content) {
      toast.error('Title, summary, and content are required')
      return
    }

    setSaving(true)
    try {
      if (editingBlog) {
        // Update
        const updated = await blogService.update(editingBlog.id, form)
        setBlogs(prev => prev.map(b => (b.id === editingBlog.id ? updated : b)))
        toast.success('Blog post updated successfully')
      } else {
        // Create
        const created = await blogService.create(form)
        setBlogs(prev => [created, ...prev])
        toast.success('Blog post created successfully')
      }
      setShowModal(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to save blog post')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setDeleting(true)
    try {
      await blogService.delete(deleteTarget.id)
      setBlogs(prev => prev.filter(b => b.id !== deleteTarget.id))
      toast.success('Blog post deleted successfully')
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete blog post')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <Header title="Blogs & Stories Manager" description="Create and edit blog posts" />
        
        <main className="flex-1 p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Blog Posts</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Publish articles, guides, and student stories on your website.
              </p>
            </div>
            <Button onClick={openCreateModal} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-xl">
              <Plus className="w-4 h-4" />
              Add Blog Post
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : blogs.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed rounded-3xl">
              <BookOpen className="w-12 h-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Blog Posts Yet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Create your first blog post to share insights and student experiences.
              </p>
              <Button onClick={openCreateModal} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                Create First Post
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map(blog => (
                <Card key={blog.id} className="overflow-hidden pt-0 flex flex-col justify-between rounded-3xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div>
                    {/* Cover image banner */}
                    <div className="relative aspect-video w-full bg-slate-100 dark:bg-zinc-850 flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-zinc-800">
                      {blog.coverImage ? (
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-slate-400" />
                      )}
                      
                      <div className="absolute top-4 left-4">
                        <span className="bg-emerald-550/90 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm bg-emerald-600">
                          {blog.category}
                        </span>
                      </div>

                      <div className="absolute top-4 right-4">
                        <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm ${
                          blog.published ? 'bg-white/95 text-slate-800' : 'bg-slate-850/90 text-white bg-zinc-800'
                        }`}>
                          {blog.published ? (
                            <>
                              <Eye className="w-3 h-3" />
                              Published
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              Draft
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="text-xs text-slate-400 font-semibold">
                        {new Date(blog.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        <span className="mx-2">•</span>
                        {blog.readTime} min read
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {blog.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {blog.summary}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 flex gap-2">
                    <Button
                      onClick={() => openEditModal(blog)}
                      variant="outline"
                      className="flex-1 rounded-xl text-xs gap-1.5 border-slate-200 dark:border-zinc-800 dark:text-slate-200"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit Details
                    </Button>
                    <Button
                      onClick={() => setDeleteTarget(blog)}
                      variant="destructive"
                      className="rounded-xl px-3 hover:bg-rose-600 text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Write/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="w-full max-w-3xl bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-3xl shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-zinc-800">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <EyeOff className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Provide the details, category, and cover image for your article.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Title */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Article Title
                  </label>
                  <Input
                    required
                    placeholder="e.g. The Complete Roadmap to Your First Internship in France"
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    className="rounded-2xl border-slate-200 dark:border-zinc-800"
                  />
                </div>

                {/* Summary */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Brief Summary
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="A short teaser summary displayed on the blog listing page."
                    value={form.summary}
                    onChange={e => setForm(p => ({ ...p, summary: e.target.value }))}
                    className="w-full text-sm px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 resize-none"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Category Tag
                  </label>
                  <select
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full text-sm px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  >
                    <option value="GUIDES">Guides</option>
                    <option value="STORIES">Stories</option>
                    <option value="INSIGHTS">Insights</option>
                  </select>
                </div>

                {/* Read Time */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Estimated Read Time (Minutes)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    required
                    value={form.readTime}
                    onChange={e => setForm(p => ({ ...p, readTime: parseInt(e.target.value) || 5 }))}
                    className="rounded-2xl border-slate-200 dark:border-zinc-800"
                  />
                </div>

                {/* Cover Image Upload */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Cover Image
                  </label>
                  <div className="flex gap-4 items-center">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="rounded-2xl border-slate-200 dark:border-zinc-800 hidden"
                      id="blog-cover-upload"
                    />
                    <label
                      htmlFor="blog-cover-upload"
                      className="cursor-pointer bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 select-none"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-4 h-4 text-slate-500" />
                          Upload Image
                        </>
                      )}
                    </label>

                    {form.coverImage && (
                      <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold truncate max-w-md">
                        <img
                          src={form.coverImage}
                          alt="Cover preview"
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-zinc-800"
                        />
                        <span className="truncate">{form.coverImage}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Content
                  </label>
                  <textarea
                    required
                    rows={8}
                    placeholder="Enter article body content here..."
                    value={form.content}
                    onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                    className="w-full text-sm px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 resize-y"
                  />
                </div>

                {/* Published status checkbox */}
                <div className="flex items-center gap-3 sm:col-span-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={form.published}
                    onChange={e => setForm(p => ({ ...p, published: e.target.checked }))}
                    className="w-4 h-4 accent-emerald-600 cursor-pointer rounded border-slate-200 dark:border-zinc-800"
                  />
                  <label htmlFor="published" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                    Publish immediately (make visible to public readers)
                  </label>
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="rounded-2xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving || uploading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingBlog ? 'Update Post' : 'Publish Post'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-3xl shadow-2xl relative space-y-4 border border-slate-100 dark:border-zinc-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Blog Post?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Are you sure you want to delete <span className="font-bold text-slate-800 dark:text-white">"{deleteTarget.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleting}
                onClick={handleDelete}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete Permanently
              </Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
