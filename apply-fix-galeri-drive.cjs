const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE = 'src/pages/DashboardPage.jsx'

console.log('Memperbaiki submitGaleri agar menyimpan drive_id...')
console.log('')

let d = fs.readFileSync(path.join(root, FILE), 'utf8').replace(/\r\n/g, '\n')
let berubah = false

// 1. Sisipkan parsing driveIdGal tepat sebelum const payload = {
const pola1 = /if \(!mediaPath\) \{ toast\.gagal\('Galeri wajib memiliki media[^}]+\}\n(\s*)const payload = \{/
if (pola1.test(d) && d.indexOf('let driveIdGal = null') === -1) {
  d = d.replace(pola1, function(match, spasi) {
    return `if (!mediaPath) { toast.gagal('Galeri wajib memiliki media. Pilih file foto atau video terlebih dahulu.'); setBusy(false); return }\n${spasi}let driveIdGal = null\n${spasi}if (galMode === 'video' && galDriveLink) {\n${spasi}  driveIdGal = parseDriveId(galDriveLink)\n${spasi}  if (!driveIdGal) { toast.gagal('Link Google Drive tidak valid.'); setBusy(false); return }\n${spasi}}\n${spasi}const payload = {`
  })
  berubah = true
  console.log('[BERHASIL] Parsing driveIdGal ditambahkan sebelum payload galeri')
} else if (d.indexOf('let driveIdGal = null') !== -1) {
  console.log('[SUDAH ADA] Parsing driveIdGal')
} else {
  console.log('[TIDAK KETEMU] Anchor sebelum payload galeri')
}

// 2. Sisipkan drive_id ke dalam objek payload galeri
const pola2 = /media_source: mediaSource,\n(\s*)youtube_id: youtubeId\n(\s*)\}/
if (pola2.test(d) && d.indexOf('drive_id: driveIdGal') === -1) {
  d = d.replace(pola2, function(match, spasi1, spasi2) {
    return `media_source: mediaSource,\n${spasi1}youtube_id: youtubeId,\n${spasi1}drive_id: driveIdGal\n${spasi2}}`
  })
  berubah = true
  console.log('[BERHASIL] drive_id ditambahkan ke dalam objek payload galeri')
} else if (d.indexOf('drive_id: driveIdGal') !== -1) {
  console.log('[SUDAH ADA] drive_id di payload galeri')
} else {
  console.log('[TIDAK KETEMU] Anchor objek payload galeri')
}

if (berubah) {
  fs.writeFileSync(path.join(root, FILE), d, 'utf8')
  console.log('')
  console.log('File DashboardPage.jsx berhasil diperbarui.')
}

console.log('')
console.log('Verifikasi akhir:')
const v = fs.readFileSync(path.join(root, FILE), 'utf8')
console.log((v.indexOf('let driveIdGal = null') !== -1 ? '[OK] ' : '[BELUM] ') + 'Variabel driveIdGal dideklarasikan')
console.log((v.indexOf('drive_id: driveIdGal') !== -1 ? '[OK] ' : '[BELUM] ') + 'submitGaleri sekarang menyimpan drive_id ke database')

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')