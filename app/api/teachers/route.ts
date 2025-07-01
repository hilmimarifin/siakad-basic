import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { data: teachers, error } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role', 'teacher')
      .order('full_name', { ascending: true })

    if (error) {
      return NextResponse.json({ message: 'Failed to fetch teachers' }, { status: 500 })
    }

    return NextResponse.json(teachers)
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}