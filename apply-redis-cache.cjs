#!/usr/bin/env node
'use strict'

/**
 * apply-redis-cache.cjs
 * ---------------------------------------------------------------------
 * Terapkan Upstash Redis sebagai cache untuk AI Chat Dospem.
 *
 * Langkah:
 *   1. Cek package @upstash/redis (harus diinstall dulu)
 *   2. Buat api/_lib/redis.js (helper cache-aside)
 *   3. Update .env.example
 *   4. Rewrite api/ai/chat.js dengan cache
 *   5. Rewrite pluginApiAi di vite.config.js dengan cache
 *   6. Verifikasi
 *
 * CRLF-safe, idempotent.
 * ---------------------------------------------------------------------
 */

const fs = require('fs')
const path = require('path')
const ROOT = process.cwd()

function fp(rel) { return path.join(ROOT, rel) }
function exists(rel) { return fs.existsSync(fp(rel)) }
function read(rel) { return fs.readFileSync(fp(rel), 'utf8') }
function write(rel, content) {
  fs.mkdirSync(path.dirname(fp(rel)), { recursive: true })
  fs.writeFileSync(fp(rel), content, 'utf8')
}
function backup(rel) {
  if (!exists(rel)) return false
  try { fs.copyFileSync(fp(rel), fp(rel) + '.bak'); return true } catch (e) { return false }
}
function head(m) { console.log('\n\x1b[1m\x1b[36m' + m + '\x1b[0m') }
function ok(m)   { console.log('  \x1b[32m\u2713\x1b[0m ' + m) }
function skip(m) { console.log('  \x1b[2m\u00b7 ' + m + '\x1b[0m') }
function warn(m) { console.log('  \x1b[33m!\x1b[0m ' + m) }

// ==================== KONTEN BARU ====================

const REDIS_HELPER = String.raw`import { Redis } from '@upstash/redis'

/* Klien Redis untuk caching di serverless functions dan Vite dev middleware.
   Redis.fromEnv() otomatis baca UPSTASH_REDIS_REST_URL dan
   UPSTASH_REDIS_REST_TOKEN dari environment. */
let klien = null

export function ambilRedis(env) {
  if (klien) return klien
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  klien = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN
  })
  return klien
}

/* Cache-aside pattern: cek cache dulu, kalau miss panggil fetcher
   lalu simpan hasilnya ke cache dengan TTL. Kalau Redis down
   atau env tidak ada, langsung panggil fetcher tanpa error. */
export async function denganCache(env, kunci, ttlDetik, fetcher) {
  const redis = ambilRedis(env)
  if (!redis) return { data: await fetcher(), dariCache: false }

  try {
    const cached = await redis.get(kunci)
    if (cached !== null && cached !== undefined) {
      return { data: cached, dariCache: true }
    }
  } catch (e) {
    console.warn('[redis] get gagal, fallback ke fetcher:', e.message)
  }

  const hasil = await fetcher()

  try {
    await redis.set(kunci, hasil, { ex: ttlDetik })
  } catch (e) {
    console.warn('[redis] set gagal, dilewati:', e.message)
  }

  return { data: hasil, dariCache: false }
}
`

const AI_CHAT_ENDPOINT = String.raw`import { createClient } from '@supabase/supabase-js'
import { jawabPertanyaanDospem } from '../_lib/dospem-chat.js'
import { denganCache } from '../_lib/redis.js'

const MAKS_PERTANYAAN = 500
const MAKS_RIWAYAT = 10
const TTL_KONTEKS = 300 // 5 menit
const KUNCI_KONTEKS = 'mbsi:chat:konteks:v1'

async function ambilDataTim(env) {
  const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)
  const [l, p, g, h] = await Promise.all([
    sb.from('logbooks').select('id, mahasiswa_id, tanggal, kategori, judul, logbook_items(judul)')
      .eq('status', 'publik').order('tanggal', { ascending: false }).limit(200),
    sb.from('mahasiswa').select('id, nama, nim, prodi').order('nama').limit(50),
    sb.from('galeri').select('id, mahasiswa_id').limit(500),
    sb.from('daftar_hadir').select('id, mahasiswa_id, tanggal, status, alasan')
      .order('tanggal', { ascending: false }).limit(1000)
  ])
  return {
    logs: l.data || [],
    people: p.data || [],
    gal: g.data || [],
    hadir: h.data || []
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })

  const body = req.body || {}
  const pertanyaan = String(body.pertanyaan || '').trim()
  const riwayat = Array.isArray(body.riwayat) ? body.riwayat.slice(-MAKS_RIWAYAT) : []

  if (!pertanyaan) return res.status(400).json({ error: 'Pertanyaan tidak boleh kosong.' })
  if (pertanyaan.length > MAKS_PERTANYAAN) {
    return res.status(400).json({ error: 'Pertanyaan terlalu panjang (maks ' + MAKS_PERTANYAAN + ' karakter).' })
  }

  try {
    const { data: dataTim, dariCache } = await denganCache(
      process.env,
      KUNCI_KONTEKS,
      TTL_KONTEKS,
      function () { return ambilDataTim(process.env) }
    )

    console.log('[ai/chat] data tim:', dariCache ? 'dari cache' : 'fresh dari Supabase')

    const jawaban = await jawabPertanyaanDospem(process.env, {
      pertanyaan: pertanyaan,
      riwayat: riwayat,
      data: dataTim
    })

    return res.status(200).json({ jawaban: jawaban, cache: dariCache ? 'hit' : 'miss' })
  } catch (err) {
    console.error('[ai/chat]', err)
    return res.status(500).json({ error: err.message || 'Gagal memanggil AI' })
  }
}
`

const PLUGIN_AI_NEW = String.raw`function pluginApiAi(env) {
  function kirim(res, code, obj) {
    res.statusCode = code
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(obj))
  }
  const setupMiddlewares = (server) => {
    server.middlewares.use('/api/ai/tulis', async function (req, res) {
      const authHeader = req.headers.authorization || ''
      if (req.method !== 'POST') { kirim(res, 405, { error: 'Method tidak diizinkan' }); return }
      const user = await cekSesi(env, authHeader)
      if (!user) { kirim(res, 401, { error: 'Sesi tidak valid' }); return }
      const body = await bacaBody(req)
      const draft = body.draft
      if (!draft || !String(draft).trim()) {
        kirim(res, 400, { error: 'Tuliskan dulu catatan kasar kegiatanmu.' })
        return
      }
      try {
        const hasil = await susunLogbookAi(env, {
          draft: draft,
          kategoriList: Array.isArray(body.kategori) ? body.kategori : [],
          unitList: Array.isArray(body.unit) ? body.unit : []
        })
        kirim(res, 200, hasil)
      } catch (err) {
        kirim(res, 500, { error: err.message || 'Gagal memanggil AI' })
      }
    })

    server.middlewares.use('/api/ai/chat', async function (req, res) {
      if (req.method !== 'POST') { kirim(res, 405, { error: 'Method tidak diizinkan' }); return }
      const body = await bacaBody(req)
      const pertanyaan = String(body.pertanyaan || '').trim()
      const riwayat = Array.isArray(body.riwayat) ? body.riwayat.slice(-10) : []
      if (!pertanyaan) { kirim(res, 400, { error: 'Pertanyaan tidak boleh kosong.' }); return }
      if (pertanyaan.length > 500) { kirim(res, 400, { error: 'Pertanyaan terlalu panjang (maks 500 karakter).' }); return }
      try {
        const { data: dataTim, dariCache } = await denganCache(
          env,
          'mbsi:chat:konteks:v1',
          300,
          async function () {
            const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)
            const [l, p, g, h] = await Promise.all([
              sb.from('logbooks').select('id, mahasiswa_id, tanggal, kategori, judul, logbook_items(judul)')
                .eq('status', 'publik').order('tanggal', { ascending: false }).limit(200),
              sb.from('mahasiswa').select('id, nama, nim, prodi').order('nama').limit(50),
              sb.from('galeri').select('id, mahasiswa_id').limit(500),
              sb.from('daftar_hadir').select('id, mahasiswa_id, tanggal, status, alasan')
                .order('tanggal', { ascending: false }).limit(1000)
            ])
            return { logs: l.data || [], people: p.data || [], gal: g.data || [], hadir: h.data || [] }
          }
        )
        console.log('[ai/chat] data tim:', dariCache ? 'dari cache' : 'fresh dari Supabase')
        const jawaban = await jawabPertanyaanDospem(env, {
          pertanyaan: pertanyaan,
          riwayat: riwayat,
          data: dataTim
        })
        kirim(res, 200, { jawaban: jawaban, cache: dariCache ? 'hit' : 'miss' })
      } catch (err) {
        console.error('[ai/chat]', err)
        kirim(res, 500, { error: err.message || 'Gagal memanggil AI' })
      }
    })
  }
  return {
    name: 'api-ai-dev',
    configureServer: setupMiddlewares,
    configurePreviewServer: setupMiddlewares
  }
}`

// ==================== STEPS ====================

function step1() {
  head('[1/6] Cek package @upstash/redis')
  if (exists('node_modules/@upstash/redis')) {
    ok('@upstash/redis sudah terinstall')
    return true
  }
  warn('@upstash/redis belum diinstall')
  console.log('')
  console.log('  Jalankan dulu:')
  console.log('    \x1b[1mnpm install @upstash/redis\x1b[0m')
  console.log('')
  console.log('  Lalu jalankan ulang script ini.')
  return false
}

function step2() {
  head('[2/6] File api/_lib/redis.js')
  const rel = 'api/_lib/redis.js'
  if (exists(rel)) {
    const src = read(rel)
    if (src.indexOf('export async function denganCache') !== -1 && src.indexOf('ambilRedis') !== -1) {
      skip('sudah ada & valid')
      return
    }
    warn('file ada tapi isinya berbeda, overwrite')
  }
  write(rel, REDIS_HELPER)
  ok('dibuat')
}

function step3() {
  head('[3/6] Update .env.example')
  const rel = '.env.example'
  if (!exists(rel)) { warn('tidak ditemukan, dilewati'); return }
  const raw = read(rel)
  const eol = raw.indexOf('\r\n') !== -1 ? '\r\n' : '\n'
  let src = raw.replace(/\r\n/g, '\n')

  if (src.indexOf('UPSTASH_REDIS_REST_URL') !== -1) {
    skip('sudah berisi UPSTASH_*')
    return
  }
  src = src.replace(/\s*$/, '') + '\nUPSTASH_REDIS_REST_URL=\nUPSTASH_REDIS_REST_TOKEN=\n'
  const out = eol === '\r\n' ? src.replace(/\n/g, '\r\n') : src
  write(rel, out)
  ok('UPSTASH_REDIS_REST_URL & UPSTASH_REDIS_REST_TOKEN ditambahkan')
}

function step4() {
  head('[4/6] Rewrite api/ai/chat.js dengan cache')
  const rel = 'api/ai/chat.js'
  if (!exists(rel)) {
    warn('tidak ditemukan, dibuat baru')
    write(rel, AI_CHAT_ENDPOINT)
    ok('dibuat baru dengan cache')
    return
  }
  const src = read(rel)
  if (src.indexOf("from '../_lib/redis.js'") !== -1 && src.indexOf('denganCache') !== -1) {
    skip('sudah pakai cache')
    return
  }
  backup(rel)
  write(rel, AI_CHAT_ENDPOINT)
  ok('ditulis ulang dengan cache (backup: ' + rel + '.bak)')
}

function step5() {
  head('[5/6] Update vite.config.js')
  const rel = 'vite.config.js'
  if (!exists(rel)) { warn('tidak ditemukan, dilewati'); return }
  const raw = read(rel)
  const eol = raw.indexOf('\r\n') !== -1 ? '\r\n' : '\n'
  let src = raw.replace(/\r\n/g, '\n')
  let changed = 0

  // 5a. Tambah import denganCache
  if (src.indexOf("from './api/_lib/redis.js'") === -1) {
    const anchor = "import { jawabPertanyaanDospem } from './api/_lib/dospem-chat.js'"
    if (src.indexOf(anchor) !== -1) {
      src = src.replace(anchor, anchor + "\nimport { denganCache } from './api/_lib/redis.js'")
      changed++
      console.log('  \x1b[32m\u2713\x1b[0m import denganCache ditambahkan')
    } else {
      warn('anchor import jawabPertanyaanDospem tidak ditemukan')
    }
  } else {
    skip('import denganCache sudah ada')
  }

  // 5b. Cek pluginApiAi sudah pakai cache
  if (src.indexOf("'mbsi:chat:konteks:v1'") !== -1) {
    skip('pluginApiAi sudah pakai cache')
  } else if (src.indexOf('/api/ai/chat') !== -1) {
    // Rewrite seluruh pluginApiAi
    const reFn = /function pluginApiAi\(env\) \{[\s\S]*?\n\}\n\nexport default defineConfig/
    if (reFn.test(src)) {
      src = src.replace(reFn, PLUGIN_AI_NEW + '\n\nexport default defineConfig')
      changed++
      console.log('  \x1b[32m\u2713\x1b[0m pluginApiAi diganti versi dengan cache')
    } else {
      warn('pola pluginApiAi tidak match, cek manual')
    }
  } else {
    warn('pluginApiAi tidak ditemukan di vite.config.js')
  }

  if (changed > 0) {
    backup(rel)
    const out = eol === '\r\n' ? src.replace(/\n/g, '\r\n') : src
    write(rel, out)
    ok(changed + ' perubahan diterapkan (backup: ' + rel + '.bak)')
  } else {
    skip('tidak ada perubahan')
  }
}

function step6() {
  head('[6/6] Verifikasi')
  const checks = [
    { rel: 'api/_lib/redis.js', must: 'export async function denganCache' },
    { rel: 'api/ai/chat.js', must: "from '../_lib/redis.js'" },
    { rel: 'api/ai/chat.js', must: 'denganCache' },
    { rel: 'api/ai/chat.js', must: 'KUNCI_KONTEKS' },
    { rel: 'vite.config.js', must: "from './api/_lib/redis.js'" },
    { rel: 'vite.config.js', must: "'mbsi:chat:konteks:v1'" }
  ]
  let semuaOk = true
  for (const c of checks) {
    if (!exists(c.rel)) { warn(c.rel + ' tidak ditemukan'); semuaOk = false; continue }
    const src = read(c.rel)
    if (src.indexOf(c.must) !== -1) {
      console.log('  \x1b[32m\u2713\x1b[0m ' + c.rel + ' \u2192 "' + c.must + '"')
    } else {
      warn(c.rel + ' tidak mengandung "' + c.must + '"')
      semuaOk = false
    }
  }
  return semuaOk
}

// ==================== MAIN ====================

function main() {
  console.log('\n\x1b[1m\x1b[36m\u{1F534} Apply Redis Cache untuk AI Chat\x1b[0m')
  console.log('\x1b[2m   Cache konteks chat dospem pakai Upstash Redis, TTL 5 menit.\x1b[0m')

  if (!exists('package.json') || !exists('src/App.jsx')) {
    console.log('\n\x1b[31mJalankan dari root project (folder yang berisi package.json & src/).\x1b[0m\n')
    process.exit(1)
  }

  try {
    const lanjut = step1()
    if (!lanjut) {
      console.log('\n\x1b[33mScript dihentikan. Install package dulu lalu ulangi.\x1b[0m\n')
      process.exit(1)
    }
    step2()
    step3()
    step4()
    step5()
    const semuaOk = step6()
    if (!semuaOk) {
      console.log('\n\x1b[33mAda beberapa item yang perlu cek manual. Lihat warning di atas.\x1b[0m')
    }
  } catch (e) {
    console.log('\n\x1b[31mGagal: ' + e.message + '\x1b[0m')
    console.error(e)
    process.exit(1)
  }

  console.log('\n\x1b[1m\x1b[32m\u2705 Selesai!\x1b[0m')
  console.log(`
  \x1b[1mYang perlu kamu lakukan manual:\x1b[0m

  1. Daftar & buat database di Upstash:
     \x1b[36mhttps://console.upstash.com\x1b[0m
     \u2192 + Create Database
     \u2192 Name: \x1b[1mmbsi-logbook-cache\x1b[0m
     \u2192 Region: \x1b[1map-southeast-1\x1b[0m (Singapore)
     \u2192 Plan: \x1b[1mFree\x1b[0m (256 MB, 500K commands/bulan)
     \u2192 Copy UPSTASH_REDIS_REST_URL & UPSTASH_REDIS_REST_TOKEN

  2. Tambahkan ke \x1b[1m.env.local\x1b[0m:
     \x1b[2mUPSTASH_REDIS_REST_URL=https://xxx-xxxxx.upstash.io\x1b[0m
     \x1b[2mUPSTASH_REDIS_REST_TOKEN=AXxxxxxxxxxxxxxxxxxxxxxx\x1b[0m

  3. Restart dev server:
     Ctrl+C, lalu \x1b[1mnpm run dev\x1b[0m

  \x1b[1mCara test:\x1b[0m

  Buka halaman publik, klik FAB chat, tanya apa saja 2x berturut-turut.
  Perhatikan terminal dev server:

    Request 1: \x1b[36m[ai/chat] data tim: fresh dari Supabase\x1b[0m
    Request 2: \x1b[36m[ai/chat] data tim: dari cache\x1b[0m       \u2190 cache hit!

  Kalau request ke-2 masih "fresh", cek:
    - Apakah UPSTASH_* sudah ada di .env.local? (restart dev server setelah isi)
    - Buka \x1b[36mhttps://console.upstash.com\x1b[0m \u2192 Data Browser,
      cek apakah ada key \x1b[1mmbsi:chat:konteks:v1\x1b[0m
    - Ada warning \x1b[33m[redis] get/set gagal\x1b[0m? Itu penyebabnya, kabari aku.

  \x1b[1mUntuk deploy ke Vercel:\x1b[0m

  Tambahkan 2 env var yang sama di
  Vercel \u2192 Settings \u2192 Environment Variables (Production + Preview).

  \x1b[1mFile backup:\x1b[0m Kalau ada masalah, restore dari:
    api/ai/chat.js.bak
    vite.config.js.bak
`)
}

main()