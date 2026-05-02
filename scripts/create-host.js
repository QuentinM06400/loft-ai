#!/usr/bin/env node
'use strict'

const { Redis } = require('@upstash/redis')
const crypto = require('crypto')
const readline = require('readline')
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

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function readPassword(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(prompt)
    const chars = []
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.setEncoding('utf8')

    function onData(char) {
      if (char === '\r' || char === '\n') {
        process.stdin.setRawMode(false)
        process.stdin.pause()
        process.stdin.removeListener('data', onData)
        process.stdout.write('\n')
        resolve(chars.join(''))
      } else if (char === '') {
        process.stdout.write('\n')
        process.exit()
      } else if (char === '') {
        if (chars.length > 0) {
          chars.pop()
          process.stdout.clearLine(0)
          process.stdout.cursorTo(0)
          process.stdout.write(prompt + '*'.repeat(chars.length))
        }
      } else {
        chars.push(char)
        process.stdout.write('*')
      }
    }

    process.stdin.on('data', onData)
  })
}

async function main() {
  console.log('=== Création du compte hôte cannes-loft ===\n')

  const password = await readPassword('Mot de passe : ')
  if (!password || password.length < 8) {
    console.error('❌ Le mot de passe doit faire au moins 8 caractères.')
    process.exit(1)
  }

  const confirm = await readPassword('Confirmer le mot de passe : ')
  if (password !== confirm) {
    console.error('❌ Les mots de passe ne correspondent pas.')
    process.exit(1)
  }

  const passwordHash = hashPassword(password)

  await redis.set('host:cannes-loft', JSON.stringify({
    hostId: 'cannes-loft',
    email: 'moreauxquentin@icloud.com',
    passwordHash,
    name: 'Quentin — Loft Cannes',
    role: 'superadmin',
    createdAt: new Date().toISOString(),
  }))

  await redis.set('hosts:list', JSON.stringify(['cannes-loft']))

  console.log('\n✅ Compte cannes-loft créé avec succès.')
  console.log('   hostId : cannes-loft')
  console.log('   email  : moreauxquentin@icloud.com')
  console.log('   rôle   : superadmin\n')
}

main().catch(err => {
  console.error('Erreur:', err)
  process.exit(1)
})
