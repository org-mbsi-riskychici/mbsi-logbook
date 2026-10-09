#!/usr/bin/env node
'use strict'

/**
 * cleanup-ai.cjs
 * ---------------------------------------------------------------------
 * Bersihkan sisa debugging & provider AI yang tidak terpakai.
 * Fokus: Groq-only (Qwen 3.8 27B).
 *
 *  1. Rewrite api/_lib/ai-provider.js jadi Groq-only
 *  2. Hapus api/_lib/gemini.js & api/_lib/openrouter.js
 *  3. Bersihkan debug log dari vite.config.js
 *  4. Update .env.example (buang GEMINI_*, tambah GROQ_*)
 *  5. Verifikasi
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
function del(rel) {
  try { fs.unlinkSync(fp(rel)); return true } catch (e) { return false }
}

function head(msg) { console.log('\n\x1b[1m\x1b[36m' + msg + '\x1b[0m') }
function ok(msg)   { console.log('  \x1b[32m\u2713\x1b[0m ' + msg) }
function skip(msg) { console.log('  \x1b[2m\u00b7 ' + msg + '\x1b[0m') }
function warn(msg) { console.log('  \x1b[33m!\x1b[0m ' + msg) }

// ============ KONTEN BARU ============

const AI_PROVIDER_BARU = `import { susunLogbookDenganGroq } from './groq.js'

/* Titik masuk tunggal untuk semua fitur AI di aplikasi.
   Saat ini memakai Groq (Qwen 3.8 27B) sebagai provider tunggal.
   Kalau nanti mau tambah provider lain, cukup tambahkan cabang
   di sini tanpa mengubah tulis.js atau vite.config.js. */
export async function susunLogbookAi(env, opts) {
  return susunLogbookDenganGroq(env, opts)
}
`

const PLUGIN_AI_BARU = `function pluginApiAi(env) {
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
  }
  return {
    name: 'api-ai-dev',
    configureServer: setupMiddlewares,
    configurePreviewServer: setupMiddlewares
  }
}`

// ============ STEPS ============

function step1() {
  head('[1/5] Simplify api/_lib/ai-provider.js')
  const rel = 'api/_lib/ai-provider.js'
  if (!exists(rel)) { warn('tidak ditemukan'); return }
  const raw = read(rel)
  if (raw.indexOf("from './groq.js'") !== -1 && raw.indexOf('gemini.js') === -1 && raw.indexOf('openrouter.js') === -1) {
    skip('sudah Groq-only')
    return
  }
  write(rel, AI_PROVIDER_BARU)
  ok('ditulis ulang jadi Groq-only')
}

function step2() {
  head('[2/5] Hapus provider yang tidak terpakai')
  if (exists('api/_lib/gemini.js')) { del('api/_lib/gemini.js'); ok('api/_lib/gemini.js dihapus') }
  else skip('api/_lib/gemini.js sudah tidak ada')
  if (exists('api/_lib/openrouter.js')) { del('api/_lib/openrouter.js'); ok('api/_lib/openrouter.js dihapus') }
  else skip('api/_lib/openrouter.js sudah tidak ada')
}

function step3() {
  head('[3/5] Bersihkan debug log dari vite.config.js')
  const rel = 'vite.config.js'
  if (!exists(rel)) { warn('tidak ditemukan'); return }
  const raw = read(rel)
  const eol = raw.indexOf('\r\n') !== -1 ? '\r\n' : '\n'
  let src = raw.replace(/\r\n/g, '\n')
  let changed = 0

  // 3a. Replace seluruh pluginApiAi dengan versi bersih
  const reFn = /function pluginApiAi\(env\) \{[\s\S]*?\n\}\n\nexport default defineConfig/
  if (reFn.test(src)) {
    src = src.replace(reFn, PLUGIN_AI_BARU + '\n\nexport default defineConfig')
    changed++
    console.log('  \x1b[32m\u2713\x1b[0m pluginApiAi diganti versi bersih (tanpa debug log)')
  } else if (src.indexOf('pluginApiAi') === -1) {
    skip('pluginApiAi tidak ditemukan (mungkin sudah bersih)')
  } else {
    warn('pola function pluginApiAi(env) {...} tidak match, cek manual')
  }

  // 3b. Hapus blok DEBUG ENV di startup
  const reEnv = /\n  \/\/ ====== DEBUG ENV ======$[\s\S]*?^[ \t]*\/\/ ====== DEBUG END ======$/m
  if (reEnv.test(src)) {
    src = src.replace(reEnv, '')
    changed++
    console.log('  \x1b[32m\u2713\x1b[0m blok [ENV DEBUG] dihapus')
  } else {
    skip('blok [ENV DEBUG] tidak ditemukan')
  }

  // 3c. Rapikan baris kosong berlebih
  src = src.replace(/\n{3,}/g, '\n\n')

  if (changed > 0) {
    const out = eol === '\r\n' ? src.replace(/\n/g, '\r\n') : src
    write(rel, out)
    ok(changed + ' perubahan diterapkan')
  } else {
    skip('tidak ada perubahan')
  }
}

function step4() {
  head('[4/5] Update .env.example')
  const rel = '.env.example'
  if (!exists(rel)) { warn('tidak ditemukan'); return }
  const raw = read(rel)
  const eol = raw.indexOf('\r\n') !== -1 ? '\r\n' : '\n'
  let src = raw.replace(/\r\n/g, '\n')

  const sudahBersih = src.indexOf('GROQ_API_KEY') !== -1 && src.indexOf('GEMINI_') === -1
  if (sudahBersih) { skip('sudah bersih'); return }

  // Buang semua baris GEMINI_*
  src = src.split('\n').filter(function (l) { return l.indexOf('GEMINI_') !== 0 }).join('\n')
  // Bersihkan trailing whitespace / baris kosong berlebih
  src = src.replace(/\s*$/, '') + '\n'
  // Tambahkan baris Groq
  src += 'GROQ_API_KEY=\nGROQ_MODEL=qwen/qwen3.8-27b\n'

  const out = eol === '\r\n' ? src.replace(/\n/g, '\r\n') : src
  write(rel, out)
  ok('GEMINI_* dibuang, GROQ_* ditambahkan')
}

function step5() {
  head('[5/5] Verifikasi')
  const items = [
    { rel: 'api/_lib/ai-provider.js', mustContain: "from './groq.js'" },
    { rel: 'api/_lib/gemini.js', mustNotExist: true },
    { rel: 'api/_lib/openrouter.js', mustNotExist: true },
    { rel: 'vite.config.js', mustContain: 'pluginApiAi' }
  ]

  for (const it of items) {
    if (it.mustNotExist) {
      if (exists(it.rel)) warn(it.rel + ' masih ada (seharusnya terhapus)')
      else console.log('  \x1b[32m\u2713\x1b[0m ' + it.rel + ' tidak ada (OK)')
      continue
    }
    if (!exists(it.rel)) { warn(it.rel + ' tidak ditemukan'); continue }
    const c = read(it.rel)
    if (c.indexOf(it.mustContain) !== -1) console.log('  \x1b[32m\u2713\x1b[0m ' + it.rel + ' valid')
    else warn(it.rel + ' tidak mengandung "' + it.mustContain + '"')
  }

  // Cek tidak ada sisa debug log
  if (exists('vite.config.js')) {
    const v = read('vite.config.js')
    const adaDebug = v.indexOf('[AI DEBUG]') !== -1 || v.indexOf('[ENV DEBUG]') !== -1
    if (adaDebug) warn('vite.config.js masih mengandung debug log, cek manual')
    else console.log('  \x1b[32m\u2713\x1b[0m vite.config.js bersih dari debug log')
  }
}

// ============ MAIN ============

function main() {
  console.log('\n\x1b[1m\x1b[36m\u{1F9F9} Cleanup AI (Groq-only)\x1b[0m')
  console.log('\x1b[2m   Bersihkan debug log + hapus provider yang tidak terpakai.\x1b[0m')

  if (!exists('package.json') || !exists('src/App.jsx')) {
    console.log('\n\x1b[31mJalankan dari root project (folder yang berisi package.json & src/).\x1b[0m\n')
    process.exit(1)
  }

  try {
    step1()
    step2()
    step3()
    step4()
    step5()
  } catch (e) {
    console.log('\n\x1b[31mGagal: ' + e.message + '\x1b[0m')
    console.error(e)
    process.exit(1)
  }

  console.log('\n\x1b[1m\x1b[32m\u2705 Selesai!\x1b[0m')
  console.log(`
  Langkah selanjutnya:

  1. Restart dev server: Ctrl+C, lalu \x1b[1mnpm run dev\x1b[0m
     Terminal sekarang bersih tanpa log [AI DEBUG] / [ENV DEBUG].

  2. Bersihkan .env.local kamu (manual):
     Hapus baris ini karena sudah tidak dipakai:
       GEMINI_API_KEY=...
       GEMINI_MODEL=...
       OPENROUTER_API_KEY=...
       OPENROUTER_MODEL=...
       AI_PROVIDER=...
     Biarkan GROQ_API_KEY dan GROQ_MODEL tetap ada.

  3. Test: buka /dashboard \u2192 tab Logbook \u2192 klik "Catatan cepat"
     \u2192 tulis draft \u2192 klik "Rapikan". Fungsinya tetap sama.

  4. Kalau pakai Vercel, hapus juga env var GEMINI_* & OPENROUTER_*
     di Settings \u2192 Environment Variables (opsional, tidak wajib).
`)
}

main()