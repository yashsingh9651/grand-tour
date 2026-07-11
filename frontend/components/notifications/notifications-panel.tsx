'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Bell, Check, Loader2,
  Info, CheckCircle2, AlertTriangle, AlertCircle,
  FileText, CreditCard, Building2, ClipboardList,
  Globe, Plane, ArrowRight, CheckCheck, RefreshCw
} from 'lucide-react'
import { notificationService } from '@/lib/services/api.service'
import { toast } from 'sonner'

interface NotificationMetadata {
  applicationId?: string
  stepKey?: string
  studentName?: string
  amount?: number
  paymentType?: string
  documentType?: string
  [key: string]: any
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  createdAt: string
  isRead: boolean
  metadata?: NotificationMetadata
}

const typeConfig: Record<string, { borderColor: string; bgColor: string; iconColor: string; badgeBg: string; badgeText: string }> = {
  INFO:    { borderColor: '#0055A5', bgColor: 'rgba(0,85,165,0.05)',   iconColor: '#0055A5', badgeBg: 'rgba(0,85,165,0.1)',   badgeText: '#0055A5' },
  SUCCESS: { borderColor: '#0b9940', bgColor: 'rgba(11,153,64,0.05)',  iconColor: '#0b9940', badgeBg: 'rgba(11,153,64,0.1)',  badgeText: '#0b9940' },
  WARNING: { borderColor: '#dea306', bgColor: 'rgba(222,163,6,0.05)',  iconColor: '#dea306', badgeBg: 'rgba(222,163,6,0.1)',  badgeText: '#9a7004' },
  ERROR:   { borderColor: '#E1000F', bgColor: 'rgba(225,0,15,0.05)',   iconColor: '#E1000F', badgeBg: 'rgba(225,0,15,0.1)',   badgeText: '#E1000F' },
}

const typeIcons: Record<string, React.ReactNode> = {
  INFO:    <Info className="w-5 h-5" />,
  SUCCESS: <CheckCircle2 className="w-5 h-5" />,
  WARNING: <AlertTriangle className="w-5 h-5" />,
  ERROR:   <AlertCircle className="w-5 h-5" />,
}

const stepConfig: Record<string, { icon: React.ReactNode; label: string }> = {
  'application':     { icon: <ClipboardList className="w-3 h-3" />, label: 'Application' },
  'document-upload': { icon: <FileText className="w-3 h-3" />,      label: 'Documents' },
  'payment1':        { icon: <CreditCard className="w-3 h-3" />,    label: 'Payment 1' },
  'payment2':        { icon: <CreditCard className="w-3 h-3" />,    label: 'Payment 2' },
  'payment3':        { icon: <CreditCard className="w-3 h-3" />,    label: 'Payment 3' },
  'hotel':           { icon: <Building2 className="w-3 h-3" />,     label: 'Hotel' },
  'contract':        { icon: <FileText className="w-3 h-3" />,      label: 'Contract' },
  'workpermit':      { icon: <Globe className="w-3 h-3" />,         label: 'Work Permit' },
  'visa':            { icon: <Globe className="w-3 h-3" />,         label: 'Visa' },
  'visapayments':    { icon: <CreditCard className="w-3 h-3" />,    label: 'Visa Payments' },
  'travel':          { icon: <Plane className="w-3 h-3" />,         label: 'Travel' },
}

export function NotificationsPanel() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const fetchNotifications = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true)
      else setLoading(true)
      const data = await notificationService.getAll()
      setNotifications(data)
    } catch {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.isRead : true))
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markRead(id)
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    } catch { toast.error('Failed to mark as read') }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllRead()
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
      toast.success('All notifications marked as read')
    } catch { toast.error('Failed to mark all as read') }
  }

  const handleViewInPortal = async (notification: Notification) => {
    const meta = notification.metadata
    if (!meta?.applicationId) return
    if (!notification.isRead) {
      await notificationService.markRead(notification.id).catch(() => {})
      setNotifications(notifications.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)))
    }
    router.push(`/admin/applications-portal/${meta.applicationId}`)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
        <div className="flex gap-2 items-center">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
            className="rounded-full px-4"
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            onClick={() => setFilter('unread')}
            size="sm"
            className="rounded-full px-4"
          >
            Unread ({unreadCount})
          </Button>
          <button
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
            className="p-2 rounded-full border border-[#E8E8E2] hover:bg-[#F0F0EA] transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#666] ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            onClick={handleMarkAllAsRead}
            size="sm"
            className="gap-1.5 text-primary hover:bg-primary/5"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {loading ? (
          <Card className="p-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground animate-pulse text-sm">Fetching your notifications…</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground font-medium">
              {filter === 'unread' ? 'All caught up! No unread notifications.' : 'No notifications found.'}
            </p>
          </Card>
        ) : (
          filtered.map((notification) => {
            const cfg = typeConfig[notification.type] || typeConfig.INFO
            const icon = typeIcons[notification.type] || typeIcons.INFO
            const meta = notification.metadata
            const step = meta?.stepKey ? stepConfig[meta.stepKey] : null
            const hasPortalLink = !!meta?.applicationId

            return (
              <Card
                key={notification.id}
                className="p-4 transition-all hover:shadow-md"
                style={{
                  borderLeftWidth: '3px',
                  borderLeftColor: notification.isRead ? 'transparent' : cfg.borderColor,
                  backgroundColor: notification.isRead ? undefined : cfg.bgColor,
                  opacity: notification.isRead ? 0.8 : 1,
                }}
              >
                <div className="flex gap-4 items-start">
                  <div
                    className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: cfg.badgeBg, color: cfg.iconColor }}
                  >
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className={`font-bold text-sm ${notification.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.borderColor }} />
                      )}
                    </div>

                    {/* Student name + step badge */}
                    {(meta?.studentName || step) && (
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        {meta?.studentName && (
                          <span className="text-[11px] font-bold text-foreground/60">{meta.studentName}</span>
                        )}
                        {step && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: cfg.badgeBg, color: cfg.badgeText }}
                          >
                            {step.icon}
                            {step.label}
                          </span>
                        )}
                        {meta?.amount && (
                          <span
                            className="text-[11px] font-black px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: 'rgba(11,153,64,0.1)', color: '#0b9940' }}
                          >
                            ₹{(meta.amount as number).toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-sm text-foreground/75 leading-relaxed mb-2">{notification.message}</p>

                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                        {formatTime(notification.createdAt)}
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkRead(notification.id)}
                            title="Mark as read"
                            className="h-7 px-2 gap-1 text-xs"
                          >
                            <Check className="w-3 h-3" />
                            Mark Read
                          </Button>
                        )}
                        {hasPortalLink && (
                          <Button
                            size="sm"
                            onClick={() => handleViewInPortal(notification)}
                            className="h-7 px-3 gap-1 text-xs"
                            style={{ backgroundColor: '#0055A5' }}
                          >
                            View in Portal
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
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
