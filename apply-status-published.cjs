const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai mengubah teks status "Siap dilihat" menjadi "Published"...')
console.log('')

let totalPerubahan = 0

/* 1. ui.jsx: StatusBadge di kartu logbook */
const FILE_UI = 'src/components/ui.jsx'
if (ada(FILE_UI)) {
  let u = baca(FILE_UI)
  const anchor = "{publik ? 'Siap dilihat' : 'Draft'}"
  if (u.indexOf(anchor) !== -1) {
    u = u.replace(anchor, "{publik ? 'Published' : 'Draft'}")
    simpan(FILE_UI, u)
    totalPerubahan++
    console.log('[BERHASIL] StatusBadge di ui.jsx kini menampilkan Published')
  } else if (u.indexOf("{publik ? 'Published' : 'Draft'}") !== -1) {
    console.log('[SUDAH ADA] StatusBadge sudah Published')
  } else {
    console.log('[TIDAK KETEMU] Pola StatusBadge di ui.jsx')
  }
} else {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
}

/* 2. DashboardPage.jsx: select status tampil + filter status logbook */
const FILE_DASH = 'src/pages/DashboardPage.jsx'
if (ada(FILE_DASH)) {
  let d = baca(FILE_DASH)
  const anchor = "{ value: 'publik', label: 'Siap dilihat' }"
  const jumlah = d.split(anchor).length - 1
  if (jumlah > 0) {
    d = d.split(anchor).join("{ value: 'publik', label: 'Published' }")
    simpan(FILE_DASH, d)
    totalPerubahan += jumlah
    console.log('[BERHASIL] ' + jumlah + ' lokasi label status di DashboardPage diubah menjadi Published')
  } else if (d.indexOf("{ value: 'publik', label: 'Published' }") !== -1) {
    console.log('[SUDAH ADA] Label status DashboardPage sudah Published')
  } else {
    console.log('[TIDAK KETEMU] Pola label status di DashboardPage')
  }
} else {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
}

/* 3. HomePage.jsx: teks EmptyState */
const FILE_HOME = 'src/pages/HomePage.jsx'
if (ada(FILE_HOME)) {
  let h = baca(FILE_HOME)
  const anchor = 'desc="Logbook yang sudah diatur sebagai siap dilihat akan tampil di sini."'
  if (h.indexOf(anchor) !== -1) {
    h = h.replace(anchor, 'desc="Logbook yang sudah berstatus Published akan tampil di sini."')
    simpan(FILE_HOME, h)
    totalPerubahan++
    console.log('[BERHASIL] Teks EmptyState di HomePage diperbarui')
  } else if (h.indexOf('berstatus Published') !== -1) {
    console.log('[SUDAH ADA] Teks EmptyState HomePage sudah diperbarui')
  } else {
    console.log('[TIDAK KETEMU] Pola EmptyState di HomePage')
  }
} else {
  console.log('[GAGAL] HomePage.jsx tidak ditemukan')
}

/* 4. Verifikasi */
console.log('')
console.log('Verifikasi:')
const vUi = ada(FILE_UI) ? baca(FILE_UI) : ''
const vDash = ada(FILE_DASH) ? baca(FILE_DASH) : ''
const vHome = ada(FILE_HOME) ? baca(FILE_HOME) : ''

console.log((vUi.indexOf("'Published'") !== -1 ? '[OK] ' : '[BELUM] ') + 'StatusBadge menampilkan Published')
console.log((vDash.indexOf("label: 'Published'") !== -1 ? '[OK] ' : '[BELUM] ') + 'Select dan filter status di Dashboard memakai Published')
console.log((vHome.indexOf('berstatus Published') !== -1 ? '[OK] ' : '[BELUM] ') + 'EmptyState HomePage menyebut Published')
console.log('')
console.log('Total perubahan: ' + totalPerubahan + ' lokasi')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Penjelasan:')
console.log('1. Istilah Published dipakai karena standar industri untuk pasangan Draft dan Published, digunakan WordPress, Medium, dan Shopify.')
console.log('2. Nilai yang disimpan ke database tetap draft dan publik, jadi tidak perlu migrasi database sama sekali. Yang berubah hanya teks tampilannya.')
console.log('3. Badge di kartu logbook kini menampilkan Draft atau Published.')
console.log('4. Dropdown status tampil dan filter status di dashboard kini memakai label Draft dan Published.')
console.log('5. Jika nanti ingin pakai istilah lain seperti Public atau Live, cukup ganti kata Published di script ini lalu jalankan ulang.')