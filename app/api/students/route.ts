import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { data: students, error } = await supabase
      .from('students')
      .select(`
        *,
        class:classes(name)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ message: 'Failed to fetch students' }, { status: 500 })
    }

    return NextResponse.json(students)
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
      .insert([{
        student_id,
        full_name,
        date_of_birth,
        gender,
        address,
        phone: phone || null,
        parent_name,
        parent_phone,
        class_id: class_id || null
      }])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Student ID already exists' }, { status: 400 })
      }
      return NextResponse.json({ message: 'Failed to create student' }, { status: 500 })
    }

    return NextResponse.json(student)
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}