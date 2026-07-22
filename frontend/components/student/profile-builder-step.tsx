'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, User, Briefcase, GraduationCap } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

const fallbackPageContent = {
  title: 'Build Your Editorial Profile',
  subtitle: 'Phase 1: Defining your academic and professional coordinates.',
  blocks: [
    {
      id: 'section-personal-credentials',
      type: 'section',
      label: 'Personal Credentials',
      section: 'Personal Credentials',
      column: 'left',
      order: 1,
      enabled: true,
    },
    {
      id: 'full-name',
      type: 'text',
      label: 'Full Legal Name',
      fieldKey: 'fullName',
      placeholder: 'e.g. John Doe',
      section: 'Personal Credentials',
      column: 'left',
      order: 2,
    },
    {
      id: 'primary-email',
      type: 'user',
      label: 'Primary Email',
      fieldKey: 'email',
      valueSource: 'user.email',
      section: 'Personal Credentials',
      column: 'left',
      order: 3,
      disabled: true,
    },
    {
      id: 'passport-number',
      type: 'text',
      label: 'Passport Number',
      fieldKey: 'passportNumber',
      placeholder: 'E1234567',
      section: 'Personal Credentials',
      column: 'left',
      order: 4,
      required: false,
    },
    {
      id: 'passport-confirmation',
      type: 'checkbox',
      label: 'I confirm I have a valid passport',
      fieldKey: 'passportConfirmed',
      defaultValue: true,
      section: 'Personal Credentials',
      column: 'left',
      order: 5,
      required: true,
    },
    {
      id: 'section-academic-nexus',
      type: 'section',
      label: 'Academic Nexus',
      section: 'Academic Nexus',
      column: 'left',
      order: 6,
      enabled: true,
    },
    {
      id: 'educational-institution',
      type: 'text',
      label: 'Educational Institution',
      fieldKey: 'educationalInstitution',
      placeholder: 'Metropolitan Institute of Technology',
      section: 'Academic Nexus',
      column: 'left',
      order: 7,
      required: false,
    },
    {
      id: 'enrollment-status',
      type: 'select',
      label: 'B.Tech Enrollment Status',
      fieldKey: 'enrollmentStatus',
      options: ['Active Candidate', 'Alumni'],
      defaultValue: 'Active Candidate',
      section: 'Academic Nexus',
      column: 'left',
      order: 8,
    },
    {
      id: 'cgpa',
      type: 'number',
      label: 'CGPA',
      fieldKey: 'cgpa',
      placeholder: '8.5',
      section: 'Academic Nexus',
      column: 'left',
      order: 9,
      required: false,
    },
    {
      id: 'section-journey-intent',
      type: 'section',
      label: 'Journey Intent',
      section: 'Journey Intent',
      column: 'right',
      order: 10,
      enabled: true,
    },
    {
      id: 'preferred-department',
      type: 'select',
      label: 'Preferred Department',
      fieldKey: 'preferredDepartment',
      options: ['Journalism', 'Digital Media', 'Publishing', 'Content Strategy'],
      section: 'Journey Intent',
      column: 'right',
      order: 11,
    },
    {
      id: 'statement-of-purpose',
      type: 'textarea',
      label: 'Statement of Purpose (250 Words)',
      fieldKey: 'statementOfPurpose',
      placeholder: 'Describe your vision for this editorial internship...',
      description: 'Tell us why this program matters to your editorial journey.',
      section: 'Journey Intent',
      column: 'right',
      order: 12,
      maxWords: 250,
    },
    {
      id: 'preferred-start-date',
      type: 'date',
      label: 'Preferred Start Date',
      fieldKey: 'preferredStartDate',
      section: 'Journey Intent',
      column: 'right',
      order: 13,
      required: false,
    },
  ],
}

const normalizeFieldValue = (field: any, value: any) => {
  if (field.type === 'checkbox') {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') return value === 'true' || value === 'on'
    return Boolean(value)
  }

  if (field.type === 'number') {
    if (value === '' || value === null || value === undefined) return ''
    const numericValue = Number(value)
    return Number.isNaN(numericValue) ? '' : numericValue
  }

  return value
}

const extractPersistedValue = (field: any, application: any, sessionUser?: any) => {
  if (field.type === 'user') {
    return resolveUserValue(field, application, sessionUser)
  }

  const persistedData = application?.data || {}
  if (persistedData[field.fieldKey] !== undefined && persistedData[field.fieldKey] !== null) {
    return persistedData[field.fieldKey]
  }

  if (field.fieldKey === 'email') {
    return persistedData[field.fieldKey] || application?.user?.email || sessionUser?.email || ''
  }

  if (field.fieldKey === 'fullName') {
    return resolveUserValue(field, application, sessionUser)
  }

  return application?.[field.fieldKey]
}

export function ProfileBuilderStep({ application, onSubmit, submitting, pageContent }: any) {
  const { data: session } = useSession()
  const sessionUser = session?.user
  const resolvedPageContent = pageContent && pageContent.blocks && pageContent.blocks.length > 0
    ? pageContent
    : fallbackPageContent
  const [formData, setFormData] = useState<Record<string, any>>({})

  const pageFields = useMemo(() => {
    const rawFields = (resolvedPageContent?.blocks || [])
      .filter((field: any) => field.enabled !== false)
      .sort((a: any, b: any) => Number(a.order || 0) - Number(b.order || 0))

    return rawFields.map((field: any) => {
      if (field.id === 'primary-email' || field.fieldKey === 'email') {
        return {
          ...field,
          type: 'text',
          disabled: false
        }
      }
      return field
    })
  }, [resolvedPageContent])

  useEffect(() => {
    const initialData: Record<string, any> = {}

    pageFields.forEach((field: any) => {
      if (!field.fieldKey) return

      const persistedValue = extractPersistedValue(field, application, sessionUser)
      const fallbackValue = persistedValue !== undefined && persistedValue !== null ? persistedValue : field.defaultValue ?? ''
      initialData[field.fieldKey] = normalizeFieldValue(field, fallbackValue)
    })

    setTimeout(() => {
      setFormData(initialData)
    }, 0)
  }, [application, pageFields, sessionUser])

  const sections = useMemo(() => {
    const groups: Array<{ section: string; column: string; fields: any[] }> = []
    let activeGroup: { section: string; column: string; fields: any[] } | null = null

    pageFields.forEach((field: any) => {
      if (field.type === 'section') {
        activeGroup = {
          section: field.label || field.section || 'General',
          column: field.column || 'left',
          fields: [] as any[],
        }
        groups.push(activeGroup)
        return
      }

      if (!activeGroup) {
        activeGroup = {
          section: field.section || 'General',
          column: field.column || 'left',
          fields: [] as any[],
        }
        groups.push(activeGroup)
      }

      activeGroup.fields.push(field)
    })


    if (groups.length === 0 && pageFields.length > 0) {
      groups.push({
        section: 'General',
        column: 'left',
        fields: pageFields.filter((f: any) => f.type !== 'section')
      })
    }

    return groups
  }, [pageFields])



  const leftSections = sections.filter((section) => section.column === 'left')
  const rightSections = sections.filter((section) => section.column === 'right')

  const maxWords = pageFields.find((field: any) => field.fieldKey === 'statementOfPurpose')?.maxWords || 250

  const handleFieldChange = (field: any, value: any) => {
    setFormData((current: Record<string, any>) => ({
      ...current,
      [field.fieldKey]: normalizeFieldValue(field, value),
    }))
  }

  const handleFormSubmit = () => {
    const dynamicData = {
      ...(application?.data || {}),
    }

    pageFields.forEach((field: any) => {
      if (field.fieldKey && field.type !== 'user') {
        dynamicData[field.fieldKey] = normalizeFieldValue(field, formData[field.fieldKey] ?? field.defaultValue ?? '')
      }
    })

    const updatedApp = {
      ...application,
      data: dynamicData,
    }

    const missingRequiredFields = pageFields.filter((field: any) => {
      if (!field.fieldKey || field.type === 'section' || field.type === 'user' || field.enabled === false || field.required === false) {
        return false
      }
      const value = formData[field.fieldKey]
      if (field.type === 'checkbox') {
        return !value
      }
      if (typeof value === 'number') {
        return value === undefined || value === null || value === 0 || Number.isNaN(value)
      }
      return value === undefined || value === null || String(value).trim() === ''
    })

    if (missingRequiredFields.length > 0) {
      const missingLabels = missingRequiredFields.map((f: any) => f.label).join(', ')
      toast.warning(`Progress saved as draft, but please fill in all required fields to advance: ${missingLabels}`)
    }

    onSubmit({}, updatedApp, missingRequiredFields.length === 0)
  }

  const wordCount = (formData.statementOfPurpose || '').trim().split(/\s+/).filter((word: string) => word.length > 0).length

  const requiredFields = pageFields.filter((field: any) => field.fieldKey && field.type !== 'section' && field.type !== 'user' && field.enabled !== false)
  const completedFields = requiredFields.filter((field: any) => {
    const value = formData[field.fieldKey]

    if (field.type === 'checkbox') {
      return Boolean(value)
    }

    if (typeof value === 'number') {
      return value !== 0 && !Number.isNaN(value)
    }

    return value !== undefined && value !== null && String(value).trim() !== ''
  })

  const journeySteps = [
    'application',
    'documents',
    'interview',
    'payment1',
    'hotel',
    'payment2',
    'contract',
    'payment3',
    'workpermit',
    'visapayments',
    'visa',
    'travel'
  ]
  const currentStepId = application?.currentStepId || 'application'
  const currentStepIndex = journeySteps.indexOf(currentStepId) !== -1
    ? journeySteps.indexOf(currentStepId)
    : 0

  const completion = currentStepIndex === journeySteps.length - 1
    ? 100
    : Math.min(100, Math.round((completedFields.length / Math.max(1, requiredFields.length)) * 100))

  // Calculate dynamic section steps
  const sectionProgress = sections.map((secGroup: any) => {
    const reqFields = secGroup.fields.filter((field: any) => field.fieldKey && field.type !== 'section' && field.type !== 'user' && field.enabled !== false && field.required !== false)
    const compFields = reqFields.filter((field: any) => {
      const value = formData[field.fieldKey]
      if (field.type === 'checkbox') return Boolean(value)
      if (typeof value === 'number') return value !== 0 && !Number.isNaN(value)
      return value !== undefined && value !== null && String(value).trim() !== ''
    })
    const isCompleted = reqFields.length > 0 ? compFields.length === reqFields.length : true
    return {
      name: secGroup.section,
      isCompleted
    }
  })

  let activeSectionIndex = sectionProgress.findIndex((s: any) => !s.isCompleted)
  if (activeSectionIndex === -1) {
    activeSectionIndex = Math.max(0, sectionProgress.length - 1)
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{resolvedPageContent?.title || fallbackPageContent.title}</h1>
        <p className="text-muted-foreground text-lg">{resolvedPageContent?.subtitle || fallbackPageContent.subtitle}</p>

        <div className="flex flex-wrap items-center gap-1.5 mt-6">
          {sectionProgress.map((sec: any, idx: number) => {
            let barColor = 'bg-muted'
            if (idx < activeSectionIndex || sec.isCompleted) {
              barColor = 'bg-[#4D6B19]' // Completed
            } else if (idx === activeSectionIndex) {
              barColor = 'bg-[#C6F16D]' // Current
            }
            return (
              <div
                key={sec.name}
                className={`h-1.5 flex-1 max-w-[60px] min-w-[40px] ${barColor} rounded-full transition-all duration-300`}
              />
            )
          })}
          <span className="ml-4 text-[10px] font-bold tracking-widest uppercase text-[#4D6B19]">
            Step {activeSectionIndex + 1} of {sectionProgress.length}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {leftSections.map((sectionGroup: any) => (
            <SectionCard
              key={sectionGroup.section}
              title={sectionGroup.section}
              icon={sectionGroup.section.includes('Academic') ? GraduationCap : User}
              accentClass="bg-card border border-border/60"
              fields={sectionGroup.fields}
              formData={formData}
              onFieldChange={handleFieldChange}
              resolveUserValue={resolveUserValue}
              application={application}
              sessionUser={sessionUser}
            />
          ))}
        </div>

        <div className="lg:col-span-2">
          {rightSections.map((sectionGroup: any) => (
            <SectionCard
              key={sectionGroup.section}
              title={sectionGroup.section}
              icon={Briefcase}
              accentClass="bg-card border border-border/60"
              fields={sectionGroup.fields}
              formData={formData}
              onFieldChange={handleFieldChange}
              resolveUserValue={resolveUserValue}
              application={application}
              sessionUser={sessionUser}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-8 border-t border-border">
        <Button variant="ghost" className="text-muted-foreground font-medium hover:bg-muted rounded-xl" onClick={() => window.history.back()}>
          ← Save & Exit Journey
        </Button>

        <div className="flex items-center">
          <Button
            type="button"
            onClick={handleFormSubmit}
            disabled={submitting || wordCount > maxWords}
            className="bg-[#C6F16D] hover:bg-[#b5e359] text-[#1A1A1A] font-bold h-12 px-8 rounded-l-2xl rounded-r-none tracking-widest uppercase"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Next
          </Button>
          <div className="bg-[#1A1A1A] text-white h-12 px-6 rounded-r-2xl rounded-l-none flex items-center justify-center border-l border-white/20">
            <div className="flex flex-col">
              <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-0.5">Overall Completion</span>
              <span className="text-xs font-bold leading-none">{completion}% Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function resolveUserValue(field: any, application: any, sessionUser?: any) {
  const source = field.valueSource || ''

  const user = application?.user || sessionUser

  if (source === 'user.fullName') {
    if (user?.firstName || user?.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim()
    }
    return user?.name || ''
  }

  if (source === 'user.email') {
    return user?.email || ''
  }

  if (source === 'user.firstName') {
    return user?.firstName || user?.name?.split(' ')[0] || ''
  }

  if (source === 'user.lastName') {
    return user?.lastName || user?.name?.split(' ').slice(1).join(' ') || ''
  }

  return field.defaultValue || ''
}

function SectionCard({ title, icon: Icon, accentClass, fields, formData, onFieldChange, resolveUserValue, application, sessionUser }: any) {
  const wordCount = (formData.statementOfPurpose || '').trim().split(/\s+/).filter((word: string) => word.length > 0).length

  return (
    <Card className={`p-8 border border-border shadow-sm rounded-[2rem] ${accentClass}`}>
      <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-foreground">
        <Icon className={`w-5 h-5 ${title.includes('Academic') ? 'text-[#C6F16D] dark:text-[#C6F16D]' : 'text-[#8B48F6]'}`} />
        {title}
      </h3>

      <div className="space-y-6">
        {fields.map((field: any) => (
          <div key={field.id} className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">{field.label}</label>

            {field.type === 'user' && (
              <input
                type="text"
                value={resolveUserValue(field, application, sessionUser)}
                disabled
                className="w-full bg-muted border border-border h-12 rounded-xl text-foreground font-medium px-4 outline-none opacity-60 cursor-not-allowed"
              />
            )}

            {field.type === 'text' && (
              <input
                type="text"
                value={formData[field.fieldKey] ?? ''}
                onChange={(e) => onFieldChange(field, e.target.value)}
                placeholder={field.placeholder}
                className="w-full bg-muted border border-border h-12 rounded-xl text-foreground font-medium px-4 outline-none focus:bg-background focus:ring-2 focus:ring-[#C6F16D]/50 transition-colors placeholder:text-muted-foreground"
              />
            )}

            {field.type === 'number' && (
              <input
                type="number"
                value={formData[field.fieldKey] ?? ''}
                onChange={(e) => onFieldChange(field, e.target.value)}
                placeholder={field.placeholder}
                className="w-full bg-muted border border-border h-12 rounded-xl text-foreground font-medium px-4 outline-none focus:bg-background focus:ring-2 focus:ring-[#C6F16D]/50 transition-colors placeholder:text-muted-foreground"
              />
            )}

            {field.type === 'date' && (
              <input
                type="date"
                value={formData[field.fieldKey] ?? ''}
                onChange={(e) => onFieldChange(field, e.target.value)}
                className="w-full bg-muted border border-border h-12 rounded-xl text-foreground font-medium px-4 outline-none focus:bg-background focus:ring-2 focus:ring-[#C6F16D]/50 transition-colors"
              />
            )}

            {field.type === 'checkbox' && (
              <label className="flex w-full items-center gap-3 rounded-xl bg-muted border border-border px-4 py-3 text-sm text-foreground font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(formData[field.fieldKey])}
                  onChange={(e) => onFieldChange(field, e.target.checked)}
                  className="h-4 w-4 rounded border-border text-[#4D6B19] focus:ring-[#C6F16D] bg-background"
                />
                <span>{field.label}</span>
              </label>
            )}

            {field.type === 'radio' && (
              <div className="space-y-2">
                {(field.options || []).map((option: string) => (
                  <label key={option} className="flex items-center gap-3 rounded-xl bg-muted border border-border px-4 py-3 text-sm text-foreground font-medium cursor-pointer">
                    <input
                      type="radio"
                      name={field.fieldKey}
                      value={option}
                      checked={formData[field.fieldKey] === option}
                      onChange={(e) => onFieldChange(field, e.target.value)}
                      className="h-4 w-4 border-border text-[#4D6B19] focus:ring-[#C6F16D] bg-background"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {field.type === 'select' && (
              <select
                value={formData[field.fieldKey] ?? field.defaultValue ?? ''}
                onChange={(e) => onFieldChange(field, e.target.value)}
                className="w-full bg-muted border border-border h-12 rounded-xl text-foreground font-medium px-4 outline-none focus:ring-2 focus:ring-[#C6F16D]/50 transition-colors cursor-pointer"
              >
                <option value="" className="bg-background">Select {field.label}</option>
                {(field.options || []).map((option: string) => (
                  <option key={option} value={option} className="bg-background">{option}</option>
                ))}
              </select>
            )}

            {field.type === 'textarea' && (
              <div className="space-y-2">
                <textarea
                  value={formData[field.fieldKey] ?? ''}
                  onChange={(e) => onFieldChange(field, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full bg-muted border border-border rounded-xl resize-none text-foreground font-medium p-4 outline-none focus:ring-2 focus:ring-[#C6F16D]/50 focus:bg-background transition-colors min-h-[200px] placeholder:text-muted-foreground"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">{field.description || 'MINIMALISM PREFERRED'}</span>
                  <span className={`text-[10px] font-bold tracking-widest uppercase ${wordCount > (field.maxWords || 250) ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {wordCount} / {field.maxWords || 250} WORDS
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
