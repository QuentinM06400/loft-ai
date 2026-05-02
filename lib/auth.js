import crypto from 'crypto'
import redis from './redis.js'

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':')
  const attempt = crypto.scryptSync(password, salt, 64).toString('hex')
  return attempt === hash
}

export async function createSession(hostId) {
  const token = crypto.randomBytes(32).toString('hex')
  await redis.set(`session:${token}`, { hostId }, { ex: 60 * 60 * 24 * 7 })
  return token
}

export async function getSession(token) {
  if (!token) return null
  return await redis.get(`session:${token}`)
}

export async function deleteSession(token) {
  await redis.del(`session:${token}`)
}
