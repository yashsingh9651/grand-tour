'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Search,
  Users,
  FileText,
  Zap,
  Calendar,
  Mail,
  CreditCard,
  X,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { applicationService, userService } from '@/lib/services/api.service'

interface SearchResultItem {
  id: string
  title: string
  description: string
  type: 'candidate' | 'document' | 'workflow' | 'interview' | 'user' | 'email' | 'payment' | 'id'
  url: string
  metadata?: string
}

const typeIcons = {
  candidate: Users,
  document: FileText,
  workflow: Zap,
  interview: Calendar,
  user: Users,
  email: Mail,
  payment: CreditCard,
  id: Search,
}

const typeColors = {
  candidate: 'text-green-600 bg-green-50',
  document: 'text-purple-600 bg-purple-50',
  workflow: 'text-orange-600 bg-orange-50',
  interview: 'text-blue-600 bg-blue-50',
  user: 'text-indigo-600 bg-indigo-50',
  email: 'text-red-600 bg-red-50',
  payment: 'text-yellow-600 bg-yellow-50',
  id: 'text-gray-600 bg-gray-50',
}

const typeLabels = {
  candidate: 'Candidate',
  document: 'Document',
  workflow: 'Workflow',
  interview: 'Interview',
  user: 'Team Member',
  email: 'Email',
  payment: 'Payment',
  id: 'ID Reference',
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [allResults, setAllResults] = useState<SearchResultItem[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)

  // Load real data from API when modal opens
  useEffect(() => {
    if (!isOpen || dataLoaded) return

    const loadData = async () => {
      setIsLoading(true)
      try {
        const [applications, users] = await Promise.allSettled([
          applicationService.getAll(),
          userService.getAll(),
        ])

        const results: SearchResultItem[] = []

        // Map real candidates from applications
        if (applications.status === 'fulfilled' && Array.isArray(applications.value)) {
          applications.value.forEach((app: any) => {
            const name = [app.user?.firstName, app.user?.lastName].filter(Boolean).join(' ')
            results.push({
              id: app.id,
              title: name || app.user?.email || 'Unknown Candidate',
              description: app.user?.email || '',
              type: 'candidate',
              url: '/admin/candidates',
              metadata: `${app.status} • ${app.category || 'STUDENT'}`,
            })
          })
        }

        // Map real team users
        if (users.status === 'fulfilled' && Array.isArray(users.value)) {
          users.value.forEach((u: any) => {
            const name = [u.firstName, u.lastName].filter(Boolean).join(' ')
            results.push({
              id: u.id,
              title: name || u.email,
              description: u.email,
              type: 'user',
              url: '/admin/users',
              metadata: u.role?.replace(/_/g, ' '),
            })
          })
        }

        setAllResults(results)
        setDataLoaded(true)
      } catch {
        // Silent fail — show empty state
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [isOpen, dataLoaded])

  // Reset on close so fresh data is loaded next open
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setDataLoaded(false)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
      }
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const resultsByType = useMemo(() => {
    if (!searchQuery.trim()) return {}

    const query = searchQuery.trim().toLowerCase()
    const filtered = allResults.filter(
      (result) =>
        result.title.toLowerCase().includes(query) ||
        result.description.toLowerCase().includes(query) ||
        result.metadata?.toLowerCase().includes(query) ||
        result.id.toLowerCase().includes(query)
    )

    return filtered.reduce(
      (acc, result) => {
        if (!acc[result.type]) acc[result.type] = []
        acc[result.type].push(result)
        return acc
      },
      {} as Record<string, SearchResultItem[]>
    )
  }, [searchQuery, allResults])

  const hasResults = Object.keys(resultsByType).length > 0
  const totalResults = Object.values(resultsByType).reduce((sum, arr) => sum + arr.length, 0)

  if (!isOpen) return null

  const orderedTypes = ['candidate', 'user', 'email', 'payment', 'interview', 'document', 'workflow', 'id'] as const
  const sortedTypes = orderedTypes.filter((t) => resultsByType[t])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        {/* Search Input */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            {isLoading ? (
              <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
            ) : (
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            )}
            <Input
              autoFocus
              placeholder="Search candidates, team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          {isLoading && (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 mx-auto text-muted-foreground animate-spin mb-4" />
              <p className="text-muted-foreground text-sm">Loading records...</p>
            </div>
          )}

          {!isLoading && !searchQuery.trim() && (
            <div className="p-12 text-center">
              <Search className="w-12 h-12 mx-auto text-muted-foreground opacity-30 mb-4" />
              <p className="text-muted-foreground">Start typing to search...</p>
              <p className="text-xs text-muted-foreground mt-2">
                Search across {allResults.length} records — candidates, team members, and more
              </p>
            </div>
          )}

          {!isLoading && searchQuery.trim() && !hasResults && (
            <div className="p-12 text-center">
              <Search className="w-12 h-12 mx-auto text-muted-foreground opacity-30 mb-4" />
              <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
              <p className="text-xs text-muted-foreground mt-2">Try different keywords or check the spelling</p>
            </div>
          )}

          {hasResults && (
            <div className="p-4 space-y-4">
              {sortedTypes.map((type) => {
                const results = resultsByType[type]
                if (!results) return null
                const IconComponent = typeIcons[type]

                return (
                  <div key={type}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-2">
                      {typeLabels[type]} ({results.length})
                    </p>
                    <div className="space-y-1">
                      {results.slice(0, 5).map((result) => {
                        const colorClass = typeColors[type]
                        return (
                          <Link key={result.id} href={result.url} onClick={onClose}>
                            <div className="p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer flex items-start gap-3">
                              <div className={`p-1.5 rounded ${colorClass} flex-shrink-0 mt-0.5`}>
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                                <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                              </div>
                              {result.metadata && (
                                <p className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                                  {result.metadata}
                                </p>
                              )}
                            </div>
                          </Link>
                        )
                      })}
                      {results.length > 5 && (
                        <p className="text-xs text-muted-foreground text-center p-2">
                          +{results.length - 5} more {typeLabels[type].toLowerCase()}s
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}

              <div className="text-center pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Found {totalResults} result{totalResults !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
