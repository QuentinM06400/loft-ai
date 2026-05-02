import { cookies } from 'next/headers'
import redis from '@/lib/redis'
import { getSession, hashPassword } from '@/lib/auth'

const SUPER_ADMIN = 'cannes-loft'

async function getSuperAdminHostId() {
  const cookieStore = await cookies()
  const token = cookieStore.get('loftai_session')?.value
  const session = await getSession(token)
  if (!session || session.hostId !== SUPER_ADMIN) return null
  return session.hostId
}

// ─── GET — liste des hôtes ────────────────────────────────────────────────────
export async function GET() {
  if (!(await getSuperAdminHostId())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const raw = await redis.get('hosts:list')
    const hostIds = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : []

    const hosts = []
    for (const hostId of hostIds) {
      const data = await redis.get(`host:${hostId}`)
      if (data) {
        const host = typeof data === 'string' ? JSON.parse(data) : data
        const { passwordHash: _, ...safeHost } = host
        hosts.push(safeHost)
      }
    }

    return Response.json({ hosts })
  } catch (error) {
    console.error('Error listing hosts:', error)
    return Response.json({ error: 'Failed to list hosts' }, { status: 500 })
  }
}

// ─── POST — créer un hôte ─────────────────────────────────────────────────────
export async function POST(request) {
  if (!(await getSuperAdminHostId())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { hostId, email, password, name } = await request.json()

    if (!hostId || !email || !password || !name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existing = await redis.get(`host:${hostId}`)
    if (existing) {
      return Response.json({ error: `hostId '${hostId}' already exists` }, { status: 409 })
    }

    const passwordHash = hashPassword(password)
    await redis.set(`host:${hostId}`, JSON.stringify({
      hostId,
      email,
      passwordHash,
      name,
      createdAt: new Date().toISOString(),
    }))

    // Add to hosts list
    const rawList = await redis.get('hosts:list')
    const list = rawList ? (typeof rawList === 'string' ? JSON.parse(rawList) : rawList) : []
    if (!list.includes(hostId)) {
      await redis.set('hosts:list', JSON.stringify([...list, hostId]))
    }

    return Response.json({ success: true, hostId })
  } catch (error) {
    console.error('Error creating host:', error)
    return Response.json({ error: 'Failed to create host' }, { status: 500 })
  }
}

// ─── PUT — modifier un hôte ───────────────────────────────────────────────────
export async function PUT(request) {
  if (!(await getSuperAdminHostId())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { hostId, email, password, name } = await request.json()
    if (!hostId) return Response.json({ error: 'Missing hostId' }, { status: 400 })

    const raw = await redis.get(`host:${hostId}`)
    if (!raw) return Response.json({ error: 'Host not found' }, { status: 404 })

    const host = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (email) host.email = email
    if (name) host.name = name
    if (password) host.passwordHash = hashPassword(password)

    await redis.set(`host:${hostId}`, JSON.stringify(host))
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error updating host:', error)
    return Response.json({ error: 'Failed to update host' }, { status: 500 })
  }
}

// ─── DELETE — supprimer un hôte ───────────────────────────────────────────────
export async function DELETE(request) {
  if (!(await getSuperAdminHostId())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const hostId = searchParams.get('hostId')
    if (!hostId) return Response.json({ error: 'Missing hostId' }, { status: 400 })
    if (hostId === SUPER_ADMIN) {
      return Response.json({ error: 'Cannot delete super-admin account' }, { status: 403 })
    }

    await redis.del(`host:${hostId}`)
    await redis.del(`propertyData:${hostId}`)

    const rawList = await redis.get('hosts:list')
    const list = rawList ? (typeof rawList === 'string' ? JSON.parse(rawList) : rawList) : []
    await redis.set('hosts:list', JSON.stringify(list.filter(id => id !== hostId)))

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting host:', error)
    return Response.json({ error: 'Failed to delete host' }, { status: 500 })
  }
}
