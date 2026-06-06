"use client"

import { useState, useEffect } from 'react'
import { documentService } from '@/lib/services/api.service'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Eye, Check, X, AlertCircle, Loader2, FileText, Download, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export function DocumentsTable() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | string>('all')

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const data = await documentService.getAll()
      setDocuments(data)
    } catch (error: any) {
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const filteredDocuments = documents.filter((d) => {
    const candidateName = d.application?.user 
      ? `${d.application.user.firstName} ${d.application.user.lastName}`.toLowerCase()
      : 'Unknown Candidate'
      
    const matchesSearch =
      candidateName.includes(searchTerm.toLowerCase()) ||
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.type.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || d.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-700'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700'
      case 'REJECTED':
        return 'bg-red-100 text-red-700'
      case 'NEEDS_REVISION':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await documentService.updateStatus(id, status)
      setDocuments(
        documents.map((d) => (d.id === id ? { ...d, status } : d))
      )
      toast.success(`Document ${status.toLowerCase()} successfully`)
    } catch (error) {
      toast.error('Failed to update document status')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await documentService.delete(id)
        setDocuments(documents.filter((d) => d.id !== id))
        toast.success('Document deleted')
      } catch (error) {
        toast.error('Failed to delete document')
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="flex-1 min-w-[240px] relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search by candidate or document name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 border-border h-10 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-background/50 border border-border rounded-xl text-sm font-medium text-foreground h-10 outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="NEEDS_REVISION">Needs Revision</option>
          </select>

          <div className="bg-primary/10 text-primary px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">
            {filteredDocuments.length} Documents
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium animate-pulse">Syncing candidate documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Card className="p-16 text-center border-dashed bg-transparent">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground font-medium italic">No documents found matching your filters</p>
          </Card>
        ) : (
          filteredDocuments.map((doc) => {
            const candidateName = doc.application?.user 
              ? `${doc.application.user.firstName} ${doc.application.user.lastName}`
              : 'Unknown Candidate'

            return (
              <Card key={doc.id} className="p-5 hover:shadow-xl hover:border-primary/20 transition-all duration-300 group border-border/40 overflow-hidden relative">
                {/* Decorative background icon */}
                <FileText className="absolute -right-4 -bottom-4 w-24 h-24 text-primary/5 -rotate-12 group-hover:scale-110 transition-transform" />
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-lg tracking-tight">{doc.name}</h4>
                        <p className="text-xs font-bold text-primary uppercase tracking-widest">{candidateName}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-xs bg-secondary/20 p-3 rounded-2xl border border-border/30">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter mb-1">Type</p>
                        <p className="font-bold text-foreground">{doc.type}</p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter mb-1">File Name</p>
                        <p className="font-bold text-foreground truncate max-w-[120px]">{doc.fileName}</p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter mb-1">Size</p>
                        <p className="font-bold text-foreground">{doc.size} MB</p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter mb-1">Status</p>
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${getStatusColor(doc.status)}`}>
                          {doc.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {doc.remarks && (
                      <div className="mt-4 p-3 bg-red-50/50 border border-red-100 rounded-xl flex gap-3 items-start">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <div className="text-xs text-red-800">
                          <p className="font-bold uppercase tracking-tight mb-1">Admin Remarks</p>
                          <p className="leading-relaxed">{doc.remarks}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex md:flex-col gap-2 shrink-0">
                    {doc.status === 'PENDING' ? (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleStatusUpdate(doc.id, 'APPROVED')}
                          className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-9 px-4 gap-2 shadow-lg shadow-green-600/20"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(doc.id, 'REJECTED')}
                          className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl h-9 px-4 gap-2"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="secondary" size="sm" className="rounded-xl h-9 px-4 gap-2" asChild>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            <Eye className="w-4 h-4" />
                            View
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-xl h-9 px-4 gap-2 border-border/50">
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(doc.id)}
                          className="rounded-xl h-9 px-4 gap-2 text-muted-foreground hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
