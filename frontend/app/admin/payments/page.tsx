'use client'

import { useState, useEffect } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Loader2,
  Search,
  Filter,
  FileDown,
} from 'lucide-react'
import { paymentService } from '@/lib/services/api.service'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Sidebar } from '@/components/dashboard/sidebar'
import { usePaymentReceipt } from '@/components/PaymentReceiptPDF'

// ─── Per-row receipt downloader ───────────────────────────────────────────────
function ReceiptDownloadButton({ payment }: { payment: any }) {
  const installmentNum = (payment.description || '').toLowerCase().includes('2nd') ? 2
    : (payment.description || '').toLowerCase().includes('3rd') ? 3 : 1
  const { handlePrint } = usePaymentReceipt({
    studentName: `${payment.user?.firstName || ''} ${payment.user?.lastName || ''}`.trim(),
    amount: payment.amount || 0,
    paymentDate: payment.createdAt,
    paymentId: payment.id,
    installmentNumber: installmentNum,
    description: 'France Internship',
    utrNumber: payment.utrNumber,
  })
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handlePrint}
      className="h-8 gap-1.5 text-xs font-bold border-green-200 text-green-700 hover:bg-green-50"
      title="Download PDF Receipt"
    >
      <FileDown className="w-3.5 h-3.5" /> Receipt
    </Button>
  )
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const data = await paymentService.getAll()
      setPayments(data)
    } catch (error) {
      toast.error('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await paymentService.updateStatus(id, status)
      toast.success(`Payment ${status.toLowerCase()} successfully`)
      fetchPayments()
    } catch (error) {
      toast.error('Failed to update payment status')
    }
  }

  const filteredPayments = payments.filter(p => 
    p.user?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    p.user?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
    p.utrNumber?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Payment Approvals</h1>
              <p className="text-slate-500 font-medium">Review and verify student payment submissions</p>
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input 
                  placeholder="Search student or UTR..." 
                  className="pl-9 w-64 bg-white border-slate-200"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2 border-slate-200">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-white border-slate-100 shadow-sm rounded-3xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending</p>
                  <p className="text-2xl font-black text-slate-900">{payments.filter(p => p.status === 'PENDING').length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white border-slate-100 shadow-sm rounded-3xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Approved</p>
                  <p className="text-2xl font-black text-slate-900">{payments.filter(p => p.status === 'COMPLETED').length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white border-slate-100 shadow-sm rounded-3xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Rejected</p>
                  <p className="text-2xl font-black text-slate-900">{payments.filter(p => p.status === 'FAILED').length}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
              <Button variant="ghost" className="text-primary font-bold" onClick={fetchPayments}>Refresh Data</Button>
            </div>
            {loading ? (
              <div className="p-20 flex justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-slate-50">
                    <TableHead className="font-bold text-slate-700">Student</TableHead>
                    <TableHead className="font-bold text-slate-700">Amount</TableHead>
                    <TableHead className="font-bold text-slate-700">Description</TableHead>
                    <TableHead className="font-bold text-slate-700">Submitted On</TableHead>
                    <TableHead className="font-bold text-slate-700 text-center">Receipt</TableHead>
                    <TableHead className="font-bold text-slate-700">Status</TableHead>
                    <TableHead className="font-bold text-slate-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-40 text-center text-slate-400">
                        No payment records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((p) => (
                      <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{p.user?.firstName} {p.user?.lastName}</span>
                            <span className="text-xs text-slate-500 font-medium">{p.user?.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-black text-primary">₹{p.amount?.toLocaleString()}</span>
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-slate-600">
                          {p.description || 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm font-medium text-slate-500">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-center">
                          {p.screenshotUrl && (
                            <a 
                              href={p.screenshotUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-primary hover:text-white transition-all"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={cn(
                              "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider",
                              p.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-600" :
                              p.status === 'PENDING' ? "bg-amber-500/10 text-amber-600" :
                              "bg-rose-500/10 text-rose-600"
                            )}
                          >
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {p.status === 'COMPLETED' && (
                              <ReceiptDownloadButton payment={p} />
                            )}
                            {p.status === 'PENDING' && (
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-8 w-8 p-0 rounded-lg text-rose-500 border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                                onClick={() => handleStatusUpdate(p.id, 'FAILED')}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                className="h-8 w-8 p-0 rounded-lg bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20"
                                onClick={() => handleStatusUpdate(p.id, 'COMPLETED')}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                            </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
