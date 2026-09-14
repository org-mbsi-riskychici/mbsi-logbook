const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai menyamakan pipeline foto profil dengan alur konversi R2...')
console.log('')

/* ===== 0. Cek dependensi heic2any ===== */
if (ada('package.json')) {
  const pkg = baca('package.json')
  if (pkg.includes('heic2any')) console.log('[AMAN] Dependensi heic2any sudah terpasang')
  else console.log('[PERINGATAN] heic2any belum ada di package.json. Jalankan dulu: npm install heic2any')
}

/* ===== 1. konversi.js: tambahkan helper khusus foto profil ===== */
const FILE_K = 'src/lib/konversi.js'
if (!ada(FILE_K)) {
  console.log('[GAGAL] src/lib/konversi.js tidak ditemukan')
  process.exit(1)
}
let k = baca(FILE_K)
console.log('[DIAGNOSIS] Daftar export di konversi.js:')
;(k.match(/export\s+(?:async\s+)?function\s+[A-Za-z0-9_]+/g) || []).forEach(function (e) { console.log('   ' + e) })

if (!/import\s+heic2any\s+from\s+'heic2any'/.test(k)) {
  k = "import heic2any from 'heic2any'\n" + k
  console.log('[BERHASIL] Import heic2any ditambahkan di konversi.js')
}

const BLOK_KONVERSI = `/* foto-profil-webp: pipeline konversi foto profil, pola sama dengan alur media R2 */
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
    const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
    kerja = new File([Array.isArray(blob) ? blob[0] : blob], (file.name || 'foto').replace(/\\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' })
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
}`

if (k.includes('siapkanFotoProfil')) {
  console.log('[SUDAH ADA] siapkanFotoProfil di konversi.js')
} else {
  k = k.trimEnd() + '\n\n' + BLOK_KONVERSI + '\n'
  simpan(FILE_K, k)
  console.log('[BERHASIL] siapkanFotoProfil ditambahkan di konversi.js')
}

/* ===== 2. profil.js: tulis ulang agar memakai pipeline konversi ===== */
simpan('src/lib/profil.js', `import { supabase } from './supabase.js'
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
`)
console.log('[BERHASIL] src/lib/profil.js ditulis ulang dengan pipeline konversi WebP')

/* ===== 3. DashboardPage: izinkan HEIC dan perbarui teks bantuan ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
if (!ada(FILE_D)) {
  console.log('[LEWATI] DashboardPage.jsx tidak ditemukan')
} else {
  let d = baca(FILE_D)
  const sebelum = d
  d = d.split('accept="image/png,image/jpeg,image/webp"').join('accept="image/png,image/jpeg,image/webp,image/heic,image/heif"')
  d = d.split('Format JPG, PNG, atau WebP. Maksimal 5 MB.').join('Format JPG, PNG, WebP, atau HEIC iPhone. Otomatis dikonversi ke WebP ringan. Maksimal 5 MB.')
  if (d !== sebelum) {
    simpan(FILE_D, d)
    console.log('[BERHASIL] Input file dan teks bantuan foto profil diperbarui')
  } else {
    console.log('[INFO] Tidak ada teks input foto profil yang perlu diubah')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Alur baru foto profil, identik dengan pola media R2:')
console.log('1. File HEIC atau HEIF dari iPhone dikonversi lebih dulu ke JPG lewat heic2any, persis seperti alur upload foto logbook dan galeri.')
console.log('2. Semua format kemudian digambar ulang di canvas dengan sisi terpanjang maksimal 640 piksel dan penghalusan kualitas tinggi, sehingga hasil kecil tetapi tetap mulus tanpa pecah atau gerigi aliasing.')
console.log('3. Canvas menyimpan hasil sebagai WebP kualitas 0,85, lalu file itulah yang diunggah ke bucket foto-profil dengan ekstensi webp.')
console.log('4. Ukuran akhir biasanya hanya 50 sampai 120 KB, sangat cukup untuk tampilan terbesar 160 piksel di tab Profil maupun 96 piksel di header.')
console.log('5. Validasi tetap berjalan: hanya berkas gambar dan maksimal 5 MB sebelum konversi.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka tab Profil, klik Ganti atau Upload Foto, pilih foto besar dari kamera atau iPhone.')
console.log('2. Simpan, lalu buka bucket foto-profil di dashboard Supabase: file baru berakhiran .webp dengan ukuran kecil.')
console.log('3. Periksa tampilan di header, tab Profil, dan kartu publik: foto tetap tajam dan mulus.')
console.log('4. Foto lama yang sudah terunggah tidak berubah formatnya; hanya unggahan baru yang melewati pipeline konversi.')