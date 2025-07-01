import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  cookies().set('session', '', {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })

  return NextResponse.json({ message: 'Logout successful' })
}