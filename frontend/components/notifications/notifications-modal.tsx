'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Bell, Check, X, Filter, Loader2,
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
  documentId?: string
  paymentId?: string
  slotId?: string
  declineNote?: string
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

// Map notification types to brand colors
const typeConfig: Record<string, { borderColor: string; bgColor: string; iconColor: string; badgeBg: string; badgeText: string }> = {
  INFO:    { borderColor: '#0055A5', bgColor: 'rgba(0,85,165,0.05)',   iconColor: '#0055A5', badgeBg: 'rgba(0,85,165,0.1)',   badgeText: '#0055A5' },
  SUCCESS: { borderColor: '#0b9940', bgColor: 'rgba(11,153,64,0.05)',  iconColor: '#0b9940', badgeBg: 'rgba(11,153,64,0.1)',  badgeText: '#0b9940' },
  WARNING: { borderColor: '#dea306', bgColor: 'rgba(222,163,6,0.05)',  iconColor: '#dea306', badgeBg: 'rgba(222,163,6,0.1)',  badgeText: '#9a7004' },
  ERROR:   { borderColor: '#E1000F', bgColor: 'rgba(225,0,15,0.05)',   iconColor: '#E1000F', badgeBg: 'rgba(225,0,15,0.1)',   badgeText: '#E1000F' },
}

const typeIcons: Record<string, React.ReactNode> = {
  INFO:    <Info className="w-4 h-4" />,
  SUCCESS: <CheckCircle2 className="w-4 h-4" />,
  WARNING: <AlertTriangle className="w-4 h-4" />,
  ERROR:   <AlertCircle className="w-4 h-4" />,
}

// Map stepKey to icon and label
const stepConfig: Record<string, { icon: React.ReactNode; label: string }> = {
  'application':      { icon: <ClipboardList className="w-3 h-3" />, label: 'Application' },
  'document-upload':  { icon: <FileText className="w-3 h-3" />,      label: 'Documents' },
  'payment1':         { icon: <CreditCard className="w-3 h-3" />,    label: 'Payment 1' },
  'payment2':         { icon: <CreditCard className="w-3 h-3" />,    label: 'Payment 2' },
  'payment3':         { icon: <CreditCard className="w-3 h-3" />,    label: 'Payment 3' },
  'hotel':            { icon: <Building2 className="w-3 h-3" />,     label: 'Hotel' },
  'contract':         { icon: <FileText className="w-3 h-3" />,      label: 'Contract' },
  'workpermit':       { icon: <Globe className="w-3 h-3" />,         label: 'Work Permit' },
  'visa':             { icon: <Globe className="w-3 h-3" />,         label: 'Visa' },
  'visapayments':     { icon: <CreditCard className="w-3 h-3" />,    label: 'Visa Payments' },
  'travel':           { icon: <Plane className="w-3 h-3" />,         label: 'Travel' },
}

interface NotificationsModalProps {
  isOpen: boolean
  onClose: () => void
  /** Called when a notification is marked read so header badge updates */
  onUpdate?: () => void
}

function groupByDate(notifications: Notification[]) {
  const groups: Record<string, Notification[]> = {}
  notifications.forEach((n) => {
    const d = new Date(n.createdAt)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let label: string
    if (d.toDateString() === today.toDateString()) label = 'Today'
    else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday'
    else label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

    if (!groups[label]) groups[label] = []
    groups[label].push(n)
  })
  return groups
}

export function NotificationsModal({ isOpen, onClose, onUpdate }: NotificationsModalProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filterUnread, setFilterUnread] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const prevUnreadRef = useRef<number>(0)

  const fetchNotifications = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      else setRefreshing(true)
      const data = await notificationService.getAll()
      const newUnread = (data as Notification[]).filter((n) => !n.isRead).length
      if (silent && newUnread > prevUnreadRef.current) {
        // Play chime for new notifications
        try {
          if (!audioRef.current) {
            audioRef.current = new Audio('/sounds/notification.wav')
            audioRef.current.volume = 0.6
          }
          audioRef.current.currentTime = 0
          audioRef.current.play().catch(() => {})
        } catch {}
      }
      prevUnreadRef.current = newUnread
      setNotifications(data)
    } catch {
      if (!silent) toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen, fetchNotifications])

  const filteredNotifications = filterUnread
    ? notifications.filter((n) => !n.isRead)
    : notifications
  const unreadCount = notifications.filter((n) => !n.isRead).length
  const groupedNotifs = groupByDate(filteredNotifications)

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markRead(id)
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
      onUpdate?.()
    } catch {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!confirm('Mark all as read?')) return
    try {
      await notificationService.markAllRead()
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
      toast.success('All notifications marked as read')
      onUpdate?.()
    } catch {
      toast.error('Failed to mark all as read')
    }
  }

  const handleViewInPortal = async (notification: Notification) => {
    const meta = notification.metadata
    if (!meta?.applicationId) return
    // Mark as read silently
    if (!notification.isRead) {
      await notificationService.markRead(notification.id).catch(() => {})
      setNotifications(notifications.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)))
      onUpdate?.()
    }
    const step = meta.stepKey || ''
    const url = `/admin/applications/${meta.applicationId}?step=${step}`
    router.push(url)
    onClose()
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
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end bg-black/25 backdrop-blur-[2px] p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card
        className="w-full max-w-md h-[calc(100vh-80px)] flex flex-col shadow-2xl border border-[#E8E8E2] rounded-2xl overflow-hidden"
        style={{ animation: 'slideInRight 0.28s cubic-bezier(.25,.8,.25,1) both' }}
      >
        {/* ── Header ─────────────────────────────────────── */}
        <div
          className="px-5 py-4 border-b border-[#E8E8E2] flex items-center justify-between shrink-0"
          style={{ backgroundColor: '#F7F7F2' }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-5 h-5" style={{ color: '#333' }} />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full text-[9px] font-black text-white leading-none"
                  style={{ backgroundColor: '#E1000F' }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#111]">Notifications</h2>
              <p className="text-[10px] text-[#888] mt-0.5 uppercase tracking-wider font-medium">
                {unreadCount} unread &bull; auto-refreshes every 15s
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchNotifications(true)}
              disabled={refreshing}
              className="p-1.5 rounded-full hover:bg-[#EDEDEA] transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#666] ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#EDEDEA] transition-colors"
            >
              <X className="w-4 h-4 text-[#666]" />
            </button>
          </div>
        </div>

        {/* ── Toolbar ────────────────────────────────────── */}
        <div
          className="px-4 py-2.5 border-b border-[#E8E8E2] flex items-center gap-2 shrink-0"
          style={{ backgroundColor: '#FAFAF7' }}
        >
          <button
            onClick={() => setFilterUnread(!filterUnread)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all"
            style={
              filterUnread
                ? { backgroundColor: '#0055A5', color: '#fff' }
                : { backgroundColor: '#EDEDEA', color: '#555' }
            }
          >
            <Filter className="w-3 h-3" />
            {filterUnread ? 'Unread Only' : 'All'}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ml-auto transition-all hover:bg-[#EDEDEA]"
              style={{ color: '#0055A5' }}
            >
              <CheckCheck className="w-3 h-3" />
              Mark all read
            </button>
          )}
        </div>

        {/* ── List ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-[#FAFAF7]">
          {loading ? (
            <div className="p-12 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#0055A5' }} />
              <p className="text-xs text-[#888] animate-pulse">Loading notifications…</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-[#EDEDEA] rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-7 h-7 text-[#CCC]" />
              </div>
              <p className="text-sm font-semibold text-[#333]">
                {filterUnread ? 'All caught up!' : 'No notifications yet'}
              </p>
              <p className="text-xs text-[#888] mt-1">
                {filterUnread
                  ? 'You have read all your notifications.'
                  : 'Student actions will appear here in real-time.'}
              </p>
            </div>
          ) : (
            <div className="py-2">
              {Object.entries(groupedNotifs).map(([dateLabel, notifs]) => (
                <div key={dateLabel}>
                  {/* Date group label */}
                  <div className="px-5 py-2 flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#AAA]">{dateLabel}</span>
                    <div className="flex-1 h-px bg-[#E8E8E2]" />
                  </div>

                  {notifs.map((notification) => {
                    const cfg = typeConfig[notification.type] || typeConfig.INFO
                    const icon = typeIcons[notification.type] || typeIcons.INFO
                    const meta = notification.metadata
                    const step = meta?.stepKey ? stepConfig[meta.stepKey] : null
                    const hasPortalLink = !!meta?.applicationId

                    return (
                      <div
                        key={notification.id}
                        className="mx-3 mb-2 rounded-xl border transition-all duration-200"
                        style={{
                          borderColor: notification.isRead ? '#E8E8E2' : cfg.borderColor,
                          borderLeftWidth: notification.isRead ? '1px' : '3px',
                          backgroundColor: notification.isRead ? '#fff' : cfg.bgColor,
                          opacity: notification.isRead ? 0.75 : 1,
                        }}
                      >
                        <div className="p-3.5">
                          {/* Top row: icon + title + unread dot */}
                          <div className="flex items-start gap-2.5">
                            <div
                              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
                              style={{ backgroundColor: cfg.badgeBg, color: cfg.iconColor }}
                            >
                              {icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-bold text-[#111] leading-tight truncate">
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <span
                                    className="shrink-0 w-2 h-2 rounded-full"
                                    style={{ backgroundColor: cfg.borderColor }}
                                  />
                                )}
                              </div>

                              {/* Student name + step tag */}
                              {(meta?.studentName || step) && (
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  {meta?.studentName && (
                                    <span className="text-[10px] font-bold text-[#555]">
                                      {meta.studentName}
                                    </span>
                                  )}
                                  {step && (
                                    <span
                                      className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                      style={{ backgroundColor: cfg.badgeBg, color: cfg.badgeText }}
                                    >
                                      {step.icon}
                                      {step.label}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Message body */}
                              <p className="text-xs text-[#555] mt-1 leading-relaxed">
                                {notification.message}
                              </p>

                              {/* Amount badge if present */}
                              {meta?.amount && (
                                <div className="mt-1.5">
                                  <span
                                    className="text-[11px] font-black px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: 'rgba(11,153,64,0.1)', color: '#0b9940' }}
                                  >
                                    ₹{meta.amount.toLocaleString()}
                                  </span>
                                </div>
                              )}

                              {/* Footer: time + actions */}
                              <div className="flex items-center justify-between mt-2.5 gap-2">
                                <span className="text-[10px] text-[#AAA] font-medium">
                                  {formatTime(notification.createdAt)}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {!notification.isRead && (
                                    <button
                                      onClick={() => handleMarkRead(notification.id)}
                                      className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full transition-all hover:opacity-80"
                                      style={{ backgroundColor: '#EDEDEA', color: '#555' }}
                                      title="Mark as read"
                                    >
                                      <Check className="w-3 h-3" />
                                      Read
                                    </button>
                                  )}
                                  {hasPortalLink && (
                                    <button
                                      onClick={() => handleViewInPortal(notification)}
                                      className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full transition-all hover:opacity-80"
                                      style={{ backgroundColor: '#0055A5', color: '#fff' }}
                                    >
                                      View in Portal
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────── */}
        <div
          className="px-5 py-3 border-t border-[#E8E8E2] flex items-center justify-between shrink-0"
          style={{ backgroundColor: '#F7F7F2' }}
        >
          <p className="text-[10px] text-[#AAA] font-bold uppercase tracking-widest">
            {notifications.length} Total Notifications
          </p>
          <span
            className="flex items-center gap-1 text-[10px] font-bold"
            style={{ color: '#0b9940' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0b9940] opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0b9940]" />
            </span>
            Live
          </span>
        </div>
      </Card>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
