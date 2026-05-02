import { cookies } from 'next/headers'
import redis from '@/lib/redis'
import { getSession } from '@/lib/auth'

async function getAdminHostId() {
  const cookieStore = await cookies()
  const token = cookieStore.get('loftai_session')?.value
  const session = await getSession(token)
  return session?.hostId || null
}

// ─── GET — liste des conversations (admin) ────────────────────────────────────
export async function GET(request) {
  const hostId = await getAdminHostId()
  if (!hostId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const keys = await redis.keys(`conv:${hostId}:*`)
    if (!keys || keys.length === 0) {
      return Response.json({ conversations: [] })
    }

    const conversations = []
    for (const key of keys) {
      const data = await redis.get(key)
      if (data) {
        conversations.push(typeof data === 'string' ? JSON.parse(data) : data)
      }
    }

    conversations.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
    return Response.json({ conversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return Response.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

// ─── POST — sauvegarder une conversation (guest) ──────────────────────────────
export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url)
    const body = await request.json()
    const { id, messages, language, startedAt, endedAt, deviceInfo } = body

    // hostId from body, query param, or default
    const hostId = body.hostId || searchParams.get('hostId') || 'cannes-loft'

    if (!id || !messages) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const conversation = {
      id,
      hostId,
      messages,
      language: language || 'unknown',
      startedAt: startedAt || new Date().toISOString(),
      endedAt: endedAt || new Date().toISOString(),
      messageCount: messages.filter(m => m.role === 'user').length,
      deviceInfo: deviceInfo || 'unknown',
    }

    await redis.set(
      `conv:${hostId}:${id}`,
      JSON.stringify(conversation),
      { ex: 90 * 24 * 60 * 60 }
    )

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error saving conversation:', error)
    return Response.json({ error: 'Failed to save conversation' }, { status: 500 })
  }
}

// ─── DELETE — supprimer une conversation (admin) ──────────────────────────────
export async function DELETE(request) {
  const hostId = await getAdminHostId()
  if (!hostId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return Response.json({ error: 'Missing conversation id' }, { status: 400 })

    await redis.del(`conv:${hostId}:${id}`)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return Response.json({ error: 'Failed to delete conversation' }, { status: 500 })
  }
}
