'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/layout-wrapper'
import { Header } from '@/components/dashboard/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { studentCategoryService } from '@/lib/services/api.service'
import { toast } from 'sonner'
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Tag,
  DollarSign,
  CheckCircle2,
  X,
  AlertTriangle,
} from 'lucide-react'

interface Installment {
  name: string
  amount: number
}

interface StudentCategory {
  id: string
  name: string
  description?: string
  color: string
  pricing?: Installment[] | null
  isActive: boolean
  createdAt: string
}

const PRESET_COLORS = [
  '#DC2626', '#E1000F', '#16A34A', '#2563EB', '#F9B302',
  '#8B5CF6', '#0891B2', '#D97706', '#059669', '#DB2777',
  '#4F46E5', '#0F172A', '#7C3AED', '#BE185D', '#0369A1',
]

const DEFAULT_INSTALLMENTS: Installment[] = [
  { name: 'First Installment', amount: 0 },
  { name: 'Second Installment', amount: 0 },
  { name: 'Third Installment', amount: 0 },
]

export default function StudentCategoriesPage() {
  const [categories, setCategories] = useState<StudentCategory[]>([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<StudentCategory | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    color: '#6366F1',
    hasPricing: false,
    installments: [...DEFAULT_INSTALLMENTS],
  })

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<StudentCategory | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await studentCategoryService.getAll()
      setCategories(data || [])
    } catch (err: any) {
      toast.error(err.message || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingCategory(null)
    setForm({
      name: '',
      description: '',
      color: '#6366F1',
      hasPricing: false,
      installments: [...DEFAULT_INSTALLMENTS],
    })
    setShowModal(true)
  }

  const openEditModal = (cat: StudentCategory) => {
    setEditingCategory(cat)
    const installments: Installment[] = (cat.pricing && cat.pricing.length > 0)
      ? cat.pricing
      : [...DEFAULT_INSTALLMENTS]
    setForm({
      name: cat.name,
      description: cat.description || '',
      color: cat.color || '#6366F1',
      hasPricing: !!(cat.pricing && cat.pricing.length > 0),
      installments,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Category name is required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim().toUpperCase().replace(/\s+/g, '_'),
        description: form.description.trim() || undefined,
        color: form.color,
        pricing: form.hasPricing
          ? form.installments.map(i => ({ name: i.name, amount: Number(i.amount) || 0 }))
          : null,
      }

      if (editingCategory) {
        const updated = await studentCategoryService.update(editingCategory.id, payload)
        setCategories(prev => prev.map(c => c.id === editingCategory.id ? updated : c))
        toast.success('Category updated successfully!')
      } else {
        const created = await studentCategoryService.create(payload)
        setCategories(prev => [...prev, created])
        toast.success('Category created successfully!')
      }
      setShowModal(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await studentCategoryService.remove(deleteTarget.id)
      setCategories(prev => prev.filter(c => c.id !== deleteTarget.id))
      toast.success(`Category "${deleteTarget.name}" deleted`)
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete category')
    } finally {
      setDeleting(false)
    }
  }

  const updateInstallment = (idx: number, field: 'name' | 'amount', value: string) => {
    setForm(prev => {
      const updated = [...prev.installments]
      updated[idx] = { ...updated[idx], [field]: field === 'amount' ? Number(value) : value }
      return { ...prev, installments: updated }
    })
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Header
          title="Student Categories"
          description="Create and manage custom student categories with colour-coded tags and default payment installment plans."
        />

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'} configured
          </p>
          <Button
            onClick={openCreateModal}
            className="flex items-center gap-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 py-2.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Category
          </Button>
        </div>

        {/* Category Grid */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : categories.length === 0 ? (
          <Card className="p-12 text-center border border-dashed border-slate-200 bg-slate-50 rounded-3xl">
            <Tag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-600 mb-1">No Categories Yet</h3>
            <p className="text-sm text-slate-400 mb-5">
              Create your first student category to start organizing applicants by type.
            </p>
            <Button onClick={openCreateModal} className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 py-2.5">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Create Category
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map(cat => (
              <Card key={cat.id} className="relative p-5 overflow-hidden border border-slate-100 bg-white rounded-3xl shadow-sm hover:shadow-md transition-all group">
                {/* Color accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{ background: cat.color }} />

                {/* Header */}
                <div className="flex items-start justify-between mt-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: cat.color + '22' }}
                    >
                      <Tag className="w-3.5 h-3.5" style={{ color: cat.color }} />
                    </span>
                    <div>
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white"
                        style={{ background: cat.color }}
                      >
                        {cat.name}
                      </span>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(cat)}
                      aria-label={`Edit category ${cat.name}`}
                      title={`Edit category ${cat.name}`}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors focus:ring-2 focus:ring-slate-500 outline-none"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(cat)}
                      aria-label={`Delete category ${cat.name}`}
                      title={`Delete category ${cat.name}`}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors focus:ring-2 focus:ring-red-500 outline-none"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {cat.description && (
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3">{cat.description}</p>
                )}

                {/* Pricing */}
                {cat.pricing && Array.isArray(cat.pricing) && cat.pricing.length > 0 ? (
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <DollarSign className="w-2.5 h-2.5" />
                      Default Installments
                    </span>
                    {cat.pricing.map((p: Installment, i: number) => (
                      <div key={i} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium truncate">{p.name}</span>
                        <span className="font-bold text-slate-800 ml-2">₹{p.amount.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">No default pricing set</p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Name */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. University, B2B, Individual"
                  className="h-9 text-sm rounded-xl"
                />
                <p className="text-[10px] text-slate-400 mt-1">Will be stored in UPPERCASE_WITH_UNDERSCORES.</p>
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Optional: short description of this category"
                  rows={2}
                  className="w-full text-sm border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-200 resize-none"
                />
              </div>

              {/* Color */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
                  Tag Color
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setForm(p => ({ ...p, color: c }))}
                      className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 shrink-0"
                      style={{
                        background: c,
                        borderColor: form.color === c ? '#0F172A' : 'transparent',
                      }}
                    />
                  ))}
                  {/* Custom hex input */}
                  <input
                    type="color"
                    value={form.color}
                    onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                    className="w-7 h-7 rounded-full cursor-pointer border border-slate-200"
                    title="Custom color"
                  />
                </div>
                {/* Preview pill */}
                <div className="mt-2">
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white"
                    style={{ background: form.color }}
                  >
                    {form.name || 'PREVIEW'}
                  </span>
                </div>
              </div>

              {/* Pricing Toggle */}
              <div>
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <div
                    onClick={() => setForm(p => ({ ...p, hasPricing: !p.hasPricing }))}
                    className={`w-10 h-5 rounded-full transition-colors relative ${form.hasPricing ? 'bg-slate-900' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.hasPricing ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Set Default Installment Pricing
                  </span>
                </label>
              </div>

              {/* Installment Pricing */}
              {form.hasPricing && (
                <div className="space-y-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Installment Plan
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setForm(p => ({
                        ...p,
                        installments: [...p.installments, { name: `Installment ${p.installments.length + 1}`, amount: 0 }]
                      }))}
                      className="h-7 text-[10px] font-bold uppercase tracking-wider rounded-lg px-2 border-slate-200 bg-white"
                    >
                      + Add Row
                    </Button>
                  </div>

                  {form.installments.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic text-center py-2">No installments added yet. Click "+ Add Row" above.</p>
                  ) : (
                    <div className="space-y-3">
                      {form.installments.map((inst, idx) => (
                        <div key={idx} className="flex gap-2 items-end">
                          <div className="flex-1 space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Label</label>
                            <Input
                              value={inst.name}
                              onChange={e => updateInstallment(idx, 'name', e.target.value)}
                              placeholder="e.g. First Installment"
                              className="h-8 text-xs rounded-xl"
                            />
                          </div>
                          <div className="w-32 space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Amount (₹)</label>
                            <Input
                              type="number"
                              value={inst.amount || ''}
                              onChange={e => updateInstallment(idx, 'amount', e.target.value)}
                              placeholder="0"
                              className="h-8 text-xs rounded-xl font-mono font-bold"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setForm(p => ({
                              ...p,
                              installments: p.installments.filter((_, i) => i !== idx)
                            }))}
                            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                className="text-xs rounded-xl px-5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 flex items-center gap-1.5"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {editingCategory ? 'Save Changes' : 'Create Category'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 mb-1">Delete Category?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete the{' '}
                <span className="font-bold" style={{ color: deleteTarget.color }}>{deleteTarget.name}</span>{' '}
                category? Students already assigned this category will retain their value, but it won't appear in the dropdown anymore.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center gap-1.5"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
