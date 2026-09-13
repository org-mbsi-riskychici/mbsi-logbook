const fs = require('fs')
const path = require('path')

const root = process.cwd()
const FILE = 'src/pages/DashboardPage.jsx'

if (!fs.existsSync(path.join(root, FILE))) {
  console.log('[GAGAL] File tidak ditemukan: ' + FILE)
  process.exit(1)
}

let isi = fs.readFileSync(path.join(root, FILE), 'utf8').replace(/\r\n/g, '\n')
let berubah = false

const pasangan = [
  {
    cari: '<video src={it.preview} className="absolute inset-0 h-full w-full object-contain" muted />',
    ganti: '<video src={it.preview} controls playsInline preload="metadata" className="absolute inset-0 h-full w-full object-contain" />',
    label: 'Pratinjau video kegiatan bisa diputar dan digeser durasinya'
  },
  {
    cari: '<video src={galForm.preview} className="absolute inset-0 h-full w-full object-contain" muted />',
    ganti: '<video src={galForm.preview} controls playsInline preload="metadata" className="absolute inset-0 h-full w-full object-contain" />',
    label: 'Pratinjau video galeri bisa diputar dan digeser durasinya'
  }
]

for (const p of pasangan) {
  if (isi.includes(p.ganti)) {
    console.log('[SUDAH ADA] ' + p.label)
  } else if (isi.includes(p.cari)) {
    isi = isi.replace(p.cari, p.ganti)
    berubah = true
    console.log('[BERHASIL] ' + p.label)
  } else {
    console.log('[TIDAK KETEMU] ' + p.label)
  }
}

if (berubah) {
  fs.writeFileSync(path.join(root, FILE), isi, 'utf8')
}

console.log('')
console.log('Selesai. Vite akan memuat ulang otomatis.')
console.log('')
console.log('Langkah uji:')
console.log('1. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('2. Pilih file video di form logbook maupun form galeri.')
console.log('3. Pratinjau kini menampilkan pemutar: tombol putar, garis durasi yang bisa digeser, pengatur suara, dan tombol layar penuh.')
console.log('4. Durasi total muncul sesaat setelah file dipilih karena metadata dimuat lebih dulu.')
console.log('5. Tombol silang merah di pojok kanan atas tetap berfungsi untuk melepas lampiran.')
console.log('6. Video tidak berbunyi sendiri karena tidak ada autoplay, bunyi baru keluar setelah tombol putar ditekan.')