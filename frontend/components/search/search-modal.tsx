'use client'

import { useState, useMemo, useEffect } from 'react'
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
  ChevronRight,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { dummyCandidates } from '@/lib/candidate-data'
import { dummyEmails } from '@/lib/email-data'
import { dummyUsers } from '@/lib/user-data'

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
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        isOpen ? onClose() : onClose()
      }
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const allResults: SearchResultItem[] = useMemo(() => {
    return [
      ...dummyCandidates.map((c) => ({
        id: c.id,
        title: c.name,
        description: c.program,
        type: 'candidate' as const,
        url: '/candidates',
        metadata: `${c.currentStep} • ${c.status}`,
      })),
      ...dummyUsers.map((u) => ({
        id: u.id,
        title: u.name,
        description: u.role,
        type: 'user' as const,
        url: '/users',
        metadata: `${u.department}`,
      })),
      ...dummyEmails.map((e) => ({
        id: e.id,
        title: e.subject,
        description: `To: ${e.recipient}`,
        type: 'email' as const,
        url: '/emails',
        metadata: e.sentAt.toLocaleDateString(),
      })),
      {
        id: 'payment-001',
        title: 'Payment Status - Sarah Johnson',
        description: 'Unpaid • Sales Qualification',
        type: 'payment' as const,
        url: '/candidates',
        metadata: '$5,000',
      },
      {
        id: 'payment-002',
        title: 'Payment Status - Michael Chen',
        description: 'Pending • Sales Qualification',
        type: 'payment' as const,
        url: '/candidates',
        metadata: '$3,500',
      },
    ]
  }, [])

  const resultsByType = useMemo(() => {
    if (!searchQuery.trim()) return {}

    const query = searchQuery.toLowerCase()
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

  if (!isOpen) return null

  const orderedTypes = ['candidate', 'user', 'email', 'payment', 'interview', 'document', 'workflow', 'id'] as const
  const sortedTypes = orderedTypes.filter((t) => resultsByType[t])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        {/* Search Input */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            {isSearching && (
              <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
            )}
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search candidates, users, emails, payments, interviews..."
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
          {!searchQuery.trim() && (
            <div className="p-12 text-center">
              <Search className="w-12 h-12 mx-auto text-muted-foreground opacity-30 mb-4" />
              <p className="text-muted-foreground">Start typing to search...</p>
              <p className="text-xs text-muted-foreground mt-2">Search across candidates, users, emails, payments, and more</p>
            </div>
          )}

          {searchQuery.trim() && !hasResults && (
            <div className="p-12 text-center">
              <Search className="w-12 h-12 mx-auto text-muted-foreground opacity-30 mb-4" />
              <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
              <p className="text-xs text-muted-foreground mt-2">Try different keywords</p>
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
                                <p className="text-sm font-medium text-foreground truncate">
                                  {result.title}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {result.description}
                                </p>
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
                          +{results.length - 5} more {typeLabels[type].toLowerCase()}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}

              <div className="text-center pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Found {Object.values(resultsByType).reduce((sum, arr) => sum + arr.length, 0)} result
                  {Object.values(resultsByType).reduce((sum, arr) => sum + arr.length, 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
