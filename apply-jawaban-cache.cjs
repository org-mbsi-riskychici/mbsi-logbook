#!/usr/bin/env node
'use strict'

/**
 * apply-jawaban-cache.cjs
 * ---------------------------------------------------------------------
 * Tambah cache jawaban AI (lapis 2) di atas cache konteks yang sudah ada.
 *
 * Cara kerja:
 *   - Pertanyaan pertama kali -> hit Groq, simpan jawaban (TTL 1 jam)
 *   - Pertanyaan sama dalam 1 jam -> langsung return, 0 token Groq
 *   - Hanya cache pertanyaan tanpa riwayat (pertanyaan lanjutan tidak,
 *     karena jawabannya depends on history percakapan sebelumnya)
 *
 * Plus: cooldown lebih tegas (5 detik normal, 30 detik rate limit).
 *
 * Backup ke *.bak sebelum rewrite/patch.
 * CRLF-safe, idempotent.
 * ---------------------------------------------------------------------
 */

const fs = require('fs')
const path = require('path')
const ROOT = process.cwd()

function fp(rel) { return path.join(ROOT, rel) }
function exists(rel) { return fs.existsSync(fp(rel)) }
function read(rel) { return fs.readFileSync(fp(rel), 'utf8') }
function write(rel, content) { fs.writeFileSync(fp(rel), content, 'utf8') }
function backup(rel) {
  try { fs.copyFileSync(fp(rel), fp(rel) + '.bak'); return true } catch (e) { return false }
}
function head(m) { console.log('\n\x1b[1m\x1b[36m' + m + '\x1b[0m') }
function ok(m)   { console.log('  \x1b[32m\u2713\x1b[0m ' + m) }
function skip(m) { console.log('  \x1b[2m\u00b7 ' + m + '\x1b[0m') }
function warn(m) { console.log('  \x1b[33m!\x1b[0m ' + m) }

// ==================== KONTEN BARU ====================

const REDIS_HELPER = String.raw`import { Redis } from '@upstash/redis'
import { createHash } from 'node:crypto'

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

/* Normalisasi pertanyaan jadi hash pendek untuk kunci cache jawaban.
   Lowercase + hapus tanda baca + rapikan spasi -> hash SHA-256 -> 16 char.
   Efeknya: "Risky prodi apa?" dan "risky prodi apa" dianggap sama. */
export function kunciJawaban(pertanyaan) {
  const bersih = String(pertanyaan || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  const hash = createHash('sha256').update(bersih).digest('hex').slice(0, 16)
  return 'mbsi:chat:jawaban:v1:' + hash
}
`

const AI_CHAT_ENDPOINT = String.raw`import { createClient } from '@supabase/supabase-js'
import { jawabPertanyaanDospem } from '../_lib/dospem-chat.js'
import { denganCache, ambilRedis, kunciJawaban } from '../_lib/redis.js'

const MAKS_PERTANYAAN = 500
const MAKS_RIWAYAT = 10
const TTL_KONTEKS = 300      // 5 menit
const TTL_JAWABAN = 3600     // 1 jam
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
    const redis = ambilRedis(process.env)
    /* Hanya cache pertanyaan self-contained (tanpa riwayat).
       Kalau ada riwayat, jawaban tergantung konteks percakapan sebelumnya. */
    const bisaPakaiCacheJawaban = riwayat.length === 0
    const kunci = bisaPakaiCacheJawaban ? kunciJawaban(pertanyaan) : null

    /* Lapis 2: cache jawaban AI */
    if (kunci && redis) {
      try {
        const cached = await redis.get(kunci)
        if (cached) {
          console.log('[ai/chat] jawaban dari cache')
          return res.status(200).json({ jawaban: cached, cache: 'jawaban' })
        }
      } catch (e) {
        console.warn('[redis] get jawaban gagal:', e.message)
      }
    }

    /* Lapis 1: cache konteks Supabase */
    const { data: dataTim, dariCache } = await denganCache(
      process.env,
      KUNCI_KONTEKS,
      TTL_KONTEKS,
      function () { return ambilDataTim(process.env) }
    )
    console.log('[ai/chat] konteks tim:', dariCache ? 'dari cache' : 'fresh dari Supabase')

    /* Panggil Groq */
    const jawaban = await jawabPertanyaanDospem(process.env, {
      pertanyaan: pertanyaan,
      riwayat: riwayat,
      data: dataTim
    })

    /* Simpan jawaban ke cache (hanya kalau self-contained) */
    if (kunci && redis) {
      try {
        await redis.set(kunci, jawaban, { ex: TTL_JAWABAN })
      } catch (e) {
        console.warn('[redis] set jawaban gagal:', e.message)
      }
    }

    return res.status(200).json({ jawaban: jawaban, cache: 'fresh' })
  } catch (err) {
    console.error('[ai/chat]', err)
    const status = err.statusCode || 500
    const body = { error: err.message || 'Gagal memanggil AI' }
    if (err.retryAfter) body.retryAfter = err.retryAfter
    return res.status(status).json(body)
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
        const redis = ambilRedis(env)
        const bisaPakaiCacheJawaban = riwayat.length === 0
        const kunci = bisaPakaiCacheJawaban ? kunciJawaban(pertanyaan) : null

        if (kunci && redis) {
          try {
            const cached = await redis.get(kunci)
            if (cached) {
              console.log('[ai/chat] jawaban dari cache')
              kirim(res, 200, { jawaban: cached, cache: 'jawaban' })
              return
            }
          } catch (e) {
            console.warn('[redis] get jawaban gagal:', e.message)
          }
        }

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
        console.log('[ai/chat] konteks tim:', dariCache ? 'dari cache' : 'fresh dari Supabase')

        const jawaban = await jawabPertanyaanDospem(env, {
          pertanyaan: pertanyaan,
          riwayat: riwayat,
          data: dataTim
        })

        if (kunci && redis) {
          try {
            await redis.set(kunci, jawaban, { ex: 3600 })
          } catch (e) {
            console.warn('[redis] set jawaban gagal:', e.message)
          }
        }

        kirim(res, 200, { jawaban: jawaban, cache: 'fresh' })
      } catch (err) {
        console.error('[ai/chat]', err)
        const status = err.statusCode || 500
        const body2 = { error: err.message || 'Gagal memanggil AI' }
        if (err.retryAfter) body2.retryAfter = err.retryAfter
        kirim(res, status, body2)
      }
    })
  }
  return {
    name: 'api-ai-dev',
    configureServer: setupMiddlewares,
    configurePreviewServer: setupMiddlewares
  }
}`

// Update cooldown di ChatWidget: normal 5 detik, rate limit 30 detik
const CHAT_WIDGET_COOLDOWN = String.raw`import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { tanyaDospem } from '../lib/ai.js'
import { TitikAnim } from './ui.jsx'

const NAMA_ASISTEN = 'Konseling Online'
const SUBTITLE_ASISTEN = 'Asisten Magang BSI \u2014 online'
const GREETING = 'Halo! Saya asisten portal magang BSI. Tanya apa saja soal kegiatan tim, kehadiran, atau dokumentasi. Bisa ketik atau rekam suara.'
const KEY_RIWAYAT = 'mbsi-chat-riwayat'
const COOLDOWN_NORMAL = 5
const COOLDOWN_RATE_LIMIT = 30
const SARAN = [
  'Siapa yang paling sering bolos?',
  'Ringkas kegiatan tim minggu ini',
  'Mahasiswa mana yang paling produktif?'
]

function IkonChat() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
function IkonClose() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
function IkonSend() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="17" height="17" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}
function IkonMic() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="17" height="17" aria-hidden="true">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  )
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [riwayat, setRiwayat] = useState(function () {
    try { return JSON.parse(sessionStorage.getItem(KEY_RIWAYAT) || '[]') } catch (e) { return [] }
  })
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [listening, setListening] = useState(false)
  const [micSupported, setMicSupported] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const refScroll = useRef(null)
  const refRecognition = useRef(null)

  useEffect(function () {
    try { sessionStorage.setItem(KEY_RIWAYAT, JSON.stringify(riwayat)) } catch (e) {}
  }, [riwayat])

  useLayoutEffect(function () {
    if (!open) return
    const el = refScroll.current
    if (!el || !autoScroll) return
    requestAnimationFrame(function () {
      if (el) el.scrollTop = el.scrollHeight
    })
  }, [riwayat, busy, error, open, autoScroll])

  function onScrollBody(e) {
    const el = e.currentTarget
    const jarak = el.scrollHeight - el.scrollTop - el.clientHeight
    setAutoScroll(jarak < 80)
  }

  useEffect(function () {
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
    if (!SR) return undefined
    setMicSupported(true)
    const rec = new SR()
    rec.lang = 'id-ID'
    rec.continuous = false
    rec.interimResults = false
    rec.onresult = function (e) {
      const teks = e.results[0][0].transcript
      setInput(function (prev) { return (prev ? prev + ' ' : '') + teks })
    }
    rec.onend = function () { setListening(false) }
    rec.onerror = function () { setListening(false) }
    refRecognition.current = rec
    return function () { try { rec.abort() } catch (e) {} }
  }, [])

  useEffect(function () {
    if (cooldown <= 0) return undefined
    const t = setTimeout(function () {
      setCooldown(function (c) { return Math.max(0, c - 1) })
    }, 1000)
    return function () { clearTimeout(t) }
  }, [cooldown])

  useEffect(function () { if (input) setError('') }, [input])

  async function kirim(teksOverride) {
    const teks = (teksOverride != null ? teksOverride : input).trim()
    if (!teks || busy || cooldown > 0) return
    setBusy(true)
    setError('')
    const riwayatLama = riwayat
    setRiwayat(riwayatLama.concat([{ role: 'user', content: teks }]))
    setInput('')
    setAutoScroll(true)

    try {
      const r = await tanyaDospem(teks, riwayatLama)
      const jawaban = String(r.jawaban || '').trim() || 'Maaf, tidak ada jawaban.'
      setRiwayat(function (prev) { return prev.concat([{ role: 'assistant', content: jawaban }]) })
      setCooldown(COOLDOWN_NORMAL)
    } catch (err) {
      const pesan = err.message || 'Gagal memanggil AI'
      const rateLimit = /terlalu banyak|rate limit|sibuk|429/i.test(pesan)
      setError(rateLimit ? 'Server AI sedang sibuk. Tunggu ' + COOLDOWN_RATE_LIMIT + ' detik, lalu coba lagi.' : pesan)
      setCooldown(rateLimit ? COOLDOWN_RATE_LIMIT : COOLDOWN_NORMAL)
      setRiwayat(riwayatLama)
      setInput(teks)
    }
    setBusy(false)
  }

  function toggleMic() {
    const rec = refRecognition.current
    if (!rec) return
    if (listening) {
      try { rec.stop() } catch (e) {}
      setListening(false)
    } else {
      try { rec.start(); setListening(true) } catch (e) { setListening(false) }
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (cooldown > 0) return
      kirim()
    }
  }

  function reset() {
    if (busy) return
    setRiwayat([])
    setError('')
    setCooldown(0)
    try { sessionStorage.removeItem(KEY_RIWAYAT) } catch (e) {}
  }

  const terkunci = busy || cooldown > 0
  const bubble = riwayat.length ? riwayat : [{ role: 'assistant', content: GREETING }]

  const placeholder = busy
    ? 'Sedang menganalisis...'
    : cooldown > 0
      ? 'Tunggu ' + cooldown + ' detik sebelum kirim lagi'
      : 'Tulis pertanyaan...'

  return (
    <>
      <div className={'chat-widget-panel' + (open ? ' chat-widget-panel-buka' : '')} role="dialog" aria-hidden={!open}>
        <header className="chat-widget-header">
          <span className="chat-widget-avatar" aria-hidden="true">
            <IkonChat />
          </span>
          <div className="chat-widget-title">
            <p className="chat-widget-title-line">{NAMA_ASISTEN}</p>
            <p className="chat-widget-sub">
              <span className="chat-widget-dot-inline" />
              {SUBTITLE_ASISTEN}
            </p>
          </div>
          <button type="button" className="chat-widget-close" onClick={function () { setOpen(false) }} title="Tutup" aria-label="Tutup chat">
            <IkonClose />
          </button>
        </header>

        <div ref={refScroll} className="chat-widget-body" onScroll={onScrollBody}>
          {bubble.map(function (m, i) {
            const dariUser = m.role === 'user'
            return (
              <div key={i} className={'chat-widget-row ' + (dariUser ? 'chat-widget-row-user' : '')}>
                <div className={'chat-widget-bubble ' + (dariUser ? 'chat-widget-bubble-user' : 'chat-widget-bubble-ai')}>
                  {m.content}
                </div>
              </div>
            )
          })}

          {!riwayat.length && !input ? (
            <div className="chat-widget-saran">
              {SARAN.map(function (s) {
                return (
                  <button key={s} type="button" onClick={function () { kirim(s) }} disabled={terkunci} className="chat-widget-saran-btn">
                    {s}
                  </button>
                )
              })}
            </div>
          ) : null}

          {busy ? (
            <div className="chat-widget-row">
              <div className="chat-widget-bubble chat-widget-bubble-ai">
                <span className="inline-flex items-center gap-1">
                  <span>Sedang menganalisis</span>
                  <TitikAnim />
                </span>
              </div>
            </div>
          ) : null}

          {error ? <div className="chat-widget-error">{error}</div> : null}
        </div>

        <footer className="chat-widget-footer">
          <div className="chat-widget-input-wrap">
            <textarea
              className="chat-widget-input"
              rows={1}
              value={input}
              onChange={function (e) { setInput(e.target.value) }}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              disabled={terkunci}
            />
            {micSupported ? (
              <button
                type="button"
                className={'chat-widget-mic' + (listening ? ' chat-widget-mic-aktif' : '')}
                onClick={toggleMic}
                title={listening ? 'Hentikan rekaman' : 'Rekam suara'}
                aria-label="Rekam suara"
                disabled={terkunci}
              >
                <IkonMic />
              </button>
            ) : null}
            <button
              type="button"
              className="chat-widget-send"
              onClick={function () { kirim() }}
              disabled={terkunci || !input.trim()}
              title={cooldown > 0 ? 'Tunggu ' + cooldown + ' detik' : 'Kirim'}
              aria-label="Kirim"
            >
              {cooldown > 0 ? String(cooldown) : <IkonSend />}
            </button>
          </div>
          {riwayat.length ? (
            <p className="chat-widget-catatan">
              <button type="button" onClick={reset} className="chat-widget-reset">Mulai ulang percakapan</button>
            </p>
          ) : (
            <p className="chat-widget-catatan">Jawaban berdasarkan data publik tim.</p>
          )}
        </footer>
      </div>

      <button
        type="button"
        className={'chat-widget-fab' + (open ? ' chat-widget-fab-buka' : '')}
        onClick={function () { setOpen(function (o) { return !o }) }}
        aria-label={open ? 'Tutup chat' : 'Buka chat'}
        title={open ? 'Tutup chat' : 'Tanya asisten'}
      >
        <span className="chat-widget-fab-icon">
          {open ? <IkonClose /> : <IkonChat />}
        </span>
        {!open ? <span className="chat-widget-dot" /> : null}
      </button>
    </>
  )
}
`

// ==================== STEPS ====================

function step1() {
  head('[1/4] Rewrite api/_lib/redis.js (tambah kunciJawaban)')
  const rel = 'api/_lib/redis.js'
  if (!exists(rel)) { warn('tidak ditemukan'); return }
  const src = read(rel)
  if (src.indexOf('export function kunciJawaban') !== -1) { skip('sudah ada kunciJawaban'); return }
  backup(rel)
  write(rel, REDIS_HELPER)
  ok('diperbarui (backup: ' + rel + '.bak)')
}

function step2() {
  head('[2/4] Rewrite api/ai/chat.js (cache jawaban lapis 2)')
  const rel = 'api/ai/chat.js'
  if (!exists(rel)) { warn('tidak ditemukan'); return }
  const src = read(rel)
  if (src.indexOf('TTL_JAWABAN') !== -1 && src.indexOf('cache: \'jawaban\'') !== -1) {
    skip('sudah pakai cache jawaban')
    return
  }
  backup(rel)
  write(rel, AI_CHAT_ENDPOINT)
  ok('ditulis ulang (backup: ' + rel + '.bak)')
}

function step3() {
  head('[3/4] Rewrite pluginApiAi di vite.config.js')
  const rel = 'vite.config.js'
  if (!exists(rel)) { warn('tidak ditemukan'); return }
  const raw = read(rel)
  const eol = raw.indexOf('\r\n') !== -1 ? '\r\n' : '\n'
  let src = raw.replace(/\r\n/g, '\n')

  // Cek sudah pakai cache jawaban
  if (src.indexOf("cache: 'jawaban'") !== -1) {
    skip('sudah pakai cache jawaban')
    return
  }

  // Update import redis.js (tambah ambilRedis, kunciJawaban)
  const importLama = "import { denganCache } from './api/_lib/redis.js'"
  const importBaru = "import { denganCache, ambilRedis, kunciJawaban } from './api/_lib/redis.js'"
  if (src.indexOf(importLama) !== -1 && src.indexOf('ambilRedis') === -1) {
    src = src.replace(importLama, importBaru)
    console.log('  \x1b[32m\u2713\x1b[0m import redis.js diperluas')
  }

  // Rewrite seluruh pluginApiAi
  const reFn = /function pluginApiAi\(env\) \{[\s\S]*?\n\}\n\nexport default defineConfig/
  if (reFn.test(src)) {
    src = src.replace(reFn, PLUGIN_AI_NEW + '\n\nexport default defineConfig')
    console.log('  \x1b[32m\u2713\x1b[0m pluginApiAi diganti versi dengan cache jawaban')
  } else {
    warn('pola pluginApiAi tidak match, cek manual')
    return
  }

  backup(rel)
  const out = eol === '\r\n' ? src.replace(/\n/g, '\r\n') : src
  write(rel, out)
  ok('diperbarui (backup: ' + rel + '.bak)')
}

function step4() {
  head('[4/4] Rewrite ChatWidget.jsx (cooldown lebih tegas)')
  const rel = 'src/components/ChatWidget.jsx'
  if (!exists(rel)) { warn('tidak ditemukan'); return }
  const src = read(rel)
  if (src.indexOf('COOLDOWN_RATE_LIMIT = 30') !== -1) {
    skip('sudah pakai cooldown 30 detik')
    return
  }
  backup(rel)
  write(rel, CHAT_WIDGET_COOLDOWN)
  ok('diperbarui (backup: ' + rel + '.bak)')
}

function step5() {
  head('Verifikasi')
  const checks = [
    { rel: 'api/_lib/redis.js', must: 'export function kunciJawaban' },
    { rel: 'api/ai/chat.js', must: 'TTL_JAWABAN' },
    { rel: 'api/ai/chat.js', must: "cache: 'jawaban'" },
    { rel: 'vite.config.js', must: "cache: 'jawaban'" },
    { rel: 'src/components/ChatWidget.jsx', must: 'COOLDOWN_RATE_LIMIT = 30' }
  ]
  for (const c of checks) {
    if (!exists(c.rel)) { warn(c.rel + ' tidak ada'); continue }
    const src = read(c.rel)
    if (src.indexOf(c.must) !== -1) console.log('  \x1b[32m\u2713\x1b[0m ' + c.rel + ' \u2192 "' + c.must + '"')
    else warn(c.rel + ' tidak mengandung "' + c.must + '"')
  }
}

// ==================== MAIN ====================

function main() {
  console.log('\n\x1b[1m\x1b[36m\u{1F5C3}\uFE0F  Tambah cache jawaban AI + cooldown tegas\x1b[0m')
  console.log('\x1b[2m   Pertanyaan berulang = 0 token Groq. Cooldown 5s/30s.\x1b[0m')

  if (!exists('package.json') || !exists('src/App.jsx')) {
    console.log('\n\x1b[31mJalankan dari root project.\x1b[0m\n')
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
  \x1b[1mYang berubah:\x1b[0m

  \x1b[1mCache jawaban AI (lapis 2):\x1b[0m
  - Pertanyaan pertama kali -> hit Groq, simpan jawaban (TTL 1 jam)
  - Pertanyaan sama dalam 1 jam -> LANGSUNG return, 0 token Groq
  - Hanya cache pertanyaan tanpa riwayat (self-contained)
  - Normalisasi: "Risky prodi apa?" = "risky prodi apa" (case + tanda baca)
  - Key: mbsi:chat:jawaban:v1:<hash>

  \x1b[1mCooldown lebih tegas:\x1b[0m
  - Setelah jawaban sukses: 5 detik (naik dari 3)
  - Setelah error rate limit: 30 detik (naik dari 20)
  - Countdown besar di tombol send
  - Textarea disabled selama cooldown (tidak bisa ngetik)
  - Enter ditolak kalau cooldown > 0

  \x1b[1mLangkah selanjutnya:\x1b[0m

  1. Restart dev server: Ctrl+C, lalu \x1b[1mnpm run dev\x1b[0m
  2. Hard refresh browser: \x1b[1mCtrl+Shift+R\x1b[0m
  3. Test:
     a. Tanya "siapa yang paling bolos?" -> hit Groq
     b. Tunggu 5 detik (cooldown habis)
     c. Tanya pertanyaan yang SAMA -> cek terminal:
        [ai/chat] jawaban dari cache       <- 0 token Groq!
     d. Cek tombol send tampil countdown angka saat cooldown

  \x1b[1mBackup:\x1b[0m Kalau ada masalah, restore dari:
    api/_lib/redis.js.bak
    api/ai/chat.js.bak
    vite.config.js.bak
    src/components/ChatWidget.jsx.bak
`)
}

main()