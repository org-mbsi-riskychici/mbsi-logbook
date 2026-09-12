const fs = require('fs')
const path = require('path')

const root = process.cwd()
const FILE = 'src/components/ui.jsx'

function baca(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n')
}

function simpan(rel, isi) {
  fs.writeFileSync(path.join(root, rel), isi, 'utf8')
}

if (!fs.existsSync(path.join(root, FILE))) {
  console.log('File ' + FILE + ' tidak ditemukan.')
  process.exit(1)
}

console.log('Mulai memperbaiki masalah cache CORS pada fungsi unduh...')
console.log('')

let isi = baca(FILE)

const cari = `    try {
      const res = await fetch(props.src)`

const gantiDengan = `    try {
      const urlUnduh = props.src + (props.src.includes('?') ? '&' : '?') + 'unduh=1'
      const res = await fetch(urlUnduh, { cache: 'no-store' })`

if (isi.includes('cache: \'no-store\'')) {
  console.log('[SUDAH ADA] Fungsi unduh sudah memakai anti-cache')
} else if (!isi.includes(cari)) {
  console.log('[TIDAK KETEMU] Blok fetch(props.src) di ' + FILE)
} else {
  isi = isi.replace(cari, gantiDengan)
  simpan(FILE, isi)
  console.log('[BERHASIL] Fungsi unduh dipaksa mengabaikan cache gambar')
}

console.log('')
console.log('Selesai. Vite akan memuat ulang otomatis.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka foto di tampilan fullscreen.')
console.log('2. Klik tombol unduh. File sekarang pasti terunduh tanpa membuka tab baru.')
console.log('3. Error CORS di console akan hilang karena browser meminta URL baru yang dievaluasi CORS-nya.')