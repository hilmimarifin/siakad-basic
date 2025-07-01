import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
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

    const { email, password, role, full_name } = await request.json()
    const updateData: any = { email, role, full_name }

    // Only hash and update password if provided
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 12)
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ message: 'Failed to update user' }, { status: 500 })
    }

    return NextResponse.json(user)
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
      .from('users')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ message: 'Failed to delete user' }, { status: 500 })
    }

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}