import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'principal') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { name, grade_level, homeroom_teacher_id } = await request.json()

    const { data: classData, error } = await supabase
      .from('classes')
      .update({
        name,
        grade_level,
        homeroom_teacher_id: homeroom_teacher_id || null
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ message: 'Failed to update class' }, { status: 500 })
    }

    return NextResponse.json(classData)
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
    if (!session || session.role !== 'principal') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ message: 'Failed to delete class' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Class deleted successfully' })
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}