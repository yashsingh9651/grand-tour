'use client'

import { useState, useEffect } from 'react'
import { StudentLayout } from '@/components/student/student-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { applicationService } from '@/lib/services/api.service'
import { Mail, Phone, MapPin, GraduationCap, Calendar, Loader2, User as UserIcon, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { signOut } from 'next-auth/react'

export default function ProfilePage() {
  const [application, setApplication] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await applicationService.getMy()
        setApplication(data)
      } catch (error: any) {
        toast.error('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!application) {
    return (
      <StudentLayout currentStep={application?.currentStepId}>
        <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
          <h1 className="text-2xl font-bold">Profile Not Available</h1>
          <p className="text-muted-foreground">Please complete your application first.</p>
        </div>
      </StudentLayout>
    )
  }

  const user = application.user

  return (
    <StudentLayout currentStep={application.currentStepId}>
      <div className="max-w-4xl space-y-6 text-foreground">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">View and manage your profile information</p>
        </div>

        {/* Profile Header */}
        <Card className="p-4 sm:p-6 lg:p-8 border border-border bg-card">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6 flex-1 w-full min-w-0">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.firstName} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-primary/20 shrink-0" />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 rounded-full flex items-center justify-center shrink-0 border border-primary/30">
                  <span className="text-2xl sm:text-4xl font-bold text-primary">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">{user.firstName} {user.lastName}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{application.department || 'Student'} • {application.currentYear || 'N/A'}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">{application.collegeName || 'Grand Tour Student'}</p>
              </div>
            </div>
          </div>
        </Card>


        {/* Contact Information */}
        <Card className="p-6 border border-border bg-card">
          <h2 className="text-lg font-semibold mb-6">Contact Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Email</p>
                <a href={`mailto:${user.email}`} className="text-foreground hover:underline truncate">
                  {user.email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase">WhatsApp</p>
                <p className="text-foreground">{user.whatsapp || application.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Address</p>
                <p className="text-foreground">{user.address || 'N/A'}, {user.city || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Date of Birth</p>
                <p className="text-foreground">{user.dateOfBirth || 'N/A'}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Educational Information */}
        <Card className="p-6 border border-border bg-card">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Educational Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">College Name</label>
              <p className="text-foreground font-medium mt-2">{application.collegeName || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Department</label>
              <p className="text-foreground font-medium mt-2">{application.department || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Course</label>
              <p className="text-foreground font-medium mt-2">{application.course || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Current Year</label>
              <p className="text-foreground font-medium mt-2">{application.currentYear || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">University</label>
              <p className="text-foreground font-medium mt-2">{application.universityName || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">TPO Name</label>
              <p className="text-foreground font-medium mt-2">{application.tpoName || 'N/A'}</p>
            </div>
          </div>
        </Card>

        {/* Internship Details */}
        <Card className="p-6 border border-border bg-card">
          <h2 className="text-lg font-semibold mb-6">Internship Details</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Start Date</label>
              <p className="text-foreground font-medium mt-2">{application.internshipStartDate || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">End Date</label>
              <p className="text-foreground font-medium mt-2">{application.internshipEndDate || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Duration</label>
              <p className="text-foreground font-medium mt-2">{application.duration || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Application Status</label>
              <p className="text-foreground font-medium mt-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  application.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 
                  application.status === 'REJECTED' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 
                  'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                }`}>{application.status}</span>
              </p>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button variant="outline" className="border-border text-foreground hover:bg-muted" onClick={() => window.print()}>Download Profile PDF</Button>
          <Button 
            variant="ghost" 
            className="text-destructive hover:bg-destructive/10 gap-2" 
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </StudentLayout>
  )
}
