const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai mengecilkan dan menipiskan scrollbar overlay...')
console.log('')

/* ===== 1. index.css: track 8px jadi 4px, thumb 6px jadi 3px, tepi lebih rapat ===== */
const FILE_CSS = 'src/index.css'
if (!ada(FILE_CSS)) {
  console.log('[GAGAL] index.css tidak ditemukan')
  process.exit(1)
}
let css = baca(FILE_CSS)
let berubahCss = false

const TRACK_LAMA = '#scroll-indicator {\n  position: fixed;\n  right: 3px;\n  top: 0;\n  width: 8px;'
const TRACK_BARU = '#scroll-indicator {\n  position: fixed;\n  right: 2px;\n  top: 0;\n  width: 4px;'
if (css.indexOf(TRACK_BARU) !== -1) {
  console.log('[SUDAH ADA] Track scrollbar overlay sudah 4px')
} else if (css.indexOf(TRACK_LAMA) !== -1) {
  css = css.replace(TRACK_LAMA, TRACK_BARU)
  berubahCss = true
  console.log('[BERHASIL] Track scrollbar overlay diperkecil dari 8px menjadi 4px')
} else {
  console.log('[TIDAK KETEMU] Pola blok #scroll-indicator di index.css')
}

const THUMB_LAMA = '#scroll-thumb {\n  width: 6px;\n  margin-left: 1px;'
const THUMB_BARU = '#scroll-thumb {\n  width: 3px;\n  margin-left: 0.5px;'
if (css.indexOf(THUMB_BARU) !== -1) {
  console.log('[SUDAH ADA] Thumb scrollbar overlay sudah 3px')
} else if (css.indexOf(THUMB_LAMA) !== -1) {
  css = css.replace(THUMB_LAMA, THUMB_BARU)
  berubahCss = true
  console.log('[BERHASIL] Thumb scrollbar overlay ditipiskan dari 6px menjadi 3px')
} else {
  console.log('[TIDAK KETEMU] Pola blok #scroll-thumb di index.css')
}

if (berubahCss) simpan(FILE_CSS, css)

/* ===== 2. main.jsx: thumb minimum lebih pendek dan inset track disesuaikan ===== */
const FILE_M = 'src/main.jsx'
if (!ada(FILE_M)) {
  console.log('[LEWATI] main.jsx tidak ditemukan')
} else {
  let m = baca(FILE_M)
  let berubahM = false

  const MIN_LAMA = 'const thumbTinggi = Math.max(36, trackTinggi * ratio)'
  const MIN_BARU = 'const thumbTinggi = Math.max(24, trackTinggi * ratio)'
  if (m.indexOf(MIN_BARU) !== -1) {
    console.log('[SUDAH ADA] Tinggi minimum thumb sudah 24px')
  } else if (m.indexOf(MIN_LAMA) !== -1) {
    m = m.replace(MIN_LAMA, MIN_BARU)
    berubahM = true
    console.log('[BERHASIL] Tinggi minimum thumb dipendekkan dari 36px menjadi 24px')
  } else {
    console.log('[TIDAK KETEMU] Pola tinggi minimum thumb di main.jsx')
  }

  const INSET_LAMA = 'const trackTinggi = rect.height - 8'
  const INSET_BARU = 'const trackTinggi = rect.height - 6'
  if (m.indexOf(INSET_BARU) !== -1) {
    console.log('[SUDAH ADA] Inset track sudah 6px')
  } else if (m.indexOf(INSET_LAMA) !== -1) {
    m = m.replace(INSET_LAMA, INSET_BARU)
    berubahM = true
    console.log('[BERHASIL] Inset atas bawah track dirapatkan dari 8px menjadi 6px')
  } else {
    console.log('[TIDAK KETEMU] Pola inset track di main.jsx')
  }

  const GESER_LAMA = '(4 + gerak * maxTop)'
  const GESER_BARU = '(3 + gerak * maxTop)'
  if (m.indexOf(GESER_BARU) !== -1) {
    console.log('[SUDAH ADA] Offset awal thumb sudah 3px')
  } else if (m.indexOf(GESER_LAMA) !== -1) {
    m = m.replace(GESER_LAMA, GESER_BARU)
    berubahM = true
    console.log('[BERHASIL] Offset awal thumb disesuaikan dari 4px menjadi 3px')
  } else {
    console.log('[TIDAK KETEMU] Pola offset awal thumb di main.jsx')
  }

  const RIGHT_LAMA = "track.style.right = (window.innerWidth - rect.right + 3) + 'px'"
  const RIGHT_BARU = "track.style.right = (window.innerWidth - rect.right + 2) + 'px'"
  if (m.indexOf(RIGHT_BARU) !== -1) {
    console.log('[SUDAH ADA] Posisi kanan track sudah 2px')
  } else if (m.indexOf(RIGHT_LAMA) !== -1) {
    m = m.replace(RIGHT_LAMA, RIGHT_BARU)
    berubahM = true
    console.log('[BERHASIL] Posisi kanan track dirapatkan dari 3px menjadi 2px')
  } else {
    console.log('[TIDAK KETEMU] Pola posisi kanan track di main.jsx')
  }

  if (berubahM) simpan(FILE_M, m)
}

/* ===== 3. Verifikasi ===== */
console.log('')
console.log('Verifikasi:')
const vCss = baca(FILE_CSS)
const vM = ada(FILE_M) ? baca(FILE_M) : ''
console.log((vCss.indexOf('width: 4px;') !== -1 ? '[OK] ' : '[BELUM] ') + 'Track scrollbar overlay 4px')
console.log((vCss.indexOf('width: 3px;') !== -1 ? '[OK] ' : '[BELUM] ') + 'Thumb scrollbar overlay 3px')
console.log((vM.indexOf('Math.max(24, trackTinggi * ratio)') !== -1 ? '[OK] ' : '[BELUM] ') + 'Tinggi minimum thumb 24px')
console.log((vM.indexOf('rect.height - 6') !== -1 ? '[OK] ' : '[BELUM] ') + 'Inset track 6px')
console.log((vM.indexOf('rect.right + 2)') !== -1 ? '[OK] ' : '[BELUM] ') + 'Posisi kanan track 2px')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perubahan yang diterapkan:')
console.log('1. Lebar track indikator turun dari 8px menjadi 4px, sehingga garis jalur scrollbar tidak lagi terasa tebal di tepi layar.')
console.log('2. Lebar thumb turun dari 6px menjadi 3px dan diposisikan tepat di tengah track, menghasilkan garis tipis yang elegan.')
console.log('3. Tinggi minimum thumb turun dari 36px menjadi 24px, sehingga pada halaman sangat panjang thumb tidak terlihat seperti balok besar.')
console.log('4. Inset atas bawah track dan offset awal thumb dirapatkan supaya thumb tidak menggantung terlalu jauh dari ujung layar.')
console.log('5. Jarak track dari tepi kanan layar dirapatkan dari 3px menjadi 2px agar scrollbar tipis terasa menempel rapi di sisi jendela.')
console.log('6. Perilaku auto hide tidak diubah: indikator tetap muncul hanya saat menggulir lalu memudar sendiri, jadi layar tetap bersih.')
console.log('')
console.log('Langkah uji:')
console.log('1. Gulir halaman panjang seperti Logbook publik atau Dashboard: garis scrollbar kini berupa strip tipis 3px di tepi kanan.')
console.log('2. Gulir cepat sampai mentok: thumb terpendek kini sekitar 24px, tidak sepanjang sebelumnya.')
console.log('3. Buka modal detail berisi banyak konten lalu gulir di dalamnya: indikator tipis muncul mengikuti tepi panel modal.')
console.log('4. Aktifkan mode gelap: warna thumb tetap abu terang lembut dengan bentuk tipis yang sama.')
console.log('5. Diamkan sebentar setelah menggulir: scrollbar memudar hilang seperti biasanya.')