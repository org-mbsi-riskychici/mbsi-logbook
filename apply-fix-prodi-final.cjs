const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai mencabut prodi dari PersonChip dan menata header dashboard...')
console.log('')

/* ===== 1. cards.jsx: cabut baris prodi dari dalam fungsi PersonChip ===== */
const FILE_C = 'src/components/cards.jsx'
if (!ada(FILE_C)) {
  console.log('[GAGAL] cards.jsx tidak ditemukan')
  process.exit(1)
}
let c = baca(FILE_C)
const mChip = /function\s+PersonChip\s*\(/.exec(c)
if (!mChip) {
  console.log('[TIDAK KETEMU] Fungsi PersonChip di cards.jsx')
} else {
  const mulai = mChip.index
  let brace = 0, akhir = -1, inStr = false, strCh = ''
  for (let i = mulai; i < c.length; i++) {
    const ch = c[i]
    const prev = i > 0 ? c[i - 1] : ''
    if (inStr) { if (ch === strCh && prev !== '\\') inStr = false; continue }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue }
    if (ch === '{') brace++
    if (ch === '}') { brace--; if (brace === 0) { akhir = i + 1; break } }
  }
  if (akhir === -1) {
    console.log('[GAGAL] Batas fungsi PersonChip tidak terbaca')
  } else {
    let body = c.slice(mulai, akhir)
    let n = 0
    body = body.replace(/\s*\{prodi \? <p[^>]*>\{prodi\}<\/p> : null\}/g, function () { n++; return '' })
    body = body.replace(/\s*\{prodi \? '[^']*' \+ prodi : ''\}/g, function () { n++; return '' })
    body = body.replace(/\s*<p[^>]*>\{prodi\}<\/p>/g, function () { n++; return '' })
    if (n === 0) {
      console.log('[INFO] Tidak ada baris prodi tersisa di PersonChip')
    } else {
      c = c.slice(0, mulai) + body + c.slice(akhir)
      simpan(FILE_C, c)
      console.log('[BERHASIL] ' + n + ' baris prodi dicabut dari PersonChip (kartu logbook, galeri, dan detail)')
    }
  }
}

/* ===== 2. DashboardPage: hapus teks Dashboard mahasiswa ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
if (!ada(FILE_D)) {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
  process.exit(1)
}
let d = baca(FILE_D)
let ubahD = false

const regexLabel = /\s*<p className="text-sm text-slate-500">Dashboard mahasiswa<\/p>/
if (regexLabel.test(d)) {
  d = d.replace(regexLabel, '')
  ubahD = true
  console.log('[BERHASIL] Teks Dashboard mahasiswa dihapus dari header')
} else {
  console.log('[SUDAH ADA] Teks Dashboard mahasiswa tidak ditemukan di header')
}

/* ===== 3. DashboardPage: tampilkan prodi di bawah NIM pada header ===== */
const nimP = '<p className="text-sm text-slate-500">NIM {mahasiswa.nim}</p>'
const prodiP = '{mahasiswa.prodi ? <p className="text-sm text-slate-500">{mahasiswa.prodi}</p> : null}'
if (d.includes(nimP + '\n' + prodiP)) {
  console.log('[SUDAH ADA] Prodi sudah tampil di bawah NIM pada header')
} else if (d.includes(nimP)) {
  d = d.replace(nimP, nimP + '\n' + prodiP)
  ubahD = true
  console.log('[BERHASIL] Prodi ditambahkan di bawah NIM pada header dashboard')
} else {
  console.log('[TIDAK KETEMU] Baris NIM pada header dashboard')
}

if (ubahD) simpan(FILE_D, d)

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Hasil akhir kedua perubahan:')
console.log('1. Kartu logbook dan kartu galeri beserta modal detailnya kini hanya menampilkan nama dan NIM pada chip pemilik, tanpa baris prodi.')
console.log('2. Header dashboard tidak lagi menampilkan label Dashboard mahasiswa, sehingga kartu langsung dibuka oleh nama mahasiswa.')
console.log('3. Nama prodi tampil rapi di bawah baris NIM pada header dashboard, sesuai lampiran kedua yang kamu kirim.')
console.log('4. Halaman Tim & Dospem tetap menjadi satu-satunya halaman publik lain yang menampilkan prodi, sesuai kesepakatan sebelumnya.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman Logbook dan Galeri: chip pemilik di setiap kartu hanya berisi foto, nama, dan NIM.')
console.log('2. Buka detail logbook atau galeri: chip di dalam modal juga tanpa prodi.')
console.log('3. Buka dashboard: header menampilkan foto, nama besar, NIM, lalu prodi di bawahnya, tanpa label Dashboard mahasiswa.')
console.log('4. Buka Tim & Dospem: pil prodi di kartu Profil tim magang tetap tampil normal.')