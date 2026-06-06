'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, Check, Archive, Trash2, X, Filter, Loader2, Info, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react'
import { notificationService } from '@/lib/services/api.service'
import { toast } from 'sonner'

interface Notification {
  id: string
  title: string
  message: string
  type: string // e.g., "INFO", "SUCCESS", "WARNING", "ERROR"
  createdAt: string
  isRead: boolean
}

const typeStyles: Record<string, string> = {
  INFO: 'bg-blue-50 border-l-4 border-blue-500',
  SUCCESS: 'bg-green-50 border-l-4 border-green-500',
  WARNING: 'bg-yellow-50 border-l-4 border-yellow-500',
  ERROR: 'bg-red-50 border-l-4 border-red-500',
}

const typeIcons: Record<string, any> = {
  INFO: <Info className="w-4 h-4 text-blue-500" />,
  SUCCESS: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  WARNING: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
  ERROR: <AlertCircle className="w-4 h-4 text-red-500" />,
}

interface NotificationsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filterUnread, setFilterUnread] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

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

  const filteredNotifications = filterUnread
    ? notifications.filter((n) => !n.isRead)
    : notifications

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markRead(id)
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }

  const handleClearAll = async () => {
    if (confirm('Mark all as read?')) {
      try {
        await notificationService.markAllRead()
        setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      } catch (error) {
        toast.error('Failed to clear notifications')
      }
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
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-300">
      <Card className="w-full max-w-md h-[calc(100vh-100px)] flex flex-col shadow-2xl border-border animate-in slide-in-from-right-8 duration-300">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-card rounded-t-xl">
          <div>
            <h2 className="font-bold text-foreground flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h2>
            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Real-time alerts</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-secondary">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Filter */}
        <div className="p-3 border-b border-border flex gap-2 bg-secondary/10">
          <Button
            variant={filterUnread ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterUnread(!filterUnread)}
            className="gap-1.5 text-xs h-8"
          >
            <Filter className="w-3.5 h-3.5" />
            {filterUnread ? 'Showing Unread' : 'Filter Unread'}
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-xs ml-auto h-8 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto bg-card/50">
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground animate-pulse">Syncing notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-muted-foreground opacity-30" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {filterUnread ? 'All caught up!' : 'No notifications yet'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {filterUnread ? 'You have read all your notifications.' : 'We will alert you when something important happens.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 p-4">
              {filteredNotifications.map((notification) => {
                const styleClass = typeStyles[notification.type] || typeStyles.INFO
                const icon = typeIcons[notification.type] || typeIcons.INFO
                return (
                  <div 
                    key={notification.id} 
                    className={`p-3 rounded-xl border border-transparent transition-all hover:shadow-sm ${styleClass} ${notification.isRead ? 'opacity-70 border-border bg-card' : 'shadow-md border-primary/10'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="mt-0.5">{icon}</div>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${notification.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-[10px] font-medium text-muted-foreground/60">
                            {formatTime(notification.createdAt)}
                          </p>
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkRead(notification.id)}
                              className="h-6 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary/10 px-2"
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border text-center bg-card rounded-b-xl">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
            {notifications.length} Total Notifications
          </p>
        </div>
      </Card>
    </div>
  )
}
