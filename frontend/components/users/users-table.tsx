'use client'

import { useState, useEffect } from 'react'
import { User, UserRole, rolePermissions } from '@/lib/user-data'
import { userService } from '@/lib/services/api.service'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Plus, Trash2, Shield, AlertCircle, Loader2 } from 'lucide-react'

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all')
  const [showPermissions, setShowPermissions] = useState<string | null>(null)
  
  // Add user form state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'team_member' as UserRole
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await userService.getAll()
      // Map backend data to frontend User type
      const mappedUsers: User[] = data.map((u: any) => {
        const normalizedRole = u.role.toLowerCase() as UserRole;
        // Fallback for roles not in frontend enum (like STUDENT or TEAM)
        const role = ['super_admin', 'admin', 'team_member', 'marketing', 'hr'].includes(normalizedRole)
          ? normalizedRole
          : 'team_member';

        return {
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          email: u.email,
          role: role,
          status: 'active',
          joinDate: new Date(u.createdAt),
          avatar: u.profileImage,
        };
      })
      setUsers(mappedUsers)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      const data = await userService.create({
        ...newUser,
        role: newUser.role.toUpperCase()
      })
      
      const mappedNewUser: User = {
        id: data.id,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        role: data.role.toLowerCase() === 'admin' ? 'admin' : 'team_member',
        status: 'active',
        joinDate: new Date(data.createdAt),
      }
      
      setUsers([mappedNewUser, ...users])
      setIsAddOpen(false)
      setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'team_member' })
      toast.success('User added successfully')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.delete(id)
        setUsers(users.filter((u) => u.id !== id))
        toast.success('User deleted successfully')
      } catch (error: any) {
        toast.error(error.message)
      }
    }
  }

  const handleToggleStatus = (id: string) => {
    // Backend doesn't have status yet, just toggle local state for UI
    setUsers(
      users.map((u) =>
        u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
      )
    )
    toast.info('Status toggle is simulated for now')
  }

  const roles: UserRole[] = ['super_admin', 'admin', 'team_member', 'marketing', 'hr']

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = filterRole === 'all' || u.role === filterRole

    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-4">
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as 'all' | UserRole)}
            className="px-3 py-2 border border-border rounded-lg text-sm text-foreground"
          >
            <option value="all">All Roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {rolePermissions[role].name}
              </option>
            ))}
          </select>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" size="sm">
                <Plus className="w-4 h-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new team member with specific permissions.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {rolePermissions[role].name}
                      </option>
                    ))}
                  </select>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Create User'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <p className="text-sm text-muted-foreground whitespace-nowrap">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
          </p>
        </div>
      </Card>

      <div className="space-y-3">
        {loading ? (
          <Card className="p-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground animate-pulse">Loading users...</p>
          </Card>
        ) : filteredUsers.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No users found matching your search.</p>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id}>
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">{user.name}</h4>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">{user.email}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground mb-0.5">Role</p>
                        <p className="font-medium text-foreground">{rolePermissions[user.role].name}</p>
                      </div>

                      {user.department && (
                        <div>
                          <p className="text-muted-foreground mb-0.5">Department</p>
                          <p className="font-medium text-foreground">{user.department}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-muted-foreground mb-0.5">Joined</p>
                        <p className="font-medium text-foreground">
                          {user.joinDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                        </p>
                      </div>

                      {user.phone && (
                        <div>
                          <p className="text-muted-foreground mb-0.5">Phone</p>
                          <p className="font-medium text-foreground text-xs">{user.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setShowPermissions(showPermissions === user.id ? null : user.id)
                      }
                      className="gap-1"
                    >
                      <Shield className="w-3 h-3" />
                      Permissions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(user.id)}
                    >
                      {user.status === 'active' ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>

              {showPermissions === user.id && (
                <Card className="p-4 mt-2 bg-secondary rounded-t-none">
                  <div>
                    <h5 className="font-semibold text-sm text-foreground mb-3">
                      {rolePermissions[user.role].name} Permissions
                    </h5>
                    <p className="text-xs text-muted-foreground mb-3">
                      {rolePermissions[user.role].description}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {rolePermissions[user.role].permissions.map((perm) => (
                        <div key={perm} className="flex items-start gap-2">
                          <AlertCircle className="w-3 h-3 mt-0.5 text-primary flex-shrink-0" />
                          <span className="text-xs text-foreground">{perm}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
