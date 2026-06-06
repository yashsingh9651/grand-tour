'use client'

import { useState, useEffect } from 'react'
import { activityService } from '@/lib/services/api.service'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Clock, Loader2, Activity as ActivityIcon, Users, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export function ActivityLogsTable() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const data = await activityService.getRecent()
      setLogs(data)
    } catch (error: any) {
      toast.error('Failed to load activity logs')
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter((log) => {
    const userName = log.application?.user 
      ? `${log.application.user.firstName} ${log.application.user.lastName}`.toLowerCase()
      : 'system'
    
    const matchesSearch =
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.includes(searchTerm.toLowerCase())

    const matchesType = filterType === 'all' || log.type === filterType

    return matchesSearch && matchesType
  })

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="flex-1 min-w-[240px] relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search activity by user or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 border-border h-10 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-background/50 border border-border rounded-xl text-sm font-medium text-foreground h-10 outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          >
            <option value="all">All Event Types</option>
            <option value="STATUS_UPDATE">Status Updates</option>
            <option value="STEP_UPDATE">Workflow Moves</option>
            <option value="PAYMENT_RECEIVED">Payments</option>
          </select>

          <div className="bg-primary/10 text-primary px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">
            {filteredLogs.length} Records
          </div>
        </div>
      </Card>

      <div className="relative">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium animate-pulse">Retrieving audit logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <Card className="p-16 text-center border-dashed bg-transparent">
            <ActivityIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground font-medium italic">No activity found matching your filters</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log, index) => {
              const userName = log.application?.user 
                ? `${log.application.user.firstName} ${log.application.user.lastName}`
                : 'System'
              
              return (
                <Card key={log.id} className="p-5 hover:shadow-xl hover:border-primary/20 transition-all duration-300 group border-border/40">
                  <div className="flex gap-5 items-start">
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                        log.type === 'STATUS_UPDATE' ? 'bg-blue-100 text-blue-600' :
                        log.type === 'STEP_UPDATE' ? 'bg-purple-100 text-purple-600' :
                        'bg-emerald-100 text-emerald-600'
                      }`}>
                        {log.type === 'STATUS_UPDATE' ? <Users className="w-5 h-5" /> :
                         log.type === 'STEP_UPDATE' ? <ArrowRight className="w-5 h-5" /> :
                         <ActivityIcon className="w-5 h-5" />}
                      </div>
                      {index < filteredLogs.length - 1 && (
                        <div className="w-[1px] h-10 bg-gradient-to-b from-border to-transparent mt-3" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-tighter ${
                          log.type === 'STATUS_UPDATE' ? 'bg-blue-50 text-blue-700' :
                          log.type === 'STEP_UPDATE' ? 'bg-purple-50 text-purple-700' :
                          'bg-emerald-50 text-emerald-700'
                        }`}>
                          {log.type.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase">
                          <Clock className="w-3 h-3" />
                          {formatTime(log.createdAt)}
                        </div>
                      </div>

                      <p className="text-sm text-foreground font-semibold mb-1 group-hover:text-primary transition-colors">
                        {log.description}
                      </p>

                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[8px] font-bold">
                          {userName[0]}
                        </div>
                        <span className="text-[11px] font-bold text-muted-foreground tracking-tight">Initiated by {userName}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
