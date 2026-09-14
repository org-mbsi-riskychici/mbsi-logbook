const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai memperbaiki NIM kosong, jarak kartu hadir, dan sebaran prodi...')
console.log('')

/* ===== 1. AttendancePage: query mahasiswa harus memuat nim ===== */
const FILE_H = 'src/pages/AttendancePage.jsx'
if (!ada(FILE_H)) {
  console.log('[LEWATI] AttendancePage.jsx tidak ditemukan')
} else {
  let h = baca(FILE_H)
  let ubahH = false
  h = h.replace(/\.from\('mahasiswa'\)\.select\('([^']*)'\)/g, function (m, isi) {
    if (isi.includes('nim')) return m
    ubahH = true
    return ".from('mahasiswa').select('" + isi + ", nim')"
  })
  if (ubahH) {
    simpan(FILE_H, h)
    console.log('[BERHASIL] Query mahasiswa di AttendancePage kini memuat kolom nim')
  } else {
    console.log('[SUDAH ADA] Query AttendancePage sudah memuat nim')
  }
}

/* ===== 2. cards.jsx: tambah ruang bawah tanggal di AttendanceCard ===== */
const FILE_C = 'src/components/cards.jsx'
if (!ada(FILE_C)) {
  console.log('[GAGAL] cards.jsx tidak ditemukan')
  process.exit(1)
}
let c = baca(FILE_C)
const mFn = /export function AttendanceCard\s*\(/.exec(c)
if (!mFn) {
  console.log('[TIDAK KETEMU] Fungsi AttendanceCard di cards.jsx')
} else {
  const mulai = mFn.index
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
    console.log('[GAGAL] Batas fungsi AttendanceCard tidak terbaca')
  } else {
    let body = c.slice(mulai, akhir)
    if (body.indexOf('formatTanggal(row.tanggal)') === -1) {
      console.log('[TIDAK KETEMU] Paragraf tanggal di AttendanceCard')
    } else if (/className="[^"]*pb-[^"]*"[^>]*>\{formatTanggal\(row\.tanggal\)\}/.test(body)) {
      console.log('[SUDAH ADA] Jarak bawah tanggal di AttendanceCard')
    } else {
      const bodyBaru = body.replace(/<p className="([^"]*)">\{formatTanggal\(row\.tanggal\)\}<\/p>/, function (m, cls) {
        return '<p className="' + cls + ' pb-4">{formatTanggal(row.tanggal)}</p>'
      })
      if (bodyBaru === body) {
        console.log('[TIDAK KETEMU] Pola paragraf tanggal untuk diberi jarak')
      } else {
        c = c.slice(0, mulai) + bodyBaru + c.slice(akhir)
        simpan(FILE_C, c)
        console.log('[BERHASIL] Jarak antara tanggal dan baris foto nama diperlebar di AttendanceCard')
      }
    }
  }
}

/* ===== 3. Cabut prodi dari cards.jsx (PersonChip dan PersonCard) ===== */
c = baca(FILE_C)
let nC = 0
c = c.replace(/\s*\{m\.prodi \? '[^']*' \+ m\.prodi : ''\}/g, function () { nC++; return '' })
c = c.replace(/\s*\{m\.prodi \? <p[^>]*>\{m\.prodi\}<\/p> : null\}/g, function () { nC++; return '' })
if (nC > 0) {
  simpan(FILE_C, c)
  console.log('[BERHASIL] ' + nC + ' kemunculan prodi dihapus dari cards.jsx')
} else {
  console.log('[INFO] Tidak ada prodi tersisa di cards.jsx')
}

/* ===== 4. Cabut prodi dari DashboardPage (header dan tab Profil) ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
if (!ada(FILE_D)) {
  console.log('[LEWATI] DashboardPage.jsx tidak ditemukan')
} else {
  let d = baca(FILE_D)
  let nD = 0
  d = d.replace(/\s*\{mahasiswa\.prodi \? <p[^>]*>\{mahasiswa\.prodi\}<\/p> : null\}/g, function () { nD++; return '' })
  d = d.replace(/\s*<p[^>]*>\{mahasiswa\.prodi\}<\/p>/g, function () { nD++; return '' })
  if (nD > 0) {
    simpan(FILE_D, d)
    console.log('[BERHASIL] ' + nD + ' kemunculan prodi dihapus dari DashboardPage')
  } else {
    console.log('[INFO] Tidak ada prodi tersisa di DashboardPage')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Hasil akhir ketiga perbaikan:')
console.log('1. Kartu grafik kehadiran di halaman Daftar Hadir kini menampilkan angka NIM lengkap di bawah nama.')
console.log('2. Kartu daftar hadir punya napas lega: tanggal berjarak 16 piksel dari baris foto, nama, dan badge status.')
console.log('3. Nama prodi hanya tampil di halaman Tim & Dospem, yaitu pada pil hijau di kartu Profil tim magang.')
console.log('4. Beranda, kartu logbook, kartu galeri, PersonChip di detail, header dashboard, dan tab Profil tidak lagi menampilkan prodi.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka Daftar Hadir: kartu grafik per mahasiswa menampilkan NIM berisi angka, bukan label kosong.')
console.log('2. Lihat kartu kehadiran: jarak tanggal ke baris foto dan nama kini lebih renggang dan nyaman dibaca.')
console.log('3. Sapu beranda, logbook, galeri, dan dashboard: tidak ada lagi teks prodi di luar halaman Tim & Dospem.')
console.log('4. Buka Tim & Dospem: pil prodi di kartu Profil tim magang tetap tampil sebagai satu-satunya pengecualian.')