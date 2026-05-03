'use strict'

const { Redis } = require('@upstash/redis')
const fs   = require('fs')
const path = require('path')

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) return
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=')
    if (k && v.length) process.env[k.trim()] = v.join('=').trim().replace(/^"|"$/g, '')
  })
}

loadEnv()

const redis = new Redis({
  url:   process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

const STREAMING_NORMALIZE = {
  'Prime Video':  'Amazon Prime Video',
  'Amazon Prime': 'Amazon Prime Video',
}

async function main() {
  const raw  = await redis.get('propertyData:cannes-loft')
  const data = typeof raw === 'string' ? JSON.parse(raw) : JSON.parse(JSON.stringify(raw))

  console.log('=== CLÉS AVANT MIGRATION ===')
  console.log(Object.keys(data))

  // ── 1. TV → appliances.tvWizard ────────────────────────────────────────────
  const tv = data.tv || {}
  const streamingServices = Array.isArray(tv.streamingServices) ? tv.streamingServices : []

  const streamingAccess = {}
  for (const service of streamingServices) {
    const normalized = STREAMING_NORMALIZE[service] || service
    streamingAccess[normalized] = { accessible: 'Oui', instructions: '' }
  }

  data.appliances.tvWizard = {
    equipment: ['TV', 'Box Internet', 'Décodeur'],
    counts: { TV: 1, 'Box Internet': 1, 'Décodeur': 1 },
    tvItems: [
      {
        location: tv.tvLocation || '',
        brand:    '',
        model:    tv.tvModel   || '',
        remote:   'Incluse',
        notes:    tv.specificInstructions || '',
      },
    ],
    boxOperator:    '',
    boxLocation:    tv.internetBoxLocation || '',
    boxNotes:       '',
    decoderBrand:   tv.decoderModel || '',
    decoderLocation:'',
    decoderTv:      'Toutes',
    decoderNotes:   '',
    streamingAccess,
  }

  // ── 2. lighting + windows → appliances.lightingWizard ─────────────────────
  const lighting = data.lighting || {}
  const windows  = data.windows  || {}

  data.appliances.lightingWizard = {
    hasOpeningInstructions:     (windows.openings?.length > 0) ? 'Oui' : 'Non',
    openingScopes:              ['Tous les ouvrants'],
    openingGeneralInstructions: windows.openings?.[0]?.instructions || '',
    openingSpecificItems:       [],
    closureTypes:               [],
    lightingTypes:              ['Utilisation'],
    lightingItems: (lighting.zones || []).map(z => ({
      room:        z.zoneName       || '',
      light:       z.controlType    || '',
      instruction: z.instructions   || '',
    })),
  }

  // ── 3. storage → appliances.storageDetails ─────────────────────────────────
  const storage = data.storage || {}

  const binItem = (storage.wasteManagement || []).find(w =>
    w.type?.toLowerCase().includes('classique') || w.location
  )

  data.appliances.storageDetails = {
    linensProvided:   'Oui',
    linensLocation:   '',
    cleaningProvided: 'Oui',
    cleaningLocation: '',
    recycling:        'Oui',
    binLocation:      binItem?.location || '',
    guestClosets:     '',
  }

  // ── 4. Supprimer les anciennes clés de premier niveau ─────────────────────
  delete data.tv
  delete data.lighting
  delete data.windows
  delete data.storage

  // ── 5. Écrire dans Redis ───────────────────────────────────────────────────
  await redis.set('propertyData:cannes-loft', JSON.stringify(data))

  // ── 6. Résumé ──────────────────────────────────────────────────────────────
  console.log('\n=== CLÉS APRÈS MIGRATION ===')
  console.log(Object.keys(data))

  console.log('\n=== appliances.tvWizard ===')
  console.log(JSON.stringify(data.appliances.tvWizard, null, 2))

  console.log('\n✅ propertyData:cannes-loft migré avec succès')
}

main().catch(err => {
  console.error('Erreur :', err)
  process.exit(1)
})
