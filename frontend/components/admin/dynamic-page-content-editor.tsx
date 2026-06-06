'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Loader2, Plus, Save, Trash2, RotateCcw, Eye, ChevronDown } from 'lucide-react'
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
          nextState[blockKey] = true
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

    setExpandedBlocks((current) => ({
      ...current,
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

    setExpandedBlocks((current) => ({
      ...current,
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
    setExpandedBlocks((current) => ({
      ...current,
      [blockId]: open,
    }))
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
    <div className={`grid gap-6 ${showPreview && PreviewComponent ? 'xl:grid-cols-[1.2fr_0.8fr]' : 'xl:grid-cols-1'}`}>
      <Card className="p-6 space-y-6">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">{builderTitle}</p>
          <h2 className="text-2xl font-bold">Manage the step content</h2>
          <p className="text-sm text-muted-foreground">{builderDescription}</p>
        </div>

        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Page Title</label>
            <Input
              value={content?.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Page title"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Page Subtitle</label>
            <Textarea
              value={content?.subtitle || ''}
              onChange={(e) => updateField('subtitle', e.target.value)}
              rows={4}
              placeholder="Describe the page purpose"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Dynamic Fields</h3>
              <p className="text-sm text-muted-foreground">Add sections or fields, then expand each item to edit its settings and order.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" variant="outline" onClick={addSection} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Section
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={addBlock} className="gap-2">
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
                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="flex items-center gap-3 text-left">
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{block.type || 'text'}</span>
                        <div>
                          <p className="text-sm font-semibold">#{index + 1} {block.label || 'Untitled block'}</p>
                          <p className="text-xs text-muted-foreground">{block.section || 'General'} • order {block.order ?? index + 1}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button type="button" size="icon" variant="ghost" onClick={() => removeBlock(block.id)} className="h-8 w-8">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <CollapsibleTrigger asChild>
                          <Button type="button" variant="ghost" className="h-8 w-8 p-0">
                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedBlocks[blockKey] ? 'rotate-180' : ''}`} />
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>

                    <CollapsibleContent className="border-t bg-background/80 px-4 py-4 space-y-4">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wider">Label</label>
                          <Input
                            value={block.label || ''}
                            onChange={(e) => updateBlock(block.id, 'label', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wider">Type</label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wider">Field Key</label>
                          <Input
                            value={block.fieldKey || ''}
                            onChange={(e) => updateBlock(block.id, 'fieldKey', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wider">Section</label>
                          <Input
                            value={block.section || ''}
                            onChange={(e) => updateBlock(block.id, 'section', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wider">Placeholder</label>
                          <Input
                            value={block.placeholder || ''}
                            onChange={(e) => updateBlock(block.id, 'placeholder', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wider">Default Value</label>
                          <Input
                            value={block.defaultValue ?? ''}
                            onChange={(e) => updateBlock(block.id, 'defaultValue', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wider">Options</label>
                          <Input
                            value={(block.options || []).join(', ')}
                            onChange={(e) => updateBlock(block.id, 'options', e.target.value.split(',').map((item: string) => item.trim()).filter(Boolean))}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wider">Required</label>
                          <div className="flex h-10 items-center rounded-md border border-input bg-background px-3">
                            <Switch
                              checked={Boolean(block.required)}
                              onCheckedChange={(checked) => updateBlock(block.id, 'required', checked)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wider">Order</label>
                          <Input
                            type="number"
                            value={block.order ?? 0}
                            onChange={(e) => updateBlock(block.id, 'order', Number(e.target.value))}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wider">Value Source</label>
                          <Input
                            value={block.valueSource || ''}
                            onChange={(e) => updateBlock(block.id, 'valueSource', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wider">Max Words</label>
                          <Input
                            type="number"
                            value={block.maxWords ?? ''}
                            onChange={(e) => updateBlock(block.id, 'maxWords', Number(e.target.value))}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wider">Column</label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={block.column || 'left'}
                            onChange={(e) => updateBlock(block.id, 'column', e.target.value)}
                          >
                            <option value="left">left</option>
                            <option value="right">right</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 items-center">
                        <label className="flex items-center gap-3 text-sm font-medium">
                          <Switch
                            checked={Boolean(block.disabled)}
                            onCheckedChange={(checked) => updateBlock(block.id, 'disabled', checked)}
                          />
                          Disable editing for students
                        </label>

                        <label className="flex items-center gap-3 text-sm font-medium">
                          <Switch
                            checked={Boolean(block.enabled ?? true)}
                            onCheckedChange={(checked) => updateBlock(block.id, 'enabled', checked)}
                          />
                          Active block
                        </label>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wider">Description / Help Text</label>
                        <Textarea
                          value={block.description || ''}
                          onChange={(e) => updateBlock(block.id, 'description', e.target.value)}
                          rows={3}
                        />
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button type="button" onClick={saveContent} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Content
          </Button>
          <Button type="button" variant="outline" onClick={resetToDefaults} disabled={saving} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset Mock Data
          </Button>
          {PreviewComponent && (
            <Button type="button" variant="outline" onClick={() => setShowPreview((value) => !value)} className="gap-2">
              <Eye className="w-4 h-4" />
              {showPreview ? 'Hide Preview' : 'Open Preview'}
            </Button>
          )}
        </div>
      </Card>

      {PreviewComponent && showPreview && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Live Preview</p>
              <h2 className="text-2xl font-bold">Student-facing page preview</h2>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Preview</span>
          </div>

          <div className="rounded-3xl border border-border/70 bg-background p-4 shadow-inner">
            <PreviewComponent
              {...previewComponentProps}
              pageContent={previewContent}
            />
          </div>
        </Card>
      )}
    </div>
  )
}
