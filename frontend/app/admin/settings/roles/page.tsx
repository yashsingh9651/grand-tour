"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/layout-wrapper"
import { Header } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { permissionService } from "@/lib/services/api.service"
import { toast } from "sonner"
import { Loader2, ShieldCheck, CheckCircle2 } from "lucide-react"

const AVAILABLE_FEATURES = [
  { id: "dashboard", name: "Dashboard Summary" },
  { id: "search", name: "Global Search" },
  { id: "workflows", name: "Workflow Management" },
  { id: "candidates", name: "Candidate Pipeline" },
  { id: "interviews", name: "Interview Scheduling" },
  { id: "documents", name: "Document Management" },
  { id: "users", name: "User Management" },
  { id: "reports", name: "Analytics & Reports" },
  { id: "activity", name: "Activity Logs" },
  { id: "notifications", name: "Notifications" },
  { id: "settings", name: "General Settings" },
]

const ROLES_TO_MANAGE = ["ADMIN", "HR", "TEAM_MEMBER", "TEAM", "MARKETING"]

export default function RolesAccessPage() {
  const [permissions, setPermissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetchPermissions()
  }, [])

  const fetchPermissions = async () => {
    try {
      setLoading(true)
      const data = await permissionService.getAll()
      setPermissions(data)
    } catch (error) {
      toast.error("Failed to load role permissions")
    } finally {
      setLoading(false)
    }
  }

  const toggleFeature = async (role: string, featureId: string) => {
    const rolePermission = permissions.find((p) => p.role === role)
    const currentFeatures = rolePermission?.features || []
    
    let newFeatures: string[]
    if (currentFeatures.includes(featureId)) {
      newFeatures = currentFeatures.filter((f: string) => f !== featureId)
    } else {
      newFeatures = [...currentFeatures, featureId]
    }

    try {
      setSaving(role)
      await permissionService.update(role, newFeatures)
      
      // Update local state
      setPermissions(prev => {
        const index = prev.findIndex(p => p.role === role)
        if (index === -1) {
          return [...prev, { role, features: newFeatures }]
        }
        const updated = [...prev]
        updated[index] = { ...updated[index], features: newFeatures }
        return updated
      })
      
      toast.success(`Updated access for ${role}`)
    } catch (error) {
      toast.error("Failed to update permission")
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading access control list...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Header 
          title="Role Access Control" 
          description="Manage which features each administrative role can access" 
          actions={
            <Button variant="outline" size="sm" onClick={fetchPermissions} className="rounded-xl">
              Refresh Data
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ROLES_TO_MANAGE.map((role) => {
            const rolePermission = permissions.find((p) => p.role === role)
            const roleFeatures = rolePermission?.features || []
            
            return (
              <Card key={role} className="flex flex-col overflow-hidden border-border/50 hover:shadow-xl transition-all duration-500 group">
                <div className="p-4 bg-secondary/30 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <h3 className="font-bold text-foreground tracking-tight">{role}</h3>
                  </div>
                  {saving === role && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                </div>
                
                <div className="p-4 space-y-4 flex-1">
                  {AVAILABLE_FEATURES.map((feature) => (
                    <div key={feature.id} className="flex items-center justify-between group/item">
                      <label 
                        htmlFor={`${role}-${feature.id}`} 
                        className="text-xs font-medium text-muted-foreground group-hover/item:text-foreground transition-colors cursor-pointer"
                      >
                        {feature.name}
                      </label>
                      <Switch
                        id={`${role}-${feature.id}`}
                        checked={roleFeatures.includes(feature.id)}
                        onCheckedChange={() => toggleFeature(role, feature.id)}
                        disabled={saving === role}
                      />
                    </div>
                  ))}
                </div>
                
                <div className="p-3 bg-secondary/10 border-t border-border mt-auto">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest text-center">
                    {roleFeatures.length} Features Active
                  </p>
                </div>
              </Card>
            )
          })}
          
          {/* Super Admin Info Card */}
          <Card className="flex flex-col overflow-hidden border-primary/20 bg-primary/5">
             <div className="p-4 bg-primary text-primary-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <h3 className="font-bold tracking-tight">SUPER_ADMIN</h3>
              </div>
              <div className="p-6 flex flex-col items-center justify-center gap-4 flex-1 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Full Access Enabled</p>
                  <p className="text-xs text-muted-foreground mt-1 px-4">
                    Super admins have hardcoded access to all current and future system features for security and maintenance.
                  </p>
                </div>
              </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
