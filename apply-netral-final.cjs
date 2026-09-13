const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Pembersihan akhir teks proses dan pemindaian sisa sebutan YouTube...')
console.log('')

/* ===== 1. Bersihkan titik tiga pada teks onInfo di upload.js dan konversi.js ===== */
;['src/lib/upload.js', 'src/lib/konversi.js'].forEach(function (rel) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  const sebelum = isi
  isi = isi.replace(/onInfo\('([^'\n]*?)\.\.\.'\)/g, "onInfo('$1')")
  isi = isi.replace(/Mengunggah\.\.\. ' \+ /g, "Mengunggah ' + ")
  if (isi !== sebelum) {
    simpan(rel, isi)
    console.log('[BERHASIL] Teks proses dibersihkan di ' + rel)
  } else {
    console.log('[SUDAH BERSIH] ' + rel)
  }
})

/* ===== 2. Bersihkan pola serupa di DashboardPage bila masih tersisa ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[LEWATI] DashboardPage tidak ditemukan')
} else {
  let d = baca(FILE_D)
  const sebelum = d
  d = d.replace(/setInfoProses\('([^'\n]*?)\.\.\.'\)/g, "setInfoProses('$1')")
  d = d.replace(/setInfoProses\('([^'\n]*?)\.\.\. ' \+ /g, "setInfoProses('$1 ' + ")
  if (d !== sebelum) {
    simpan(FILE_D, d)
    console.log('[BERHASIL] Teks proses dibersihkan di DashboardPage')
  } else {
    console.log('[SUDAH BERSIH] DashboardPage')
  }
}

/* ===== 3. Pindai sisa sebutan YouTube huruf kapital di seluruh src ===== */
console.log('')
console.log('Pemindaian sisa teks YouTube huruf kapital pada folder src:')
let ketemu = 0
function jalan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  entries.forEach(function (e) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) { jalan(full); return }
    if (!/\.(jsx?|css|html)$/.test(e.name)) return
    const isi = fs.readFileSync(full, 'utf8')
    isi.split('\n').forEach(function (b, i) {
      if (b.includes('YouTube')) {
        ketemu++
        console.log('  ' + path.relative(root, full) + ':' + (i + 1) + '  ' + b.trim().slice(0, 120))
      }
    })
  })
}
jalan(path.join(root, 'src'))
if (ketemu === 0) console.log('  Tidak ada sisa teks YouTube huruf kapital. Bersih.')

console.log('')
console.log('Catatan: baris berisi alamat embed youtube-nocookie, i.ytimg, atau googleapis adalah teknis')
console.log('dan tidak tampil sebagai teks merek kepada pengguna, jadi wajar bila muncul di pemindaian huruf kecil.')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Langkah uji:')
console.log('1. Simpan logbook berisi foto atau video, perhatikan tombol simpan.')
console.log('2. Teks proses tampil tanpa titik tiga statis, diikuti tiga titik animasi yang halus.')
console.log('3. Contoh tampilan: Mengunggah 43 persen dengan titik berdenyut, bukan Mengunggah... 43 persen.')
console.log('4. Tidak ada kata YouTube pada label kuota, placeholder, peringatan, maupun tombol.')