'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, Check, Trash2, X, Loader2, Info, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react'
import { notificationService } from '@/lib/services/api.service'
import { toast } from 'sonner'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  createdAt: string
  isRead: boolean
}

const typeStyles: Record<string, string> = {
  INFO: 'bg-blue-50 border-blue-200 text-blue-800',
  SUCCESS: 'bg-green-50 border-green-200 text-green-800',
  WARNING: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  ERROR: 'bg-red-50 border-red-200 text-red-800',
}

const typeIcons: Record<string, any> = {
  INFO: <Info className="w-5 h-5 text-blue-500" />,
  SUCCESS: <CheckCircle2 className="w-5 h-5 text-green-500" />,
  WARNING: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  ERROR: <AlertCircle className="w-5 h-5 text-red-500" />,
}

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await notificationService.getAll()
      setNotifications(data)
    } catch (error: any) {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.isRead : true))
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markRead(id)
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllRead()
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to clear notifications')
    }
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
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
            className="rounded-full px-4"
          >
            All Notifications ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            onClick={() => setFilter('unread')}
            size="sm"
            className="rounded-full px-4"
          >
            Unread ({unreadCount})
          </Button>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" onClick={handleMarkAllAsRead} size="sm" className="text-primary hover:bg-primary/5">
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <Card className="p-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground animate-pulse">Fetching your notifications...</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground font-medium">
              {filter === 'unread' ? 'You have no unread notifications' : 'No notifications found'}
            </p>
          </Card>
        ) : (
          filtered.map((notification) => {
            const styleClass = typeStyles[notification.type] || typeStyles.INFO
            const icon = typeIcons[notification.type] || typeIcons.INFO
            return (
              <Card
                key={notification.id}
                className={`p-4 border-l-4 transition-all hover:shadow-md border-transparent ${
                  notification.isRead ? 'bg-card opacity-80' : `shadow-sm ${styleClass}`
                }`}
              >
                <div className="flex gap-4 items-start">
                  <div className="shrink-0 mt-1">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-bold text-sm ${notification.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                    <p className="text-sm text-foreground/80 mb-2 leading-relaxed">{notification.message}</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                      <span>{formatTime(notification.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex gap-1 flex-shrink-0">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkRead(notification.id)}
                        title="Mark as read"
                        className="h-8 w-8 p-0"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
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
