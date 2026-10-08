#!/usr/bin/env node
/**
 * apply-ai.cjs
 * ---------------------------------------------------------------------
 * Menambahkan fitur "AI Bantu Tulis Logbook" (Gemini) ke project
 * Portal Logbook Magang BSI secara otomatis.
 *
 * Cara pakai (dari root project):
 *   node apply-ai.cjs
 *
 * Setelah sekali jalan, bisa diulang via:
 *   npm run apply-ai
 *
 * Script ini idempotent: aman dijalankan berulang kali.
 * ---------------------------------------------------------------------
 */

'use strict'

const fs = require('fs')
const path = require('path')

const ROOT = process.cwd()

// ===================== HELPERS =====================
function head(msg) { console.log('\n\x1b[1m\x1b[36m' + msg + '\x1b[0m') }
function ok(msg)   { console.log('  \x1b[32m\u2713\x1b[0m ' + msg) }
function skip(msg) { console.log('  \x1b[2m\u00b7 ' + msg + '\x1b[0m') }
function warn(msg) { console.log('  \x1b[33m!\x1b[0m ' + msg) }
function err(msg)  { console.log('  \x1b[31m\u2717\x1b[0m ' + msg) }

function fp(rel)     { return path.join(ROOT, rel) }
function exists(rel) { return fs.existsSync(fp(rel)) }
function read(rel)   { return fs.readFileSync(fp(rel), 'utf8') }
function write(rel, content) {
  fs.mkdirSync(path.dirname(fp(rel)), { recursive: true })
  fs.writeFileSync(fp(rel), content, 'utf8')
}

// ===================== KONTEN FILE BARU =====================

const GEMINI_LIB = String.raw`const BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const DEFAULT_MODEL = 'gemini-2.0-flash'

export function modelGemini(env) {
  return env.GEMINI_MODEL || DEFAULT_MODEL
}

export async function panggilGemini(env, opsi) {
  const key = env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY belum dikonfigurasi di environment')
  const url = BASE + '/' + modelGemini(env) + ':generateContent?key=' + key
  const body = {
    contents: [{ parts: [{ text: opsi.prompt }] }],
    generationConfig: {
      temperature: opsi.temperature == null ? 0.7 : opsi.temperature
    }
  }
  if (opsi.schema) {
    body.generationConfig.responseMimeType = 'application/json'
    body.generationConfig.responseSchema = opsi.schema
  }
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const teks = await r.text()
  if (!r.ok) {
    let pesan = 'Gemini API gagal (status ' + r.status + ')'
    try {
      const j = JSON.parse(teks)
      if (j && j.error && j.error.message) pesan = j.error.message
    } catch (e) {}
    throw new Error(pesan)
  }
  const data = JSON.parse(teks)
  const kand = data && data.candidates && data.candidates[0]
  const parts = kand && kand.content && kand.content.parts
  if (!parts || !parts.length) throw new Error('Gemini tidak mengembalikan jawaban')
  const out = parts.map(function (p) { return p.text || '' }).join('').trim()
  if (!out) throw new Error('Gemini mengembalikan jawaban kosong')
  return out
}

export function parseJsonDariTeks(teks) {
  try { return JSON.parse(teks) } catch (e) {}
  const m = String(teks).match(/\{[\s\S]*\}/)
  if (!m) return null
  try { return JSON.parse(m[0]) } catch (e) { return null }
}

function bangunPrompt(draft, kategoriList, unitList) {
  return [
    'Kamu asisten logbook magang Bank Syariah Indonesia (BSI).',
    '',
    'Tugas: dari catatan kasar mahasiswa, susun logbook harian yang rapi dan profesional dalam Bahasa Indonesia.',
    '',
    'Aturan:',
    '- "judul": ringkasan hari itu, maksimal 12 kata, tanpa titik di akhir.',
    '- "kategori": pilih SATU persis dari daftar ini: ' + kategoriList.join(', ') + '.',
    '- "unit": pilih SATU persis dari daftar berikut, atau "" kalau tidak jelas: ' + unitList.join(', ') + '.',
    '- "items": array 1 sampai 5 kegiatan. Tiap kegiatan punya "judul" (maks 10 kata) dan "deskripsi" (1-2 kalimat singkat).',
    '- "kendala", "solusi", "pembelajaran": isi hanya jika tercantum di catatan. Kalau tidak ada, isi string kosong "".',
    '- Jangan mengarang detail yang tidak ada di catatan.',
    '- Nada profesional, ringkas, tidak berlebihan.',
    '',
    'Catatan kasar mahasiswa:',
    '"""',
    draft.trim(),
    '"""'
  ].join('\n')
}

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    judul: { type: 'STRING' },
    kategori: { type: 'STRING' },
    unit: { type: 'STRING' },
    kendala: { type: 'STRING' },
    solusi: { type: 'STRING' },
    pembelajaran: { type: 'STRING' },
    items: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          judul: { type: 'STRING' },
          deskripsi: { type: 'STRING' }
        },
        required: ['judul', 'deskripsi']
      }
    }
  },
  required: ['judul', 'kategori', 'items']
}

function potong(s, n) { return String(s || '').slice(0, n) }

export async function susunLogbookDenganGemini(env, opts) {
  const draft = String(opts.draft || '').trim()
  if (!draft) throw new Error('Catatan kosong')
  if (draft.length > 2000) throw new Error('Catatan terlalu panjang (maks 2000 karakter)')
  const kat = (opts.kategoriList && opts.kategoriList.length) ? opts.kategoriList : []
  const unit = (opts.unitList && opts.unitList.length) ? opts.unitList : []

  const raw = await panggilGemini(env, {
    prompt: bangunPrompt(draft, kat, unit),
    schema: SCHEMA,
    temperature: 0.7
  })
  const hasil = parseJsonDariTeks(raw)
  if (!hasil) throw new Error('AI tidak menghasilkan JSON valid')

  return {
    judul: potong(hasil.judul, 200),
    kategori: kat.indexOf(hasil.kategori) !== -1 ? hasil.kategori : '',
    unit: unit.indexOf(hasil.unit) !== -1 ? hasil.unit : '',
    kendala: potong(hasil.kendala, 800),
    solusi: potong(hasil.solusi, 800),
    pembelajaran: potong(hasil.pembelajaran, 800),
    items: Array.isArray(hasil.items)
      ? hasil.items.slice(0, 5).map(function (it) {
          return { judul: potong(it.judul, 200), deskripsi: potong(it.deskripsi, 800) }
        }).filter(function (it) { return it.judul })
      : []
  }
}
`

const AI_TULIS_ENDPOINT = String.raw`import { cekSesi } from '../_lib/sesi.js'
import { susunLogbookDenganGemini } from '../_lib/gemini.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const user = await cekSesi(process.env, req.headers.authorization)
  if (!user) return res.status(401).json({ error: 'Sesi tidak valid' })

  const { draft, kategori, unit } = req.body || {}
  if (!draft || !String(draft).trim()) {
    return res.status(400).json({ error: 'Tuliskan dulu catatan kasar kegiatanmu.' })
  }

  try {
    const hasil = await susunLogbookDenganGemini(process.env, {
      draft: draft,
      kategoriList: Array.isArray(kategori) ? kategori : [],
      unitList: Array.isArray(unit) ? unit : []
    })
    return res.status(200).json(hasil)
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Gagal memanggil AI' })
  }
}
`

const AI_CLIENT = String.raw`import { supabase } from './supabase.js'

async function ambilToken() {
  const { data } = await supabase.auth.getSession()
  return data.session ? data.session.access_token : ''
}

export async function bantuTulisLogbook(draft, kategoriList, unitList) {
  const token = await ambilToken()
  if (!token) throw new Error('Sesi login tidak terbaca. Masuk ulang dulu.')
  const r = await fetch('/api/ai/tulis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ draft: draft, kategori: kategoriList, unit: unitList })
  })
  const j = await r.json().catch(function () { return {} })
  if (!r.ok) throw new Error(j.error || 'Gagal memanggil AI')
  return j
}
`

const VITE_PLUGIN = String.raw`function pluginApiAi(env) {
  function kirim(res, code, obj) {
    res.statusCode = code
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(obj))
  }
  const setupMiddlewares = (server) => {
    server.middlewares.use('/api/ai/tulis', async function (req, res) {
      if (req.method !== 'POST') { kirim(res, 405, { error: 'Method tidak diizinkan' }); return }
      const user = await cekSesi(env, req.headers.authorization)
      if (!user) { kirim(res, 401, { error: 'Sesi tidak valid' }); return }
      const body = await bacaBody(req)
      const draft = body.draft
      if (!draft || !String(draft).trim()) {
        kirim(res, 400, { error: 'Tuliskan dulu catatan kasar kegiatanmu.' })
        return
      }
      try {
        const hasil = await susunLogbookDenganGemini(env, {
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
}

`

// ===== Blok UI yang disuntik ke kedua form logbook =====
const AI_UI_BLOCK = String.raw`<div className="rounded-2xl border border-bsi-200 bg-gradient-to-br from-bsi-50 to-white p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-bsi-800 text-white text-lg">&#10024;</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900">Tulis Cepat dengan AI</p>
                  <p className="mt-0.5 text-xs text-slate-600">Ceritakan kegiatanmu sekilas, biar AI yang rapikan.</p>
                </div>
                <button type="button" onClick={function () { setAiOpen(function (v) { return !v }) }}
                  className="shrink-0 text-xs font-bold text-bsi-800 hover:text-bsi-900">
                  {aiOpen ? 'Tutup' : 'Buka'}
                </button>
              </div>
              {aiOpen ? (
                <div className="mt-3 space-y-3">
                  <AutoTextArea
                    className={inputCls}
                    value={aiDraft}
                    onChange={function (e) { setAiDraft(e.target.value) }}
                    placeholder="Contoh: hari ini bantu input data nasabah, ada kendala sistem eror, belajar cara verifikasi berkas"
                    rows={3}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={aiBusy || !aiDraft.trim()}
                      onClick={handleAiTulis}
                      className="rounded-xl bg-bsi-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-bsi-900 disabled:opacity-50"
                    >
                      {aiBusy ? <LabelProses teks="AI menulis" /> : '\u2728 Rapikan dengan AI'}
                    </button>
                    <button
                      type="button"
                      disabled={aiBusy || !aiDraft}
                      onClick={function () { setAiDraft('') }}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Bersihkan
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            `

// ===== Handler DashboardPage =====
const DASH_HANDLER = String.raw`async function handleAiTulis() {
    if (!aiDraft.trim() || aiBusy) return
    setAiBusy(true)
    try {
      const hasil = await bantuTulisLogbook(aiDraft, KATEGORI, UNIT)
      const adaIsiItems = items.some(function (it) {
        return it.judul || it.deskripsi || it.hasil || it.file
      })
      const terapkan = function () {
        setForm(function (f) {
          return Object.assign({}, f, {
            judul: hasil.judul || f.judul,
            kategori: hasil.kategori || f.kategori,
            unit: hasil.unit || f.unit,
            kendala: hasil.kendala || f.kendala,
            solusi: hasil.solusi || f.solusi,
            pembelajaran: hasil.pembelajaran || f.pembelajaran
          })
        })
        if (hasil.items && hasil.items.length) {
          setItems(hasil.items.map(function (it) {
            return Object.assign(newItem(), { judul: it.judul, deskripsi: it.deskripsi })
          }))
        }
        toast.sukses('AI selesai menulis. Periksa dulu sebelum simpan.')
        setAiOpen(false)
      }
      if (adaIsiItems && hasil.items && hasil.items.length) {
        setKonfirmasiEdit({
          judul: 'Ganti Kegiatan yang Sudah Diisi?',
          pesan: 'AI menghasilkan ' + hasil.items.length + ' kegiatan baru. Kegiatan yang sudah kamu isi akan diganti. Lanjutkan?',
          aksi: terapkan
        })
      } else {
        terapkan()
      }
    } catch (err) {
      toast.gagal('AI gagal: ' + err.message)
    }
    setAiBusy(false)
  }

  `

// ===== Handler QuickPage =====
const QUICK_HANDLER = String.raw`async function handleAiTulis() {
    if (!aiDraft.trim() || aiBusy) return
    setAiBusy(true)
    try {
      const hasil = await bantuTulisLogbook(aiDraft, KATEGORI, [])
      if (hasil.kategori && !todayLog && !kategori) setKategori(hasil.kategori)
      if (hasil.items && hasil.items.length) {
        setJudulKegiatan(hasil.items[0].judul || hasil.judul || '')
        setDeskripsi(hasil.items[0].deskripsi || '')
      } else if (hasil.judul) {
        setJudulKegiatan(hasil.judul)
      }
      toast.sukses('AI selesai. Periksa dulu sebelum simpan.')
      setAiOpen(false)
    } catch (err) {
      toast.gagal('AI gagal: ' + err.message)
    }
    setAiBusy(false)
  }

  `

// ===================== STEP FUNCTIONS =====================

function stepGemini() {
  head('[1/8] File api/_lib/gemini.js')
  if (exists('api/_lib/gemini.js')) { skip('sudah ada, dilewati'); return }
  write('api/_lib/gemini.js', GEMINI_LIB)
  ok('dibuat')
}

function stepTulis() {
  head('[2/8] File api/ai/tulis.js')
  if (exists('api/ai/tulis.js')) { skip('sudah ada, dilewati'); return }
  write('api/ai/tulis.js', AI_TULIS_ENDPOINT)
  ok('dibuat')
}

function stepClient() {
  head('[3/8] File src/lib/ai.js')
  if (exists('src/lib/ai.js')) { skip('sudah ada, dilewati'); return }
  write('src/lib/ai.js', AI_CLIENT)
  ok('dibuat')
}

function stepEnv() {
  head('[4/8] Update .env.example')
  if (!exists('.env.example')) { warn('.env.example tidak ditemukan, dilewati'); return }
  let env = read('.env.example')
  if (env.indexOf('GEMINI_API_KEY') !== -1) { skip('sudah berisi GEMINI_API_KEY'); return }
  env = env.replace(/\s*$/, '')
  env += '\nGEMINI_API_KEY=\nGEMINI_MODEL=gemini-2.0-flash\n'
  write('.env.example', env)
  ok('GEMINI_API_KEY & GEMINI_MODEL ditambahkan')
}

function stepVite() {
  head('[5/8] Update vite.config.js')
  if (!exists('vite.config.js')) { warn('vite.config.js tidak ditemukan, dilewati'); return }
  let src = read('vite.config.js')
  let changed = 0

  // 5a. Import gemini helper
  const anchorImport = "import { cekSesi, bacaBody } from './api/_lib/sesi.js'"
  const newImport = anchorImport + "\nimport { susunLogbookDenganGemini } from './api/_lib/gemini.js'"
  if (src.indexOf('api/_lib/gemini.js') === -1) {
    if (src.indexOf(anchorImport) === -1) { warn('anchor import tidak ditemukan'); }
    else { src = src.replace(anchorImport, newImport); changed++ }
  }

  // 5b. Fungsi pluginApiAi
  if (src.indexOf('function pluginApiAi(env)') === -1) {
    const anchorExport = 'export default defineConfig'
    if (src.indexOf(anchorExport) === -1) { warn('anchor export default tidak ditemukan'); }
    else { src = src.replace(anchorExport, VITE_PLUGIN + anchorExport); changed++ }
  }

  // 5c. Daftarkan plugin ke array plugins
  if (src.indexOf('pluginApiAi(env)') === -1 || src.indexOf('pluginApiYoutube(env), pluginApiAi(env)') === -1) {
    const anchorPlugins = 'plugins: [react(), pluginApiR2(env), pluginApiYoutube(env)],'
    const newPlugins = 'plugins: [react(), pluginApiR2(env), pluginApiYoutube(env), pluginApiAi(env)],'
    if (src.indexOf(anchorPlugins) !== -1) {
      src = src.replace(anchorPlugins, newPlugins); changed++
    } else if (src.indexOf(newPlugins) === -1) {
      warn('anchor plugins array tidak ditemukan')
    }
  }

  if (changed === 0) skip('sudah terpasang / tidak ada perubahan')
  else { write('vite.config.js', src); ok(changed + ' sisipan diterapkan') }
}

function stepDashboard() {
  head('[6/8] Update src/pages/DashboardPage.jsx')
  const rel = 'src/pages/DashboardPage.jsx'
  if (!exists(rel)) { warn('file tidak ditemukan, dilewati'); return }
  let src = read(rel)
  let changed = 0

  // 6a. Import bantuTulisLogbook
  if (src.indexOf("from '../lib/ai.js'") === -1) {
    const anchor = "import QrPrintTab from '../components/QrPrintTab.jsx'"
    if (src.indexOf(anchor) === -1) { warn('anchor import QrPrintTab tidak ditemukan'); }
    else { src = src.replace(anchor, anchor + "\nimport { bantuTulisLogbook } from '../lib/ai.js'"); changed++ }
  }

  // 6b. State aiDraft, aiBusy, aiOpen
  if (src.indexOf('const [aiDraft, setAiDraft]') === -1) {
    const anchor = 'const [unsavedModal, setUnsavedModal] = useState(null)\n  const navigate = useNavigate()'
    const newBlock =
      'const [unsavedModal, setUnsavedModal] = useState(null)\n' +
      "  const [aiDraft, setAiDraft] = useState('')\n" +
      '  const [aiBusy, setAiBusy] = useState(false)\n' +
      '  const [aiOpen, setAiOpen] = useState(false)\n' +
      '  const navigate = useNavigate()'
    if (src.indexOf(anchor) === -1) { warn('anchor state unsavedModal tidak ditemukan'); }
    else { src = src.replace(anchor, newBlock); changed++ }
  }

  // 6c. Handler handleAiTulis
  if (src.indexOf('async function handleAiTulis()') === -1) {
    const anchor = '  async function submitLogbook(e) {'
    if (src.indexOf(anchor) === -1) { warn('anchor submitLogbook tidak ditemukan'); }
    else { src = src.replace(anchor, '  ' + DASH_HANDLER + 'async function submitLogbook(e) {'); changed++ }
  }

  // 6d. Blok UI di dalam form logbook
  if (src.indexOf('Tulis Cepat dengan AI') === -1) {
    const anchor = '<form onSubmit={submitLogbook} className="mt-6 space-y-4">\n'
    if (src.indexOf(anchor) === -1) { warn('anchor <form onSubmit={submitLogbook}> tidak ditemukan'); }
    else { src = src.replace(anchor, anchor + AI_UI_BLOCK); changed++ }
  }

  if (changed === 0) skip('sudah terpasang / tidak ada perubahan')
  else { write(rel, src); ok(changed + ' sisipan diterapkan') }
}

function stepQuick() {
  head('[7/8] Update src/pages/QuickPage.jsx')
  const rel = 'src/pages/QuickPage.jsx'
  if (!exists(rel)) { warn('file tidak ditemukan, dilewati'); return }
  let src = read(rel)
  let changed = 0

  // 7a. Import bantuTulisLogbook
  if (src.indexOf("from '../lib/ai.js'") === -1) {
    const anchor = "import { SkeletonQuick } from '../components/Skeleton.jsx'"
    if (src.indexOf(anchor) === -1) { warn('anchor import SkeletonQuick tidak ditemukan'); }
    else { src = src.replace(anchor, anchor + "\nimport { bantuTulisLogbook } from '../lib/ai.js'"); changed++ }
  }

  // 7b. State
  if (src.indexOf('const [aiDraft, setAiDraft]') === -1) {
    const anchor = 'const [tanggalLogs, setTanggalLogs] = useState([])'
    const newBlock =
      anchor + '\n' +
      "  const [aiDraft, setAiDraft] = useState('')\n" +
      '  const [aiBusy, setAiBusy] = useState(false)\n' +
      '  const [aiOpen, setAiOpen] = useState(false)'
    if (src.indexOf(anchor) === -1) { warn('anchor state tanggalLogs tidak ditemukan'); }
    else { src = src.replace(anchor, newBlock); changed++ }
  }

  // 7c. Handler
  if (src.indexOf('async function handleAiTulis()') === -1) {
    const anchor = '  async function submitLogbook(e) {'
    if (src.indexOf(anchor) === -1) { warn('anchor submitLogbook tidak ditemukan'); }
    else { src = src.replace(anchor, '  ' + QUICK_HANDLER + 'async function submitLogbook(e) {'); changed++ }
  }

  // 7d. Blok UI di dalam form logbook
  if (src.indexOf('Tulis Cepat dengan AI') === -1) {
    const anchor = '<form onSubmit={submitLogbook} className="mt-5 space-y-4">\n'
    if (src.indexOf(anchor) === -1) { warn('anchor <form onSubmit={submitLogbook}> tidak ditemukan'); }
    else { src = src.replace(anchor, anchor + AI_UI_BLOCK); changed++ }
  }

  if (changed === 0) skip('sudah terpasang / tidak ada perubahan')
  else { write(rel, src); ok(changed + ' sisipan diterapkan') }
}

function stepPackageJson() {
  head('[8/8] Update package.json')
  if (!exists('package.json')) { warn('package.json tidak ditemukan, dilewati'); return }
  let src = read('package.json')
  if (src.indexOf('"apply-ai"') !== -1) { skip('script apply-ai sudah ada'); return }
  const anchor = '"preview": "vite preview"'
  if (src.indexOf(anchor) === -1) { warn('anchor "preview" tidak ditemukan, tambahkan script manual'); return }
  src = src.replace(anchor, anchor + ',\n    "apply-ai": "node apply-ai.cjs"')
  write('package.json', src)
  ok('script "apply-ai" ditambahkan')
}

// ===================== MAIN =====================

function main() {
  console.log('\n\x1b[1m\x1b[32m\u2728 Apply AI Logbook Feature\x1b[0m')
  console.log('\x1b[2m   Menambahkan fitur "AI Bantu Tulis Logbook" (Gemini) ke project.\x1b[0m')

  if (!exists('package.json') || !exists('src/App.jsx')) {
    err('Script harus dijalankan dari root project (folder yang berisi package.json & src/).')
    process.exit(1)
  }

  try {
    stepGemini()
    stepTulis()
    stepClient()
    stepEnv()
    stepVite()
    stepDashboard()
    stepQuick()
    stepPackageJson()
  } catch (e) {
    err('Gagal: ' + e.message)
    console.error(e)
    process.exit(1)
  }

  head('\u2705 Selesai!')
  console.log(`
  Langkah selanjutnya:

  1. Dapatkan API key Gemini gratis di:
     \x1b[36mhttps://aistudio.google.com/app/apikey\x1b[0m

  2. Tambahkan ke \x1b[1m.env.local\x1b[0m (buat kalau belum ada):
     \x1b[2mGEMINI_API_KEY=AIzaSy...\x1b[0m
     \x1b[2mGEMINI_MODEL=gemini-2.0-flash\x1b[0m

  3. Restart dev server:
     \x1b[1mnpm run dev\x1b[0m

  4. Login sebagai mahasiswa \u2192 buka /dashboard \u2192 tab Logbook
     \u2192 klik "Buka" di panel \u2728 Tulis Cepat dengan AI

  Kalau nanti deploy ke Vercel, tambahkan juga GEMINI_API_KEY dan
  GEMINI_MODEL di Settings \u2192 Environment Variables.

  Catatan: kalau kamu sudah tahu nama model persisnya (misal
  "gemini-2.5-flash"), tinggal ganti nilai GEMINI_MODEL di .env.local
  tanpa perlu mengubah kode.
`)
}

main()