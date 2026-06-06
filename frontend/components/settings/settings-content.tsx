'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, Bell, Lock, Palette, Database } from 'lucide-react'

export function SettingsContent() {
  const [companyName, setCompanyName] = useState('Tech Solutions Inc.')
  const [email, setEmail] = useState('admin@company.com')
  const [timezone, setTimezone] = useState('UTC')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [interviewReminders, setInterviewReminders] = useState(true)
  const [documentNotifications, setDocumentNotifications] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
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
            <select className="w-full px-3 py-2 border border-border rounded-lg text-foreground">
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
            <select className="w-full px-3 py-2 border border-border rounded-lg text-foreground">
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
          <Button variant="outline" className="w-full justify-start">
            Change Password
          </Button>

          <div className="p-3 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Two-Factor Authentication</p>
            <Button variant="outline" size="sm">
              Enable 2FA
            </Button>
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

      {/* API Keys (placeholder) */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">API Integration</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Manage API keys for third-party integrations
        </p>
        <Button variant="outline">Generate New API Key</Button>
      </Card>

      {/* Save Button */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}
