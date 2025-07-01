import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session || !['admin', 'principal', 'teacher'].includes(session.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { 
      student_id, 
      amount, 
      payment_date, 
      month, 
      year, 
      status, 
      notes 
    } = await request.json()

    const { data: payment, error } = await supabase
      .from('payments')
      .update({
        student_id,
        amount,
        payment_date,
        month,
        year,
        status,
        notes: notes || null
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ message: 'Failed to update payment record' }, { status: 500 })
    }

    return NextResponse.json(payment)
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session || !['admin', 'principal', 'teacher'].includes(session.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ message: 'Failed to delete payment record' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Payment record deleted successfully' })
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}