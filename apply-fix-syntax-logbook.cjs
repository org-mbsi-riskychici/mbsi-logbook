const fs = require('fs')
const path = require('path')
const root = process.cwd()

const FILE_L = 'src/lib/logbook.js'
const filePath = path.join(root, FILE_L)

if (!fs.existsSync(filePath)) {
  console.log('[GAGAL] ' + FILE_L + ' tidak ditemukan')
  process.exit(1)
}

let isi = fs.readFileSync(filePath, 'utf8')
const sebelum = isi

// Tambahkan koma yang hilang sebelum media_source (baik yang dipisahkan spasi maupun enter)
isi = isi.replace(/(\|\| null)(\s*)(media_source:)/g, '$1,$2$3')

if (isi !== sebelum) {
  fs.writeFileSync(filePath, isi, 'utf8')
  console.log('[BERHASIL] Koma yang hilang sebelum media_source telah ditambahkan di logbook.js.')
} else {
  console.log('[SUDAH BENAR] Tidak ada koma yang hilang di logbook.js.')
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('Website akan kembali normal dan tidak blank lagi.')