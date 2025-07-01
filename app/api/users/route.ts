import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'principal') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role, full_name, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 })
    }

    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'principal') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { email, password, role, full_name } = await request.json()

    // Hash password
    const password_hash = await bcrypt.hash(password, 12)

    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        email,
        password_hash,
        role,
        full_name
      }])
      .select()
      .single()

    if (error) {
      console.log("error>>>>>>>>>>", error);
      
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Email already exists' }, { status: 400 })
      }
      return NextResponse.json({ message: 'Failed to create user' }, { status: 500 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}