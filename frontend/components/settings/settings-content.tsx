'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, Bell, Lock, Palette, Database, ShieldCheck, Loader2, Copy, Key, QrCode, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { applicationPageContentService } from '@/lib/services/api.service'
import { toast } from 'sonner'
import apiClient from '@/lib/api-client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export function SettingsContent() {
  const [companyName, setCompanyName] = useState('Tech Solutions Inc.')
  const [email, setEmail] = useState('admin@company.com')
  const [timezone, setTimezone] = useState('UTC')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [interviewReminders, setInterviewReminders] = useState(true)
  const [documentNotifications, setDocumentNotifications] = useState(true)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Change Password state
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  // 2FA state
  const [twoFactorOpen, setTwoFactorOpen] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [verifying2FA, setVerifying2FA] = useState(false)

  // API Key state
  const [apiKeyOpen, setApiKeyOpen] = useState(false)
  const [generatedKey, setGeneratedKey] = useState('')
  const [copiedKey, setCopiedKey] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long')
      return
    }
    try {
      setChangingPassword(true)
      await apiClient.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      })
      toast.success('Password updated successfully')
      setChangePasswordOpen(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update password'
      toast.error(msg)
    } finally {
      setChangingPassword(false)
    }
  }

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    if (twoFactorCode.length !== 6) {
      toast.error('Please enter a 6-digit code')
      return
    }
    try {
      setVerifying2FA(true)
      // Simulate verification delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setTwoFactorEnabled(true)
      toast.success('Two-factor authentication enabled!')
      setTwoFactorOpen(false)
      setTwoFactorCode('')
    } catch {
      toast.error('Invalid verification code')
    } finally {
      setVerifying2FA(false)
    }
  }

  const handleGenerateApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let token = ''
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setGeneratedKey(`gt_live_2026_${token}`)
    setApiKeyOpen(true)
    setCopiedKey(false)
  }

  const handleCopyKey = () => {
    navigator.clipboard.writeText(generatedKey)
    setCopiedKey(true)
    toast.success('API Key copied to clipboard')
  }

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true)
        const response = await applicationPageContentService.get('general_settings')
        if (response && Array.isArray(response.blocks)) {
          const nameBlock = response.blocks.find((b: any) => b.key === 'companyName')
          const emailBlock = response.blocks.find((b: any) => b.key === 'email')
          const tzBlock = response.blocks.find((b: any) => b.key === 'timezone')
          const emailNotifBlock = response.blocks.find((b: any) => b.key === 'emailNotifications')
          const interviewRemBlock = response.blocks.find((b: any) => b.key === 'interviewReminders')
          const docNotifBlock = response.blocks.find((b: any) => b.key === 'documentNotifications')

          if (nameBlock) setCompanyName(nameBlock.value)
          if (emailBlock) setEmail(emailBlock.value)
          if (tzBlock) setTimezone(tzBlock.value)
          if (emailNotifBlock) setEmailNotifications(emailNotifBlock.value)
          if (interviewRemBlock) setInterviewReminders(interviewRemBlock.value)
          if (docNotifBlock) setDocumentNotifications(docNotifBlock.value)
        }
      } catch (err: any) {
        console.error('Failed to load settings:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      const data = {
        title: 'General Settings',
        subtitle: 'System Configuration',
        blocks: [
          { key: 'companyName', value: companyName },
          { key: 'email', value: email },
          { key: 'timezone', value: timezone },
          { key: 'emailNotifications', value: emailNotifications },
          { key: 'interviewReminders', value: interviewReminders },
          { key: 'documentNotifications', value: documentNotifications }
        ]
      }
      await applicationPageContentService.update('general_settings', data)
      setSaved(true)
      toast.success('Settings saved successfully!')
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">Loading system settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {saved && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium">Settings saved successfully!</p>
        </div>
      )}

      {/* General Settings */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          General Settings
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Company Name</label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your company name"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Admin Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@company.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Timezone</label>
            <select 
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-foreground bg-background"
            >
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="EST">EST (Eastern Standard Time)</option>
              <option value="CST">CST (Central Standard Time)</option>
              <option value="MST">MST (Mountain Standard Time)</option>
              <option value="PST">PST (Pacific Standard Time)</option>
              <option value="GMT">GMT (Greenwich Mean Time)</option>
              <option value="CET">CET (Central European Time)</option>
              <option value="IST">IST (Indian Standard Time)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Settings
        </h3>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive email updates on candidate actions</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={interviewReminders}
              onChange={(e) => setInterviewReminders(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Interview Reminders</p>
              <p className="text-xs text-muted-foreground">Get notifications before scheduled interviews</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={documentNotifications}
              onChange={(e) => setDocumentNotifications(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Document Notifications</p>
              <p className="text-xs text-muted-foreground">Alert when new documents are uploaded</p>
            </div>
          </label>
        </div>
      </Card>

      {/* Workflow Defaults */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Workflow Defaults
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Default Email Template</label>
            <select className="w-full px-3 py-2 border border-border rounded-lg text-foreground bg-background">
              <option value="generic">Generic Welcome Template</option>
              <option value="sales">Sales Process Template</option>
              <option value="hiring">Hiring Process Template</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Default Interview Duration (minutes)</label>
            <Input type="number" defaultValue="60" min="15" max="480" step="15" />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Candidate Response Deadline (days)</label>
            <Input type="number" defaultValue="7" min="1" max="30" />
          </div>
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Security Settings
        </h3>

        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-start" onClick={() => setChangePasswordOpen(true)}>
            Change Password
          </Button>

          <div className="p-3 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Two-Factor Authentication</p>
            {twoFactorEnabled ? (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">2FA Enabled</span>
                <Button variant="outline" size="sm" onClick={() => setTwoFactorEnabled(false)}>
                  Disable
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setTwoFactorOpen(true)}>
                Enable 2FA
              </Button>
            )}
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium text-foreground mb-3">Active Sessions</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-secondary rounded">
                <div>
                  <p className="text-xs font-medium text-foreground">Current Session</p>
                  <p className="text-xs text-muted-foreground">Last active: just now</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Active</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Access Control (Roles & Permissions) */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          Access Control
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Configure feature permissions and access rights for different administrative roles.
        </p>
        <Link href="/admin/settings/roles">
          <Button variant="outline">Manage Role Permissions</Button>
        </Link>
      </Card>

      {/* API Keys */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Key className="w-5 h-5" />
          API Integration
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Manage API keys for third-party integrations
        </p>
        <Button variant="outline" onClick={handleGenerateApiKey}>Generate New API Key</Button>
      </Card>

      {/* Save Button */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings
        </Button>
      </div>

      {/* Dialog Modals */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Update your password to secure your account.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setChangePasswordOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={changingPassword}>
                {changingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Update Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={twoFactorOpen} onOpenChange={setTwoFactorOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Two-Factor Authentication Setup</DialogTitle>
            <DialogDescription>Scan the QR code with your authenticator app to get verification codes.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleVerify2FA} className="space-y-4 text-center flex flex-col items-center">
            <div className="p-4 bg-slate-100 rounded-xl flex items-center justify-center border border-dashed border-slate-300 w-40 h-40">
              <QrCode className="w-32 h-32 text-slate-700" />
            </div>
            <div className="text-left w-full space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Secret Key</p>
              <p className="text-sm font-mono font-bold text-slate-800 break-all select-all">GT-2FA-ABCD-EFGH</p>
            </div>
            <div className="text-left w-full space-y-1.5">
              <Label htmlFor="twoFactorCode">6-Digit Verification Code</Label>
              <Input
                id="twoFactorCode"
                type="text"
                maxLength={6}
                placeholder="000000"
                required
                className="text-center text-lg font-bold tracking-[0.25em]"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <DialogFooter className="w-full pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setTwoFactorOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={verifying2FA} className="flex-1">
                {verifying2FA ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Verify & Enable
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={apiKeyOpen} onOpenChange={setApiKeyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generated API Key</DialogTitle>
            <DialogDescription>Copy this key and save it securely. It will not be shown again.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2 items-center">
              <Input
                readOnly
                className="font-mono text-xs select-all flex-1 h-11 bg-slate-50 border-slate-200"
                value={generatedKey}
              />
              <Button size="icon" className="h-11 w-11 shrink-0" onClick={handleCopyKey}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-lg border border-amber-200 flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
              <p>For security, keep this token private and do not share it in open source repositories.</p>
            </div>
            <DialogFooter>
              <Button className="w-full" onClick={() => setApiKeyOpen(false)}>
                Done
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
