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