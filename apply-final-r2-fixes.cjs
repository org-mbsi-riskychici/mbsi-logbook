const fs = require('fs')
const path = require('path')

const root = process.cwd()

function filePath(rel) {
  return path.join(root, rel)
}

function exists(rel) {
  return fs.existsSync(filePath(rel))
}

function read(rel) {
  return fs.readFileSync(filePath(rel), 'utf8').replace(/\r\n/g, '\n')
}

function write(rel, content) {
  fs.writeFileSync(filePath(rel), content, 'utf8')
}

function logOk(msg) {
  console.log('[BERHASIL] ' + msg)
}

function logSkip(msg) {
  console.log('[SUDAH ADA] ' + msg)
}

function logWarn(msg) {
  console.log('[PERINGATAN] ' + msg)
}

function logMiss(msg) {
  console.log('[TIDAK KETEMU] ' + msg)
}

function replaceExact(rel, from, to, label) {
  if (!exists(rel)) {
    logWarn('File tidak ditemukan: ' + rel)
    return false
  }

  let content = read(rel)

  if (content.includes(to)) {
    logSkip(label)
    return true
  }

  if (!content.includes(from)) {
    logMiss(label + ' di ' + rel)
    return false
  }

  content = content.replace(from, to)
  write(rel, content)
  logOk(label)
  return true
}

function replaceRegex(rel, regex, to, label, alreadyMarker) {
  if (!exists(rel)) {
    logWarn('File tidak ditemukan: ' + rel)
    return false
  }

  let content = read(rel)

  if (alreadyMarker && content.includes(alreadyMarker)) {
    logSkip(label)
    return true
  }

  if (!regex.test(content)) {
    logMiss(label + ' di ' + rel)
    return false
  }

  content = content.replace(regex, to)
  write(rel, content)
  logOk(label)
  return true
}

console.log('Mulai menerapkan perbaikan final R2 dan dashboard...')
console.log('')

if (!exists('src/pages/DashboardPage.jsx')) {
  console.log('File src/pages/DashboardPage.jsx tidak ditemukan.')
  console.log('Pastikan script dijalankan di root project.')
  process.exit(1)
}

/* =========================================================
   1. Hardening src/lib/upload.js
   ========================================================= */

if (!exists('src/lib/upload.js')) {
  logWarn('src/lib/upload.js tidak ditemukan, dilewati.')
} else {
  const uploadJs = `import { supabase } from './supabase.js'

async function getToken() {
  const { data } = await supabase.auth.getSession()
  return data.session ? data.session.access_token : ''
}

export async function uploadMedia(file, kind) {
  const token = await getToken()
  const res = await fetch('/api/r2/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ filename: file.name, contentType: file.type, kind: kind })
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error('Gagal membuat izin upload (status ' + res.status + '): ' + text)
  }
  const info = await res.json()

  const put = await fetch(info.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file
  })
  if (!put.ok) {
    const text = await put.text()
    throw new Error('Gagal upload file ke R2 (status ' + put.status + '): ' + text)
  }

  return { path: info.key, publicUrl: info.publicUrl }
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
`

  const currentUpload = read('src/lib/upload.js')
  if (currentUpload === uploadJs) {
    logSkip('src/lib/upload.js sudah versi hardening')
  } else {
    write('src/lib/upload.js', uploadJs)
    logOk('src/lib/upload.js diganti ke versi hardening')
  }
}

/* =========================================================
   2. Pastikan DashboardPage import deleteMedia
   ========================================================= */

let dash = read('src/pages/DashboardPage.jsx')

if (dash.includes("import { uploadMedia, deleteMedia } from '../lib/upload.js'")) {
  logSkip('Import deleteMedia di DashboardPage')
} else if (dash.includes("import { uploadMedia } from '../lib/upload.js'")) {
  dash = dash.replace(
    "import { uploadMedia } from '../lib/upload.js'",
    "import { uploadMedia, deleteMedia } from '../lib/upload.js'"
  )
  write('src/pages/DashboardPage.jsx', dash)
  logOk('Import deleteMedia di DashboardPage')
} else {
  logMiss('Import uploadMedia di DashboardPage')
}

/* =========================================================
   3. Ganti hapusMediaR2 supaya ada console sukses/gagal
   ========================================================= */

replaceRegex(
  'src/pages/DashboardPage.jsx',
  /  async function hapusMediaR2\(url\) \{\n[\s\S]*?  \}\n\n  async function submitLogbook/,
  `  async function hapusMediaR2(url) {
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

  async function submitLogbook`,
  'Fungsi hapusMediaR2 dengan logging',
  "console.log('Media R2 terhapus:', key)"
)

/* =========================================================
   4. Tambahkan pembersihan oldUrls setelah syncGaleriFromLogbook
   ========================================================= */

dash = read('src/pages/DashboardPage.jsx')

if (dash.includes('const newUrls = clean.map(function (c) { return c.media_path }).filter(Boolean)')) {
  logSkip('Pembersihan media lama setelah edit logbook')
} else {
  const syncRegex = /(      await syncGaleriFromLogbook\((?:mahasiswa|peserta)\.id, insItems\.data \|\| \[\], \{ tanggal: form\.tanggal, kategori: form\.kategori \}\)\n)/
  if (syncRegex.test(dash)) {
    dash = dash.replace(
      syncRegex,
      `$1      const newUrls = clean.map(function (c) { return c.media_path }).filter(Boolean)
      for (const u of oldUrls) {
        if (newUrls.indexOf(u) === -1) await hapusMediaR2(u)
      }
`
    )
    write('src/pages/DashboardPage.jsx', dash)
    logOk('Pembersihan media lama setelah edit logbook')
  } else {
    logMiss('Baris syncGaleriFromLogbook untuk menyisipkan pembersihan oldUrls')
  }
}

/* =========================================================
   5. Perbaiki startEditLog agar tidak membaca state items lama
   ========================================================= */

dash = read('src/pages/DashboardPage.jsx')

if (dash.includes('const mapped = (log.logbook_items || []).map(function (it)')) {
  logSkip('Perbaikan startEditLog memakai mapped')
} else {
  const startEditRegex = /    setItems\(\(log\.logbook_items\s*\|\|\s*\[\]\)\.map\(function \(it\) \{\n      return \{ key: it\.id, judul: it\.judul, deskripsi: it\.deskripsi\s*\|\|\s*'', hasil: it\.hasil\s*\|\|\s*'', file: null, preview: it\.media_path\s*\|\|\s*'', oldPath: it\.media_path\s*\|\|\s*'', show: it\.show_in_gallery \}\n    \}\)\)\n    if \(!items\.length\) setItems\(\[newItem\(\)\]\)/

  if (startEditRegex.test(dash)) {
    dash = dash.replace(
      startEditRegex,
      `    const mapped = (log.logbook_items || []).map(function (it) {
      return { key: it.id, judul: it.judul, deskripsi: it.deskripsi || '', hasil: it.hasil || '', file: null, preview: it.media_path || '', oldPath: it.media_path || '', show: it.show_in_gallery }
    })
    setItems(mapped.length ? mapped : [newItem()])`
    )
    write('src/pages/DashboardPage.jsx', dash)
    logOk('Perbaikan startEditLog memakai mapped')
  } else {
    logMiss('Blok startEditLog lama')
  }
}

/* =========================================================
   6. Bersihkan debug console di LoginPage.jsx
   ========================================================= */

if (exists('src/pages/LoginPage.jsx')) {
  let login = read('src/pages/LoginPage.jsx')
  const before = login

  login = login
    .replace(/\n\s*console\.log\('Login berhasil, pindah ke dashboard'\)/g, '')
    .replace(/\n\s*console\.error\('Error lengkap:', err\)/g, '')

  if (login !== before) {
    write('src/pages/LoginPage.jsx', login)
    logOk('Debug console di LoginPage dibersihkan')
  } else {
    logSkip('Debug console LoginPage tidak ditemukan atau sudah bersih')
  }
} else {
  logWarn('src/pages/LoginPage.jsx tidak ditemukan, dilewati.')
}

/* =========================================================
   7. Update ringan README kalau ada
   ========================================================= */

if (exists('README.md')) {
  let readme = read('README.md')
  const before = readme

  readme = readme
    .split('@magang.local').join('@mbsi.local')
    .split('generate-mbsi.js').join('setup project saat ini')

  if (readme !== before) {
    write('README.md', readme)
    logOk('README.md diperbarui ringan')
  } else {
    logSkip('README.md tidak perlu diperbarui')
  }
} else {
  logWarn('README.md tidak ditemukan, dilewati.')
}

console.log('')
console.log('Selesai.')
console.log('')
console.log('Langkah uji yang disarankan:')
console.log('1. Restart dev server jika perlu.')
console.log('2. Buka DevTools > Console dan Network.')
console.log('3. Buat logbook baru dengan 1 foto, simpan, lalu hapus logbook itu.')
console.log("4. Console harus menampilkan: Media R2 terhapus: logbook/....")
console.log("5. Jika muncul 'Gagal hapus media R2', kirim status/error-nya ke sini.")
console.log('')
console.log('Catatan:')
console.log('- Hapus galeri turunan logbook memang tidak menghapus file R2 karena file masih dipakai logbook.')
console.log('- Hapus logbook bermedia harus menghapus file R2 milik item logbook.')
console.log('- Hapus galeri manual harus menghapus file R2 milik galeri manual.')