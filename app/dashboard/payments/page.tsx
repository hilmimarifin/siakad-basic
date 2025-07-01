'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react'

interface Payment {
  id: string
  student_id: string
  amount: number
  payment_date: string
  month: string
  year: number
  status: 'paid' | 'unpaid' | 'partial'
  notes: string | null
  student?: {
    full_name: string
    student_id: string
    class?: {
      name: string
    }
  }
  created_at: string
}

interface Student {
  id: string
  student_id: string
  full_name: string
  class?: {
    name: string
  }
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [formData, setFormData] = useState({
    student_id: '',
    amount: '',
    payment_date: '',
    month: '',
    year: new Date().getFullYear(),
    status: 'paid' as 'paid' | 'unpaid' | 'partial',
    notes: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchPayments()
    fetchStudents()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments')
      if (response.ok) {
        const data = await response.json()
        setPayments(data)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch payments',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error('Failed to fetch students:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingPayment ? `/api/payments/${editingPayment.id}` : '/api/payments'
      const method = editingPayment ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          notes: formData.notes || null
        }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Payment ${editingPayment ? 'updated' : 'recorded'} successfully`,
        })
        setIsDialogOpen(false)
        setEditingPayment(null)
        setFormData({
          student_id: '',
          amount: '',
          payment_date: '',
          month: '',
          year: new Date().getFullYear(),
          status: 'paid',
          notes: ''
        })
        fetchPayments()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.message || 'Something went wrong',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save payment',
        variant: 'destructive',
      })
    }
  }

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment)
    setFormData({
      student_id: payment.student_id,
      amount: payment.amount.toString(),
      payment_date: payment.payment_date,
      month: payment.month,
      year: payment.year,
      status: payment.status,
      notes: payment.notes || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment record?')) return

    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Payment record deleted successfully',
        })
        fetchPayments()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete payment record',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete payment record',
        variant: 'destructive',
      })
    }
  }

  const getStudentPayments = (studentId: string) => {
    return payments.filter(payment => payment.student_id === studentId)
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'unpaid':
        return 'bg-red-100 text-red-800'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600">Track student monthly payments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingPayment(null)
              setFormData({
                student_id: '',
                amount: '',
                payment_date: new Date().toISOString().split('T')[0],
                month: months[new Date().getMonth()],
                year: new Date().getFullYear(),
                status: 'paid',
                notes: ''
              })
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPayment ? 'Edit Payment' : 'Record New Payment'}</DialogTitle>
              <DialogDescription>
                {editingPayment ? 'Update payment information' : 'Record a new student payment'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student_id">Student</Label>
                <Select value={formData.student_id} onValueChange={(value) => 
                  setFormData({ ...formData, student_id: value })
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name} ({student.student_id}) - {student.class?.name || 'No class'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_date">Payment Date</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="month">Month</Label>
                  <Select value={formData.month} onValueChange={(value) => 
                    setFormData({ ...formData, month: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'paid' | 'unpaid' | 'partial') => 
                  setFormData({ ...formData, status: value })
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPayment ? 'Update' : 'Record'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all-payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-payments">All Payments</TabsTrigger>
          <TabsTrigger value="by-student">By Student</TabsTrigger>
        </TabsList>

        <TabsContent value="all-payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Records</CardTitle>
              <CardDescription>
                All payment records in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Month/Year</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.student?.full_name} ({payment.student?.student_id})
                      </TableCell>
                      <TableCell>{payment.student?.class?.name || 'No class'}</TableCell>
                      <TableCell>{payment.month} {payment.year}</TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(payment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(payment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-student">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Select Student</CardTitle>
                <CardDescription>
                  Choose a student to view their payment history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name} ({student.student_id}) - {student.class?.name || 'No class'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedStudent && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>
                    Payment records for {students.find(s => s.id === selectedStudent)?.full_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month/Year</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getStudentPayments(selectedStudent).map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.month} {payment.year}</TableCell>
                          <TableCell>${payment.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(payment.status)}`}>
                              {payment.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(payment.payment_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{payment.notes || '-'}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(payment)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(payment.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {getStudentPayments(selectedStudent).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No payment records found for this student
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}