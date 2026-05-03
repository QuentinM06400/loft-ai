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

async function main() {
  const { DEFAULT_PROPERTY_DATA } = await import('../app/lib/defaultContent.js')

  await redis.set('propertyData:cannes-loft', JSON.stringify(DEFAULT_PROPERTY_DATA))

  console.log('✅ propertyData:cannes-loft seedé avec succès')

  // Vérification rapide
  const raw  = await redis.get('propertyData:cannes-loft')
  const data = typeof raw === 'string' ? JSON.parse(raw) : raw
  console.log('   adresse   :', data.info?.address, data.info?.city)
  console.log('   voyageurs :', data.info?.maxGuests)
  console.log('   équipements:', Object.keys(data.appliances?.items || {}).filter(k => data.appliances.items[k]?.enabled).join(', '))
}

main().catch(err => {
  console.error('Erreur :', err)
  process.exit(1)
})
