import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        *,
        student:students(
          full_name,
          student_id,
          class:classes(name)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ message: 'Failed to fetch payments' }, { status: 500 })
    }

    return NextResponse.json(payments)
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
      .insert([{
        student_id,
        amount,
        payment_date,
        month,
        year,
        status,
        notes: notes || null
      }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ message: 'Failed to create payment record' }, { status: 500 })
    }

    return NextResponse.json(payment)
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}