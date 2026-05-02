import { cookies } from 'next/headers'
import redis from '@/lib/redis'
import { getSession } from '@/lib/auth'

async function getHostId() {
  const cookieStore = await cookies()
  const token = cookieStore.get('loftai_session')?.value
  const session = await getSession(token)
  return session?.hostId || null
}

// ─── GET ──────────────────────────────────────────────────────────────────────
export async function GET() {
  const hostId = await getHostId()
  if (!hostId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const raw = await redis.get(`propertyData:${hostId}`)
    const propertyData = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null
    const completionRate = propertyData ? computeCompletionRate(propertyData) : null
    return Response.json({ propertyData, sections: {}, completionRate })
  } catch (error) {
    console.error('Error fetching content:', error)
    return Response.json({ propertyData: null, sections: {}, completionRate: null })
  }
}

// ─── PUT ──────────────────────────────────────────────────────────────────────
export async function PUT(request) {
  const hostId = await getHostId()
  if (!hostId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    if (body.propertyData === undefined) {
      return Response.json({ error: 'Missing propertyData' }, { status: 400 })
    }
    await redis.set(`propertyData:${hostId}`, JSON.stringify(body.propertyData))
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error saving content:', error)
    return Response.json({ error: 'Failed to save content' }, { status: 500 })
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function DELETE() {
  const hostId = await getHostId()
  if (!hostId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await redis.del(`propertyData:${hostId}`)
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: 'Failed to delete' }, { status: 500 })
  }
}

// ─── Completion rate ──────────────────────────────────────────────────────────
const REQUIRED_FIELDS = [
  d => d?.info?.address,
  d => d?.info?.city,
  d => d?.info?.description,
  d => d?.info?.maxGuests,
  d => d?.info?.contacts?.length > 0,
  d => d?.checkin?.checkinTime,
  d => d?.checkin?.checkoutTime,
  d => d?.checkin?.accessMode,
  d => d?.rules?.quietHoursStart,
  d => d?.rules?.partiesAllowed,
  d => d?.rules?.smokingPolicy,
]

function computeCompletionRate(propertyData) {
  const filled = REQUIRED_FIELDS.filter(fn => {
    try { return !!fn(propertyData) } catch { return false }
  }).length
  return Math.round((filled / REQUIRED_FIELDS.length) * 100)
}
