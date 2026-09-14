const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai memasang foto profil di halaman daftar hadir...')
console.log('')

/* ===== 1. AttendancePage.jsx: pastikan query memuat foto_profil ===== */
const FILE_A = 'src/pages/AttendancePage.jsx'
if (!ada(FILE_A)) {
  console.log('[LEWATI] AttendancePage.jsx tidak ditemukan')
} else {
  let a = baca(FILE_A)
  console.log('[DIAGNOSIS] Query select di AttendancePage:')
  const semuaSelect = a.match(/\.select\([^)]*\)/g) || []
  semuaSelect.forEach(function (s) { console.log('   ' + s) })
  let berubah = false
  a = a.replace(/\.select\((['"`])([^'"`]+)\1\)/g, function (m, q, c) {
    if (c.includes('mahasiswa') && !c.includes('foto_profil') && c.indexOf('mahasiswa(*)') === -1) {
      berubah = true
      return '.select(' + q + c.replace(/mahasiswa(!inner)?\([^)]*\)/g, 'mahasiswa$1(*)') + q + ')'
    }
    return m
  })
  if (berubah) {
    simpan(FILE_A, a)
    console.log('[BERHASIL] Query daftar hadir kini memuat seluruh kolom mahasiswa termasuk foto_profil')
  } else {
    console.log('[INFO] Query daftar hadir sudah memuat mahasiswa(*) atau foto_profil')
  }
}

/* ===== 2. cards.jsx: pastikan Avatar terimpor ===== */
const FILE_C = 'src/components/cards.jsx'
if (!ada(FILE_C)) {
  console.log('[GAGAL] cards.jsx tidak ditemukan')
  process.exit(1)
}
let c = baca(FILE_C)
const regexImpAvatar = /import\s*\{[^}]*\bAvatar\b[^}]*\}\s*from\s*'\.\/ui\.jsx'/
if (regexImpAvatar.test(c)) {
  console.log('[SUDAH ADA] Import Avatar di cards.jsx')
} else {
  const mImp = c.match(/import\s*\{([^}]*)\}\s*from\s*'\.\/ui\.jsx'/)
  if (mImp) {
    c = c.replace(mImp[0], "import {" + mImp[1] + ", Avatar } from './ui.jsx'")
    console.log('[BERHASIL] Avatar ditambahkan ke import ui.jsx yang sudah ada')
  } else {
    c = "import { Avatar } from './ui.jsx'\n" + c
    console.log('[BERHASIL] Baris import Avatar baru ditambahkan di cards.jsx')
  }
}

/* ===== 3. Sisipkan Avatar ke AttendanceCard dan AttendanceDetail ===== */
function potongFungsi(isi, nama) {
  const re = new RegExp('export function ' + nama + '\\s*\\(')
  const m = re.exec(isi)
  if (!m) return null
  let brace = 0, akhir = -1, inStr = false, strCh = ''
  for (let i = m.index; i < isi.length; i++) {
    const ch = isi[i]
    const prev = i > 0 ? isi[i - 1] : ''
    if (inStr) { if (ch === strCh && prev !== '\\') inStr = false; continue }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue }
    if (ch === '{') brace++
    if (ch === '}') { brace--; if (brace === 0) { akhir = i + 1; break } }
  }
  if (akhir === -1) return null
  return { mulai: m.index, akhir: akhir }
}

const TARGET_KOMPONEN = [
  { nama: 'AttendanceCard', size: 'md' },
  { nama: 'AttendanceDetail', size: 'lg' }
]

TARGET_KOMPONEN.forEach(function (t) {
  const rentang = potongFungsi(c, t.nama)
  if (!rentang) {
    console.log('[TIDAK KETEMU] Fungsi ' + t.nama + ' di cards.jsx')
    return
  }
  const body = c.slice(rentang.mulai, rentang.akhir)
  if (body.indexOf('<Avatar') !== -1) {
    console.log('[SUDAH ADA] Avatar di ' + t.nama)
    return
  }
  const avatarJsx = '<Avatar src={row.mahasiswa && row.mahasiswa.foto_profil ? row.mahasiswa.foto_profil : null} nama={row.mahasiswa ? row.mahasiswa.nama : \'Mahasiswa\'} size="' + t.size + '" />'
  let bodyBaru = body.replace(/(<div\s+className="flex\s+items-(?:start|center)[^"]*"\s*>)\s*(<div\s+className="min-w-0)/, function (m, p1, p2) {
    return p1 + '\n' + avatarJsx + '\n' + p2
  })
  let pola = 'flex + min-w-0'
  if (bodyBaru === body) {
    bodyBaru = body.replace(/<div\s+className="min-w-0/, function (m) {
      return avatarJsx + '\n' + m
    })
    pola = 'min-w-0 langsung'
  }
  if (bodyBaru === body) {
    console.log('[TIDAK KETEMU] Anchor penyisipan di ' + t.nama)
    return
  }
  c = c.slice(0, rentang.mulai) + bodyBaru + c.slice(rentang.akhir)
  console.log('[BERHASIL] Avatar dipasang di ' + t.nama + ' lewat pola ' + pola)
})

simpan(FILE_C, c)

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Hasil yang akan terlihat:')
console.log('1. Setiap kartu kehadiran di halaman Daftar Hadir menampilkan foto profil kotak melengkung di sebelah nama dan NIM.')
console.log('2. Modal detail kehadiran menampilkan foto ukuran lebih besar di bagian identitas.')
console.log('3. Mahasiswa tanpa foto tetap melihat inisial berwarna tema dengan bentuk yang sama.')
console.log('4. Tab Daftar Hadir di dashboard pemilik akun juga ikut berubah karena memakai kartu yang sama.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman Daftar Hadir: kartu kehadiran kini punya foto di kiri nama.')
console.log('2. Klik Detail pada salah satu baris: modal menampilkan foto ukuran besar.')
console.log('3. Buka tab Daftar Hadir di dashboard: perubahan yang sama terlihat di sana.')
console.log('4. Bila foto belum muncul padahal mahasiswa sudah upload, cek baris [DIAGNOSIS] query di atas dan kirim ke aku bila tidak memuat mahasiswa(*).')