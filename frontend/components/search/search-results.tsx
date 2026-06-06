'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Search,
  Users,
  FileText,
  Zap,
  Calendar,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'

interface SearchResult {
  id: string
  title: string
  description: string
  type: 'candidate' | 'document' | 'workflow' | 'interview' | 'user'
  url: string
  metadata?: string
}

const allResults: SearchResult[] = [
  // Candidates
  {
    id: 'cand1',
    title: 'John Smith',
    description: 'Senior Software Engineer - Active in Hiring Process',
    type: 'candidate',
    url: '/candidates',
    metadata: 'Step: Technical Interview',
  },
  {
    id: 'cand2',
    title: 'Sarah Johnson',
    description: 'Product Manager - Recently Applied',
    type: 'candidate',
    url: '/candidates',
    metadata: 'Step: Initial Screening',
  },
  {
    id: 'cand3',
    title: 'Emma Davis',
    description: 'UX Designer - Offer Extended',
    type: 'candidate',
    url: '/candidates',
    metadata: 'Step: Offer Stage',
  },
  {
    id: 'cand4',
    title: 'Michael Brown',
    description: 'Data Scientist - Interview Scheduled',
    type: 'candidate',
    url: '/candidates',
    metadata: 'Interview: Apr 20, 2024',
  },
  {
    id: 'cand5',
    title: 'Lisa Chen',
    description: 'Marketing Manager - In Review',
    type: 'candidate',
    url: '/candidates',
    metadata: 'Step: Hiring Manager Review',
  },

  // Workflows
  {
    id: 'wf1',
    title: 'Hiring Process',
    description: 'Complete hiring workflow for engineering positions',
    type: 'workflow',
    url: '/workflows',
    metadata: '5 steps • Active',
  },
  {
    id: 'wf2',
    title: 'Sales Process',
    description: 'Sales qualification and deal management workflow',
    type: 'workflow',
    url: '/workflows',
    metadata: '4 steps • Active',
  },
  {
    id: 'wf3',
    title: 'Onboarding Workflow',
    description: 'New hire onboarding and setup process',
    type: 'workflow',
    url: '/workflows',
    metadata: '6 steps • Inactive',
  },

  // Documents
  {
    id: 'doc1',
    title: 'Resume - John Smith',
    description: 'CV and work history document',
    type: 'document',
    url: '/documents',
    metadata: 'PDF • Approved',
  },
  {
    id: 'doc2',
    title: 'Cover Letter - Sarah Johnson',
    description: 'Application letter and motivation',
    type: 'document',
    url: '/documents',
    metadata: 'PDF • Pending',
  },
  {
    id: 'doc3',
    title: 'Portfolio - Emma Davis',
    description: 'Design portfolio and case studies',
    type: 'document',
    url: '/documents',
    metadata: 'PDF • Approved',
  },
  {
    id: 'doc4',
    title: 'Certification - Michael Brown',
    description: 'Professional certifications and training',
    type: 'document',
    url: '/documents',
    metadata: 'PDF • Needs Revision',
  },

  // Interviews
  {
    id: 'int1',
    title: 'Technical Interview - John Smith',
    description: 'Coding and technical skills assessment',
    type: 'interview',
    url: '/interviews',
    metadata: 'Apr 20, 2024 at 2:00 PM',
  },
  {
    id: 'int2',
    title: 'Behavioral Interview - Sarah Johnson',
    description: 'Culture fit and team collaboration assessment',
    type: 'interview',
    url: '/interviews',
    metadata: 'Apr 22, 2024 at 10:00 AM',
  },
  {
    id: 'int3',
    title: 'Portfolio Review - Emma Davis',
    description: 'Design portfolio and UX/UI process discussion',
    type: 'interview',
    url: '/interviews',
    metadata: 'Apr 18, 2024 at 3:00 PM',
  },

  // Users
  {
    id: 'user1',
    title: 'Alex Thompson',
    description: 'Hiring Manager • Active',
    type: 'user',
    url: '/users',
    metadata: 'Department: Engineering',
  },
  {
    id: 'user2',
    title: 'Jennifer White',
    description: 'HR Manager • Active',
    type: 'user',
    url: '/users',
    metadata: 'Department: Human Resources',
  },
  {
    id: 'user3',
    title: 'David Lee',
    description: 'Interview Coordinator • Active',
    type: 'user',
    url: '/users',
    metadata: 'Department: Human Resources',
  },
]

const typeIcons = {
  candidate: Users,
  document: FileText,
  workflow: Zap,
  interview: Calendar,
  user: Users,
}

const typeColors = {
  candidate: 'text-green-600 bg-green-50',
  document: 'text-purple-600 bg-purple-50',
  workflow: 'text-orange-600 bg-orange-50',
  interview: 'text-blue-600 bg-blue-50',
  user: 'text-indigo-600 bg-indigo-50',
}

const typeLabels = {
  candidate: 'Candidate',
  document: 'Document',
  workflow: 'Workflow',
  interview: 'Interview',
  user: 'Team Member',
}

export function SearchResults() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const results = useMemo(() => {
    if (!searchQuery.trim()) return []

    setIsSearching(true)
    // Simulate search delay
    const timer = setTimeout(() => setIsSearching(false), 300)

    const query = searchQuery.toLowerCase()
    const filtered = allResults.filter(
      (result) =>
        result.title.toLowerCase().includes(query) ||
        result.description.toLowerCase().includes(query) ||
        result.metadata?.toLowerCase().includes(query)
    )

    return () => clearTimeout(timer)
  }, [searchQuery])

  const resultsByType = useMemo(() => {
    if (!searchQuery.trim()) return {}

    const query = searchQuery.toLowerCase()
    const filtered = allResults.filter(
      (result) =>
        result.title.toLowerCase().includes(query) ||
        result.description.toLowerCase().includes(query) ||
        result.metadata?.toLowerCase().includes(query)
    )

    return filtered.reduce(
      (acc, result) => {
        if (!acc[result.type]) acc[result.type] = []
        acc[result.type].push(result)
        return acc
      },
      {} as Record<string, SearchResult[]>
    )
  }, [searchQuery])

  const hasResults = Object.keys(resultsByType).length > 0

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Search Box */}
      <Card className="p-4">
        <div className="relative">
          {isSearching && (
            <Loader2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
          )}
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search candidates, workflows, documents, interviews, team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-11"
          />
        </div>
      </Card>

      {/* No Query */}
      {!searchQuery.trim() && (
        <Card className="p-12 text-center">
          <Search className="w-16 h-16 mx-auto text-muted-foreground opacity-30 mb-4" />
          <p className="text-muted-foreground text-lg">
            Start typing to search across your CRM
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Search by name, title, status, or any relevant information
          </p>
        </Card>
      )}

      {/* No Results */}
      {searchQuery.trim() && !hasResults && (
        <Card className="p-12 text-center">
          <Search className="w-16 h-16 mx-auto text-muted-foreground opacity-30 mb-4" />
          <p className="text-muted-foreground text-lg">No results found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Try adjusting your search terms
          </p>
        </Card>
      )}

      {/* Results by Type */}
      {hasResults && (
        <div className="space-y-6">
          {Object.entries(resultsByType).map(([type, typeResults]) => {
            const IconComponent = typeIcons[type as keyof typeof typeIcons]

            return (
              <div key={type}>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3 px-1">
                  {typeLabels[type as keyof typeof typeLabels]} ({typeResults.length})
                </h3>

                <div className="space-y-2">
                  {typeResults.map((result) => {
                    const colorClass = typeColors[type as keyof typeof typeColors]
                    return (
                      <Link key={result.id} href={result.url}>
                        <Card className="p-4 hover:bg-accent transition-colors cursor-pointer">
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0`}>
                              <IconComponent className="w-5 h-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground">{result.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {result.description}
                              </p>
                              {result.metadata && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  {result.metadata}
                                </p>
                              )}
                            </div>

                            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                          </div>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}

          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              Found {Object.values(resultsByType).reduce((sum, arr) => sum + arr.length, 0)} result
              {Object.values(resultsByType).reduce((sum, arr) => sum + arr.length, 0) !== 1
                ? 's'
                : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
