'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Building2, 
  MapPin, 
  FileText, 
  Plus, 
  Search, 
  MoreVertical, 
  Calendar as CalendarIcon,
  User,
  CheckCircle2,
  Clock,
  ExternalLink,
  Trash2,
  Loader2
} from 'lucide-react'
import { hotelService, uploadService } from '@/lib/services/api.service'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, addDays } from 'date-fns'

export default function HotelsAdminPage() {
  const [hotels, setHotels] = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  
  // New Hotel State
  const [newHotel, setNewHotel] = useState({
    name: '',
    location: '',
    proposalPdf: ''
  })
  const [uploading, setUploading] = useState(false)

  // Assignment State
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [assignmentData, setAssignmentData] = useState({
    hotelId: '',
    checkIn: format(new Date(), 'yyyy-MM-dd'),
    checkOut: format(addDays(new Date(), 7), 'yyyy-MM-dd')
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [hotelsData, candidatesData] = await Promise.all([
        hotelService.getAll(),
        hotelService.getCandidates()
      ])
      setHotels(hotelsData)
      setCandidates(candidatesData)
    } catch (error) {
      console.error('Failed to fetch hotels/candidates', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateHotel = async () => {
    if (!newHotel.name || !newHotel.location || !newHotel.proposalPdf) {
      toast.error('Please fill all fields and upload proposal')
      return
    }

    try {
      await hotelService.create(newHotel)
      toast.success('Hotel added successfully')
      setIsAddDialogOpen(false)
      setNewHotel({ name: '', location: '', proposalPdf: '' })
      fetchData()
    } catch (error) {
      toast.error('Failed to add hotel')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const result = await uploadService.upload(file)
      setNewHotel(prev => ({ ...prev, proposalPdf: result.url }))
      toast.success('Proposal uploaded successfully')
    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleAssignHotel = async () => {
    if (!assignmentData.hotelId || !assignmentData.checkIn || !assignmentData.checkOut) {
      toast.error('Please fill all assignment details')
      return
    }

    const checkInDateObj = new Date(assignmentData.checkIn)
    const checkOutDateObj = new Date(assignmentData.checkOut)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkInDateObj < today) {
      toast.error('Check-in date cannot be in the past')
      return
    }

    if (checkOutDateObj < checkInDateObj) {
      toast.error('Check-out date cannot be earlier than check-in date')
      return
    }

    try {
      await hotelService.assign({
        hotelId: assignmentData.hotelId,
        applicationId: selectedCandidate.id,
        checkIn: assignmentData.checkIn,
        checkOut: assignmentData.checkOut
      })
      toast.success('Hotel assigned successfully')
      setIsAssignDialogOpen(false)
      fetchData()
    } catch (error) {
      toast.error('Failed to assign hotel')
    }
  }

  const handleDeleteHotel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hotel?')) return
    try {
      await hotelService.delete(id)
      toast.success('Hotel deleted')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete hotel')
    }
  }

  const filteredHotels = hotels.filter(h => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="flex-1 p-3 md:p-4 lg:p-5 lg:ml-64">
        <Header
          title="Hotel Management"
          description="Manage hotels and assign them to candidates"
          actions={
            <div className="flex gap-2">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Hotel
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Hotel</DialogTitle>
                    <DialogDescription>Enter hotel details and upload the proposal PDF.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Hotel Name</Label>
                      <Input 
                        placeholder="e.g. Hilton Garden Inn" 
                        value={newHotel.name}
                        onChange={e => setNewHotel(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input 
                        placeholder="e.g. London, UK" 
                        value={newHotel.location}
                        onChange={e => setNewHotel(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Proposal PDF</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="file" 
                          accept=".pdf"
                          onChange={handleFileUpload}
                          disabled={uploading}
                        />
                        {uploading && <Loader2 className="w-4 h-4 animate-spin self-center" />}
                      </div>
                      {newHotel.proposalPdf && (
                        <p className="text-xs text-success flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> File uploaded
                        </p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateHotel} disabled={uploading}>Create Hotel</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          }
        />

        <Tabs defaultValue="hotels" className="mt-6">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="hotels">Hotel List</TabsTrigger>
            <TabsTrigger value="assignments">Pending Assignments ({candidates.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="hotels" className="space-y-4 mt-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search hotels..." 
                className="pl-10"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : filteredHotels.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No hotels found</h3>
                <p className="text-muted-foreground">Add your first hotel to get started.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredHotels.map(hotel => (
                  <Card key={hotel.id} className="p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteHotel(hotel.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <h3 className="text-lg font-bold">{hotel.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {hotel.location}
                    </div>
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-medium bg-secondary/50 px-2 py-1 rounded-full">
                        <User className="w-3 h-3" />
                        {hotel._count?.assignments || 0} Assigned
                      </div>
                      <a 
                        href={hotel.proposalPdf} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-xs flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        View Proposal
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="assignments" className="mt-4">
            {candidates.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium">All caught up!</h3>
                <p className="text-muted-foreground">No candidates are currently waiting for hotel assignment.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {candidates.map(candidate => (
                  <Card key={candidate.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {candidate.user.firstName[0]}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{candidate.user.firstName} {candidate.user.lastName}</h4>
                        <p className="text-xs text-muted-foreground">{candidate.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        <Clock className="w-3.5 h-3.5" />
                        Awaiting Assignment
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => {
                          setSelectedCandidate(candidate)
                          setIsAssignDialogOpen(true)
                        }}
                      >
                        Assign Hotel
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Assignment Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Hotel to {selectedCandidate?.user.firstName}</DialogTitle>
              <DialogDescription>Select a hotel and set the stay duration.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Hotel</Label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={assignmentData.hotelId}
                  onChange={e => setAssignmentData(prev => ({ ...prev, hotelId: e.target.value }))}
                >
                  <option value="">Choose a hotel...</option>
                  {hotels.map(h => (
                    <option key={h.id} value={h.id}>{h.name} - {h.location}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Check-in Date</Label>
                  <Input 
                    type="date" 
                    value={assignmentData.checkIn}
                    onChange={e => setAssignmentData(prev => ({ ...prev, checkIn: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Check-out Date</Label>
                  <Input 
                    type="date" 
                    value={assignmentData.checkOut}
                    onChange={e => setAssignmentData(prev => ({ ...prev, checkOut: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => handleAssignHotel()}>Confirm Assignment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
