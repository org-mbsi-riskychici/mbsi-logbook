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
public/
  llms.txt
  robots.txt
src/
  components/
    cards.jsx
    Carousel.jsx
    controls.jsx
    FilterBar.jsx
    icons.jsx
    Layout.jsx
    PemutarVideo.jsx
    Skeleton.jsx
    ui.jsx
  lib/
    auth.js
    constants.js
    drive.js
    format.js
    konversi.js
    logbook.js
    profil.js
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
  migrasi-drive-download.sql
  schema.sql
.env.example
.gitignore
index.html
package.json
postcss.config.js
README.md
tailwind.config.js
vercel.json
vite.config.js
```

# Files

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

## File: public/llms.txt
```
# Logbook Magang BSI
Portal logbook, galeri, dan daftar hadir mahasiswa magang Bank Syariah Indonesia.
Aplikasi single page berbasis React dengan data tersimpan di Supabase dan media di Cloudflare R2, YouTube, serta Google Drive.

## Halaman publik
- / : beranda, ringkasan statistik dan logbook terbaru tim
- /logbook : daftar logbook publik lengkap dengan filter mahasiswa, kategori, dan tanggal
- /galeri : galeri foto dan video kegiatan magang
- /absen : daftar hadir tim beserta grafik kehadiran per mahasiswa
- /dospem : ringkasan kegiatan untuk dosen pembimbing dan kaprodi tanpa login

## Area intern
- /login : masuk mahasiswa menggunakan NIM dan kode akses
- /dashboard : pengelolaan logbook, galeri, daftar hadir, dan foto profil, memerlukan sesi login

## Catatan teknis
- Seluruh konten dimuat lewat JavaScript, tersedia blok noscript berisi tautan halaman utama.
- robots.txt mengizinkan perayap umum dan agen AI.
```

## File: public/robots.txt
```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /
```

## File: src/lib/profil.js
```javascript
import { supabase } from './supabase.js'
import { siapkanFotoProfil } from './konversi.js'

const MAKS_FOTO_PROFIL = 5 * 1024 * 1024

export async function uploadFotoProfil(file, userId) {
  if (!file) throw new Error('File foto tidak ditemukan')
  const tipe = String(file.type || '').toLowerCase()
  if (tipe.indexOf('image/') !== 0) throw new Error('File harus berupa gambar')
  if (file.size > MAKS_FOTO_PROFIL) throw new Error('Ukuran foto maksimal 5 MB')
  const siap = await siapkanFotoProfil(file, 640, 0.85)
  const namaFile = userId + '/profil-' + Date.now() + '.webp'
  const { error } = await supabase.storage
    .from('foto-profil')
    .upload(namaFile, siap, { upsert: true, contentType: siap.type })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('foto-profil').getPublicUrl(namaFile)
  return data.publicUrl
}

export async function updateFotoProfilMahasiswa(mahasiswaId, fotoUrl) {
  const { error } = await supabase.from('mahasiswa').update({ foto_profil: fotoUrl }).eq('id', mahasiswaId)
  if (error) throw new Error(error.message)
}

export async function hapusFotoProfil(mahasiswaId, fotoUrl) {
  if (fotoUrl) {
    const bagian = String(fotoUrl).split('/foto-profil/')
    if (bagian[1]) {
      await supabase.storage.from('foto-profil').remove([decodeURIComponent(bagian[1])])
    }
  }
  const { error } = await supabase.from('mahasiswa').update({ foto_profil: null }).eq('id', mahasiswaId)
  if (error) throw new Error(error.message)
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

## File: supabase/migrasi-drive-download.sql
```sql
-- Migrasi fitur download Google Drive
-- Jalankan SQL ini di Supabase Dashboard > SQL Editor
-- jika kolom drive_id belum ada.

alter table public.logbook_items add column if not exists drive_id text;
alter table public.galeri add column if not exists drive_id text;
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

## File: api/youtube/latest.js
```javascript
import { createClient } from '@supabase/supabase-js'
const LIMIT_PER_PROJECT = 5
function ptToday() {
  const now = new Date()
  const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const y = pt.getFullYear()
  const m = String(pt.getMonth() + 1).padStart(2, '0')
  const d = String(pt.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}
function daftarKredensial() {
  const list = []
  for (let n = 1; n <= 6; n++) {
    const id = process.env['YOUTUBE_CLIENT_ID_' + n]
    const secret = process.env['YOUTUBE_CLIENT_SECRET_' + n]
    const refresh = process.env['YOUTUBE_REFRESH_TOKEN_' + n]
    if (id && secret && refresh) list.push({ n: n, id: id, secret: secret, refresh: refresh })
  }
  if (!list.length && process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET && process.env.YOUTUBE_REFRESH_TOKEN) {
    list.push({ n: 1, id: process.env.YOUTUBE_CLIENT_ID, secret: process.env.YOUTUBE_CLIENT_SECRET, refresh: process.env.YOUTUBE_REFRESH_TOKEN })
  }
  return list
}
const cacheToken = {}
async function getAccessToken(kred) {
  const now = Date.now()
  const c = cacheToken[kred.n]
  if (c && c.expire > now + 60000) return c.token
  const params = new URLSearchParams()
  params.set('client_id', kred.id)
  params.set('client_secret', kred.secret)
  params.set('refresh_token', kred.refresh)
  params.set('grant_type', 'refresh_token')
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!r.ok) throw new Error('refresh token project ' + kred.n + ' gagal (status ' + r.status + ')')
  const j = await r.json()
  cacheToken[kred.n] = { token: j.access_token, expire: now + (j.expires_in || 3600) * 1000 }
  return j.access_token
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const authClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
  const chk = await authClient.auth.getUser()
  if (chk.error || !chk.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })
  const kredensial = daftarKredensial()
  if (!kredensial.length) return res.status(500).json({ error: 'Kredensial YouTube belum dikonfigurasi di environment' })
  let terakhir = ''
  for (const kred of kredensial) {
    let access
    try { access = await getAccessToken(kred) } catch (e) { terakhir = e.message; continue }
    const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&order=date&maxResults=5', { headers: { Authorization: 'Bearer ' + access } })
    if (!r.ok) { terakhir = 'project ' + kred.n + ' status ' + r.status; continue }
    const j = await r.json()
    const items = j.items || []
    const batas = Date.now() - 15 * 60 * 1000
    const cocok = items.find(function (it) {
      const t = Date.parse(it.snippet && it.snippet.publishedAt ? it.snippet.publishedAt : '')
      return isNaN(t) ? false : t >= batas
    })
    if (!cocok) return res.status(404).json({ error: 'Video terbaru tidak ditemukan' })
    return res.status(200).json({ videoId: cocok.id && cocok.id.videoId, project: kred.n })
  }
  return res.status(502).json({ error: 'Gagal memeriksa video terbaru: ' + terakhir })
}
```

## File: api/youtube/quota.js
```javascript
import { createClient } from '@supabase/supabase-js'
const LIMIT_PER_PROJECT = 5
function ptToday() {
  const now = new Date()
  const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const y = pt.getFullYear()
  const m = String(pt.getMonth() + 1).padStart(2, '0')
  const d = String(pt.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}
function daftarKredensial() {
  const list = []
  for (let n = 1; n <= 6; n++) {
    const id = process.env['YOUTUBE_CLIENT_ID_' + n]
    const secret = process.env['YOUTUBE_CLIENT_SECRET_' + n]
    const refresh = process.env['YOUTUBE_REFRESH_TOKEN_' + n]
    if (id && secret && refresh) list.push({ n: n, id: id, secret: secret, refresh: refresh })
  }
  if (!list.length && process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET && process.env.YOUTUBE_REFRESH_TOKEN) {
    list.push({ n: 1, id: process.env.YOUTUBE_CLIENT_ID, secret: process.env.YOUTUBE_CLIENT_SECRET, refresh: process.env.YOUTUBE_REFRESH_TOKEN })
  }
  return list
}
const cacheToken = {}
async function getAccessToken(kred) {
  const now = Date.now()
  const c = cacheToken[kred.n]
  if (c && c.expire > now + 60000) return c.token
  const params = new URLSearchParams()
  params.set('client_id', kred.id)
  params.set('client_secret', kred.secret)
  params.set('refresh_token', kred.refresh)
  params.set('grant_type', 'refresh_token')
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!r.ok) throw new Error('refresh token project ' + kred.n + ' gagal (status ' + r.status + ')')
  const j = await r.json()
  cacheToken[kred.n] = { token: j.access_token, expire: now + (j.expires_in || 3600) * 1000 }
  return j.access_token
}
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const today = ptToday()
  const kredensial = daftarKredensial()
  if (!kredensial.length) return res.status(500).json({ error: 'Kredensial YouTube belum dikonfigurasi di environment' })
  let usedTotal = 0
  const perProject = []
  for (const kred of kredensial) {
    const hit = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today).eq('project_id', kred.n)
    const used = hit.count || 0
    usedTotal += used
    perProject.push({ project: kred.n, used: used, remaining: Math.max(0, LIMIT_PER_PROJECT - used) })
  }
  const limit = kredensial.length * LIMIT_PER_PROJECT
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ limit: limit, used: usedTotal, remaining: Math.max(0, limit - usedTotal), perProject: perProject, ptDate: today })
}
```

## File: api/youtube/session.js
```javascript
import { createClient } from '@supabase/supabase-js'
const LIMIT_PER_PROJECT = 5
function ptToday() {
  const now = new Date()
  const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const y = pt.getFullYear()
  const m = String(pt.getMonth() + 1).padStart(2, '0')
  const d = String(pt.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}
function daftarKredensial() {
  const list = []
  for (let n = 1; n <= 6; n++) {
    const id = process.env['YOUTUBE_CLIENT_ID_' + n]
    const secret = process.env['YOUTUBE_CLIENT_SECRET_' + n]
    const refresh = process.env['YOUTUBE_REFRESH_TOKEN_' + n]
    if (id && secret && refresh) list.push({ n: n, id: id, secret: secret, refresh: refresh })
  }
  if (!list.length && process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET && process.env.YOUTUBE_REFRESH_TOKEN) {
    list.push({ n: 1, id: process.env.YOUTUBE_CLIENT_ID, secret: process.env.YOUTUBE_CLIENT_SECRET, refresh: process.env.YOUTUBE_REFRESH_TOKEN })
  }
  return list
}
const cacheToken = {}
async function getAccessToken(kred) {
  const now = Date.now()
  const c = cacheToken[kred.n]
  if (c && c.expire > now + 60000) return c.token
  const params = new URLSearchParams()
  params.set('client_id', kred.id)
  params.set('client_secret', kred.secret)
  params.set('refresh_token', kred.refresh)
  params.set('grant_type', 'refresh_token')
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!r.ok) throw new Error('refresh token project ' + kred.n + ' gagal (status ' + r.status + ')')
  const j = await r.json()
  cacheToken[kred.n] = { token: j.access_token, expire: now + (j.expires_in || 3600) * 1000 }
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
  const kredensial = daftarKredensial()
  if (!kredensial.length) return res.status(500).json({ error: 'Kredensial YouTube belum dikonfigurasi di environment' })
  const body = req.body || {}
  if (!body.title) return res.status(400).json({ error: 'Judul video wajib diisi' })
  let terakhir = ''
  for (const kred of kredensial) {
    const hit = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today).eq('project_id', kred.n)
    if ((hit.count || 0) >= LIMIT_PER_PROJECT) { terakhir = 'project ' + kred.n + ' sudah penuh'; continue }
    let access
    try { access = await getAccessToken(kred) } catch (e) { terakhir = e.message; continue }
    const meta = {
      snippet: { title: String(body.title).slice(0, 100), description: String(body.description || '').slice(0, 4000), tags: ['logbook-magang-bsi'], categoryId: '22' },
      status: { privacyStatus: 'unlisted', embeddable: true, publicStatsViewable: false }
    }
    const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + access, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': body.contentType || 'video/mp4' },
      body: JSON.stringify(meta)
    })
    if (!init.ok) { terakhir = 'project ' + kred.n + ' ditolak Google (status ' + init.status + ')'; continue }
    const sessionUri = init.headers.get('location')
    if (!sessionUri) { terakhir = 'project ' + kred.n + ' tanpa lokasi upload'; continue }
    await admin.from('youtube_quota_usage').insert({ pt_date: today, user_id: chk.data.user.id, project_id: kred.n })
    return res.status(200).json({ sessionUri: sessionUri, project: kred.n })
  }
  return res.status(429).json({ error: 'Kuota harian semua project video sudah habis. Coba lagi besok atau gunakan link video eksternal.', detail: terakhir })
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

## File: src/lib/drive.js
```javascript
export function parseDriveId(url) {
  if (!url) return null
  const s = String(url).trim()

  if (/^[a-zA-Z0-9_-]{20,}$/.test(s) && s.indexOf('/') === -1 && s.indexOf('.') === -1) return s

  try {
    const u = new URL(s)
    const host = u.hostname.replace('www.', '')

    if (host === 'drive.google.com' || host === 'drive.usercontent.google.com') {
      const m = u.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
      if (m) return m[1]
      const id = u.searchParams.get('id')
      if (id) return id
    }
  } catch (e) {}

  return null
}

export function drivePreviewUrl(id) {
  return 'https://drive.google.com/file/d/' + id + '/preview'
}

export function driveThumbUrl(id) {
  return 'https://drive.google.com/thumbnail?id=' + id + '&sz=w1000'
}

export function driveDownloadUrl(id) {
  return 'https://drive.usercontent.google.com/download?id=' + id + '&export=download&confirm=t'
}

export function driveViewUrl(id) {
  return 'https://drive.google.com/file/d/' + id + '/view'
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

## File: .gitignore
```
node_modules
dist
.env.local
.env
*.log
.env.youtube-*
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
    <ThemeContext.Provider value={{ dark: dark, toggle: function () {
const ganti = function () { setDark(function (d) { return !d }) }
if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const akar = document.documentElement
  const vt = document.startViewTransition(function () {
    akar.classList.add('vt-tema')
    ganti()
  })
  const lepas = function () { akar.classList.remove('vt-tema') }
  vt.finished.then(lepas, lepas)
  setTimeout(lepas, 600)
} else ganti()
} }}>
      {props.children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
```

## File: index.html
```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="index, follow" />
    <meta name="description" content="Portal logbook, galeri, dan daftar hadir mahasiswa magang Bank Syariah Indonesia. Catatan kegiatan harian, dokumentasi media, dan monitoring kehadiran tim magang dalam satu portal." />
    <meta name="theme-color" content="#16623c" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Logbook Magang BSI" />
    <meta property="og:description" content="Portal logbook, galeri, dan daftar hadir mahasiswa magang Bank Syariah Indonesia." />
    <meta property="og:locale" content="id_ID" />
    <link rel="preconnect" href="https://i.ytimg.com" crossorigin />
    <link rel="preconnect" href="https://drive.google.com" crossorigin />
    <link rel="dns-prefetch" href="https://drive.usercontent.google.com" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2064%2064'%3E%3Crect%20width='64'%20height='64'%20rx='14'%20fill='%2316623c'/%3E%3Ctext%20x='32'%20y='44'%20font-size='34'%20font-weight='700'%20text-anchor='middle'%20fill='%23ffffff'%20font-family='Arial,%20sans-serif'%3EB%3C/text%3E%3C/svg%3E" />
    <title>Logbook Magang BSI</title>
      <script type="application/ld+json">
    {"@context":"https://schema.org","@type":"WebSite","name":"Logbook Magang BSI","alternateName":"Portal Logbook Magang Bank Syariah Indonesia","description":"Portal logbook, galeri, dan daftar hadir mahasiswa magang Bank Syariah Indonesia.","inLanguage":"id-ID"}
    </script>
  </head>
  <body class="bg-slate-50 text-slate-800 min-h-screen antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
      <noscript>
      <div style="max-width:640px;margin:48px auto;padding:24px;font-family:sans-serif;line-height:1.6">
        <h1>Logbook Magang BSI</h1>
        <p>Portal logbook, galeri, dan daftar hadir mahasiswa magang Bank Syariah Indonesia. Aktifkan JavaScript untuk menggunakan portal ini secara penuh.</p>
        <ul>
          <li><a href="/logbook">Logbook publik</a></li>
          <li><a href="/galeri">Galeri dokumentasi</a></li>
          <li><a href="/absen">Daftar hadir tim</a></li>
          <li><a href="/dospem">Ringkasan untuk dosen pembimbing dan kaprodi</a></li>
        </ul>
      </div>
    </noscript>
  </body>
</html>
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

## File: src/components/PemutarVideo.jsx
```javascript
import { useEffect, useRef, useState } from 'react'

let janjiApi = null
function muatApiYouTube() {
  if (janjiApi) return janjiApi
  janjiApi = new Promise(function (resolve) {
    if (window.YT && window.YT.Player) { resolve(window.YT); return }
    const lama = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = function () {
      if (lama) lama()
      resolve(window.YT)
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.async = true
    document.head.appendChild(tag)
  })
  return janjiApi
}

function formatWaktu(detik) {
  const d = isFinite(detik) && detik > 0 ? detik : 0
  const m = Math.floor(d / 60)
  const s = Math.floor(d % 60)
  return m + ':' + (s < 10 ? '0' : '') + s
}

function paksaKualitas(p) {
  try { if (p && typeof p.setPlaybackQualityRange === 'function') p.setPlaybackQualityRange('720', '1080') } catch (e) {}
}
function matikanSubtitel(p) {
  try { if (p && typeof p.unloadModule === 'function') p.unloadModule('captions') } catch (e) {}
  try { if (p && typeof p.setOption === 'function') p.setOption('captions', 'track', {}) } catch (e) {}
}

function IkonPlay({ className }) { return <svg viewBox="0 0 24 24" fill="currentColor" className={className || 'h-5 w-5'}><path d="M8 5v14l11-7z" /></svg> }
function IkonPause({ className }) { return <svg viewBox="0 0 24 24" fill="currentColor" className={className || 'h-5 w-5'}><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg> }
function IkonSuara() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  )
}
function IkonBisu() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
    </svg>
  )
}
function IkonPenuh() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg> }
function IkonKecil() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></svg> }
function IkonUlang() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg> }

export default function PemutarVideo(props) {
  const youtubeId = props.youtubeId
  const [dimulai, setDimulai] = useState(false)
  const [memutar, setMemutar] = useState(false)
  const [buffer, setBuffer] = useState(false)
  const [selesai, setSelesai] = useState(false)
  const [gagal, setGagal] = useState(false)
  const [waktu, setWaktu] = useState(0)
  const [durasi, setDurasi] = useState(0)
  const [volume, setVolume] = useState(100)
  const [bisu, setBisu] = useState(false)
  const [penuh, setPenuh] = useState(false)
  const [sembunyi, setSembunyi] = useState(false)
  const [thumbPakaiHq, setThumbPakaiHq] = useState(false)
  const kotakRef = useRef(null)
  const wadahRef = useRef(null)
  const playerRef = useRef(null)
  const timerSembunyi = useRef(null)

  useEffect(function () {
    const iv = setInterval(function () {
      const p = playerRef.current
      if (p && p.getCurrentTime) {
        setWaktu(p.getCurrentTime() || 0)
        const d = p.getDuration ? p.getDuration() : 0
        if (d) setDurasi(d)
      }
    }, 250)
    return function () { clearInterval(iv) }
  }, [])

  useEffect(function () {
    function saatPenuh() { setPenuh(Boolean(document.fullscreenElement)) }
    document.addEventListener('fullscreenchange', saatPenuh)
    return function () {
      document.removeEventListener('fullscreenchange', saatPenuh)
      if (timerSembunyi.current) clearTimeout(timerSembunyi.current)
      if (playerRef.current && playerRef.current.destroy) {
        try { playerRef.current.destroy() } catch (e) {}
        playerRef.current = null
      }
    }
  }, [])

  function sedangMain() {
    const p = playerRef.current
    return Boolean(p && p.getPlayerState && window.YT && p.getPlayerState() === window.YT.PlayerState.PLAYING)
  }

  function resetTimerSembunyi() {
    if (!dimulai) return
    if (timerSembunyi.current) clearTimeout(timerSembunyi.current)
    setSembunyi(false)
    if (sedangMain()) {
      timerSembunyi.current = setTimeout(function () { setSembunyi(true) }, 2500)
    }
  }

  async function mulai() {
    setDimulai(true)
    setGagal(false)
    try {
      const YT = await muatApiYouTube()
      if (!wadahRef.current) return
      playerRef.current = new YT.Player(wadahRef.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1, controls: 0, modestbranding: 1, rel: 0, fs: 0,
          disablekb: 1, iv_load_policy: 3, playsinline: 1, autohide: 1,
          showinfo: 0, cc_load_policy: 0, origin: window.location.origin
        },
        events: {
          onReady: function (e) {
            setDurasi(e.target.getDuration() || 0)
            paksaKualitas(e.target)
            matikanSubtitel(e.target)
            e.target.playVideo()
          },
          onStateChange: function (e) {
            const S = window.YT.PlayerState
            if (e.data === S.PLAYING) {
              setMemutar(true); setBuffer(false); setSelesai(false)
              paksaKualitas(e.target); matikanSubtitel(e.target)
              resetTimerSembunyi()
            } else if (e.data === S.PAUSED) {
              setMemutar(false); setBuffer(false); setSembunyi(false)
            } else if (e.data === S.BUFFERING) {
              setBuffer(true)
            } else if (e.data === S.ENDED) {
              setMemutar(false); setSelesai(true); setSembunyi(false)
            }
          },
          onError: function () { setGagal(true); setBuffer(false); setMemutar(false) }
        }
      })
    } catch (e) {
      setGagal(true)
    }
  }

  function jungkir() {
    const p = playerRef.current
    if (!p) return
    if (sedangMain()) p.pauseVideo()
    else p.playVideo()
  }

  function geser(ev) {
    const p = playerRef.current
    if (!p || !durasi) return
    const nilai = Number(ev.target.value)
    p.seekTo((nilai / 100) * durasi, true)
    setWaktu((nilai / 100) * durasi)
  }

  function aturVolume(ev) {
    const p = playerRef.current
    const nilai = Number(ev.target.value)
    setVolume(nilai)
    if (!p) return
    p.setVolume(nilai)
    if (nilai === 0) { p.mute(); setBisu(true) }
    else if (bisu) { p.unMute(); setBisu(false) }
  }

  function aturBisu() {
    const p = playerRef.current
    if (!p) return
    if (bisu) { p.unMute(); p.setVolume(volume || 100); setBisu(false) }
    else { p.mute(); setBisu(true) }
  }

  function aturPenuh() {
    const el = kotakRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else if (el.requestFullscreen) el.requestFullscreen()
  }

  const thumb = thumbPakaiHq
    ? 'https://i.ytimg.com/vi/' + youtubeId + '/hqdefault.jpg'
    : 'https://img.youtube.com/vi/' + youtubeId + '/maxresdefault.jpg'
  const persen = durasi ? Math.min(100, (waktu / durasi) * 100) : 0
  const kontrolSembunyi = dimulai && !gagal && sembunyi

  return (
    <div
      ref={kotakRef}
      className={'pemutar-referensi group relative overflow-hidden rounded-2xl bg-black shadow-xl ' + (props.className || 'aspect-video w-full')}
      style={{ cursor: kontrolSembunyi ? 'none' : 'default' }}
      onMouseMove={resetTimerSembunyi}
      onMouseLeave={function () { if (sedangMain()) { if (timerSembunyi.current) clearTimeout(timerSembunyi.current); setSembunyi(true) } }}
    >
      {/* Wadah player: setelah diisi YouTube, iframe diposisikan CSS dengan margin crop 70px */}
      <div ref={wadahRef} className="h-full w-full" />

      {/* Perisai penangkap klik */}
      {dimulai && !selesai && !gagal ? (
        <button type="button" aria-label="Putar atau jeda video" onClick={jungkir}
          className="absolute inset-0 z-10 h-full w-full bg-transparent" style={{ cursor: kontrolSembunyi ? 'none' : 'default' }} />
      ) : null}

      {/* Poster awal dengan tombol putar minimalis */}
      {!dimulai ? (
        <div className="absolute inset-0 z-20">
          <img src={thumb} alt={props.title || 'Pratinjau video'} onError={function () { setThumbPakaiHq(true) }}
            className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute inset-0 grid place-items-center">
            <button type="button" onClick={mulai} title="Putar video"
              className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition hover:scale-110 hover:border-bsi-500 hover:bg-bsi-600">
              <IkonPlay className="ml-0.5 h-5 w-5" />
            </button>
          </div>
          {props.title ? <p className="absolute bottom-3 left-4 right-4 truncate text-sm font-semibold text-white drop-shadow-md">{props.title}</p> : null}
        </div>
      ) : null}

      {/* Layar akhir dengan putar ulang */}
      {selesai ? (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/85 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <button type="button" title="Putar ulang"
              onClick={function () { const p = playerRef.current; if (p) { p.seekTo(0, true); p.playVideo() } setSelesai(false) }}
              className="grid h-14 w-14 place-items-center rounded-full bg-gold-500 text-slate-900 shadow-lg transition hover:scale-105">
              <IkonUlang />
            </button>
            <p className="text-xs font-semibold text-slate-200">Putar ulang</p>
          </div>
        </div>
      ) : null}

      {/* Layar gagal */}
      {gagal ? (
        <div className="absolute inset-0 z-30 grid place-items-center bg-black/90">
          <div className="flex flex-col items-center gap-2 px-6 text-center">
            <p className="text-sm font-semibold text-slate-200">Video tidak dapat dimuat</p>
            <p className="text-xs text-slate-300">Periksa koneksi atau ketersediaan video di saluran.</p>
          </div>
        </div>
      ) : null}

      {/* Panel kontrol overlay di atas video */}
      {dimulai && !gagal ? (
        <div className={'absolute inset-x-0 bottom-0 z-30 flex items-center gap-2 sm:gap-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 sm:px-4 pb-3 pt-10 transition-opacity duration-300 ' + (kontrolSembunyi ? 'pointer-events-none opacity-0' : 'opacity-100')}>
          <button type="button" onClick={jungkir} title={memutar ? 'Jeda' : 'Putar'}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-bsi-700 text-white transition hover:bg-bsi-600">
            {memutar ? <IkonPause className="h-4 w-4" /> : <IkonPlay className="ml-0.5 h-4 w-4" />}
          </button>
          <input type="range" min="0" max="100" step="0.1" value={persen} onChange={geser} title="Geser durasi"
            className="pemutar-progress h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none"
            style={{ background: 'linear-gradient(to right, #166534 0%, #166534 ' + persen + '%, rgba(255,255,255,0.25) ' + persen + '%, rgba(255,255,255,0.25) 100%)' }} />
          <span className="min-w-[64px] sm:min-w-[84px] shrink-0 text-center text-[10px] sm:text-[11px] font-semibold tabular-nums text-slate-200">{formatWaktu(waktu)} / {formatWaktu(durasi)}</span>
          <button type="button" onClick={aturBisu} title={bisu ? 'Nyalakan suara' : 'Bisukan'}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
            {bisu ? <IkonBisu /> : <IkonSuara />}
          </button>
          <input type="range" min="0" max="100" value={bisu ? 0 : volume} onChange={aturVolume} title="Volume"
            className="pemutar-volume hidden sm:block h-1 w-16 shrink-0 cursor-pointer appearance-none rounded-full outline-none"
            style={{ background: 'linear-gradient(to right, #eab308 0%, #eab308 ' + (bisu ? 0 : volume) + '%, rgba(255,255,255,0.25) ' + (bisu ? 0 : volume) + '%, rgba(255,255,255,0.25) 100%)' }} />
          {buffer ? <span className="inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" /> : null}
          <button type="button" onClick={aturPenuh} title={penuh ? 'Keluar layar penuh' : 'Layar penuh'}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
            {penuh ? <IkonKecil /> : <IkonPenuh />}
          </button>
        </div>
      ) : null}
    </div>
  )
}
```

## File: src/components/Skeleton.jsx
```javascript
export function SkeletonLogbookCard() {
  return (
    <div className="card-hover flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="skeleton aspect-video w-full rounded-2xl"></div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="skeleton h-6 w-24 rounded-full"></div>
        <div className="skeleton h-6 w-20 rounded-full"></div>
        <div className="skeleton ml-auto h-6 w-20 rounded-full"></div>
      </div>
      <div className="skeleton h-4 w-36 rounded-full"></div>
      <div className="skeleton h-6 w-40 rounded-full"></div>
      <div className="skeleton h-4 w-32 rounded-full"></div>
      <div className="skeleton h-3 w-24 rounded-full"></div>
      <div className="mt-auto flex items-center gap-3 border-t border-slate-100 pt-4">
        <div className="skeleton h-10 w-10" style={{ borderRadius: 'radius' }}></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-36 rounded-full"></div>
          <div className="skeleton h-3 w-24 rounded-full"></div>
        </div>
        <div className="skeleton h-9 w-20 rounded-2xl"></div>
      </div>
    </div>
  )
}

export function SkeletonGalleryCard() {
  return (
    <div className="card-hover flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="skeleton aspect-video w-full rounded-2xl"></div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="skeleton h-6 w-24 rounded-full"></div>
        <div className="skeleton ml-auto h-6 w-20 rounded-full"></div>
      </div>
      <div className="skeleton h-4 w-36 rounded-full"></div>
      <div className="skeleton h-6 w-44 rounded-full"></div>
      <div className="mt-auto flex items-center gap-3 border-t border-slate-100 pt-4">
        <div className="skeleton h-10 w-10" style={{ borderRadius: 'radius' }}></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-36 rounded-full"></div>
          <div className="skeleton h-3 w-24 rounded-full"></div>
        </div>
        <div className="skeleton h-9 w-20 rounded-2xl"></div>
      </div>
    </div>
  )
}

export function SkeletonAttendanceCard() {
  return (
    <div className="card-hover flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="skeleton h-6 w-20 rounded-full"></div>
        <div className="skeleton h-4 w-32 rounded-full"></div>
      </div>
      <div className="skeleton h-5 w-28 rounded-full"></div>
      <div className="skeleton h-4 w-full rounded-full"></div>
      <div className="mt-auto flex items-center gap-3 border-t border-slate-100 pt-4">
        <div className="skeleton h-10 w-10" style={{ borderRadius: 'radius' }}></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-36 rounded-full"></div>
          <div className="skeleton h-3 w-24 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonPersonCard() {
  return (
    <div className="card-hover flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="skeleton h-14 w-14" style={{ borderRadius: 'radius' }}></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-5 w-40 rounded-full"></div>
          <div className="skeleton h-3 w-24 rounded-full"></div>
          <div className="skeleton h-5 w-28 rounded-full"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="skeleton h-16 rounded-2xl"></div>
        <div className="skeleton h-16 rounded-2xl"></div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="skeleton h-12 rounded-xl"></div>
        <div className="skeleton h-12 rounded-xl"></div>
        <div className="skeleton h-12 rounded-xl"></div>
      </div>
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="skeleton h-14 w-14" style={{ borderRadius: 'radius' }}></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-44 rounded-full"></div>
          <div className="skeleton h-3 w-28 rounded-full"></div>
        </div>
        <div className="skeleton h-10 w-28 rounded-2xl"></div>
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="skeleton h-5 w-36 rounded-full"></div>
          <div className="skeleton h-10 w-full rounded-2xl"></div>
          <div className="skeleton h-10 w-full rounded-2xl"></div>
          <div className="skeleton h-20 w-full rounded-2xl"></div>
          <div className="skeleton h-11 w-44 rounded-2xl"></div>
        </div>
        <div className="space-y-5">
          <div className="skeleton h-6 w-32 rounded-full"></div>
          <div className="grid gap-5 md:grid-cols-2">
            <SkeletonLogbookCard />
            <SkeletonLogbookCard />
            <SkeletonLogbookCard />
            <SkeletonLogbookCard />
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-3 sm:p-6">
      <div className="skeleton h-3 w-3/4 sm:h-4 sm:w-28"></div>
      <div className="skeleton h-6 w-1/2 mt-1 sm:h-9 sm:w-16 sm:mt-3"></div>
      <div className="skeleton h-3 w-36 mt-2 hidden sm:block"></div>
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
export function waktuUrut(x) {
  if (!x) return 0
  const src = x.created_at || x.updated_at || ''
  if (!src) return 0
  const t = new Date(src).getTime()
  return isNaN(t) ? 0 : t
}
export function urutkanTanggal(list, mode) {
  const arr = (list || []).slice()
  arr.sort(function (a, b) {
    const ta = new Date(a.tanggal + 'T00:00:00').getTime()
    const tb = new Date(b.tanggal + 'T00:00:00').getTime()
    if (ta !== tb) return mode === 'terlama' ? ta - tb : tb - ta
    const ca = waktuUrut(a)
    const cb = waktuUrut(b)
    if (ca !== cb) return mode === 'terlama' ? ca - cb : cb - ca
    const ia = a.id || ''
    const ib = b.id || ''
    if (ia !== ib) return ia < ib ? (mode === 'terlama' ? -1 : 1) : (mode === 'terlama' ? 1 : -1)
    return 0
  })
  return arr
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

/* foto-profil-webp: pipeline konversi foto profil, pola sama dengan alur media R2 */
function muatGambarProfil(sumber) {
  return new Promise(function (resolve, reject) {
    const url = URL.createObjectURL(sumber)
    const img = new Image()
    img.onload = function () { resolve({ img: img, url: url }) }
    img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Gambar tidak dapat dibaca')) }
    img.src = url
  })
}

export async function siapkanFotoProfil(file, maksSisi, kualitas) {
  const sisi = maksSisi || 640
  const mutu = kualitas || 0.85
  let kerja = file
  const tipe = String(file.type || '').toLowerCase()
  if (tipe.indexOf('heic') !== -1 || tipe.indexOf('heif') !== -1) {
    const mod = await import('heic2any')
    const heicFn = mod.default || mod
    const blob = await heicFn({ blob: file, toType: 'image/jpeg', quality: 0.92 })
    kerja = new File([Array.isArray(blob) ? blob[0] : blob], (file.name || 'foto').replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' })
  }
  const muat = await muatGambarProfil(kerja)
  try {
    const rasio = Math.min(1, sisi / Math.max(muat.img.width, muat.img.height))
    const w = Math.max(1, Math.round(muat.img.width * rasio))
    const h = Math.max(1, Math.round(muat.img.height * rasio))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(muat.img, 0, 0, w, h)
    const blob = await new Promise(function (resolve) { canvas.toBlob(resolve, 'image/webp', mutu) })
    if (!blob) throw new Error('Gagal mengonversi foto ke WebP')
    return new File([blob], 'profil-' + Date.now() + '.webp', { type: 'image/webp' })
  } finally {
    URL.revokeObjectURL(muat.url)
  }
}
```

## File: src/components/controls.jsx
```javascript
import { SelubungPanel } from './ui.jsx'
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
        {props.icon ? <span className="shrink-0 text-slate-600">{props.icon}</span> : null}
        <span className={'flex-1 truncate ' + (current ? 'text-slate-800' : 'text-slate-600')}>
          {current ? current.label : (props.placeholder || 'Pilih')}
        </span>
        <span className={'shrink-0 text-slate-600 transition-transform duration-200 ' + (open ? 'rotate-180' : '')}>{ICONS.chevron}</span>
      </button>
      <SelubungPanel open={open}>
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
</SelubungPanel>
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
        <span className="shrink-0 text-slate-600">{ICONS.calendar}</span>
        <span className={'flex-1 truncate ' + (props.value ? 'text-slate-800' : 'text-slate-600')}>
          {label || (mode === 'month' ? 'Pilih bulan' : 'Pilih tanggal')}
        </span>
        <span className={'shrink-0 text-slate-600 transition-transform duration-200 ' + (open ? 'rotate-180' : '')}>{ICONS.chevron}</span>
      </button>
      <SelubungPanel open={open}>
<div className="anim-modal absolute z-30 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <button type="button" onClick={function () { shift(-1) }} className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-slate-100">&#8249;</button>
            <p className="text-sm font-bold text-slate-800">
              {mode === 'month' ? String(view.y) : BULAN_NAMA[view.m] + ' ' + view.y}
            </p>
            <button type="button" onClick={function () { shift(1) }} className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-slate-100">&#8250;</button>
          </div>

          {mode === 'date' ? (
            <div className="mt-3 grid grid-cols-7 gap-1 text-center">
              {HARI_NAMA.map(function (h) {
                return <span key={h} className="py-1 text-[11px] font-semibold text-slate-600">{h}</span>
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
            <button type="button" onClick={function () { props.onChange(''); setOpen(false) }} className="text-sm font-semibold text-slate-600 hover:text-red-600">Hapus</button>
            <button type="button" onClick={pickToday} className="text-sm font-semibold text-bsi-700 hover:text-bsi-900">Hari ini</button>
          </div>
        </div>
</SelubungPanel>
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
          <span className={'block truncate text-sm font-semibold ' + (props.fileName ? 'text-slate-800' : 'text-slate-600')}>
            {props.fileName || props.label || 'Klik untuk pilih foto atau video'}
          </span>
          <span className="block text-xs text-slate-600">{props.hint || 'Foto JPG, PNG, atau HEIC otomatis dikonversi. Video maks 50 MB.'}</span>
        </span>
        {props.fileName ? <span className="shrink-0 text-xs font-semibold text-bsi-700">Ganti</span> : null}
      </button>
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
          media_thumb: item.media_thumb || null,
        media_source: item.media_source || 'r2', youtube_id: item.youtube_id || null }).eq('id', existing.get(item.id))
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
          media_thumb: item.media_thumb || null,
        media_source: item.media_source || 'r2', youtube_id: item.youtube_id || null })
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

  // Bungkus middlewares agar bisa dipakai di dev dan preview
  const setupMiddlewares = (server) => {
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

  return {
    name: 'api-r2-dev',
    configureServer: setupMiddlewares,
    configurePreviewServer: setupMiddlewares
  }
}

function pluginApiYoutube(env) {
  const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  const LIMIT_PER_PROJECT = 5
  
  function ptToday() {
    const now = new Date()
    const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
    const y = pt.getFullYear()
    const m = String(pt.getMonth() + 1).padStart(2, '0')
    const d = String(pt.getDate()).padStart(2, '0')
    return y + '-' + m + '-' + d
  }
  
  function daftarKredensial() {
    const list = []
    for (let n = 1; n <= 6; n++) {
      const id = env['YOUTUBE_CLIENT_ID_' + n]
      const secret = env['YOUTUBE_CLIENT_SECRET_' + n]
      const refresh = env['YOUTUBE_REFRESH_TOKEN_' + n]
      if (id && secret && refresh) list.push({ n: n, id: id, secret: secret, refresh: refresh })
    }
    if (!list.length && env.YOUTUBE_CLIENT_ID && env.YOUTUBE_CLIENT_SECRET && env.YOUTUBE_REFRESH_TOKEN) {
      list.push({ n: 1, id: env.YOUTUBE_CLIENT_ID, secret: env.YOUTUBE_CLIENT_SECRET, refresh: env.YOUTUBE_REFRESH_TOKEN })
    }
    return list
  }
  
  const cacheToken = {}
  async function getAccessToken(kred) {
    const now = Date.now()
    const c = cacheToken[kred.n]
    if (c && c.expire > now + 60000) return c.token
    const params = new URLSearchParams()
    params.set('client_id', kred.id)
    params.set('client_secret', kred.secret)
    params.set('refresh_token', kred.refresh)
    params.set('grant_type', 'refresh_token')
    const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
    if (!r.ok) throw new Error('refresh token project ' + kred.n + ' gagal (status ' + r.status + ')')
    const j = await r.json()
    cacheToken[kred.n] = { token: j.access_token, expire: now + (j.expires_in || 3600) * 1000 }
    return j.access_token
  }
  
  async function cekSesi(req) {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) return null
    const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
    const r = await supabase.auth.getUser(token)
    return r.error ? null : r.data.user
  }
  
  function kirim(res, code, obj) {
    res.statusCode = code
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(obj))
  }

  // Bungkus middlewares agar bisa dipakai di dev dan preview
  const setupMiddlewares = (server) => {
    server.middlewares.use('/api/youtube/quota', async function (req, res) {
      const today = ptToday()
      const kredensial = daftarKredensial()
      if (!kredensial.length) { kirim(res, 500, { error: 'Kredensial YouTube belum dikonfigurasi' }); return }
      let usedTotal = 0
      const perProject = []
      for (const kred of kredensial) {
        const hit = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today).eq('project_id', kred.n)
        const used = hit.count || 0
        usedTotal += used
        perProject.push({ project: kred.n, used: used, remaining: Math.max(0, LIMIT_PER_PROJECT - used) })
      }
      const limit = kredensial.length * LIMIT_PER_PROJECT
      res.setHeader('Cache-Control', 'no-store')
      kirim(res, 200, { limit: limit, used: usedTotal, remaining: Math.max(0, limit - usedTotal), perProject: perProject, ptDate: today })
    })

    server.middlewares.use('/api/youtube/session', async function (req, res) {
      if (req.method !== 'POST') { kirim(res, 405, { error: 'Method tidak diizinkan' }); return }
      const user = await cekSesi(req)
      if (!user) { kirim(res, 401, { error: 'Sesi tidak valid' }); return }
      const today = ptToday()
      const kredensial = daftarKredensial()
      if (!kredensial.length) { kirim(res, 500, { error: 'Kredensial YouTube belum dikonfigurasi' }); return }
      const body = await bacaBody(req)
      if (!body.title) { kirim(res, 400, { error: 'Judul video wajib diisi' }); return }
      let terakhir = ''
      for (const kred of kredensial) {
        const hit = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today).eq('project_id', kred.n)
        if ((hit.count || 0) >= LIMIT_PER_PROJECT) { terakhir = 'project ' + kred.n + ' sudah penuh'; continue }
        let access
        try { access = await getAccessToken(kred) } catch (e) { terakhir = e.message; continue }
        const meta = {
          snippet: { title: String(body.title).slice(0, 100), description: String(body.description || '').slice(0, 4000), tags: ['logbook-magang-bsi'], categoryId: '22' },
          status: { privacyStatus: 'unlisted', embeddable: true, publicStatsViewable: false }
        }
        const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + access, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': body.contentType || 'video/mp4' },
          body: JSON.stringify(meta)
        })
        if (!init.ok) { terakhir = 'project ' + kred.n + ' ditolak Google (status ' + init.status + ')'; continue }
        const sessionUri = init.headers.get('location')
        if (!sessionUri) { terakhir = 'project ' + kred.n + ' tanpa lokasi upload'; continue }
        await admin.from('youtube_quota_usage').insert({ pt_date: today, user_id: user.id, project_id: kred.n })
        kirim(res, 200, { sessionUri: sessionUri, project: kred.n })
        return
      }
      kirim(res, 429, { error: 'Kuota harian semua project video sudah habis. Coba lagi besok atau gunakan link video eksternal.', detail: terakhir })
    })

    server.middlewares.use('/api/youtube/latest', async function (req, res) {
      if (req.method !== 'POST') { kirim(res, 405, { error: 'Method tidak diizinkan' }); return }
      const user = await cekSesi(req)
      if (!user) { kirim(res, 401, { error: 'Sesi tidak valid' }); return }
      const kredensial = daftarKredensial()
      if (!kredensial.length) { kirim(res, 500, { error: 'Kredensial YouTube belum dikonfigurasi' }); return }
      let terakhir = ''
      for (const kred of kredensial) {
        let access
        try { access = await getAccessToken(kred) } catch (e) { terakhir = e.message; continue }
        const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&order=date&maxResults=5', { headers: { Authorization: 'Bearer ' + access } })
        if (!r.ok) { terakhir = 'project ' + kred.n + ' status ' + r.status; continue }
        const j = await r.json()
        const items = j.items || []
        const batas = Date.now() - 15 * 60 * 1000
        const cocok = items.find(function (it) {
          const t = Date.parse(it.snippet && it.snippet.publishedAt ? it.snippet.publishedAt : '')
          return isNaN(t) ? false : t >= batas
        })
        if (!cocok) { kirim(res, 404, { error: 'Video terbaru tidak ditemukan' }); return }
        kirim(res, 200, { videoId: cocok.id && cocok.id.videoId, project: kred.n })
        return
      }
      kirim(res, 502, { error: 'Gagal memeriksa video terbaru: ' + terakhir })
    })
  }

  return {
    name: 'api-youtube-dev',
    configureServer: setupMiddlewares,
    configurePreviewServer: setupMiddlewares
  }
}

export default defineConfig(function ({ mode }) {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), pluginApiR2(env), pluginApiYoutube(env)],
    
    // Konfigurasi agar bisa diakses lewat Network / IP lokal
    server: {
      host: true
    },
    preview: {
      host: true
    },
    
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-aws': ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner'],
            'vendor-media': ['heic2any']
          }
        }
      }
    }
  }
})
```

## File: src/components/Carousel.jsx
```javascript
import { useEffect, useRef, useState } from 'react'
import { SizedIcon } from './icons.jsx'
import { Lightbox, SmartFit, MediaDrive } from './ui.jsx'

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
          {s.drive ? (
            <MediaDrive driveId={s.drive} alt={s.title || 'Media'} onClick={function () { setZoom(s) }} className="absolute inset-0 h-full w-full object-cover cursor-zoom-in" />
          ) : (
            <SmartFit src={s.src} full={s.full} type={s.type} alt={s.title || 'Media'} onClick={function () { setZoom(s) }} />
          )}
          <button type="button" title="Perbesar media" onClick={function () { setZoom(s) }}
            className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white transition-opacity hover:bg-black/70 opacity-100 xl:opacity-0 xl:group-hover:opacity-100">
            <SizedIcon name="expand" size={15} />
          </button>
        </div>
        {zoom ? <Lightbox src={zoom.full || zoom.src} type={zoom.type} title={zoom.title} youtubeId={zoom.yt || null} driveId={zoom.drive || null} onClose={function () { setZoom(null) }} /> : null}
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
                {s.drive ? (
                  <MediaDrive driveId={s.drive} alt={s.title || 'Media'} onClick={function () { if (moved.current) { moved.current = false; return } setZoom(s) }} className="absolute inset-0 h-full w-full object-cover cursor-zoom-in" />
                ) : (
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
                )}
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
          className="absolute left-2 top-0 bottom-0 my-auto z-10 h-8 w-8 rounded-full bg-black/40 text-white grid place-items-center opacity-100 xl:opacity-0 xl:group-hover:opacity-100 hover:bg-black/60"
        >
          &#8249;
        </button>
        <button
          onClick={function () { setIdx(function (i) { return (i + 1) % slides.length }) }}
          className="absolute right-2 top-0 bottom-0 my-auto z-10 h-8 w-8 rounded-full bg-black/40 text-white grid place-items-center opacity-100 xl:opacity-0 xl:group-hover:opacity-100 hover:bg-black/60"
        >
          &#8250;
        </button>
        <div className="absolute bottom-2 right-2 z-10 flex gap-1.5">
          {slides.map(function (s, i) {
            return (
              <button
                key={i}
                onClick={function () { setIdx(i) }} aria-label={'Ke slide ' + (i + 1)}
                className={'carousel-dot h-2 w-2 rounded-full transition-all ' + (i === idx ? 'bg-white' : 'bg-white/40')}
              />
            )
          })}
        </div>
      </div>
      {zoom ? <Lightbox src={zoom.full || zoom.src} type={zoom.type} title={zoom.title} youtubeId={zoom.yt || null} driveId={zoom.drive || null} onClose={function () { setZoom(null) }} /> : null}
    </>
  )
}
```

## File: src/components/FilterBar.jsx
```javascript
import { useEffect, useState } from 'react'
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
        ? <div key="bulan" className="anim-ganti-bulan flex flex-wrap items-center gap-2">
<FilterDate mode="month" value={f.bulan} onChange={function (v) { set(Object.assign({}, f, { bulan: v })) }} />
</div>
        : <div key="rentang" className="anim-ganti-rentang flex flex-wrap items-center gap-2">
            <FilterDate value={f.dari} onChange={function (v) { set(Object.assign({}, f, { dari: v })) }} />
            <span className="text-slate-600 text-sm">sampai</span>
            <FilterDate value={f.sampai} onChange={function (v) { set(Object.assign({}, f, { sampai: v })) }} />
          </div>}
    </div>
  )
}

export function FilterBar(props) {
  const [settled, setSettled] = useState(false)
  useEffect(function () {
    if (props.open) {
      const t = setTimeout(function () { setSettled(true) }, 400)
      return function () { clearTimeout(t) }
    }
    setSettled(false)
    return undefined
  }, [props.open])
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
          <span className={'transition-transform duration-200 text-slate-600 ' + (props.open ? 'rotate-180' : '')}>{ICONS.chevron}</span>
        </button>
        <div className="hidden xl:block text-sm text-slate-600">
          {props.activeCount > 0
            ? <span className="inline-flex items-center gap-2"><span className="text-bsi-700">{ICONS.funnel}</span><span><strong className="text-slate-900">{props.activeCount}</strong> filter aktif</span></span>
            : <span className="inline-flex items-center gap-2"><span className="text-slate-600">{ICONS.funnel}</span><span>Belum ada filter aktif</span></span>}
        </div>
      </div>
            <div className={'filter-wrap' + (props.open ? ' filter-wrap-buka' : '')}>
        <div className={'filter-dalam' + (props.open && settled ? ' filter-dalam-santai' : '')}>
          <div className="filter-isi flex flex-wrap items-center gap-3">
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

## File: src/App.jsx
```javascript
import { SkeletonDashboard } from './components/Skeleton.jsx'
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ThemeProvider } from './lib/theme.jsx'
 import { ToastProvider } from './components/ui.jsx'
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

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(function () {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])
  return null
}
function RequireAuth(props) {
  const { mahasiswa, loading } = useAuth()
  if (loading) return <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:py-8"><SkeletonDashboard /></div>
  if (!mahasiswa) return <Navigate to="/login" replace />
  return props.children
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/logbook" element={<LogbookPage />} />
            <Route path="/galeri" element={<GalleryPage />} />
            <Route path="/absen" element={<AttendancePage />} />
            <Route path="/dospem" element={<DospemPage />} />
            <Route path="/tim" element={<Navigate to="/dospem" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  )
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

/* ===== Indikator scrollbar auto hide, overlay tanpa menggeser layout ===== */
;(function () {
  if (typeof document === 'undefined') return
  function pasang() {
    if (document.getElementById('scroll-indicator')) return
    const track = document.createElement('div')
    track.id = 'scroll-indicator'
    const thumb = document.createElement('div')
    thumb.id = 'scroll-thumb'
    track.appendChild(thumb)
    document.body.appendChild(track)
    let timer = null
    let sumber = null
    let watchdog = null
    function stopWatchdog() {
      if (watchdog) { clearInterval(watchdog); watchdog = null }
    }
    function mulaiWatchdog() {
      if (watchdog) return
      watchdog = setInterval(function () {
        if (!track.classList.contains('aktif')) { stopWatchdog(); return }
        if (sumber) {
          if (!sumber.isConnected || sumber.scrollHeight - sumber.clientHeight <= 4) {
            sembunyikan()
            sumber = null
            stopWatchdog()
          }
        } else if (document.documentElement.scrollHeight - window.innerHeight <= 4) {
          sembunyikan()
          stopWatchdog()
        }
      }, 90)
    }
    function sembunyikan() { track.classList.remove('aktif'); stopWatchdog() }
    function tampilkan() {
      track.classList.add('aktif')
      if (timer) clearTimeout(timer)
      timer = setTimeout(sembunyikan, 400)
      mulaiWatchdog()
    }
    function ukur(el, adalahWindow, rect) {
      const scrollTop = adalahWindow ? (window.scrollY || document.documentElement.scrollTop) : el.scrollTop
      const scrollHeight = adalahWindow ? document.documentElement.scrollHeight : el.scrollHeight
      const clientHeight = adalahWindow ? window.innerHeight : el.clientHeight
      const selisih = scrollHeight - clientHeight
      if (selisih <= 4) { sembunyikan(); return }
      const ratio = clientHeight / scrollHeight
      const trackTinggi = rect.height - 6
      const thumbTinggi = Math.max(24, trackTinggi * ratio)
      const maxTop = trackTinggi - thumbTinggi
      let gerak = scrollTop / selisih
      if (gerak < 0) gerak = 0
      if (gerak > 1) gerak = 1
      thumb.style.height = thumbTinggi + 'px'
      thumb.style.transform = 'translateY(' + (3 + gerak * maxTop) + 'px)'
      track.style.top = rect.top + 'px'
      track.style.height = rect.height + 'px'
      track.style.right = (window.innerWidth - rect.right + 2) + 'px'
    }
    function onScroll(e) {
      const t = e.target
      if (t === document || t === document.documentElement || t === window || !t || t.nodeType !== 1) {
        sumber = null
        ukur(null, true, { top: 0, height: window.innerHeight, right: window.innerWidth })
      } else {
        sumber = t
        const r = t.getBoundingClientRect()
        ukur(t, false, { top: r.top, height: r.height, right: r.right })
      }
      tampilkan()
    }
    window.addEventListener('scroll', onScroll, true)
    document.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', sembunyikan)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pasang)
  else pasang()
})()

/* ===== Pergeseran mulus isi filter saat mode waktu berganti (bayangan keluar plus FLIP) ===== */
;(function () {
  if (typeof document === 'undefined') return
  function pasang() {
    document.addEventListener('click', function (e) {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const tombol = e.target && e.target.closest ? e.target.closest('.time-toggle button') : null
      if (!tombol) return
      if ((' ' + tombol.className + ' ').indexOf(' active ') !== -1) return
      const toggle = tombol.closest('.time-toggle')
      if (!toggle || !toggle.parentElement) return
      if (window.innerWidth < 1280) return
       const wadah = tombol.closest('.rounded-3xl') || toggle.parentElement.parentElement || toggle.parentElement
      const cabang = toggle.parentElement.querySelector('.anim-ganti-bulan, .anim-ganti-rentang')
      if (cabang) {
        const r = cabang.getBoundingClientRect()
        if (r.width > 0) {
          const hantu = cabang.cloneNode(true)
          hantu.style.position = 'fixed'
          hantu.style.left = r.left + 'px'
          hantu.style.top = r.top + 'px'
          hantu.style.width = r.width + 'px'
          hantu.style.height = r.height + 'px'
          hantu.style.margin = '0'
          hantu.style.zIndex = '45'
          hantu.classList.add('hantu-cabang')
          document.body.appendChild(hantu)
          hantu.style.animation = 'none'
          const turunan = hantu.querySelectorAll('*')
          for (let i = 0; i < turunan.length; i++) turunan[i].style.animation = 'none'
          const keBulan = !tombol.previousElementSibling
          if (hantu.animate) {
            hantu.animate([
              { opacity: 1, transform: 'translateX(0)' },
              { opacity: 0, transform: keBulan ? 'translateX(10px)' : 'translateX(-10px)' }
            ], { duration: 180, easing: 'ease-in' }).onfinish = function () { if (hantu.parentNode) hantu.parentNode.removeChild(hantu) }
          } else {
            setTimeout(function () { if (hantu.parentNode) hantu.parentNode.removeChild(hantu) }, 200)
          }
        }
      }
      const snap = new Map()
      const els = wadah.querySelectorAll('*')
      for (let i = 0; i < els.length; i++) snap.set(els[i], els[i].getBoundingClientRect())
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          snap.forEach(function (rect, el) {
            if (!el.isConnected || !el.animate) return
            const r = el.getBoundingClientRect()
            const dx = rect.left - r.left
            const dy = rect.top - r.top
            if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return
            el.animate([
              { transform: 'translate(' + dx + 'px, ' + dy + 'px)' },
              { transform: 'translate(0, 0)' }
            ], { duration: 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' })
          })
        })
      })
    }, true)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pasang)
  else pasang()
})()

/* ===== transisi-halaman-v1: picu ulang animasi saat pindah rute dan pindah halaman pagination ===== */
;(function () {
  if (typeof document === 'undefined') return
  function ulangAnimasi(el) {
    if (!el) return
    el.style.animation = 'none'
    void el.offsetWidth
    el.style.animation = ''
  }
  function pasang() {
    document.addEventListener('click', function (e) {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const t = e.target
      if (!t || !t.closest) return
      const link = t.closest('a[href]')
      if (link) {
        const href = link.getAttribute('href') || ''
        const eksternal = link.target === '_blank' || href.indexOf('http') === 0 || href.indexOf('#') === 0
        if (!eksternal) {
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              ulangAnimasi(document.querySelector('main.anim-page') || document.querySelector('.anim-page'))
            })
          })
        }
        return
      }
      const pag = t.closest('.mt-8.flex.flex-wrap.items-center.justify-center.gap-2')
      if (pag && t.closest('button')) {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            const grid = document.querySelectorAll('.grid-pusat, .grid-pusat-rapat, .kartu-grid')
            for (let i = 0; i < grid.length; i++) {
              const anak = grid[i].children
              for (let j = 0; j < anak.length; j++) ulangAnimasi(anak[j])
            }
          })
        })
      }
    }, true)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pasang)
  else pasang()
})()

/* ===== transisi-tema: aktifkan transisi pelan hanya pada momen pergantian mode ===== */
;(function () {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const akar = document.documentElement
  let gelap = akar.classList.contains('dark')
  let timer = null
  const obs = new MutationObserver(function () {
    const sekarang = akar.classList.contains('dark')
    if (sekarang === gelap) return
    gelap = sekarang
    if (document.startViewTransition) return
    akar.classList.add('theme-transition')
    if (timer) clearTimeout(timer)
    timer = setTimeout(function () { akar.classList.remove('theme-transition') }, 400)
  })
  obs.observe(akar, { attributes: true, attributeFilter: ['class'] })
})()
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

## File: src/pages/LoginPage.jsx
```javascript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginWithNim } from '../lib/auth.js'
import { inputCls, labelCls, btnPrimary } from '../components/ui.jsx'
import { EyeToggle, SizedIcon } from '../components/icons.jsx'

function pesanErrorLogin(err) {
  const pesan = String((err && err.message) || '')
  const rendah = pesan.toLowerCase()
  if (rendah.indexOf('invalid login credentials') !== -1) {
    return 'NIM atau kode akses yang kamu masukkan tidak cocok dengan data kami. Periksa kembali penulisannya, pastikan tidak ada spasi berlebih, lalu coba lagi.'
  }
  if (rendah.indexOf('not confirmed') !== -1) {
    return 'Akun untuk NIM ini belum diaktifkan. Hubungi admin tim magang untuk mengaktifkan akunmu terlebih dahulu.'
  }
  if (rendah.indexOf('too many requests') !== -1 || rendah.indexOf('try again after') !== -1 || rendah.indexOf('rate limit') !== -1) {
    return 'Terlalu banyak percobaan masuk dalam waktu singkat demi keamanan. Tunggu sekitar satu menit, lalu coba lagi.'
  }
  if (rendah.indexOf('fetch') !== -1 || rendah.indexOf('network') !== -1 || rendah.indexOf('failed to load') !== -1 || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return 'Tidak bisa terhubung ke server. Periksa koneksi internetmu, lalu coba lagi.'
  }
  if (rendah.indexOf('email') !== -1 && rendah.indexOf('format') !== -1) {
    return 'Format NIM tidak terbaca. Masukkan NIM berupa angka tanpa spasi, contoh: 24070041.'
  }
  if (pesan) return 'Gagal masuk: ' + pesan + '. Coba sekali lagi, atau hubungi admin tim magang bila masalah berlanjut.'
  return 'Terjadi kesalahan tidak terduga saat masuk. Coba sekali lagi, atau hubungi admin tim magang bila masalah berlanjut.'
}
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
  setError(pesanErrorLogin(err))
}
    setBusy(false)
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] items-start">
      <div className="card-hover rounded-[2rem] bg-bsi-900 text-white p-5 sm:p-8 lg:p-10">
        <span className="inline-flex px-3 py-1.5 rounded-full bg-white/10 text-[10px] font-semibold uppercase tracking-wide sm:px-4 sm:py-2 sm:text-xs">Area Intern</span>
        <h1 className="mt-6 text-2xl sm:text-3xl lg:text-4xl font-black leading-tight">Masuk untuk mengisi logbook, galeri, dan daftar hadir</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/80 sm:mt-4 sm:text-base">Halaman ini hanya digunakan oleh mahasiswa magang. Dosen pembimbing dan kaprodi tidak perlu login untuk melihat halaman publik.</p>
      </div>
      <div className="card-hover bg-white rounded-[2rem] border border-slate-200 shadow-sm p-5 sm:p-8 lg:p-10">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">Login mahasiswa magang</h2>
        {error ? (
          <div className="mt-3 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
              <SizedIcon name="close" size={12} />
            </span>
            <div className="min-w-0">
              <p className="font-bold">Gagal masuk</p>
              <p className="mt-1 leading-relaxed">{error}</p>
            </div>
          </div>
        ) : null}
        <form onSubmit={submit} className="mt-6 space-y-5">
          <div>
            <label className={labelCls}>NIM <span className="text-red-500">*</span></label>
            <input className={inputCls} value={nim} onChange={function (e) { setNim(e.target.value) }} aria-label="NIM" placeholder="Contoh: 20260001" required />
          </div>
          <div>
            <label className={labelCls}>Kode akses <span className="text-red-500">*</span></label>
            <div className="relative mt-1.5">
              <input
                type={lihatKode ? 'text' : 'password'}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-bsi-500"
                value={kode}
                onChange={function (e) { setKode(e.target.value) }}
                aria-label="Kode akses" placeholder="Masukkan kode akses"
                required
              />
              <button
                type="button"
                onClick={function () { setLihatKode(function (v) { return !v }) }}
                title={lihatKode ? 'Sembunyikan kode akses' : 'Lihat kode akses'}
                className="absolute right-2 top-0 bottom-0 my-auto grid h-9 w-9 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-600"
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
      const p = await supabase.from('mahasiswa').select('id, nama, nim, prodi, foto_profil').order('nama')
      const l = await supabase.from('logbooks').select('id, mahasiswa_id, foto_profil').eq('status', 'publik')
      const g = await supabase.from('galeri').select('id, mahasiswa_id, foto_profil')
      setPeople(p.data || [])
      setLogs(l.data || [])
      setGaleri(g.data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <section className="card-hover rounded-[2rem] bg-white border border-slate-200 p-5 sm:p-8 lg:p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">Profil Mahasiswa</p>
        <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">Mahasiswa magang Bank BSI</h1>
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
                    <div className="h-14 w-14 rounded-3xl bg-bsi-800 text-white grid place-items-center text-xl font-black">{typeof p !== 'undefined' && p && p.foto_profil ? <img src={p.foto_profil} alt="Foto profil" className="h-full w-full rounded-[28%] object-cover" /> : typeof m !== 'undefined' && m && m.foto_profil ? <img src={m.foto_profil} alt="Foto profil" className="h-full w-full rounded-[28%] object-cover" /> : initials}</div>
                    <div>
                      <p className="text-lg font-bold text-slate-900">{p.nama}</p>
                      <p className="text-sm text-slate-600">NIM {p.nim}</p>
                      {p.prodi ? <span className="mt-1 inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-bsi-100 text-bsi-900">{p.prodi}</span> : null}
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-600">Logbook publik</p><p className="mt-1 text-xl sm:text-2xl font-black text-bsi-900">{totalLog}</p></div>
                    <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-600">Media galeri</p><p className="mt-1 text-xl sm:text-2xl font-black text-bsi-900">{totalGal}</p></div>
                  </div>
                </div>
              )
            })}
      </section>
    </div>
  )
}
```

## File: src/components/Layout.jsx
```javascript
import { Outlet, Link, NavLink } from 'react-router-dom'
import { useTheme } from '../lib/theme.jsx'
import { useAuth, logoutMahasiswa } from '../lib/auth.js'
import { SizedIcon } from './icons.jsx'
import { useEffect, useState } from 'react'

const LINKS = [
  { to: '/', label: 'Beranda' },
  { to: '/logbook', label: 'Logbook' },
  { to: '/galeri', label: 'Galeri' },
  { to: '/absen', label: 'Daftar Hadir' },
  { to: '/dospem', label: 'Tim & Dospem' }
]

function MenuMobile(props) {
  return (
    <div className={'menu-mobile-wrap xl:hidden' + (props.open ? ' menu-mobile-buka' : '')}>
      <div className="menu-mobile-dalam">
        <div className="menu-mobile-isi border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          {props.children}
        </div>
      </div>
    </div>
  )
}
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
                <p className="text-xs text-slate-600 mt-1">Bank Syariah Indonesia</p>
              </div>
            </Link>
            <nav className="hidden xl:flex items-center gap-1">
              {LINKS.map(function (l) {
                return <NavLink key={l.to} to={l.to} end={l.to === '/'} className={function (s) { return linkCls(s.isActive) }}>{l.label}</NavLink>
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
        <MenuMobile open={open}>
            {LINKS.map(function (l) {
              return <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={function () { setOpen(false) }} className={function (s) { return 'flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm ' + (s.isActive ? 'bg-bsi-100 text-bsi-900 font-bold ring-1 ring-bsi-200 dark:ring-bsi-500/40' : 'font-semibold text-slate-600 hover:bg-slate-100') }}>{function (s) { return <>{s.isActive ? <span className="h-2 w-2 shrink-0 rounded-full bg-current" /> : null}<span className="truncate">{l.label}</span></> }}</NavLink>
            })}
            {mahasiswa ? (
              <>
                <NavLink to="/dashboard" onClick={function () { setOpen(false) }} className={function (s) { return 'flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold bg-bsi-800 text-white ' + (s.isActive ? 'ring-2 ring-gold-400' : '') }}>{function (s) { return <>{s.isActive ? <span className="h-2 w-2 shrink-0 rounded-full bg-gold-400" /> : null}<span className="truncate">Dashboard</span></> }}</NavLink>
                <Link to="/" onClick={function () { setOpen(false); logoutMahasiswa() }} className="block px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700">Keluar</Link>
              </>
            ) : (
              <Link to="/login" onClick={function () { setOpen(false) }} className="block px-4 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold">Masuk Intern</Link>
            )}
        </MenuMobile>
      </header>

      <main className="anim-page max-w-7xl mx-auto px-4 py-8 lg:py-10 flex-1 w-full">
        <Outlet />
      </main>

      <footer className="footer-ramping border-t border-slate-200 bg-white">
<div className="mx-auto max-w-7xl px-4 py-4 text-center">
<p className="text-xs text-slate-600">© 2026 Tim Magang BSI</p>
</div>
</footer>
    </div>
  )
}
```

## File: src/pages/DospemPage.jsx
```javascript
import { urutkanTanggal } from '../lib/format.js'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { EmptyState, Modal , Avatar } from '../components/ui.jsx'
import { LogbookCard, LogbookDetail } from '../components/cards.jsx'
import { SkeletonLogbookCard, SkeletonPersonCard } from '../components/Skeleton.jsx'

export default function DospemPage() {
  const [logs, setLogs] = useState([])
  const [people, setPeople] = useState([])
  const [galCount, setGalCount] = useState(0)
  const [hadirCount, setHadirCount] = useState(0)
  const [galRows, setGalRows] = useState([])
  const [hadirRows, setHadirRows] = useState([])
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    async function load() {
      const l = await supabase
        .from('logbooks')
        .select('*, mahasiswa(*), logbook_items(*)')
        .eq('status', 'publik')
        .order('tanggal', { ascending: false })
        .order('urutan', { ascending: true, referencedTable: 'logbook_items' })
      const p = await supabase.from('mahasiswa').select('id, nama, nim, prodi, foto_profil').order('nama')
      const g = await supabase.from('galeri').select('id, mahasiswa_id')
      const h = await supabase.from('daftar_hadir').select('id, mahasiswa_id, status')
      setLogs(l.data || [])
      setPeople(p.data || [])
      setGalCount((g.data || []).length)
      setGalRows(g.data || [])
      setHadirCount((h.data || []).length)
      setHadirRows(h.data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <section className="card-hover rounded-[2rem] bg-bsi-900 text-white p-5 sm:p-5 sm:p-8 lg:p-12">
        <span className="inline-flex px-3 py-1.5 rounded-full bg-white/10 text-[10px] font-semibold uppercase tracking-wide sm:px-4 sm:py-2 sm:text-xs">Monitoring Dospem dan Kaprodi</span>
        <h1 className="mt-6 text-2xl sm:text-2xl sm:text-3xl lg:text-5xl font-black max-w-3xl leading-tight">Ringkasan kegiatan magang tim di Bank BSI</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/80 sm:mt-4 sm:text-base">Halaman ini dapat diakses tanpa login.</p>
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-4 xl:grid-cols-4">
          {loading
            ? [0, 1, 2, 3].map(function (i) {
                return (
                  <div key={i} className="rounded-2xl bg-white/10 p-4 sm:rounded-[1.5rem] sm:p-5">
                    <div className="skeleton skeleton-on-dark h-4 w-24"></div>
                    <div className="skeleton skeleton-on-dark h-9 w-14 mt-2"></div>
                  </div>
                )
              })
            : [
                <div key="mahasiswa" className="card-hover rounded-2xl bg-white/10 p-4 sm:rounded-[1.5rem] sm:p-5"><p className="text-xs sm:text-sm text-white/80">Total mahasiswa</p><p className="mt-1 text-2xl sm:text-3xl font-black">{people.length}</p></div>,
                <div key="logbook" className="card-hover rounded-2xl bg-white/10 p-4 sm:rounded-[1.5rem] sm:p-5"><p className="text-xs sm:text-sm text-white/80">Logbook publik</p><p className="mt-1 text-2xl sm:text-3xl font-black">{logs.length}</p></div>,
                <div key="galeri" className="card-hover rounded-2xl bg-white/10 p-4 sm:rounded-[1.5rem] sm:p-5"><p className="text-xs sm:text-sm text-white/80">Media galeri</p><p className="mt-1 text-2xl sm:text-3xl font-black">{galCount}</p></div>,
                <div key="hadir" className="card-hover rounded-2xl bg-white/10 p-4 sm:rounded-[1.5rem] sm:p-5"><p className="text-xs sm:text-sm text-white/80">Catatan hadir</p><p className="mt-1 text-2xl sm:text-3xl font-black">{hadirCount}</p></div>
              ]}
        </div>
        <div className="mt-6 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
          <Link to="/logbook" className="px-4 py-2 rounded-xl bg-gold-500 text-slate-900 text-xs font-bold hover:bg-gold-400 sm:px-5 sm:py-3 sm:rounded-2xl sm:text-sm">Lihat logbook</Link>
          <Link to="/galeri" className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 sm:px-5 sm:py-3 sm:rounded-2xl sm:text-sm">Lihat galeri</Link>
          <Link to="/absen" className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 sm:px-5 sm:py-3 sm:rounded-2xl sm:text-sm">Lihat daftar hadir</Link>
        </div>
      </section>

      <section className="mt-10">
<h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">Profil tim magang</h2>
<p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">Seluruh mahasiswa magang beserta kontribusi logbook, media galeri, dan catatan kehadiran masing-masing.</p>
<div className="grid-pusat-rapat mt-6">
{loading
? [0, 1, 2].map(function (i) { return <div key={i} className="kolom-kartu-rapat"><SkeletonPersonCard /></div> })
: people.map(function (p) {
const totalLog = logs.filter(function (x) { return x.mahasiswa_id === p.id }).length
const totalGal = galRows.filter(function (x) { return x.mahasiswa_id === p.id }).length
const totalHadir = hadirRows.filter(function (x) { return x.mahasiswa_id === p.id }).length
return (
<div key={p.id} className="kolom-kartu-rapat">
<div className="card-hover rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col h-full">
<div className="flex items-center gap-4">
<Avatar src={p.foto_profil || null} nama={p.nama} size="lg" />
<div className="min-w-0 flex-1">
<p className="truncate text-lg font-black text-slate-900">{p.nama}</p>
<p className="truncate text-xs text-slate-600">NIM {p.nim}</p>
{p.prodi ? <span className="mt-1.5 inline-flex px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">{p.prodi}</span> : null}
</div>
</div>
<div className="mt-4 grid grid-cols-2 gap-3">
<div className="rounded-2xl bg-slate-50 p-3">
<p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">Logbook</p>
<p className="mt-0.5 text-xl font-black text-bsi-800">{totalLog}</p>
</div>
<div className="rounded-2xl bg-slate-50 p-3">
<p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">Media</p>
<p className="mt-0.5 text-xl font-black text-bsi-800">{totalGal}</p>
</div>
</div>
<div className="mt-3 pt-3 border-t border-slate-100">
<p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Rekap Kehadiran</p>
<div className="grid grid-cols-3 gap-2">
<div className="rounded-xl bg-emerald-50 p-2 text-center">
<p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Masuk</p>
<p className="text-base font-black text-emerald-700">{hadirRows.filter(function (x) { return x.mahasiswa_id === p.id && x.status === 'Masuk' }).length}</p>
</div>
<div className="rounded-xl bg-amber-50 p-2 text-center">
<p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">Izin</p>
<p className="text-base font-black text-amber-700">{hadirRows.filter(function (x) { return x.mahasiswa_id === p.id && x.status === 'Izin' }).length}</p>
</div>
<div className="rounded-xl bg-red-50 p-2 text-center">
<p className="text-[10px] font-bold text-red-600 uppercase">Bolos</p>
<p className="text-base font-black text-red-700">{hadirRows.filter(function (x) { return x.mahasiswa_id === p.id && x.status === 'Bolos' }).length}</p>
</div>
</div>
</div>
</div>
 </div>
)
})}
{!loading && !people.length ? <div className="w-full"><EmptyState title="Belum ada data mahasiswa" desc="Profil tim akan tampil setelah mahasiswa terdaftar." /></div> : null}
</div>
</section>

      <section className="mt-10">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">Aktivitas yang sudah dipublikasikan</h2>
        <div className="grid-pusat mt-6">
          {loading
            ? [0, 1, 2, 3, 4, 5].map(function (i) { return <div key={i} className="kolom-kartu"><SkeletonLogbookCard /></div> })
            : urutkanTanggal(logs, 'terbaru').slice(0, 6).map(function (l) {
                return (
                  <div key={l.id} className="kolom-kartu">
                    <LogbookCard log={l} onDetail={function () { setDetail(l) }} />
                  </div>
                )
              })}
          {!loading && !logs.length ? <div className="w-full"><EmptyState title="Belum ada logbook publik" desc="Logbook akan tampil setelah mahasiswa mengatur status siap dilihat." /></div> : null}
        </div>
        <div className="mt-8 flex justify-center">
          <Link to="/logbook" className="rounded-xl bg-bsi-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-bsi-900 sm:rounded-2xl sm:px-6 sm:py-3 sm:text-sm">Lihat semua logbook</Link>
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
import { EmptyState, Modal, Pagination } from '../components/ui.jsx'
import { LogbookCard, LogbookDetail } from '../components/cards.jsx'
import { FilterBar, FilterSelect, TimeFilter, countActiveFilters, SortSelect } from '../components/FilterBar.jsx'
import { ICONS } from '../components/icons.jsx'
import { matchesDateFilters, urutkanTanggal } from '../lib/format.js'
import { KATEGORI } from '../lib/constants.js'
import { SkeletonLogbookCard } from '../components/Skeleton.jsx'

const INITIAL = { mahasiswa: '', kategori: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }
const PER_PAGE = 12

export default function LogbookPage() {
  const { mahasiswa } = useAuth()
  const [all, setAll] = useState([])
  const [people, setPeople] = useState([])
  const [filter, setFilter] = useState(INITIAL)
  const [sort, setSort] = useState('terbaru')
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(function () {
    async function load() {
      const l = await supabase
        .from('logbooks')
        .select('*, mahasiswa(*), logbook_items(*)')
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

  useEffect(function () {
    setPage(1)
  }, [filter, sort])
  function gantiHalaman(p) {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const logs = all.filter(function (l) {
    if (filter.mahasiswa && l.mahasiswa_id !== filter.mahasiswa) return false
    if (filter.kategori && l.kategori !== filter.kategori) return false
    return matchesDateFilters(l.tanggal, filter)
  })
  const active = countActiveFilters(filter)
  const sortedLogs = urutkanTanggal(logs, sort)
  const totalData = sortedLogs.length
  const totalPages = Math.ceil(totalData / PER_PAGE)
  const pageAman = Math.min(page, Math.max(1, totalPages))
  const mulai = totalData === 0 ? 0 : (pageAman - 1) * PER_PAGE + 1
  const akhir = Math.min(pageAman * PER_PAGE, totalData)
  const paginatedLogs = sortedLogs.slice((pageAman - 1) * PER_PAGE, pageAman * PER_PAGE)

  return (
    <div>
      <section className="rounded-[2rem] bg-white border border-slate-200 p-5 sm:p-8 lg:p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">Logbook publik</p>
        <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">Catatan kegiatan magang</h1>
        <p className="mt-2 text-sm text-slate-600 max-w-2xl sm:mt-3 sm:text-base">Satu logbook mewakili satu hari kerja dan bisa berisi beberapa kegiatan.</p>
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

      <section className="grid-pusat mt-8">
        {loading
          ? [0, 1, 2, 3, 4, 5].map(function (i) { return <div key={i} className="kolom-kartu"><SkeletonLogbookCard /></div> })
          : paginatedLogs.map(function (l) {
              return (
                <div key={l.id} className="kolom-kartu">
                  <LogbookCard log={l} isOwner={mahasiswa && mahasiswa.id === l.mahasiswa_id}
                    onDetail={function () { setDetail(l) }} />
                </div>
              )
            })}
        {!loading && !logs.length ? <div className="w-full"><EmptyState title="Logbook tidak ditemukan" desc="Coba reset filter atau pilih filter lain." /></div> : null}
      </section>
      {!loading && totalData > 0 ? (
        <div className="mt-6 text-center text-sm text-slate-600">
          Total {totalData} logbook{totalPages > 1 ? ' • Halaman ' + pageAman + ' dari ' + totalPages : ''}
        </div>
      ) : null}
      {!loading ? <Pagination totalItems={totalData} perPage={PER_PAGE} page={pageAman} onPageChange={gantiHalaman} /> : null}

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <LogbookDetail log={detail} /> : null}
      </Modal>
    </div>
  )
}
```

## File: src/pages/AttendancePage.jsx
```javascript
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { StatCard, EmptyState, Modal, Pagination } from '../components/ui.jsx'
import { AttendanceCard, AttendanceDetail } from '../components/cards.jsx'
import { FilterBar, FilterSelect, TimeFilter, countActiveFilters, SortSelect } from '../components/FilterBar.jsx'
import { ICONS } from '../components/icons.jsx'
import { matchesDateFilters, urutkanTanggal } from '../lib/format.js'
import { SkeletonStatCard, SkeletonChartRow, SkeletonAttendanceCard } from '../components/Skeleton.jsx'

const INITIAL = { mahasiswa: '', status: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }
const PER_PAGE = 12

export default function AttendancePage() {
  const { mahasiswa } = useAuth()
  const [all, setAll] = useState([])
  const [people, setPeople] = useState([])
  const [filter, setFilter] = useState(INITIAL)
  const [sort, setSort] = useState('terbaru')
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(function () {
    async function load() {
      const a = await supabase.from('daftar_hadir').select('*, mahasiswa(*)').order('tanggal', { ascending: false })
      const p = await supabase.from('mahasiswa').select('id, nama, nim').order('nama')
      setAll(a.data || [])
      setPeople(p.data || [])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(function () {
    setPage(1)
  }, [filter, sort])
  function gantiHalaman(p) {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const rows = all.filter(function (r) {
    if (filter.mahasiswa && r.mahasiswa_id !== filter.mahasiswa) return false
    if (filter.status && r.status !== filter.status) return false
    return matchesDateFilters(r.tanggal, filter)
  })
  const active = countActiveFilters(filter)
  const sortedRows = urutkanTanggal(rows, sort)
  const totalData = sortedRows.length
  const totalPages = Math.ceil(totalData / PER_PAGE)
  const pageAman = Math.min(page, Math.max(1, totalPages))
  const mulai = totalData === 0 ? 0 : (pageAman - 1) * PER_PAGE + 1
  const akhir = Math.min(pageAman * PER_PAGE, totalData)
  const paginatedRows = sortedRows.slice((pageAman - 1) * PER_PAGE, pageAman * PER_PAGE)

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
      <section className="rounded-[2rem] bg-white border border-slate-200 p-5 sm:p-5 sm:p-8 lg:p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">Daftar hadir</p>
        <h1 className="mt-2 text-2xl sm:text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">Monitoring kehadiran tim magang</h1>
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-4 xl:grid-cols-4">
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

      <section className="mt-8 card-hover rounded-[2rem] bg-white border border-slate-200 p-5 sm:p-5 sm:p-8 lg:p-10 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Grafik kehadiran per mahasiswa</h2>
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
                        <p className="text-xs text-slate-600">NIM {p.nim}</p>
                      </div>
                      <div className="text-xs text-slate-600">Masuk: {p.Masuk} | Izin: {p.Izin} | Bolos: {p.Bolos}</div>
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
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">Daftar kehadiran sesuai filter</h2>
        <div className="grid-pusat-rapat mt-6">
          {loading
            ? [0, 1, 2].map(function (i) { return <div key={i} className="kolom-kartu-rapat"><SkeletonAttendanceCard /></div> })
            : paginatedRows.map(function (r) {
                return (
                  <div key={r.id} className="kolom-kartu-rapat">
                    <AttendanceCard row={r} isOwner={mahasiswa && mahasiswa.id === r.mahasiswa_id}
                      onDetail={function () { setDetail(r) }} />
                  </div>
                )
              })}
          {!loading && !rows.length ? <div className="w-full"><EmptyState icon="clipboard" title="Belum ada data kehadiran" desc="Data kehadiran akan tampil setelah mahasiswa mengisi daftar hadir." /></div> : null}
        </div>
      </section>
      {!loading && totalData > 0 ? (
        <div className="mt-6 text-center text-sm text-slate-600">
          Total {totalData} catatan{totalPages > 1 ? ' • Halaman ' + pageAman + ' dari ' + totalPages : ''}
        </div>
      ) : null}
      {!loading ? <Pagination totalItems={totalData} perPage={PER_PAGE} page={pageAman} onPageChange={gantiHalaman} /> : null}

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <AttendanceDetail row={detail} /> : null}
      </Modal>
    </div>
  )
}
```

## File: src/pages/HomePage.jsx
```javascript
import { urutkanTanggal } from '../lib/format.js'
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
        .select('*, mahasiswa(*), logbook_items(*)')
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
        <div className="card-hover relative overflow-hidden rounded-[2rem] bg-bsi-900 text-white p-5 sm:p-8 lg:p-12">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-500/20 blur-2xl" />
          <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-emerald-300/10 blur-2xl" />
          <div className="relative z-10">
            <span className="inline-flex px-3 py-1.5 rounded-full bg-white/10 text-[10px] font-semibold uppercase tracking-wide sm:px-4 sm:py-2 sm:text-xs">Magang Bank BSI</span>
            <h1 className="mt-6 text-2xl sm:text-3xl lg:text-5xl font-black leading-tight max-w-2xl">Logbook, Galeri, dan Daftar Hadir Magang dalam Satu Portal</h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:mt-5 sm:text-base">Portal ini mencatat kegiatan harian, dokumentasi media, dan kehadiran tim magang selama membantu operasional Bank BSI.</p>
            <div className="mt-6 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
              <Link to="/logbook" className="px-4 py-2.5 rounded-xl bg-gold-500 text-slate-900 text-sm font-bold hover:bg-gold-400 sm:px-6 sm:py-3 sm:rounded-2xl sm:text-base">Lihat Logbook</Link>
              <Link to="/galeri" className="px-4 py-2.5 rounded-xl bg-white/10 text-white text-sm font-bold hover:bg-white/20 sm:px-6 sm:py-3 sm:rounded-2xl sm:text-base">Lihat Galeri</Link>
              <Link to="/absen" className="px-4 py-2.5 rounded-xl bg-white/10 text-white text-sm font-bold hover:bg-white/20 sm:px-6 sm:py-3 sm:rounded-2xl sm:text-base">Daftar Hadir</Link>
              {mahasiswa
                ? <Link to="/dashboard" className="px-4 py-2.5 rounded-xl bg-[#ffffff] text-[#135033] text-sm font-bold hover:bg-[#f1f5f9] sm:px-6 sm:py-3 sm:rounded-2xl sm:text-base">Buka Dashboard</Link>
                : <Link to="/login" className="px-4 py-2.5 rounded-xl bg-[#ffffff] text-[#135033] text-sm font-bold hover:bg-[#f1f5f9] sm:px-6 sm:py-3 sm:rounded-2xl sm:text-base">Masuk Intern</Link>}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-1 lg:gap-4">
          {loading
            ? [0, 1, 2].map(function (i) { return <SkeletonStatCard key={i} /> })
            : [
                <StatCard key="mahasiswa" label="Total mahasiswa magang" labelRapat="Mahasiswa" value={stats.mahasiswa} sub="Mahasiswa terdaftar dalam tim" rapat />,
                <StatCard key="logbook" label="Total logbook publik" labelRapat="Logbook" value={stats.logbook} sub="Catatan kegiatan harian" rapat />,
                <StatCard key="galeri" label="Total media galeri" labelRapat="Media" value={stats.galeri} sub="Foto dan video dokumentasi" rapat />
              ]}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">Kegiatan terbaru</p>
            <h2 className="mt-2 text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">Logbook terbaru tim</h2>
          </div>
          <Link to="/logbook" className="text-sm font-semibold text-bsi-800 hover:text-bsi-950">Lihat semua logbook</Link>
        </div>
        <div className="grid-pusat mt-6">
          {loading
            ? [0, 1, 2, 3, 4, 5].map(function (i) { return <div key={i} className="kolom-kartu"><SkeletonLogbookCard /></div> })
            : urutkanTanggal(logs, 'terbaru').slice(0, 6).map(function (l) {
                return (
                  <div key={l.id} className="kolom-kartu">
                    <LogbookCard log={l} onDetail={function () { setDetail(l) }} />
                  </div>
                )
              })}
          {!loading && !logs.length ? <div className="w-full"><EmptyState title="Belum ada logbook publik" desc="Logbook yang sudah berstatus Published akan tampil di sini." /></div> : null}
        </div>
        <div className="mt-8 flex justify-center">
          <Link to="/logbook" className="rounded-xl bg-bsi-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-bsi-900 sm:rounded-2xl sm:px-6 sm:py-3 sm:text-sm">Lihat semua logbook</Link>
        </div>
      </section>

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <LogbookDetail log={detail} /> : null}
      </Modal>
    </div>
  )
}
```

## File: src/pages/GalleryPage.jsx
```javascript
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { EmptyState, Modal, Pagination } from '../components/ui.jsx'
import { GalleryCard, GalleryDetail } from '../components/cards.jsx'
import { FilterBar, FilterSelect, TimeFilter, countActiveFilters, SortSelect } from '../components/FilterBar.jsx'
import { ICONS } from '../components/icons.jsx'
import { matchesDateFilters, urutkanTanggal } from '../lib/format.js'
import { GALERI_KEGIATAN } from '../lib/constants.js'
import { SkeletonGalleryCard } from '../components/Skeleton.jsx'

const INITIAL = { kegiatan: '', tipe: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }
const PER_PAGE = 12

export default function GalleryPage() {
  const { mahasiswa } = useAuth()
  const [all, setAll] = useState([])
  const [filter, setFilter] = useState(INITIAL)
  const [sort, setSort] = useState('terbaru')
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(function () {
    async function load() {
      const g = await supabase.from('galeri').select('*, mahasiswa(*)').order('tanggal', { ascending: false })
      setAll(g.data || [])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(function () {
    setPage(1)
  }, [filter, sort])
  function gantiHalaman(p) {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const items = all.filter(function (i) {
    if (filter.kegiatan && (i.kegiatan || 'Lainnya') !== filter.kegiatan) return false
    if (filter.tipe && i.media_type !== filter.tipe) return false
    return matchesDateFilters(i.tanggal, filter)
  })
  const active = countActiveFilters(filter)
  const sortedItems = urutkanTanggal(items, sort)
  const totalData = sortedItems.length
  const totalPages = Math.ceil(totalData / PER_PAGE)
  const pageAman = Math.min(page, Math.max(1, totalPages))
  const mulai = totalData === 0 ? 0 : (pageAman - 1) * PER_PAGE + 1
  const akhir = Math.min(pageAman * PER_PAGE, totalData)
  const paginatedItems = sortedItems.slice((pageAman - 1) * PER_PAGE, pageAman * PER_PAGE)

  return (
    <div>
      <section className="rounded-[2rem] bg-white border border-slate-200 p-5 sm:p-8 lg:p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">Galeri dokumentasi</p>
        <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">Foto dan video kegiatan magang</h1>
        <p className="mt-2 text-sm text-slate-600 max-w-2xl sm:mt-3 sm:text-base">Setiap kartu mewakili satu kegiatan. Klik media untuk melihat detail.</p>
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

      <section className="grid-pusat mt-8">
        {loading
          ? [0, 1, 2, 3, 4, 5].map(function (i) { return <div key={i} className="kolom-kartu"><SkeletonGalleryCard /></div> })
          : paginatedItems.map(function (i) {
              return (
                <div key={i.id} className="kolom-kartu">
                  <GalleryCard item={i} isOwner={mahasiswa && mahasiswa.id === i.mahasiswa_id}
                    onDetail={function () { setDetail(i) }} />
                </div>
              )
            })}
        {!loading && !items.length ? <div className="w-full"><EmptyState icon="camera" title="Belum ada media galeri" desc="Media galeri yang diunggah mahasiswa akan tampil di sini." /></div> : null}
      </section>
      {!loading && totalData > 0 ? (
        <div className="mt-6 text-center text-sm text-slate-600">
          Total {totalData} media{totalPages > 1 ? ' • Halaman ' + pageAman + ' dari ' + totalPages : ''}
        </div>
      ) : null}
      {!loading ? <Pagination totalItems={totalData} perPage={PER_PAGE} page={pageAman} onPageChange={gantiHalaman} /> : null}

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <GalleryDetail item={detail} /> : null}
      </Modal>
    </div>
  )
}
```

## File: src/components/cards.jsx
```javascript
import { Avatar } from './ui.jsx'
import PemutarVideo from './PemutarVideo.jsx'
import Carousel from './Carousel.jsx'
import { StatusBadge, CategoryBadge, AttendanceBadge, btnSmall, ZoomableMedia, SmartFit , MediaYouTube, MediaDrive } from './ui.jsx'
import { formatTanggal, formatTanggalShort } from '../lib/format.js'
import { drivePreviewUrl, driveThumbUrl } from '../lib/drive.js'

function PersonChip(props) {
  const p = props.mahasiswa
  const nama = p ? p.nama : 'Mahasiswa'
  const nim = p ? p.nim : '-'
  const prodi = p && p.prodi ? p.prodi : ''
  const initials = nama.split(' ').slice(0, 2).map(function (w) { return w.charAt(0) || '' }).join('').toUpperCase()
  return (
    <div className="flex items-center gap-3">
      <div className={'rounded-2xl bg-bsi-800 text-white grid place-items-center font-bold ' + (props.size === 'sm' ? 'h-9 w-9 text-xs' : 'h-11 w-11')}>
        {typeof p !== 'undefined' && p && p.foto_profil ? <img src={p.foto_profil} alt="Foto profil" className="h-full w-full rounded-[28%] object-cover" /> : typeof m !== 'undefined' && m && m.foto_profil ? <img src={m.foto_profil} alt="Foto profil" className="h-full w-full rounded-[28%] object-cover" /> : initials}</div>
      <div>
        <p className="font-semibold text-slate-900">{nama}</p>
        <p className="text-xs text-slate-600">NIM {nim}</p>
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
    return { src: i.media_thumb || i.media_path, full: i.media_path, type: i.media_source === 'youtube' ? 'foto' : i.media_type, title: i.judul, yt: i.youtube_id || null, drive: i.drive_id || null }
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
        <p className="text-sm text-slate-600">{formatTanggal(log.tanggal)}</p>
        <h3 className="mt-2 text-xl font-bold text-slate-900">{log.judul}</h3>
        <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-bsi-800">Terdapat {items.length} kegiatan</p>
        <div className="mt-2 space-y-1">
          {preview.map(function (it, i) {
            return <p key={it.id} className="text-xs text-slate-600 truncate">{i + 1}. {it.judul}</p>
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
        <p className="text-sm text-slate-600">{formatTanggal(log.tanggal)}</p>
        <h2 className="mt-1 text-xl sm:text-2xl font-black text-slate-900">{log.judul}</h2>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">Rincian kegiatan</p>
        <div className="mt-4">
          {items.map(function (it, i) {
            return (
              <div key={it.id} className={'relative pl-12 ' + (i < items.length - 1 ? 'pb-6' : 'pb-0')}>
                <span className="absolute left-0 top-0 h-9 w-9 rounded-full bg-bsi-800 text-white grid place-items-center text-sm font-bold">{i + 1}</span>
                {i < items.length - 1 ? <span className="absolute left-4 top-9 bottom-0 w-px bg-slate-200 dark:bg-slate-700" /> : null}
                 <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                   {it.media_path ? (
                      it.media_source === 'youtube' ? (
                        <PemutarVideo key={it.youtube_id} youtubeId={it.youtube_id} title={it.judul} className="aspect-video w-full rounded-2xl mb-3" />
                      ) : it.media_source === 'drive' ? (
                        <div className="iframe-video-wrap mb-3"><iframe key={it.media_path} src={drivePreviewUrl(it.media_path)} title={it.judul} allow="autoplay; encrypted-media; fullscreen" allowFullScreen className="aspect-video w-full rounded-2xl border-0 bg-black" /></div>
                      ) : (
                        <ZoomableMedia src={it.media_thumb || it.media_path} full={it.media_path} type={it.media_type} title={it.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900 mb-3" />
                      )
                    ) : null}
                  <p className="font-bold text-slate-900">
                    {it.judul}
                    {it.show_in_gallery && it.media_path ? <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold-500/15 text-amber-700 dark:text-amber-400">Di galeri</span> : null}
                  </p>
                  {it.deskripsi ? <p className="mt-1 text-sm text-slate-600">{it.deskripsi}</p> : null}
                  {it.hasil ? <p className="mt-2 inline-flex px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">Hasil: {it.hasil}</p> : null}
                </div>
              </div>
            )
          })}
          {!items.length ? <p className="text-sm text-slate-600">Belum ada rincian kegiatan.</p> : null}
        </div>
      </div>
      {log.kendala || log.solusi || log.pembelajaran ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">Refleksi harian</p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {log.kendala ? <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase text-slate-600">Kendala</p><p className="mt-1 text-sm text-slate-700">{log.kendala}</p></div> : null}
            {log.solusi ? <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase text-slate-600">Solusi</p><p className="mt-1 text-sm text-slate-700">{log.solusi}</p></div> : null}
            {log.pembelajaran ? <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase text-slate-600">Pembelajaran</p><p className="mt-1 text-sm text-slate-700">{log.pembelajaran}</p></div> : null}
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
      ) : item.media_source === 'drive' ? (
        <MediaDrive driveId={item.media_path} alt={item.judul} />
      ) : (
        <SmartFit src={item.media_thumb || item.media_path} full={item.media_path} type={item.media_type} alt={item.judul} />
      )}
      </div>
      <div className="p-5 space-y-3 flex-1 flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <CategoryBadge value={item.kegiatan} />
            {item.logbook_item_id ? <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold-500/15 text-amber-700 dark:text-amber-400">Dari logbook</span> : null}
          </div>
          <span className="text-xs text-slate-600">{formatTanggalShort(item.tanggal)}</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900">{item.judul}</h3>
        <p className="text-sm text-slate-600 line-clamp-2">{item.deskripsi || 'Tidak ada deskripsi.'}</p>
        <div className="mt-auto pt-3 border-t border-slate-100 space-y-3">
          <PersonChip mahasiswa={item.mahasiswa} />
          {props.onEdit ? (
            <div className="flex flex-wrap gap-2" onClick={function (e) { e.stopPropagation() }}>
              <button onClick={props.onEdit} className={btnSmall + ' bg-slate-900 text-white hover:bg-slate-700'}>Edit</button>
              <button onClick={props.onDelete} className={btnSmall + ' bg-red-50 text-red-700 hover:bg-red-100'}>Hapus</button>
            </div>
          ) : (
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
        <PemutarVideo key={item.youtube_id} youtubeId={item.youtube_id} title={item.judul} className="aspect-video w-full rounded-2xl" />
      ) : item.media_source === 'drive' ? (
        <div className="iframe-video-wrap"><iframe src={drivePreviewUrl(item.media_path)} title={item.judul} allow="autoplay; encrypted-media; fullscreen" allowFullScreen className="aspect-video w-full rounded-2xl border-0 bg-black" /></div>
      ) : (
        <ZoomableMedia src={item.media_thumb || item.media_path} full={item.media_path} type={item.media_type} title={item.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900" />
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <CategoryBadge value={item.kegiatan} />
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{item.media_type === 'video' ? 'Video' : 'Foto'}</span>
        </div>
        <span className="text-sm text-slate-600">{formatTanggal(item.tanggal)}</span>
      </div>
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">{item.judul}</h2>
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
          <p className="text-sm text-slate-600 pb-4">{formatTanggal(row.tanggal)}</p>
          <div className="flex items-center gap-3"><Avatar src={props.row && props.row.mahasiswa && props.row.mahasiswa.foto_profil ? props.row.mahasiswa.foto_profil : null} nama={props.row && props.row.mahasiswa ? props.row.mahasiswa.nama : 'Mahasiswa'} size="md" /><div className="min-w-0 flex-1"><p className="mt-1 font-bold text-slate-900">{row.mahasiswa ? row.mahasiswa.nama : 'Mahasiswa'}</p>
          <p className="text-xs text-slate-600">NIM {row.mahasiswa ? row.mahasiswa.nim : '-'}</p></div></div>
        </div>
        <AttendanceBadge status={row.status} />
      </div>
      <div className="mt-4 rounded-2xl bg-slate-50 p-4 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Alasan atau keterangan</p>
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
          <p className="text-sm text-slate-600">{formatTanggal(row.tanggal)}</p>
          <h2 className="mt-1 text-xl sm:text-2xl font-black text-slate-900">Detail daftar hadir</h2>
        </div>
        <AttendanceBadge status={row.status} />
      </div>
      <div className="rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Alasan atau keterangan</p>
        <p className="mt-1 text-sm text-slate-700">{row.alasan || 'Tidak ada alasan.'}</p>
      </div>
      <div className="border-t border-slate-100 pt-4"><PersonChip mahasiswa={row.mahasiswa} /></div>
    </div>
  )
}
```

## File: src/components/ui.jsx
```javascript
import { createPortal } from 'react-dom'
import PemutarVideo from './PemutarVideo.jsx'
import { drivePreviewUrl, driveDownloadUrl, driveThumbUrl } from '../lib/drive.js'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
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
export const btnPrimary = 'w-full rounded-xl bg-bsi-800 px-5 py-3 text-sm sm:rounded-2xl sm:px-6 sm:py-4 sm:text-base text-white font-bold hover:bg-bsi-900'
export const btnSmall = 'px-3.5 py-2 rounded-lg text-xs sm:px-4 sm:py-2 sm:rounded-xl sm:text-sm font-semibold'
export const cardCls = 'card-hover bg-white rounded-3xl border border-slate-200 shadow-sm'

export function StatCard(props) {
  const rapat = props.rapat
  const clsWadah = rapat ? ' p-3 sm:p-6' : ' p-4 sm:p-6'
  const clsLabel = (rapat ? 'text-[11px] leading-snug sm:text-sm' : 'text-xs sm:text-sm') + ' text-slate-600'
  const clsLabelRapat = 'text-[11px] leading-snug font-semibold text-slate-600 sm:hidden'
  const clsValue = (rapat ? 'mt-1 text-xl sm:text-3xl' : 'mt-2 text-2xl sm:text-3xl') + ' font-black text-bsi-900'
  const clsSub = (rapat ? 'hidden sm:block ' : '') + 'mt-1 text-[11px] leading-snug sm:text-xs text-slate-600'
  return (
    <div className={cardCls + clsWadah}>
      {props.labelRapat ? <p className={clsLabelRapat}>{props.labelRapat}</p> : null}
      <p className={clsLabel + (props.labelRapat ? ' hidden sm:block' : '')}>{props.label}</p>
      <p className={clsValue}>{props.value}</p>
      {props.sub ? <p className={clsSub}>{props.sub}</p> : null}
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
      <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">{props.desc}</p>
    </div>
  )
}

export function StatusBadge(props) {
  const publik = props.status === 'publik'
  return (
    <span className={'px-3 py-1 rounded-full text-xs font-semibold ' + (publik ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')}>
      {publik ? 'Published' : 'Draft'}
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
  const [tampil, setTampil] = useState(props.open)
  const [tutup, setTutup] = useState(false)
  const isiSimpan = useRef(null)
  if (props.open) isiSimpan.current = props.children
  useBodyScrollLock(!!props.open)
  useEffect(function () {
    if (props.open) {
      setTampil(true)
      setTutup(false)
      return undefined
    }
    if (!tampil) return undefined
    setTutup(true)
    const t = setTimeout(function () {
      setTampil(false)
      setTutup(false)
    }, 200)
    return function () { clearTimeout(t) }
  }, [props.open])
  if (!tampil) return null
  return (
    <div className={'anim-overlay fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-slate-900/60 p-4' + (tutup ? ' modal-tutup' : '')} onClick={props.onClose}>
      <div className="min-h-full flex items-center justify-center py-8">
        <div className="anim-modal w-full max-w-3xl rounded-[2rem] bg-white shadow-2xl max-h-[88vh] overflow-y-auto overscroll-contain" onClick={function (e) { e.stopPropagation() }}>
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <p className="font-bold text-slate-900">{props.title || 'Detail'}</p>
            <button onClick={props.onClose} aria-label="Tutup detail" className="h-9 w-9 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 grid place-items-center">
              <SizedIcon name="close" size={16} />
            </button>
          </div>
          <div className="p-6">{props.open ? props.children : isiSimpan.current}</div>
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
const [tampil, setTampil] = useState(props.open)
const propsSimpan = useRef(null)
if (props.open) propsSimpan.current = props
const p = props.open ? props : (propsSimpan.current || props)
const tutup = tampil && !props.open
useBodyScrollLock(!!props.open)
useEffect(function () {
if (props.open) { setTampil(true); return undefined }
if (!tampil) return undefined
const t = setTimeout(function () { setTampil(false) }, 200)
return function () { clearTimeout(t) }
}, [props.open, tampil])
if (!tampil) return null
return (
<div className={'anim-overlay fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-slate-900/60 p-4' + (tutup ? ' modal-tutup' : '')} onClick={p.onCancel}>
<div className="min-h-full flex items-center justify-center py-8">
<div className="anim-modal w-full max-w-md rounded-[2rem] bg-white shadow-2xl" onClick={function (e) { e.stopPropagation() }}>
<div className="p-6 space-y-4">
<div className="mx-auto h-14 w-14 rounded-2xl bg-red-100 text-red-600 grid place-items-center">
<SizedIcon name="trash" size={24} />
</div>
<div className="text-center">
<h3 className="text-xl font-black text-slate-900">{p.title || 'Hapus data ini?'}</h3>
<p className="mt-2 text-sm text-slate-600">{p.message}</p>
</div>
<div className="grid grid-cols-2 gap-3">
<button type="button" onClick={p.onCancel} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
Batal
</button>
<button type="button" onClick={p.onConfirm} className="rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white hover:bg-red-600">
{p.confirmLabel || 'Ya, Hapus'}
</button>
</div>
</div>
</div>
</div>
</div>
)
}


export function MediaDrive(props) {
  const [gagal, setGagal] = useState(false)
  useEffect(function () {
    setGagal(false)
  }, [props.driveId])
  if (gagal) {
    return (
      <div className={'grid place-items-center bg-gradient-to-br from-slate-800 to-slate-900 ' + (props.className || 'absolute inset-0 h-full w-full')}>
        <div className="flex flex-col items-center gap-2 text-slate-300">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white/10">
            <SizedIcon name="image" size={22} />
          </span>
          <p className="px-2 text-center text-[11px] font-semibold">Video Google Drive</p>
        </div>
      </div>
    )
  }
  return (
    <img
      src={driveThumbUrl(props.driveId)}
      alt={props.alt || 'Video Google Drive'}
      onClick={props.onClick || undefined}
      onError={function () { setGagal(true) }} loading="lazy" decoding="async"
      className={(props.className || 'absolute inset-0 h-full w-full object-cover') + (props.onClick ? ' cursor-zoom-in' : '')}
    />
  )
}
export function Lightbox(props) {
  useBodyScrollLock(true)
  const [busyUnduh, setBusyUnduh] = useState(false)
  const [tutup, setTutup] = useState(false)
  const sedangTutup = useRef(false)
  function mintaTutup() {
    if (sedangTutup.current) return
    sedangTutup.current = true
    setTutup(true)
    setTimeout(function () { props.onClose() }, 200)
  }
  useEffect(function () {
    function onKey(e) {
      if (e.key === 'Escape') mintaTutup()
    }
    document.addEventListener('keydown', onKey)
    return function () { document.removeEventListener('keydown', onKey) }
  }, [])
  async function unduh() {
    if (busyUnduh) return
    setBusyUnduh(true)
    if (props.driveId) {
      try {
        const nama = (props.title ? props.title.replace(/[\/\\:*?"<>|]/g, '').replace(/\s+/g, '-').substring(0, 60) : 'video-' + props.driveId) + '.mp4'
        const a = document.createElement('a')
        a.href = driveDownloadUrl(props.driveId)
        a.download = nama
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        setTimeout(function () { a.remove() }, 1000)
      } catch (err) {
        window.open(driveDownloadUrl(props.driveId), '_blank')
      }
      setBusyUnduh(false)
      return
    }
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
  const tombolUnduhTerlihat = !!props.driveId || !props.youtubeId
  return createPortal(
    <div className={'anim-overlay fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/95 p-4' + (tutup ? ' lightbox-tutup' : '')} onClick={mintaTutup}>
      <div className="lightbox-isi relative w-full max-w-5xl" onClick={function (e) { e.stopPropagation() }}>
        {props.youtubeId ? (
          <PemutarVideo key={props.youtubeId} youtubeId={props.youtubeId} title={props.title || 'Video'} className="mx-auto aspect-video w-full rounded-2xl" />
        ) : props.type === 'video' ? (
          <video src={props.src} controls autoPlay className="mx-auto max-h-[85vh] w-full rounded-2xl bg-slate-900 object-contain" />
        ) : (
          <img
            src={props.src}
            alt={props.title || 'Media'}
            onClick={mintaTutup}
            className="mx-auto max-h-[85vh] w-auto max-w-full cursor-zoom-out rounded-2xl object-contain"
          />
        )}
        {props.title ? <p className="mt-3 truncate text-center text-sm text-slate-300">{props.title}</p> : null}
      </div>
      <div className="absolute right-4 top-4 flex gap-2">
        <button
          type="button"
          title={busyUnduh ? 'Menyiapkan unduhan...' : (props.driveId ? 'Unduh video dari Google Drive' : 'Unduh media')}
          onClick={unduh}
          disabled={busyUnduh}
          style={tombolUnduhTerlihat ? undefined : { display: 'none' }}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
        >
          <SizedIcon name="download" size={18} />
        </button>
        <button
          type="button"
          title="Tutup (Esc)"
          onClick={mintaTutup}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <SizedIcon name="close" size={18} />
        </button>
      </div>
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-400">
        {props.driveId ? 'Video diputar dari YouTube, unduhan diambil dari Google Drive' : 'Klik media atau tekan Esc untuk menutup'}
      </p>
    </div>
  , document.body)
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

export function Avatar(props) {
  const ukuran = { sm: 36, md: 44, lg: 56, xl: 96, '2xl': 160 }
  const px = ukuran[props.size] || 44
  const radius = Math.round(px * 0.28) + 'px'
  const nama = props.nama || ''
  const kata = nama.trim().split(/\s+/)
  const inisial = nama ? ((kata[0] ? kata[0].charAt(0) : '') + (kata[1] ? kata[1].charAt(0) : '')).toUpperCase() : '?'
  const palet = ['#166534', '#15803d', '#a16207', '#ca8a04', '#334155', '#047857']
  let hash = 0
  for (let i = 0; i < nama.length; i++) hash = (hash * 31 + nama.charCodeAt(i)) >>> 0
  const warna = palet[hash % palet.length]
  const bisaKlik = typeof props.onClick === 'function'
  const gaya = {
    boxSizing: 'content-box',
    display: 'inline-block',
    width: px + 'px',
    height: px + 'px',
    padding: 0,
    margin: 0,
    borderRadius: radius,
    overflow: 'hidden',
    position: 'relative',
    verticalAlign: 'middle',
    flexShrink: 0,
    background: props.src ? '#ffffff' : warna,
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.10), 0 10px 28px rgba(15, 23, 42, 0.22)',
    cursor: bisaKlik ? 'pointer' : 'default',
    outline: 'none',
    lineHeight: 0
  }
  const gayaFoto = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    display: 'block',
    borderRadius: radius
  }
  const gayaTeks = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: 800,
    fontSize: Math.round(px * 0.36) + 'px'
  }
  if (bisaKlik) {
    return (
      <button type="button" onClick={props.onClick} title={props.title} style={gaya}>
        {props.src ? <img src={props.src} alt={nama || 'Foto profil'} style={gayaFoto} loading="lazy" decoding="async" /> : <span style={gayaTeks}>{inisial}</span>}
      </button>
    )
  }
  return (
    <span style={gaya}>
      {props.src ? <img src={props.src} alt={nama || 'Foto profil'} style={gayaFoto} loading="lazy" decoding="async" /> : <span style={gayaTeks}>{inisial}</span>}
    </span>
  )
}

export function Pagination(props) {
  /* pagination-v2: tombol nomor halaman sesuai tema BSI */
  const totalItems = props.totalItems || 0
  const perPage = props.perPage || 10
  const page = props.page || 1
  const onPageChange = props.onPageChange || function () {}
  const totalPages = Math.ceil(totalItems / perPage)
  if (!totalItems) return null
  const halaman = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) halaman.push(i)
  } else {
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        halaman.push(i)
      } else if (halaman[halaman.length - 1] !== '...') {
        halaman.push('...')
      }
    }
  }
  const clsAngka = 'grid h-10 min-w-10 place-items-center rounded-xl px-3 text-sm font-bold transition '
  const clsNav = 'flex h-10 items-center rounded-xl px-4 text-sm font-semibold transition '
  const clsNetral = 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-bsi-800'
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {totalPages > 1 ? (
        <button
          type="button"
          disabled={page <= 1}
          onClick={function () { onPageChange(page - 1) }}
          className={clsNav + clsNetral + ' disabled:cursor-not-allowed disabled:opacity-40'}
        >
          Sebelumnya
        </button>
      ) : null}
      {halaman.map(function (h, idx) {
        if (h === '...') {
          return <span key={'lompat' + idx} className="px-1 text-sm font-bold text-slate-600">...</span>
        }
        const aktif = h === page
        return (
          <button
            key={'hal' + h}
            type="button"
            onClick={function () { onPageChange(h) }}
            className={clsAngka + (aktif
              ? 'bg-bsi-800 text-white shadow-lg shadow-bsi-900/25'
              : clsNetral)}
          >
            {h}
          </button>
        )
      })}
      {totalPages > 1 ? (
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={function () { onPageChange(page + 1) }}
          className={clsNav + clsNetral + ' disabled:cursor-not-allowed disabled:opacity-40'}
        >
          Berikutnya
        </button>
      ) : null}
    </div>
  )
}

const ToastContext = createContext(null)
 export function ToastProvider(props) {
  const [toasts, setToasts] = useState([])
  function tutupToast(id) {
    setToasts(function (prev) { return prev.map(function (t) { return t.id === id ? Object.assign({}, t, { tutup: true }) : t }) })
    setTimeout(function () {
      setToasts(function (prev) { return prev.filter(function (t) { return t.id !== id }) })
    }, 240)
  }
  function tambahToast(tipe, pesan) {
    const id = Date.now() + Math.random()
    setToasts(function (prev) { return prev.concat([{ id: id, tipe: tipe, pesan: pesan, tutup: false }]) })
    setTimeout(function () { tutupToast(id) }, 4000)
  }
  function toastSukses(pesan) { tambahToast('sukses', pesan) }
  function toastGagal(pesan) { tambahToast('gagal', pesan) }
  return (
    <ToastContext.Provider value={{ sukses: toastSukses, gagal: toastGagal }}>
      {props.children}
      <div className="toast-wadah fixed z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(function (t) {
          const sukses = t.tipe === 'sukses'
          return (
            <div key={t.id} className={'toast-kartu pointer-events-auto flex items-center gap-3 ' + (sukses ? 'toast-sukses' : 'toast-gagal') + (t.tutup ? ' toast-keluar' : '')}>
              <span className={'toast-ikon ' + (sukses ? 'toast-ikon-sukses' : 'toast-ikon-gagal')}>
                <SizedIcon name={sukses ? 'check' : 'close'} size={15} />
              </span>
              <p className="toast-teks flex-1 text-sm font-semibold">{t.pesan}</p>
              <button type="button" onClick={function () { tutupToast(t.id) }} title="Tutup notifikasi"
                className="toast-tutup grid h-7 w-7 shrink-0 place-items-center rounded-lg">
                <SizedIcon name="close" size={13} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
export function useToast() {
   return useContext(ToastContext)
 }

export function SelubungPanel(props) {
  const [tampil, setTampil] = useState(props.open)
  const tutup = tampil && !props.open
  useEffect(function () {
    if (props.open) { setTampil(true); return undefined }
    if (!tampil) return undefined
    const t = setTimeout(function () { setTampil(false) }, 180)
    return function () { clearTimeout(t) }
  }, [props.open, tampil])
  if (!tampil) return null
  return <div className={'selubung-panel' + (tutup ? ' panel-tutup' : '')}>{props.children}</div>
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
.media-carousel button:active { transform: scale(.97); }

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

.pemutar-bungkus iframe {
  pointer-events: none;
  border: 0;
  background: transparent;
}

/* Pemutar video referensi: iframe cropping & slider custom */
.pemutar-referensi iframe {
  pointer-events: none;
  border: 0;
  background: transparent;
}
.pemutar-referensi:fullscreen {
  border-radius: 0;
  max-width: none;
  width: 100vw;
  height: 100vh;
}
.pemutar-progress::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #166534;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}
.pemutar-progress::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #166534;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}
.pemutar-volume::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #eab308;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}
.pemutar-volume::-moz-range-thumb {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #eab308;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}

/* pusat-pemutar-v3: iframe mengisi wadah persis, layar penuh menengahkan video */
.pemutar-referensi iframe {
  pointer-events: none;
  border: 0;
  background: transparent;
  position: absolute;
  left: 0;
  top: 0;
  width: 100% !important;
  height: 100% !important;
}
.pemutar-referensi:fullscreen {
  aspect-ratio: auto !important;
  width: 100vw !important;
  height: 100vh !important;
  max-width: none !important;
  border-radius: 0 !important;
  background: #000;
}

/* pusat-pemutar-v4: margin crop 70px menyembunyikan seluruh chrome bawaan YouTube */
.pemutar-referensi iframe {
  position: absolute !important;
  top: -70px !important;
  left: -2px !important;
  width: calc(100% + 4px) !important;
  height: calc(100% + 140px) !important;
  pointer-events: none !important;
  border: 0 !important;
  background: #000 !important;
}
.pemutar-referensi:fullscreen {
  aspect-ratio: auto !important;
  width: 100vw !important;
  height: 100vh !important;
  max-width: none !important;
  border-radius: 0 !important;
  background: #000 !important;
}

/* grid-pusat: baris kartu yang tidak penuh otomatis rata tengah */
.grid-pusat { display: flex; flex-wrap: wrap; justify-content: center; gap: 1.25rem; }
.grid-pusat-rapat { display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; }
.kolom-kartu, .kolom-kartu-rapat { width: 100%; display: flex; }
.kolom-kartu > *, .kolom-kartu-rapat > * { width: 100%; }
@media (min-width: 768px) {
  .kolom-kartu { width: calc(50% - 0.625rem); }
  .kolom-kartu-rapat { width: calc(50% - 0.5rem); }
}
@media (min-width: 1280px) {
  .kolom-kartu { width: calc(33.3333% - 0.83333rem); }
  .kolom-kartu-rapat { width: calc(33.3333% - 0.66667rem); }
}

/* toast-modern-v1: kartu glass blur, ikon kotak berwarna lembut, posisi responsif, animasi masuk dan keluar */
.toast-wadah {
  top: 1rem;
  left: 1rem;
  right: 1rem;
}
@media (min-width: 640px) {
  .toast-wadah {
    left: auto;
    right: 1.25rem;
    top: 1.25rem;
    width: 100%;
    max-width: 24rem;
  }
}
@keyframes toastIn {
  from { opacity: 0; transform: translateY(-14px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes toastOut {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to { opacity: 0; transform: translateY(-10px) scale(0.97); }
}
.toast-kartu {
  border-radius: 1rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 12px 32px -8px rgba(15, 23, 42, 0.18), 0 2px 8px rgba(15, 23, 42, 0.06);
  padding: 0.75rem 0.875rem;
  animation: toastIn 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}
.toast-keluar {
  animation: toastOut 0.22s ease-in forwards;
}
.toast-ikon {
  display: grid;
  place-items: center;
  height: 2rem;
  width: 2rem;
  flex-shrink: 0;
  border-radius: 0.625rem;
}
.toast-ikon-sukses { background: rgba(16, 185, 129, 0.12); color: #059669; }
.toast-ikon-gagal { background: rgba(239, 68, 68, 0.12); color: #dc2626; }
.toast-sukses { border-color: rgba(16, 185, 129, 0.28); }
.toast-gagal { border-color: rgba(239, 68, 68, 0.28); }
.toast-teks { color: #1e293b; }
.toast-tutup { color: #94a3b8; transition: background-color 0.15s ease, color 0.15s ease; }
.toast-tutup:hover { background: rgba(15, 23, 42, 0.06); color: #475569; }
.dark .toast-kartu {
  background: rgba(15, 23, 42, 0.92);
  border-color: rgba(51, 65, 85, 0.7);
  box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.4);
}
.dark .toast-ikon-sukses { background: rgba(16, 185, 129, 0.16); color: #34d399; }
.dark .toast-ikon-gagal { background: rgba(239, 68, 68, 0.16); color: #f87171; }
.dark .toast-sukses { border-color: rgba(52, 211, 153, 0.35); }
.dark .toast-gagal { border-color: rgba(248, 113, 113, 0.35); }
.dark .toast-teks { color: #f1f5f9; }
.dark .toast-tutup { color: #64748b; }
.dark .toast-tutup:hover { background: rgba(255, 255, 255, 0.08); color: #cbd5e1; }
/* animasi-halus-v1: seluruh animasi tambahan hanya memakai transform dan opacity agar ringan di device low end */
@keyframes cardFadeIn {
  from { opacity: 0; transform: translateY(14px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.grid-pusat > *, .grid-pusat-rapat > *, .kartu-grid > * {
  animation: cardFadeIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) backwards;
  backface-visibility: hidden;
}
.grid-pusat > *:nth-child(1), .grid-pusat-rapat > *:nth-child(1), .kartu-grid > *:nth-child(1) { animation-delay: 0s; }
.grid-pusat > *:nth-child(2), .grid-pusat-rapat > *:nth-child(2), .kartu-grid > *:nth-child(2) { animation-delay: 0.05s; }
.grid-pusat > *:nth-child(3), .grid-pusat-rapat > *:nth-child(3), .kartu-grid > *:nth-child(3) { animation-delay: 0.1s; }
.grid-pusat > *:nth-child(4), .grid-pusat-rapat > *:nth-child(4), .kartu-grid > *:nth-child(4) { animation-delay: 0.15s; }
.grid-pusat > *:nth-child(5), .grid-pusat-rapat > *:nth-child(5), .kartu-grid > *:nth-child(5) { animation-delay: 0.2s; }
.grid-pusat > *:nth-child(6), .grid-pusat-rapat > *:nth-child(6), .kartu-grid > *:nth-child(6) { animation-delay: 0.25s; }
.grid-pusat > *:nth-child(7), .grid-pusat-rapat > *:nth-child(7), .kartu-grid > *:nth-child(7) { animation-delay: 0.3s; }
.grid-pusat > *:nth-child(8), .grid-pusat-rapat > *:nth-child(8), .kartu-grid > *:nth-child(8) { animation-delay: 0.35s; }
.grid-pusat > *:nth-child(9), .grid-pusat-rapat > *:nth-child(9), .kartu-grid > *:nth-child(9) { animation-delay: 0.4s; }
.grid-pusat > *:nth-child(10), .grid-pusat-rapat > *:nth-child(10), .kartu-grid > *:nth-child(10) { animation-delay: 0.45s; }
.grid-pusat > *:nth-child(11), .grid-pusat-rapat > *:nth-child(11), .kartu-grid > *:nth-child(11) { animation-delay: 0.5s; }
.grid-pusat > *:nth-child(12), .grid-pusat-rapat > *:nth-child(12), .kartu-grid > *:nth-child(12) { animation-delay: 0.55s; }
/* efek terangkat hanya untuk kartu, tidak untuk panel form */
.kolom-kartu > .card-hover, .kolom-kartu-rapat > .card-hover, .kartu-grid > .card-hover {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease, border-color 0.25s ease, background-color 0.2s ease;
}
.kolom-kartu > .card-hover:hover, .kolom-kartu-rapat > .card-hover:hover, .kartu-grid > .card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 28px -10px rgba(15, 23, 42, 0.14);
}
.dark .kolom-kartu > .card-hover:hover, .dark .kolom-kartu-rapat > .card-hover:hover, .dark .kartu-grid > .card-hover:hover {
  box-shadow: 0 14px 28px -10px rgba(0, 0, 0, 0.55);
}
/* transisi tombol dan tautan ditambah transform supaya efek tekan terasa mulus */
button, a {
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease, transform 0.15s ease;
}
button:active:not(:disabled) { transform: scale(0.96); }
/* konten tab dashboard beranimasi setiap kali tab diganti */
.anim-tab { animation: appFadeUp 0.28s ease; }
/* filterSlide versi murah: tanpa max-height supaya tidak memicu layout tiap frame */
@keyframes filterSlide {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
.anim-filter { animation: filterSlide 0.28s ease; }
html { scroll-behavior: smooth; }
* { -webkit-tap-highlight-color: transparent; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* modal-tutup: animasi keluar saat detail ditutup, memakai struktur anak supaya tidak bergantung nama kelas */
@keyframes modalPopOut {
  from { opacity: 1; transform: scale(1) translateY(0); }
  to { opacity: 0; transform: scale(0.94) translateY(12px); }
}
@keyframes overlayFadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
.modal-tutup { pointer-events: none; }
.modal-tutup.anim-overlay { animation: overlayFadeOut 0.2s ease-in forwards; }
.modal-tutup .anim-modal { animation: modalPopOut 0.2s ease-in forwards; }
.modal-tutup .anim-overlay { animation: overlayFadeOut 0.2s ease-in forwards; }

/* header-detail-sticky: judul dan tombol tutup popup detail tetap terlihat saat isi digulir di dalam panel */
.anim-modal > div:first-child {
  position: sticky;
  top: 0;
  z-index: 40;
  background: inherit;
}
.anim-modal > * + * {
  position: relative;
  z-index: 1;
  isolation: isolate;
}

/* scrollbar-otohide: scrollbar bawaan dinolkan lebarnya, indikator overlay muncul hanya saat menggulir */
* {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}
*::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
}
#scroll-indicator {
  position: fixed;
  right: 2px;
  top: 0;
  width: 4px;
  z-index: 95;
  border-radius: 9999px;
  opacity: 0;
  transition: opacity 0.18s ease;
  pointer-events: none;
}
#scroll-indicator.aktif { opacity: 1; }
#scroll-thumb {
  width: 3px;
  margin-left: 0.5px;
  border-radius: 9999px;
  background: rgba(100, 116, 139, 0.55);
}
.dark #scroll-thumb { background: rgba(148, 163, 184, 0.55); }

/* panel-keluar: animasi keluar dropdown, date picker, dan panel filter */
@keyframes panelOut {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to { opacity: 0; transform: translateY(-6px) scale(0.98); }
}
.panel-tutup { pointer-events: none; }
.panel-tutup .anim-modal, .panel-tutup .anim-filter { animation: panelOut 0.18s ease-in forwards; }

/* ganti-mode-waktu: animasi halus saat berpindah antara pilihan bulan dan rentang waktu */
@keyframes gantiBulan {
from { opacity: 0; transform: translateX(-10px) scale(0.98); }
to { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes gantiRentang {
from { opacity: 0; transform: translateX(10px) scale(0.98); }
to { opacity: 1; transform: translateX(0) scale(1); }
}
.anim-ganti-bulan { animation: gantiBulan 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.anim-ganti-rentang { animation: gantiRentang 0.25s cubic-bezier(0.16, 1, 0.3, 1); }

/* mode-smooth-v2: easing lebih lembut untuk masuk, bayangan cabang untuk keluar, tetangga bergeser mulus */
@keyframes gantiBulan {
from { opacity: 0; transform: translateY(6px) scale(0.99); }
to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes gantiRentang {
from { opacity: 0; transform: translateY(6px) scale(0.99); }
to { opacity: 1; transform: translateY(0) scale(1); }
}
.anim-ganti-bulan { animation: gantiBulan 0.32s cubic-bezier(0.22, 1, 0.36, 1); }
.anim-ganti-rentang { animation: gantiRentang 0.32s cubic-bezier(0.22, 1, 0.36, 1); }
.hantu-cabang { pointer-events: none; }

/* transisi-tema: pergantian mode pelan dan mulus, hanya aktif sesaat saat mode diganti supaya interaksi biasa tetap ringan */
.theme-transition, .theme-transition *, .theme-transition *::before, .theme-transition *::after {
  transition: background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.35s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
  transition-delay: 0s !important;
}

/* skeleton-sesi: bar berkilau untuk tampilan memuat sesi dashboard */
.skeleton-bar {
  position: relative;
  overflow: hidden;
  background: #e2e8f0;
}
.dark .skeleton-bar { background: #1e293b; }
.skeleton-bar::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
  animation: skeletonSweep 1.4s ease-in-out infinite;
}
.dark .skeleton-bar::after {
  background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.18), transparent);
}
@keyframes skeletonSweep {
  100% { transform: translateX(100%); }
}

/* transisi-tema-v3: crossfade snapshot di kompositor, bebas lukis ulang elemen */
::view-transition-old(root), ::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
::view-transition-old(root) { z-index: 1; }
::view-transition-new(root) { z-index: 2; }
@keyframes vtTema {
  from { opacity: 0; }
  to { opacity: 1; }
}
::view-transition-new(root) { animation: vtTema 0.4s ease; }
/* selama fallback transisi warna berjalan, matikan blur mahal supaya tidak patah */
.theme-transition [class*="backdrop-blur"] { backdrop-filter: none !important; }

/* footer-ramping: ruang bawah halaman dirapatkan supaya footer slim terasa pas */
main { padding-bottom: 2.5rem !important; }

/* menu-mobile-v2: tinggi menu diinterpolasi persis lewat grid rows, transisi bisa dipotong di tengah jadi terasa halus seperti aplikasi native */
.menu-mobile-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.36s cubic-bezier(0.32, 0.72, 0, 1);
}
.menu-mobile-wrap.menu-mobile-buka { grid-template-rows: 1fr; }
.menu-mobile-dalam {
  overflow: hidden;
  min-height: 0;
  visibility: hidden;
  transition: visibility 0.36s;
}
.menu-mobile-buka .menu-mobile-dalam { visibility: visible; }
.menu-mobile-isi {
  opacity: 0;
  transform: translateY(-8px);
  transition: opacity 0.2s ease, transform 0.24s cubic-bezier(0.32, 0.72, 0, 1);
}
.menu-mobile-buka .menu-mobile-isi {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.34s ease 0.08s, transform 0.4s cubic-bezier(0.32, 0.72, 0, 1) 0.05s;
}

/* filter-mobile-v1: panel filter mengembang dan merapat mulus di mobile dan tablet, tiap kontrol muncul berurutan */
.filter-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.36s cubic-bezier(0.32, 0.72, 0, 1);
}
.filter-wrap-buka { grid-template-rows: 1fr; }
.filter-dalam {
  overflow: hidden;
  min-height: 0;
  visibility: hidden;
  transition: visibility 0.36s;
}
.filter-wrap-buka .filter-dalam { visibility: visible; }
/* fix-filter-dropdown: clip dilepas setelah panel selesai mengembang supaya dropdown dan date picker bebas keluar panel seperti semula */
.filter-dalam-santai { overflow: visible; }
.filter-isi {
  margin-top: 1rem;
  opacity: 0;
  transform: translateY(-8px);
  transition: opacity 0.2s ease, transform 0.24s cubic-bezier(0.32, 0.72, 0, 1);
}
.filter-wrap-buka .filter-isi {
  opacity: 1;
  transform: none;
  transition: opacity 0.34s ease 0.06s, transform 0.4s cubic-bezier(0.32, 0.72, 0, 1) 0.04s;
}
.filter-isi > * {
  opacity: 0;
  transform: translateY(-6px);
  transition: opacity 0.16s ease, transform 0.2s cubic-bezier(0.32, 0.72, 0, 1);
}
.filter-wrap-buka .filter-isi > * {
  opacity: 1;
  transform: none;
}
.filter-wrap-buka .filter-isi > *:nth-child(1) { transition-delay: 0.08s; }
.filter-wrap-buka .filter-isi > *:nth-child(2) { transition-delay: 0.14s; }
.filter-wrap-buka .filter-isi > *:nth-child(3) { transition-delay: 0.2s; }
.filter-wrap-buka .filter-isi > *:nth-child(4) { transition-delay: 0.26s; }
.filter-wrap-buka .filter-isi > *:nth-child(5) { transition-delay: 0.32s; }
.filter-wrap-buka .filter-isi > *:nth-child(6) { transition-delay: 0.38s; }
@media (min-width: 1280px) {
  .filter-wrap { grid-template-rows: 1fr; }
  .filter-dalam { visibility: visible; overflow: visible; }
  .filter-isi { opacity: 1; transform: none; }
  .filter-isi > * { opacity: 1; transform: none; transition: none; }
}

/* transisi-tema-v4: capture snapshot bersih, navbar tidak berkedip dan tepi layar tidak menyala putih saat crossfade */
.vt-tema, .vt-tema *, .vt-tema *::before, .vt-tema *::after {
  transition: none !important;
}
.vt-tema [class*="backdrop-blur"] {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* lightbox-anim-v1: masuk keluar lightbox mulus, keluar memakai animasi mundur sebelum dilepas */
@keyframes lightboxIn {
  from { opacity: 0; transform: scale(0.96) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes lightboxOut {
  from { opacity: 1; transform: scale(1) translateY(0); }
  to { opacity: 0; transform: scale(0.96) translateY(8px); }
}
.lightbox-isi { animation: lightboxIn 0.28s cubic-bezier(0.16, 1, 0.3, 1); }
.lightbox-tutup { pointer-events: none; }
.lightbox-tutup.anim-overlay { animation: overlayFadeOut 0.2s ease-in forwards; }
.lightbox-tutup .lightbox-isi { animation: lightboxOut 0.2s ease-in forwards; }

/* sentuh-responsif-v1: matikan deteksi double-tap zoom supaya ketukan langsung menjadi klik tanpa jeda di browser tablet */
* { touch-action: manipulation; }
/* umpan balik tekan lebih sigap di layar sentuh: efek mengecil terjadi hampir instan, saat dilepas tetap mulus */
button:active:not(:disabled), a:active, .clickable:active { transition-duration: 0.06s; }

/* klik-halus-v1: kartu clickable menekan dan melepas pakai kurva mulus, hentakan saat kartu galeri diketuk hilang */
.clickable {
  transition: transform 0.24s cubic-bezier(0.32, 0.72, 0, 1), box-shadow 0.24s ease, opacity 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}
.clickable:active {
  transform: scale(0.985);
  transition-duration: 0.09s;
}

/* rentang-tablet-v1: jaring pengaman agar isi panel filter tidak bisa menonjol keluar lebar baris saat cabang waktu muncul */
.filter-isi { overflow-x: clip; }

/* kepala-dash-responsif: avatar header dashboard mengecil proporsional di layar sempit, desktop tetap 96px */
@media (max-width: 639px) {
  .avatar-kepala-dash > button, .avatar-kepala-dash > span {
    width: 56px !important;
    height: 56px !important;
    border-radius: 16px !important;
  }
  .avatar-kepala-dash img { border-radius: 16px !important; }
  .avatar-kepala-dash > button > span, .avatar-kepala-dash > span > span {
    font-size: 20px !important;
  }
}

/* proporsional-mobile-v1: teks header dashboard, avatar profil, dan iframe video menyesuaikan layar sempit */
@media (max-width: 639px) {
  .avatar-kepala-dash ~ div h1 { font-size: 1.125rem !important; line-height: 1.625rem !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }
  .avatar-kepala-dash ~ div p { font-size: 0.75rem !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }
  .avatar-kepala-dash ~ div .inline-flex { font-size: 0.625rem !important; padding: 0.25rem 0.5rem !important; }
  
  .avatar-profil-tab > button, .avatar-profil-tab > span {
    width: 96px !important;
    height: 96px !important;
    border-radius: 24px !important;
  }
  .avatar-profil-tab img { border-radius: 24px !important; }
  .avatar-profil-tab ~ h2 { font-size: 1.25rem !important; margin-top: 0.75rem !important; }
  .avatar-profil-tab ~ p { font-size: 0.875rem !important; }
  
  .stats-profil-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 0.5rem !important; }
  /* dihapus agar kolom ketiga tidak memanjang sendiri */
  
  .iframe-video-wrap { position: relative !important; padding-bottom: 56.25% !important; height: 0 !important; overflow: hidden !important; border-radius: 1rem !important; }
  .iframe-video-wrap iframe { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; border: 0 !important; }
}
@media (min-width: 640px) {
  .stats-profil-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

/* performa-mobile-v1: header padat tanpa blur di layar sempit supaya scroll dan paint murah di ponsel */
@media (max-width: 639px) {
  header.sticky {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    background-color: rgba(255, 255, 255, 0.97) !important;
  }
  .dark header.sticky { background-color: rgba(2, 6, 23, 0.97) !important; }
}
```

## File: src/pages/DashboardPage.jsx
```javascript
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { uploadMedia, deleteMedia } from '../lib/upload.js'
import { syncGaleriFromLogbook } from '../lib/logbook.js'
import { parseYouTubeId, ytThumb, fetchYouTubeQuota, unggahVideoYouTube } from '../lib/youtube.js'
import { parseDriveId, driveThumbUrl, driveViewUrl } from '../lib/drive.js'
import { uploadFotoProfil, updateFotoProfilMahasiswa, hapusFotoProfil } from '../lib/profil.js'
import { Avatar } from '../components/ui.jsx'
import { supabase as sbClient } from '../lib/supabase.js'
import { pratinjauHeic, formatHeic } from '../lib/konversi.js'
import { LabelProses } from '../components/ui.jsx'
import { todayInput, detectMediaType, matchesDateFilters, urutkanTanggal } from '../lib/format.js'
import { KATEGORI, UNIT, GALERI_KEGIATAN } from '../lib/constants.js'
import { EmptyState, Modal, ConfirmModal, inputCls, labelCls, btnPrimary, btnSmall, AutoTextArea, Pagination, useToast } from '../components/ui.jsx'
import { LogbookCard, LogbookDetail, GalleryCard, GalleryDetail, AttendanceCard, AttendanceDetail } from '../components/cards.jsx'
import { CustomSelect, CustomDateInput, FileInput } from '../components/controls.jsx'
import { SizedIcon, ICONS } from '../components/icons.jsx'
import { FilterBar, FilterSelect, TimeFilter, countActiveFilters, SortSelect } from '../components/FilterBar.jsx'

function newItem() {
  return { key: Math.random().toString(36).slice(2), judul: '', deskripsi: '', hasil: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false, show: false, mode: 'foto', ytLink: '', oldYtId: null, oldSource: 'r2', driveLink: '' }
}

const LOG_INITIAL = { kategori: '', status: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }
const GAL_INITIAL = { kegiatan: '', tipe: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }
const HADIR_INITIAL = { status: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }
const PER_PAGE_DASH = 6

function ModeIndicator(props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ' + (props.edit ? 'bg-gold-500/15 text-amber-700 dark:text-amber-400' : 'bg-bsi-100 text-bsi-900')}>
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
  const toast = useToast()
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
  const [ytQuotaLoading, setYtQuotaLoading] = useState(true)
  const [showUploadFoto, setShowUploadFoto] = useState(false)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [fotoFile, setFotoFile] = useState(null)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [, setVersiFoto] = useState(0)
  const [galMode, setGalMode] = useState('foto')
  const [galYtLink, setGalYtLink] = useState('')
   const [galDriveLink, setGalDriveLink] = useState('')
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
   const [logPage, setLogPage] = useState(1)
   const [galPage, setGalPage] = useState(1)
   const [hadirPage, setHadirPage] = useState(1)
   const refListLog = useRef(null)
const refFormLog = useRef(null)
const refFormGal = useRef(null)
const refFormHadir = useRef(null)
   const refListGal = useRef(null)
   const refListHadir = useRef(null)

  async function refresh() {
    if (!mahasiswa) return
    const l = await supabase.from('logbooks').select('*, mahasiswa(*), logbook_items(*)')
      .eq('mahasiswa_id', mahasiswa.id).order('tanggal', { ascending: false })
      .order('urutan', { ascending: true, referencedTable: 'logbook_items' })
    const g = await supabase.from('galeri').select('*, mahasiswa(*)').eq('mahasiswa_id', mahasiswa.id).order('tanggal', { ascending: false })
    const h = await supabase.from('daftar_hadir').select('*, mahasiswa(*)').eq('mahasiswa_id', mahasiswa.id).order('tanggal', { ascending: false })
    setLogs(l.data || [])
    setGaleri(g.data || [])
    setHadir(h.data || [])
  }

  useEffect(function () {
    if (mahasiswa) refresh()
    setYtQuotaLoading(true)
    fetchYouTubeQuota().then(function (data) {
      setYtQuota(data)
      setYtQuotaLoading(false)
    })
    const iv = setInterval(function () { fetchYouTubeQuota().then(function (data) { setYtQuota(data); setYtQuotaLoading(false) }) }, 30000)
    return function () { clearInterval(iv) }
  }, [mahasiswa])

   useEffect(function () {
     setLogPage(1)
     setGalPage(1)
     setHadirPage(1)
   }, [logFilter, galFilter, hadirFilter, sort])

  if (loading || !mahasiswa) {
    return <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:py-8">
<div className="space-y-6">
<div className="flex items-center gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
<div className="skeleton h-14 w-14 rounded-2xl"></div>
<div className="flex-1 space-y-2">
<div className="skeleton h-4 w-44 rounded-full"></div>
<div className="skeleton h-3 w-28 rounded-full"></div>
</div>
<div className="skeleton h-10 w-28 rounded-2xl"></div>
</div>
<div className="grid items-start gap-6 xl:grid-cols-[0.9fr_1.1fr]">
<div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
<div className="skeleton h-5 w-36 rounded-full"></div>
<div className="skeleton h-10 w-full rounded-2xl"></div>
<div className="skeleton h-10 w-full rounded-2xl"></div>
<div className="skeleton h-20 w-full rounded-2xl"></div>
<div className="skeleton h-11 w-44 rounded-2xl"></div>
</div>
<div className="grid gap-5 md:grid-cols-2">
<div className="skeleton h-64 rounded-3xl"></div>
<div className="skeleton h-64 rounded-3xl"></div>
<div className="skeleton h-64 rounded-3xl"></div>
<div className="skeleton h-64 rounded-3xl"></div>
</div>
</div>
</div>
</div>
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
     if (String(url || '').indexOf('drive.google.com') !== -1 || String(url || '').indexOf('drive.usercontent.google.com') !== -1) return
     if (!/^https?:\/\//.test(String(url || ''))) return
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
     const menambahLog = !editLogId
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
          if (!id) { toast.gagal('Link video tidak valid pada kegiatan ' + (i + 1) + '.'); setBusy(false); return }
          mediaSource = 'youtube'
          youtubeId = id
          mediaPath = ytThumb(id)
          mediaThumb = ytThumb(id)
          mediaType = 'video'
        } else if (it.mode === 'video' && it.file) {
          if (ytQuota.remaining <= 0) { toast.gagal('Kuota upload video hari ini sudah habis. Gunakan link video.'); setBusy(false); return }
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
        } else if (it.mode === 'video' && !it.file && !it.ytLink && it.oldYtId) {
          mediaSource = 'youtube'
          youtubeId = it.oldYtId
          mediaPath = ytThumb(it.oldYtId)
          mediaThumb = ytThumb(it.oldYtId)
          mediaType = 'video'
        } else if (it.oldPath) {
          mediaPath = it.oldPath
          mediaType = detectMediaType(it.oldPath)
          mediaThumb = it.oldThumb || null
          mediaSource = 'r2'
          youtubeId = null
        }
        let driveIdLog = null
         if (it.mode === 'video' && it.driveLink) {
           driveIdLog = parseDriveId(it.driveLink)
           if (!driveIdLog) { toast.gagal('Link Google Drive tidak valid pada kegiatan ' + (i + 1) + '.'); setBusy(false); return }
         }
         clean.push({ judul: it.judul.trim(), deskripsi: it.deskripsi.trim(), hasil: it.hasil.trim(), media_path: mediaPath, media_type: mediaType, media_thumb: mediaThumb, media_source: mediaSource, youtube_id: youtubeId, drive_id: driveIdLog, show_in_gallery: it.show && !!mediaPath })
      }
      if (!clean.length) { toast.gagal('Tambahkan minimal satu kegiatan dengan judul.'); setBusy(false); return }

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
        return { logbook_id: logId, urutan: idx + 1, judul: c.judul, deskripsi: c.deskripsi, hasil: c.hasil, media_path: c.media_path, media_type: c.media_type, media_thumb: c.media_thumb, media_source: c.media_source, youtube_id: c.youtube_id, drive_id: c.drive_id, show_in_gallery: c.show_in_gallery }
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
       if (menambahLog) setLogPage(1)
       toast.sukses(menambahLog ? 'Logbook berhasil disimpan' : 'Logbook berhasil diperbarui')
    } catch (err) {
      toast.gagal('Gagal menyimpan logbook: ' + err.message)
    }
    setInfoProses('')
    setBusy(false)
  }

  function gulirKeForm(ref) {
requestAnimationFrame(function () {
if (ref && ref.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
})
}
function startEditLog(log) {
    setEditLogId(log.id)
    setForm({
      tanggal: log.tanggal, unit: log.unit || '', kategori: log.kategori, judul: log.judul,
      kendala: log.kendala || '', solusi: log.solusi || '', pembelajaran: log.pembelajaran || '', status: log.status
    })
    const mapped = (log.logbook_items || []).map(function (it) {
      return { key: it.id, judul: it.judul, deskripsi: it.deskripsi || '', hasil: it.hasil || '', file: null, preview: it.media_source === 'drive' ? driveThumbUrl(it.media_path) : (it.media_path || ''), oldPath: (it.media_source === 'youtube' || it.media_source === 'drive') ? '' : (it.media_path || ''), oldThumb: (it.media_source === 'youtube' || it.media_source === 'drive') ? '' : (it.media_thumb || ''), previewLoading: false, show: it.show_in_gallery, mode: (it.media_source === 'youtube' || it.media_source === 'drive') ? 'video' : (it.media_type === 'video' ? 'video' : 'foto'), ytLink: it.media_source === 'youtube' && it.youtube_id ? 'https://youtu.be/' + it.youtube_id : '', driveLink: it.drive_id ? driveViewUrl(it.drive_id) : '', oldYtId: it.youtube_id || null, oldSource: it.media_source || 'r2' }
    })
    setItems(mapped.length ? mapped : [newItem()])
    setTab('logbook')
    gulirKeForm(refFormLog)
  }

  function cancelEditLog() {
    setEditLogId(null)
    setForm({ tanggal: todayInput(), unit: '', kategori: '', judul: '', kendala: '', solusi: '', pembelajaran: '', status: 'draft' })
    setItems([newItem()])
  }

  function startEditGal(g) {
    setEditGalId(g.id)
    setGalForm({ judul: g.judul, deskripsi: g.deskripsi || '', tanggal: g.tanggal, kegiatan: g.kegiatan, file: null, preview: g.media_source === 'drive' ? driveThumbUrl(g.media_path) : (g.media_path || ''), oldPath: (g.media_source === 'youtube' || g.media_source === 'drive') ? '' : (g.media_path || ''), oldThumb: (g.media_source === 'youtube' || g.media_source === 'drive') ? '' : (g.media_thumb || ''), previewLoading: false })
    setGalMode((g.media_source === 'youtube' || g.media_source === 'drive') ? 'video' : (g.media_type === 'video' ? 'video' : 'foto'))
    setGalYtLink(g.media_source === 'youtube' && g.youtube_id ? 'https://youtu.be/' + g.youtube_id : '')
     setGalDriveLink(g.drive_id ? driveViewUrl(g.drive_id) : '')
    setGalOldYt(g.youtube_id || null)
    gulirKeForm(refFormGal)
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
    gulirKeForm(refFormHadir)
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
     const menambahGal = !editGalId
    try {
      let mediaPath = ''
      let mediaType = ''
      let mediaThumb = null
      let mediaSource = galOldYt ? 'youtube' : 'r2'
      let youtubeId = galOldYt || null
      if (galMode === 'video' && galYtLink && !galForm.file) {
        const id = parseYouTubeId(galYtLink)
        if (!id) { toast.gagal('Link video tidak valid.'); setBusy(false); return }
        mediaSource = 'youtube'
        youtubeId = id
        mediaPath = ytThumb(id)
        mediaThumb = ytThumb(id)
        mediaType = 'video'
      } else if (galMode === 'video' && galForm.file) {
        if (ytQuota.remaining <= 0) { toast.gagal('Kuota upload video hari ini sudah habis. Gunakan link video.'); setBusy(false); return }
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
      } else if (galMode === 'video' && !galForm.file && !galYtLink && galOldYt) {
        mediaSource = 'youtube'
        youtubeId = galOldYt
        mediaPath = ytThumb(galOldYt)
        mediaThumb = ytThumb(galOldYt)
        mediaType = 'video'
      } else if (galForm.oldPath) {
        mediaPath = galForm.oldPath
        mediaType = detectMediaType(galForm.oldPath)
        mediaThumb = galForm.oldThumb || null
        mediaSource = 'r2'
        youtubeId = null
      }
      if (!mediaPath) { toast.gagal('Galeri wajib memiliki media. Pilih file foto atau video terlebih dahulu.'); setBusy(false); return }
      let driveIdGal = null
      if (galMode === 'video' && galDriveLink) {
        driveIdGal = parseDriveId(galDriveLink)
        if (!driveIdGal) { toast.gagal('Link Google Drive tidak valid.'); setBusy(false); return }
      }
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
        youtube_id: youtubeId,
        drive_id: driveIdGal
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
       if (menambahGal) setGalPage(1)
       toast.sukses(menambahGal ? 'Media galeri berhasil disimpan' : 'Media galeri berhasil diperbarui')
    } catch (err) {
      toast.gagal('Gagal menyimpan galeri: ' + err.message)
    }
    setInfoProses('')
    setBusy(false)
  }

  function deleteGaleri(item) {
    setPendingDelete({ type: 'gal', data: item })
  }

    function pilihFotoProfil(e) {
    const f = e.target.files[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { toast.gagal('Ukuran foto maksimal 5 MB.'); e.target.value = ''; return }
    setFotoFile(f)
    const reader = new FileReader()
    reader.onloadend = function () { setFotoPreview(reader.result) }
    reader.readAsDataURL(f)
  }
  async function simpanFotoProfil() {
    if (!fotoFile) { toast.gagal('Pilih file foto terlebih dahulu.'); return }
    setUploadingFoto(true)
    try {
      const url = await uploadFotoProfil(fotoFile, mahasiswa.id, mahasiswa.foto_profil)
      await updateFotoProfilMahasiswa(mahasiswa.id, url)
      mahasiswa.foto_profil = url
      if (typeof refresh === 'function') await refresh()
      setVersiFoto(function (v) { return v + 1 })
      setShowUploadFoto(false)
      setFotoPreview(null)
      setFotoFile(null)
      toast.sukses('Foto profil berhasil disimpan')
    } catch (err) {
      toast.gagal('Gagal upload foto profil: ' + err.message)
    }
    setUploadingFoto(false)
  }
  async function hapusFotoProfilKu() {
    if (!window.confirm('Hapus foto profil saat ini?')) return
    try {
      await hapusFotoProfil(mahasiswa.id, mahasiswa.foto_profil)
      mahasiswa.foto_profil = null
      if (typeof refresh === 'function') await refresh()
      setVersiFoto(function (v) { return v + 1 })
      toast.sukses('Foto profil berhasil dihapus')
    } catch (err) {
      toast.gagal('Gagal menghapus foto profil: ' + err.message)
    }
  }
async function submitHadir(e) {
    e.preventDefault()
    setBusy(true)
     const menambahHadir = !editHadirId
    const payload = { mahasiswa_id: mahasiswa.id, tanggal: hadirForm.tanggal, status: hadirForm.status, alasan: hadirForm.status === 'Masuk' ? '' : hadirForm.alasan }
    if (editHadirId) {
      await supabase.from('daftar_hadir').update(payload).eq('id', editHadirId)
    } else {
      const res = await supabase.from('daftar_hadir').insert(payload)
      if (res.error) { toast.gagal('Kamu sudah punya catatan hadir di tanggal tersebut.'); setBusy(false); return }
    }
    setEditHadirId(null)
    setHadirForm({ tanggal: todayInput(), status: 'Masuk', alasan: '' })
    await refresh()
     if (menambahHadir) setHadirPage(1)
     toast.sukses(menambahHadir ? 'Daftar hadir berhasil disimpan' : 'Daftar hadir berhasil diperbarui')
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
    toast.sukses('Data berhasil dihapus')
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
   const logTotal = filteredLogs.length
   const logTotalPages = Math.max(1, Math.ceil(logTotal / PER_PAGE_DASH))
   const logPageAman = Math.min(logPage, logTotalPages)
   const paginatedLogs = sortedLogs.slice((logPageAman - 1) * PER_PAGE_DASH, logPageAman * PER_PAGE_DASH)
   const galTotal = filteredGaleri.length
   const galTotalPages = Math.max(1, Math.ceil(galTotal / PER_PAGE_DASH))
   const galPageAman = Math.min(galPage, galTotalPages)
   const paginatedGaleri = sortedGaleri.slice((galPageAman - 1) * PER_PAGE_DASH, galPageAman * PER_PAGE_DASH)
   const hadirTotal = filteredHadir.length
   const hadirTotalPages = Math.max(1, Math.ceil(hadirTotal / PER_PAGE_DASH))
   const hadirPageAman = Math.min(hadirPage, hadirTotalPages)
   const paginatedHadir = sortedHadir.slice((hadirPageAman - 1) * PER_PAGE_DASH, hadirPageAman * PER_PAGE_DASH)
   function gantiHalamanLog(p) {
     setLogPage(p)
     if (refListLog.current) refListLog.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
   }
   function gantiHalamanGal(p) {
     setGalPage(p)
     if (refListGal.current) refListGal.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
   }
   function gantiHalamanHadir(p) {
     setHadirPage(p)
     if (refListHadir.current) refListHadir.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
   }

  const editGalDerived = editGalId ? ((galeri.find(function (g) { return g.id === editGalId }) || {}).logbook_item_id || null) : null

    function gantiTab(tabBaru) {
    if (tabBaru !== tab) {
      cancelEditLog()
      cancelEditGal()
      cancelEditHadir()
      setTab(tabBaru)
    }
  }

  const tabCls = function (t) {
    return 'px-4 py-2.5 rounded-xl text-xs sm:px-5 sm:py-3 sm:rounded-2xl sm:text-sm font-bold ' + (tab === t ? 'bg-bsi-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
  }

  return (
    <div>
      <section className="card-hover rounded-[2rem] bg-white border border-slate-200 p-5 sm:p-8 lg:p-10 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
<div className="avatar-kepala-dash"><Avatar src={mahasiswa.foto_profil || null} nama={mahasiswa.nama} size="xl" onClick={function () { gantiTab('profil') }} title="Kelola foto profil" /></div>
<div className="min-w-0 flex-1">
            <h1 className="truncate text-lg sm:text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">{mahasiswa.nama}</h1>
            <p className="text-sm text-slate-600">NIM {mahasiswa.nim}</p>
{mahasiswa.prodi ? <p className="truncate text-sm text-slate-600">{mahasiswa.prodi}</p> : null}
          </div>
        </div>
        </div>
<div className="flex flex-wrap gap-2 sm:mt-8">
          <button onClick={function () { gantiTab('logbook') }} className={tabCls('logbook')}>Logbook</button>
          <button onClick={function () { gantiTab('galeri') }} className={tabCls('galeri')}>Galeri</button>
          <button onClick={function () { gantiTab('absen') }} className={tabCls('absen')}>Daftar Hadir</button>
<button onClick={function () { gantiTab('profil') }} className={tabCls('profil')}>Profil</button>
        </div>
      
</div></section>

      {tab === 'profil' ? (
<section className="anim-tab mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] items-start">
<div className="card-hover rounded-[2rem] bg-white border border-slate-200 p-8 shadow-sm flex flex-col items-center text-center">
<div className="avatar-profil-tab"><Avatar src={mahasiswa.foto_profil || null} nama={mahasiswa.nama} size="2xl" /></div>
<h2 className="mt-4 text-xl font-black text-slate-900">{mahasiswa.nama}</h2>
<p className="mt-1 text-sm text-slate-600">NIM {mahasiswa.nim}</p>
<div className="mt-5 flex flex-wrap justify-center gap-2">
<button type="button" onClick={function () { setShowUploadFoto(!showUploadFoto) }} className="px-3.5 py-2 rounded-lg text-xs sm:px-4 sm:py-2 sm:rounded-xl sm:text-sm font-bold bg-bsi-800 text-white hover:bg-bsi-700 transition">{mahasiswa.foto_profil ? 'Ganti Foto' : 'Upload Foto'}</button>
{mahasiswa.foto_profil ? <button type="button" onClick={hapusFotoProfilKu} className="px-3.5 py-2 rounded-lg text-xs sm:px-4 sm:py-2 sm:rounded-xl sm:text-sm font-bold bg-red-50 text-red-700 hover:bg-red-100 transition">Hapus Foto</button> : null}
</div>
{showUploadFoto ? (
<div className="mt-5 w-full border-t border-slate-200 pt-5 text-left">
<div className="flex flex-wrap items-start gap-4">
{fotoPreview ? <img src={fotoPreview} alt="Pratinjau foto profil" className="h-20 w-20 rounded-[28%] object-cover shadow-lg" /> : null}
<div className="min-w-0 flex-1">
<input type="file" accept="image/png,image/jpeg,image/webp,image/heic,image/heif" onChange={pilihFotoProfil} aria-label="Pilih foto profil" className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100" />
<p className="mt-2 text-xs text-slate-600">Format JPG, PNG, WebP, atau HEIC iPhone. Otomatis dikonversi ke WebP ringan. Maksimal 5 MB.</p>
</div>
</div>
<div className="mt-4 flex gap-2">
<button type="button" onClick={simpanFotoProfil} disabled={uploadingFoto || !fotoFile} className="px-3.5 py-2 rounded-lg text-xs sm:px-4 sm:py-2 sm:rounded-xl sm:text-sm font-bold bg-bsi-800 text-white hover:bg-bsi-700 transition disabled:opacity-50">{uploadingFoto ? 'Mengunggah...' : 'Simpan Foto'}</button>
<button type="button" onClick={function () { setShowUploadFoto(false); setFotoPreview(null); setFotoFile(null) }} className="px-3.5 py-2 rounded-lg text-xs sm:px-4 sm:py-2 sm:rounded-xl sm:text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition">Batal</button>
</div>
</div>
) : null}
</div>
<div className="card-hover rounded-[2rem] bg-white border border-slate-200 p-8 shadow-sm">
<h2 className="text-lg font-black text-slate-900">Ringkasan aktivitas magang</h2>
<div className="stats-profil-grid mt-4 grid grid-cols-3 gap-2">
<div className="rounded-xl bg-slate-50 p-2 text-center"><p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Logbook</p><p className="text-base font-black text-bsi-800">{typeof logs !== 'undefined' ? logs.length : 0}</p></div>
<div className="rounded-xl bg-slate-50 p-2 text-center"><p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Media</p><p className="text-base font-black text-bsi-800">{typeof galeri !== 'undefined' ? galeri.length : 0}</p></div>
<div className="rounded-xl bg-slate-50 p-2 text-center"><p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Kehadiran</p><p className="text-base font-black text-bsi-800">{typeof hadir !== 'undefined' ? hadir.length : 0}</p></div>
</div>
<div className="mt-6 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
<p>Foto profil tampil otomatis di kartu kamu pada halaman publik, logbook, galeri, dan daftar hadir.</p>
<p>Gunakan foto dengan pencahayaan baik dan wajah terlihat jelas agar mudah dikenali dosen pembimbing.</p>
<p>Klik foto pada kartu header kapan saja untuk kembali ke halaman ini dan memperbarui foto.</p>
</div>
</div>
</section>
) : null}

{tab === 'logbook' ? (
        <section className="anim-tab mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr] items-start">
          <div ref={refFormLog} className={'card-hover scroll-mt-24 bg-white rounded-[2rem] border shadow-sm p-8 min-w-0 ' + (editLogId ? 'border-gold-500 ring-1 ring-gold-500' : 'border-slate-200')}>
            <ModeIndicator edit={!!editLogId} onCancel={cancelEditLog} />
            <h2 className="mt-3 text-xl sm:text-2xl font-black text-slate-900">{editLogId ? 'Ubah logbook harian' : 'Tambah logbook harian'}</h2>
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
                      options={[{ value: 'draft', label: 'Draft' }, { value: 'publik', label: 'Published' }]} />
                  </div>
                </div>
              </div>
              <div>
                <label className={labelCls}>Ringkasan hari ini <span className="text-red-500">*</span></label>
                <input required className={inputCls} value={form.judul} onChange={function (e) { setForm(Object.assign({}, form, { judul: e.target.value })) }} aria-label="Ringkasan hari ini" placeholder="Contoh: Kegiatan harian di divisi Back Office" />
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-700">Rincian kegiatan hari ini <span className="text-red-500">*</span></p>
                <button type="button" onClick={function () { setItems(function (p) { return p.concat([newItem()]) }) }} className={btnSmall + ' whitespace-nowrap shrink-0 bg-bsi-100 text-bsi-900 hover:bg-bsi-200'}>+ Tambah kegiatan</button>
                </div>
                {items.map(function (it, i) {
                  return (
                    <div key={it.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-bsi-800">Kegiatan {i + 1}</span>
                        {items.length > 1 ? <button type="button" onClick={function () { setItems(function (p) { return p.filter(function (x, idx) { return idx !== i }) }) }} className="text-xs text-red-600 hover:underline">Hapus</button> : null}
                      </div>
                      <input className={inputCls} value={it.judul} onChange={function (e) { patchItem(i, { judul: e.target.value }) }} aria-label="Judul kegiatan" placeholder="Judul kegiatan" />
                      <AutoTextArea className={inputCls} value={it.deskripsi} onChange={function (e) { patchItem(i, { deskripsi: e.target.value }) }} aria-label="Deskripsi kegiatan" placeholder="Deskripsi singkat kegiatan" />
                      <input className={inputCls} value={it.hasil} onChange={function (e) { patchItem(i, { hasil: e.target.value }) }} aria-label="Hasil kegiatan" placeholder="Hasil (opsional)" />
                      {it.previewLoading ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-100 aspect-video grid place-items-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="h-9 w-9 rounded-full border-4 border-bsi-500 border-t-transparent animate-spin"></div>
                            <p className="text-xs font-semibold text-slate-600">Mengonversi pratinjau</p>
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
                        <button type="button" onClick={function () { patchItem(i, { mode: 'foto' }) }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (it.mode !== 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700')}>Foto</button>
                        <button type="button" onClick={function () { patchItem(i, { mode: 'video' }) }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (it.mode === 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700')}>Video</button>
                      </div>
                      {it.mode === 'video' ? (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-slate-600">Sisa kuota upload video hari ini: {ytQuotaLoading ? <span className="inline-block w-3 h-3 ml-1 border-2 border-slate-400 border-t-transparent rounded-full animate-spin align-middle"></span> : <>{ytQuota.remaining} dari {ytQuota.limit}</>}</p>
                          <div className={ytQuota.remaining <= 0 && !it.file ? 'opacity-50 pointer-events-none' : ''}>
                            <FileInput accept="video/*" fileName={it.file ? it.file.name : ''} label="Klik untuk pilih video" hint="Video maks 50 MB. Format MP4, MOV, WebM, atau MKV."
                              onChange={function (e) { onItemFile(i, e.target.files[0]) }} />
                          </div>
                          {ytQuota.remaining <= 0 ? <p className="text-xs text-red-600">Kuota habis. Gunakan link video di bawah.</p> : null}
                          <input className={inputCls} value={it.ytLink} onChange={function (e) { patchItem(i, { ytLink: e.target.value }) }} aria-label="Link video YouTube" placeholder="Link video YouTube untuk tampilan (opsional)" />
                          <input className={inputCls} value={it.driveLink} onChange={function (e) { patchItem(i, { driveLink: e.target.value }) }} aria-label="Link Google Drive" placeholder="Link Google Drive untuk unduhan (opsional)" />
                        </div>
                      ) : (
                        <FileInput accept="image/*" fileName={it.file ? it.file.name : ''} label="Klik untuk pilih foto" hint="Foto JPG, PNG, atau HEIC otomatis dikonversi ke WebP."
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
                <div><label className={labelCls}>Kendala</label><AutoTextArea className={inputCls} value={form.kendala} onChange={function (e) { setForm(Object.assign({}, form, { kendala: e.target.value })) }} aria-label="Kendala" placeholder="Opsional" /></div>
                <div><label className={labelCls}>Solusi</label><AutoTextArea className={inputCls} value={form.solusi} onChange={function (e) { setForm(Object.assign({}, form, { solusi: e.target.value })) }} aria-label="Solusi" placeholder="Opsional" /></div>
                <div><label className={labelCls}>Pembelajaran</label><AutoTextArea className={inputCls} value={form.pembelajaran} onChange={function (e) { setForm(Object.assign({}, form, { pembelajaran: e.target.value })) }} aria-label="Pembelajaran" placeholder="Opsional" /></div>
              </div>

              <button type="submit" disabled={busy} className={btnPrimary}>{busy ? <LabelProses teks={infoProses || 'Menyimpan'} /> : (editLogId ? 'Simpan perubahan' : 'Simpan logbook')}</button>
            </form>
          </div>

          <div className="space-y-5 min-w-0">
            <h2 ref={refListLog} className="text-xl sm:text-2xl font-black text-slate-900 scroll-mt-24">Logbook kamu</h2>
            <FilterBar open={logFilterOpen} onToggle={function () { setLogFilterOpen(function (o) { return !o }) }} activeCount={logFilterActive}
              onReset={function () { setLogFilter(LOG_INITIAL) }}>
              <FilterSelect icon={ICONS.tag} value={logFilter.kategori} onChange={function (v) { setLogFilter(Object.assign({}, logFilter, { kategori: v })) }}
                options={[{ value: '', label: 'Semua kategori' }].concat(KATEGORI.map(function (k) { return { value: k, label: k } }))} />
              <FilterSelect icon={ICONS.check} value={logFilter.status} onChange={function (v) { setLogFilter(Object.assign({}, logFilter, { status: v })) }}
                options={[{ value: '', label: 'Semua status' }, { value: 'draft', label: 'Draft' }, { value: 'publik', label: 'Published' }]} />
              <TimeFilter filter={logFilter} set={setLogFilter} />
              <SortSelect value={sort} onChange={setSort} />
            </FilterBar>
            <p className="text-sm text-slate-600">Total {filteredLogs.length} logbook{logTotalPages > 1 ? ' • Halaman ' + logPageAman + ' dari ' + logTotalPages : ''}</p>
            <div className="grid gap-5 md:grid-cols-2 kartu-grid">
              {paginatedLogs.map(function (l) {
                return <LogbookCard key={l.id} log={l} isOwner
                  onDetail={function () { setDetail({ type: 'log', data: l }) }}
                  onEdit={function () { startEditLog(l) }}
                  onDelete={function () { deleteLog(l) }} />
              })}
            </div>
            {!filteredLogs.length ? <EmptyState title={logs.length ? 'Logbook tidak ditemukan' : 'Belum ada logbook'} desc={logs.length ? 'Coba reset filter atau pilih filter lain.' : 'Tambahkan logbook harian pertama kamu.'} /> : null}
             <Pagination totalItems={logTotal} perPage={PER_PAGE_DASH} page={logPageAman} onPageChange={gantiHalamanLog} />
          </div>
        </section>
      ) : null}

      {tab === 'galeri' ? (
        <section className="anim-tab mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr] items-start">
          <div ref={refFormGal} className={'card-hover scroll-mt-24 bg-white rounded-[2rem] border shadow-sm p-8 min-w-0 ' + (editGalId ? 'border-gold-500 ring-1 ring-gold-500' : 'border-slate-200')}>
            <ModeIndicator edit={!!editGalId} onCancel={cancelEditGal} />
            <h2 className="mt-3 text-xl sm:text-2xl font-black text-slate-900">{editGalId ? 'Ubah media galeri' : 'Tambah media galeri'}</h2>
            <form onSubmit={submitGaleri} className="mt-6 space-y-4">
              <div>
                <label className={labelCls}>Jenis media {editGalId ? null : <span className="text-red-500">*</span>}</label>
                <div className="mt-1.5 flex gap-2">
                  <button type="button" onClick={function () { setGalMode('foto') }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (galMode !== 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700')}>Foto</button>
                  <button type="button" onClick={function () { setGalMode('video') }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (galMode === 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700')}>Video</button>
                </div>
                <div className="mt-1.5">
                  {galMode === 'video' ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-600">Sisa kuota upload video hari ini: {ytQuotaLoading ? <span className="inline-block w-3 h-3 ml-1 border-2 border-slate-400 border-t-transparent rounded-full animate-spin align-middle"></span> : <>{ytQuota.remaining} dari {ytQuota.limit}</>}</p>
                      <div className={ytQuota.remaining <= 0 && !galForm.file ? 'opacity-50 pointer-events-none' : ''}>
                        <FileInput accept="video/*" fileName={galForm.file ? galForm.file.name : ''} label="Klik untuk pilih video" hint="Video maks 50 MB. Format MP4, MOV, WebM, atau MKV."
                          onChange={function (e) {
                            const f = e.target.files[0]
                            if (!f) return
                            setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: URL.createObjectURL(f), previewLoading: false }) })
                          }} />
                      </div>
                      {ytQuota.remaining <= 0 ? <p className="text-xs text-red-600">Kuota habis. Gunakan link video di bawah.</p> : null}
                      <input className={inputCls} value={galYtLink} onChange={function (e) { setGalYtLink(e.target.value) }} aria-label="Link video YouTube" placeholder="Link video YouTube untuk tampilan (opsional)" />
                       <input className={inputCls} value={galDriveLink} onChange={function (e) { setGalDriveLink(e.target.value) }} aria-label="Link Google Drive" placeholder="Link Google Drive untuk unduhan (opsional)" />
                    </div>
                  ) : (
                    <FileInput accept="image/*" fileName={galForm.file ? galForm.file.name : ''} label="Klik untuk pilih foto" hint="Foto JPG, PNG, atau HEIC otomatis dikonversi ke WebP."
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
                    <p className="text-xs font-semibold text-slate-600">Mengonversi pratinjau</p>
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
                <div><label className={labelCls}>Judul (opsional)</label><input className={inputCls} value={galForm.judul} onChange={function (e) { setGalForm(Object.assign({}, galForm, { judul: e.target.value })) }} aria-label="Judul media" placeholder="Kosongkan untuk judul otomatis" /></div>
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
                {editGalDerived ? <p className="mt-1 text-xs text-slate-600">Media ini berasal dari logbook. Perubahan judul, deskripsi, kegiatan, dan tanggal hanya memengaruhi galeri dan tidak akan ditimpa saat logbook disimpan.</p> : null}
              </div>
              <div><label className={labelCls}>Deskripsi (opsional)</label><AutoTextArea className={inputCls} value={galForm.deskripsi} onChange={function (e) { setGalForm(Object.assign({}, galForm, { deskripsi: e.target.value })) }} aria-label="Deskripsi media" placeholder="Tambahkan keterangan media." /></div>
              <button type="submit" disabled={busy} className={btnPrimary}>{busy ? <LabelProses teks={infoProses || 'Menyimpan'} /> : (editGalId ? 'Simpan perubahan media' : 'Unggah media')}</button>
            </form>
          </div>

          <div className="space-y-5 min-w-0">
            <h2 ref={refListGal} className="text-xl sm:text-2xl font-black text-slate-900 scroll-mt-24">Galeri kamu</h2>
            <FilterBar open={galFilterOpen} onToggle={function () { setGalFilterOpen(function (o) { return !o }) }} activeCount={galFilterActive}
              onReset={function () { setGalFilter(GAL_INITIAL) }}>
              <FilterSelect icon={ICONS.tag} value={galFilter.kegiatan} onChange={function (v) { setGalFilter(Object.assign({}, galFilter, { kegiatan: v })) }}
                options={[{ value: '', label: 'Semua kegiatan' }].concat(GALERI_KEGIATAN.map(function (k) { return { value: k, label: k } }))} />
              <FilterSelect icon={ICONS.image} value={galFilter.tipe} onChange={function (v) { setGalFilter(Object.assign({}, galFilter, { tipe: v })) }}
                options={[{ value: '', label: 'Semua media' }, { value: 'foto', label: 'Foto' }, { value: 'video', label: 'Video' }]} />
              <TimeFilter filter={galFilter} set={setGalFilter} />
              <SortSelect value={sort} onChange={setSort} />
            </FilterBar>
            <p className="text-sm text-slate-600">Total {filteredGaleri.length} media{galTotalPages > 1 ? ' • Halaman ' + galPageAman + ' dari ' + galTotalPages : ''}</p>
            <div className="grid gap-5 md:grid-cols-2 kartu-grid">
              {paginatedGaleri.map(function (g) {
                return <GalleryCard key={g.id} item={g} isOwner
                  onDetail={function () { setDetail({ type: 'gal', data: g }) }}
                  onEdit={function () { startEditGal(g) }}
                  onDelete={function () { deleteGaleri(g) }} />
              })}
              {!filteredGaleri.length ? <EmptyState icon="camera" title={galeri.length ? 'Media tidak ditemukan' : 'Belum ada media galeri'} desc={galeri.length ? 'Coba reset filter atau pilih filter lain.' : 'Unggah foto atau video pertama kamu.'} /> : null}
            </div>
            <Pagination totalItems={galTotal} perPage={PER_PAGE_DASH} page={galPageAman} onPageChange={gantiHalamanGal} />
          </div>
        </section>
      ) : null}

      {tab === 'absen' ? (
        <section className="anim-tab mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr] items-start">
          <div ref={refFormHadir} className={'card-hover scroll-mt-24 bg-white rounded-[2rem] border shadow-sm p-8 min-w-0 ' + (editHadirId ? 'border-gold-500 ring-1 ring-gold-500' : 'border-slate-200')}>
            <ModeIndicator edit={!!editHadirId} onCancel={cancelEditHadir} />
            <h2 className="mt-3 text-xl sm:text-2xl font-black text-slate-900">{editHadirId ? 'Ubah daftar hadir' : 'Isi daftar hadir'}</h2>
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
                  aria-label="Alasan atau keterangan" placeholder={hadirForm.status === 'Masuk' ? 'Status Masuk tidak memerlukan alasan' : 'Contoh: Keperluan keluarga, sakit.'}
                  disabled={hadirForm.status === 'Masuk'}
                />
                {hadirForm.status === 'Masuk' ? <p className="mt-1 text-xs text-slate-600">Field ini hanya terisi untuk status Izin atau Bolos.</p> : null}
              </div>
              <button type="submit" disabled={busy} className={btnPrimary}>{busy ? <LabelProses teks="Menyimpan" /> : (editHadirId ? 'Simpan perubahan' : 'Simpan daftar hadir')}</button>
            </form>
          </div>

          <div className="space-y-5 min-w-0">
            <h2 ref={refListHadir} className="text-xl sm:text-2xl font-black text-slate-900 scroll-mt-24">Daftar hadir kamu</h2>
            <FilterBar open={hadirFilterOpen} onToggle={function () { setHadirFilterOpen(function (o) { return !o }) }} activeCount={hadirFilterActive}
              onReset={function () { setHadirFilter(HADIR_INITIAL) }}>
              <FilterSelect icon={ICONS.check} value={hadirFilter.status} onChange={function (v) { setHadirFilter(Object.assign({}, hadirFilter, { status: v })) }}
                options={[{ value: '', label: 'Semua status' }, { value: 'Masuk', label: 'Masuk' }, { value: 'Izin', label: 'Izin' }, { value: 'Bolos', label: 'Bolos' }]} />
              <TimeFilter filter={hadirFilter} set={setHadirFilter} />
              <SortSelect value={sort} onChange={setHadirFilterOpen && setSort ? setSort : setSort} />
            </FilterBar>
            <p className="text-sm text-slate-600">Total {filteredHadir.length} catatan{hadirTotalPages > 1 ? ' • Halaman ' + hadirPageAman + ' dari ' + hadirTotalPages : ''}</p>
            <div className="grid gap-5 md:grid-cols-2 kartu-grid">
            {paginatedHadir.map(function (h) {
              return <AttendanceCard key={h.id} row={h} isOwner
                onDetail={function () { setDetail({ type: 'hadir', data: h }) }}
                onEdit={function () { startEditHadir(h) }}
                onDelete={function () { deleteHadir(h) }} />
            })}
            </div>
            {!filteredHadir.length ? <EmptyState icon="clipboard" title={hadir.length ? 'Catatan tidak ditemukan' : 'Belum ada data kehadiran'} desc={hadir.length ? 'Coba reset filter atau pilih filter lain.' : 'Isi daftar hadir pertama kamu.'} /> : null}
             <Pagination totalItems={hadirTotal} perPage={PER_PAGE_DASH} page={hadirPageAman} onPageChange={gantiHalamanHadir} />
          </div>
        </section>
      ) : null}

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail && detail.type === 'log' ? <LogbookDetail log={detail.data} /> : null}
        {detail && detail.type === 'gal' ? <GalleryDetail item={detail.data} /> : null}
        {detail && detail.type === 'hadir' ? <AttendanceDetail row={detail.data} /> : null}
      </Modal>

      <ConfirmModal
open={!!pendingDelete}
title={pendingDelete && confirmInfo() ? confirmInfo().title : ''}
message={pendingDelete && confirmInfo() ? confirmInfo().message : ''}
onCancel={function () { setPendingDelete(null) }}
onConfirm={executeDelete}
/>
    </div>
  )
}
```
