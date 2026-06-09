'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Loader2, Plus, Save, Trash2, RotateCcw, Eye, ChevronDown, Sliders } from 'lucide-react'
import { toast } from 'sonner'
import { applicationPageContentService } from '@/lib/services/api.service'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface DynamicPageContentEditorProps {
  pageKey: string
  builderTitle?: string
  builderDescription?: string
  previewComponent?: React.ComponentType<any>
  previewComponentProps?: Record<string, any>
}

export function DynamicPageContentEditor({
  pageKey,
  builderTitle = 'Dynamic Step Builder',
  builderDescription = 'Customize the copy, fields, and field types used on the student-facing page.',
  previewComponent,
  previewComponentProps = {},
}: DynamicPageContentEditorProps) {
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(Boolean(previewComponent))
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({})
  const [showAdvanced, setShowAdvanced] = useState<Record<string, boolean>>({})
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor')
  const [animating, setAnimating] = useState(false)

  const toggleAdvanced = (blockId: string) => {
    setShowAdvanced((current) => ({
      ...current,
      [blockId]: !current[blockId],
    }))
  }

  const handleToggleView = () => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      setViewMode((current) => (current === 'editor' ? 'preview' : 'editor'))
      setTimeout(() => {
        setAnimating(false)
      }, 150)
    }, 150)
  }

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)
        const pageContent = await applicationPageContentService.get(pageKey)
        setContent(pageContent)
      } catch (error) {
        toast.error(`Failed to load ${pageKey} page content`)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [pageKey])

  useEffect(() => {
    if (!content?.blocks) return

    setExpandedBlocks((current) => {
      const nextState: Record<string, boolean> = { ...current }
      content.blocks.forEach((block: any, index: number) => {
        const blockKey = block.id || `block-${index}`
        if (nextState[blockKey] === undefined) {
          nextState[blockKey] = index === 0
        }
      })

      return nextState
    })
  }, [content?.blocks])

  const previewContent = useMemo(() => content, [content])
  const orderedBlocks = useMemo(() => {
    return (content?.blocks || []).slice().sort((a: any, b: any) => Number(a.order || 0) - Number(b.order || 0))
  }, [content?.blocks])

  const updateField = (field: string, value: any) => {
    setContent((current: any) => ({ ...current, [field]: value }))
  }

  const updateBlock = (blockId: string, field: string, value: any) => {
    setContent((current: any) => ({
      ...current,
      blocks: (current?.blocks || []).map((block: any) =>
        block.id === blockId ? { ...block, [field]: value } : block
      ),
    }))
  }

  const addSection = () => {
    const currentBlocks = content?.blocks || []
    const nextOrder = Math.max(...currentBlocks.map((block: any) => Number(block.order || 0)), 0) + 1

    const newSection = {
      id: `section-${Date.now()}`,
      type: 'section',
      label: 'New Section',
      fieldKey: '',
      placeholder: '',
      section: 'New Section',
      column: 'left',
      order: nextOrder,
      enabled: true,
    }

    setContent((current: any) => ({
      ...current,
      blocks: [...(current?.blocks || []), newSection],
    }))

    setExpandedBlocks(() => ({
      [newSection.id]: true,
    }))
  }

  const addBlock = () => {
    const currentBlocks = content?.blocks || []
    const nextOrder = Math.max(...currentBlocks.map((block: any) => Number(block.order || 0)), 0) + 1

    const newField = {
      id: `field-${Date.now()}`,
      type: 'text',
      label: 'New Field',
      fieldKey: `newField-${Date.now()}`,
      placeholder: 'Enter a value',
      section: 'General',
      column: 'left',
      order: nextOrder,
      enabled: true,
    }

    setContent((current: any) => ({
      ...current,
      blocks: [...(current?.blocks || []), newField],
    }))

    setExpandedBlocks(() => ({
      [newField.id]: true,
    }))
  }

  const removeBlock = (blockId: string) => {
    setContent((current: any) => ({
      ...current,
      blocks: (current?.blocks || []).filter((block: any) => block.id !== blockId),
    }))

    setExpandedBlocks((current) => {
      const nextState = { ...current }
      delete nextState[blockId]
      return nextState
    })
  }

  const toggleBlock = (blockId: string, open: boolean) => {
    setExpandedBlocks(() => {
      const nextState: Record<string, boolean> = {}
      if (open) {
        nextState[blockId] = true
      }
      return nextState
    })
  }

  const saveContent = async () => {
    try {
      setSaving(true)
      await applicationPageContentService.update(pageKey, content)
      toast.success(`${pageKey} page content saved`)
    } catch (error) {
      toast.error(`Failed to save ${pageKey} page content`)
    } finally {
      setSaving(false)
    }
  }

  const resetToDefaults = async () => {
    try {
      setSaving(true)
      const freshContent = await applicationPageContentService.get(pageKey)
      setContent(freshContent)
      toast.success('Content reset to default mock data')
    } catch (error) {
      toast.error(`Failed to reset ${pageKey} content`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </Card>
    )
  }

  const PreviewComponent = previewComponent

  return (
    <div className="w-full">
      <Card
        className="border border-slate-200 shadow-xl rounded-3xl overflow-hidden transition-all duration-300 animate-in fade-in"
        style={{
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease, background-color 0.3s ease',
          transform: animating 
            ? 'translateY(12px) scale(0.99)' 
            : 'translateY(0px) scale(1)',
          opacity: animating ? 0.05 : 1,
          backgroundColor: viewMode === 'preview' ? '#F5F5F0' : '#ffffff'
        }}
      >
        {viewMode === 'editor' ? (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">{builderTitle}</p>
                <h2 className="text-2xl font-black text-slate-800">Manage step content</h2>
                <p className="text-xs text-muted-foreground">{builderDescription}</p>
              </div>
              {PreviewComponent && (
                <Button 
                  type="button" 
                  onClick={handleToggleView} 
                  className="gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold h-9"
                >
                  <Eye className="w-4 h-4" />
                  Preview Step
                </Button>
              )}
            </div>

            <div className="grid gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Page Title</label>
                <Input
                  value={content?.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Page title"
                  className="rounded-xl h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Page Subtitle</label>
                <Textarea
                  value={content?.subtitle || ''}
                  onChange={(e) => updateField('subtitle', e.target.value)}
                  rows={3}
                  placeholder="Describe the page purpose"
                  className="rounded-xl text-sm resize-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 border-t pt-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Dynamic Fields List</h3>
                  <p className="text-xs text-muted-foreground">Add sections or input fields, then expand each card to edit its properties.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={addSection} className="gap-2 rounded-xl h-9 text-xs">
                    <Plus className="w-4 h-4" />
                    Add Section
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={addBlock} className="gap-2 rounded-xl h-9 text-xs">
                    <Plus className="w-4 h-4" />
                    Add Field
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {orderedBlocks.map((block: any, index: number) => {
                  const blockKey = block.id || `block-${index}`

                  return (
                    <Collapsible
                      key={blockKey}
                      open={Boolean(expandedBlocks[blockKey])}
                      onOpenChange={(open) => toggleBlock(blockKey, open)}
                    >
                      <div className="border rounded-2xl bg-muted/20 overflow-hidden">
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3 text-left">
                              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{block.type || 'text'}</span>
                              <div>
                                <p className="text-sm font-semibold text-slate-800">#{index + 1} {block.label || 'Untitled block'}</p>
                                <p className="text-[10px] text-muted-foreground">{block.section || 'General'} • Order Position {block.order ?? index + 1}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeBlock(block.id)
                                }}
                                className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <Button type="button" variant="ghost" className="h-8 w-8 p-0 rounded-xl">
                                <ChevronDown className={`w-4 h-4 transition-transform ${expandedBlocks[blockKey] ? 'rotate-180' : ''}`} />
                              </Button>
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="border-t bg-background/90 px-5 py-5 space-y-5">
                          {/* Basic Fields Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Field Label</label>
                              <Input
                                value={block.label || ''}
                                onChange={(e) => updateBlock(block.id, 'label', e.target.value)}
                                className="h-9 rounded-xl text-xs"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Field Type</label>
                              <select
                                className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1.5 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={block.type || 'text'}
                                onChange={(e) => updateBlock(block.id, 'type', e.target.value)}
                              >
                                <option value="section">section</option>
                                <option value="text">text</option>
                                <option value="textarea">textarea</option>
                                <option value="select">select</option>
                                <option value="radio">radio</option>
                                <option value="number">number</option>
                                <option value="date">date</option>
                                <option value="checkbox">checkbox</option>
                                <option value="user">user</option>
                                <option value="upload">upload</option>
                                <option value="summary">summary</option>
                                <option value="summary-item">summary-item</option>
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Field Key</label>
                              <Input
                                value={block.fieldKey || ''}
                                onChange={(e) => updateBlock(block.id, 'fieldKey', e.target.value)}
                                className="h-9 rounded-xl text-xs"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Section Category</label>
                              <Input
                                value={block.section || ''}
                                onChange={(e) => updateBlock(block.id, 'section', e.target.value)}
                                className="h-9 rounded-xl text-xs"
                              />
                            </div>
                          </div>

                          {/* Switched Options (Compact Inline Flex Row) */}
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-slate-50 p-3.5 border rounded-2xl text-xs font-semibold text-slate-700">
                            <label className="flex items-center gap-2.5 cursor-pointer">
                              <Switch
                                checked={Boolean(block.required)}
                                onCheckedChange={(checked) => updateBlock(block.id, 'required', checked)}
                              />
                              <span>Required field</span>
                            </label>

                            <label className="flex items-center gap-2.5 cursor-pointer">
                              <Switch
                                checked={Boolean(block.enabled ?? true)}
                                onCheckedChange={(checked) => updateBlock(block.id, 'enabled', checked)}
                              />
                              <span>Active field block</span>
                            </label>

                            <button
                              type="button"
                              onClick={() => toggleAdvanced(block.id)}
                              className="ml-auto text-xs font-bold text-primary hover:underline flex items-center gap-1 bg-white px-3 py-1.5 border rounded-xl shadow-xs"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              {showAdvanced[block.id] ? 'Hide Settings' : 'Advanced Settings'}
                            </button>
                          </div>

                          {/* Advanced Settings */}
                          {showAdvanced[block.id] && (
                            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/30 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Placeholder Text</label>
                                  <Input
                                    value={block.placeholder || ''}
                                    onChange={(e) => updateBlock(block.id, 'placeholder', e.target.value)}
                                    className="h-9 rounded-xl text-xs bg-white"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Default Value</label>
                                  <Input
                                    value={block.defaultValue ?? ''}
                                    onChange={(e) => updateBlock(block.id, 'defaultValue', e.target.value)}
                                    className="h-9 rounded-xl text-xs bg-white"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Display Column</label>
                                  <select
                                    className="flex h-9 w-full rounded-xl border border-input bg-white px-3 py-1.5 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={block.column || 'left'}
                                    onChange={(e) => updateBlock(block.id, 'column', e.target.value)}
                                  >
                                    <option value="left">Left Column</option>
                                    <option value="right">Right Column</option>
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Position</label>
                                  <Input
                                    type="number"
                                    value={block.order ?? 0}
                                    onChange={(e) => updateBlock(block.id, 'order', Number(e.target.value))}
                                    className="h-9 rounded-xl text-xs bg-white"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Value Source</label>
                                  <Input
                                    value={block.valueSource || ''}
                                    onChange={(e) => updateBlock(block.id, 'valueSource', e.target.value)}
                                    className="h-9 rounded-xl text-xs bg-white"
                                  />
                                </div>
                              </div>

                              {/* Conditional Options or Max Words based on Type */}
                              <div className="grid grid-cols-1 gap-4">
                                {['select', 'radio'].includes(block.type) && (
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Options (Comma Separated)</label>
                                    <Input
                                      placeholder="e.g. Option A, Option B, Option C"
                                      value={(block.options || []).join(', ')}
                                      onChange={(e) => updateBlock(block.id, 'options', e.target.value.split(',').map((item: string) => item.trim()).filter(Boolean))}
                                      className="h-9 rounded-xl text-xs bg-white"
                                    />
                                  </div>
                                )}

                                {['text', 'textarea'].includes(block.type) && (
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Maximum Words count</label>
                                    <Input
                                      type="number"
                                      value={block.maxWords ?? ''}
                                      onChange={(e) => updateBlock(block.id, 'maxWords', Number(e.target.value))}
                                      className="h-9 rounded-xl text-xs bg-white"
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Switches & Description */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start pt-2">
                                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 cursor-pointer py-2">
                                  <Switch
                                    checked={Boolean(block.disabled)}
                                    onCheckedChange={(checked) => updateBlock(block.id, 'disabled', checked)}
                                  />
                                  <span>Disable editing for students</span>
                                </label>

                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Help text / Field Description</label>
                                  <Textarea
                                    placeholder="Instructions visible below the field..."
                                    value={block.description || ''}
                                    onChange={(e) => updateBlock(block.id, 'description', e.target.value)}
                                    rows={2}
                                    className="rounded-xl text-xs bg-white resize-none"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
              <Button type="button" onClick={saveContent} disabled={saving} className="gap-2 rounded-xl h-10 px-5 font-bold">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={resetToDefaults} disabled={saving} className="gap-2 rounded-xl h-10 px-5 font-bold text-slate-700">
                <RotateCcw className="w-4 h-4" />
                Reset Defaults
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Live Preview Mode</p>
                <h2 className="text-2xl font-black text-slate-800">Student Portal Preview</h2>
                <p className="text-xs text-muted-foreground">This simulates exactly what the student will view when filling in this step.</p>
              </div>
              <Button 
                type="button" 
                onClick={handleToggleView} 
                className="gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold h-9"
              >
                <RotateCcw className="w-4 h-4" />
                Back to Editor
              </Button>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-[#F5F5F0] p-6 shadow-inner min-h-[400px]">
              {PreviewComponent && (
                <PreviewComponent
                  {...previewComponentProps}
                  pageContent={previewContent}
                />
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
