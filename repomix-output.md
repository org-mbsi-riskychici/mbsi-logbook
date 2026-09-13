This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
api/
  r2/
    delete.js
    presign.js
  youtube/
    latest.js
    quota.js
    session.js
    verify.js
src/
  components/
    cards.jsx
    Carousel.jsx
    controls.jsx
    FilterBar.jsx
    icons.jsx
    Layout.jsx
    Skeleton.jsx
    ui.jsx
  lib/
    auth.js
    constants.js
    format.js
    konversi.js
    logbook.js
    supabase.js
    theme.jsx
    upload.js
    youtube.js
  pages/
    AttendancePage.jsx
    DashboardPage.jsx
    DospemPage.jsx
    GalleryPage.jsx
    HomePage.jsx
    LogbookPage.jsx
    LoginPage.jsx
    TimPage.jsx
  App.jsx
  index.css
  main.jsx
supabase/
  schema.sql
.env.example
.gitignore
apply-final-cleanup.cjs
apply-fix-export-unggah.cjs
apply-fix-sisa-netral.cjs
apply-fix-token-aman.cjs
apply-fix-youtube-scope.cjs
apply-galeri-picker.cjs
apply-netral-final.cjs
apply-netral-youtube-dan-titik.cjs
apply-preview-video-controls.cjs
apply-thumb-youtube-fallback.cjs
apply-youtube-backend.cjs
apply-youtube-final-fix.cjs
apply-youtube-final-response.cjs
apply-youtube-final.cjs
apply-youtube-frontend.cjs
apply-youtube-latest-middleware.cjs
apply-youtube-verify.cjs
fix-errors.cjs
index.html
package.json
postcss.config.js
README.md
setup-semua-fitur.cjs
setup-youtube-token.cjs
tailwind.config.js
vercel.json
vite.config.js
```

# Files

## File: api/youtube/latest.js
```javascript
import { createClient } from '@supabase/supabase-js'
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const authClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
  const chk = await authClient.auth.getUser()
  if (chk.error || !chk.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })
  const params = new URLSearchParams()
  params.set('client_id', process.env.YOUTUBE_CLIENT_ID || '')
  params.set('client_secret', process.env.YOUTUBE_CLIENT_SECRET || '')
  params.set('refresh_token', process.env.YOUTUBE_REFRESH_TOKEN || '')
  params.set('grant_type', 'refresh_token')
  const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!tr.ok) return res.status(500).json({ error: 'Gagal refresh token YouTube' })
  const tok = await tr.json()
  const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&order=date&maxResults=1', {
    headers: { Authorization: 'Bearer ' + tok.access_token }
  })
  if (!r.ok) { const t = await r.text(); return res.status(502).json({ error: 'Gagal memeriksa video terbaru: ' + r.status + ' ' + t }) }
  const j = await r.json()
  const item = (j.items || [])[0]
  if (!item) return res.status(404).json({ error: 'Tidak ada video ditemukan' })
  const published = Date.parse(item.snippet.publishedAt)
  if (Date.now() - published > 15 * 60 * 1000) return res.status(404).json({ error: 'Video terbaru terlalu lama' })
  return res.status(200).json({ videoId: item.id.videoId })
}
```

## File: api/youtube/quota.js
```javascript
import { createClient } from '@supabase/supabase-js'
const LIMIT = 5
function ptToday() {
  const now = new Date()
  const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const y = pt.getFullYear()
  const m = String(pt.getMonth() + 1).padStart(2, '0')
  const d = String(pt.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const today = ptToday()
  const { count, error } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
  const used = error ? 0 : (count || 0)
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ limit: LIMIT, used: used, remaining: Math.max(0, LIMIT - used), ptDate: today })
}
```

## File: api/youtube/session.js
```javascript
import { createClient } from '@supabase/supabase-js'
const LIMIT = 5
function ptToday() {
  const now = new Date()
  const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const y = pt.getFullYear()
  const m = String(pt.getMonth() + 1).padStart(2, '0')
  const d = String(pt.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}
async function getAccessToken() {
  const params = new URLSearchParams()
  params.set('client_id', process.env.YOUTUBE_CLIENT_ID || '')
  params.set('client_secret', process.env.YOUTUBE_CLIENT_SECRET || '')
  params.set('refresh_token', process.env.YOUTUBE_REFRESH_TOKEN || '')
  params.set('grant_type', 'refresh_token')
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!r.ok) throw new Error('Gagal refresh token YouTube')
  const j = await r.json()
  if (!j.access_token) throw new Error('Token akses YouTube tidak diterima')
  return j.access_token
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const authClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
  const chk = await authClient.auth.getUser()
  if (chk.error || !chk.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })
  const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const today = ptToday()
  const { count } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
  const used = count || 0
  if (used >= LIMIT) return res.status(429).json({ error: 'Kuota upload YouTube hari ini sudah habis. Gunakan link embed atau coba lagi setelah reset kuota.', remaining: 0 })
  const body = req.body || {}
  if (!body.title) return res.status(400).json({ error: 'Judul video wajib diisi' })
  let access
  try { access = await getAccessToken() } catch (e) { return res.status(500).json({ error: e.message }) }
  const meta = {
    snippet: { title: String(body.title).slice(0, 100), description: String(body.description || '').slice(0, 4000), tags: ['logbook-magang-bsi'], categoryId: '22' },
    status: { privacyStatus: 'unlisted', embeddable: true, publicStatsViewable: false }
  }
  const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + access, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': body.contentType || 'video/mp4' },
    body: JSON.stringify(meta)
  })
  if (!init.ok) { const t = await init.text(); return res.status(502).json({ error: 'Gagal memulai sesi YouTube: ' + t }) }
  const sessionUri = init.headers.get('location')
  if (!sessionUri) return res.status(502).json({ error: 'Sesi upload tidak mengembalikan lokasi' })
  await admin.from('youtube_quota_usage').insert({ pt_date: today, user_id: chk.data.user.id })
  return res.status(200).json({ sessionUri: sessionUri, remaining: Math.max(0, LIMIT - used - 1) })
}
```

## File: api/youtube/verify.js
```javascript
import { createClient } from '@supabase/supabase-js'
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const authClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
  const chk = await authClient.auth.getUser()
  if (chk.error || !chk.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })
  const { ref } = req.body || {}
  if (!ref) return res.status(400).json({ error: 'Ref tidak ada' })
  const params = new URLSearchParams()
  params.set('client_id', process.env.YOUTUBE_CLIENT_ID || '')
  params.set('client_secret', process.env.YOUTUBE_CLIENT_SECRET || '')
  params.set('refresh_token', process.env.YOUTUBE_REFRESH_TOKEN || '')
  params.set('grant_type', 'refresh_token')
  const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!tr.ok) return res.status(500).json({ error: 'Gagal refresh token YouTube' })
  const tok = await tr.json()
  const url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&forMine=true&order=date&maxResults=10&q=' + encodeURIComponent(ref)
  const r = await fetch(url, { headers: { Authorization: 'Bearer ' + tok.access_token } })
  if (!r.ok) return res.status(502).json({ error: 'Gagal memeriksa video di YouTube' })
  const j = await r.json()
  const items = j.items || []
  const batas = Date.now() - 15 * 60 * 1000
  const cocok = items.find(function (it) {
    const desc = (it.snippet && it.snippet.description) || ''
    const t = Date.parse(it.snippet && it.snippet.publishedAt ? it.snippet.publishedAt : '')
    return desc.indexOf('REF ' + ref) === 0 && (isNaN(t) ? true : t >= batas)
  }) || items[0]
  if (!cocok) return res.status(404).json({ error: 'Video tidak ditemukan di channel' })
  return res.status(200).json({ videoId: cocok.id && cocok.id.videoId })
}
```

## File: src/lib/youtube.js
```javascript
import { supabase } from './supabase.js'

export function parseYouTubeId(url) {
  if (!url) return null
  const s = String(url).trim()
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s
  try {
    const u = new URL(s)
    const host = u.hostname.replace('www.', '').replace('m.', '')
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0]
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
    }
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const v = u.searchParams.get('v')
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v
      const parts = u.pathname.split('/').filter(Boolean)
      if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') {
        const id = parts[1]
        return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
      }
    }
  } catch (e) {}
  return null
}
export function ytThumb(id) {
  return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'
}
export function ytEmbedUrl(id) {
  return 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&modestbranding=1'
}
export async function fetchYouTubeQuota() {
  try {
    const r = await fetch('/api/youtube/quota', { cache: 'no-store' })
    if (!r.ok) return { limit: 5, used: 0, remaining: 5 }
    return await r.json()
  } catch (e) {
    return { limit: 5, used: 0, remaining: 5 }
  }
}
export async function startYouTubeSession(title, description, contentType, token) {
  if (!token) throw new Error('Sesi login tidak terbaca. Silakan masuk ulang lalu coba lagi.')
  const r = await fetch('/api/youtube/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ title: title, description: description, contentType: contentType })
  })
  if (!r.ok) {
    const j = await r.json().catch(function () { return { error: 'Gagal memulai sesi upload video' } })
    throw new Error(j.error || 'Gagal memulai sesi upload video')
  }
  return await r.json()
}
export async function uploadToYouTube(sessionUri, blob, onProgress) {
  const hasil = await new Promise(function (resolve) {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', sessionUri)
    xhr.setRequestHeader('Content-Type', blob.type || 'video/mp4')
    if (onProgress) {
      xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) onProgress(e.loaded / e.total)
      }
    }
    xhr.onload = function () { resolve({ status: xhr.status, body: xhr.responseText }) }
    xhr.onerror = function () { resolve({ status: 0, body: '' }) }
    xhr.send(blob)
  })
  if (hasil.status >= 200 && hasil.status < 300) {
    try {
      const j = JSON.parse(hasil.body || '{}')
      if (j && j.id) return { videoId: j.id }
    } catch (e) { /* respons tidak terbaca, pulihkan lewat server */ }
  } else if (hasil.status !== 0) {
    throw new Error('Upload video gagal (status ' + hasil.status + ')')
  }
  const sesi = await supabase.auth.getSession()
  const token = await ambilTokenSesi()
  const r = await fetch('/api/youtube/latest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({})
  })
  if (r.ok) {
    try {
      const j = await r.json()
      if (j && j.videoId) return { videoId: j.videoId }
    } catch (e) {
      console.warn('Respons pemulihan bukan JSON, dilewati:', e.message)
    }
  }
  throw new Error('Upload selesai tetapi id video tidak terbaca. Video kemungkinan sudah tersimpan; tempel link video secara manual.')
}

export async function unggahVideoYouTube(file, judul, onProgress) {
  const sesiData = await supabase.auth.getSession()
  const token = await ambilTokenSesi()
  const sesi = await startYouTubeSession(judul || 'Dokumentasi Magang', 'Diunggah dari portal logbook magang BSI.', file.type || 'video/mp4', token)
  return await uploadToYouTube(sesi.sessionUri, file, onProgress)
}

export async function ambilTokenSesi() {
  try {
    const r = await supabase.auth.getSession()
    const ssn = r && r.data ? r.data.session : null
    return ssn && ssn.access_token ? ssn.access_token : ''
  } catch (e) {
    return ''
  }
}
```

## File: apply-final-cleanup.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai pembersihan akhir jalur YouTube...')
console.log('')

/* ===== 1. youtube.js: bungkus parsing JSON pemulihan dengan try/catch ===== */
const FILE_Y = 'src/lib/youtube.js'
let y = baca(FILE_Y)
const cariY = `  if (r.ok) {
    const j = await r.json()
    if (j.videoId) return { videoId: j.videoId }
  }`
const gantiY = `  if (r.ok) {
    try {
      const j = await r.json()
      if (j && j.videoId) return { videoId: j.videoId }
    } catch (e) {
      console.warn('Respons pemulihan bukan JSON, dilewati:', e.message)
    }
  }`
if (y.includes(gantiY)) {
  console.log('[SUDAH ADA] Pengaman parsing JSON pemulihan di youtube.js')
} else if (y.includes(cariY)) {
  y = y.replace(cariY, gantiY)
  simpan(FILE_Y, y)
  console.log('[BERHASIL] Pengaman parsing JSON pemulihan dipasang di youtube.js')
} else {
  console.log('[TIDAK KETEMU] Pola pemulihan di youtube.js, periksa manual')
}

/* ===== 2. vite.config.js: samakan limit middleware kuota menjadi 5 ===== */
const FILE_V = 'vite.config.js'
let v = baca(FILE_V)
const cariV = `res.end(JSON.stringify({ limit: 6, used: used, remaining: Math.max(0, 5 - used), ptDate: today }))`
const gantiV = `res.end(JSON.stringify({ limit: 5, used: used, remaining: Math.max(0, 5 - used), ptDate: today }))`
if (v.includes(gantiV)) {
  console.log('[SUDAH ADA] Limit middleware kuota sudah 5')
} else if (v.includes(cariV)) {
  v = v.replace(cariV, gantiV)
  simpan(FILE_V, v)
  console.log('[BERHASIL] Limit middleware kuota disamakan menjadi 5')
} else {
  console.log('[TIDAK KETEMU] Pola limit middleware kuota, periksa manual')
}

console.log('')
console.log('Selesai. Restart dev server: Ctrl+C lalu npm run dev -- --host')
console.log('')
console.log('Langkah uji akhir:')
console.log('1. Upload satu video kecil dari form logbook atau galeri.')
console.log('2. Progres 100 persen, lalu id video dipulihkan lewat /api/youtube/latest.')
console.log('3. Logbook atau galeri tersimpan tanpa alert error.')
console.log('4. Tulisan kuota tampil konsisten: sisa dari 5, baik di localhost maupun Vercel.')
console.log('5. Bila pemulihan gagal, pesan yang muncul kini pesan ramah, bukan SyntaxError.')
```

## File: apply-fix-export-unggah.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memperbaiki export unggahVideoYouTube dan favicon...')
console.log('')

/* ===== 1. youtube.js: tambahkan export jembatan unggahVideoYouTube ===== */
const FILE_Y = 'src/lib/youtube.js'
let y = baca(FILE_Y)
if (y.includes('export async function unggahVideoYouTube')) {
  console.log('[SUDAH ADA] export unggahVideoYouTube di youtube.js')
} else if (!y.includes('export async function uploadToYouTube') || !y.includes('export async function startYouTubeSession')) {
  console.log('[TIDAK KETEMU] startYouTubeSession atau uploadToYouTube di youtube.js, batal menambahkan')
} else {
  y = y.trimEnd() + '\n\n' + [
    'export async function unggahVideoYouTube(file, judul, onProgress) {',
    '  const sesiData = await supabase.auth.getSession()',
    '  const token = sesiData.data.session ? sesiData.session.access_token : \'\'',
    '  const sesi = await startYouTubeSession(judul || \'Dokumentasi Magang\', \'Diunggah dari portal logbook magang BSI.\', file.type || \'video/mp4\', token)',
    '  return await uploadToYouTube(sesi.sessionUri, file, onProgress)',
    '}',
    ''
  ].join('\n')
  simpan(FILE_Y, y)
  console.log('[BERHASIL] export unggahVideoYouTube ditambahkan di youtube.js')
}

/* ===== 2. index.html: tambahkan favicon supaya tidak 404 ===== */
const FILE_H = 'index.html'
let h = baca(FILE_H)
if (h.includes('rel="icon"')) {
  console.log('[SUDAH ADA] favicon di index.html')
} else {
  const favicon = '    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg%20xmlns=\'http://www.w3.org/2000/svg\'%20viewBox=\'0%200%2064%2064\'%3E%3Crect%20width=\'64\'%20height=\'64\'%20rx=\'14\'%20fill=\'%2316623c\'/%3E%3Ctext%20x=\'32\'%20y=\'44\'%20font-size=\'34\'%20font-weight=\'700\'%20text-anchor=\'middle\'%20fill=\'%23ffffff\'%20font-family=\'Arial,%20sans-serif\'%3EB%3C/text%3E%3C/svg%3E" />\n'
  if (h.includes('    <title>')) {
    h = h.replace('    <title>', favicon + '    <title>')
    simpan(FILE_H, h)
    console.log('[BERHASIL] favicon ditambahkan di index.html')
  } else {
    console.log('[TIDAK KETEMU] baris title di index.html, favicon dilewati')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka kembali http://localhost:5173/dashboard, halaman tidak lagi blank.')
console.log('2. Uji upload video: progres naik, lalu logbook tersimpan dan kartu menampilkan thumbnail YouTube.')
console.log('3. Favicon hijau muncul di tab browser dan permintaan favicon.ico tidak lagi 404.')
```

## File: apply-fix-sisa-netral.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

function cariGanti(rel, cari, ganti, label) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  if (isi.includes(ganti)) { console.log('[SUDAH ADA] ' + label); return }
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label + ' di ' + rel); return }
  isi = isi.replace(cari, ganti)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

console.log('Memperbaiki regex LabelProses dan menangkap sisa teks...')
console.log('')

/* ===== 1. Fix regex double backslash di LabelProses (ui.jsx) ===== */
cariGanti('src/components/ui.jsx',
  `const bersih = String(props.teks|| '').replace(/\\\\.{3}/g, '').replace(/\\\\s+/g, ' ').trim()`,
  `const bersih = String(props.teks || '').replace(/\\.\\.\\./g, '').replace(/\\s+/g, ' ').trim()`,
  'Regex LabelProses diperbaiki')

/* ===== 2. Fallback teks yang polanya sedikit berbeda ===== */
cariGanti('src/lib/youtube.js',
  'Jaringan gagal saat upload YouTube',
  'Jaringan gagal saat upload video',
  'Pesan jaringan youtube.js dinetralkan')
cariGanti('src/pages/DashboardPage.jsx',
  `Mengunggah... ' + Math.round(p * 100) + '%'`,
  `Mengunggah ' + Math.round(p * 100) + '%'`,
  'Progres R2 dinetralkan dari titik tiga')
cariGanti('src/pages/DashboardPage.jsx',
  'Mengonversi HEIC ke JPG',
  'Mengonversi foto HEIC',
  'Teks konversi HEIC dinetralkan')
cariGanti('src/lib/upload.js',
  'Mengonversi foto ke WebP',
  'Mengonversi foto',
  'Teks konversi WebP dinetralkan')

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
```

## File: apply-fix-token-aman.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

const regexBaris = /^([ \t]*)const ([A-Za-z0-9_]+) = [^\n]*\.access_token[^\n]*$/gm

console.log('Mulai mengamankan pengambilan token sesi...')
console.log('')

/* ===== 1. youtube.js ===== */
const FILE_Y = 'src/lib/youtube.js'
let y = baca(FILE_Y)
const ySebelum = y
y = y.replace(regexBaris, function (m, indent, name) {
  return indent + 'const ' + name + ' = await ambilTokenSesi()'
})
if (y !== ySebelum) console.log('[BERHASIL] Baris access_token di youtube.js diganti fungsi aman')

if (!y.includes('export async function ambilTokenSesi')) {
  y = y.trimEnd() + '\n\n' + [
    'export async function ambilTokenSesi() {',
    '  try {',
    '    const r = await supabase.auth.getSession()',
    '    const ssn = r && r.data ? r.data.session : null',
    '    return ssn && ssn.access_token ? ssn.access_token : \'\'',
    '  } catch (e) {',
    '    return \'\'',
    '  }',
    '}',
    ''
  ].join('\n')
  console.log('[BERHASIL] Fungsi ambilTokenSesi ditambahkan di youtube.js')
} else {
  console.log('[SUDAH ADA] Fungsi ambilTokenSesi di youtube.js')
}

if (!y.includes('Sesi login tidak terbaca')) {
  const cariGuard = `export async function startYouTubeSession(title, description, contentType, token) {
  const r = await fetch('/api/youtube/session', {`
  const gantiGuard = `export async function startYouTubeSession(title, description, contentType, token) {
  if (!token) throw new Error('Sesi login tidak terbaca. Silakan masuk ulang lalu coba lagi.')
  const r = await fetch('/api/youtube/session', {`
  if (y.includes(cariGuard)) {
    y = y.replace(cariGuard, gantiGuard)
    console.log('[BERHASIL] Penjaga token kosong di startYouTubeSession')
  } else {
    console.log('[TIDAK KETEMU] Pola startYouTubeSession, penjaga dilewati')
  }
} else {
  console.log('[SUDAH ADA] Penjaga token kosong di startYouTubeSession')
}
simpan(FILE_Y, y)

/* ===== 2. DashboardPage.jsx ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
let d = baca(FILE_D)
const dSebelum = d
d = d.replace(regexBaris, function (m, indent, name) {
  return indent + 'const ' + name + ' = await ambilTokenSesi()'
})
if (d !== dSebelum) {
  console.log('[BERHASIL] Baris access_token di DashboardPage diganti fungsi aman')
  if (d.includes('ambilTokenSesi()') && !d.includes('ambilTokenSesi }')) {
    d = d.replace("} from '../lib/youtube.js'", ", ambilTokenSesi } from '../lib/youtube.js'")
    console.log('[BERHASIL] Import ambilTokenSesi ditambahkan di DashboardPage')
  }
  simpan(FILE_D, d)
} else {
  console.log('[SUDAH AMAAN] Tidak ada baris access_token langsung di DashboardPage')
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard, pilih mode Video dengan file video kecil, lalu simpan.')
console.log('2. Bila sesi login valid, progres upload berjalan dan logbook tersimpan.')
console.log('3. Bila sesi kedaluwarsa, pesan yang muncul kini kalimat ramah, bukan error access_token.')
console.log('4. Uji juga mode Foto dan mode link YouTube untuk memastikan tidak ada regresi.')
```

## File: apply-fix-youtube-scope.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memperbaiki scope OAuth dan jalur pemulihan...')
console.log('')

/* ===== 1. setup-youtube-token.cjs: tambah scope baca ===== */
const FILE_S = 'setup-youtube-token.cjs'
if (!fs.existsSync(path.join(root, FILE_S))) {
  console.log('[TIDAK KETEMU] ' + FILE_S)
} else {
  let s = baca(FILE_S)
  const cariS = `const scope = 'https://www.googleapis.com/auth/youtube.upload'`
  const gantiS = `const scope = 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly'`
  if (s.includes('youtube.readonly')) {
    console.log('[SUDAH ADA] Scope baca di setup-youtube-token.cjs')
  } else if (s.includes(cariS)) {
    s = s.replace(cariS, gantiS)
    simpan(FILE_S, s)
    console.log('[BERHASIL] Scope baca ditambahkan di setup-youtube-token.cjs')
  } else {
    console.log('[TIDAK KETEMU] Baris scope di setup-youtube-token.cjs')
  }
}

/* ===== 2. api/youtube/latest.js: sertakan alasan asli dari YouTube ===== */
const FILE_L = 'api/youtube/latest.js'
if (!fs.existsSync(path.join(root, FILE_L))) {
  console.log('[TIDAK KETEMU] ' + FILE_L)
} else {
  let l = baca(FILE_L)
  const cariL = `if (!r.ok) return res.status(502).json({ error: 'Gagal memeriksa video terbaru' })`
  const gantiL = `if (!r.ok) { const t = await r.text(); return res.status(502).json({ error: 'Gagal memeriksa video terbaru: ' + r.status + ' ' + t }) }`
  if (l.includes('Gagal memeriksa video terbaru: ')) {
    console.log('[SUDAH ADA] Detail error di api/youtube/latest.js')
  } else if (l.includes(cariL)) {
    l = l.replace(cariL, gantiL)
    simpan(FILE_L, l)
    console.log('[BERHASIL] Detail error ditambahkan di api/youtube/latest.js')
  } else {
    console.log('[TIDAK KETEMU] Baris 502 di api/youtube/latest.js')
  }
}

/* ===== 3. vite.config.js: detail error middleware latest ===== */
const FILE_V = 'vite.config.js'
let v = baca(FILE_V)
const cariV = `if (!r.ok) { res.statusCode = 502; res.end(JSON.stringify({ error: 'Gagal memeriksa video terbaru' })); return }`
const gantiV = `if (!r.ok) { const t = await r.text(); res.statusCode = 502; res.end(JSON.stringify({ error: 'Gagal memeriksa video terbaru: ' + r.status + ' ' + t })); return }`
if (v.includes('Gagal memeriksa video terbaru: ')) {
  console.log('[SUDAH ADA] Detail error middleware latest')
} else if (v.includes(cariV)) {
  v = v.replace(cariV, gantiV)
  simpan(FILE_V, v)
  console.log('[BERHASIL] Detail error middleware latest ditambahkan')
} else {
  console.log('[TIDAK KETEMU] Baris 502 middleware latest di vite.config.js')
}

/* ===== 4. youtube.js: ulangi pemulihan hingga 3 kali ===== */
const FILE_Y = 'src/lib/youtube.js'
let y = baca(FILE_Y)
if (y.includes('for (let percobaan = 0')) {
  console.log('[SUDAH ADA] Pengulangan pemulihan di youtube.js')
} else {
  const regexY = /const v = await fetch\('\/api\/youtube\/latest', \{[\s\S]*?secara manual\.'\)/
  const gantiY = `for (let percobaan = 0; percobaan < 3; percobaan++) {
    if (percobaan > 0) await new Promise(function (tunggu) { setTimeout(tunggu, 4000) })
    const v = await fetch('/api/youtube/latest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({})
    })
    if (v.ok) {
      try {
        const j = await v.json()
        if (j && j.videoId) return { videoId: j.videoId }
      } catch (e) {
        console.warn('Respons pemulihan bukan JSON, dilewati.')
      }
    } else {
      const teks = await v.text().catch(function () { return '' })
      console.warn('Pemulihan percobaan ' + (percobaan + 1) + ' gagal: ' + teks)
    }
  }
  throw new Error('Upload selesai tetapi id video tidak terbaca. Video kemungkinan sudah masuk channel; tempel link YouTube secara manual.')`
  if (regexY.test(y)) {
    y = y.replace(regexY, gantiY)
    simpan(FILE_Y, y)
    console.log('[BERHASIL] Pengulangan pemulihan dipasang di youtube.js')
  } else {
    console.log('[TIDAK KETEMU] Blok pemulihan di youtube.js')
  }
}

console.log('')
console.log('Selesai. Lanjutkan dengan langkah manual berikut:')
console.log('1. Jalankan: node setup-youtube-token.cjs')
console.log('2. Browser terbuka dan kini meminta dua izin: kelola upload dan lihat video YouTube kamu.')
console.log('3. Setujui, lalu salin refresh token BARU yang tercetak di terminal.')
console.log('4. Ganti nilai YOUTUBE_REFRESH_TOKEN di .env.local dengan token baru itu.')
console.log('5. Restart dev server: Ctrl+C lalu npm run dev -- --host')
console.log('6. Uji upload video kecil lagi dari dashboard.')
console.log('7. Sebelum deploy, perbarui juga YOUTUBE_REFRESH_TOKEN di Environment Variables Vercel.')
```

## File: apply-galeri-picker.cjs
```javascript
const fs = require('fs')
const path = require('path')

const root = process.cwd()

function baca(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n')
}

function simpan(rel, isi) {
  fs.writeFileSync(path.join(root, rel), isi, 'utf8')
}

function ganti(rel, cari, gantiDengan, label) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  if (isi.includes(gantiDengan)) { console.log('[SUDAH ADA] ' + label); return }
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label + ' di ' + rel); return }
  isi = isi.replace(cari, gantiDengan)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

function gantiRegex(rel, regex, gantiDengan, label, marker) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  if (marker && isi.includes(marker)) { console.log('[SUDAH ADA] ' + label); return }
  if (!regex.test(isi)) { console.log('[TIDAK KETEMU] ' + label + ' di ' + rel); return }
  isi = isi.replace(regex, gantiDengan)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

const FILE_D = 'src/pages/DashboardPage.jsx'

console.log('Mulai memasang pemilih jenis media pada form galeri...')
console.log('')

/* ===== 1. Import helper YouTube ===== */
if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] ' + FILE_D + ' tidak ditemukan')
  process.exit(1)
}
let d = baca(FILE_D)
if (d.includes("from '../lib/youtube.js'")) {
  console.log('[SUDAH ADA] Import helper YouTube')
} else if (d.includes("from '../lib/konversi.js'")) {
  d = d.replace("from '../lib/konversi.js'", "from '../lib/konversi.js'\nimport { parseYouTubeId, ytThumb, fetchYouTubeQuota, startYouTubeSession, uploadToYouTube } from '../lib/youtube.js'")
  simpan(FILE_D, d)
  console.log('[BERHASIL] Import helper YouTube')
} else {
  console.log('[TIDAK KETEMU] Import helper YouTube')
}

/* ===== 2. State YouTube dan mode galeri ===== */
d = baca(FILE_D)
const stateBaru = []
if (!d.includes('const [ytQuota, setYtQuota]')) stateBaru.push("  const [ytQuota, setYtQuota] = useState({ limit: 6, used: 0, remaining: 6 })")
if (!d.includes('const [galMode, setGalMode]')) stateBaru.push("  const [galMode, setGalMode] = useState('foto')")
if (!d.includes('const [galYtLink, setGalYtLink]')) stateBaru.push("  const [galYtLink, setGalYtLink] = useState('')")
if (!d.includes('const [galOldYt, setGalOldYt]')) stateBaru.push('  const [galOldYt, setGalOldYt] = useState(null)')
if (stateBaru.length === 0) {
  console.log('[SUDAH ADA] State YouTube dan mode galeri')
} else if (d.includes("const [infoProses, setInfoProses] = useState('')")) {
  d = d.replace("const [infoProses, setInfoProses] = useState('')", "const [infoProses, setInfoProses] = useState('')\n" + stateBaru.join('\n'))
  simpan(FILE_D, d)
  console.log('[BERHASIL] State YouTube dan mode galeri (' + stateBaru.length + ' baris)')
} else {
  console.log('[TIDAK KETEMU] State YouTube dan mode galeri')
}

/* ===== 3. Muat kuota YouTube berkala ===== */
ganti(FILE_D,
  `  useEffect(function () {
    if (mahasiswa) refresh()
  }, [mahasiswa])`,
  `  useEffect(function () {
    if (mahasiswa) refresh()
    fetchYouTubeQuota().then(setYtQuota)
    const iv = setInterval(function () { fetchYouTubeQuota().then(setYtQuota) }, 30000)
    return function () { clearInterval(iv) }
  }, [mahasiswa])`,
  'Muat kuota YouTube berkala')

/* ===== 4. Cabang YouTube pada submitGaleri ===== */
ganti(FILE_D,
  `      let mediaPath = ''
      let mediaType = ''
      let mediaThumb = null
      if (galForm.file) {`,
  `      let mediaPath = ''
      let mediaType = ''
      let mediaThumb = null
      let mediaSource = galOldYt ? 'youtube' : 'r2'
      let youtubeId = galOldYt || null
      if (galMode === 'video' && galYtLink && !galForm.file) {
        const id = parseYouTubeId(galYtLink)
        if (!id) { alert('Link YouTube tidak valid.'); setBusy(false); return }
        mediaSource = 'youtube'
        youtubeId = id
        mediaPath = ytThumb(id)
        mediaThumb = ytThumb(id)
        mediaType = 'video'
      } else if (galMode === 'video' && galForm.file) {
        if (ytQuota.remaining <= 0) { alert('Kuota upload YouTube hari ini sudah habis. Gunakan link YouTube.'); setBusy(false); return }
        const sesiData = await supabase.auth.getSession()
        const tokenS = sesiData.data.session ? sesiData.data.session.access_token : ''
        const sesi = await startYouTubeSession(galForm.judul || ('Dokumentasi ' + galForm.tanggal), galForm.deskripsi || '', galForm.file.type || 'video/mp4', tokenS)
        const hasilYt = await uploadToYouTube(sesi.sessionUri, galForm.file, function (p) { setInfoProses('Mengunggah ke YouTube... ' + Math.round(p * 100) + '%') })
        mediaSource = 'youtube'
        youtubeId = hasilYt.videoId
        mediaPath = ytThumb(hasilYt.videoId)
        mediaThumb = ytThumb(hasilYt.videoId)
        mediaType = 'video'
        setYtQuota(function (q) { return Object.assign({}, q, { used: q.used + 1, remaining: Math.max(0, q.remaining - 1) }) })
        fetchYouTubeQuota().then(setYtQuota)
      } else if (galForm.file) {`,
  'Cabang YouTube pada submitGaleri')
ganti(FILE_D,
  `        media_path: mediaPath,
        media_type: mediaType,
        media_thumb: mediaThumb
      }`,
  `        media_path: mediaPath,
        media_type: mediaType,
        media_thumb: mediaThumb,
        media_source: mediaSource,
        youtube_id: youtubeId
      }`,
  'Payload galeri membawa kolom YouTube')

/* ===== 5. startEditGal membawa mode dan sumber lama ===== */
ganti(FILE_D,
  `setGalForm({ judul: g.judul, deskripsi: g.deskripsi || '', tanggal: g.tanggal, kegiatan: g.kegiatan, file: null, preview: g.media_path, oldPath: g.media_path, oldThumb: g.media_thumb || '', previewLoading: false })`,
  `setGalForm({ judul: g.judul, deskripsi: g.deskripsi || '', tanggal: g.tanggal, kegiatan: g.kegiatan, file: null, preview: g.media_path || '', oldPath: g.media_source === 'youtube' ? '' : (g.media_path || ''), oldThumb: g.media_source === 'youtube' ? '' : (g.media_thumb || ''), previewLoading: false })
    setGalMode(g.media_source === 'youtube' ? 'video' : (g.media_type === 'video' ? 'video' : 'foto'))
    setGalYtLink('')
    setGalOldYt(g.youtube_id || null)`,
  'startEditGal membawa mode dan sumber lama')

/* ===== 6. Reset mode galeri setelah simpan dan batal ===== */
d = baca(FILE_D)
if (d.includes('setGalOldYt(null)')) {
  console.log('[SUDAH ADA] Reset mode galeri')
} else {
  const polaReset = `setGalForm({ judul: '', deskripsi: '', tanggal: todayInput(), kegiatan: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false })`
  const gantiReset = polaReset + `\n    setGalMode('foto')\n    setGalYtLink('')\n    setGalOldYt(null)`
  if (d.includes(polaReset)) {
    d = d.split(polaReset).join(gantiReset)
    simpan(FILE_D, d)
    console.log('[BERHASIL] Reset mode galeri')
  } else {
    console.log('[TIDAK KETEMU] Reset mode galeri')
  }
}

/* ===== 7. hapusMediaR2 melewatkan URL YouTube ===== */
ganti(FILE_D,
  `  async function hapusMediaR2(url) {
    const key = keyDariUrl(url)`,
  `  async function hapusMediaR2(url) {
    if (String(url || '').indexOf('i.ytimg.com') !== -1 || String(url || '').indexOf('youtube') !== -1) return
    const key = keyDariUrl(url)`,
  'hapusMediaR2 melewatkan URL YouTube')

/* ===== 8. Hapus galeri melewatkan media YouTube ===== */
ganti(FILE_D,
  `      const urls = target.data.logbook_item_id ? [] : [target.data.media_path, target.data.media_thumb].filter(Boolean)`,
  `      const urls = target.data.logbook_item_id || target.data.media_source === 'youtube' ? [] : [target.data.media_path, target.data.media_thumb].filter(Boolean)`,
  'Hapus galeri melewatkan media YouTube')

/* ===== 9. UI pemilih jenis media pada form galeri ===== */
gantiRegex(FILE_D,
  /<label className=\{labelCls\}>Pilih foto atau video[\s\S]*?\}\} \/>\s*<\/div>\s*<\/div>/,
  `<label className={labelCls}>Jenis media {editGalId ? null : <span className="text-red-500">*</span>}</label>
                <div className="mt-1.5 flex gap-2">
                  <button type="button" onClick={function () { setGalMode('foto') }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (galMode !== 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Foto</button>
                  <button type="button" onClick={function () { setGalMode('video') }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (galMode === 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Video</button>
                </div>
                <div className="mt-1.5">
                  {galMode === 'video' ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500">Sisa kuota upload YouTube hari ini: {ytQuota.remaining} dari {ytQuota.limit}</p>
                      <div className={ytQuota.remaining <= 0 && !galForm.file ? 'opacity-50 pointer-events-none' : ''}>
                        <FileInput accept="video/*" fileName={galForm.file ? galForm.file.name : ''}
                          onChange={function (e) {
                            const f = e.target.files[0]
                            if (!f) return
                            setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: URL.createObjectURL(f), previewLoading: false }) })
                          }} />
                      </div>
                      {ytQuota.remaining <= 0 ? <p className="text-xs text-red-600">Kuota habis. Gunakan link YouTube di bawah.</p> : null}
                      <input className={inputCls} value={galYtLink} onChange={function (e) { setGalYtLink(e.target.value) }} placeholder="Atau tempel link YouTube (unlisted)" />
                    </div>
                  ) : (
                    <FileInput accept="image/*" fileName={galForm.file ? galForm.file.name : ''}
                      onChange={async function (e) {
                        const f = e.target.files[0]
                        if (!f) return
                        if (formatHeic(f)) {
                          setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: '', previewLoading: true }) })
                          const blob = await pratinjauHeic(f)
                          const preview = blob ? URL.createObjectURL(blob) : URL.createObjectURL(f)
                          setGalForm(function (g) { return Object.assign({}, g, { preview: preview, previewLoading: false }) })
                        } else {
                          setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: URL.createObjectURL(f), previewLoading: false }) })
                        }
                      }} />
                  )}
                </div>
              </div>`,
  'UI pemilih jenis media pada form galeri',
  'Jenis media {editGalId')

/* ===== 10. Kartu galeri menampilkan thumbnail untuk media YouTube ===== */
gantiRegex('src/components/cards.jsx',
  /<SmartFit src=\{item\.media_thumb \|\| item\.media_path\}[^/]*\/>/,
  `{item.media_source === 'youtube' ? (
        <img src={item.media_path} alt={item.judul} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <SmartFit src={item.media_thumb || item.media_path} full={item.media_path} type={item.media_type} alt={item.judul} />
      )}`,
  'Kartu galeri menampilkan thumbnail untuk media YouTube',
  '<img src={item.media_path} alt={item.judul} className="absolute inset-0 h-full w-full object-cover" />')

console.log('')
console.log('Selesai. Vite akan memuat ulang otomatis.')
console.log('')
console.log('Catatan:')
console.log('1. Tidak ada SQL baru. Kolom media_source dan youtube_id sudah kamu tambahkan sebelumnya.')
console.log('2. Script aman dijalankan ulang karena setiap langkah memeriksa penanda lebih dulu.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard, tab Galeri, perhatikan label kini bertuliskan Jenis media dengan tombol Foto dan Video.')
console.log('2. Pilih Foto: muncul FileInput gambar dengan pratinjau HEIC seperti sebelumnya.')
console.log('3. Pilih Video: muncul sisa kuota harian, FileInput video, dan kolom link YouTube.')
console.log('4. Saat kuota habis, FileInput video mengabu dan hanya kolom link yang bisa dipakai.')
console.log('5. Simpan media YouTube: kartu galeri menampilkan thumbnail YouTube, dan modal detail memutar embed.')
console.log('6. Edit media YouTube: mode otomatis terpilih Video dan tombol simpan mempertahankan sumber lama.')
console.log('7. Hapus media YouTube: tidak ada percobaan hapus ke R2 karena penjaga URL sudah aktif.')
```

## File: apply-netral-final.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Pembersihan akhir teks proses dan pemindaian sisa sebutan YouTube...')
console.log('')

/* ===== 1. Bersihkan titik tiga pada teks onInfo di upload.js dan konversi.js ===== */
;['src/lib/upload.js', 'src/lib/konversi.js'].forEach(function (rel) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  const sebelum = isi
  isi = isi.replace(/onInfo\('([^'\n]*?)\.\.\.'\)/g, "onInfo('$1')")
  isi = isi.replace(/Mengunggah\.\.\. ' \+ /g, "Mengunggah ' + ")
  if (isi !== sebelum) {
    simpan(rel, isi)
    console.log('[BERHASIL] Teks proses dibersihkan di ' + rel)
  } else {
    console.log('[SUDAH BERSIH] ' + rel)
  }
})

/* ===== 2. Bersihkan pola serupa di DashboardPage bila masih tersisa ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[LEWATI] DashboardPage tidak ditemukan')
} else {
  let d = baca(FILE_D)
  const sebelum = d
  d = d.replace(/setInfoProses\('([^'\n]*?)\.\.\.'\)/g, "setInfoProses('$1')")
  d = d.replace(/setInfoProses\('([^'\n]*?)\.\.\. ' \+ /g, "setInfoProses('$1 ' + ")
  if (d !== sebelum) {
    simpan(FILE_D, d)
    console.log('[BERHASIL] Teks proses dibersihkan di DashboardPage')
  } else {
    console.log('[SUDAH BERSIH] DashboardPage')
  }
}

/* ===== 3. Pindai sisa sebutan YouTube huruf kapital di seluruh src ===== */
console.log('')
console.log('Pemindaian sisa teks YouTube huruf kapital pada folder src:')
let ketemu = 0
function jalan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  entries.forEach(function (e) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) { jalan(full); return }
    if (!/\.(jsx?|css|html)$/.test(e.name)) return
    const isi = fs.readFileSync(full, 'utf8')
    isi.split('\n').forEach(function (b, i) {
      if (b.includes('YouTube')) {
        ketemu++
        console.log('  ' + path.relative(root, full) + ':' + (i + 1) + '  ' + b.trim().slice(0, 120))
      }
    })
  })
}
jalan(path.join(root, 'src'))
if (ketemu === 0) console.log('  Tidak ada sisa teks YouTube huruf kapital. Bersih.')

console.log('')
console.log('Catatan: baris berisi alamat embed youtube-nocookie, i.ytimg, atau googleapis adalah teknis')
console.log('dan tidak tampil sebagai teks merek kepada pengguna, jadi wajar bila muncul di pemindaian huruf kecil.')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Langkah uji:')
console.log('1. Simpan logbook berisi foto atau video, perhatikan tombol simpan.')
console.log('2. Teks proses tampil tanpa titik tiga statis, diikuti tiga titik animasi yang halus.')
console.log('3. Contoh tampilan: Mengunggah 43 persen dengan titik berdenyut, bukan Mengunggah... 43 persen.')
console.log('4. Tidak ada kata YouTube pada label kuota, placeholder, peringatan, maupun tombol.')
```

## File: apply-netral-youtube-dan-titik.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

function semua(rel, cari, ganti, label) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label); return }
  isi = isi.split(cari).join(ganti)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

function sisip(rel, cari, ganti, label) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  if (isi.includes(ganti)) { console.log('[SUDAH ADA] ' + label); return }
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label); return }
  isi = isi.replace(cari, ganti)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

function tambah(rel, marker, blok, label) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  if (isi.includes(marker)) { console.log('[SUDAH ADA] ' + label); return }
  isi = isi.trimEnd() + '\n\n' + blok
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

console.log('Mulai menetralkan sebutan YouTube dan memasang animasi titik...')
console.log('')

/* ===== 1. index.css: animasi titik halus ===== */
tambah('src/index.css', '.titik-anim', `.titik-anim {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-left: 6px;
}
.titik-anim i {
  width: 4px;
  height: 4px;
  border-radius: 9999px;
  background: currentColor;
  opacity: 0.2;
  animation: titik-halus 1.1s ease-in-out infinite;
}
.titik-anim i:nth-child(2) { animation-delay: 0.18s; }
.titik-anim i:nth-child(3) { animation-delay: 0.36s; }
@keyframes titik-halus {
  0%, 60%, 100% { opacity: 0.2; transform: translateY(0) scale(0.9); }
  30% { opacity: 1; transform: translateY(-1px) scale(1); }
}`, 'CSS animasi titik di index.css')

/* ===== 2. ui.jsx: komponen TitikAnim dan LabelProses ===== */
tambah('src/components/ui.jsx', 'export function LabelProses', `export function TitikAnim() {
  return (
    <span className="titik-anim" aria-hidden="true">
      <i></i>
      <i></i>
      <i></i>
    </span>
  )
}
export function LabelProses(props) {
  const bersih = String(props.teks || '').replace(/\\.{3}/g, '').replace(/\\s+/g, ' ').trim()
  return (
    <span className="inline-flex items-center justify-center">
      <span>{bersih}</span>
      <TitikAnim />
    </span>
  )
}`, 'Komponen TitikAnim dan LabelProses di ui.jsx')

/* ===== 3. ui.jsx: netralkan placeholder pratinjau dan pemutar ===== */
semua('src/components/ui.jsx', `<SizedIcon name="youtube" size={26} />`, `<SizedIcon name="video" size={26} />`, 'Ikon placeholder pratinjau menjadi ikon video')
semua('src/components/ui.jsx', `Menyiapkan thumbnail YouTube...`, `Menyiapkan pratinjau video`, 'Teks placeholder pratinjau dinetralkan')
semua('src/components/ui.jsx', `Thumbnail belum siap di YouTube`, `Pratinjau video belum siap`, 'Teks placeholder permanen dinetralkan')
semua('src/components/ui.jsx', `alt={props.alt || 'Thumbnail YouTube'}`, `alt={props.alt || 'Pratinjau video'}`, 'Alt text pratinjau dinetralkan')
semua('src/components/ui.jsx', `src={'https://www.youtube-nocookie.com/embed/' + props.youtubeId}`, `src={'https://www.youtube-nocookie.com/embed/' + props.youtubeId + '?rel=0&modestbranding=1'}`, 'Pemutar lightbox meminimalkan merek')

/* ===== 4. cards.jsx: minimalkan merek pada embed detail ===== */
semua('src/components/cards.jsx', `embed/' + it.youtube_id}`, `embed/' + it.youtube_id + '?rel=0&modestbranding=1'}`, 'Embed detail logbook meminimalkan merek')
semua('src/components/cards.jsx', `embed/' + item.youtube_id}`, `embed/' + item.youtube_id + '?rel=0&modestbranding=1'}`, 'Embed detail galeri meminimalkan merek')

/* ===== 5. youtube.js: netralkan pesan error ===== */
semua('src/lib/youtube.js', `Upload YouTube gagal (status `, `Upload video gagal (status `, 'Pesan gagal upload dinetralkan')
semua('src/lib/youtube.js', `Jaringan gagal saat upload YouTube`, `Jaringan gagal saat upload video`, 'Pesan jaringan dinetralkan')
semua('src/lib/youtube.js', `Video kemungkinan sudah masuk channel; tempel link YouTube secara manual.`, `Video kemungkinan sudah tersimpan; tempel link video secara manual.`, 'Pesan pemulihan dinetralkan')
semua('src/lib/youtube.js', `Gagal membuat sesi YouTube`, `Gagal memulai sesi upload video`, 'Pesan sesi dinetralkan')

/* ===== 6. upload.js: netralkan teks konversi ===== */
semua('src/lib/upload.js', `Mengonversi foto ke WebP...`, `Mengonversi foto`, 'Teks konversi foto dinetralkan')

/* ===== 7. DashboardPage: import LabelProses ===== */
sisip('src/pages/DashboardPage.jsx',
  `import { pratinjauHeic, formatHeic } from '../lib/konversi.js'`,
  `import { pratinjauHeic, formatHeic } from '../lib/konversi.js'
import { LabelProses } from '../components/ui.jsx'`,
  'Import LabelProses di DashboardPage')

/* ===== 8. DashboardPage: netralkan semua teks YouTube ===== */
semua('src/pages/DashboardPage.jsx', `Sisa kuota upload YouTube hari ini:`, `Sisa kuota upload video hari ini:`, 'Label kuota dinetralkan')
semua('src/pages/DashboardPage.jsx', `Atau tempel link YouTube (unlisted)`, `Atau tempel link video eksternal`, 'Placeholder link dinetralkan')
semua('src/pages/DashboardPage.jsx', `Kuota habis. Gunakan link YouTube di bawah.`, `Kuota habis. Gunakan link video di bawah.`, 'Peringatan kuota dinetralkan')
semua('src/pages/DashboardPage.jsx', `Kuota upload YouTube hari ini sudah habis. Gunakan link YouTube.`, `Kuota upload video hari ini sudah habis. Gunakan link video.`, 'Alert kuota dinetralkan')
semua('src/pages/DashboardPage.jsx', `Link YouTube tidak valid`, `Link video tidak valid`, 'Alert link dinetralkan')
semua('src/pages/DashboardPage.jsx', `Mengunggah ke YouTube... ' + Math.round(p * 100) + '%'`, `Mengunggah video ' + Math.round(p * 100) + '%'`, 'Progres upload video dinetralkan')
semua('src/pages/DashboardPage.jsx', `Mengunggah... ' + Math.round(p * 100) + '%'`, `Mengunggah ' + Math.round(p * 100) + '%'`, 'Progres upload R2 tanpa titik statis')
semua('src/pages/DashboardPage.jsx', `Mengonversi HEIC ke JPG...`, `Mengonversi foto HEIC`, 'Teks konversi HEIC dinetralkan')
semua('src/pages/DashboardPage.jsx', `Mengonversi pratinjau HEIC...`, `Mengonversi pratinjau`, 'Teks pratinjau HEIC dinetralkan')

/* ===== 9. DashboardPage: tombol proses memakai animasi titik ===== */
semua('src/pages/DashboardPage.jsx', `{busy ? (infoProses || 'Menyimpan...') :`, `{busy ? <LabelProses teks={infoProses || 'Menyimpan'} /> :`, 'Tombol simpan logbook dan galeri beranimasi titik')
semua('src/pages/DashboardPage.jsx', `{busy ? 'Menyimpan...' :`, `{busy ? <LabelProses teks="Menyimpan" /> :`, 'Tombol simpan lainnya beranimasi titik')

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Hasil yang akan terlihat:')
console.log('1. Tidak ada lagi kata YouTube pada label kuota, placeholder link, peringatan, maupun progres.')
console.log('2. Placeholder pratinjau video memakai ikon video umum, bukan ikon YouTube.')
console.log('3. Tombol sibuk menampilkan tiga titik kecil yang memudar dan naik turun secara halus dan berurutan.')
console.log('4. Progres persen tetap tampil, misalnya Mengunggah 43 persen, diikuti titik beranimasi.')
console.log('5. Pemutar embed memakai parameter modestbranding dan rel=0 untuk meminimalkan merek bawaan.')
```

## File: apply-preview-video-controls.cjs
```javascript
const fs = require('fs')
const path = require('path')

const root = process.cwd()
const FILE = 'src/pages/DashboardPage.jsx'

if (!fs.existsSync(path.join(root, FILE))) {
  console.log('[GAGAL] File tidak ditemukan: ' + FILE)
  process.exit(1)
}

let isi = fs.readFileSync(path.join(root, FILE), 'utf8').replace(/\r\n/g, '\n')
let berubah = false

const pasangan = [
  {
    cari: '<video src={it.preview} className="absolute inset-0 h-full w-full object-contain" muted />',
    ganti: '<video src={it.preview} controls playsInline preload="metadata" className="absolute inset-0 h-full w-full object-contain" />',
    label: 'Pratinjau video kegiatan bisa diputar dan digeser durasinya'
  },
  {
    cari: '<video src={galForm.preview} className="absolute inset-0 h-full w-full object-contain" muted />',
    ganti: '<video src={galForm.preview} controls playsInline preload="metadata" className="absolute inset-0 h-full w-full object-contain" />',
    label: 'Pratinjau video galeri bisa diputar dan digeser durasinya'
  }
]

for (const p of pasangan) {
  if (isi.includes(p.ganti)) {
    console.log('[SUDAH ADA] ' + p.label)
  } else if (isi.includes(p.cari)) {
    isi = isi.replace(p.cari, p.ganti)
    berubah = true
    console.log('[BERHASIL] ' + p.label)
  } else {
    console.log('[TIDAK KETEMU] ' + p.label)
  }
}

if (berubah) {
  fs.writeFileSync(path.join(root, FILE), isi, 'utf8')
}

console.log('')
console.log('Selesai. Vite akan memuat ulang otomatis.')
console.log('')
console.log('Langkah uji:')
console.log('1. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('2. Pilih file video di form logbook maupun form galeri.')
console.log('3. Pratinjau kini menampilkan pemutar: tombol putar, garis durasi yang bisa digeser, pengatur suara, dan tombol layar penuh.')
console.log('4. Durasi total muncul sesaat setelah file dipilih karena metadata dimuat lebih dulu.')
console.log('5. Tombol silang merah di pojok kanan atas tetap berfungsi untuk melepas lampiran.')
console.log('6. Video tidak berbunyi sendiri karena tidak ada autoplay, bunyi baru keluar setelah tombol putar ditekan.')
```

## File: apply-thumb-youtube-fallback.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang fallback thumbnail YouTube...')
console.log('')

/* ===== 1. ui.jsx: komponen MediaYouTube dengan coba ulang otomatis ===== */
const FILE_U = 'src/components/ui.jsx'
let u = baca(FILE_U)
if (u.includes('export function MediaYouTube')) {
  console.log('[SUDAH ADA] Komponen MediaYouTube di ui.jsx')
} else {
  u = u.trimEnd() + '\n\n' + `export function MediaYouTube(props) {
  const [status, setStatus] = useState('muat')
  const [coba, setCoba] = useState(0)
  useEffect(function () {
    if (status !== 'tunggu') return undefined
    const t = setTimeout(function () {
      setCoba(function (c) { return c + 1 })
      setStatus('muat')
    }, 15000)
    return function () { clearTimeout(t) }
  }, [status])
  if (status === 'tunggu' || status === 'habis') {
    return (
      <div className={'grid place-items-center bg-slate-800 ' + (props.className || 'absolute inset-0 h-full w-full')}>
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <SizedIcon name="youtube" size={26} />
          <p className="px-2 text-center text-[11px] font-semibold">{status === 'habis' ? 'Thumbnail belum siap di YouTube' : 'Menyiapkan thumbnail YouTube...'}</p>
        </div>
      </div>
    )
  }
  return (
    <img
      src={props.src + (coba > 0 ? (String(props.src).indexOf('?') === -1 ? '?' : '&') + 'r=' + coba : '')}
      alt={props.alt || 'Thumbnail YouTube'}
      onClick={props.onClick || undefined}
      onError={function () { setStatus(coba >= 3 ? 'habis' : 'tunggu') }}
      onLoad={function () { setStatus('muat') }}
      className={props.className || 'absolute inset-0 h-full w-full object-cover'}
    />
  )
}
`
  simpan(FILE_U, u)
  console.log('[BERHASIL] Komponen MediaYouTube ditambahkan di ui.jsx')
}

/* ===== 2. ui.jsx: SmartFit delegasi thumbnail YouTube ke MediaYouTube ===== */
u = baca(FILE_U)
const anchorSmart = `  const mediaRef = useRef(null)
  const isVideo = props.type === 'video'`
const sisipSmart = `  const mediaRef = useRef(null)
  const isVideo = props.type === 'video'
  if (!isVideo && String(props.src || '').indexOf('i.ytimg.com') !== -1) {
    return <MediaYouTube src={props.src} alt={props.alt} onClick={props.onClick} className="absolute inset-0 h-full w-full object-cover" />
  }`
if (u.includes("i.ytimg.com') !== -1")) {
  console.log('[SUDAH ADA] Delegasi YouTube di SmartFit')
} else if (u.includes(anchorSmart)) {
  u = u.replace(anchorSmart, sisipSmart)
  simpan(FILE_U, u)
  console.log('[BERHASIL] SmartFit mendelegasikan thumbnail YouTube')
} else {
  console.log('[TIDAK KETEMU] Anchor SmartFit di ui.jsx')
}

/* ===== 3. cards.jsx: pakai MediaYouTube pada kartu media YouTube ===== */
const FILE_C = 'src/components/cards.jsx'
let c = baca(FILE_C)
let berubahC = false
if (!c.includes('MediaYouTube')) {
  c = c.replace(/import \{([^}]*)\} from '\.\/ui\.jsx'/, function (m, g) {
    return 'import {' + g + ', MediaYouTube } from \'./ui.jsx\''
  })
  berubahC = true
}
const imgYt = `<img src={item.media_path} alt={item.judul} className="absolute inset-0 h-full w-full object-cover" />`
if (c.includes(imgYt)) {
  c = c.replace(imgYt, `<MediaYouTube src={item.media_path} alt={item.judul} />`)
  berubahC = true
}
if (berubahC) {
  simpan(FILE_C, c)
  console.log('[BERHASIL] cards.jsx memakai MediaYouTube')
} else {
  console.log('[SUDAH ADA] cards.jsx sudah memakai MediaYouTube')
}

/* ===== 4. App.jsx: bungkam peringatan React Router ===== */
const FILE_A = 'src/App.jsx'
let a = baca(FILE_A)
if (a.includes('v7_startTransition')) {
  console.log('[SUDAH ADA] Future flag React Router')
} else if (a.includes('<BrowserRouter>')) {
  a = a.replace('<BrowserRouter>', '<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>')
  simpan(FILE_A, a)
  console.log('[BERHASIL] Future flag React Router dipasang')
} else {
  console.log('[TIDAK KETEMU] Baris BrowserRouter di App.jsx')
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perilaku baru:')
console.log('1. Saat thumbnail YouTube belum siap, kartu menampilkan placeholder rapi berikon YouTube.')
console.log('2. Komponen mencoba ulang setiap 15 detik sampai empat kali, jadi gambar muncul sendiri.')
console.log('3. Bila setelah empat percobaan masih belum ada, placeholder permanen tampil tanpa gambar rusak.')
console.log('4. Peringatan React Router di konsol tidak muncul lagi.')
console.log('5. Baris CORS dan pesan internal pemain YouTube tetap ada tetapi tidak mengganggu fungsi.')
```

## File: apply-youtube-backend.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function simpan(rel, isi) {
  const full = path.join(root, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, isi, 'utf8')
  console.log('[BERHASIL] ' + rel + ' ditulis')
}

const LIMIT_PER_DAY = 6

const quotaJs = `import { createClient } from '@supabase/supabase-js'
const LIMIT = 6
function ptToday() {
  const now = new Date()
  const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const y = pt.getFullYear()
  const m = String(pt.getMonth() + 1).padStart(2, '0')
  const d = String(pt.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const today = ptToday()
  const { count, error } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
  const used = error ? 0 : (count || 0)
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ limit: LIMIT, used: used, remaining: Math.max(0, LIMIT - used), ptDate: today })
}
`

const sessionJs = `import { createClient } from '@supabase/supabase-js'
const LIMIT = 6
function ptToday() {
  const now = new Date()
  const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const y = pt.getFullYear()
  const m = String(pt.getMonth() + 1).padStart(2, '0')
  const d = String(pt.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}
async function getAccessToken() {
  const params = new URLSearchParams()
  params.set('client_id', process.env.YOUTUBE_CLIENT_ID || '')
  params.set('client_secret', process.env.YOUTUBE_CLIENT_SECRET || '')
  params.set('refresh_token', process.env.YOUTUBE_REFRESH_TOKEN || '')
  params.set('grant_type', 'refresh_token')
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!r.ok) throw new Error('Gagal refresh token YouTube')
  const j = await r.json()
  if (!j.access_token) throw new Error('Token akses YouTube tidak diterima')
  return j.access_token
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const authClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
  const chk = await authClient.auth.getUser()
  if (chk.error || !chk.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })
  const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const today = ptToday()
  const { count } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
  const used = count || 0
  if (used >= LIMIT) return res.status(429).json({ error: 'Kuota upload YouTube hari ini sudah habis. Gunakan link embed atau coba lagi setelah reset kuota.', remaining: 0 })
  const body = req.body || {}
  if (!body.title) return res.status(400).json({ error: 'Judul video wajib diisi' })
  let access
  try { access = await getAccessToken() } catch (e) { return res.status(500).json({ error: e.message }) }
  const meta = {
    snippet: { title: String(body.title).slice(0, 100), description: String(body.description || '').slice(0, 4000), tags: ['logbook-magang-bsi'], categoryId: '22' },
    status: { privacyStatus: 'unlisted', embeddable: true, publicStatsViewable: false }
  }
  const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + access,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Type': body.contentType || 'video/mp4'
    },
    body: JSON.stringify(meta)
  })
  if (!init.ok) { const t = await init.text(); return res.status(502).json({ error: 'Gagal memulai sesi YouTube: ' + t }) }
  const sessionUri = init.headers.get('location')
  if (!sessionUri) return res.status(502).json({ error: 'Sesi upload tidak mengembalikan lokasi' })
  await admin.from('youtube_quota_usage').insert({ pt_date: today, user_id: chk.data.user.id })
  return res.status(200).json({ sessionUri, remaining: Math.max(0, LIMIT - used - 1) })
}
`

simpan('api/youtube/quota.js', quotaJs)
simpan('api/youtube/session.js', sessionJs)

console.log('\nSelesai. Push ke GitHub untuk deploy endpoint di Vercel.')
```

## File: apply-youtube-final-fix.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai menyelesaikan sisa pemasangan fitur YouTube...')
console.log('')

/* ===== 1. UI pemilih jenis media pada form galeri ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
let d = baca(FILE_D)
if (d.includes("galMode === 'video'")) {
  console.log('[SUDAH ADA] UI pemilih jenis media pada form galeri')
} else {
  const regexGal = /<label className=\{labelCls\}>Pilih foto atau video[\s\S]*?\}\} \/>\s*<\/div>/
  const blokGal = `<label className={labelCls}>Jenis media {editGalId ? null : <span className="text-red-500">*</span>}</label>
                <div className="mt-1.5 flex gap-2">
                  <button type="button" onClick={function () { setGalMode('foto') }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (galMode !== 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Foto</button>
                  <button type="button" onClick={function () { setGalMode('video') }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (galMode === 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Video</button>
                </div>
                <div className="mt-1.5">
                  {galMode === 'video' ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500">Sisa kuota upload YouTube hari ini: {ytQuota.remaining} dari {ytQuota.limit}</p>
                      <div className={ytQuota.remaining <= 0 && !galForm.file ? 'opacity-50 pointer-events-none' : ''}>
                        <FileInput accept="video/*" fileName={galForm.file ? galForm.file.name : ''}
                          onChange={async function (e) {
                            const f = e.target.files[0]
                            if (!f) return
                            if (formatHeic(f)) {
                              setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: '', previewLoading: true }) })
                              const blob = await pratinjauHeic(f)
                              const preview = blob ? URL.createObjectURL(blob) : URL.createObjectURL(f)
                              setGalForm(function (g) { return Object.assign({}, g, { preview: preview, previewLoading: false }) })
                            } else {
                              setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: URL.createObjectURL(f), previewLoading: false }) })
                            }
                          }} />
                      </div>
                      {ytQuota.remaining <= 0 ? <p className="text-xs text-red-600">Kuota habis. Gunakan link YouTube di bawah.</p> : null}
                      <input className={inputCls} value={galYtLink} onChange={function (e) { setGalYtLink(e.target.value) }} placeholder="Atau tempel link YouTube (unlisted)" />
                    </div>
                  ) : (
                    <FileInput accept="image/*" fileName={galForm.file ? galForm.file.name : ''}
                      onChange={async function (e) {
                        const f = e.target.files[0]
                        if (!f) return
                        if (formatHeic(f)) {
                          setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: '', previewLoading: true }) })
                          const blob = await pratinjauHeic(f)
                          const preview = blob ? URL.createObjectURL(blob) : URL.createObjectURL(f)
                          setGalForm(function (g) { return Object.assign({}, g, { preview: preview, previewLoading: false }) })
                        } else {
                          setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: URL.createObjectURL(f), previewLoading: false }) })
                        }
                      }} />
                  )}
                </div>`
  if (!regexGal.test(d)) {
    console.log('[TIDAK KETEMU] Blok form media galeri di DashboardPage.jsx')
  } else {
    d = d.replace(regexGal, blokGal)
    simpan(FILE_D, d)
    console.log('[BERHASIL] UI pemilih jenis media pada form galeri')
  }
}

/* ===== 2. Middleware dan plugin YouTube di vite.config.js ===== */
const FILE_V = 'vite.config.js'
let v = baca(FILE_V)
if (v.includes('pluginApiYoutube')) {
  console.log('[SUDAH ADA] Middleware dan plugin YouTube di vite.config.js')
} else {
  const fungsiPlugin = `function pluginApiYoutube(env) {
  const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  function ptToday() {
    const now = new Date()
    const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
    const y = pt.getFullYear()
    const m = String(pt.getMonth() + 1).padStart(2, '0')
    const d = String(pt.getDate()).padStart(2, '0')
    return y + '-' + m + '-' + d
  }
  async function cekSesi(req) {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) return null
    const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
    const r = await supabase.auth.getUser(token)
    return r.error ? null : r.data.user
  }
  return {
    name: 'api-youtube-dev',
    configureServer(server) {
      server.middlewares.use('/api/youtube/quota', async function (req, res) {
        const today = ptToday()
        const { count } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
        const used = count || 0
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', 'no-store')
        res.end(JSON.stringify({ limit: 6, used: used, remaining: Math.max(0, 6 - used), ptDate: today }))
      })
      server.middlewares.use('/api/youtube/session', async function (req, res) {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Method tidak diizinkan' })); return }
        const user = await cekSesi(req)
        if (!user) { res.statusCode = 401; res.end(JSON.stringify({ error: 'Sesi tidak valid' })); return }
        const today = ptToday()
        const { count } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
        const used = count || 0
        if (used >= 6) { res.statusCode = 429; res.end(JSON.stringify({ error: 'Kuota upload YouTube hari ini sudah habis. Gunakan link embed.', remaining: 0 })); return }
        const body = await bacaBody(req)
        const params = new URLSearchParams()
        params.set('client_id', env.YOUTUBE_CLIENT_ID || '')
        params.set('client_secret', env.YOUTUBE_CLIENT_SECRET || '')
        params.set('refresh_token', env.YOUTUBE_REFRESH_TOKEN || '')
        params.set('grant_type', 'refresh_token')
        const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
        if (!tr.ok) { res.statusCode = 500; res.end(JSON.stringify({ error: 'Gagal refresh token YouTube' })); return }
        const tok = await tr.json()
        const meta = {
          snippet: { title: String(body.title || 'Dokumentasi Magang').slice(0, 100), description: String(body.description || '').slice(0, 4000), tags: ['logbook-magang-bsi'], categoryId: '22' },
          status: { privacyStatus: 'unlisted', embeddable: true, publicStatsViewable: false }
        }
        const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + tok.access_token, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': body.contentType || 'video/mp4' },
          body: JSON.stringify(meta)
        })
        if (!init.ok) { const t = await init.text(); res.statusCode = 502; res.end(JSON.stringify({ error: 'Gagal memulai sesi YouTube: ' + t })); return }
        const sessionUri = init.headers.get('location')
        if (!sessionUri) { res.statusCode = 502; res.end(JSON.stringify({ error: 'Sesi upload tidak mengembalikan lokasi' })); return }
        await admin.from('youtube_quota_usage').insert({ pt_date: today, user_id: user.id })
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ sessionUri: sessionUri, remaining: Math.max(0, 6 - used - 1) }))
      })
    }
  }
}
`
  const cariExport = `export default defineConfig(function ({ mode }) {`
  const cariPlugins = `plugins: [react(), pluginApiR2(env)]`
  if (!v.includes(cariExport) || !v.includes(cariPlugins)) {
    console.log('[TIDAK KETEMU] Pola export atau plugins di vite.config.js')
  } else {
    v = v.replace(cariExport, fungsiPlugin + cariExport)
    v = v.replace(cariPlugins, `plugins: [react(), pluginApiR2(env), pluginApiYoutube(env)]`)
    simpan(FILE_V, v)
    console.log('[BERHASIL] Middleware dan plugin YouTube di vite.config.js')
  }
}

console.log('')
console.log('Selesai. Restart dev server agar middleware baru aktif:')
console.log('  Ctrl+C lalu npm run dev -- --host')
console.log('')
console.log('Pastikan .env.local memuat: YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN, SUPABASE_SERVICE_ROLE_KEY')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard, tab Galeri, perhatikan tombol Foto dan Video kini muncul.')
console.log('2. Pilih Video: terlihat sisa kuota, FileInput video, dan kolom link YouTube.')
console.log('3. Saat kuota habis, FileInput video menjadi abu-abu dan hanya link yang aktif.')
console.log('4. Uji di localhost: endpoint /api/youtube/quota harus menjawab JSON sisa kuota.')
```

## File: apply-youtube-final-response.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) {
  const full = path.join(root, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, isi, 'utf8')
  console.log('[BERHASIL] ' + rel + ' ditulis')
}
function ganti(rel, cari, gantiDengan, label) {
  let isi = baca(rel)
  if (isi.includes(gantiDengan)) { console.log('[SUDAH ADA] ' + label); return }
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label + ' di ' + rel); return }
  isi = isi.replace(cari, gantiDengan)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}
function gantiSemua(rel, cari, gantiDengan, label) {
  let isi = baca(rel)
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label + ' di ' + rel); return }
  isi = isi.split(cari).join(gantiDengan)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

console.log('Mulai memperbaiki pemulihan respons final upload YouTube...')
console.log('')

/* ===== 1. youtube.js: pulihkan id video bila respons final diblokir CORS ===== */
simpan('src/lib/youtube.js', `import { supabase } from './supabase.js'

export function parseYouTubeId(url) {
  if (!url) return null
  const s = String(url).trim()
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s
  try {
    const u = new URL(s)
    const host = u.hostname.replace('www.', '').replace('m.', '')
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0]
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
    }
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const v = u.searchParams.get('v')
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v
      const parts = u.pathname.split('/').filter(Boolean)
      if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') {
        const id = parts[1]
        return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
      }
    }
  } catch (e) {}
  return null
}
export function ytThumb(id) {
  return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'
}
export function ytEmbedUrl(id) {
  return 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&modestbranding=1'
}
export async function fetchYouTubeQuota() {
  try {
    const r = await fetch('/api/youtube/quota', { cache: 'no-store' })
    if (!r.ok) return { limit: 5, used: 0, remaining: 5 }
    return await r.json()
  } catch (e) {
    return { limit: 5, used: 0, remaining: 5 }
  }
}
export async function startYouTubeSession(title, description, contentType, token) {
  const r = await fetch('/api/youtube/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ title: title, description: description, contentType: contentType })
  })
  if (!r.ok) {
    const j = await r.json().catch(function () { return { error: 'Gagal membuat sesi YouTube' } })
    throw new Error(j.error || 'Gagal membuat sesi YouTube')
  }
  return await r.json()
}
export async function uploadToYouTube(sessionUri, blob, onProgress) {
  const hasil = await new Promise(function (resolve) {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', sessionUri)
    xhr.setRequestHeader('Content-Type', blob.type || 'video/mp4')
    if (onProgress) {
      xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) onProgress(e.loaded / e.total)
      }
    }
    xhr.onload = function () { resolve({ status: xhr.status, body: xhr.responseText }) }
    xhr.onerror = function () { resolve({ status: 0, body: '' }) }
    xhr.send(blob)
  })
  if (hasil.status >= 200 && hasil.status < 300) {
    try {
      const j = JSON.parse(hasil.body || '{}')
      if (j && j.id) return { videoId: j.id }
    } catch (e) { /* respons tidak terbaca, pulihkan lewat server */ }
  } else if (hasil.status !== 0) {
    throw new Error('Upload YouTube gagal (status ' + hasil.status + ')')
  }
  const sesi = await supabase.auth.getSession()
  const token = sesi.data.session ? sesi.data.session.access_token : ''
  const r = await fetch('/api/youtube/latest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({})
  })
  if (r.ok) {
    const j = await r.json()
    if (j.videoId) return { videoId: j.videoId }
  }
  throw new Error('Upload selesai tetapi id video tidak terbaca. Video kemungkinan sudah masuk channel; tempel link YouTube secara manual.')
}
`)

/* ===== 2. Endpoint pemulihan id video terbaru ===== */
simpan('api/youtube/latest.js', `import { createClient } from '@supabase/supabase-js'
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const authClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
  const chk = await authClient.auth.getUser()
  if (chk.error || !chk.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })
  const params = new URLSearchParams()
  params.set('client_id', process.env.YOUTUBE_CLIENT_ID || '')
  params.set('client_secret', process.env.YOUTUBE_CLIENT_SECRET || '')
  params.set('refresh_token', process.env.YOUTUBE_REFRESH_TOKEN || '')
  params.set('grant_type', 'refresh_token')
  const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!tr.ok) return res.status(500).json({ error: 'Gagal refresh token YouTube' })
  const tok = await tr.json()
  const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&order=date&maxResults=1', {
    headers: { Authorization: 'Bearer ' + tok.access_token }
  })
  if (!r.ok) return res.status(502).json({ error: 'Gagal memeriksa video terbaru' })
  const j = await r.json()
  const item = (j.items || [])[0]
  if (!item) return res.status(404).json({ error: 'Tidak ada video ditemukan' })
  const published = Date.parse(item.snippet.publishedAt)
  if (Date.now() - published > 15 * 60 * 1000) return res.status(404).json({ error: 'Video terbaru terlalu lama' })
  return res.status(200).json({ videoId: item.id.videoId })
}
`)

/* ===== 3. Kuota harian menjadi 5 di endpoint Vercel ===== */
simpan('api/youtube/quota.js', `import { createClient } from '@supabase/supabase-js'
const LIMIT = 5
function ptToday() {
  const now = new Date()
  const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const y = pt.getFullYear()
  const m = String(pt.getMonth() + 1).padStart(2, '0')
  const d = String(pt.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const today = ptToday()
  const { count, error } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
  const used = error ? 0 : (count || 0)
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ limit: LIMIT, used: used, remaining: Math.max(0, LIMIT - used), ptDate: today })
}
`)
simpan('api/youtube/session.js', `import { createClient } from '@supabase/supabase-js'
const LIMIT = 5
function ptToday() {
  const now = new Date()
  const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const y = pt.getFullYear()
  const m = String(pt.getMonth() + 1).padStart(2, '0')
  const d = String(pt.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}
async function getAccessToken() {
  const params = new URLSearchParams()
  params.set('client_id', process.env.YOUTUBE_CLIENT_ID || '')
  params.set('client_secret', process.env.YOUTUBE_CLIENT_SECRET || '')
  params.set('refresh_token', process.env.YOUTUBE_REFRESH_TOKEN || '')
  params.set('grant_type', 'refresh_token')
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!r.ok) throw new Error('Gagal refresh token YouTube')
  const j = await r.json()
  if (!j.access_token) throw new Error('Token akses YouTube tidak diterima')
  return j.access_token
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const authClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
  const chk = await authClient.auth.getUser()
  if (chk.error || !chk.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })
  const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const today = ptToday()
  const { count } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
  const used = count || 0
  if (used >= LIMIT) return res.status(429).json({ error: 'Kuota upload YouTube hari ini sudah habis. Gunakan link embed atau coba lagi setelah reset kuota.', remaining: 0 })
  const body = req.body || {}
  if (!body.title) return res.status(400).json({ error: 'Judul video wajib diisi' })
  let access
  try { access = await getAccessToken() } catch (e) { return res.status(500).json({ error: e.message }) }
  const meta = {
    snippet: { title: String(body.title).slice(0, 100), description: String(body.description || '').slice(0, 4000), tags: ['logbook-magang-bsi'], categoryId: '22' },
    status: { privacyStatus: 'unlisted', embeddable: true, publicStatsViewable: false }
  }
  const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + access, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': body.contentType || 'video/mp4' },
    body: JSON.stringify(meta)
  })
  if (!init.ok) { const t = await init.text(); return res.status(502).json({ error: 'Gagal memulai sesi YouTube: ' + t }) }
  const sessionUri = init.headers.get('location')
  if (!sessionUri) return res.status(502).json({ error: 'Sesi upload tidak mengembalikan lokasi' })
  await admin.from('youtube_quota_usage').insert({ pt_date: today, user_id: chk.data.user.id })
  return res.status(200).json({ sessionUri: sessionUri, remaining: Math.max(0, LIMIT - used - 1) })
}
`)

/* ===== 4. Middleware dev lokal: endpoint latest dan kuota 5 ===== */
ganti('vite.config.js',
  `        server.middlewares.use('/api/youtube/session'`,
  `        server.middlewares.use('/api/youtube/latest', async function (req, res) {
          if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Method tidak diizinkan' })); return }
          const user = await cekSesi(req)
          if (!user) { res.statusCode = 401; res.end(JSON.stringify({ error: 'Sesi tidak valid' })); return }
          const params = new URLSearchParams()
          params.set('client_id', env.YOUTUBE_CLIENT_ID || '')
          params.set('client_secret', env.YOUTUBE_CLIENT_SECRET || '')
          params.set('refresh_token', env.YOUTUBE_REFRESH_TOKEN || '')
          params.set('grant_type', 'refresh_token')
          const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
          if (!tr.ok) { res.statusCode = 500; res.end(JSON.stringify({ error: 'Gagal refresh token YouTube' })); return }
          const tok = await tr.json()
          const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&order=date&maxResults=1', { headers: { Authorization: 'Bearer ' + tok.access_token } })
          if (!r.ok) { res.statusCode = 502; res.end(JSON.stringify({ error: 'Gagal memeriksa video terbaru' })); return }
          const j = await r.json()
          const item = (j.items || [])[0]
          if (!item) { res.statusCode = 404; res.end(JSON.stringify({ error: 'Tidak ada video ditemukan' })); return }
          const published = Date.parse(item.snippet.publishedAt)
          if (Date.now() - published > 15 * 60 * 1000) { res.statusCode = 404; res.end(JSON.stringify({ error: 'Video terbaru terlalu lama' })); return }
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ videoId: item.id.videoId }))
        })
        server.middlewares.use('/api/youtube/session'`,
  'Middleware /api/youtube/latest untuk dev lokal')
gantiSemua('vite.config.js', 'used >= 6', 'used >= 5', 'Batas kuota middleware session menjadi 5')
gantiSemua('vite.config.js', '6 - used', '5 - used', 'Sisa kuota middleware menjadi 5')

console.log('')
console.log('Selesai. Restart dev server agar middleware baru aktif:')
console.log('  Ctrl+C lalu npm run dev -- --host')
console.log('')
console.log('Langkah uji:')
console.log('1. Upload satu video kecil lagi dari form logbook atau galeri.')
console.log('2. Progres mencapai 100 persen lalu aplikasi otomatis memulihkan id video dari channel.')
console.log('3. Logbook tersimpan tanpa error dan kartu menampilkan thumbnail YouTube.')
console.log('4. Kuota harian kini tampil sebagai X dari 5 karena setiap upload memakai 1600 unit')
console.log('   ditambah 100 unit untuk pemulihan id video, total 8500 dari 10000 unit harian.')
```

## File: apply-youtube-final.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ganti(rel, cari, gantiDengan, label, semua) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  if (isi.includes(gantiDengan)) { console.log('[SUDAH ADA] ' + label); return }
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label + ' di ' + rel); return }
  isi = semua ? isi.split(cari).join(gantiDengan) : isi.replace(cari, gantiDengan)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}
function tulis(rel, isi, label) {
  const full = path.join(root, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, isi, 'utf8')
  console.log('[BERHASIL] ' + label)
}

console.log('Mulai memasang fitur media YouTube menyeluruh...')
console.log('')

/* ===== 1. api/youtube/quota.js ===== */
tulis('api/youtube/quota.js', `import { createClient } from '@supabase/supabase-js'
const LIMIT = 6
function ptToday() {
  const now = new Date()
  const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const y = pt.getFullYear()
  const m = String(pt.getMonth() + 1).padStart(2, '0')
  const d = String(pt.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const today = ptToday()
  const { count, error } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
  const used = error ? 0 : (count || 0)
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ limit: LIMIT, used: used, remaining: Math.max(0, LIMIT - used), ptDate: today })
}
`, 'api/youtube/quota.js ditulis')

/* ===== 2. api/youtube/session.js ===== */
tulis('api/youtube/session.js', `import { createClient } from '@supabase/supabase-js'
const LIMIT = 6
function ptToday() {
  const now = new Date()
  const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const y = pt.getFullYear()
  const m = String(pt.getMonth() + 1).padStart(2, '0')
  const d = String(pt.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}
async function getAccessToken() {
  const params = new URLSearchParams()
  params.set('client_id', process.env.YOUTUBE_CLIENT_ID || '')
  params.set('client_secret', process.env.YOUTUBE_CLIENT_SECRET || '')
  params.set('refresh_token', process.env.YOUTUBE_REFRESH_TOKEN || '')
  params.set('grant_type', 'refresh_token')
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!r.ok) throw new Error('Gagal refresh token YouTube')
  const j = await r.json()
  if (!j.access_token) throw new Error('Token akses YouTube tidak diterima')
  return j.access_token
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const authClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
  const chk = await authClient.auth.getUser()
  if (chk.error || !chk.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })
  const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const today = ptToday()
  const { count } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
  const used = count || 0
  if (used >= LIMIT) return res.status(429).json({ error: 'Kuota upload YouTube hari ini sudah habis. Gunakan link embed atau coba lagi setelah reset kuota.', remaining: 0 })
  const body = req.body || {}
  if (!body.title) return res.status(400).json({ error: 'Judul video wajib diisi' })
  let access
  try { access = await getAccessToken() } catch (e) { return res.status(500).json({ error: e.message }) }
  const meta = {
    snippet: { title: String(body.title).slice(0, 100), description: String(body.description || '').slice(0, 4000), tags: ['logbook-magang-bsi'], categoryId: '22' },
    status: { privacyStatus: 'unlisted', embeddable: true, publicStatsViewable: false }
  }
  const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + access, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': body.contentType || 'video/mp4' },
    body: JSON.stringify(meta)
  })
  if (!init.ok) { const t = await init.text(); return res.status(502).json({ error: 'Gagal memulai sesi YouTube: ' + t }) }
  const sessionUri = init.headers.get('location')
  if (!sessionUri) return res.status(502).json({ error: 'Sesi upload tidak mengembalikan lokasi' })
  await admin.from('youtube_quota_usage').insert({ pt_date: today, user_id: chk.data.user.id })
  return res.status(200).json({ sessionUri: sessionUri, remaining: Math.max(0, LIMIT - used - 1) })
}
`, 'api/youtube/session.js ditulis')

/* ===== 3. src/lib/youtube.js ===== */
tulis('src/lib/youtube.js', `export function parseYouTubeId(url) {
  if (!url) return null
  const s = String(url).trim()
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s
  try {
    const u = new URL(s)
    const host = u.hostname.replace('www.', '').replace('m.', '')
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0]
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
    }
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const v = u.searchParams.get('v')
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v
      const parts = u.pathname.split('/').filter(Boolean)
      if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') {
        const id = parts[1]
        return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
      }
    }
  } catch (e) {}
  return null
}
export function ytThumb(id) {
  return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'
}
export function ytEmbedUrl(id) {
  return 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&modestbranding=1'
}
export async function fetchYouTubeQuota() {
  try {
    const r = await fetch('/api/youtube/quota', { cache: 'no-store' })
    if (!r.ok) return { limit: 6, used: 0, remaining: 6 }
    return await r.json()
  } catch (e) {
    return { limit: 6, used: 0, remaining: 6 }
  }
}
export async function startYouTubeSession(title, description, contentType, token) {
  const r = await fetch('/api/youtube/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ title: title, description: description, contentType: contentType })
  })
  if (!r.ok) {
    const j = await r.json().catch(function () { return { error: 'Gagal membuat sesi YouTube' } })
    throw new Error(j.error || 'Gagal membuat sesi YouTube')
  }
  return await r.json()
}
export function uploadToYouTube(sessionUri, blob, onProgress) {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', sessionUri)
    xhr.setRequestHeader('Content-Type', blob.type || 'video/mp4')
    if (onProgress) {
      xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) onProgress(e.loaded / e.total)
      }
    }
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const j = JSON.parse(xhr.responseText || '{}')
          resolve({ videoId: j.id })
        } catch (e) { reject(new Error('Respons YouTube tidak valid')) }
      } else {
        reject(new Error('Upload YouTube gagal (status ' + xhr.status + ')'))
      }
    }
    xhr.onerror = function () { reject(new Error('Jaringan gagal saat upload YouTube')) }
    xhr.send(blob)
  })
}
`, 'src/lib/youtube.js ditulis')

/* ===== 4. DashboardPage: import dan state ===== */
ganti('src/pages/DashboardPage.jsx',
  `import { pratinjauHeic, formatHeic } from '../lib/konversi.js'`,
  `import { pratinjauHeic, formatHeic } from '../lib/konversi.js'
import { parseYouTubeId, ytThumb, fetchYouTubeQuota, startYouTubeSession, uploadToYouTube } from '../lib/youtube.js'`,
  'Import helper YouTube di DashboardPage')
ganti('src/pages/DashboardPage.jsx',
  `  const [infoProses, setInfoProses] = useState('')`,
  `  const [infoProses, setInfoProses] = useState('')
  const [ytQuota, setYtQuota] = useState({ limit: 6, used: 0, remaining: 6 })
  const [galMode, setGalMode] = useState('foto')
  const [galYtLink, setGalYtLink] = useState('')
  const [galOldYt, setGalOldYt] = useState(null)`,
  'State YouTube di DashboardPage')
ganti('src/pages/DashboardPage.jsx',
  `  useEffect(function () {
    if (mahasiswa) refresh()
  }, [mahasiswa])`,
  `  useEffect(function () {
    if (mahasiswa) refresh()
    fetchYouTubeQuota().then(setYtQuota)
    const iv = setInterval(function () { fetchYouTubeQuota().then(setYtQuota) }, 30000)
    return function () { clearInterval(iv) }
  }, [mahasiswa])`,
  'Muat kuota YouTube berkala')
ganti('src/pages/DashboardPage.jsx',
  `return { key: Math.random().toString(36).slice(2), judul: '', deskripsi: '', hasil: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false, show: false }`,
  `return { key: Math.random().toString(36).slice(2), judul: '', deskripsi: '', hasil: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false, show: false, mode: 'foto', ytLink: '', oldYtId: null, oldSource: 'r2' }`,
  'newItem menyimpan mode dan YouTube')
ganti('src/pages/DashboardPage.jsx',
  `  async function hapusMediaR2(url) {
    const key = keyDariUrl(url)`,
  `  async function hapusMediaR2(url) {
    if (String(url || '').indexOf('i.ytimg.com') !== -1 || String(url || '').indexOf('youtube') !== -1) return
    const key = keyDariUrl(url)`,
  'hapusMediaR2 melewatkan URL YouTube')

/* ===== 5. DashboardPage: logika simpan logbook ===== */
ganti('src/pages/DashboardPage.jsx',
  `        let mediaPath = null
        let mediaType = null
        let mediaThumb = null
        if (it.file) {
          const up = await uploadMedia(it.file, 'logbook', function (pesan) { setInfoProses(pesan) })
          mediaPath = up.publicUrl
          mediaType = it.file.type.indexOf('video') === 0 ? 'video' : 'foto'
          mediaThumb = up.thumbUrl || null
        } else if (it.oldPath) {
          mediaPath = it.oldPath
          mediaType = detectMediaType(it.oldPath)
          mediaThumb = it.oldThumb || null
        }
        clean.push({ judul: it.judul.trim(), deskripsi: it.deskripsi.trim(), hasil: it.hasil.trim(), media_path: mediaPath, media_type: mediaType, media_thumb: mediaThumb, show_in_gallery: it.show && !!mediaPath })`,
  `        let mediaPath = null
        let mediaType = null
        let mediaThumb = null
        let mediaSource = it.oldSource || 'r2'
        let youtubeId = it.oldYtId || null
        if (it.mode === 'video' && it.ytLink && !it.file) {
          const id = parseYouTubeId(it.ytLink)
          if (!id) { alert('Link YouTube tidak valid pada kegiatan ' + (i + 1) + '.'); setBusy(false); return }
          mediaSource = 'youtube'
          youtubeId = id
          mediaPath = ytThumb(id)
          mediaThumb = ytThumb(id)
          mediaType = 'video'
        } else if (it.mode === 'video' && it.file) {
          if (ytQuota.remaining <= 0) { alert('Kuota upload YouTube hari ini sudah habis. Gunakan link YouTube.'); setBusy(false); return }
          const sesiData = await supabase.auth.getSession()
          const tokenS = sesiData.data.session ? sesiData.data.session.access_token : ''
          const sesi = await startYouTubeSession(it.judul || 'Dokumentasi Magang', 'Diunggah dari portal logbook magang BSI.', it.file.type || 'video/mp4', tokenS)
          const hasilYt = await uploadToYouTube(sesi.sessionUri, it.file, function (p) { setInfoProses('Mengunggah ke YouTube... ' + Math.round(p * 100) + '%') })
          mediaSource = 'youtube'
          youtubeId = hasilYt.videoId
          mediaPath = ytThumb(hasilYt.videoId)
          mediaThumb = ytThumb(hasilYt.videoId)
          mediaType = 'video'
          setYtQuota(function (q) { return Object.assign({}, q, { used: q.used + 1, remaining: Math.max(0, q.remaining - 1) }) })
          fetchYouTubeQuota().then(setYtQuota)
        } else if (it.file) {
          const up = await uploadMedia(it.file, 'logbook', function (pesan) { setInfoProses(pesan) })
          mediaPath = up.publicUrl
          mediaType = it.file.type.indexOf('video') === 0 ? 'video' : 'foto'
          mediaThumb = up.thumbUrl || null
          mediaSource = 'r2'
          youtubeId = null
        } else if (it.oldPath) {
          mediaPath = it.oldPath
          mediaType = detectMediaType(it.oldPath)
          mediaThumb = it.oldThumb || null
          mediaSource = 'r2'
          youtubeId = null
        }
        clean.push({ judul: it.judul.trim(), deskripsi: it.deskripsi.trim(), hasil: it.hasil.trim(), media_path: mediaPath, media_type: mediaType, media_thumb: mediaThumb, media_source: mediaSource, youtube_id: youtubeId, show_in_gallery: it.show && !!mediaPath })`,
  'Cabang YouTube pada submitLogbook')
ganti('src/pages/DashboardPage.jsx',
  `        return { logbook_id: logId, urutan: idx + 1, judul: c.judul, deskripsi: c.deskripsi, hasil: c.hasil, media_path: c.media_path, media_type: c.media_type, media_thumb: c.media_thumb, show_in_gallery: c.show_in_gallery }`,
  `        return { logbook_id: logId, urutan: idx + 1, judul: c.judul, deskripsi: c.deskripsi, hasil: c.hasil, media_path: c.media_path, media_type: c.media_type, media_thumb: c.media_thumb, media_source: c.media_source, youtube_id: c.youtube_id, show_in_gallery: c.show_in_gallery }`,
  'rows logbook membawa kolom YouTube')
ganti('src/pages/DashboardPage.jsx',
  `        const oldItems = await supabase.from('logbook_items').select('media_path, media_thumb').eq('logbook_id', editLogId)
        oldUrls = []
        ;(oldItems.data || []).forEach(function (it) {
          if (it.media_path) oldUrls.push(it.media_path)
          if (it.media_thumb) oldUrls.push(it.media_thumb)
        })`,
  `        const oldItems = await supabase.from('logbook_items').select('media_path, media_thumb, media_source').eq('logbook_id', editLogId)
        oldUrls = []
        ;(oldItems.data || []).forEach(function (it) {
          if (it.media_source === 'youtube') return
          if (it.media_path) oldUrls.push(it.media_path)
          if (it.media_thumb) oldUrls.push(it.media_thumb)
        })`,
  'oldUrls melewatkan media YouTube')
ganti('src/pages/DashboardPage.jsx',
  `      const newUrls = []
      clean.forEach(function (c) {
        if (c.media_path) newUrls.push(c.media_path)
        if (c.media_thumb) newUrls.push(c.media_thumb)
      })`,
  `      const newUrls = []
      clean.forEach(function (c) {
        if (c.media_source === 'youtube') return
        if (c.media_path) newUrls.push(c.media_path)
        if (c.media_thumb) newUrls.push(c.media_thumb)
      })`,
  'newUrls melewatkan media YouTube')
ganti('src/pages/DashboardPage.jsx',
  `      return { key: it.id, judul: it.judul, deskripsi: it.deskripsi || '', hasil: it.hasil || '', file: null, preview: it.media_path || '', oldPath: it.media_path || '', oldThumb: it.media_thumb || '', previewLoading: false, show: it.show_in_gallery }`,
  `      return { key: it.id, judul: it.judul, deskripsi: it.deskripsi || '', hasil: it.hasil || '', file: null, preview: it.media_path || '', oldPath: it.media_source === 'youtube' ? '' : (it.media_path || ''), oldThumb: it.media_source === 'youtube' ? '' : (it.media_thumb || ''), previewLoading: false, show: it.show_in_gallery, mode: it.media_source === 'youtube' ? 'video' : (it.media_type === 'video' ? 'video' : 'foto'), ytLink: '', oldYtId: it.youtube_id || null, oldSource: it.media_source || 'r2' }`,
  'startEditLog membawa mode dan YouTube')

/* ===== 6. DashboardPage: logika simpan galeri ===== */
ganti('src/pages/DashboardPage.jsx',
  `      let mediaPath = ''
      let mediaType = ''
      let mediaThumb = null
      if (galForm.file) {
        const up = await uploadMedia(galForm.file, 'galeri', function (pesan) { setInfoProses(pesan) })
        mediaPath = up.publicUrl
        mediaType = galForm.file.type.indexOf('video') === 0 ? 'video' : 'foto'
        mediaThumb = up.thumbUrl || null
      } else if (galForm.oldPath) {
        mediaPath = galForm.oldPath
        mediaType = detectMediaType(galForm.oldPath)
        mediaThumb = galForm.oldThumb || null
      }
      if (!mediaPath) { alert('Galeri wajib memiliki media. Pilih file foto atau video terlebih dahulu.'); setBusy(false); return }
      const payload = {
        mahasiswa_id: mahasiswa.id,
        judul: galForm.judul || ('Dokumentasi ' + galForm.tanggal),
        deskripsi: galForm.deskripsi,
        tanggal: galForm.tanggal,
        kegiatan: galForm.kegiatan || 'Lainnya',
        media_path: mediaPath,
        media_type: mediaType,
        media_thumb: mediaThumb
      }`,
  `      let mediaPath = ''
      let mediaType = ''
      let mediaThumb = null
      let mediaSource = galOldYt ? 'youtube' : 'r2'
      let youtubeId = galOldYt || null
      if (galMode === 'video' && galYtLink && !galForm.file) {
        const id = parseYouTubeId(galYtLink)
        if (!id) { alert('Link YouTube tidak valid.'); setBusy(false); return }
        mediaSource = 'youtube'
        youtubeId = id
        mediaPath = ytThumb(id)
        mediaThumb = ytThumb(id)
        mediaType = 'video'
      } else if (galMode === 'video' && galForm.file) {
        if (ytQuota.remaining <= 0) { alert('Kuota upload YouTube hari ini sudah habis. Gunakan link YouTube.'); setBusy(false); return }
        const sesiData = await supabase.auth.getSession()
        const tokenS = sesiData.data.session ? sesiData.data.session.access_token : ''
        const sesi = await startYouTubeSession(galForm.judul || ('Dokumentasi ' + galForm.tanggal), galForm.deskripsi || '', galForm.file.type || 'video/mp4', tokenS)
        const hasilYt = await uploadToYouTube(sesi.sessionUri, galForm.file, function (p) { setInfoProses('Mengunggah ke YouTube... ' + Math.round(p * 100) + '%') })
        mediaSource = 'youtube'
        youtubeId = hasilYt.videoId
        mediaPath = ytThumb(hasilYt.videoId)
        mediaThumb = ytThumb(hasilYt.videoId)
        mediaType = 'video'
        setYtQuota(function (q) { return Object.assign({}, q, { used: q.used + 1, remaining: Math.max(0, q.remaining - 1) }) })
        fetchYouTubeQuota().then(setYtQuota)
      } else if (galForm.file) {
        const up = await uploadMedia(galForm.file, 'galeri', function (pesan) { setInfoProses(pesan) })
        mediaPath = up.publicUrl
        mediaType = galForm.file.type.indexOf('video') === 0 ? 'video' : 'foto'
        mediaThumb = up.thumbUrl || null
        mediaSource = 'r2'
        youtubeId = null
      } else if (galForm.oldPath) {
        mediaPath = galForm.oldPath
        mediaType = detectMediaType(galForm.oldPath)
        mediaThumb = galForm.oldThumb || null
        mediaSource = 'r2'
        youtubeId = null
      }
      if (!mediaPath) { alert('Galeri wajib memiliki media. Pilih file foto atau video terlebih dahulu.'); setBusy(false); return }
      const payload = {
        mahasiswa_id: mahasiswa.id,
        judul: galForm.judul || ('Dokumentasi ' + galForm.tanggal),
        deskripsi: galForm.deskripsi,
        tanggal: galForm.tanggal,
        kegiatan: galForm.kegiatan || 'Lainnya',
        media_path: mediaPath,
        media_type: mediaType,
        media_thumb: mediaThumb,
        media_source: mediaSource,
        youtube_id: youtubeId
      }`,
  'Cabang YouTube pada submitGaleri')
ganti('src/pages/DashboardPage.jsx',
  `        if (existing && !existing.logbook_item_id && existing.media_path !== payload.media_path) {
          oldGalUrls = [existing.media_path, existing.media_thumb].filter(Boolean)
        }`,
  `        if (existing && !existing.logbook_item_id && existing.media_source !== 'youtube' && existing.media_path !== payload.media_path) {
          oldGalUrls = [existing.media_path, existing.media_thumb].filter(Boolean)
        }`,
  'oldGalUrls melewatkan media YouTube')
ganti('src/pages/DashboardPage.jsx',
  `setGalForm({ judul: '', deskripsi: '', tanggal: todayInput(), kegiatan: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false })`,
  `setGalForm({ judul: '', deskripsi: '', tanggal: todayInput(), kegiatan: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false })
     setGalMode('foto')
     setGalYtLink('')
     setGalOldYt(null)`,
  'Reset mode galeri setelah simpan dan batal', true)
ganti('src/pages/DashboardPage.jsx',
  `    setGalForm({ judul: g.judul, deskripsi: g.deskripsi || '', tanggal: g.tanggal, kegiatan: g.kegiatan, file: null, preview: g.media_path, oldPath: g.media_path, oldThumb: g.media_thumb || '', previewLoading: false })`,
  `    setGalForm({ judul: g.judul, deskripsi: g.deskripsi || '', tanggal: g.tanggal, kegiatan: g.kegiatan, file: null, preview: g.media_path || '', oldPath: g.media_source === 'youtube' ? '' : (g.media_path || ''), oldThumb: g.media_source === 'youtube' ? '' : (g.media_thumb || ''), previewLoading: false })
    setGalMode(g.media_source === 'youtube' ? 'video' : (g.media_type === 'video' ? 'video' : 'foto'))
    setGalYtLink('')
    setGalOldYt(g.youtube_id || null)`,
  'startEditGal membawa mode dan YouTube')
ganti('src/pages/DashboardPage.jsx',
  `      const urls = target.data.logbook_item_id ? [] : [target.data.media_path, target.data.media_thumb].filter(Boolean)`,
  `      const urls = target.data.logbook_item_id || target.data.media_source === 'youtube' ? [] : [target.data.media_path, target.data.media_thumb].filter(Boolean)`,
  'Hapus galeri melewatkan media YouTube')
ganti('src/pages/DashboardPage.jsx',
  `      ;(target.data.logbook_items || []).forEach(function (it) {
        if (it.media_path) urls.push(it.media_path)
        if (it.media_thumb) urls.push(it.media_thumb)
      })`,
  `      ;(target.data.logbook_items || []).forEach(function (it) {
        if (it.media_source === 'youtube') return
        if (it.media_path) urls.push(it.media_path)
        if (it.media_thumb) urls.push(it.media_thumb)
      })`,
  'Hapus logbook melewatkan media YouTube')

/* ===== 7. DashboardPage: UI pemilih jenis media ===== */
ganti('src/pages/DashboardPage.jsx',
  `                      <FileInput accept="image/*,video/*" fileName={it.file ? it.file.name : ''}
                        onChange={function (e) { onItemFile(i, e.target.files[0]) }} />`,
  `                      <div className="flex gap-2">
                        <button type="button" onClick={function () { patchItem(i, { mode: 'foto' }) }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (it.mode !== 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Foto</button>
                        <button type="button" onClick={function () { patchItem(i, { mode: 'video' }) }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (it.mode === 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Video</button>
                      </div>
                      {it.mode === 'video' ? (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-slate-500">Sisa kuota upload YouTube hari ini: {ytQuota.remaining} dari {ytQuota.limit}</p>
                          <div className={ytQuota.remaining <= 0 && !it.file ? 'opacity-50 pointer-events-none' : ''}>
                            <FileInput accept="video/*" fileName={it.file ? it.file.name : ''}
                              onChange={function (e) { onItemFile(i, e.target.files[0]) }} />
                          </div>
                          {ytQuota.remaining <= 0 ? <p className="text-xs text-red-600">Kuota habis. Gunakan link YouTube di bawah.</p> : null}
                          <input className={inputCls} value={it.ytLink} onChange={function (e) { patchItem(i, { ytLink: e.target.value }) }} placeholder="Atau tempel link YouTube (unlisted)" />
                        </div>
                      ) : (
                        <FileInput accept="image/*" fileName={it.file ? it.file.name : ''}
                          onChange={function (e) { onItemFile(i, e.target.files[0]) }} />
                      )}`,
  'UI pemilih jenis media pada rincian kegiatan')
ganti('src/pages/DashboardPage.jsx',
  `              <div>
                <label className={labelCls}>Pilih foto atau video {editGalId ? null : <span className="text-red-500">*</span>}</label>
                <div className="mt-1.5">
                  <FileInput accept="image/*,video/*" fileName={galForm.file ? galForm.file.name : ''}
                    onChange={async function (e) {
                      const f = e.target.files[0]
                      if (!f) return
                      const blob = await pratinjauHeic(f)
                      const preview = blob ? URL.createObjectURL(blob) : URL.createObjectURL(f)
                      setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: preview }) })
                    }} />
                </div>
              </div>`,
  `              <div>
                <label className={labelCls}>Jenis media {editGalId ? null : <span className="text-red-500">*</span>}</label>
                <div className="mt-1.5 flex gap-2">
                  <button type="button" onClick={function () { setGalMode('foto') }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (galMode !== 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Foto</button>
                  <button type="button" onClick={function () { setGalMode('video') }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (galMode === 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Video</button>
                </div>
                <div className="mt-1.5">
                  {galMode === 'video' ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500">Sisa kuota upload YouTube hari ini: {ytQuota.remaining} dari {ytQuota.limit}</p>
                      <div className={ytQuota.remaining <= 0 && !galForm.file ? 'opacity-50 pointer-events-none' : ''}>
                        <FileInput accept="video/*" fileName={galForm.file ? galForm.file.name : ''}
                          onChange={async function (e) {
                            const f = e.target.files[0]
                            if (!f) return
                            setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: URL.createObjectURL(f) }) })
                          }} />
                      </div>
                      {ytQuota.remaining <= 0 ? <p className="text-xs text-red-600">Kuota habis. Gunakan link YouTube di bawah.</p> : null}
                      <input className={inputCls} value={galYtLink} onChange={function (e) { setGalYtLink(e.target.value) }} placeholder="Atau tempel link YouTube (unlisted)" />
                    </div>
                  ) : (
                    <FileInput accept="image/*" fileName={galForm.file ? galForm.file.name : ''}
                      onChange={async function (e) {
                        const f = e.target.files[0]
                        if (!f) return
                        const blob = await pratinjauHeic(f)
                        const preview = blob ? URL.createObjectURL(blob) : URL.createObjectURL(f)
                        setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: preview }) })
                      }} />
                  )}
                </div>
              </div>`,
  'UI pemilih jenis media pada form galeri')

/* ===== 8. cards.jsx: slide dan detail YouTube ===== */
ganti('src/components/cards.jsx',
  `    return { src: i.media_thumb || i.media_path, full: i.media_path, type: i.media_type, title: i.judul }`,
  `    return { src: i.media_thumb || i.media_path, full: i.media_path, type: i.media_source === 'youtube' ? 'foto' : i.media_type, title: i.judul, yt: i.youtube_id || null }`,
  'slidesFromItems membawa youtube_id')
ganti('src/components/cards.jsx',
  `                    <ZoomableMedia src={it.media_thumb || it.media_path} full={it.media_path} type={it.media_type} title={it.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900 mb-3" />`,
  `                    {it.media_source === 'youtube' ? (
                      <iframe src={'https://www.youtube-nocookie.com/embed/' + it.youtube_id} title={it.judul} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="rounded-2xl overflow-hidden aspect-video w-full bg-slate-900 mb-3" />
                    ) : (
                      <ZoomableMedia src={it.media_thumb || it.media_path} full={it.media_path} type={it.media_type} title={it.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900 mb-3" />
                    )}`,
  'Detail logbook menampilkan embed YouTube')
ganti('src/components/cards.jsx',
  `      <ZoomableMedia src={item.media_thumb || item.media_path} full={item.media_path} type={item.media_type} title={item.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900" />`,
  `      {item.media_source === 'youtube' ? (
        <iframe src={'https://www.youtube-nocookie.com/embed/' + item.youtube_id} title={item.judul} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="rounded-2xl overflow-hidden aspect-video w-full bg-slate-900" />
      ) : (
        <ZoomableMedia src={item.media_thumb || item.media_path} full={item.media_path} type={item.media_type} title={item.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900" />
      )}`,
  'Detail galeri menampilkan embed YouTube')

/* ===== 9. Carousel: teruskan youtubeId ke Lightbox ===== */
ganti('src/components/Carousel.jsx',
  `{zoom ? <Lightbox src={zoom.full || zoom.src} type={zoom.type} title={zoom.title} onClose={function () { setZoom(null) }} /> : null}`,
  `{zoom ? <Lightbox src={zoom.full || zoom.src} type={zoom.type} title={zoom.title} youtubeId={zoom.yt || null} onClose={function () { setZoom(null) }} /> : null}`,
  'Carousel meneruskan youtubeId ke Lightbox', true)

/* ===== 10. ui.jsx: Lightbox mendukung embed YouTube ===== */
ganti('src/components/ui.jsx',
  `        {props.type === 'video' ? (
          <video src={props.src} controls autoPlay className="mx-auto max-h-[85vh] w-full rounded-2xl bg-slate-900 object-contain" />
        ) : (`,
  `        {props.youtubeId ? (
          <iframe src={'https://www.youtube-nocookie.com/embed/' + props.youtubeId} title={props.title || 'Video'} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="mx-auto aspect-video w-full rounded-2xl bg-slate-900" />
        ) : props.type === 'video' ? (
          <video src={props.src} controls autoPlay className="mx-auto max-h-[85vh] w-full rounded-2xl bg-slate-900 object-contain" />
        ) : (`,
  'Lightbox menampilkan embed YouTube')
ganti('src/components/ui.jsx',
  `          disabled={busyUnduh}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"`,
  `          disabled={busyUnduh}
          style={props.youtubeId ? { display: 'none' } : undefined}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"`,
  'Tombol unduh disembunyikan untuk media YouTube')

/* ===== 11. vite.config.js: middleware YouTube untuk dev lokal ===== */
ganti('vite.config.js',
  ` export default defineConfig(function ({ mode }) {`,
  ` function pluginApiYoutube(env) {
   const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY)
   function ptToday() {
     const now = new Date()
     const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
     const y = pt.getFullYear()
     const m = String(pt.getMonth() + 1).padStart(2, '0')
     const d = String(pt.getDate()).padStart(2, '0')
     return y + '-' + m + '-' + d
   }
   async function cekSesi(req) {
     const authHeader = req.headers.authorization || ''
     const token = authHeader.replace('Bearer ', '')
     if (!token) return null
     const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
     const r = await supabase.auth.getUser(token)
     return r.error ? null : r.data.user
   }
   return {
     name: 'api-youtube-dev',
     configureServer(server) {
       server.middlewares.use('/api/youtube/quota', async function (req, res) {
         const today = ptToday()
         const { count } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
         const used = count || 0
         res.setHeader('Content-Type', 'application/json')
         res.setHeader('Cache-Control', 'no-store')
         res.end(JSON.stringify({ limit: 6, used: used, remaining: Math.max(0, 6 - used), ptDate: today }))
       })
       server.middlewares.use('/api/youtube/session', async function (req, res) {
         if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Method tidak diizinkan' })); return }
         const user = await cekSesi(req)
         if (!user) { res.statusCode = 401; res.end(JSON.stringify({ error: 'Sesi tidak valid' })); return }
         const today = ptToday()
         const { count } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
         const used = count || 0
         if (used >= 6) { res.statusCode = 429; res.end(JSON.stringify({ error: 'Kuota upload YouTube hari ini sudah habis. Gunakan link embed.', remaining: 0 })); return }
         const body = await bacaBody(req)
         const params = new URLSearchParams()
         params.set('client_id', env.YOUTUBE_CLIENT_ID || '')
         params.set('client_secret', env.YOUTUBE_CLIENT_SECRET || '')
         params.set('refresh_token', env.YOUTUBE_REFRESH_TOKEN || '')
         params.set('grant_type', 'refresh_token')
         const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
         if (!tr.ok) { res.statusCode = 500; res.end(JSON.stringify({ error: 'Gagal refresh token YouTube' })); return }
         const tok = await tr.json()
         const meta = {
           snippet: { title: String(body.title || 'Dokumentasi Magang').slice(0, 100), description: String(body.description || '').slice(0, 4000), tags: ['logbook-magang-bsi'], categoryId: '22' },
           status: { privacyStatus: 'unlisted', embeddable: true, publicStatsViewable: false }
         }
         const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
           method: 'POST',
           headers: { Authorization: 'Bearer ' + tok.access_token, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': body.contentType || 'video/mp4' },
           body: JSON.stringify(meta)
         })
         if (!init.ok) { const t = await init.text(); res.statusCode = 502; res.end(JSON.stringify({ error: 'Gagal memulai sesi YouTube: ' + t })); return }
         const sessionUri = init.headers.get('location')
         if (!sessionUri) { res.statusCode = 502; res.end(JSON.stringify({ error: 'Sesi upload tidak mengembalikan lokasi' })); return }
         await admin.from('youtube_quota_usage').insert({ pt_date: today, user_id: user.id })
         res.setHeader('Content-Type', 'application/json')
         res.end(JSON.stringify({ sessionUri: sessionUri, remaining: Math.max(0, 6 - used - 1) }))
       })
     }
   }
 }
 export default defineConfig(function ({ mode }) {`,
  'Middleware YouTube untuk dev lokal')
ganti('vite.config.js',
  `     plugins: [react(), pluginApiR2(env)]`,
  `     plugins: [react(), pluginApiR2(env), pluginApiYoutube(env)]`,
  'Plugin YouTube didaftarkan di vite')

console.log('')
console.log('Selesai. Restart dev server agar middleware baru aktif:')
console.log('  Ctrl+C lalu npm run dev -- --host')
console.log('')
console.log('Pastikan variabel berikut ada di .env.local dan Environment Variables Vercel:')
console.log('  YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN, SUPABASE_SERVICE_ROLE_KEY')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard, tab Logbook, tambah kegiatan, perhatikan tombol Foto dan Video.')
console.log('2. Pilih Video: terlihat sisa kuota harian, FileInput video, dan kolom link YouTube.')
console.log('3. Saat kuota habis, FileInput video menjadi abu-abu dan hanya link YouTube yang aktif.')
console.log('4. Simpan dengan link YouTube unlisted: kartu menampilkan thumbnail YouTube dan detail memutar embed.')
console.log('5. Uji juga upload file video kecil: progres Mengunggah ke YouTube terlihat dan video masuk sebagai unlisted.')
```

## File: apply-youtube-frontend.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang fitur YouTube di frontend...')

/* ===== 1. Helper youtube.js baru ===== */
const ytHelper = `export function parseYouTubeId(url) {
  if (!url) return null
  const s = String(url).trim()
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s
  try {
    const u = new URL(s)
    const host = u.hostname.replace('www.', '').replace('m.', '')
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0]
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
    }
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const v = u.searchParams.get('v')
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v
      const parts = u.pathname.split('/').filter(Boolean)
      if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') {
        const id = parts[1]
        return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
      }
    }
  } catch (e) {}
  return null
}
export function ytThumb(id) {
  return 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg'
}
export function ytEmbedUrl(id) {
  return 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&modestbranding=1'
}
export async function fetchYouTubeQuota() {
  try {
    const r = await fetch('/api/youtube/quota', { cache: 'no-store' })
    if (!r.ok) return { limit: 6, used: 0, remaining: 6 }
    return await r.json()
  } catch (e) {
    return { limit: 6, used: 0, remaining: 6 }
  }
}
export async function startYouTubeSession(title, description, contentType, token) {
  const r = await fetch('/api/youtube/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ title, description, contentType })
  })
  if (!r.ok) {
    const j = await r.json().catch(function () { return { error: 'Gagal membuat sesi YouTube' } })
    throw new Error(j.error || 'Gagal membuat sesi YouTube')
  }
  return await r.json()
}
export function uploadToYouTube(sessionUri, blob, onProgress) {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', sessionUri)
    xhr.setRequestHeader('Content-Type', blob.type || 'video/mp4')
    xhr.setRequestHeader('Content-Length', String(blob.size))
    if (onProgress) {
      xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) onProgress(e.loaded / e.total)
      }
    }
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const j = JSON.parse(xhr.responseText || '{}')
          resolve({ videoId: j.id })
        } catch (e) { reject(new Error('Respons YouTube tidak valid')) }
      } else {
        reject(new Error('Upload YouTube gagal (status ' + xhr.status + ')'))
      }
    }
    xhr.onerror = function () { reject(new Error('Jaringan gagal saat upload YouTube')) }
    xhr.send(blob)
  })
}
`
fs.mkdirSync(path.join(root, 'src', 'lib'), { recursive: true })
simpan('src/lib/youtube.js', ytHelper)
console.log('[BERHASIL] src/lib/youtube.js ditulis')

/* ===== 2. Icon youtube di icons.jsx ===== */
let icons = baca('src/components/icons.jsx')
if (!icons.includes('youtube:')) {
  icons = icons.replace(
    "  download: (\n    <>",
    "  youtube: (\n    <>\n      <path d=\"M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z\" />\n      <polygon points=\"9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02\" />\n    </>\n  ),\n  download: (\n    <>"
  )
  simpan('src/components/icons.jsx', icons)
  console.log('[BERHASIL] Icon youtube ditambahkan')
} else {
  console.log('[SUDAH ADA] Icon youtube')
}

/* ===== 3. DashboardPage: import helper YouTube ===== */
let dash = baca('src/pages/DashboardPage.jsx')
if (!dash.includes("from '../lib/youtube.js'")) {
  dash = dash.replace(
    "import { syncGaleriFromLogbook } from '../lib/logbook.js'",
    "import { syncGaleriFromLogbook } from '../lib/logbook.js'\nimport { parseYouTubeId, ytThumb, fetchYouTubeQuota, startYouTubeSession, uploadToYouTube } from '../lib/youtube.js'\nimport { supabase as sbClient } from '../lib/supabase.js'"
  )
  console.log('[BERHASIL] Import YouTube helper di DashboardPage')
}

/* ===== 4. Tambah state untuk YouTube ===== */
if (!dash.includes('ytQuota')) {
  dash = dash.replace(
    "const [infoProses, setInfoProses] = useState('')",
    "const [infoProses, setInfoProses] = useState('')\n  const [ytQuota, setYtQuota] = useState({ limit: 6, used: 0, remaining: 6 })\n  const [itemMode, setItemMode] = useState({})\n  const [galMode, setGalMode] = useState('foto')\n  const [galYtLink, setGalYtLink] = useState('')\n  const [galYtTitle, setGalYtTitle] = useState('')"
  )
  console.log('[BERHASIL] State YouTube ditambahkan')
}

/* ===== 5. Load quota saat mount ===== */
if (!dash.includes('fetchYouTubeQuota()')) {
  dash = dash.replace(
    'useEffect(function () {\n    if (mahasiswa) refresh()\n  }, [mahasiswa])',
    'useEffect(function () {\n    if (mahasiswa) refresh()\n    fetchYouTubeQuota().then(setYtQuota)\n    const iv = setInterval(function () { fetchYouTubeQuota().then(setYtQuota) }, 30000)\n    return function () { clearInterval(iv) }\n  }, [mahasiswa])'
  )
  console.log('[BERHASIL] Load quota YouTube saat mount')
}

/* ===== 6. Tambah helper functions untuk mode item ===== */
if (!dash.includes('getItemMode')) {
  dash = dash.replace(
    'function patchItem(i, patch)',
    'function getItemMode(i) { return itemMode[i] || \'foto\' }\n  function setItemModeAt(i, mode) { setItemMode(function (p) { const n = Object.assign({}, p); n[i] = mode; return n }) }\n  function patchItem(i, patch)'
  )
  console.log('[BERHASIL] Helper getItemMode ditambahkan')
}

simpan('src/pages/DashboardPage.jsx', dash)
console.log('[SIMPAN] DashboardPage.jsx sementara')

console.log('\nSelesai bagian dasar. Karena DashboardPage sudah sangat kompleks,')
console.log('langkah berikutnya perlu kamu lakukan MANUAL dengan panduan yang akan aku berikan.')
console.log('\nJalankan dulu script ini, lalu kabari aku untuk lanjut ke panduan manual.')
```

## File: apply-youtube-latest-middleware.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai menambahkan middleware /api/youtube/latest untuk dev lokal...')
console.log('')

/* ===== 1. Middleware /api/youtube/latest di vite.config.js ===== */
const FILE_V = 'vite.config.js'
let v = baca(FILE_V)
if (v.includes("'/api/youtube/latest'")) {
  console.log('[SUDAH ADA] Middleware /api/youtube/latest di vite.config.js')
} else {
  const marker = "server.middlewares.use('/api/youtube/session'"
  if (!v.includes(marker)) {
    console.log('[TIDAK KETEMU] Penanda middleware session di vite.config.js')
    process.exit(1)
  }
  const middlewareLatest = `server.middlewares.use('/api/youtube/latest', async function (req, res) {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Method tidak diizinkan' })); return }
        const user = await cekSesi(req)
        if (!user) { res.statusCode = 401; res.end(JSON.stringify({ error: 'Sesi tidak valid' })); return }
        const params = new URLSearchParams()
        params.set('client_id', env.YOUTUBE_CLIENT_ID || '')
        params.set('client_secret', env.YOUTUBE_CLIENT_SECRET || '')
        params.set('refresh_token', env.YOUTUBE_REFRESH_TOKEN || '')
        params.set('grant_type', 'refresh_token')
        const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
        if (!tr.ok) { res.statusCode = 500; res.end(JSON.stringify({ error: 'Gagal refresh token YouTube' })); return }
        const tok = await tr.json()
        const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&forMine=true&order=date&maxResults=5', { headers: { Authorization: 'Bearer ' + tok.access_token } })
        if (!r.ok) { res.statusCode = 502; res.end(JSON.stringify({ error: 'Gagal memeriksa video terbaru' })); return }
        const j = await r.json()
        const items = j.items || []
        const batas = Date.now() - 15 * 60 * 1000
        const cocok = items.find(function (it) {
          const t = Date.parse(it.snippet && it.snippet.publishedAt ? it.snippet.publishedAt : '')
          return isNaN(t) ? false : t >= batas
        })
        if (!cocok) { res.statusCode = 404; res.end(JSON.stringify({ error: 'Video terbaru tidak ditemukan' })); return }
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ videoId: cocok.id && cocok.id.videoId }))
      })
      `
  v = v.replace(marker, middlewareLatest + marker)
  simpan(FILE_V, v)
  console.log('[BERHASIL] Middleware /api/youtube/latest ditambahkan di vite.config.js')
}

/* ===== 2. Pengaman respons bukan JSON di src/lib/youtube.js ===== */
const FILE_Y = 'src/lib/youtube.js'
let y = baca(FILE_Y)
const cariJson = `  if (v.ok) {
    const j = await v.json()
    if (j.videoId) return { videoId: j.videoId }
  }`
const gantiJson = `  if (v.ok) {
    try {
      const j = await v.json()
      if (j && j.videoId) return { videoId: j.videoId }
    } catch (e) {
      console.warn('Respons pemulihan bukan JSON, dilewati.')
    }
  }`
if (y.includes(gantiJson)) {
  console.log('[SUDAH ADA] Pengaman JSON di youtube.js')
} else if (y.includes(cariJson)) {
  y = y.replace(cariJson, gantiJson)
  simpan(FILE_Y, y)
  console.log('[BERHASIL] Pengaman JSON ditambahkan di youtube.js')
} else {
  console.log('[TIDAK KETEMU] Pola v.json() di youtube.js, kemungkinan sudah aman')
}

console.log('')
console.log('Selesai. Restart dev server: Ctrl+C lalu npm run dev -- --host')
console.log('')
console.log('Langkah uji:')
console.log('1. Upload satu video kecil dari form logbook atau galeri di localhost.')
console.log('2. Progres mencapai 100 persen, lalu id video dipulihkan lewat /api/youtube/latest.')
console.log('3. Logbook tersimpan tanpa error dan kartu menampilkan thumbnail YouTube.')
console.log('4. Kuota harian tampil X dari 5, berkurang satu tiap upload sukses.')
console.log('5. Di Vercel perilaku sama karena api/youtube/latest.js sudah ada sebagai serverless function.')
```

## File: apply-youtube-verify.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang verifikasi upload YouTube anti CORS...')
console.log('')

/* ===== 1. Tulis ulang src/lib/youtube.js dengan verifikasi akhir ===== */
simpan('src/lib/youtube.js', `import { supabase } from './supabase.js'
export function parseYouTubeId(url) {
  if (!url) return null
  const s = String(url).trim()
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s
  try {
    const u = new URL(s)
    const host = u.hostname.replace('www.', '').replace('m.', '')
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0]
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
    }
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const v = u.searchParams.get('v')
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v
      const parts = u.pathname.split('/').filter(Boolean)
      if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') {
        const id = parts[1]
        return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
      }
    }
  } catch (e) {}
  return null
}
export function ytThumb(id) {
  return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'
}
export function ytEmbedUrl(id) {
  return 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&modestbranding=1'
}
export async function fetchYouTubeQuota() {
  try {
    const r = await fetch('/api/youtube/quota', { cache: 'no-store' })
    if (!r.ok) return { limit: 6, used: 0, remaining: 6 }
    return await r.json()
  } catch (e) {
    return { limit: 6, used: 0, remaining: 6 }
  }
}
export async function startYouTubeSession(title, description, contentType, token) {
  const r = await fetch('/api/youtube/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ title: title, description: description, contentType: contentType })
  })
  if (!r.ok) {
    const j = await r.json().catch(function () { return { error: 'Gagal membuat sesi YouTube' } })
    throw new Error(j.error || 'Gagal membuat sesi YouTube')
  }
  return await r.json()
}
export async function unggahVideoYouTube(file, judul, onProgress) {
  const ref = Math.random().toString(36).slice(2, 10)
  const sesiData = await supabase.auth.getSession()
  const token = sesiData.data.session ? sesiData.data.session.access_token : ''
  const sesi = await startYouTubeSession(judul, 'REF ' + ref + ' Diunggah dari portal logbook magang BSI.', file.type || 'video/mp4', token)
  const hasil = await new Promise(function (resolve) {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', sesi.sessionUri)
    xhr.setRequestHeader('Content-Type', file.type || 'video/mp4')
    if (onProgress) {
      xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) onProgress(e.loaded / e.total)
      }
    }
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        let id = null
        try { id = JSON.parse(xhr.responseText || '{}').id || null } catch (e) { id = null }
        resolve({ selesai: true, videoId: id })
      } else {
        resolve({ selesai: false })
      }
    }
    xhr.onerror = function () { resolve({ selesai: false }) }
    xhr.send(file)
  })
  if (hasil.selesai && hasil.videoId) return { videoId: hasil.videoId }
  const v = await fetch('/api/youtube/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ ref: ref })
  })
  if (v.ok) {
    const j = await v.json()
    if (j.videoId) return { videoId: j.videoId }
  }
  throw new Error('Jaringan gagal saat upload YouTube')
}
`)
console.log('[BERHASIL] src/lib/youtube.js ditulis ulang dengan verifikasi akhir')

/* ===== 2. Endpoint verifikasi untuk Vercel ===== */
const verifyJs = `import { createClient } from '@supabase/supabase-js'
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const authClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
  const chk = await authClient.auth.getUser()
  if (chk.error || !chk.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })
  const { ref } = req.body || {}
  if (!ref) return res.status(400).json({ error: 'Ref tidak ada' })
  const params = new URLSearchParams()
  params.set('client_id', process.env.YOUTUBE_CLIENT_ID || '')
  params.set('client_secret', process.env.YOUTUBE_CLIENT_SECRET || '')
  params.set('refresh_token', process.env.YOUTUBE_REFRESH_TOKEN || '')
  params.set('grant_type', 'refresh_token')
  const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!tr.ok) return res.status(500).json({ error: 'Gagal refresh token YouTube' })
  const tok = await tr.json()
  const url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&forMine=true&order=date&maxResults=10&q=' + encodeURIComponent(ref)
  const r = await fetch(url, { headers: { Authorization: 'Bearer ' + tok.access_token } })
  if (!r.ok) return res.status(502).json({ error: 'Gagal memeriksa video di YouTube' })
  const j = await r.json()
  const items = j.items || []
  const batas = Date.now() - 15 * 60 * 1000
  const cocok = items.find(function (it) {
    const desc = (it.snippet && it.snippet.description) || ''
    const t = Date.parse(it.snippet && it.snippet.publishedAt ? it.snippet.publishedAt : '')
    return desc.indexOf('REF ' + ref) === 0 && (isNaN(t) ? true : t >= batas)
  }) || items[0]
  if (!cocok) return res.status(404).json({ error: 'Video tidak ditemukan di channel' })
  return res.status(200).json({ videoId: cocok.id && cocok.id.videoId })
}
`
fs.mkdirSync(path.join(root, 'api', 'youtube'), { recursive: true })
simpan('api/youtube/verify.js', verifyJs)
console.log('[BERHASIL] api/youtube/verify.js ditulis')

/* ===== 3. Middleware verify untuk dev lokal di vite.config.js ===== */
const FILE_V = 'vite.config.js'
let v = baca(FILE_V)
if (v.includes("'/api/youtube/verify'")) {
  console.log('[SUDAH ADA] Middleware verify di vite.config.js')
} else {
  const marker = "server.middlewares.use('/api/youtube/session'"
  if (!v.includes(marker)) {
    console.log('[TIDAK KETEMU] Middleware session di vite.config.js')
  } else {
    const middlewareVerify = `server.middlewares.use('/api/youtube/verify', async function (req, res) {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Method tidak diizinkan' })); return }
        const user = await cekSesi(req)
        if (!user) { res.statusCode = 401; res.end(JSON.stringify({ error: 'Sesi tidak valid' })); return }
        const body = await bacaBody(req)
        const ref = body.ref
        if (!ref) { res.statusCode = 400; res.end(JSON.stringify({ error: 'Ref tidak ada' })); return }
        const params = new URLSearchParams()
        params.set('client_id', env.YOUTUBE_CLIENT_ID || '')
        params.set('client_secret', env.YOUTUBE_CLIENT_SECRET || '')
        params.set('refresh_token', env.YOUTUBE_REFRESH_TOKEN || '')
        params.set('grant_type', 'refresh_token')
        const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
        if (!tr.ok) { res.statusCode = 500; res.end(JSON.stringify({ error: 'Gagal refresh token YouTube' })); return }
        const tok = await tr.json()
        const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&forMine=true&order=date&maxResults=10&q=' + encodeURIComponent(ref), { headers: { Authorization: 'Bearer ' + tok.access_token } })
        if (!r.ok) { res.statusCode = 502; res.end(JSON.stringify({ error: 'Gagal memeriksa video di YouTube' })); return }
        const j = await r.json()
        const items = j.items || []
        const batas = Date.now() - 15 * 60 * 1000
        const cocok = items.find(function (it) {
          const desc = (it.snippet && it.snippet.description) || ''
          const t = Date.parse(it.snippet && it.snippet.publishedAt ? it.snippet.publishedAt : '')
          return desc.indexOf('REF ' + ref) === 0 && (isNaN(t) ? true : t >= batas)
        }) || items[0]
        if (!cocok) { res.statusCode = 404; res.end(JSON.stringify({ error: 'Video tidak ditemukan di channel' })); return }
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ videoId: cocok.id && cocok.id.videoId }))
      })
      `
    v = v.replace(marker, middlewareVerify + marker)
    simpan(FILE_V, v)
    console.log('[BERHASIL] Middleware verify ditambahkan di vite.config.js')
  }
}

/* ===== 4. DashboardPage: pakai unggahVideoYouTube ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
let d = baca(FILE_D)
let berubah = false

const impLama = `import { parseYouTubeId, ytThumb, fetchYouTubeQuota, startYouTubeSession, uploadToYouTube } from '../lib/youtube.js'`
const impBaru = `import { parseYouTubeId, ytThumb, fetchYouTubeQuota, unggahVideoYouTube } from '../lib/youtube.js'`
if (d.includes(impBaru)) {
  console.log('[SUDAH ADA] Import unggahVideoYouTube')
} else if (d.includes(impLama)) {
  d = d.replace(impLama, impBaru)
  berubah = true
  console.log('[BERHASIL] Import YouTube diperbarui')
} else {
  console.log('[TIDAK KETEMU] Import YouTube di DashboardPage')
}

const logLama = `          const sesiData = await supabase.auth.getSession()
          const tokenS = sesiData.data.session ? sesiData.data.session.access_token : ''
          const sesi = await startYouTubeSession(it.judul || 'Dokumentasi Magang', 'Diunggah dari portal logbook magang BSI.', it.file.type || 'video/mp4', tokenS)
          const hasilYt = await uploadToYouTube(sesi.sessionUri, it.file, function (p) { setInfoProses('Mengunggah ke YouTube... ' + Math.round(p * 100) + '%') })`
const logBaru = `          const hasilYt = await unggahVideoYouTube(it.file, it.judul || 'Dokumentasi Magang', function (p) { setInfoProses('Mengunggah ke YouTube... ' + Math.round(p * 100) + '%') })`
if (d.includes(logBaru)) {
  console.log('[SUDAH ADA] Alur upload video logbook')
} else if (d.includes(logLama)) {
  d = d.replace(logLama, logBaru)
  berubah = true
  console.log('[BERHASIL] Alur upload video logbook diperbarui')
} else {
  console.log('[TIDAK KETEMU] Alur upload video logbook')
}

const galLama = `        const sesiData = await supabase.auth.getSession()
        const tokenS = sesiData.data.session ? sesiData.data.session.access_token : ''
        const sesi = await startYouTubeSession(galForm.judul || ('Dokumentasi ' + galForm.tanggal), galForm.deskripsi || '', galForm.file.type || 'video/mp4', tokenS)
        const hasilYt = await uploadToYouTube(sesi.sessionUri, galForm.file, function (p) { setInfoProses('Mengunggah ke YouTube... ' + Math.round(p * 100) + '%') })`
const galBaru = `        const hasilYt = await unggahVideoYouTube(galForm.file, galForm.judul || ('Dokumentasi ' + galForm.tanggal), function (p) { setInfoProses('Mengunggah ke YouTube... ' + Math.round(p * 100) + '%') })`
if (d.includes(galBaru)) {
  console.log('[SUDAH ADA] Alur upload video galeri')
} else if (d.includes(galLama)) {
  d = d.replace(galLama, galBaru)
  berubah = true
  console.log('[BERHASIL] Alur upload video galeri diperbarui')
} else {
  console.log('[TIDAK KETEMU] Alur upload video galeri')
}

if (berubah) {
  simpan(FILE_D, d)
}

console.log('')
console.log('Selesai. Restart dev server: Ctrl+C lalu npm run dev -- --host')
console.log('')
console.log('Catatan penting:')
console.log('1. Video yang tadi sempat gagal tersimpan tetapi sudah masuk YouTube Studio bisa diselamatkan:')
console.log('   salin link video tersebut dari YouTube Studio, lalu tempel di kolom link YouTube unlisted.')
console.log('2. Upload berikutnya: progres 100 persen akan langsung dilanjutkan verifikasi, lalu logbook tersimpan.')
console.log('3. Bila verifikasi gagal menemukan video, barulah muncul pesan gagal yang benar-benar gagal.')
```

## File: fix-errors.cjs
```javascript
const fs = require('fs');
const path = require('path');

console.log('Memulai perbaikan file...');

// 1. Perbaiki sintaks JSX di cards.jsx
const cardsPath = path.join(process.cwd(), 'src/components/cards.jsx');
let cardsCode = fs.readFileSync(cardsPath, 'utf8');

cardsCode = cardsCode.replace(
  `{it.media_path ? (\n                     {it.media_source === 'youtube' ? (`,
  `{it.media_path ? (\n                     it.media_source === 'youtube' ? (`
);
cardsCode = cardsCode.replace(
  `<ZoomableMedia src={it.media_thumb || it.media_path} full={it.media_path} type={it.media_type} title={it.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900 mb-3" />\n                     )}\n                   ) : null}`,
  `<ZoomableMedia src={it.media_thumb || it.media_path} full={it.media_path} type={it.media_type} title={it.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900 mb-3" />\n                     )\n                   ) : null}`
);
fs.writeFileSync(cardsPath, cardsCode);
console.log('[BERHASIL] src/components/cards.jsx diperbaiki.');

// 2. Hapus import dan state yang ganda di DashboardPage.jsx
const dashPath = path.join(process.cwd(), 'src/pages/DashboardPage.jsx');
let dashCode = fs.readFileSync(dashPath, 'utf8');

dashCode = dashCode.replace(
  `import { pratinjauHeic, formatHeic } from '../lib/konversi.js'\nimport { parseYouTubeId, ytThumb, fetchYouTubeQuota, startYouTubeSession, uploadToYouTube } from '../lib/youtube.js'`,
  `import { pratinjauHeic, formatHeic } from '../lib/konversi.js'`
);

dashCode = dashCode.replace(
  `  const [galOldYt, setGalOldYt] = useState(null)\n  const [ytQuota, setYtQuota] = useState({ limit: 6, used: 0, remaining: 6 })\n  const [itemMode, setItemMode] = useState({})\n  const [galMode, setGalMode] = useState('foto')\n  const [galYtLink, setGalYtLink] = useState('')\n  const [galYtTitle, setGalYtTitle] = useState('')`,
  `  const [galOldYt, setGalOldYt] = useState(null)\n  const [itemMode, setItemMode] = useState({})\n  const [galYtTitle, setGalYtTitle] = useState('')`
);

fs.writeFileSync(dashPath, dashCode);
console.log('[BERHASIL] src/pages/DashboardPage.jsx diperbaiki.');

console.log('\nSelesai! Silakan jalankan ulang npm run dev.');
```

## File: setup-semua-fitur.cjs
```javascript
// setup-semua-fitur.cjs
// Skrip induk untuk menjalankan seluruh pemasangan fitur secara otomatis.
// Jalankan: node setup-semua-fitur.cjs

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const root = process.cwd()

// Urutan skrip yang harus dijalankan. Urutan penting karena
// beberapa skrip bergantung pada hasil skrip sebelumnya.
const URUTAN = [
  // 1. Dasar konversi dan upload
  'apply-perbaiki-konversi.cjs',
  'apply-heic-webp.cjs',
  'apply-foto-webp-progres.cjs',
  'apply-hint-fileinput.cjs',
  'apply-fix-progres-hint.cjs',

  // 2. Pratinjau HEIC di form
  'apply-preview-heic.cjs',
  'apply-preview-heic-galeri.cjs',
  'apply-preview-loading.cjs',

  // 3. Thumbnail otomatis
  'apply-thumbnail.cjs',
  'apply-thumb-folder.cjs',
  'apply-thumb-display.cjs',
  'apply-thumb-cleanup.cjs',

  // 4. Tampilan adaptif (SmartFit)
  'apply-smart-fit.cjs',
  'apply-smart-fit-carousel.cjs',
  'apply-smartfit-fallback.cjs',

  // 5. Integrasi YouTube (backend + frontend + UI)
  'apply-youtube-backend.cjs',
  'apply-youtube-frontend.cjs',
  'apply-youtube-final.cjs',
  'apply-youtube-final-fix.cjs',
]

function jalanSkrip(namaFile) {
  const fullPath = path.join(root, namaFile)
  if (!fs.existsSync(fullPath)) {
    console.log('[LEWATI] ' + namaFile + ' tidak ditemukan.')
    return { nama: namaFile, status: 'lewat', pesan: 'file tidak ada' }
  }
  try {
    console.log('\n' + '='.repeat(60))
    console.log('>>> Menjalankan: ' + namaFile)
    console.log('='.repeat(60))
    execSync('node "' + namaFile + '"', { stdio: 'inherit', cwd: root })
    return { nama: namaFile, status: 'ok' }
  } catch (err) {
    console.error('[GAGAL] ' + namaFile + ': ' + err.message)
    return { nama: namaFile, status: 'gagal', pesan: err.message }
  }
}

console.log('========================================')
console.log('  PEMASANGAN SEMUA FITUR SECARA OTOMATIS')
console.log('========================================')
console.log('Direktori kerja: ' + root)
console.log('Jumlah skrip yang akan dijalankan: ' + URUTAN.length)

const hasil = []
for (const nama of URUTAN) {
  hasil.push(jalanSkrip(nama))
}

console.log('\n' + '='.repeat(60))
console.log('RINGKASAN PEMASANGAN')
console.log('='.repeat(60))

const ok = hasil.filter(h => h.status === 'ok').length
const lewat = hasil.filter(h => h.status === 'lewat').length
const gagal = hasil.filter(h => h.status === 'gagal').length

hasil.forEach(h => {
  const ikon = h.status === 'ok' ? '[OK]    ' : h.status === 'lewat' ? '[LEWAT] ' : '[GAGAL] '
  console.log(ikon + h.nama + (h.pesan ? ' (' + h.pesan + ')' : ''))
})

console.log('\nTotal: ' + ok + ' berhasil, ' + lewat + ' dilewati, ' + gagal + ' gagal.')

if (gagal > 0) {
  console.log('\n[PERINGATAN] Ada skrip yang gagal. Periksa log di atas.')
  process.exit(1)
}

console.log('\n========================================')
console.log('  SEMUA FITUR TELAH TERPASANG')
console.log('========================================')
console.log('')
console.log('Langkah selanjutnya yang perlu kamu lakukan:')
console.log('  1. Pastikan node_modules sudah terpasang:')
console.log('       npm install')
console.log('     (terutama heic2any, @supabase/supabase-js, @aws-sdk/client-s3)')
console.log('')
console.log('  2. Salin .env.example menjadi .env.local dan isi:')
console.log('       VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY,')
console.log('       SUPABASE_SERVICE_ROLE_KEY,')
console.log('       R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,')
console.log('       R2_BUCKET_NAME, R2_PUBLIC_BASE_URL,')
console.log('       YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET')
console.log('')
console.log('  3. Dapatkan refresh token YouTube:')
console.log('       node setup-youtube-token.cjs')
console.log('     Salin token yang muncul ke YOUTUBE_REFRESH_TOKEN di .env.local')
console.log('')
console.log('  4. Jalankan skema database di Supabase SQL Editor:')
console.log('       salin isi file supabase/schema.sql')
console.log('')
console.log('  5. Jalankan server pengembangan:')
console.log('       npm run dev')
console.log('     Buka http://localhost:5173')
console.log('')
console.log('  6. Untuk deploy ke Vercel:')
console.log('       - Push ke GitHub')
console.log('       - Import proyek di Vercel')
console.log('       - Salin semua isi .env.local ke Environment Variables Vercel')
```

## File: setup-youtube-token.cjs
```javascript
const fs = require('fs')
const path = require('path')
const http = require('http')
const crypto = require('crypto')

const env = {}
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(function (line) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  })
}

const clientId = env.YOUTUBE_CLIENT_ID
const clientSecret = env.YOUTUBE_CLIENT_SECRET
if (!clientId || !clientSecret) {
  console.log('[GAGAL] Isi dulu YOUTUBE_CLIENT_ID dan YOUTUBE_CLIENT_SECRET di .env.local')
  process.exit(1)
}

const PORT = 8790
const redirect = 'http://localhost:' + PORT + '/callback'
const state = crypto.randomBytes(8).toString('hex')
const scope = 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly'
const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
  client_id: clientId, redirect_uri: redirect, response_type: 'code',
  scope: scope, access_type: 'offline', prompt: 'consent', state: state
})

const server = http.createServer(async function (req, res) {
  const u = new URL(req.url, 'http://localhost')
  if (u.pathname !== '/callback') { res.end('ok'); return }
  const code = u.searchParams.get('code')
  const st = u.searchParams.get('state')
  if (st !== state) { res.end('State tidak cocok'); return }
  const body = new URLSearchParams({
    code, client_id: clientId, client_secret: clientSecret,
    redirect_uri: redirect, grant_type: 'authorization_code'
  })
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body })
  const j = await r.json()
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  if (j.refresh_token) {
    res.end('<h2>Berhasil!</h2><p>Salin refresh token ini:</p><code style="word-break:break-all;background:#f1f5f9;padding:8px;display:block;">' + j.refresh_token + '</code>')
    console.log('\nREFRESH TOKEN:')
    console.log(j.refresh_token)
  } else {
    res.end('<h2>Gagal</h2><pre>' + JSON.stringify(j, null, 2) + '</pre>')
  }
  setTimeout(function () { server.close(); process.exit(0) }, 2000)
})

server.listen(PORT, function () {
  console.log('Membuka browser... Jika tidak otomatis, buka URL ini:')
  console.log(url)
  try {
    require('child_process').exec(process.platform === 'win32' ? 'start "" "' + url + '"' : 'xdg-open ' + url)
  } catch (e) {}
})
```

## File: api/r2/delete.js
```javascript
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { createClient } from '@supabase/supabase-js'

const s3 = new S3Client({
  region: 'auto',
  endpoint: 'https://' + process.env.R2_ACCOUNT_ID + '.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
})

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Belum login' })

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } }
  })
  const check = await supabase.auth.getUser(token)
  if (check.error || !check.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })

  const { key } = req.body || {}
  if (!key) return res.status(400).json({ error: 'Key tidak ada' })
  await s3.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }))
  return res.status(200).json({ ok: true })
}
```

## File: api/r2/presign.js
```javascript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createClient } from '@supabase/supabase-js'

const s3 = new S3Client({
  region: 'auto',
  endpoint: 'https://' + process.env.R2_ACCOUNT_ID + '.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
})

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Belum login' })

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } }
  })
  const check = await supabase.auth.getUser(token)
  if (check.error || !check.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })

  const { filename, contentType, kind } = req.body || {}
  if (!filename || !contentType || !kind) return res.status(400).json({ error: 'Payload tidak lengkap' })

  const ext = (filename.split('.').pop() || 'bin').toLowerCase()
  const key = kind + '/' + new Date().getFullYear() + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext

  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key, ContentType: contentType }),
    { expiresIn: 300 }
  )
  const publicUrl = process.env.R2_PUBLIC_BASE_URL + '/' + key
  return res.status(200).json({ uploadUrl, publicUrl, key })
}
```

## File: src/components/Skeleton.jsx
```javascript
export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <div className="skeleton h-4 w-28"></div>
      <div className="skeleton h-9 w-16 mt-3"></div>
      <div className="skeleton h-3 w-36 mt-2"></div>
    </div>
  )
}

export function SkeletonLogbookCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
      <div className="skeleton h-40 w-full rounded-2xl"></div>
      <div className="flex gap-2">
        <div className="skeleton h-6 w-24 rounded-full"></div>
        <div className="skeleton h-6 w-20 rounded-full"></div>
      </div>
      <div className="skeleton h-4 w-32"></div>
      <div className="skeleton h-6 w-3/4"></div>
      <div className="skeleton h-4 w-full"></div>
      <div className="skeleton h-4 w-2/3"></div>
      <div className="flex items-center gap-3 pt-2">
        <div className="skeleton h-11 w-11 rounded-2xl"></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-32"></div>
          <div className="skeleton h-3 w-24"></div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonGalleryCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="skeleton aspect-video w-full rounded-none"></div>
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="skeleton h-6 w-24 rounded-full"></div>
          <div className="skeleton h-4 w-16"></div>
        </div>
        <div className="skeleton h-5 w-3/4"></div>
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-1/2"></div>
      </div>
    </div>
  )
}

export function SkeletonAttendanceCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-4 w-40"></div>
          <div className="skeleton h-5 w-32"></div>
        </div>
        <div className="skeleton h-6 w-16 rounded-full"></div>
      </div>
      <div className="skeleton h-16 w-full rounded-2xl"></div>
    </div>
  )
}

export function SkeletonPersonCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-4">
        <div className="skeleton h-14 w-14 rounded-3xl"></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-5 w-32"></div>
          <div className="skeleton h-4 w-24"></div>
          <div className="skeleton h-4 w-28 rounded-full"></div>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="skeleton h-20 rounded-2xl"></div>
        <div className="skeleton h-20 rounded-2xl"></div>
      </div>
    </div>
  )
}

export function SkeletonChartRow() {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-4 w-32"></div>
          <div className="skeleton h-3 w-24"></div>
        </div>
        <div className="skeleton h-4 w-40"></div>
      </div>
      <div className="skeleton h-4 w-full rounded-full mt-4"></div>
    </div>
  )
}
```

## File: src/lib/konversi.js
```javascript
const MAKS_SISI_FULL = 2560
const KUALITAS_FULL = 0.92
const MAKS_SISI_THUMB = 1200
const KUALITAS_THUMB = 0.9
const EXT_VIDEO = ['mp4', 'mov', 'm4v', 'webm', 'ogg', 'mkv', 'avi']

export function ekstensiFile(file) {
  return String(file.name || '').split('.').pop().toLowerCase()
}

export function iniVideo(file) {
  if (file.type && file.type.indexOf('video') === 0) return true
  return EXT_VIDEO.indexOf(ekstensiFile(file)) !== -1
}

export function formatHeic(file) {
  const e = ekstensiFile(file)
  return e === 'heic' || e === 'heif'
}

async function heicKeJpeg(file) {
  const mod = await import('heic2any')
  const heic = mod.default || mod
  const hasil = await heic({ blob: file, toType: 'image/jpeg', quality: 0.92 })
  return Array.isArray(hasil) ? hasil[0] : hasil
}

async function bitmapDari(berkas) {
  try {
    return await createImageBitmap(berkas, { imageOrientation: 'from-image' })
  } catch (e) {
    return await createImageBitmap(berkas)
  }
}

async function keWebP(berkas, maksSisi, kualitas) {
  const bitmap = await bitmapDari(berkas)
  const skala = Math.min(1, maksSisi / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * skala))
  const h = Math.max(1, Math.round(bitmap.height * skala))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  const blob = await new Promise(function (resolve) {
    canvas.toBlob(resolve, 'image/webp', kualitas)
  })
  canvas.width = 0
  canvas.height = 0
  if (!blob || blob.type !== 'image/webp') return null
  return blob
}

export async function siapkanFoto(file, onInfo) {
  let sumber = file
  if (formatHeic(file)) {
    if (onInfo) onInfo('Mengonversi HEIC ke JPG')
    const jpeg = await heicKeJpeg(file)
    if (!jpeg) throw new Error('File HEIC tidak bisa dibaca')
    sumber = new File([jpeg], 'sumber.jpg', { type: 'image/jpeg' })
  }
  if (onInfo) onInfo('Menyiapkan WebP')
  let fullBlob = null
  try {
    fullBlob = await keWebP(sumber, MAKS_SISI_FULL, KUALITAS_FULL)
  } catch (e) {
    fullBlob = null
  }
  const pakaiWebp = !!fullBlob && (sumber.type !== 'image/jpeg' || fullBlob.size < sumber.size)
  const fullFinal = pakaiWebp ? fullBlob : sumber
  const fullType = pakaiWebp ? 'image/webp' : sumber.type
  let thumbBlob = null
  try {
    thumbBlob = await keWebP(fullFinal, MAKS_SISI_THUMB, KUALITAS_THUMB)
  } catch (e) {
    thumbBlob = null
  }
  return { fullBlob: fullFinal, fullType: fullType, thumbBlob: thumbBlob }
}


export async function pratinjauHeic(file) {
  if (!formatHeic(file)) return null
  try {
    const jpeg = await heicKeJpeg(file)
    return jpeg || null
  } catch (e) {
    return null
  }
}
```

## File: src/lib/supabase.js
```javascript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

## File: src/lib/theme.jsx
```javascript
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider(props) {
  const [dark, setDark] = useState(function () {
    const saved = localStorage.getItem('mbsi-theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(function () {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('mbsi-theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <ThemeContext.Provider value={{ dark: dark, toggle: function () { setDark(function (d) { return !d }) } }}>
      {props.children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
```

## File: src/main.jsx
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

## File: .env.example
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=mbsi-media
R2_PUBLIC_BASE_URL=
```

## File: .gitignore
```
node_modules
dist
.env.local
.env
*.log
```

## File: index.html
```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2064%2064'%3E%3Crect%20width='64'%20height='64'%20rx='14'%20fill='%2316623c'/%3E%3Ctext%20x='32'%20y='44'%20font-size='34'%20font-weight='700'%20text-anchor='middle'%20fill='%23ffffff'%20font-family='Arial,%20sans-serif'%3EB%3C/text%3E%3C/svg%3E" />
    <title>Logbook Magang BSI</title>
  </head>
  <body class="bg-slate-50 text-slate-800 min-h-screen antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

## File: postcss.config.js
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

## File: tailwind.config.js
```javascript
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bsi: {
          50: '#effef5', 100: '#d9fbe5', 200: '#b5f5cd', 300: '#86ecb0',
          400: '#50d98b', 500: '#27c06d', 600: '#1a9e57', 700: '#177c48',
          800: '#16623c', 900: '#135033', 950: '#072c1b'
        },
        gold: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' }
      }
    }
  },
  plugins: []
}
```

## File: vercel.json
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## File: src/components/controls.jsx
```javascript
import { useEffect, useRef, useState } from 'react'
import { ICONS } from './icons.jsx'

const BULAN_NAMA = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const HARI_NAMA = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const defaultBtn = 'flex w-full items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-bsi-500'

function pad(n) {
  return (n < 10 ? '0' : '') + n
}

function parseValue(value, mode) {
  if (!value) return null
  const p = String(value).split('-')
  if (mode === 'month') {
    if (p.length < 2) return null
    const y = parseInt(p[0], 10)
    const m = parseInt(p[1], 10) - 1
    if (isNaN(y) || isNaN(m) || m < 0 || m > 11) return null
    return { y: y, m: m }
  }
  if (p.length < 3) return null
  const y = parseInt(p[0], 10)
  const m = parseInt(p[1], 10) - 1
  const d = parseInt(p[2], 10)
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null
  return { y: y, m: m, d: d }
}

function useOutside(ref, open, setOpen) {
  useEffect(function () {
    if (!open) return undefined
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return function () { document.removeEventListener('mousedown', handler) }
  }, [open])
}

export function CustomSelect(props) {
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)
  useOutside(boxRef, open, setOpen)
  const options = props.options || []
  const current = options.find(function (o) { return o.value === props.value }) || null

  return (
    <div ref={boxRef} className={'relative ' + (props.className || '')}>
      <button
        type="button"
        onClick={function () { setOpen(function (o) { return !o }) }}
        className={(props.buttonCls || defaultBtn) + ' text-left'}
      >
        {props.icon ? <span className="shrink-0 text-slate-400">{props.icon}</span> : null}
        <span className={'flex-1 truncate ' + (current ? 'text-slate-800' : 'text-slate-400')}>
          {current ? current.label : (props.placeholder || 'Pilih')}
        </span>
        <span className={'shrink-0 text-slate-400 transition-transform duration-200 ' + (open ? 'rotate-180' : '')}>{ICONS.chevron}</span>
      </button>
      {open ? (
        <div className="anim-modal absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white py-1 shadow-xl">
          {options.map(function (o) {
            const active = o.value === props.value
            return (
              <button
                type="button"
                key={String(o.value)}
                onClick={function () { props.onChange(o.value); setOpen(false) }}
                className={'flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm ' + (active ? 'bg-bsi-800 text-white' : 'text-slate-700 hover:bg-slate-100')}
              >
                <span className="truncate">{o.label}</span>
                {active ? <span className="shrink-0">{ICONS.check}</span> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export function CustomDateInput(props) {
  const mode = props.mode || 'date'
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(function () {
    const p = parseValue(props.value, mode)
    const t = new Date()
    return p ? { y: p.y, m: p.m } : { y: t.getFullYear(), m: t.getMonth() }
  })
  const boxRef = useRef(null)
  useOutside(boxRef, open, setOpen)

  const sel = parseValue(props.value, mode)
  const today = new Date()

  function toggle() {
    if (!open) {
      const p = parseValue(props.value, mode)
      if (p) setView({ y: p.y, m: p.m })
    }
    setOpen(function (o) { return !o })
  }

  function shift(delta) {
    setView(function (v) {
      if (mode === 'month') return { y: v.y + delta, m: v.m }
      let m = v.m + delta
      let y = v.y
      if (m < 0) { m = 11; y -= 1 }
      if (m > 11) { m = 0; y += 1 }
      return { y: y, m: m }
    })
  }

  function pickDay(d) {
    props.onChange(view.y + '-' + pad(view.m + 1) + '-' + pad(d))
    setOpen(false)
  }

  function pickMonth(m) {
    props.onChange(view.y + '-' + pad(m + 1))
    setOpen(false)
  }

  function pickToday() {
    const t = new Date()
    if (mode === 'month') props.onChange(t.getFullYear() + '-' + pad(t.getMonth() + 1))
    else props.onChange(t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate()))
    setOpen(false)
  }

  const label = sel
    ? (mode === 'month' ? BULAN_NAMA[sel.m] + ' ' + sel.y : sel.d + ' ' + BULAN_PENDEK[sel.m] + ' ' + sel.y)
    : ''

  const firstDay = new Date(view.y, view.m, 1).getDay()
  const daysCount = new Date(view.y, view.m + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysCount; d++) cells.push(d)

  return (
    <div ref={boxRef} className={'relative ' + (props.className || '')}>
      <button type="button" onClick={toggle} className={(props.buttonCls || defaultBtn) + ' text-left'}>
        <span className="shrink-0 text-slate-400">{ICONS.calendar}</span>
        <span className={'flex-1 truncate ' + (props.value ? 'text-slate-800' : 'text-slate-400')}>
          {label || (mode === 'month' ? 'Pilih bulan' : 'Pilih tanggal')}
        </span>
        <span className={'shrink-0 text-slate-400 transition-transform duration-200 ' + (open ? 'rotate-180' : '')}>{ICONS.chevron}</span>
      </button>
      {open ? (
        <div className="anim-modal absolute z-30 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <button type="button" onClick={function () { shift(-1) }} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">&#8249;</button>
            <p className="text-sm font-bold text-slate-800">
              {mode === 'month' ? String(view.y) : BULAN_NAMA[view.m] + ' ' + view.y}
            </p>
            <button type="button" onClick={function () { shift(1) }} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">&#8250;</button>
          </div>

          {mode === 'date' ? (
            <div className="mt-3 grid grid-cols-7 gap-1 text-center">
              {HARI_NAMA.map(function (h) {
                return <span key={h} className="py-1 text-[11px] font-semibold text-slate-400">{h}</span>
              })}
              {cells.map(function (d, i) {
                if (d === null) return <span key={'kosong' + i} />
                const isSel = sel && sel.y === view.y && sel.m === view.m && sel.d === d
                const isToday = today.getFullYear() === view.y && today.getMonth() === view.m && today.getDate() === d
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={function () { pickDay(d) }}
                    className={'mx-auto grid h-8 w-8 place-items-center rounded-lg text-sm ' + (isSel ? 'bg-bsi-800 font-semibold text-white' : isToday ? 'font-bold text-bsi-700 ring-1 ring-bsi-500' : 'text-slate-700 hover:bg-slate-100')}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {BULAN_NAMA.map(function (nama, m) {
                const isSel = sel && sel.y === view.y && sel.m === m
                const isNow = today.getFullYear() === view.y && today.getMonth() === m
                return (
                  <button
                    key={nama}
                    type="button"
                    onClick={function () { pickMonth(m) }}
                    className={'rounded-lg px-2 py-2 text-xs font-semibold ' + (isSel ? 'bg-bsi-800 text-white' : isNow ? 'text-bsi-700 ring-1 ring-bsi-500' : 'text-slate-700 hover:bg-slate-100')}
                  >
                    {nama}
                  </button>
                )
              })}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <button type="button" onClick={function () { props.onChange(''); setOpen(false) }} className="text-sm font-semibold text-slate-500 hover:text-red-600">Hapus</button>
            <button type="button" onClick={pickToday} className="text-sm font-semibold text-bsi-700 hover:text-bsi-900">Hari ini</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function FileInput(props) {
  const inputRef = useRef(null)
  return (
    <div className={props.className || ''}>
      <input
        ref={inputRef}
        type="file"
        accept={props.accept || 'image/*,video/*'}
        className="hidden"
        onChange={function (e) {
          if (props.onChange) props.onChange(e)
          e.target.value = ''
        }}
      />
      <button
        type="button"
        onClick={function () { inputRef.current.click() }}
        className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-4 py-4 text-left transition hover:border-bsi-500 hover:bg-slate-100"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-bsi-100 text-bsi-800">{ICONS.image}</span>
        <span className="min-w-0 flex-1">
          <span className={'block truncate text-sm font-semibold ' + (props.fileName ? 'text-slate-800' : 'text-slate-500')}>
            {props.fileName || 'Klik untuk pilih foto atau video'}
          </span>
          <span className="block text-xs text-slate-400">{props.hint || 'Foto JPG, PNG, atau HEIC otomatis dikonversi. Video maks 50 MB.'}</span>
        </span>
        {props.fileName ? <span className="shrink-0 text-xs font-semibold text-bsi-700">Ganti</span> : null}
      </button>
    </div>
  )
}
```

## File: src/lib/auth.js
```javascript
import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'

const EMAIL_DOMAIN = '@mbsi.local'

export async function loginWithNim(nim, kode) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: nim.trim() + EMAIL_DOMAIN,
    password: kode
  })
  if (error) throw error
  return data
}

export async function logoutMahasiswa() {
  await supabase.auth.signOut()
}

export function useAuth() {
  const [mahasiswa, setMahasiswa] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      const { data } = await supabase.auth.getSession()
      const uid = data.session ? data.session.user.id : null
      if (!uid) {
        if (active) setLoading(false)
        return
      }
      const res = await supabase.from('mahasiswa').select('*').eq('auth_uid', uid).single()
      if (active) {
        setMahasiswa(res.data)
        setLoading(false)
      }
    }
    load()
    const sub = supabase.auth.onAuthStateChange(function (event, session) {
      if (!session) setMahasiswa(null)
    })
    return function () {
      active = false
      sub.data.subscription.unsubscribe()
    }
  }, [])

  return { mahasiswa: mahasiswa, loading: loading }
}
```

## File: src/lib/constants.js
```javascript
export const KATEGORI = [
  'Administrasi',
  'Pengarsipan',
  'Layanan Nasabah',
  'Back Office',
  'Edukasi Produk',
  'Pendataan',
  'Rapat',
  'Pelatihan',
  'Dokumentasi',
  'Pendukung Lain'
]

export const UNIT = ['Frontliner', 'Back Office', 'Marketing', 'Operasional', 'Umum']

export const GALERI_KEGIATAN = [
  'Dokumentasi',
  'Administrasi',
  'Layanan Nasabah',
  'Edukasi',
  'Pelatihan',
  'Operasional',
  'Lainnya'
]
```

## File: src/App.jsx
```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './lib/theme.jsx'
import { useAuth } from './lib/auth.js'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import LogbookPage from './pages/LogbookPage.jsx'
import GalleryPage from './pages/GalleryPage.jsx'
import AttendancePage from './pages/AttendancePage.jsx'
import DospemPage from './pages/DospemPage.jsx'
import TimPage from './pages/TimPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'

function RequireAuth(props) {
  const { mahasiswa, loading } = useAuth()
  if (loading) return <div className="p-10 text-center text-slate-500">Memuat sesi...</div>
  if (!mahasiswa) return <Navigate to="/login" replace />
  return props.children
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/logbook" element={<LogbookPage />} />
            <Route path="/galeri" element={<GalleryPage />} />
            <Route path="/absen" element={<AttendancePage />} />
            <Route path="/dospem" element={<DospemPage />} />
            <Route path="/tim" element={<TimPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
```

## File: supabase/schema.sql
```sql
create extension if not exists "pgcrypto";
create table public.mahasiswa (
  id uuid primary key default gen_random_uuid(),
  auth_uid uuid unique references auth.users(id) on delete cascade,
  nim varchar(20) not null unique,
  nama varchar(100) not null,
  created_at timestamptz not null default now()
);
create table public.logbooks (
  id uuid primary key default gen_random_uuid(),
  mahasiswa_id uuid not null references public.mahasiswa(id) on delete cascade,
  tanggal date not null,
  unit varchar(50),
  kategori varchar(50) not null,
  judul varchar(255) not null,
  kendala text,
  solusi text,
  pembelajaran text,
  status varchar(20) not null default 'draft' check (status in ('draft','publik')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.logbook_items (
  id uuid primary key default gen_random_uuid(),
  logbook_id uuid not null references public.logbooks(id) on delete cascade,
  urutan integer not null default 1,
  judul varchar(255) not null,
  deskripsi text,
  hasil text,
  media_path text,
  media_type varchar(10) check (media_type in ('foto','video')),
  show_in_gallery boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.galeri (
  id uuid primary key default gen_random_uuid(),
  mahasiswa_id uuid not null references public.mahasiswa(id) on delete cascade,
  logbook_item_id uuid unique references public.logbook_items(id) on delete cascade,
  judul varchar(255) not null,
  deskripsi text,
  tanggal date not null,
  kegiatan varchar(50),
  media_path text not null,
  media_type varchar(10) not null check (media_type in ('foto','video')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.daftar_hadir (
  id uuid primary key default gen_random_uuid(),
  mahasiswa_id uuid not null references public.mahasiswa(id) on delete cascade,
  tanggal date not null,
  status varchar(20) not null check (status in ('Masuk','Izin','Bolos')),
  alasan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (mahasiswa_id, tanggal)
);
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;
create trigger trg_logbooks_upd before update on public.logbooks for each row execute function public.set_updated_at();
create trigger trg_galeri_upd before update on public.galeri for each row execute function public.set_updated_at();
create trigger trg_hadir_upd before update on public.daftar_hadir for each row execute function public.set_updated_at();
create index idx_logbooks_mahasiswa on public.logbooks(mahasiswa_id, tanggal desc);
create index idx_logbooks_status on public.logbooks(status);
create index idx_items_logbook on public.logbook_items(logbook_id, urutan);
create index idx_galeri_mahasiswa on public.galeri(mahasiswa_id, tanggal desc);
create index idx_galeri_item on public.galeri(logbook_item_id);
create index idx_hadir_mahasiswa on public.daftar_hadir(mahasiswa_id, tanggal desc);
alter table public.mahasiswa enable row level security;
alter table public.logbooks enable row level security;
alter table public.logbook_items enable row level security;
alter table public.galeri enable row level security;
alter table public.daftar_hadir enable row level security;
create policy "mahasiswa_read_all" on public.mahasiswa for select using (true);
create policy "mahasiswa_update_self" on public.mahasiswa for update using (auth_uid = auth.uid());
create policy "logbooks_read" on public.logbooks for select using (
  status = 'publik' or mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "logbooks_insert_self" on public.logbooks for insert with check (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "logbooks_update_self" on public.logbooks for update using (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "logbooks_delete_self" on public.logbooks for delete using (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "items_read" on public.logbook_items for select using (
  exists (select 1 from public.logbooks l where l.id = logbook_id
    and (l.status = 'publik' or l.mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())))
);
create policy "items_write_self" on public.logbook_items for all using (
  exists (select 1 from public.logbooks l where l.id = logbook_id
    and l.mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid()))
) with check (
  exists (select 1 from public.logbooks l where l.id = logbook_id
    and l.mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid()))
);
create policy "galeri_read_all" on public.galeri for select using (true);
create policy "galeri_insert_self" on public.galeri for insert with check (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "galeri_update_self" on public.galeri for update using (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "galeri_delete_self" on public.galeri for delete using (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "hadir_read_all" on public.daftar_hadir for select using (true);
create policy "hadir_insert_self" on public.daftar_hadir for insert with check (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "hadir_update_self" on public.daftar_hadir for update using (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "hadir_delete_self" on public.daftar_hadir for delete using (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
```

## File: vite.config.js
```javascript
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createClient } from '@supabase/supabase-js'

function bacaBody(req) {
  return new Promise(function (resolve) {
    let data = ''
    req.on('data', function (c) { data += c })
    req.on('end', function () {
      try { resolve(JSON.parse(data || '{}')) } catch (e) { resolve({}) }
    })
  })
}

function pluginApiR2(env) {
  const s3 = new S3Client({
    region: 'auto',
    endpoint: 'https://' + env.R2_ACCOUNT_ID + '.r2.cloudflarestorage.com',
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY
    }
  })

  async function cekSesi(req) {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) return false
    const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    })
    const r = await supabase.auth.getUser(token)
    return !r.error && !!r.data.user
  }

  return {
    name: 'api-r2-dev',
    configureServer(server) {
      server.middlewares.use('/api/r2/presign', async function (req, res) {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method tidak diizinkan' }))
          return
        }
        const ok = await cekSesi(req)
        if (!ok) {
          res.statusCode = 401
          res.end(JSON.stringify({ error: 'Sesi tidak valid' }))
          return
        }
        const body = await bacaBody(req)
        const ext = String(body.filename || 'bin').split('.').pop().toLowerCase()
        const key = body.kind + '/' + new Date().getFullYear() + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext
        const uploadUrl = await getSignedUrl(
          s3,
          new PutObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key, ContentType: body.contentType }),
          { expiresIn: 300 }
        )
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          uploadUrl: uploadUrl,
          publicUrl: env.R2_PUBLIC_BASE_URL + '/' + key,
          key: key
        }))
      })

      server.middlewares.use('/api/r2/delete', async function (req, res) {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method tidak diizinkan' }))
          return
        }
        const ok = await cekSesi(req)
        if (!ok) {
          res.statusCode = 401
          res.end(JSON.stringify({ error: 'Sesi tidak valid' }))
          return
        }
        const body = await bacaBody(req)
        await s3.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: body.key }))
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ ok: true }))
      })
    }
  }
}

function pluginApiYoutube(env) {
  const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  function ptToday() {
    const now = new Date()
    const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
    const y = pt.getFullYear()
    const m = String(pt.getMonth() + 1).padStart(2, '0')
    const d = String(pt.getDate()).padStart(2, '0')
    return y + '-' + m + '-' + d
  }
  async function cekSesi(req) {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) return null
    const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
    const r = await supabase.auth.getUser(token)
    return r.error ? null : r.data.user
  }
  return {
    name: 'api-youtube-dev',
    configureServer(server) {
      server.middlewares.use('/api/youtube/quota', async function (req, res) {
        const today = ptToday()
        const { count } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
        const used = count || 0
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', 'no-store')
        res.end(JSON.stringify({ limit: 5, used: used, remaining: Math.max(0, 5 - used), ptDate: today }))
      })
      server.middlewares.use('/api/youtube/verify', async function (req, res) {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Method tidak diizinkan' })); return }
        const user = await cekSesi(req)
        if (!user) { res.statusCode = 401; res.end(JSON.stringify({ error: 'Sesi tidak valid' })); return }
        const body = await bacaBody(req)
        const ref = body.ref
        if (!ref) { res.statusCode = 400; res.end(JSON.stringify({ error: 'Ref tidak ada' })); return }
        const params = new URLSearchParams()
        params.set('client_id', env.YOUTUBE_CLIENT_ID || '')
        params.set('client_secret', env.YOUTUBE_CLIENT_SECRET || '')
        params.set('refresh_token', env.YOUTUBE_REFRESH_TOKEN || '')
        params.set('grant_type', 'refresh_token')
        const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
        if (!tr.ok) { res.statusCode = 500; res.end(JSON.stringify({ error: 'Gagal refresh token YouTube' })); return }
        const tok = await tr.json()
        const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&forMine=true&order=date&maxResults=10&q=' + encodeURIComponent(ref), { headers: { Authorization: 'Bearer ' + tok.access_token } })
        if (!r.ok) { res.statusCode = 502; res.end(JSON.stringify({ error: 'Gagal memeriksa video di YouTube' })); return }
        const j = await r.json()
        const items = j.items || []
        const batas = Date.now() - 15 * 60 * 1000
        const cocok = items.find(function (it) {
          const desc = (it.snippet && it.snippet.description) || ''
          const t = Date.parse(it.snippet && it.snippet.publishedAt ? it.snippet.publishedAt : '')
          return desc.indexOf('REF ' + ref) === 0 && (isNaN(t) ? true : t >= batas)
        }) || items[0]
        if (!cocok) { res.statusCode = 404; res.end(JSON.stringify({ error: 'Video tidak ditemukan di channel' })); return }
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ videoId: cocok.id && cocok.id.videoId }))
      })
      server.middlewares.use('/api/youtube/latest', async function (req, res) {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Method tidak diizinkan' })); return }
        const user = await cekSesi(req)
        if (!user) { res.statusCode = 401; res.end(JSON.stringify({ error: 'Sesi tidak valid' })); return }
        const params = new URLSearchParams()
        params.set('client_id', env.YOUTUBE_CLIENT_ID || '')
        params.set('client_secret', env.YOUTUBE_CLIENT_SECRET || '')
        params.set('refresh_token', env.YOUTUBE_REFRESH_TOKEN || '')
        params.set('grant_type', 'refresh_token')
        const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
        if (!tr.ok) { res.statusCode = 500; res.end(JSON.stringify({ error: 'Gagal refresh token YouTube' })); return }
        const tok = await tr.json()
        const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&forMine=true&order=date&maxResults=5', { headers: { Authorization: 'Bearer ' + tok.access_token } })
        if (!r.ok) { const t = await r.text(); res.statusCode = 502; res.end(JSON.stringify({ error: 'Gagal memeriksa video terbaru: ' + r.status + ' ' + t })); return }
        const j = await r.json()
        const items = j.items || []
        const batas = Date.now() - 15 * 60 * 1000
        const cocok = items.find(function (it) {
          const t = Date.parse(it.snippet && it.snippet.publishedAt ? it.snippet.publishedAt : '')
          return isNaN(t) ? false : t >= batas
        })
        if (!cocok) { res.statusCode = 404; res.end(JSON.stringify({ error: 'Video terbaru tidak ditemukan' })); return }
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ videoId: cocok.id && cocok.id.videoId }))
      })
      server.middlewares.use('/api/youtube/session', async function (req, res) {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Method tidak diizinkan' })); return }
        const user = await cekSesi(req)
        if (!user) { res.statusCode = 401; res.end(JSON.stringify({ error: 'Sesi tidak valid' })); return }
        const today = ptToday()
        const { count } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
        const used = count || 0
        if (used >= 5) { res.statusCode = 429; res.end(JSON.stringify({ error: 'Kuota upload YouTube hari ini sudah habis. Gunakan link embed.', remaining: 0 })); return }
        const body = await bacaBody(req)
        const params = new URLSearchParams()
        params.set('client_id', env.YOUTUBE_CLIENT_ID || '')
        params.set('client_secret', env.YOUTUBE_CLIENT_SECRET || '')
        params.set('refresh_token', env.YOUTUBE_REFRESH_TOKEN || '')
        params.set('grant_type', 'refresh_token')
        const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
        if (!tr.ok) { res.statusCode = 500; res.end(JSON.stringify({ error: 'Gagal refresh token YouTube' })); return }
        const tok = await tr.json()
        const meta = {
          snippet: { title: String(body.title || 'Dokumentasi Magang').slice(0, 100), description: String(body.description || '').slice(0, 4000), tags: ['logbook-magang-bsi'], categoryId: '22' },
          status: { privacyStatus: 'unlisted', embeddable: true, publicStatsViewable: false }
        }
        const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + tok.access_token, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': body.contentType || 'video/mp4' },
          body: JSON.stringify(meta)
        })
        if (!init.ok) { const t = await init.text(); res.statusCode = 502; res.end(JSON.stringify({ error: 'Gagal memulai sesi YouTube: ' + t })); return }
        const sessionUri = init.headers.get('location')
        if (!sessionUri) { res.statusCode = 502; res.end(JSON.stringify({ error: 'Sesi upload tidak mengembalikan lokasi' })); return }
        await admin.from('youtube_quota_usage').insert({ pt_date: today, user_id: user.id })
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ sessionUri: sessionUri, remaining: Math.max(0, 5 - used - 1) }))
      })
    }
  }
}
export default defineConfig(function ({ mode }) {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), pluginApiR2(env), pluginApiYoutube(env)]
  }
})
```

## File: src/lib/format.js
```javascript
export function formatTanggal(s) {
  if (!s) return 'Tanggal belum diisi'
  const d = new Date(s + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return s
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatTanggalShort(s) {
  if (!s) return ''
  const d = new Date(s + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return s
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function todayInput() {
  const d = new Date()
  const m = ('0' + (d.getMonth() + 1)).slice(-2)
  const day = ('0' + d.getDate()).slice(-2)
  return d.getFullYear() + '-' + m + '-' + day
}

export function detectMediaType(u) {
  const ext = String(u || '').split('?')[0].split('.').pop().toLowerCase()
  return ['mp4', 'webm', 'ogg', 'mov', 'm4v'].indexOf(ext) !== -1 ? 'video' : 'foto'
}

export function matchesDateFilters(dateString, f) {
  if (!dateString) return false
  if (f.timeMode === 'bulan') {
    if (f.bulan) {
      if (f.bulan.length === 7) return dateString.slice(0, 7) === f.bulan
      const p = dateString.split('-')
      if (p.length < 2 || p[1] !== f.bulan) return false
    }
  } else if (f.timeMode === 'rentang') {
    if (f.dari && dateString < f.dari) return false
    if (f.sampai && dateString > f.sampai) return false
  }
  return true
}
export function urutkanTanggal(rows, mode) {
  const salin = (rows || []).slice()
  salin.sort(function (a, b) {
    const da = a.tanggal || ''
    const db = b.tanggal || ''
    if (da === db) return 0
    if (mode === 'terlama') return da < db ? -1 : 1
    return da < db ? 1 : -1
  })
  return salin
}
```

## File: package.json
```json
{
  "name": "mbsi-logbook",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.600.0",
    "@aws-sdk/s3-request-presigner": "^3.600.0",
    "@supabase/supabase-js": "^2.45.0",
    "heic2any": "^0.0.4",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.10",
    "vite": "^5.4.0"
  }
}
```

## File: README.md
```markdown
# Logbook Magang BSI

Portal logbook, galeri, dan daftar hadir magang Bank Syariah Indonesia.

## Menjalankan lokal
1. node setup project saat ini (sudah dilakukan saat setup)
2. npm run dev
3. Buka http://localhost:5173

## Database
Jalankan isi file supabase/schema.sql di Supabase SQL Editor.
Buat user Auth dengan pola email NIM@mbsi.local dan isi tabel mahasiswa beserta auth_uid.

## Deploy
Push ke GitHub, import di Vercel, salin isi .env.local ke Environment Variables Vercel.
```

## File: src/components/Carousel.jsx
```javascript
import { useEffect, useRef, useState } from 'react'
import { SizedIcon } from './icons.jsx'
import { Lightbox, SmartFit } from './ui.jsx'

export default function Carousel(props) {
  const slides = props.slides || []
  const autoMs = props.autoMs || 4000
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const [zoom, setZoom] = useState(null)
  const trackRef = useRef(null)
  const touchX = useRef(0)
  const moved = useRef(false)

  useEffect(function () {
    if (slides.length < 2 || paused) return undefined
    const t = setInterval(function () {
      setIdx(function (i) { return (i + 1) % slides.length })
    }, autoMs)
    return function () { clearInterval(t) }
  }, [slides.length, paused, autoMs])

  useEffect(function () {
    if (trackRef.current) trackRef.current.style.transform = 'translateX(-' + (idx * 100) + '%)'
  }, [idx])

  if (!slides.length) return null

  if (slides.length === 1) {
    const s = slides[0]
    return (
      <>
        <div className="relative group rounded-2xl overflow-hidden aspect-video bg-slate-900">
          <SmartFit src={s.src} full={s.full} type={s.type} alt={s.title || 'Media'} onClick={function () { setZoom(s) }} />
          <button type="button" title="Perbesar media" onClick={function () { setZoom(s) }}
            className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white transition-opacity hover:bg-black/70 opacity-100 xl:opacity-0 xl:group-hover:opacity-100">
            <SizedIcon name="expand" size={15} />
          </button>
        </div>
        {zoom ? <Lightbox src={zoom.full || zoom.src} type={zoom.type} title={zoom.title} youtubeId={zoom.yt || null} onClose={function () { setZoom(null) }} /> : null}
      </>
    )
  }

  return (
    <>
      <div
        className="media-carousel group"
        onMouseEnter={function () { setPaused(true) }}
        onMouseLeave={function () { setPaused(false) }}
        onTouchStart={function (e) { touchX.current = e.touches[0].clientX; moved.current = false }}
        onTouchEnd={function (e) {
          const dx = e.changedTouches[0].clientX - touchX.current
          if (Math.abs(dx) > 40) {
            moved.current = true
            setIdx(function (i) { return (i + (dx < 0 ? 1 : -1) + slides.length) % slides.length })
          }
        }}
      >
        <div ref={trackRef} className="carousel-track">
          {slides.map(function (s, i) {
            return (
              <div key={i} className="carousel-slide">
                <SmartFit
                  src={s.src}
                  full={s.full}
                   type={s.type}
                  alt={s.title || 'Media'}
                  onClick={function () {
                    if (moved.current) { moved.current = false; return }
                    setZoom(s)
                  }}
                />
                <button type="button" title="Perbesar media" onClick={function (e) { e.stopPropagation(); setZoom(s) }}
                  className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white transition-opacity hover:bg-black/70 opacity-100 xl:opacity-0 xl:group-hover:opacity-100">
                  <SizedIcon name="expand" size={15} />
                </button>
                {s.title ? (
                  <span className="absolute bottom-2 left-2 z-10 px-2 py-1 rounded-lg bg-black/60 text-white text-xs max-w-[85%] truncate">
                    {s.title}
                  </span>
                ) : null}
              </div>
            )
          })}
        </div>
        <button
          onClick={function () { setIdx(function (i) { return (i - 1 + slides.length) % slides.length }) }}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/40 text-white grid place-items-center opacity-100 xl:opacity-0 xl:group-hover:opacity-100 hover:bg-black/60"
        >
          &#8249;
        </button>
        <button
          onClick={function () { setIdx(function (i) { return (i + 1) % slides.length }) }}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/40 text-white grid place-items-center opacity-100 xl:opacity-0 xl:group-hover:opacity-100 hover:bg-black/60"
        >
          &#8250;
        </button>
        <div className="absolute bottom-2 right-2 z-10 flex gap-1.5">
          {slides.map(function (s, i) {
            return (
              <button
                key={i}
                onClick={function () { setIdx(i) }}
                className={'carousel-dot h-2 w-2 rounded-full transition-all ' + (i === idx ? 'bg-white' : 'bg-white/40')}
              />
            )
          })}
        </div>
      </div>
      {zoom ? <Lightbox src={zoom.full || zoom.src} type={zoom.type} title={zoom.title} youtubeId={zoom.yt || null} onClose={function () { setZoom(null) }} /> : null}
    </>
  )
}
```

## File: src/components/FilterBar.jsx
```javascript
import { ICONS } from './icons.jsx'
import { CustomSelect, CustomDateInput } from './controls.jsx'

export function FilterSelect(props) {
  return (
    <CustomSelect
      icon={props.icon}
      value={props.value}
      onChange={props.onChange}
      options={props.options}
      className="min-w-[190px]"
      buttonCls="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-bsi-500"
    />
  )
}

export function FilterDate(props) {
  return (
    <CustomDateInput
      mode={props.mode || 'date'}
      value={props.value}
      onChange={props.onChange}
      className="min-w-[170px]"
      buttonCls="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-bsi-500"
    />
  )
}

export function TimeFilter(props) {
  const f = props.filter
  const set = props.set
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="time-toggle">
        <button type="button" className={f.timeMode === 'bulan' ? 'active' : ''}
          onClick={function () { set(Object.assign({}, f, { timeMode: 'bulan', bulan: '', dari: '', sampai: '' })) }}>Bulan</button>
        <button type="button" className={f.timeMode === 'rentang' ? 'active' : ''}
          onClick={function () { set(Object.assign({}, f, { timeMode: 'rentang', bulan: '', dari: '', sampai: '' })) }}>Rentang Waktu</button>
      </div>
      {f.timeMode === 'bulan'
        ? <FilterDate mode="month" value={f.bulan} onChange={function (v) { set(Object.assign({}, f, { bulan: v })) }} />
        : <div className="flex flex-wrap items-center gap-2">
            <FilterDate value={f.dari} onChange={function (v) { set(Object.assign({}, f, { dari: v })) }} />
            <span className="text-slate-400 text-sm">sampai</span>
            <FilterDate value={f.sampai} onChange={function (v) { set(Object.assign({}, f, { sampai: v })) }} />
          </div>}
    </div>
  )
}

export function FilterBar(props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 lg:p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <button onClick={props.onToggle}
          className="xl:hidden flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 hover:bg-slate-100">
          <span className="text-bsi-700">{ICONS.funnel}</span>
          <span>Filter</span>
          {props.activeCount > 0 ? (
            <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-bsi-800 text-white text-xs font-bold">{props.activeCount}</span>
          ) : null}
          <span className={'transition-transform duration-200 text-slate-400 ' + (props.open ? 'rotate-180' : '')}>{ICONS.chevron}</span>
        </button>
        <div className="hidden xl:block text-sm text-slate-500">
          {props.activeCount > 0
            ? <span className="inline-flex items-center gap-2"><span className="text-bsi-700">{ICONS.funnel}</span><span><strong className="text-slate-900">{props.activeCount}</strong> filter aktif</span></span>
            : <span className="inline-flex items-center gap-2"><span className="text-slate-400">{ICONS.funnel}</span><span>Belum ada filter aktif</span></span>}
        </div>
      </div>
      <div className={props.open ? 'anim-page mt-4' : 'hidden xl:block xl:mt-4'}>
        <div className="flex flex-wrap items-center gap-3">
          {props.children}
          {props.activeCount > 0 ? (
            <button onClick={props.onReset}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100">
              {ICONS.close}<span>Reset</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function SortSelect(props) {
  return (
    <CustomSelect
      icon={ICONS.sort}
      value={props.value}
      onChange={props.onChange}
      options={[{ value: 'terbaru', label: 'Terbaru' }, { value: 'terlama', label: 'Terlama' }]}
      className="min-w-[150px]"
      buttonCls="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-bsi-500"
    />
  )
}
export function countActiveFilters(o) {
  let c = 0
  for (const k in o) {
    if (k === 'timeMode') continue
    if (o[k]) c++
  }
  return c
}
```

## File: src/components/Layout.jsx
```javascript
import { Outlet, Link, NavLink } from 'react-router-dom'
import { useTheme } from '../lib/theme.jsx'
import { useAuth, logoutMahasiswa } from '../lib/auth.js'
import { SizedIcon } from './icons.jsx'
import { useState } from 'react'

const LINKS = [
  { to: '/', label: 'Beranda' },
  { to: '/logbook', label: 'Logbook' },
  { to: '/galeri', label: 'Galeri' },
  { to: '/absen', label: 'Daftar Hadir' },
  { to: '/dospem', label: 'Dospem' },
  { to: '/tim', label: 'Tim' }
]

export default function Layout() {
  const theme = useTheme()
  const { mahasiswa } = useAuth()
  const [open, setOpen] = useState(false)

  const linkCls = function (active) {
    return 'px-3 py-2 rounded-xl text-sm font-semibold ' + (active ? 'bg-bsi-900 text-white' : 'text-slate-600 hover:bg-slate-100')
  }

  const themeBtn = function (extra) {
    return (
      <button onClick={theme.toggle} className={'rounded-xl border border-slate-300 grid place-items-center hover:bg-slate-100 text-slate-700 ' + (extra || 'h-10 w-10')} title="Ganti tema">
        <SizedIcon name={theme.dark ? 'sun' : 'moon'} size={18} />
      </button>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-bsi-800 to-gold-500 text-white grid place-items-center font-black">BSI</div>
              <div>
                <p className="font-bold leading-none text-slate-900">Logbook Magang</p>
                <p className="text-xs text-slate-500 mt-1">Bank Syariah Indonesia</p>
              </div>
            </Link>
            <nav className="hidden xl:flex items-center gap-1">
              {LINKS.map(function (l) {
                return <NavLink key={l.to} to={l.to} className={function (s) { return linkCls(s.isActive) }}>{l.label}</NavLink>
              })}
            </nav>
            <div className="hidden xl:flex items-center gap-3">
              {themeBtn()}
              {mahasiswa ? (
                <>
                  <Link to="/dashboard" className="px-4 py-2 rounded-xl bg-bsi-800 text-white text-sm font-semibold hover:bg-bsi-900">Dashboard</Link>
                  <Link to="/" onClick={function () { logoutMahasiswa() }} className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100">Keluar</Link>
                </>
              ) : (
                <Link to="/login" className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700">Masuk Intern</Link>
              )}
            </div>
            <div className="flex xl:hidden items-center gap-2">
              {themeBtn()}
              <button onClick={function () { setOpen(function (o) { return !o }) }} className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700">Menu</button>
            </div>
          </div>
        </div>
        {open ? (
          <div className="xl:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
            {LINKS.map(function (l) {
              return <Link key={l.to} to={l.to} onClick={function () { setOpen(false) }} className="block px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100">{l.label}</Link>
            })}
            {mahasiswa ? (
              <>
                <Link to="/dashboard" onClick={function () { setOpen(false) }} className="block px-4 py-3 rounded-xl bg-bsi-800 text-white text-sm font-semibold">Dashboard</Link>
                <Link to="/" onClick={function () { setOpen(false); logoutMahasiswa() }} className="block px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700">Keluar</Link>
              </>
            ) : (
              <Link to="/login" onClick={function () { setOpen(false) }} className="block px-4 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold">Masuk Intern</Link>
            )}
          </div>
        ) : null}
      </header>

      <main className="anim-page max-w-7xl mx-auto px-4 py-8 lg:py-10 flex-1 w-full">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Tim Magang BSI
        </div>
      </footer>
    </div>
  )
}
```

## File: src/lib/logbook.js
```javascript
import { supabase } from './supabase.js'

const EMPTY = '00000000-0000-0000-0000-000000000000'

export async function syncGaleriFromLogbook(mahasiswaId, items, meta) {
  const itemIds = items.map(function (i) { return i.id }).filter(Boolean)
  const all = await supabase
    .from('galeri')
    .select('id, logbook_item_id')
    .in('logbook_item_id', itemIds.length ? itemIds : [EMPTY])
  const existing = new Map((all.data || []).map(function (g) { return [g.logbook_item_id, g.id] }))

  for (const item of items) {
    if (!item.id) continue
    if (item.show_in_gallery && item.media_path) {
      if (existing.has(item.id)) {
        await supabase.from('galeri').update({
          media_path: item.media_path,
          media_type: item.media_type || 'foto',
          media_thumb: item.media_thumb || null
        }).eq('id', existing.get(item.id))
      } else {
        await supabase.from('galeri').insert({
          mahasiswa_id: mahasiswaId,
          logbook_item_id: item.id,
          judul: item.judul,
          deskripsi: item.deskripsi || 'Dokumentasi kegiatan dari logbook harian.',
          tanggal: meta.tanggal,
          kegiatan: meta.kategori,
          media_path: item.media_path,
          media_type: item.media_type || 'foto',
          media_thumb: item.media_thumb || null
        })
      }
    } else if (existing.has(item.id)) {
      await supabase.from('galeri').delete().eq('id', existing.get(item.id))
    }
  }
}
```

## File: src/lib/upload.js
```javascript
import { supabase } from './supabase.js'
import { iniVideo, ekstensiFile, siapkanFoto } from './konversi.js'

const MAKS_FOTO = 15 * 1024 * 1024
const MAKS_VIDEO = 50 * 1024 * 1024

async function getToken() {
  const { data } = await supabase.auth.getSession()
  return data.session ? data.session.access_token : ''
}

function namaDasar(nama) {
  return String(nama || 'media').replace(/\.[^.]+$/, '')
}

function kirimDenganProgres(uploadUrl, blob, contentType, onProgres) {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('Content-Type', contentType)
    if (onProgres) {
      xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) onProgres(e.loaded / e.total)
      }
    }
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error('Gagal upload file ke R2 (status ' + xhr.status + ')'))
    }
    xhr.onerror = function () { reject(new Error('Gagal jaringan saat upload ke R2')) }
    xhr.send(blob)
  })
}

async function mintaIzin(token, filename, contentType, kind) {
  const res = await fetch('/api/r2/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ filename: filename, contentType: contentType, kind: kind })
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error('Gagal membuat izin upload (status ' + res.status + '): ' + text)
  }
  return res.json()
}

export async function uploadMedia(file, kind, onInfo) {
  const video = iniVideo(file)
  if (video && file.size > MAKS_VIDEO) {
    throw new Error('Video melebihi 50 MB. Potong dulu durasinya supaya upload cepat dan kuota aman.')
  }
  if (!video && file.size > MAKS_FOTO) {
    throw new Error('Foto melebihi 15 MB. Pilih file dengan ukuran lebih kecil.')
  }
  let fullBlob = file
  let fullType = file.type
  let thumbBlob = null
  if (!video) {
    try {
      const hasil = await siapkanFoto(file, onInfo)
      fullBlob = hasil.fullBlob
      fullType = hasil.fullType
      thumbBlob = hasil.thumbBlob
    } catch (e) {
      throw new Error('Foto format .' + ekstensiFile(file) + ' tidak bisa diproses browser. Ubah dulu ke JPG atau PNG. Di iPhone: Settings, Camera, Formats, pilih Most Compatible.')
    }
  }
  if (onInfo) onInfo('')
  const token = await getToken()
  const extFull = fullType === 'image/webp' ? 'webp' : (fullType === 'image/jpeg' ? 'jpg' : ekstensiFile(file))
  const infoFull = await mintaIzin(token, namaDasar(file.name) + '.' + extFull, fullType, kind)
  await kirimDenganProgres(infoFull.uploadUrl, fullBlob, fullType, function (p) {
    if (onInfo) onInfo('Mengunggah ' + Math.round(p * 100) + '%')
  })
  let thumbUrl = null
  if (thumbBlob) {
    try {
      const namaThumb = namaDasar(infoFull.key.split('/').pop()) + '.webp'
      const infoThumb = await mintaIzin(token, namaThumb, 'image/webp', 'thumb/' + kind)
      await kirimDenganProgres(infoThumb.uploadUrl, thumbBlob, 'image/webp', null)
      thumbUrl = infoThumb.publicUrl
    } catch (e) {
      thumbUrl = null
    }
  }
  console.log('[UPLOAD] File penuh: ' + infoFull.key + ' | Thumbnail: ' + (thumbUrl || 'tidak dibuat'))
  return { path: infoFull.key, publicUrl: infoFull.publicUrl, thumbUrl: thumbUrl }
}

export async function deleteMedia(key) {
  const token = await getToken()
  const res = await fetch('/api/r2/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ key: key })
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error('Gagal hapus media di R2 (status ' + res.status + '): ' + text)
  }
  return res.json()
}
```

## File: src/pages/DospemPage.jsx
```javascript
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { EmptyState, Modal } from '../components/ui.jsx'
import { LogbookCard, LogbookDetail } from '../components/cards.jsx'
import { SkeletonLogbookCard, SkeletonPersonCard } from '../components/Skeleton.jsx'

export default function DospemPage() {
  const [logs, setLogs] = useState([])
  const [people, setPeople] = useState([])
  const [galCount, setGalCount] = useState(0)
  const [hadirCount, setHadirCount] = useState(0)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    async function load() {
      const l = await supabase
        .from('logbooks')
        .select('*, mahasiswa(nim, nama, prodi), logbook_items(*)')
        .eq('status', 'publik')
        .order('tanggal', { ascending: false })
        .order('urutan', { ascending: true, referencedTable: 'logbook_items' })
      const p = await supabase.from('mahasiswa').select('id, nama, nim, prodi').order('nama')
      const g = await supabase.from('galeri').select('id')
      const h = await supabase.from('daftar_hadir').select('id')
      setLogs(l.data || [])
      setPeople(p.data || [])
      setGalCount((g.data || []).length)
      setHadirCount((h.data || []).length)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <section className="card-hover rounded-[2rem] bg-bsi-900 text-white p-8 lg:p-12">
        <span className="inline-flex px-4 py-2 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wide">Monitoring Dospem dan Kaprodi</span>
        <h1 className="mt-6 text-3xl lg:text-5xl font-black max-w-3xl leading-tight">Ringkasan kegiatan magang tim di Bank BSI</h1>
        <p className="mt-4 max-w-3xl text-white/80 leading-relaxed">Halaman ini dapat diakses tanpa login.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading
            ? [0, 1, 2, 3].map(function (i) {
                return (
                  <div key={i} className="rounded-[1.5rem] bg-white/10 p-5">
                    <div className="skeleton skeleton-on-dark h-4 w-24"></div>
                    <div className="skeleton skeleton-on-dark h-9 w-14 mt-2"></div>
                  </div>
                )
              })
            : [
                <div key="mahasiswa" className="card-hover rounded-[1.5rem] bg-white/10 p-5"><p className="text-sm text-white/70">Total mahasiswa</p><p className="mt-1 text-3xl font-black">{people.length}</p></div>,
                <div key="logbook" className="card-hover rounded-[1.5rem] bg-white/10 p-5"><p className="text-sm text-white/70">Logbook publik</p><p className="mt-1 text-3xl font-black">{logs.length}</p></div>,
                <div key="galeri" className="card-hover rounded-[1.5rem] bg-white/10 p-5"><p className="text-sm text-white/70">Media galeri</p><p className="mt-1 text-3xl font-black">{galCount}</p></div>,
                <div key="hadir" className="card-hover rounded-[1.5rem] bg-white/10 p-5"><p className="text-sm text-white/70">Catatan hadir</p><p className="mt-1 text-3xl font-black">{hadirCount}</p></div>
              ]}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/logbook" className="px-5 py-3 rounded-2xl bg-gold-500 text-slate-900 text-sm font-bold hover:bg-gold-400">Lihat logbook</Link>
          <Link to="/galeri" className="px-5 py-3 rounded-2xl bg-white/10 text-white text-sm font-bold hover:bg-white/20">Lihat galeri</Link>
          <Link to="/absen" className="px-5 py-3 rounded-2xl bg-white/10 text-white text-sm font-bold hover:bg-white/20">Lihat daftar hadir</Link>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl lg:text-3xl font-black text-slate-900">Ringkasan logbook per mahasiswa</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? [0, 1, 2].map(function (i) { return <SkeletonPersonCard key={i} /> })
            : people.map(function (p) {
                const total = logs.filter(function (l) { return l.mahasiswa_id === p.id }).length
                return (
                  <div key={p.id} className="card-hover bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                    <p className="font-bold text-slate-900">{p.nama}</p>
                    <p className="text-xs text-slate-500">NIM {p.nim}</p>
                    {p.prodi ? <p className="text-xs text-slate-400">{p.prodi}</p> : null}
                    <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">Logbook publik</p>
                      <p className="mt-1 text-2xl font-black text-bsi-900">{total}</p>
                    </div>
                  </div>
                )
              })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl lg:text-3xl font-black text-slate-900">Aktivitas yang sudah dipublikasikan</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? [0, 1, 2].map(function (i) { return <SkeletonLogbookCard key={i} /> })
            : logs.map(function (l) {
                return <LogbookCard key={l.id} log={l} onDetail={function () { setDetail(l) }} />
              })}
          {!loading && !logs.length ? <EmptyState title="Belum ada logbook publik" desc="Logbook akan tampil setelah mahasiswa mengatur status siap dilihat." /> : null}
        </div>
      </section>

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <LogbookDetail log={detail} /> : null}
      </Modal>
    </div>
  )
}
```

## File: src/pages/HomePage.jsx
```javascript
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { StatCard, EmptyState, Modal } from '../components/ui.jsx'
import { LogbookCard, LogbookDetail } from '../components/cards.jsx'
import { SkeletonLogbookCard, SkeletonStatCard } from '../components/Skeleton.jsx'

export default function HomePage() {
  const { mahasiswa } = useAuth()
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({ logbook: 0, galeri: 0, mahasiswa: 0 })
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    async function load() {
      const l = await supabase
        .from('logbooks')
        .select('*, mahasiswa(nim, nama, prodi), logbook_items(*)')
        .eq('status', 'publik')
        .order('tanggal', { ascending: false })
        .order('urutan', { ascending: true, referencedTable: 'logbook_items' })
      const g = await supabase.from('galeri').select('id')
      const p = await supabase.from('mahasiswa').select('id')
      setLogs(l.data || [])
      setStats({ logbook: (l.data || []).length, galeri: (g.data || []).length, mahasiswa: (p.data || []).length })
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-stretch">
        <div className="card-hover relative overflow-hidden rounded-[2rem] bg-bsi-900 text-white p-8 lg:p-12">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-500/20 blur-2xl" />
          <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-emerald-300/10 blur-2xl" />
          <div className="relative z-10">
            <span className="inline-flex px-4 py-2 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wide">Magang Bank BSI</span>
            <h1 className="mt-6 text-3xl lg:text-5xl font-black leading-tight max-w-2xl">Logbook, Galeri, dan Daftar Hadir Magang dalam Satu Portal</h1>
            <p className="mt-5 max-w-2xl text-white/80 leading-relaxed">Portal ini mencatat kegiatan harian, dokumentasi media, dan kehadiran tim magang selama membantu operasional Bank BSI.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/logbook" className="px-6 py-3 rounded-2xl bg-gold-500 text-slate-900 font-bold hover:bg-gold-400">Lihat Logbook</Link>
              <Link to="/galeri" className="px-6 py-3 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20">Lihat Galeri</Link>
              <Link to="/absen" className="px-6 py-3 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20">Daftar Hadir</Link>
              {mahasiswa
                ? <Link to="/dashboard" className="px-6 py-3 rounded-2xl bg-white text-bsi-900 font-bold hover:bg-slate-100">Buka Dashboard</Link>
                : <Link to="/login" className="px-6 py-3 rounded-2xl bg-white text-bsi-900 font-bold hover:bg-slate-100">Masuk Intern</Link>}
            </div>
          </div>
        </div>
        <div className="grid gap-4">
          {loading
            ? [0, 1, 2].map(function (i) { return <SkeletonStatCard key={i} /> })
            : [
                <StatCard key="mahasiswa" label="Total mahasiswa magang" value={stats.mahasiswa} sub="Mahasiswa terdaftar dalam tim" />,
                <StatCard key="logbook" label="Total logbook publik" value={stats.logbook} sub="Catatan kegiatan harian" />,
                <StatCard key="galeri" label="Total media galeri" value={stats.galeri} sub="Foto dan video dokumentasi" />
              ]}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Kegiatan terbaru</p>
            <h2 className="mt-2 text-2xl lg:text-3xl font-black text-slate-900">Logbook terbaru tim</h2>
          </div>
          <Link to="/logbook" className="text-sm font-semibold text-bsi-800 hover:text-bsi-950">Lihat semua logbook</Link>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? [0, 1, 2].map(function (i) { return <SkeletonLogbookCard key={i} /> })
            : logs.slice(0, 3).map(function (l) {
                return <LogbookCard key={l.id} log={l} onDetail={function () { setDetail(l) }} />
              })}
          {!loading && !logs.length ? <EmptyState title="Belum ada logbook publik" desc="Logbook yang sudah diatur sebagai siap dilihat akan tampil di sini." /> : null}
        </div>
      </section>

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <LogbookDetail log={detail} /> : null}
      </Modal>
    </div>
  )
}
```

## File: src/pages/LogbookPage.jsx
```javascript
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { EmptyState, Modal } from '../components/ui.jsx'
import { LogbookCard, LogbookDetail } from '../components/cards.jsx'
import { FilterBar, FilterSelect, TimeFilter, countActiveFilters, SortSelect } from '../components/FilterBar.jsx'
import { ICONS } from '../components/icons.jsx'
import { matchesDateFilters, urutkanTanggal } from '../lib/format.js'
import { KATEGORI } from '../lib/constants.js'
import { SkeletonLogbookCard } from '../components/Skeleton.jsx'

const INITIAL = { mahasiswa: '', kategori: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }

export default function LogbookPage() {
  const { mahasiswa } = useAuth()
  const [all, setAll] = useState([])
  const [people, setPeople] = useState([])
  const [filter, setFilter] = useState(INITIAL)
  const [sort, setSort] = useState('terbaru')
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    async function load() {
      const l = await supabase
        .from('logbooks')
        .select('*, mahasiswa(nim, nama, prodi), logbook_items(*)')
        .eq('status', 'publik')
        .order('tanggal', { ascending: false })
        .order('urutan', { ascending: true, referencedTable: 'logbook_items' })
      const p = await supabase.from('mahasiswa').select('id, nama').order('nama')
      setAll(l.data || [])
      setPeople(p.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const logs = all.filter(function (l) {
    if (filter.mahasiswa && l.mahasiswa_id !== filter.mahasiswa) return false
    if (filter.kategori && l.kategori !== filter.kategori) return false
    return matchesDateFilters(l.tanggal, filter)
  })
  const active = countActiveFilters(filter)
  const sortedLogs = urutkanTanggal(logs, sort)

  return (
    <div>
      <section className="rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Logbook publik</p>
        <h1 className="mt-2 text-3xl lg:text-4xl font-black text-slate-900">Catatan kegiatan magang</h1>
        <p className="mt-3 text-slate-600 max-w-2xl">Satu logbook mewakili satu hari kerja dan bisa berisi beberapa kegiatan.</p>
      </section>

      <section className="mt-6">
        <FilterBar open={open} onToggle={function () { setOpen(function (o) { return !o }) }} activeCount={active}
          onReset={function () { setFilter(INITIAL) }}>
          <FilterSelect icon={ICONS.user} value={filter.mahasiswa} onChange={function (v) { setFilter(Object.assign({}, filter, { mahasiswa: v })) }}
            options={[{ value: '', label: 'Semua mahasiswa' }].concat(people.map(function (p) { return { value: p.id, label: p.nama } }))} />
          <FilterSelect icon={ICONS.tag} value={filter.kategori} onChange={function (v) { setFilter(Object.assign({}, filter, { kategori: v })) }}
            options={[{ value: '', label: 'Semua kategori' }].concat(KATEGORI.map(function (k) { return { value: k, label: k } }))} />
          <TimeFilter filter={filter} set={setFilter} />
          <SortSelect value={sort} onChange={setSort} />
        </FilterBar>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? [0, 1, 2, 3, 4, 5].map(function (i) { return <SkeletonLogbookCard key={i} /> })
          : sortedLogs.map(function (l) {
              return <LogbookCard key={l.id} log={l} isOwner={mahasiswa && mahasiswa.id === l.mahasiswa_id}
                onDetail={function () { setDetail(l) }} />
            })}
        {!loading && !logs.length ? <EmptyState title="Logbook tidak ditemukan" desc="Coba reset filter atau pilih filter lain." /> : null}
      </section>

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <LogbookDetail log={detail} /> : null}
      </Modal>
    </div>
  )
}
```

## File: src/pages/LoginPage.jsx
```javascript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginWithNim } from '../lib/auth.js'
import { inputCls, labelCls, btnPrimary } from '../components/ui.jsx'
import { EyeToggle } from '../components/icons.jsx'

export default function LoginPage() {
  const navigate = useNavigate()
  const [nim, setNim] = useState('')
  const [kode, setKode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [lihatKode, setLihatKode] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
  await loginWithNim(nim, kode)
  navigate('/dashboard')
} catch (err) {
  setError(err.message)
}
    setBusy(false)
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] items-start">
      <div className="card-hover rounded-[2rem] bg-bsi-900 text-white p-8 lg:p-10">
        <span className="inline-flex px-4 py-2 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wide">Area Intern</span>
        <h1 className="mt-6 text-3xl lg:text-4xl font-black leading-tight">Masuk untuk mengisi logbook, galeri, dan daftar hadir</h1>
        <p className="mt-4 text-white/80 leading-relaxed">Halaman ini hanya digunakan oleh mahasiswa magang. Dosen pembimbing dan kaprodi tidak perlu login untuk melihat halaman publik.</p>
      </div>
      <div className="card-hover bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 lg:p-10">
        <h2 className="text-2xl font-black text-slate-900">Login mahasiswa magang</h2>
        {error ? <p className="mt-3 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        <form onSubmit={submit} className="mt-6 space-y-5">
          <div>
            <label className={labelCls}>NIM <span className="text-red-500">*</span></label>
            <input className={inputCls} value={nim} onChange={function (e) { setNim(e.target.value) }} placeholder="Contoh: 20260001" required />
          </div>
          <div>
            <label className={labelCls}>Kode akses <span className="text-red-500">*</span></label>
            <div className="relative mt-1.5">
              <input
                type={lihatKode ? 'text' : 'password'}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-bsi-500"
                value={kode}
                onChange={function (e) { setKode(e.target.value) }}
                placeholder="Masukkan kode akses"
                required
              />
              <button
                type="button"
                onClick={function () { setLihatKode(function (v) { return !v }) }}
                title={lihatKode ? 'Sembunyikan kode akses' : 'Lihat kode akses'}
                className="absolute right-2 top-0 bottom-0 my-auto grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <EyeToggle open={lihatKode} size={18} />
              </button>
            </div>
          </div>
          <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Memproses...' : 'Masuk ke dashboard'}</button>
        </form>
      </div>
    </section>
  )
}
```

## File: src/pages/TimPage.jsx
```javascript
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { SkeletonPersonCard } from '../components/Skeleton.jsx'

export default function TimPage() {
  const [people, setPeople] = useState([])
  const [logs, setLogs] = useState([])
  const [galeri, setGaleri] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    async function load() {
      const p = await supabase.from('mahasiswa').select('id, nama, nim, prodi').order('nama')
      const l = await supabase.from('logbooks').select('id, mahasiswa_id').eq('status', 'publik')
      const g = await supabase.from('galeri').select('id, mahasiswa_id')
      setPeople(p.data || [])
      setLogs(l.data || [])
      setGaleri(g.data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <section className="card-hover rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Profil Mahasiswa</p>
        <h1 className="mt-2 text-3xl lg:text-4xl font-black text-slate-900">Mahasiswa magang Bank BSI</h1>
      </section>
      <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? [0, 1, 2, 3, 4, 5].map(function (i) { return <SkeletonPersonCard key={i} /> })
          : people.map(function (p) {
              const totalLog = logs.filter(function (l) { return l.mahasiswa_id === p.id }).length
              const totalGal = galeri.filter(function (g) { return g.mahasiswa_id === p.id }).length
              const initials = p.nama.split(' ').slice(0, 2).map(function (w) { return w.charAt(0) || '' }).join('').toUpperCase()
              return (
                <div key={p.id} className="card-hover bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-3xl bg-bsi-800 text-white grid place-items-center text-xl font-black">{initials}</div>
                    <div>
                      <p className="text-lg font-bold text-slate-900">{p.nama}</p>
                      <p className="text-sm text-slate-500">NIM {p.nim}</p>
                      {p.prodi ? <span className="mt-1 inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-bsi-100 text-bsi-900">{p.prodi}</span> : null}
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Logbook publik</p><p className="mt-1 text-2xl font-black text-bsi-900">{totalLog}</p></div>
                    <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Media galeri</p><p className="mt-1 text-2xl font-black text-bsi-900">{totalGal}</p></div>
                  </div>
                </div>
              )
            })}
      </section>
    </div>
  )
}
```

## File: src/pages/AttendancePage.jsx
```javascript
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { StatCard, EmptyState, Modal } from '../components/ui.jsx'
import { AttendanceCard, AttendanceDetail } from '../components/cards.jsx'
import { FilterBar, FilterSelect, TimeFilter, countActiveFilters, SortSelect } from '../components/FilterBar.jsx'
import { ICONS } from '../components/icons.jsx'
import { matchesDateFilters, urutkanTanggal } from '../lib/format.js'
import { SkeletonStatCard, SkeletonChartRow, SkeletonAttendanceCard } from '../components/Skeleton.jsx'

const INITIAL = { mahasiswa: '', status: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }

export default function AttendancePage() {
  const { mahasiswa } = useAuth()
  const [all, setAll] = useState([])
  const [people, setPeople] = useState([])
  const [filter, setFilter] = useState(INITIAL)
  const [sort, setSort] = useState('terbaru')
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    async function load() {
      const a = await supabase.from('daftar_hadir').select('*, mahasiswa(nim, nama, prodi)').order('tanggal', { ascending: false })
      const p = await supabase.from('mahasiswa').select('id, nama').order('nama')
      setAll(a.data || [])
      setPeople(p.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const rows = all.filter(function (r) {
    if (filter.mahasiswa && r.mahasiswa_id !== filter.mahasiswa) return false
    if (filter.status && r.status !== filter.status) return false
    return matchesDateFilters(r.tanggal, filter)
  })
  const active = countActiveFilters(filter)
  const sortedRows = urutkanTanggal(rows, sort)

  const counts = rows.reduce(function (acc, r) {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  const perPerson = people.map(function (p) {
    const mine = rows.filter(function (r) { return r.mahasiswa_id === p.id })
    const c = mine.reduce(function (acc, r) { acc[r.status] = (acc[r.status] || 0) + 1; return acc }, {})
    return { nama: p.nama, nim: p.nim, Masuk: c.Masuk || 0, Izin: c.Izin || 0, Bolos: c.Bolos || 0, total: mine.length }
  })
  const maxTotal = Math.max.apply(null, perPerson.map(function (p) { return p.total }).concat([1]))

  return (
    <div>
      <section className="rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Daftar hadir</p>
        <h1 className="mt-2 text-3xl lg:text-4xl font-black text-slate-900">Monitoring kehadiran tim magang</h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading
            ? [0, 1, 2, 3].map(function (i) { return <SkeletonStatCard key={i} /> })
            : [
                <StatCard key="total" label="Total catatan hadir" value={rows.length} sub="Sesuai filter aktif" />,
                <StatCard key="masuk" label="Masuk" value={counts.Masuk || 0} sub="Mahasiswa hadir" />,
                <StatCard key="izin" label="Izin" value={counts.Izin || 0} sub="Dengan keterangan" />,
                <StatCard key="bolos" label="Bolos" value={counts.Bolos || 0} sub="Tanpa keterangan" />
              ]}
        </div>
      </section>

      <section className="mt-6">
        <FilterBar open={open} onToggle={function () { setOpen(function (o) { return !o }) }} activeCount={active}
          onReset={function () { setFilter(INITIAL) }}>
          <FilterSelect icon={ICONS.user} value={filter.mahasiswa} onChange={function (v) { setFilter(Object.assign({}, filter, { mahasiswa: v })) }}
            options={[{ value: '', label: 'Semua mahasiswa' }].concat(people.map(function (p) { return { value: p.id, label: p.nama } }))} />
          <FilterSelect icon={ICONS.check} value={filter.status} onChange={function (v) { setFilter(Object.assign({}, filter, { status: v })) }}
            options={[{ value: '', label: 'Semua status' }, { value: 'Masuk', label: 'Masuk' }, { value: 'Izin', label: 'Izin' }, { value: 'Bolos', label: 'Bolos' }]} />
          <TimeFilter filter={filter} set={setFilter} />
          <SortSelect value={sort} onChange={setSort} />
        </FilterBar>
      </section>

      <section className="mt-8 card-hover rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-slate-900">Grafik kehadiran per mahasiswa</h2>
          <div className="flex flex-wrap gap-3 text-xs font-semibold">
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500" />Masuk</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-amber-500" />Izin</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500" />Bolos</span>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {loading
            ? [0, 1, 2].map(function (i) { return <SkeletonChartRow key={i} /> })
            : perPerson.map(function (p) {
                return (
                  <div key={p.nim} className="card-hover rounded-[1.5rem] border border-slate-200 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{p.nama}</p>
                        <p className="text-xs text-slate-500">NIM {p.nim}</p>
                      </div>
                      <div className="text-xs text-slate-500">Masuk: {p.Masuk} | Izin: {p.Izin} | Bolos: {p.Bolos}</div>
                    </div>
                    <div className="mt-4 flex h-4 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="bg-emerald-500 transition-all duration-500" style={{ width: (p.Masuk / maxTotal) * 100 + '%' }} />
                      <div className="bg-amber-500 transition-all duration-500" style={{ width: (p.Izin / maxTotal) * 100 + '%' }} />
                      <div className="bg-red-500 transition-all duration-500" style={{ width: (p.Bolos / maxTotal) * 100 + '%' }} />
                    </div>
                  </div>
                )
              })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl lg:text-3xl font-black text-slate-900">Daftar kehadiran sesuai filter</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? [0, 1, 2].map(function (i) { return <SkeletonAttendanceCard key={i} /> })
            : sortedRows.map(function (r) {
                return <AttendanceCard key={r.id} row={r} isOwner={mahasiswa && mahasiswa.id === r.mahasiswa_id}
                  onDetail={function () { setDetail(r) }} />
              })}
          {!loading && !rows.length ? <EmptyState icon="clipboard" title="Belum ada data kehadiran" desc="Data kehadiran akan tampil setelah mahasiswa mengisi daftar hadir." /> : null}
        </div>
      </section>

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <AttendanceDetail row={detail} /> : null}
      </Modal>
    </div>
  )
}
```

## File: src/components/icons.jsx
```javascript
function svg(inner, size) {
  const s = size || 16
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {inner}
    </svg>
  )
}

const paths = {
  funnel: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />,
  user: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  tag: (
    <>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </>
  ),
  close: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  check: (
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </>
  ),
  chevron: <polyline points="6 9 12 15 18 9" />,
  list: (
    <>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </>
  ),
  moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
  file: (
    <>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </>
  ),
  camera: (
    <>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </>
  ),
  clipboard: (
    <>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </>
  ),
  expand: (
    <>
      <path d="M15 3h6v6" />
      <path d="M9 21H3v-6" />
      <path d="M21 3l-7 7" />
      <path d="M3 21l7-7" />
    </>
  ),
  youtube: (
    <>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </>
  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </>
  ),
  sort: (
    <>
      <path d="M3 6h13" />
      <path d="M3 12h9" />
      <path d="M3 18h5" />
      <path d="M17 6v12" />
      <path d="m14 15 3 3 3-3" />
    </>
  )
}

export const ICONS = {
  funnel: svg(paths.funnel),
  user: svg(paths.user),
  tag: svg(paths.tag),
  calendar: svg(paths.calendar),
  image: svg(paths.image),
  close: svg(paths.close),
  check: svg(paths.check),
  chevron: svg(paths.chevron),
  list: svg(paths.list),
  link: svg(paths.link)
}

export function SizedIcon(props) {
  const inner = paths[props.name]
  if (!inner) return null
  return svg(inner, props.size || 16)
}

export function EyeToggle(props) {
  return (
    <svg
      width={props.size || 18}
      height={props.size || 18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={'eye-icon ' + (props.open ? 'terbuka' : '')}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" className="eye-pupil" />
      <line x1="2" y1="2" x2="22" y2="22" className="eye-slash" />
    </svg>
  )
}
```

## File: src/pages/GalleryPage.jsx
```javascript
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { EmptyState, Modal } from '../components/ui.jsx'
import { GalleryCard, GalleryDetail } from '../components/cards.jsx'
import { FilterBar, FilterSelect, TimeFilter, countActiveFilters, SortSelect } from '../components/FilterBar.jsx'
import { ICONS } from '../components/icons.jsx'
import { matchesDateFilters, urutkanTanggal } from '../lib/format.js'
import { GALERI_KEGIATAN } from '../lib/constants.js'
import { SkeletonGalleryCard } from '../components/Skeleton.jsx'

const INITIAL = { kegiatan: '', tipe: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }

export default function GalleryPage() {
  const { mahasiswa } = useAuth()
  const [all, setAll] = useState([])
  const [filter, setFilter] = useState(INITIAL)
  const [sort, setSort] = useState('terbaru')
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    async function load() {
      const g = await supabase.from('galeri').select('*, mahasiswa(nim, nama, prodi)').order('tanggal', { ascending: false })
      setAll(g.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const items = all.filter(function (i) {
    if (filter.kegiatan && (i.kegiatan || 'Lainnya') !== filter.kegiatan) return false
    if (filter.tipe && i.media_type !== filter.tipe) return false
    return matchesDateFilters(i.tanggal, filter)
  })
  const active = countActiveFilters(filter)
  const sortedItems = urutkanTanggal(items, sort)

  return (
    <div>
      <section className="rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Galeri dokumentasi</p>
        <h1 className="mt-2 text-3xl lg:text-4xl font-black text-slate-900">Foto dan video kegiatan magang</h1>
        <p className="mt-3 text-slate-600 max-w-2xl">Setiap kartu mewakili satu kegiatan. Klik media untuk melihat detail.</p>
      </section>

      <section className="mt-6">
        <FilterBar open={open} onToggle={function () { setOpen(function (o) { return !o }) }} activeCount={active}
          onReset={function () { setFilter(INITIAL) }}>
          <FilterSelect icon={ICONS.tag} value={filter.kegiatan} onChange={function (v) { setFilter(Object.assign({}, filter, { kegiatan: v })) }}
            options={[{ value: '', label: 'Semua kegiatan' }].concat(GALERI_KEGIATAN.map(function (k) { return { value: k, label: k } }))} />
          <FilterSelect icon={ICONS.image} value={filter.tipe} onChange={function (v) { setFilter(Object.assign({}, filter, { tipe: v })) }}
            options={[{ value: '', label: 'Semua media' }, { value: 'foto', label: 'Foto' }, { value: 'video', label: 'Video' }]} />
          <TimeFilter filter={filter} set={setFilter} />
          <SortSelect value={sort} onChange={setSort} />
        </FilterBar>
      </section>

      <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? [0, 1, 2, 3, 4, 5].map(function (i) { return <SkeletonGalleryCard key={i} /> })
          : sortedItems.map(function (i) {
              return <GalleryCard key={i.id} item={i} isOwner={mahasiswa && mahasiswa.id === i.mahasiswa_id}
                onDetail={function () { setDetail(i) }} />
            })}
        {!loading && !items.length ? <EmptyState icon="camera" title="Belum ada media galeri" desc="Media galeri yang diunggah mahasiswa akan tampil di sini." /> : null}
      </section>

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <GalleryDetail item={detail} /> : null}
      </Modal>
    </div>
  )
}
```

## File: src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ===== Animasi ===== */
@keyframes appFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes overlayFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes modalPop { from { opacity: 0; transform: scale(.95) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
@keyframes toastSlide { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes filterSlide { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 600px; } }
.anim-page { animation: appFadeUp .35s ease; }
.anim-toast { animation: toastSlide .35s ease; }
.anim-overlay { animation: overlayFade .25s ease; }
.anim-modal { animation: modalPop .3s cubic-bezier(.16,1,.3,1); }
.anim-filter { animation: filterSlide .3s ease; }

/* ===== Komponen umum ===== */
body { transition: background-color .3s ease, color .3s ease; }
button, a, input, select, textarea { transition: background-color .2s ease, color .2s ease, border-color .2s ease, transform .15s ease, box-shadow .2s ease, opacity .2s ease; }
button:active, a:active, .clickable:active { transform: scale(.97); }
.card-hover { transition: none; }
.card-hover:hover { transform: none; }

/* ===== Carousel ===== */
.media-carousel { position: relative; overflow: hidden; border-radius: 1rem; aspect-ratio: 16 / 9; background: #020617; }
.carousel-track { display: flex; height: 100%; transition: transform .5s ease; }
.carousel-slide { position: relative; flex: 0 0 100%; height: 100%; }
.carousel-slide img, .carousel-slide video { position: absolute; inset: 0; width: 100%; height: 100%; background: #020617; }
.media-carousel button:active { transform: translateY(-50%) scale(.97); }

/* ===== Filter ===== */
.filter-input-wrap { position: relative; display: inline-flex; align-items: center; }
.filter-input-wrap svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; z-index: 1; }
.filter-input-wrap select, .filter-input-wrap input { padding-left: 38px !important; }
.time-toggle { display: inline-flex; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; }
.time-toggle button { padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; background: transparent; color: #64748b; }
.time-toggle button.active { background: #16623c; color: #fff; }

/* ===== Dark mode ===== */
.dark body { background-color: #020617; color: #e2e8f0; }
.dark .bg-white { background-color: #0f172a !important; }
.dark .bg-slate-50 { background-color: #020617 !important; }
.dark .bg-slate-100 { background-color: #1e293b !important; }
.dark .bg-slate-900 { background-color: #f8fafc !important; color: #0f172a !important; }
.dark .bg-white\/90 { background-color: rgba(2,6,23,.9) !important; }
.dark .bg-white\/10 { background-color: rgba(255,255,255,.07) !important; }
.dark .bg-white\/5 { background-color: rgba(255,255,255,.04) !important; }
.dark .border-slate-100, .dark .border-slate-200, .dark .border-slate-300, .dark .border-white\/10 { border-color: #1e293b !important; }
.dark .text-slate-900, .dark .text-slate-800, .dark .text-slate-700 { color: #f8fafc !important; }
.dark .text-slate-600, .dark .text-slate-500, .dark .text-slate-400 { color: #94a3b8 !important; }
.dark .hover\:bg-slate-100:hover { background-color: #1e293b !important; color: #f8fafc !important; }
.dark .hover\:bg-slate-200:hover { background-color: #0f172a !important; color: #f8fafc !important; }
.dark input, .dark select, .dark textarea { background-color: #0f172a; color: #e2e8f0; border-color: #334155; }
.dark input::placeholder, .dark textarea::placeholder { color: #64748b; }
.dark .bg-emerald-50, .dark .bg-emerald-100 { background-color: rgba(16,185,129,.14) !important; }
.dark .text-emerald-800, .dark .text-emerald-900 { color: #6ee7b7 !important; }
.dark .bg-amber-50, .dark .bg-amber-100 { background-color: rgba(245,158,11,.14) !important; }
.dark .text-amber-800 { color: #fcd34d !important; }
.dark .bg-red-50, .dark .bg-red-100 { background-color: rgba(239,68,68,.14) !important; }
.dark .text-red-700 { color: #fca5a5 !important; }
.dark .bg-bsi-100 { background-color: rgba(39,192,109,.16) !important; }
.dark .text-bsi-900, .dark .text-bsi-800, .dark .text-bsi-700 { color: #6ee7b7 !important; }
.dark .bg-bsi-800, .dark .bg-bsi-900 { background-color: #065f46 !important; }
.dark .text-gold-600, .dark .text-gold-500 { color: #fbbf24 !important; }
.dark .bg-gold-500\/15 { background-color: rgba(245,158,11,.15) !important; }
.dark .bg-gold-500 { color: #0f172a !important; }
.dark .time-toggle { border-color: #334155; }
.dark .time-toggle button { color: #94a3b8; }
.dark .time-toggle button.active { background: #065f46; color: #fff; }

/* ===== Skeleton loader ===== */
@keyframes shimmer {
  100% { transform: translateX(100%); }
}
.skeleton {
  position: relative;
  overflow: hidden;
  background-color: #e2e8f0;
  border-radius: 0.75rem;
}
.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
  animation: shimmer 1.4s infinite;
}
.dark .skeleton { background-color: #1e293b; }
.dark .skeleton::after { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent); }
.skeleton-on-dark { background-color: rgba(255,255,255,0.15); }
.skeleton-on-dark::after { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent); }

/* ===== Textarea tanpa resize manual ===== */
textarea {
  resize: none;
  overflow-y: hidden;
}

/* ===== Scrollbar custom tipis bertema ===== */
* {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}
.dark * {
  scrollbar-color: #334155 transparent;
}
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background-color: #16623c;
}
.dark ::-webkit-scrollbar-thumb {
  background-color: #334155;
}
.dark ::-webkit-scrollbar-thumb:hover {
  background-color: #27c06d;
}

/* ===== Animasi icon mata ===== */
.eye-icon .eye-slash {
  stroke-dasharray: 29;
  stroke-dashoffset: 0;
  opacity: 1;
  transition: stroke-dashoffset .35s ease, opacity .3s ease;
}
.eye-icon.terbuka .eye-slash {
  stroke-dashoffset: 29;
  opacity: 0;
}
.eye-icon .eye-pupil {
  transform-origin: 12px 12px;
  transition: transform .35s ease, opacity .35s ease;
}
.eye-icon.terbuka .eye-pupil {
  transform: scale(1);
  opacity: 1;
}
.eye-icon:not(.terbuka) .eye-pupil {
  transform: scale(.7);
  opacity: .6;
}

.titik-anim {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-left: 6px;
}
.titik-anim i {
  width: 4px;
  height: 4px;
  border-radius: 9999px;
  background: currentColor;
  opacity: 0.2;
  animation: titik-halus 1.1s ease-in-out infinite;
}
.titik-anim i:nth-child(2) { animation-delay: 0.18s; }
.titik-anim i:nth-child(3) { animation-delay: 0.36s; }
@keyframes titik-halus {
  0%, 60%, 100% { opacity: 0.2; transform: translateY(0) scale(0.9); }
  30% { opacity: 1; transform: translateY(-1px) scale(1); }
}
```

## File: src/components/cards.jsx
```javascript
import Carousel from './Carousel.jsx'
import { StatusBadge, CategoryBadge, AttendanceBadge, btnSmall, ZoomableMedia, SmartFit , MediaYouTube } from './ui.jsx'
import { formatTanggal, formatTanggalShort } from '../lib/format.js'

function PersonChip(props) {
  const p = props.mahasiswa
  const nama = p ? p.nama : 'Mahasiswa'
  const nim = p ? p.nim : '-'
  const prodi = p && p.prodi ? p.prodi : ''
  const initials = nama.split(' ').slice(0, 2).map(function (w) { return w.charAt(0) || '' }).join('').toUpperCase()
  return (
    <div className="flex items-center gap-3">
      <div className={'rounded-2xl bg-bsi-800 text-white grid place-items-center font-bold ' + (props.size === 'sm' ? 'h-9 w-9 text-xs' : 'h-11 w-11')}>
        {initials}
      </div>
      <div>
        <p className={'font-semibold text-slate-900 ' + (props.size === 'sm' ? 'text-sm' : '')}>{nama}</p>
        <p className="text-xs text-slate-500">NIM {nim}</p>
        {prodi ? <p className="text-xs text-slate-400">{prodi}</p> : null}
      </div>
    </div>
  )
}

function ActionButtons(props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={props.onDetail} className={btnSmall + ' bg-bsi-100 text-bsi-900 hover:bg-bsi-200'}>Detail</button>
      {props.isOwner && props.onEdit ? (
        <>
          <button onClick={props.onEdit} className={btnSmall + ' bg-slate-900 text-white hover:bg-slate-700'}>Edit</button>
          <button onClick={props.onDelete} className={btnSmall + ' bg-red-50 text-red-700 hover:bg-red-100'}>Hapus</button>
        </>
      ) : null}
    </div>
  )
}

export function slidesFromItems(items) {
  return (items || []).filter(function (i) { return i.media_path }).map(function (i) {
    return { src: i.media_thumb || i.media_path, full: i.media_path, type: i.media_source === 'youtube' ? 'foto' : i.media_type, title: i.judul, yt: i.youtube_id || null }
  })
}

export function LogbookCard(props) {
  const log = props.log
  const items = log.logbook_items || []
  const slides = slidesFromItems(items)
  const preview = items.slice(0, 2)
  return (
    <article className="card-hover bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
      {slides.length ? <Carousel slides={slides} /> : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <CategoryBadge value={log.kategori} />
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{log.unit || 'Unit belum diisi'}</span>
        </div>
        <StatusBadge status={log.status} />
      </div>
      <div>
        <p className="text-sm text-slate-500">{formatTanggal(log.tanggal)}</p>
        <h3 className="mt-2 text-xl font-bold text-slate-900">{log.judul}</h3>
        <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-bsi-800">Terdapat {items.length} kegiatan</p>
        <div className="mt-2 space-y-1">
          {preview.map(function (it, i) {
            return <p key={it.id} className="text-xs text-slate-500 truncate">{i + 1}. {it.judul}</p>
          })}
          {items.length > 2 ? <p className="text-xs text-bsi-700 font-semibold">+{items.length - 2} kegiatan lainnya</p> : null}
        </div>
      </div>
      <div className="mt-auto border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-4">
        <PersonChip mahasiswa={log.mahasiswa} />
        <ActionButtons isOwner={props.isOwner} onDetail={props.onDetail} onEdit={props.onEdit} onDelete={props.onDelete} />
      </div>
    </article>
  )
}

export function LogbookDetail(props) {
  const log = props.log
  const items = log.logbook_items || []
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <CategoryBadge value={log.kategori} />
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{log.unit || 'Unit belum diisi'}</span>
        <StatusBadge status={log.status} />
      </div>
      <div>
        <p className="text-sm text-slate-500">{formatTanggal(log.tanggal)}</p>
        <h2 className="mt-1 text-2xl font-black text-slate-900">{log.judul}</h2>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Rincian kegiatan</p>
        <div className="mt-4">
          {items.map(function (it, i) {
            return (
              <div key={it.id} className={'relative pl-12 ' + (i < items.length - 1 ? 'pb-6' : 'pb-0')}>
                <span className="absolute left-0 top-0 h-9 w-9 rounded-full bg-bsi-800 text-white grid place-items-center text-sm font-bold">{i + 1}</span>
                {i < items.length - 1 ? <span className="absolute left-4 top-9 bottom-0 w-px bg-slate-200 dark:bg-slate-700" /> : null}
                 <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                   {it.media_path ? (
                     it.media_source === 'youtube' ? (
                       <iframe src={'https://www.youtube-nocookie.com/embed/' + it.youtube_id + '?rel=0&modestbranding=1'} title={it.judul} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="rounded-2xl overflow-hidden aspect-video w-full bg-slate-900 mb-3" />
                     ) : (
                       <ZoomableMedia src={it.media_thumb || it.media_path} full={it.media_path} type={it.media_type} title={it.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900 mb-3" />
                     )
                   ) : null}
                  <p className="font-bold text-slate-900">
                    {it.judul}
                    {it.show_in_gallery && it.media_path ? <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold-500/15 text-gold-600">Di galeri</span> : null}
                  </p>
                  {it.deskripsi ? <p className="mt-1 text-sm text-slate-600">{it.deskripsi}</p> : null}
                  {it.hasil ? <p className="mt-2 inline-flex px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">Hasil: {it.hasil}</p> : null}
                </div>
              </div>
            )
          })}
          {!items.length ? <p className="text-sm text-slate-500">Belum ada rincian kegiatan.</p> : null}
        </div>
      </div>
      {log.kendala || log.solusi || log.pembelajaran ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Refleksi harian</p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {log.kendala ? <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase text-slate-400">Kendala</p><p className="mt-1 text-sm text-slate-700">{log.kendala}</p></div> : null}
            {log.solusi ? <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase text-slate-400">Solusi</p><p className="mt-1 text-sm text-slate-700">{log.solusi}</p></div> : null}
            {log.pembelajaran ? <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase text-slate-400">Pembelajaran</p><p className="mt-1 text-sm text-slate-700">{log.pembelajaran}</p></div> : null}
          </div>
        </div>
      ) : null}
      <div className="border-t border-slate-100 pt-4"><PersonChip mahasiswa={log.mahasiswa} /></div>
    </div>
  )
}

export function GalleryCard(props) {
  const item = props.item
  return (
    <article onClick={props.onDetail} className="clickable cursor-pointer bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        {item.media_source === 'youtube' ? (
        <MediaYouTube src={item.media_path} alt={item.judul} />
      ) : (
        <SmartFit src={item.media_thumb || item.media_path} full={item.media_path} type={item.media_type} alt={item.judul} />
      )}
      </div>
      <div className="p-5 space-y-3 flex-1 flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <CategoryBadge value={item.kegiatan} />
            {item.logbook_item_id ? <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold-500/15 text-gold-600">Dari logbook</span> : null}
          </div>
          <span className="text-xs text-slate-500">{formatTanggalShort(item.tanggal)}</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900">{item.judul}</h3>
        <p className="text-sm text-slate-600 line-clamp-2">{item.deskripsi || 'Tidak ada deskripsi.'}</p>
        <div className="mt-auto pt-3 border-t border-slate-100 space-y-3">
          <PersonChip size="sm" mahasiswa={item.mahasiswa} />
          {props.onEdit ? (
            <div className="flex flex-wrap gap-2" onClick={function (e) { e.stopPropagation() }}>
              <button onClick={props.onEdit} className={btnSmall + ' bg-slate-900 text-white hover:bg-slate-700'}>Edit</button>
              <button onClick={props.onDelete} className={btnSmall + ' bg-red-50 text-red-700 hover:bg-red-100'}>Hapus</button>
            </div>
          ) : props.isOwner ? null : (
            <span className="text-xs font-semibold text-bsi-800">Klik kartu untuk melihat detail</span>
          )}
        </div>
      </div>
    </article>
  )
}

export function GalleryDetail(props) {
  const item = props.item
  return (
    <div className="space-y-4">
      {item.media_source === 'youtube' ? (
        <iframe src={'https://www.youtube-nocookie.com/embed/' + item.youtube_id + '?rel=0&modestbranding=1'} title={item.judul} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="rounded-2xl overflow-hidden aspect-video w-full bg-slate-900" />
      ) : (
        <ZoomableMedia src={item.media_thumb || item.media_path} full={item.media_path} type={item.media_type} title={item.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900" />
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <CategoryBadge value={item.kegiatan} />
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{item.media_type === 'video' ? 'Video' : 'Foto'}</span>
        </div>
        <span className="text-sm text-slate-500">{formatTanggal(item.tanggal)}</span>
      </div>
      <div>
        <h2 className="text-2xl font-black text-slate-900">{item.judul}</h2>
        <p className="mt-3 text-slate-600 leading-relaxed">{item.deskripsi || 'Tidak ada deskripsi.'}</p>
      </div>
      <div className="border-t border-slate-100 pt-4"><PersonChip mahasiswa={item.mahasiswa} /></div>
    </div>
  )
}

export function AttendanceCard(props) {
  const row = props.row
  return (
    <div className="card-hover bg-white rounded-3xl border border-slate-200 shadow-sm p-5 flex flex-col h-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{formatTanggal(row.tanggal)}</p>
          <p className="mt-1 font-bold text-slate-900">{row.mahasiswa ? row.mahasiswa.nama : 'Mahasiswa'}</p>
          <p className="text-xs text-slate-500">NIM {row.mahasiswa ? row.mahasiswa.nim : '-'}</p>
        </div>
        <AttendanceBadge status={row.status} />
      </div>
      <div className="mt-4 rounded-2xl bg-slate-50 p-4 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Alasan atau keterangan</p>
        <p className="mt-1 text-sm text-slate-700">{row.alasan || 'Tidak ada alasan.'}</p>
      </div>
      <div className="mt-4">
        <ActionButtons isOwner={props.isOwner} onDetail={props.onDetail} onEdit={props.onEdit} onDelete={props.onDelete} />
      </div>
    </div>
  )
}

export function AttendanceDetail(props) {
  const row = props.row
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{formatTanggal(row.tanggal)}</p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">Detail daftar hadir</h2>
        </div>
        <AttendanceBadge status={row.status} />
      </div>
      <div className="rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Alasan atau keterangan</p>
        <p className="mt-1 text-sm text-slate-700">{row.alasan || 'Tidak ada alasan.'}</p>
      </div>
      <div className="border-t border-slate-100 pt-4"><PersonChip mahasiswa={row.mahasiswa} /></div>
    </div>
  )
}
```

## File: src/components/ui.jsx
```javascript
import { useEffect, useRef, useState } from 'react'
import { SizedIcon } from './icons.jsx'
function useBodyScrollLock(active) {
  useEffect(function () {
    if (!active) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return function () {
      document.body.style.overflow = previous
    }
  }, [active])
}


export const inputCls = 'mt-1.5 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-bsi-500'
export const labelCls = 'text-sm font-semibold text-slate-700'
export const btnPrimary = 'w-full rounded-2xl bg-bsi-800 px-6 py-4 text-white font-bold hover:bg-bsi-900'
export const btnSmall = 'px-4 py-2 rounded-xl text-sm font-semibold'
export const cardCls = 'card-hover bg-white rounded-3xl border border-slate-200 shadow-sm'

export function StatCard(props) {
  return (
    <div className={cardCls + ' p-6'}>
      <p className="text-sm text-slate-500">{props.label}</p>
      <p className="mt-2 text-3xl font-black text-bsi-900">{props.value}</p>
      {props.sub ? <p className="mt-1 text-xs text-slate-500">{props.sub}</p> : null}
    </div>
  )
}

export function EmptyState(props) {
  return (
    <div className={cardCls + ' border-dashed p-10 text-center'}>
      <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-100 grid place-items-center text-slate-400">
        <SizedIcon name={props.icon || 'file'} size={24} />
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-800">{props.title}</h3>
      <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">{props.desc}</p>
    </div>
  )
}

export function StatusBadge(props) {
  const publik = props.status === 'publik'
  return (
    <span className={'px-3 py-1 rounded-full text-xs font-semibold ' + (publik ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')}>
      {publik ? 'Siap dilihat' : 'Draft'}
    </span>
  )
}

export function CategoryBadge(props) {
  return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-bsi-100 text-bsi-900">{props.value || 'Lainnya'}</span>
}

export function AttendanceBadge(props) {
  const map = {
    Masuk: 'bg-emerald-100 text-emerald-800',
    Izin: 'bg-amber-100 text-amber-800',
    Bolos: 'bg-red-100 text-red-700'
  }
  return <span className={'px-3 py-1 rounded-full text-xs font-semibold ' + (map[props.status] || 'bg-slate-100 text-slate-700')}>{props.status}</span>
}

export function Modal(props) {
  useBodyScrollLock(props.open)
  if (!props.open) return null
  return (
    <div className="anim-overlay fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-slate-900/60 p-4" onClick={props.onClose}>
      <div className="min-h-full flex items-center justify-center py-8">
        <div className="anim-modal w-full max-w-3xl rounded-[2rem] bg-white shadow-2xl" onClick={function (e) { e.stopPropagation() }}>
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <p className="font-bold text-slate-900">{props.title || 'Detail'}</p>
            <button onClick={props.onClose} className="h-9 w-9 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 grid place-items-center">
              <SizedIcon name="close" size={16} />
            </button>
          </div>
          <div className="p-6">{props.children}</div>
        </div>
      </div>
    </div>
  )
}

export function AutoTextArea(props) {
  const ref = useRef(null)

  useEffect(function () {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [props.value])

  return (
    <textarea
      ref={ref}
      className={props.className}
      rows={props.rows || 2}
      value={props.value}
      placeholder={props.placeholder}
      onChange={props.onChange}
      disabled={props.disabled || false}
    />
  )
}

export function ConfirmModal(props) {
  useBodyScrollLock(props.open)
  if (!props.open) return null
  return (
    <div className="anim-overlay fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-slate-900/60 p-4" onClick={props.onCancel}>
      <div className="min-h-full flex items-center justify-center py-8">
        <div className="anim-modal w-full max-w-md rounded-[2rem] bg-white shadow-2xl" onClick={function (e) { e.stopPropagation() }}>
          <div className="p-6 space-y-4">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-red-100 text-red-600 grid place-items-center">
              <SizedIcon name="trash" size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-slate-900">{props.title || 'Hapus data ini?'}</h3>
              <p className="mt-2 text-sm text-slate-500">{props.message}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={props.onCancel}
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                Batal
              </button>
              <button type="button" onClick={props.onConfirm}
                className="rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white hover:bg-red-600">
                {props.confirmLabel || 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


export function Lightbox(props) {
  useBodyScrollLock(true)
  const [busyUnduh, setBusyUnduh] = useState(false)
  useEffect(function () {
    function onKey(e) {
      if (e.key === 'Escape') props.onClose()
    }
    document.addEventListener('keydown', onKey)
    return function () { document.removeEventListener('keydown', onKey) }
  }, [])
  async function unduh() {
    if (busyUnduh) return
    setBusyUnduh(true)
    let nama = 'media'
      try {
        const urlAsli = new URL(props.src)
        const ekstensi = urlAsli.pathname.split('.').pop().split('?')[0] || 'jpg'
        if (props.title && props.title.trim()) {
          const judulAman = props.title.trim().replace(/[\/\\:*?"<>|]/g, '').replace(/\s+/g, '-').substring(0, 60)
          nama = judulAman + '.' + ekstensi
        } else {
          nama = urlAsli.pathname.split('/').pop() || ('media.' + ekstensi)
        }
      } catch (e) {
        nama = (props.title || 'media') + '.jpg'
      }
    try {
      const urlUnduh = props.src + (props.src.includes('?') ? '&' : '?') + 'unduh=1'
      const res = await fetch(urlUnduh, { cache: 'no-store' })
      if (!res.ok) throw new Error('status ' + res.status)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = nama
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(function () { URL.revokeObjectURL(url) }, 2000)
    } catch (err) {
      window.open(props.src, '_blank')
    }
    setBusyUnduh(false)
  }
  return (
    <div className="anim-overlay fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/95 p-4" onClick={props.onClose}>
      <div className="relative w-full max-w-5xl" onClick={function (e) { e.stopPropagation() }}>
        {props.youtubeId ? (
          <iframe src={'https://www.youtube-nocookie.com/embed/' + props.youtubeId + '?rel=0&modestbranding=1'} title={props.title || 'Video'} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="mx-auto aspect-video w-full rounded-2xl bg-slate-900" />
        ) : props.type === 'video' ? (
          <video src={props.src} controls autoPlay className="mx-auto max-h-[85vh] w-full rounded-2xl bg-slate-900 object-contain" />
        ) : (
          <img
            src={props.src}
            alt={props.title || 'Media'}
            onClick={props.onClose}
            className="mx-auto max-h-[85vh] w-auto max-w-full cursor-zoom-out rounded-2xl object-contain"
          />
        )}
        {props.title ? <p className="mt-3 truncate text-center text-sm text-slate-300">{props.title}</p> : null}
      </div>
      <div className="absolute right-4 top-4 flex gap-2">
        <button
          type="button"
          title={busyUnduh ? 'Menyiapkan unduhan...' : 'Unduh media'}
          onClick={unduh}
          disabled={busyUnduh}
          style={props.youtubeId ? { display: 'none' } : undefined}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
        >
          <SizedIcon name="download" size={18} />
        </button>
        <button
          type="button"
          title="Tutup (Esc)"
          onClick={props.onClose}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <SizedIcon name="close" size={18} />
        </button>
      </div>
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-400">Klik media atau tekan Esc untuk menutup</p>
    </div>
  )
}

export function ZoomableMedia(props) {
  const [open, setOpen] = useState(false)
  const isVideo = props.type === 'video'
  return (
    <div className={'relative group ' + (props.className || '')}>
      <SmartFit
        src={props.src}
        type={props.type}
        alt={props.title || 'Media'}
        full={props.full || props.src}
         controls={isVideo}
        onClick={isVideo ? null : function (e) { e.stopPropagation(); setOpen(true) }}
      />
      <button
        type="button"
        title="Perbesar media"
        onClick={function (e) { e.stopPropagation(); setOpen(true) }}
        className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white transition-opacity hover:bg-black/70 opacity-100 xl:opacity-0 xl:group-hover:opacity-100"
      >
        <SizedIcon name="expand" size={15} />
      </button>
      {open ? <Lightbox src={props.full || props.src} type={props.type} title={props.title} onClose={function () { setOpen(false) }} /> : null}
    </div>
  )
}


export function SmartFit(props) {
  const [ratio, setRatio] = useState(null)
  const [near, setNear] = useState(false)
  const mediaRef = useRef(null)
  const isVideo = props.type === 'video'
  if (!isVideo && String(props.src || '').indexOf('i.ytimg.com') !== -1) {
    return <MediaYouTube src={props.src} alt={props.alt} onClick={props.onClick} className="absolute inset-0 h-full w-full object-cover" />
  }
  useEffect(function () {
    const el = mediaRef.current
    if (!el) return undefined
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true)
      return undefined
    }
    const io = new IntersectionObserver(function (entries) {
      for (let i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          setNear(true)
          io.disconnect()
          break
        }
      }
    }, { rootMargin: '400px' })
    io.observe(el)
    return function () { io.disconnect() }
  }, [])
  function bacaUkuran(e) {
    const el = e.target
    const w = isVideo ? el.videoWidth : el.naturalWidth
    const h = isVideo ? el.videoHeight : el.naturalHeight
    if (w && h) setRatio(w / h)
  }
  function cadangkan(e) {
    const el = e.currentTarget
    const cad = props.full && props.full !== props.src ? props.full : props.src
    if (cad && el.src !== cad) el.src = cad
  }
  const cover = ratio !== null && ratio > 1
  const potret = ratio !== null && ratio <= 1
  return (
    <>
      {potret && !isVideo ? (
        <img src={props.src} alt="" aria-hidden="true" loading="lazy" decoding="async" onError={cadangkan} className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-xl" />
      ) : null}
      {isVideo ? (
        <video
          ref={mediaRef}
          src={near ? props.src : undefined}
          muted={props.controls ? false : true}
          preload="metadata"
          controls={props.controls || false}
          onLoadedMetadata={bacaUkuran}
          className={'absolute inset-0 h-full w-full ' + (cover ? 'object-cover' : 'object-contain')}
        />
      ) : (
        <img
          ref={mediaRef}
          src={near ? props.src : undefined}
          alt={props.alt || 'Media'}
          loading="lazy"
          decoding="async"
          onLoad={bacaUkuran}
          onError={cadangkan}
          onClick={props.onClick || undefined}
          className={'absolute inset-0 h-full w-full ' + (cover ? 'object-cover' : 'object-contain') + (props.onClick ? ' cursor-zoom-in' : '')}
        />
      )}
    </>
  )
}

export function MediaYouTube(props) {
  const [status, setStatus] = useState('muat')
  const [coba, setCoba] = useState(0)
  useEffect(function () {
    if (status !== 'tunggu') return undefined
    const t = setTimeout(function () {
      setCoba(function (c) { return c + 1 })
      setStatus('muat')
    }, 15000)
    return function () { clearTimeout(t) }
  }, [status])
  if (status === 'tunggu' || status === 'habis') {
    return (
      <div className={'grid place-items-center bg-slate-800 ' + (props.className || 'absolute inset-0 h-full w-full')}>
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <SizedIcon name="video" size={26} />
          <p className="px-2 text-center text-[11px] font-semibold">{status === 'habis' ? 'Pratinjau video belum siap' : 'Menyiapkan pratinjau video'}</p>
        </div>
      </div>
    )
  }
  return (
    <img
      src={props.src + (coba > 0 ? (String(props.src).indexOf('?') === -1 ? '?' : '&') + 'r=' + coba : '')}
      alt={props.alt || 'Pratinjau video'}
      onClick={props.onClick || undefined}
      onError={function () { setStatus(coba >= 3 ? 'habis' : 'tunggu') }}
      onLoad={function () { setStatus('muat') }}
      className={props.className || 'absolute inset-0 h-full w-full object-cover'}
    />
  )
}

export function TitikAnim() {
  return (
    <span className="titik-anim" aria-hidden="true">
      <i></i>
      <i></i>
      <i></i>
    </span>
  )
}
export function LabelProses(props) {
  const bersih = String(props.teks || '').replace(/\.{3}/g, '').replace(/\s+/g, ' ').trim()
  return (
    <span className="inline-flex items-center justify-center">
      <span>{bersih}</span>
      <TitikAnim />
    </span>
  )
}
```

## File: src/pages/DashboardPage.jsx
```javascript
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { uploadMedia, deleteMedia } from '../lib/upload.js'
import { syncGaleriFromLogbook } from '../lib/logbook.js'
import { parseYouTubeId, ytThumb, fetchYouTubeQuota, unggahVideoYouTube } from '../lib/youtube.js'
import { supabase as sbClient } from '../lib/supabase.js'
import { pratinjauHeic, formatHeic } from '../lib/konversi.js'
import { LabelProses } from '../components/ui.jsx'
import { todayInput, detectMediaType, matchesDateFilters, urutkanTanggal } from '../lib/format.js'
import { KATEGORI, UNIT, GALERI_KEGIATAN } from '../lib/constants.js'
import { EmptyState, Modal, ConfirmModal, inputCls, labelCls, btnPrimary, btnSmall, AutoTextArea } from '../components/ui.jsx'
import { LogbookCard, LogbookDetail, GalleryCard, GalleryDetail, AttendanceCard, AttendanceDetail } from '../components/cards.jsx'
import { CustomSelect, CustomDateInput, FileInput } from '../components/controls.jsx'
import { SizedIcon, ICONS } from '../components/icons.jsx'
import { FilterBar, FilterSelect, TimeFilter, countActiveFilters, SortSelect } from '../components/FilterBar.jsx'

function newItem() {
  return { key: Math.random().toString(36).slice(2), judul: '', deskripsi: '', hasil: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false, show: false, mode: 'foto', ytLink: '', oldYtId: null, oldSource: 'r2' }
}

const LOG_INITIAL = { kategori: '', status: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }
const GAL_INITIAL = { kegiatan: '', tipe: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }
const HADIR_INITIAL = { status: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }

function ModeIndicator(props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ' + (props.edit ? 'bg-gold-500/15 text-gold-600' : 'bg-bsi-100 text-bsi-900')}>
        <span className={'h-2 w-2 rounded-full ' + (props.edit ? 'bg-gold-500' : 'bg-bsi-500')}></span>
        {props.edit ? 'Mode Edit' : 'Mode Tambah'}
      </span>
      {props.edit ? (
        <button type="button" onClick={props.onCancel}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100">
          <SizedIcon name="close" size={12} />
          Batal Edit
        </button>
      ) : null}
    </div>
  )
}

export default function DashboardPage() {
  const { mahasiswa, loading } = useAuth()
  const [tab, setTab] = useState('logbook')
  const [logs, setLogs] = useState([])
  const [galeri, setGaleri] = useState([])
  const [hadir, setHadir] = useState([])
  const [detail, setDetail] = useState(null)

  const [form, setForm] = useState({ tanggal: todayInput(), unit: '', kategori: '', judul: '', kendala: '', solusi: '', pembelajaran: '', status: 'draft' })
  const [items, setItems] = useState([newItem()])
  const [editLogId, setEditLogId] = useState(null)

  const [galForm, setGalForm] = useState({ judul: '', deskripsi: '', tanggal: todayInput(), kegiatan: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false })
  const [editGalId, setEditGalId] = useState(null)

  const [hadirForm, setHadirForm] = useState({ tanggal: todayInput(), status: 'Masuk', alasan: '' })
  const [editHadirId, setEditHadirId] = useState(null)

  const [busy, setBusy] = useState(false)
  const [infoProses, setInfoProses] = useState('')
  const [ytQuota, setYtQuota] = useState({ limit: 6, used: 0, remaining: 6 })
  const [galMode, setGalMode] = useState('foto')
  const [galYtLink, setGalYtLink] = useState('')
  const [galOldYt, setGalOldYt] = useState(null)
  const [itemMode, setItemMode] = useState({})
  const [galYtTitle, setGalYtTitle] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)

  const [logFilter, setLogFilter] = useState(LOG_INITIAL)
  const [logFilterOpen, setLogFilterOpen] = useState(false)
  const [galFilter, setGalFilter] = useState(GAL_INITIAL)
  const [galFilterOpen, setGalFilterOpen] = useState(false)
  const [hadirFilter, setHadirFilter] = useState(HADIR_INITIAL)
  const [hadirFilterOpen, setHadirFilterOpen] = useState(false)
  const [sort, setSort] = useState('terbaru')

  async function refresh() {
    if (!mahasiswa) return
    const l = await supabase.from('logbooks').select('*, mahasiswa(nim, nama, prodi), logbook_items(*)')
      .eq('mahasiswa_id', mahasiswa.id).order('tanggal', { ascending: false })
      .order('urutan', { ascending: true, referencedTable: 'logbook_items' })
    const g = await supabase.from('galeri').select('*, mahasiswa(nim, nama, prodi)').eq('mahasiswa_id', mahasiswa.id).order('tanggal', { ascending: false })
    const h = await supabase.from('daftar_hadir').select('*, mahasiswa(nim, nama, prodi)').eq('mahasiswa_id', mahasiswa.id).order('tanggal', { ascending: false })
    setLogs(l.data || [])
    setGaleri(g.data || [])
    setHadir(h.data || [])
  }

  useEffect(function () {
    if (mahasiswa) refresh()
    fetchYouTubeQuota().then(setYtQuota)
    const iv = setInterval(function () { fetchYouTubeQuota().then(setYtQuota) }, 30000)
    return function () { clearInterval(iv) }
  }, [mahasiswa])

  if (loading || !mahasiswa) {
    return <div className="p-10 text-center text-slate-500">Memuat sesi...</div>
  }

  function getItemMode(i) { return itemMode[i] || 'foto' }
  function setItemModeAt(i, mode) { setItemMode(function (p) { const n = Object.assign({}, p); n[i] = mode; return n }) }
  function patchItem(i, patch) {
    setItems(function (prev) {
      return prev.map(function (it, idx) { return idx === i ? Object.assign({}, it, patch) : it })
    })
  }

  async function onItemFile(i, file) {
    if (!file) return
    if (formatHeic(file)) {
      patchItem(i, { file: file, preview: '', previewLoading: true })
      const blob = await pratinjauHeic(file)
      const preview = blob ? URL.createObjectURL(blob) : URL.createObjectURL(file)
      patchItem(i, { preview: preview, previewLoading: false })
    } else {
      patchItem(i, { file: file, preview: URL.createObjectURL(file), previewLoading: false })
    }
  }

  function removeItemFile(i) {
    patchItem(i, { file: null, preview: '', oldPath: '', previewLoading: false, show: false })
  }

  function keyDariUrl(url) {
    try {
      return new URL(url).pathname.slice(1)
    } catch (e) {
      return ''
    }
  }

  async function hapusMediaR2(url) {
    if (String(url || '').indexOf('i.ytimg.com') !== -1 || String(url || '').indexOf('youtube') !== -1) return
    const key = keyDariUrl(url)
    if (!key) {
      console.warn('URL media tidak valid, dilewati:', url)
      return
    }
    try {
      await deleteMedia(key)
      console.log('Media R2 terhapus:', key)
    } catch (err) {
      console.error('Gagal hapus media R2:', key, err.message)
    }
  }

  async function submitLogbook(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const clean = []
      for (let i = 0; i < items.length; i++) {
        const it = items[i]
        if (!it.judul.trim()) continue
        let mediaPath = null
        let mediaType = null
        let mediaThumb = null
        let mediaSource = it.oldSource || 'r2'
        let youtubeId = it.oldYtId || null
        if (it.mode === 'video' && it.ytLink && !it.file) {
          const id = parseYouTubeId(it.ytLink)
          if (!id) { alert('Link video tidak valid pada kegiatan ' + (i + 1) + '.'); setBusy(false); return }
          mediaSource = 'youtube'
          youtubeId = id
          mediaPath = ytThumb(id)
          mediaThumb = ytThumb(id)
          mediaType = 'video'
        } else if (it.mode === 'video' && it.file) {
          if (ytQuota.remaining <= 0) { alert('Kuota upload video hari ini sudah habis. Gunakan link video.'); setBusy(false); return }
          const hasilYt = await unggahVideoYouTube(it.file, it.judul || 'Dokumentasi Magang', function (p) { setInfoProses('Mengunggah video ' + Math.round(p * 100) + '%') })
          mediaSource = 'youtube'
          youtubeId = hasilYt.videoId
          mediaPath = ytThumb(hasilYt.videoId)
          mediaThumb = ytThumb(hasilYt.videoId)
          mediaType = 'video'
          setYtQuota(function (q) { return Object.assign({}, q, { used: q.used + 1, remaining: Math.max(0, q.remaining - 1) }) })
          fetchYouTubeQuota().then(setYtQuota)
        } else if (it.file) {
          const up = await uploadMedia(it.file, 'logbook', function (pesan) { setInfoProses(pesan) })
          mediaPath = up.publicUrl
          mediaType = it.file.type.indexOf('video') === 0 ? 'video' : 'foto'
          mediaThumb = up.thumbUrl || null
          mediaSource = 'r2'
          youtubeId = null
        } else if (it.oldPath) {
          mediaPath = it.oldPath
          mediaType = detectMediaType(it.oldPath)
          mediaThumb = it.oldThumb || null
          mediaSource = 'r2'
          youtubeId = null
        }
        clean.push({ judul: it.judul.trim(), deskripsi: it.deskripsi.trim(), hasil: it.hasil.trim(), media_path: mediaPath, media_type: mediaType, media_thumb: mediaThumb, media_source: mediaSource, youtube_id: youtubeId, show_in_gallery: it.show && !!mediaPath })
      }
      if (!clean.length) { alert('Tambahkan minimal satu kegiatan dengan judul.'); setBusy(false); return }

      let logId = editLogId
      let oldUrls = []
      if (editLogId) {
        const oldItems = await supabase.from('logbook_items').select('media_path, media_thumb, media_source').eq('logbook_id', editLogId)
        oldUrls = []
        ;(oldItems.data || []).forEach(function (it) {
          if (it.media_source === 'youtube') return
          if (it.media_path) oldUrls.push(it.media_path)
          if (it.media_thumb) oldUrls.push(it.media_thumb)
        })
        await supabase.from('logbooks').update({
          tanggal: form.tanggal, unit: form.unit, kategori: form.kategori, judul: form.judul,
          kendala: form.kendala, solusi: form.solusi, pembelajaran: form.pembelajaran, status: form.status
        }).eq('id', editLogId)
        await supabase.from('logbook_items').delete().eq('logbook_id', editLogId)
      } else {
        const ins = await supabase.from('logbooks').insert({
          mahasiswa_id: mahasiswa.id, tanggal: form.tanggal, unit: form.unit, kategori: form.kategori, judul: form.judul,
          kendala: form.kendala, solusi: form.solusi, pembelajaran: form.pembelajaran, status: form.status
        }).select().single()
        logId = ins.data.id
      }

      const rows = clean.map(function (c, idx) {
        return { logbook_id: logId, urutan: idx + 1, judul: c.judul, deskripsi: c.deskripsi, hasil: c.hasil, media_path: c.media_path, media_type: c.media_type, media_thumb: c.media_thumb, media_source: c.media_source, youtube_id: c.youtube_id, show_in_gallery: c.show_in_gallery }
      })
      const insItems = await supabase.from('logbook_items').insert(rows).select()
      await syncGaleriFromLogbook(mahasiswa.id, insItems.data || [], { tanggal: form.tanggal, kategori: form.kategori })

      const newUrls = []
      clean.forEach(function (c) {
        if (c.media_source === 'youtube') return
        if (c.media_path) newUrls.push(c.media_path)
        if (c.media_thumb) newUrls.push(c.media_thumb)
      })
      for (const u of oldUrls) {
        if (newUrls.indexOf(u) === -1) await hapusMediaR2(u)
      }

      setEditLogId(null)
      setForm({ tanggal: todayInput(), unit: '', kategori: '', judul: '', kendala: '', solusi: '', pembelajaran: '', status: 'draft' })
      setItems([newItem()])
      await refresh()
    } catch (err) {
      alert('Gagal menyimpan logbook: ' + err.message)
    }
    setInfoProses('')
    setBusy(false)
  }

  function startEditLog(log) {
    setEditLogId(log.id)
    setForm({
      tanggal: log.tanggal, unit: log.unit || '', kategori: log.kategori, judul: log.judul,
      kendala: log.kendala || '', solusi: log.solusi || '', pembelajaran: log.pembelajaran || '', status: log.status
    })
    const mapped = (log.logbook_items || []).map(function (it) {
      return { key: it.id, judul: it.judul, deskripsi: it.deskripsi || '', hasil: it.hasil || '', file: null, preview: it.media_path || '', oldPath: it.media_source === 'youtube' ? '' : (it.media_path || ''), oldThumb: it.media_source === 'youtube' ? '' : (it.media_thumb || ''), previewLoading: false, show: it.show_in_gallery, mode: it.media_source === 'youtube' ? 'video' : (it.media_type === 'video' ? 'video' : 'foto'), ytLink: '', oldYtId: it.youtube_id || null, oldSource: it.media_source || 'r2' }
    })
    setItems(mapped.length ? mapped : [newItem()])
    setTab('logbook')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEditLog() {
    setEditLogId(null)
    setForm({ tanggal: todayInput(), unit: '', kategori: '', judul: '', kendala: '', solusi: '', pembelajaran: '', status: 'draft' })
    setItems([newItem()])
  }

  function startEditGal(g) {
    setEditGalId(g.id)
    setGalForm({ judul: g.judul, deskripsi: g.deskripsi || '', tanggal: g.tanggal, kegiatan: g.kegiatan, file: null, preview: g.media_path || '', oldPath: g.media_source === 'youtube' ? '' : (g.media_path || ''), oldThumb: g.media_source === 'youtube' ? '' : (g.media_thumb || ''), previewLoading: false })
    setGalMode(g.media_source === 'youtube' ? 'video' : (g.media_type === 'video' ? 'video' : 'foto'))
    setGalYtLink('')
    setGalOldYt(g.youtube_id || null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEditGal() {
    setEditGalId(null)
    setGalForm({ judul: '', deskripsi: '', tanggal: todayInput(), kegiatan: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false })
     setGalMode('foto')
     setGalYtLink('')
     setGalOldYt(null)
  }

  function startEditHadir(h) {
    setEditHadirId(h.id)
    setHadirForm({ tanggal: h.tanggal, status: h.status, alasan: h.alasan || '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEditHadir() {
    setEditHadirId(null)
    setHadirForm({ tanggal: todayInput(), status: 'Masuk', alasan: '' })
  }

  function deleteLog(log) {
    setPendingDelete({ type: 'log', data: log })
  }

  async function submitGaleri(e) {
    e.preventDefault()
    setBusy(true)
    try {
      let mediaPath = ''
      let mediaType = ''
      let mediaThumb = null
      let mediaSource = galOldYt ? 'youtube' : 'r2'
      let youtubeId = galOldYt || null
      if (galMode === 'video' && galYtLink && !galForm.file) {
        const id = parseYouTubeId(galYtLink)
        if (!id) { alert('Link video tidak valid.'); setBusy(false); return }
        mediaSource = 'youtube'
        youtubeId = id
        mediaPath = ytThumb(id)
        mediaThumb = ytThumb(id)
        mediaType = 'video'
      } else if (galMode === 'video' && galForm.file) {
        if (ytQuota.remaining <= 0) { alert('Kuota upload video hari ini sudah habis. Gunakan link video.'); setBusy(false); return }
        const hasilYt = await unggahVideoYouTube(galForm.file, galForm.judul || ('Dokumentasi ' + galForm.tanggal), function (p) { setInfoProses('Mengunggah video ' + Math.round(p * 100) + '%') })
        mediaSource = 'youtube'
        youtubeId = hasilYt.videoId
        mediaPath = ytThumb(hasilYt.videoId)
        mediaThumb = ytThumb(hasilYt.videoId)
        mediaType = 'video'
        setYtQuota(function (q) { return Object.assign({}, q, { used: q.used + 1, remaining: Math.max(0, q.remaining - 1) }) })
        fetchYouTubeQuota().then(setYtQuota)
      } else if (galForm.file) {
        const up = await uploadMedia(galForm.file, 'galeri', function (pesan) { setInfoProses(pesan) })
        mediaPath = up.publicUrl
        mediaType = galForm.file.type.indexOf('video') === 0 ? 'video' : 'foto'
        mediaThumb = up.thumbUrl || null
        mediaSource = 'r2'
        youtubeId = null
      } else if (galForm.oldPath) {
        mediaPath = galForm.oldPath
        mediaType = detectMediaType(galForm.oldPath)
        mediaThumb = galForm.oldThumb || null
        mediaSource = 'r2'
        youtubeId = null
      }
      if (!mediaPath) { alert('Galeri wajib memiliki media. Pilih file foto atau video terlebih dahulu.'); setBusy(false); return }
      const payload = {
        mahasiswa_id: mahasiswa.id,
        judul: galForm.judul || ('Dokumentasi ' + galForm.tanggal),
        deskripsi: galForm.deskripsi,
        tanggal: galForm.tanggal,
        kegiatan: galForm.kegiatan || 'Lainnya',
        media_path: mediaPath,
        media_type: mediaType,
        media_thumb: mediaThumb,
        media_source: mediaSource,
        youtube_id: youtubeId
      }
      let oldGalUrls = []
      if (editGalId) {
        const existing = galeri.find(function (g) { return g.id === editGalId })
        if (existing && !existing.logbook_item_id && existing.media_source !== 'youtube' && existing.media_path !== payload.media_path) {
          oldGalUrls = [existing.media_path, existing.media_thumb].filter(Boolean)
        }
        await supabase.from('galeri').update(payload).eq('id', editGalId)
      } else {
        await supabase.from('galeri').insert(payload)
      }
      for (const u of oldGalUrls) await hapusMediaR2(u)
      setEditGalId(null)
      setGalForm({ judul: '', deskripsi: '', tanggal: todayInput(), kegiatan: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false })
     setGalMode('foto')
     setGalYtLink('')
     setGalOldYt(null)
      await refresh()
    } catch (err) {
      alert('Gagal menyimpan galeri: ' + err.message)
    }
    setInfoProses('')
    setBusy(false)
  }

  function deleteGaleri(item) {
    setPendingDelete({ type: 'gal', data: item })
  }

  async function submitHadir(e) {
    e.preventDefault()
    setBusy(true)
    const payload = { mahasiswa_id: mahasiswa.id, tanggal: hadirForm.tanggal, status: hadirForm.status, alasan: hadirForm.status === 'Masuk' ? '' : hadirForm.alasan }
    if (editHadirId) {
      await supabase.from('daftar_hadir').update(payload).eq('id', editHadirId)
    } else {
      const res = await supabase.from('daftar_hadir').insert(payload)
      if (res.error) { alert('Kamu sudah punya catatan hadir di tanggal tersebut.'); setBusy(false); return }
    }
    setEditHadirId(null)
    setHadirForm({ tanggal: todayInput(), status: 'Masuk', alasan: '' })
    await refresh()
    setInfoProses('')
    setBusy(false)
  }

  function deleteHadir(row) {
    setPendingDelete({ type: 'hadir', data: row })
  }

  function confirmInfo() {
    if (!pendingDelete) return null
    if (pendingDelete.type === 'media-item') {
      return {
        title: 'Hapus gambar?',
        message: 'Lampiran gambar pada kegiatan ini akan dibatalkan. Kamu bisa memilih file lain setelahnya.'
      }
    }
    if (pendingDelete.type === 'media-gal') {
      return {
        title: 'Hapus gambar?',
        message: 'Lampiran gambar pada form galeri akan dibatalkan. Kamu bisa memilih file lain setelahnya.'
      }
    }
    if (pendingDelete.type === 'log') {
      return {
        title: 'Hapus logbook?',
        message: 'Logbook "' + pendingDelete.data.judul + '" beserta seluruh rincian kegiatannya akan dihapus permanen. Media galeri yang terhubung dari logbook ini juga ikut terhapus.'
      }
    }
    if (pendingDelete.type === 'gal') {
      const extra = pendingDelete.data.logbook_item_id
        ? ' Media ini berasal dari logbook, jadi logbook asalnya tidak ikut terhapus. Centang tampilan galeri pada kegiatan logbook akan dimatikan dan bisa dinyalakan lagi kapan saja.'
        : ''
      return {
        title: 'Hapus media galeri?',
        message: 'Media "' + pendingDelete.data.judul + '" akan dihapus permanen dari galeri kamu.' + extra
      }
    }
    return {
      title: 'Hapus catatan hadir?',
      message: 'Catatan kehadiran tanggal ' + pendingDelete.data.tanggal + ' dengan status ' + pendingDelete.data.status + ' akan dihapus permanen.'
    }
  }

  async function executeDelete() {
    if (!pendingDelete) return
    const target = pendingDelete
    setPendingDelete(null)
    if (target.type === 'media-item') {
      removeItemFile(target.data)
      return
    }
    if (target.type === 'media-gal') {
      setGalForm(function (g) { return Object.assign({}, g, { file: null, preview: '', oldPath: '' }) })
      return
    }
    if (target.type === 'log') {
      const urls = []
      ;(target.data.logbook_items || []).forEach(function (it) {
        if (it.media_source === 'youtube') return
        if (it.media_path) urls.push(it.media_path)
        if (it.media_thumb) urls.push(it.media_thumb)
      })
      await supabase.from('logbooks').delete().eq('id', target.data.id)
      for (const u of urls) await hapusMediaR2(u)
    } else if (target.type === 'gal') {
      const urls = target.data.logbook_item_id || target.data.media_source === 'youtube' ? [] : [target.data.media_path, target.data.media_thumb].filter(Boolean)
      await supabase.from('galeri').delete().eq('id', target.data.id)
      if (target.data.logbook_item_id) {
        await supabase.from('logbook_items').update({ show_in_gallery: false }).eq('id', target.data.logbook_item_id)
      }
      for (const u of urls) await hapusMediaR2(u)
    } else if (target.type === 'hadir') {
      await supabase.from('daftar_hadir').delete().eq('id', target.data.id)
    }
    await refresh()
  }

  const filteredLogs = logs.filter(function (l) {
    if (logFilter.kategori && l.kategori !== logFilter.kategori) return false
    if (logFilter.status && l.status !== logFilter.status) return false
    return matchesDateFilters(l.tanggal, logFilter)
  })
  const sortedLogs = urutkanTanggal(filteredLogs, sort)
  const logFilterActive = countActiveFilters(logFilter)

  const filteredGaleri = galeri.filter(function (g) {
    if (galFilter.kegiatan && (g.kegiatan || 'Lainnya') !== galFilter.kegiatan) return false
    if (galFilter.tipe && g.media_type !== galFilter.tipe) return false
    return matchesDateFilters(g.tanggal, galFilter)
  })
  const sortedGaleri = urutkanTanggal(filteredGaleri, sort)
  const galFilterActive = countActiveFilters(galFilter)

  const filteredHadir = hadir.filter(function (h) {
    if (hadirFilter.status && h.status !== hadirFilter.status) return false
    return matchesDateFilters(h.tanggal, hadirFilter)
  })
  const sortedHadir = urutkanTanggal(filteredHadir, sort)
  const hadirFilterActive = countActiveFilters(hadirFilter)

  const editGalDerived = editGalId ? ((galeri.find(function (g) { return g.id === editGalId }) || {}).logbook_item_id || null) : null

  const tabCls = function (t) {
    return 'px-5 py-3 rounded-2xl text-sm font-bold ' + (tab === t ? 'bg-bsi-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
  }

  return (
    <div>
      <section className="card-hover rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm text-slate-500">Dashboard mahasiswa</p>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900">{mahasiswa.nama}</h1>
            <p className="text-sm text-slate-500">NIM {mahasiswa.nim}</p>
            {mahasiswa.prodi ? <p className="text-sm text-slate-500">{mahasiswa.prodi}</p> : null}
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          <button onClick={function () { setTab('logbook') }} className={tabCls('logbook')}>Logbook</button>
          <button onClick={function () { setTab('galeri') }} className={tabCls('galeri')}>Galeri</button>
          <button onClick={function () { setTab('absen') }} className={tabCls('absen')}>Daftar Hadir</button>
        </div>
      </section>

      {tab === 'logbook' ? (
        <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr] items-start">
          <div className={'card-hover bg-white rounded-[2rem] border shadow-sm p-8 min-w-0 ' + (editLogId ? 'border-gold-500 ring-1 ring-gold-500' : 'border-slate-200')}>
            <ModeIndicator edit={!!editLogId} onCancel={cancelEditLog} />
            <h2 className="mt-3 text-2xl font-black text-slate-900">{editLogId ? 'Ubah logbook harian' : 'Tambah logbook harian'}</h2>
            <form onSubmit={submitLogbook} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Tanggal <span className="text-red-500">*</span></label>
                  <div className="mt-1.5">
                    <CustomDateInput value={form.tanggal} onChange={function (v) { setForm(Object.assign({}, form, { tanggal: v })) }} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Unit utama</label>
                  <div className="mt-1.5">
                    <CustomSelect placeholder="Pilih unit" value={form.unit}
                      onChange={function (v) { setForm(Object.assign({}, form, { unit: v })) }}
                      options={UNIT.map(function (u) { return { value: u, label: u } })} />
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Kategori utama <span className="text-red-500">*</span></label>
                  <div className="mt-1.5">
                    <CustomSelect placeholder="Pilih kategori" value={form.kategori}
                      onChange={function (v) { setForm(Object.assign({}, form, { kategori: v })) }}
                      options={KATEGORI.map(function (k) { return { value: k, label: k } })} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Status tampil</label>
                  <div className="mt-1.5">
                    <CustomSelect value={form.status}
                      onChange={function (v) { setForm(Object.assign({}, form, { status: v })) }}
                      options={[{ value: 'draft', label: 'Draft' }, { value: 'publik', label: 'Siap dilihat' }]} />
                  </div>
                </div>
              </div>
              <div>
                <label className={labelCls}>Ringkasan hari ini <span className="text-red-500">*</span></label>
                <input required className={inputCls} value={form.judul} onChange={function (e) { setForm(Object.assign({}, form, { judul: e.target.value })) }} placeholder="Contoh: Kegiatan harian di divisi Back Office" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Rincian kegiatan hari ini <span className="text-red-500">*</span></p>
                  <button type="button" onClick={function () { setItems(function (p) { return p.concat([newItem()]) }) }} className={btnSmall + ' bg-bsi-100 text-bsi-900 hover:bg-bsi-200'}>+ Tambah kegiatan</button>
                </div>
                {items.map(function (it, i) {
                  return (
                    <div key={it.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-bsi-800">Kegiatan {i + 1}</span>
                        {items.length > 1 ? <button type="button" onClick={function () { setItems(function (p) { return p.filter(function (x, idx) { return idx !== i }) }) }} className="text-xs text-red-600 hover:underline">Hapus</button> : null}
                      </div>
                      <input className={inputCls} value={it.judul} onChange={function (e) { patchItem(i, { judul: e.target.value }) }} placeholder="Judul kegiatan" />
                      <AutoTextArea className={inputCls} value={it.deskripsi} onChange={function (e) { patchItem(i, { deskripsi: e.target.value }) }} placeholder="Deskripsi singkat kegiatan" />
                      <input className={inputCls} value={it.hasil} onChange={function (e) { patchItem(i, { hasil: e.target.value }) }} placeholder="Hasil (opsional)" />
                      {it.previewLoading ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-100 aspect-video grid place-items-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="h-9 w-9 rounded-full border-4 border-bsi-500 border-t-transparent animate-spin"></div>
                            <p className="text-xs font-semibold text-slate-500">Mengonversi pratinjau</p>
                          </div>
                        </div>
                      ) : null}
                      {it.preview ? (
                        <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900">
                          {it.file && it.file.type.indexOf('video') === 0
                            ? <video src={it.preview} controls playsInline preload="metadata" className="absolute inset-0 h-full w-full object-contain" />
                            : <img src={it.preview} alt="Pratinjau" className="absolute inset-0 h-full w-full object-contain" />}
                          <button type="button" onClick={function () { setPendingDelete({ type: 'media-item', data: i }) }} title="Hapus gambar"
                            className="absolute top-2 right-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-red-500 text-white hover:bg-red-600">
                            <SizedIcon name="close" size={14} />
                          </button>
                        </div>
                      ) : null}
                      <div className="flex gap-2">
                        <button type="button" onClick={function () { patchItem(i, { mode: 'foto' }) }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (it.mode !== 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Foto</button>
                        <button type="button" onClick={function () { patchItem(i, { mode: 'video' }) }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (it.mode === 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Video</button>
                      </div>
                      {it.mode === 'video' ? (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-slate-500">Sisa kuota upload video hari ini: {ytQuota.remaining} dari {ytQuota.limit}</p>
                          <div className={ytQuota.remaining <= 0 && !it.file ? 'opacity-50 pointer-events-none' : ''}>
                            <FileInput accept="video/*" fileName={it.file ? it.file.name : ''}
                              onChange={function (e) { onItemFile(i, e.target.files[0]) }} />
                          </div>
                          {ytQuota.remaining <= 0 ? <p className="text-xs text-red-600">Kuota habis. Gunakan link video di bawah.</p> : null}
                          <input className={inputCls} value={it.ytLink} onChange={function (e) { patchItem(i, { ytLink: e.target.value }) }} placeholder="Atau tempel link video eksternal" />
                        </div>
                      ) : (
                        <FileInput accept="image/*" fileName={it.file ? it.file.name : ''}
                          onChange={function (e) { onItemFile(i, e.target.files[0]) }} />
                      )}
                      <label className={'flex items-start gap-3 rounded-2xl border p-3 cursor-pointer w-full ' + (it.preview ? (it.show ? 'border-gold-500 bg-gold-500/5' : 'border-slate-200') : 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed')}>
                        <input type="checkbox" disabled={!it.preview} checked={it.show} onChange={function (e) { patchItem(i, { show: e.target.checked }) }} className="mt-0.5 h-4 w-4 rounded accent-bsi-800" />
                        <span className="text-sm font-semibold text-slate-800">Tampilkan kegiatan ini di galeri</span>
                      </label>
                    </div>
                  )
                })}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div><label className={labelCls}>Kendala</label><AutoTextArea className={inputCls} value={form.kendala} onChange={function (e) { setForm(Object.assign({}, form, { kendala: e.target.value })) }} placeholder="Opsional" /></div>
                <div><label className={labelCls}>Solusi</label><AutoTextArea className={inputCls} value={form.solusi} onChange={function (e) { setForm(Object.assign({}, form, { solusi: e.target.value })) }} placeholder="Opsional" /></div>
                <div><label className={labelCls}>Pembelajaran</label><AutoTextArea className={inputCls} value={form.pembelajaran} onChange={function (e) { setForm(Object.assign({}, form, { pembelajaran: e.target.value })) }} placeholder="Opsional" /></div>
              </div>

              <button type="submit" disabled={busy} className={btnPrimary}>{busy ? <LabelProses teks={infoProses || 'Menyimpan'} /> : (editLogId ? 'Simpan perubahan' : 'Simpan logbook')}</button>
            </form>
          </div>

          <div className="space-y-5 min-w-0">
            <h2 className="text-2xl font-black text-slate-900">Logbook kamu</h2>
            <FilterBar open={logFilterOpen} onToggle={function () { setLogFilterOpen(function (o) { return !o }) }} activeCount={logFilterActive}
              onReset={function () { setLogFilter(LOG_INITIAL) }}>
              <FilterSelect icon={ICONS.tag} value={logFilter.kategori} onChange={function (v) { setLogFilter(Object.assign({}, logFilter, { kategori: v })) }}
                options={[{ value: '', label: 'Semua kategori' }].concat(KATEGORI.map(function (k) { return { value: k, label: k } }))} />
              <FilterSelect icon={ICONS.check} value={logFilter.status} onChange={function (v) { setLogFilter(Object.assign({}, logFilter, { status: v })) }}
                options={[{ value: '', label: 'Semua status' }, { value: 'draft', label: 'Draft' }, { value: 'publik', label: 'Siap dilihat' }]} />
              <TimeFilter filter={logFilter} set={setLogFilter} />
              <SortSelect value={sort} onChange={setSort} />
            </FilterBar>
            <p className="text-sm text-slate-500">Menampilkan {filteredLogs.length} dari {logs.length} logbook</p>
            <div className="grid gap-5 md:grid-cols-2">
              {sortedLogs.map(function (l) {
                return <LogbookCard key={l.id} log={l} isOwner
                  onDetail={function () { setDetail({ type: 'log', data: l }) }}
                  onEdit={function () { startEditLog(l) }}
                  onDelete={function () { deleteLog(l) }} />
              })}
            </div>
            {!filteredLogs.length ? <EmptyState title={logs.length ? 'Logbook tidak ditemukan' : 'Belum ada logbook'} desc={logs.length ? 'Coba reset filter atau pilih filter lain.' : 'Tambahkan logbook harian pertama kamu.'} /> : null}
          </div>
        </section>
      ) : null}

      {tab === 'galeri' ? (
        <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr] items-start">
          <div className={'card-hover bg-white rounded-[2rem] border shadow-sm p-8 min-w-0 ' + (editGalId ? 'border-gold-500 ring-1 ring-gold-500' : 'border-slate-200')}>
            <ModeIndicator edit={!!editGalId} onCancel={cancelEditGal} />
            <h2 className="mt-3 text-2xl font-black text-slate-900">{editGalId ? 'Ubah media galeri' : 'Tambah media galeri'}</h2>
            <form onSubmit={submitGaleri} className="mt-6 space-y-4">
              <div>
                <label className={labelCls}>Jenis media {editGalId ? null : <span className="text-red-500">*</span>}</label>
                <div className="mt-1.5 flex gap-2">
                  <button type="button" onClick={function () { setGalMode('foto') }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (galMode !== 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Foto</button>
                  <button type="button" onClick={function () { setGalMode('video') }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (galMode === 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Video</button>
                </div>
                <div className="mt-1.5">
                  {galMode === 'video' ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500">Sisa kuota upload video hari ini: {ytQuota.remaining} dari {ytQuota.limit}</p>
                      <div className={ytQuota.remaining <= 0 && !galForm.file ? 'opacity-50 pointer-events-none' : ''}>
                        <FileInput accept="video/*" fileName={galForm.file ? galForm.file.name : ''}
                          onChange={function (e) {
                            const f = e.target.files[0]
                            if (!f) return
                            setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: URL.createObjectURL(f), previewLoading: false }) })
                          }} />
                      </div>
                      {ytQuota.remaining <= 0 ? <p className="text-xs text-red-600">Kuota habis. Gunakan link video di bawah.</p> : null}
                      <input className={inputCls} value={galYtLink} onChange={function (e) { setGalYtLink(e.target.value) }} placeholder="Atau tempel link video eksternal" />
                    </div>
                  ) : (
                    <FileInput accept="image/*" fileName={galForm.file ? galForm.file.name : ''}
                      onChange={async function (e) {
                        const f = e.target.files[0]
                        if (!f) return
                        if (formatHeic(f)) {
                          setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: '', previewLoading: true }) })
                          const blob = await pratinjauHeic(f)
                          const preview = blob ? URL.createObjectURL(blob) : URL.createObjectURL(f)
                          setGalForm(function (g) { return Object.assign({}, g, { preview: preview, previewLoading: false }) })
                        } else {
                          setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: URL.createObjectURL(f), previewLoading: false }) })
                        }
                      }} />
                  )}
                </div>
              </div>
              {galForm.previewLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-100 aspect-video grid place-items-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-9 w-9 rounded-full border-4 border-bsi-500 border-t-transparent animate-spin"></div>
                    <p className="text-xs font-semibold text-slate-500">Mengonversi pratinjau</p>
                  </div>
                </div>
              ) : null}
              {galForm.preview ? (
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900">
                  {galForm.file && galForm.file.type.indexOf('video') === 0
                    ? <video src={galForm.preview} controls playsInline preload="metadata" className="absolute inset-0 h-full w-full object-contain" />
                    : <img src={galForm.preview} alt="Pratinjau" className="absolute inset-0 h-full w-full object-contain" />}
                  <button type="button" onClick={function () { setPendingDelete({ type: 'media-gal' }) }} title="Hapus gambar"
                    className="absolute top-2 right-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-red-500 text-white hover:bg-red-600">
                    <SizedIcon name="close" size={14} />
                  </button>
                </div>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className={labelCls}>Judul (opsional)</label><input className={inputCls} value={galForm.judul} onChange={function (e) { setGalForm(Object.assign({}, galForm, { judul: e.target.value })) }} placeholder="Kosongkan untuk judul otomatis" /></div>
                <div>
                  <label className={labelCls}>Tanggal (opsional)</label>
                  <div className="mt-1.5">
                    <CustomDateInput value={galForm.tanggal} onChange={function (v) { setGalForm(Object.assign({}, galForm, { tanggal: v })) }} />
                  </div>
                </div>
              </div>
              <div>
                <label className={labelCls}>Kegiatan (opsional)</label>
                <div className="mt-1.5">
                  <CustomSelect placeholder="Pilih kegiatan" value={galForm.kegiatan}
                    onChange={function (v) { setGalForm(Object.assign({}, galForm, { kegiatan: v })) }}
                    options={GALERI_KEGIATAN.map(function (k) { return { value: k, label: k } })} />
                </div>
                {editGalDerived ? <p className="mt-1 text-xs text-slate-400">Media ini berasal dari logbook. Perubahan judul, deskripsi, kegiatan, dan tanggal hanya memengaruhi galeri dan tidak akan ditimpa saat logbook disimpan.</p> : null}
              </div>
              <div><label className={labelCls}>Deskripsi (opsional)</label><AutoTextArea className={inputCls} value={galForm.deskripsi} onChange={function (e) { setGalForm(Object.assign({}, galForm, { deskripsi: e.target.value })) }} placeholder="Tambahkan keterangan media." /></div>
              <button type="submit" disabled={busy} className={btnPrimary}>{busy ? <LabelProses teks={infoProses || 'Menyimpan'} /> : (editGalId ? 'Simpan perubahan media' : 'Unggah media')}</button>
            </form>
          </div>

          <div className="space-y-5 min-w-0">
            <h2 className="text-2xl font-black text-slate-900">Galeri kamu</h2>
            <FilterBar open={galFilterOpen} onToggle={function () { setGalFilterOpen(function (o) { return !o }) }} activeCount={galFilterActive}
              onReset={function () { setGalFilter(GAL_INITIAL) }}>
              <FilterSelect icon={ICONS.tag} value={galFilter.kegiatan} onChange={function (v) { setGalFilter(Object.assign({}, galFilter, { kegiatan: v })) }}
                options={[{ value: '', label: 'Semua kegiatan' }].concat(GALERI_KEGIATAN.map(function (k) { return { value: k, label: k } }))} />
              <FilterSelect icon={ICONS.image} value={galFilter.tipe} onChange={function (v) { setGalFilter(Object.assign({}, galFilter, { tipe: v })) }}
                options={[{ value: '', label: 'Semua media' }, { value: 'foto', label: 'Foto' }, { value: 'video', label: 'Video' }]} />
              <TimeFilter filter={galFilter} set={setGalFilter} />
              <SortSelect value={sort} onChange={setSort} />
            </FilterBar>
            <p className="text-sm text-slate-500">Menampilkan {filteredGaleri.length} dari {galeri.length} media</p>
            <div className="grid gap-5 md:grid-cols-2">
              {sortedGaleri.map(function (g) {
                return <GalleryCard key={g.id} item={g} isOwner
                  onDetail={function () { setDetail({ type: 'gal', data: g }) }}
                  onEdit={function () { startEditGal(g) }}
                  onDelete={function () { deleteGaleri(g) }} />
              })}
              {!filteredGaleri.length ? <EmptyState icon="camera" title={galeri.length ? 'Media tidak ditemukan' : 'Belum ada media galeri'} desc={galeri.length ? 'Coba reset filter atau pilih filter lain.' : 'Unggah foto atau video pertama kamu.'} /> : null}
            </div>
          </div>
        </section>
      ) : null}

      {tab === 'absen' ? (
        <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr] items-start">
          <div className={'card-hover bg-white rounded-[2rem] border shadow-sm p-8 min-w-0 ' + (editHadirId ? 'border-gold-500 ring-1 ring-gold-500' : 'border-slate-200')}>
            <ModeIndicator edit={!!editHadirId} onCancel={cancelEditHadir} />
            <h2 className="mt-3 text-2xl font-black text-slate-900">{editHadirId ? 'Ubah daftar hadir' : 'Isi daftar hadir'}</h2>
            <form onSubmit={submitHadir} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Tanggal <span className="text-red-500">*</span></label>
                  <div className="mt-1.5">
                    <CustomDateInput value={hadirForm.tanggal} onChange={function (v) { setHadirForm(Object.assign({}, hadirForm, { tanggal: v })) }} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Status kehadiran <span className="text-red-500">*</span></label>
                  <div className="mt-1.5">
                    <CustomSelect value={hadirForm.status}
                      onChange={function (v) { setHadirForm(Object.assign({}, hadirForm, { status: v, alasan: v === 'Masuk' ? '' : hadirForm.alasan })) }}
                      options={[{ value: 'Masuk', label: 'Masuk' }, { value: 'Izin', label: 'Izin' }, { value: 'Bolos', label: 'Bolos' }]} />
                  </div>
                </div>
              </div>
              <div>
                <label className={labelCls}>Alasan atau keterangan</label>
                <AutoTextArea
                  className={inputCls + (hadirForm.status === 'Masuk' ? ' opacity-60 cursor-not-allowed' : '')}
                  value={hadirForm.alasan}
                  onChange={function (e) { setHadirForm(Object.assign({}, hadirForm, { alasan: e.target.value })) }}
                  placeholder={hadirForm.status === 'Masuk' ? 'Status Masuk tidak memerlukan alasan' : 'Contoh: Keperluan keluarga, sakit.'}
                  disabled={hadirForm.status === 'Masuk'}
                />
                {hadirForm.status === 'Masuk' ? <p className="mt-1 text-xs text-slate-400">Field ini hanya terisi untuk status Izin atau Bolos.</p> : null}
              </div>
              <button type="submit" disabled={busy} className={btnPrimary}>{busy ? <LabelProses teks="Menyimpan" /> : (editHadirId ? 'Simpan perubahan' : 'Simpan daftar hadir')}</button>
            </form>
          </div>

          <div className="space-y-5 min-w-0">
            <h2 className="text-2xl font-black text-slate-900">Daftar hadir kamu</h2>
            <FilterBar open={hadirFilterOpen} onToggle={function () { setHadirFilterOpen(function (o) { return !o }) }} activeCount={hadirFilterActive}
              onReset={function () { setHadirFilter(HADIR_INITIAL) }}>
              <FilterSelect icon={ICONS.check} value={hadirFilter.status} onChange={function (v) { setHadirFilter(Object.assign({}, hadirFilter, { status: v })) }}
                options={[{ value: '', label: 'Semua status' }, { value: 'Masuk', label: 'Masuk' }, { value: 'Izin', label: 'Izin' }, { value: 'Bolos', label: 'Bolos' }]} />
              <TimeFilter filter={hadirFilter} set={setHadirFilter} />
              <SortSelect value={sort} onChange={setHadirFilterOpen && setSort ? setSort : setSort} />
            </FilterBar>
            <p className="text-sm text-slate-500">Menampilkan {filteredHadir.length} dari {hadir.length} catatan</p>
            <div className="grid gap-5 md:grid-cols-2">
            {sortedHadir.map(function (h) {
              return <AttendanceCard key={h.id} row={h} isOwner
                onDetail={function () { setDetail({ type: 'hadir', data: h }) }}
                onEdit={function () { startEditHadir(h) }}
                onDelete={function () { deleteHadir(h) }} />
            })}
            </div>
            {!filteredHadir.length ? <EmptyState icon="clipboard" title={hadir.length ? 'Catatan tidak ditemukan' : 'Belum ada data kehadiran'} desc={hadir.length ? 'Coba reset filter atau pilih filter lain.' : 'Isi daftar hadir pertama kamu.'} /> : null}
          </div>
        </section>
      ) : null}

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail && detail.type === 'log' ? <LogbookDetail log={detail.data} /> : null}
        {detail && detail.type === 'gal' ? <GalleryDetail item={detail.data} /> : null}
        {detail && detail.type === 'hadir' ? <AttendanceDetail row={detail.data} /> : null}
      </Modal>

      {pendingDelete ? (
        <ConfirmModal
          open={true}
          title={confirmInfo().title}
          message={confirmInfo().message}
          onCancel={function () { setPendingDelete(null) }}
          onConfirm={executeDelete}
        />
      ) : null}
    </div>
  )
}
```
