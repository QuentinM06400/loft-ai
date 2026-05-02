import { NextResponse } from 'next/server'
import redis from '@/lib/redis'
import { verifyPassword, createSession } from '@/lib/auth'

export async function POST(request) {
  try {
    const { hostId, password } = await request.json()

    if (!hostId || !password) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
    }

    const raw = await redis.get(`host:${hostId}`)
    if (!raw) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
    }

    const host = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!verifyPassword(password, host.passwordHash)) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
    }

    const token = await createSession(hostId)

    const response = NextResponse.json({ success: true, hostId })
    response.cookies.set('loftai_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    return response
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
