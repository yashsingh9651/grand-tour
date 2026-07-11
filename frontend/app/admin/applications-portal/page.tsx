'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/layout-wrapper'
import { Header } from '@/components/dashboard/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, Eye, ArrowRight, UserCheck, CheckCircle2, 
  AlertCircle, ShieldAlert, Loader2, Inbox, RefreshCw,
  FolderLock
} from 'lucide-react'
import { applicationService, workflowService } from '@/lib/services/api.service'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ApplicationsPortalListPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [workflow, setWorkflow] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStep, setFilterStep] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const fetchData = async () => {
    try {
      setLoading(true)
      const [appData, wfData] = await Promise.all([
        applicationService.getAll(),
        workflowService.get()
      ])
      setApplications(appData || [])
      setWorkflow(wfData)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredApps = applications.filter((app) => {
    const fullName = `${app.user?.firstName || ''} ${app.user?.lastName || ''}`.toLowerCase()
    const email = (app.user?.email || '').toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase())
    const matchesStep = filterStep === 'all' || app.currentStepId === filterStep
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus
    return matchesSearch && matchesStep && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
      case 'REJECTED':
        return 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
      case 'DRAFT':
        return 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStepName = (stepId: string) => {
    if (!workflow?.steps) return stepId
    const step = workflow.steps.find((s: any) => s.id === stepId)
    return step ? step.name : stepId
  }

  // Calculate stats
  const totalApps = applications.length
  const pendingApps = applications.filter(a => a.status === 'PENDING').length
  const acceptedApps = applications.filter(a => a.status === 'ACCEPTED').length
  const draftApps = applications.filter(a => a.status === 'DRAFT').length

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Header 
          title="Unified Applications Portal" 
          description="View and manage the full step-by-step progress, documents, payments, and workflow data of all candidates from a single page." 
          actions={
            <Button onClick={fetchData} variant="outline" className="gap-2 border-slate-200">
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          }
        />

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-5 flex items-center justify-between border border-slate-100 bg-white rounded-3xl shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Applications</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{totalApps}</h3>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
              <Inbox className="w-5 h-5" />
            </div>
          </Card>
          <Card className="p-5 flex items-center justify-between border border-slate-100 bg-white rounded-3xl shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Awaiting Review</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingApps}</h3>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
              <AlertCircle className="w-5 h-5" />
            </div>
          </Card>
          <Card className="p-5 flex items-center justify-between border border-slate-100 bg-white rounded-3xl shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accepted Candidates</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{acceptedApps}</h3>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </Card>
          <Card className="p-5 flex items-center justify-between border border-slate-100 bg-white rounded-3xl shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Draft Enrollees</p>
              <h3 className="text-2xl font-black text-slate-600 mt-1">{draftApps}</h3>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <FolderLock className="w-5 h-5" />
            </div>
          </Card>
        </div>

        {/* Filter bar */}
        <Card className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by student name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-white border-slate-200 rounded-xl w-full"
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="space-y-1">
              <select
                value={filterStep}
                onChange={(e) => setFilterStep(e.target.value)}
                className="h-11 px-3 border border-slate-200 rounded-xl bg-white text-xs font-semibold text-slate-700 outline-none w-48"
              >
                <option value="all">All Steps</option>
                {workflow?.steps?.map((step: any) => (
                  <option key={step.id} value={step.id}>{step.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-11 px-3 border border-slate-200 rounded-xl bg-white text-xs font-semibold text-slate-700 outline-none w-40"
              >
                <option value="all">All Statuses</option>
                <option value="DRAFT">DRAFT</option>
                <option value="PENDING">PENDING</option>
                <option value="ACCEPTED">ACCEPTED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Candidates Table List */}
        <Card className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-slate-400 font-medium">Loading candidate pipeline...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center justify-center">
              <Inbox className="w-12 h-12 text-slate-200 mb-3" />
              <p className="text-slate-500 font-semibold text-lg">No Applications Found</p>
              <p className="text-slate-400 text-sm mt-1">Adjust your filter options or search queries.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Dynamic Step</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Verification Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Submission Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {(() => {
                            const personalPhotoDoc = app.documents?.find((d: any) => d.type === 'photo')
                            const avatarSrc = personalPhotoDoc?.url || app.user?.image || app.user?.profileImage || '/avatar.png'
                            return (
                              <img
                                src={avatarSrc}
                                alt={app.user?.firstName + ' ' + app.user?.lastName}
                                className="w-10 h-10 rounded-full object-cover border border-slate-200"
                              />
                            )
                          })()}
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{app.user?.firstName} {app.user?.lastName}</p>
                            <p className="text-xs text-slate-500 font-medium">{app.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-violet-50 text-[#7C3AED] border border-violet-100 font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wide">
                          {getStepName(app.currentStepId)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-500">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/applications-portal/${app.id}`}>
                          <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-9 px-4 rounded-xl gap-2">
                            <Eye className="w-4 h-4" /> Manage
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
