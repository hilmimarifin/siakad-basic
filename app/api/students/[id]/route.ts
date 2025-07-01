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
      full_name, 
      date_of_birth, 
      gender, 
      address, 
      phone, 
      parent_name, 
      parent_phone, 
      class_id 
    } = await request.json()

    const { data: student, error } = await supabase
      .from('students')
      .update({
        student_id,
        full_name,
        date_of_birth,
        gender,
        address,
        phone: phone || null,
        parent_name,
        parent_phone,
        class_id: class_id || null
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ message: 'Failed to update student' }, { status: 500 })
    }

    return NextResponse.json(student)
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
      .from('students')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ message: 'Failed to delete student' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Student deleted successfully' })
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}