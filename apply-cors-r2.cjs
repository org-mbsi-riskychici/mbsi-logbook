const fs = require('fs')
const path = require('path')
const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3')

const root = process.cwd()

function baca(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n')
}

function simpan(rel, isi) {
  fs.writeFileSync(path.join(root, rel), isi, 'utf8')
}

/* ===== Baca variabel dari .env.local ===== */
const env = {}
const envPath = path.join(root, '.env.local')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(function (line) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  })
}

console.log('Mulai memasang pendekatan CORS R2 dan membersihkan proksi...')
console.log('')

/* ===== 1. Hapus file proksi bila ada ===== */
const FILE_DL = path.join(root, 'api', 'r2', 'download.js')
if (fs.existsSync(FILE_DL)) {
  fs.unlinkSync(FILE_DL)
  console.log('[BERHASIL] api/r2/download.js dihapus')
} else {
  console.log('[SUDAH BERSIH] api/r2/download.js tidak ada')
}

/* ===== 2. Bersihkan middleware dan import di vite.config.js ===== */
if (fs.existsSync(path.join(root, 'vite.config.js'))) {
  let vite = baca('vite.config.js')
  const awal = vite
  vite = vite.replace(/      server\.middlewares\.use\('\/api\/r2\/download',[\s\S]*?\n      \}\)\n/, '')
  vite = vite.replace(
    "import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'",
    "import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'"
  )
  if (vite !== awal) {
    simpan('vite.config.js', vite)
    console.log('[BERHASIL] Middleware proksi dibersihkan dari vite.config.js')
  } else {
    console.log('[SUDAH BERSIH] vite.config.js tidak memuat proksi')
  }
} else {
  console.log('[LEWATI] vite.config.js tidak ditemukan')
}

/* ===== 3. Kembalikan fungsi unduh agar mengambil langsung dari R2 ===== */
if (fs.existsSync(path.join(root, 'src/components/ui.jsx'))) {
  let ui = baca('src/components/ui.jsx')
  if (ui.includes('api/r2/download?key=')) {
    const regexUnduh = /  async function unduh\(\) \{[\s\S]*?\n  \}\n/
    const unduhLangsung = `  async function unduh() {
    if (busyUnduh) return
    setBusyUnduh(true)
    let nama = 'media'
    try {
      nama = new URL(props.src).pathname.split('/').pop() || 'media'
    } catch (e) {
      nama = (props.title || 'media') + '.jpg'
    }
    try {
      const res = await fetch(props.src)
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
`
    if (regexUnduh.test(ui)) {
      ui = ui.replace(regexUnduh, unduhLangsung)
      simpan('src/components/ui.jsx', ui)
      console.log('[BERHASIL] Fungsi unduh kembali mengambil langsung dari R2')
    } else {
      console.log('[TIDAK KETEMU] Blok fungsi unduh di ui.jsx')
    }
  } else {
    console.log('[SUDAH SESUAI] Fungsi unduh sudah langsung ke R2')
  }
} else {
  console.log('[LEWATI] src/components/ui.jsx tidak ditemukan')
}

/* ===== 4. Pasang aturan CORS pada bucket R2 ===== */
const wajib = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME']
const kurang = wajib.filter(function (k) { return !env[k] })
if (kurang.length) {
  console.log('')
  console.log('[GAGAL] Variabel berikut tidak ada di .env.local: ' + kurang.join(', '))
  process.exit(1)
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: 'https://' + env.R2_ACCOUNT_ID + '.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY
  }
})

const aturanCors = {
  CORSRules: [
    {
      AllowedOrigins: ['*'],
      AllowedMethods: ['GET', 'HEAD'],
      AllowedHeaders: ['*'],
      MaxAgeSeconds: 3600
    }
  ]
}

async function pasangCors() {
  await s3.send(new PutBucketCorsCommand({
    Bucket: env.R2_BUCKET_NAME,
    CORSConfiguration: aturanCors
  }))
  console.log('[BERHASIL] Aturan CORS terpasang pada bucket ' + env.R2_BUCKET_NAME)
}

pasangCors()
  .then(function () {
    console.log('')
    console.log('Selesai. Ringkasan aturan CORS yang dipasang:')
    console.log('  Origin diizinkan : semua (*)')
    console.log('  Method diizinkan : GET dan HEAD saja')
    console.log('  Artinya browser boleh membaca file publik, tidak lebih dari itu.')
    console.log('')
    console.log('Langkah uji:')
    console.log('1. Buka aplikasi, perbesar satu foto, lalu klik tombol unduh.')
    console.log('2. File harus langsung terunduh tanpa membuka tab baru.')
    console.log('3. Uji juga dari localhost dan dari domain Vercel, keduanya harus berhasil.')
    console.log('4. Kalau masih membuka tab baru, uji CORS manual di console browser:')
    console.log("   fetch('GANTI_DENGAN_URL_FOTO').then(r => r.blob()).then(b => console.log('CORS OK', b.size))")
  })
  .catch(function (e) {
    console.log('')
    console.log('[GAGAL] Tidak bisa memasang CORS: ' + e.message)
    console.log('Pastikan token R2 punya izin edit pengaturan bucket, atau pasang manual')
    console.log('lewat dashboard Cloudflare: R2 > bucket > Settings > CORS, lalu tempel:')
    console.log(JSON.stringify(aturanCors.CORSRules, null, 2))
    process.exit(1)
  })