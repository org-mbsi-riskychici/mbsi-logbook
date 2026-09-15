const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai menyesuaikan placeholder Google Drive dan YouTube agar lebih jelas...')
console.log('')

const FILE_DASH = 'src/pages/DashboardPage.jsx'
if (!ada(FILE_DASH)) {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
  process.exit(1)
}

let d = baca(FILE_DASH)
let berubah = false
let totalPerubahan = 0

/* ===== 1. Placeholder YouTube di form logbook items ===== */
const ytLogLama = 'value={it.ytLink} onChange={function (e) { patchItem(i, { ytLink: e.target.value }) }} placeholder="Atau tempel link video eksternal"'
const ytLogBaru = 'value={it.ytLink} onChange={function (e) { patchItem(i, { ytLink: e.target.value }) }} placeholder="Link video YouTube untuk tampilan (opsional)"'
if (d.indexOf(ytLogLama) !== -1) {
  d = d.replace(ytLogLama, ytLogBaru)
  berubah = true
  totalPerubahan++
  console.log('[BERHASIL] Placeholder YouTube di form kegiatan logbook diperjelas')
} else if (d.indexOf(ytLogBaru) !== -1) {
  console.log('[SUDAH ADA] Placeholder YouTube logbook sudah diperjelas')
} else {
  console.log('[TIDAK KETEMU] Placeholder YouTube di form kegiatan logbook')
}

/* ===== 2. Placeholder Drive di form logbook items ===== */
const driveLogLama = 'value={it.driveLink} onChange={function (e) { patchItem(i, { driveLink: e.target.value }) }} placeholder="Atau tempel link Google Drive (opsional)"'
const driveLogBaru = 'value={it.driveLink} onChange={function (e) { patchItem(i, { driveLink: e.target.value }) }} placeholder="Link Google Drive untuk unduhan (opsional)"'
if (d.indexOf(driveLogLama) !== -1) {
  d = d.replace(driveLogLama, driveLogBaru)
  berubah = true
  totalPerubahan++
  console.log('[BERHASIL] Placeholder Drive di form kegiatan logbook disesuaikan dengan fitur unduhan')
} else if (d.indexOf(driveLogBaru) !== -1) {
  console.log('[SUDAH ADA] Placeholder Drive logbook sudah disesuaikan')
} else {
  console.log('[TIDAK KETEMU] Placeholder Drive di form kegiatan logbook')
}

/* ===== 3. Placeholder YouTube di form galeri ===== */
const ytGalLama = 'value={galYtLink} onChange={function (e) { setGalYtLink(e.target.value) }} placeholder="Atau tempel link video eksternal"'
const ytGalBaru = 'value={galYtLink} onChange={function (e) { setGalYtLink(e.target.value) }} placeholder="Link video YouTube untuk tampilan (opsional)"'
if (d.indexOf(ytGalLama) !== -1) {
  d = d.replace(ytGalLama, ytGalBaru)
  berubah = true
  totalPerubahan++
  console.log('[BERHASIL] Placeholder YouTube di form galeri diperjelas')
} else if (d.indexOf(ytGalBaru) !== -1) {
  console.log('[SUDAH ADA] Placeholder YouTube galeri sudah diperjelas')
} else {
  console.log('[TIDAK KETEMU] Placeholder YouTube di form galeri')
}

/* ===== 4. Placeholder Drive di form galeri ===== */
const driveGalLama = 'value={galDriveLink} onChange={function (e) { setGalDriveLink(e.target.value) }} placeholder="Atau tempel link Google Drive (opsional)"'
const driveGalBaru = 'value={galDriveLink} onChange={function (e) { setGalDriveLink(e.target.value) }} placeholder="Link Google Drive untuk unduhan (opsional)"'
if (d.indexOf(driveGalLama) !== -1) {
  d = d.replace(driveGalLama, driveGalBaru)
  berubah = true
  totalPerubahan++
  console.log('[BERHASIL] Placeholder Drive di form galeri disesuaikan dengan fitur unduhan')
} else if (d.indexOf(driveGalBaru) !== -1) {
  console.log('[SUDAH ADA] Placeholder Drive galeri sudah disesuaikan')
} else {
  console.log('[TIDAK KETEMU] Placeholder Drive di form galeri')
}

/* ===== 5. Simpan jika ada perubahan ===== */
if (berubah) {
  simpan(FILE_DASH, d)
}

/* ===== 6. Verifikasi ===== */
console.log('')
console.log('Verifikasi:')
const v = baca(FILE_DASH)
console.log((v.indexOf('Link video YouTube untuk tampilan (opsional)') !== -1 ? '[OK] ' : '[BELUM] ') + 'Placeholder YouTube diperjelas untuk tampilan')
console.log((v.indexOf('Link Google Drive untuk unduhan (opsional)') !== -1 ? '[OK] ' : '[BELUM] ') + 'Placeholder Drive diperjelas untuk unduhan')
console.log('')
console.log('Total perubahan: ' + totalPerubahan + ' lokasi')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Hasil akhir:')
console.log('1. Field YouTube kini berbunyi "Link video YouTube untuk tampilan (opsional)" sehingga user paham ini untuk menampilkan video di web.')
console.log('2. Field Google Drive kini berbunyi "Link Google Drive untuk unduhan (opsional)" sehingga user paham ini hanya untuk tombol download, bukan untuk tampilan.')
console.log('3. Kedua field tetap opsional dan bisa diisi salah satu atau keduanya sekaligus.')
console.log('4. Bahasa placeholder menggunakan istilah sederhana yang langsung dipahami tanpa perlu penjelasan tambahan.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard, pilih mode Video pada kegiatan logbook atau galeri.')
console.log('2. Perhatikan placeholder kedua field: YouTube untuk tampilan, Drive untuk unduhan.')
console.log('3. Isi link YouTube saja: video tampil di web tanpa tombol download Drive.')
console.log('4. Isi link YouTube dan Drive: video tampil dari YouTube dan tombol download mengambil file dari Drive.')
console.log('5. Isi link Drive saja tanpa YouTube: video tidak tampil karena tampilan tetap butuh YouTube, tapi ini bisa diatasi dengan tetap mengisi YouTube.')