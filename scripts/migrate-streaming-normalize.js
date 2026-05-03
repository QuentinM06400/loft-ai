'use strict'

const { Redis } = require('@upstash/redis')
const fs   = require('fs')
const path = require('path')

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
  url:   process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

const RENAMES = {
  'Prime Video':  'Amazon Prime Video',
  'Amazon Prime': 'Amazon Prime Video',
}

async function main() {
  const raw  = await redis.get('propertyData:cannes-loft')
  const data = typeof raw === 'string' ? JSON.parse(raw) : raw

  const sa = data?.appliances?.tvWizard?.streamingAccess
  if (!sa) {
    console.log('⚠️  Pas de streamingAccess trouvé dans Redis')
    return
  }

  console.log('=== streamingAccess AVANT ===')
  console.log(JSON.stringify(sa, null, 2))

  let changed = false
  for (const [old, normalized] of Object.entries(RENAMES)) {
    if (old in sa) {
      sa[normalized] = sa[old]
      delete sa[old]
      console.log(`✅ Renommé : "${old}" → "${normalized}"`)
      changed = true
    }
  }

  if (!changed) {
    console.log('ℹ️  Aucune clé à renommer')
    return
  }

  await redis.set('propertyData:cannes-loft', JSON.stringify(data))

  console.log('\n=== streamingAccess APRÈS ===')
  console.log(JSON.stringify(sa, null, 2))
  console.log('\n✅ propertyData:cannes-loft mis à jour')
}

main().catch(err => {
  console.error('Erreur :', err)
  process.exit(1)
})
