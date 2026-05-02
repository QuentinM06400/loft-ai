import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('loftai_session')?.value
    const session = await getSession(token)

    if (!session) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 })
    }

    return Response.json({ hostId: session.hostId })
  } catch (err) {
    console.error('Me error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
