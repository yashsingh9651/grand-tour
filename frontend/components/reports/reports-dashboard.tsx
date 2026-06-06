'use client'

import { useState, useEffect } from 'react'
import { analyticsService } from '@/lib/services/api.service'
import { Card } from '@/components/ui/card'
import { Loader2, TrendingUp, Users, DollarSign, Target } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { toast } from 'sonner'

export function ReportsDashboard() {
  const [data, setData] = useState<any>(null)
  const [workflowStats, setWorkflowStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportsData()
  }, [])

  const fetchReportsData = async () => {
    try {
      setLoading(true)
      const [dashData, wfStats] = await Promise.all([
        analyticsService.getDashboard(),
        analyticsService.getWorkflow()
      ])
      setData(dashData)
      
      // Map workflow stats for Pie chart
      const mappedWfStats = wfStats.map((s: any) => ({
        name: s.status,
        value: s.count,
        fill: s.status === 'ACCEPTED' ? '#10b981' : s.status === 'REJECTED' ? '#ef4444' : '#fbbf24'
      }))
      setWorkflowStats(mappedWfStats)
    } catch (error: any) {
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">Generating analytics reports...</p>
      </div>
    )
  }

  const { stats } = data

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border-l-4 border-l-primary hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Candidates</p>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.totalCandidates}</p>
          <div className="flex items-center gap-1 text-[10px] text-green-600 mt-2 font-bold">
            <TrendingUp className="w-3 h-3" />
            <span>+12% vs last month</span>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-orange-500 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Target className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Conversion Rate</p>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.conversionRate}%</p>
          <p className="text-[10px] text-muted-foreground mt-2">Applied to Approved</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-green-500 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Revenue</p>
          </div>
          <p className="text-3xl font-bold text-foreground">${stats.totalRevenue.toLocaleString()}</p>
          <p className="text-[10px] text-green-600 mt-2 font-bold">From completed payments</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-blue-500 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Review</p>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.pendingApplications}</p>
          <p className="text-[10px] text-orange-500 mt-2 font-bold">Awaiting your action</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidate Status Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              Status Distribution
              <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Real-time</span>
            </h3>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center">
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={workflowStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {workflowStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-48 space-y-4">
              {workflowStats.map((s: any) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.fill }} />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-tighter">{s.name}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Pipeline Analytics Card */}
        <Card className="p-6">
          <h3 className="font-bold text-foreground mb-6 uppercase tracking-wider text-sm">Pipeline Performance</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-muted-foreground uppercase">Initial Conversion</span>
                <span className="text-sm font-bold text-primary">{Math.round(stats.conversionRate * 1.2)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div className="bg-primary rounded-full h-3 transition-all duration-1000 shadow-sm" style={{ width: `${Math.min(100, stats.conversionRate * 1.2)}%` }} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-muted-foreground uppercase">Interview Turnaround</span>
                <span className="text-sm font-bold text-blue-500">85%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div className="bg-blue-500 rounded-full h-3 transition-all duration-1000 shadow-sm" style={{ width: '85%' }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="p-4 bg-primary/5 rounded-2xl">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Avg Score</p>
                <p className="text-2xl font-bold text-foreground">8.4</p>
              </div>
              <div className="p-4 bg-green-50 rounded-2xl">
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Success Rate</p>
                <p className="text-2xl font-bold text-foreground">{stats.conversionRate}%</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
