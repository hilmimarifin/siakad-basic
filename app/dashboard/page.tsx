import { getSession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, GraduationCap, School, DollarSign } from 'lucide-react'

async function getDashboardStats() {
  const [usersResult, studentsResult, classesResult, paymentsResult] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact' }),
    supabase.from('students').select('*', { count: 'exact' }),
    supabase.from('classes').select('*', { count: 'exact' }),
    supabase.from('payments').select('amount').eq('status', 'paid')
  ])

  const totalRevenue = paymentsResult.data?.reduce((sum, payment) => sum + payment.amount, 0) || 0

  return {
    totalUsers: usersResult.count || 0,
    totalStudents: studentsResult.count || 0,
    totalClasses: classesResult.count || 0,
    totalRevenue
  }
}

export default async function DashboardPage() {
  const session = await getSession()
  const stats = await getDashboardStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {session.fullName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active system users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              Active classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From payments received
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {session.role === 'principal' && (
              <>
                <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h4 className="font-medium">Manage Users</h4>
                  <p className="text-sm text-gray-600">Add or edit system users</p>
                </div>
                <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h4 className="font-medium">Manage Classes</h4>
                  <p className="text-sm text-gray-600">Create and assign teachers to classes</p>
                </div>
              </>
            )}
            <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <h4 className="font-medium">Manage Students</h4>
              <p className="text-sm text-gray-600">Add or edit student information</p>
            </div>
            <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <h4 className="font-medium">Payment Tracking</h4>
              <p className="text-sm text-gray-600">Record and view student payments</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>Current system status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">System Status</span>
              <span className="text-sm text-green-600 font-medium">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Your Role</span>
              <span className="text-sm font-medium capitalize">{session.role}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Last Login</span>
              <span className="text-sm text-gray-600">Just now</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}