const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) {
  const p = path.join(root, rel)
  if (!fs.existsSync(p)) return null
  return fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n')
}

console.log('Mulai memeriksa status perbaikan urutan...')
console.log('')

const f = baca('src/lib/format.js')
const h = baca('src/pages/HomePage.jsx')
const d = baca('src/pages/DospemPage.jsx')
if (f === null || h === null || d === null) {
  console.log('[GAGAL] Salah satu file tidak ditemukan')
  process.exit(1)
}

const cek = [
  [f.includes('function waktuUrut'), 'format.js: fungsi tiebreaker waktuUrut sudah ada'],
  [f.includes('waktuUrut(a)') && f.includes('waktuUrut(b)'), 'format.js: pembanding urutkanTanggal memakai created_at'],
  [h.includes("urutkanTanggal(logs, 'terbaru').slice(0, 6)"), 'HomePage.jsx: slice 6 data lewat urutkanTanggal'],
  [/import[^\n]*urutkanTanggal[^\n]*format\.js/.test(h), 'HomePage.jsx: import urutkanTanggal ada'],
  [d.includes("urutkanTanggal(logs, 'terbaru').slice(0, 6)"), 'DospemPage.jsx: slice 6 data lewat urutkanTanggal'],
  [/import[^\n]*urutkanTanggal[^\n]*format\.js/.test(d), 'DospemPage.jsx: import urutkanTanggal ada']
]
let semuaOk = true
cek.forEach(function (c) {
  console.log((c[0] ? '[OK] ' : '[BELUM] ') + c[1])
  if (!c[0]) semuaOk = false
})

console.log('')
if (semuaOk) {
  console.log('Semua bagian aktif. Perbaikan urutan berlaku penuh di seluruh halaman.')
} else {
  console.log('Masih ada bagian yang belum aktif:')
  console.log('1. Bila baris format.js yang BELUM: jalankan node apply-fix-urutan2.cjs')
  console.log('2. Bila baris HomePage atau DospemPage yang BELUM: jalankan node apply-fix-urutan.cjs lagi')
}
console.log('')
console.log('Ringkasan alur akhir di Beranda dan Tim & Dospem:')
console.log('1. Data diambil dari database apa adanya.')
console.log('2. Data diurutkan ulang di frontend pakai urutkanTanggal: tanggal dulu, bila kembar maka created_at paling baru menang.')
console.log('3. Baru kemudian dipotong 6 teratas, jadi yang tampil dijamin 6 yang benar benar terbaru.')