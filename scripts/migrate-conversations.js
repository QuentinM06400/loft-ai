#!/usr/bin/env node
'use strict'

const { Redis } = require('@upstash/redis')
const fs = require('fs')
const path = require('path')

// Parse .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) return
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (!match) return
    let value = match[2].trim()
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    process.env[match[1].trim()] = value
  })
}

loadEnv()

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

const TARGET_HOST = 'cannes-loft'

async function main() {
  console.log('=== Migration conversations → multi-tenant ===\n')

  const allKeys = await redis.keys('conv:*')

  // Old format: conv:conv_TIMESTAMP_ID (one colon, value after : starts with conv_)
  // New format: conv:HOST:conv_... (two colons)
  const oldKeys = allKeys.filter(k => {
    const parts = k.split(':')
    return parts.length === 2 && parts[1].startsWith('conv_')
  })

  if (oldKeys.length === 0) {
    console.log('Aucune conversation à migrer (aucune clé au format ancien).')
    process.exit(0)
  }

  console.log(`${oldKeys.length} conversation(s) à migrer vers conv:${TARGET_HOST}:*\n`)

  let migrated = 0
  let skipped = 0

  for (const oldKey of oldKeys) {
    const convId = oldKey.split(':')[1]  // e.g. conv_1775561285573_fbft2y
    const newKey = `conv:${TARGET_HOST}:${convId}`

    // Check if already migrated
    const alreadyExists = await redis.exists(newKey)
    if (alreadyExists) {
      console.log(`SKIP  ${oldKey} (${newKey} existe déjà)`)
      skipped++
      continue
    }

    // Copy data
    const data = await redis.get(oldKey)
    if (!data) {
      console.log(`SKIP  ${oldKey} (données vides)`)
      skipped++
      continue
    }

    // Get remaining TTL
    const ttl = await redis.ttl(oldKey)
    const setOptions = ttl > 0 ? { ex: ttl } : {}

    await redis.set(newKey, typeof data === 'string' ? data : JSON.stringify(data), setOptions)
    await redis.del(oldKey)

    console.log(`OK    ${oldKey} → ${newKey}${ttl > 0 ? ` (TTL: ${ttl}s)` : ''}`)
    migrated++
  }

  console.log(`\n✅ Migration terminée : ${migrated} migrées, ${skipped} ignorées.`)
}

main().catch(err => {
  console.error('Erreur migration:', err)
  process.exit(1)
})
