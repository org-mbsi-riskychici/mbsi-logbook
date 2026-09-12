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

let isi = baca(FILE)

const cari = `    let nama = 'media'
      try {
        nama = new URL(props.src).pathname.split('/').pop() || 'media'
      } catch (e) {
        nama = (props.title || 'media') + '.jpg'
      }`

const gantiDengan = `    let nama = 'media'
      try {
        const urlAsli = new URL(props.src)
        const ekstensi = urlAsli.pathname.split('.').pop().split('?')[0] || 'jpg'
        if (props.title && props.title.trim()) {
          const judulAman = props.title.trim().replace(/[\\/\\\\:*?"<>|]/g, '').replace(/\\s+/g, '-').substring(0, 60)
          nama = judulAman + '.' + ekstensi
        } else {
          nama = urlAsli.pathname.split('/').pop() || ('media.' + ekstensi)
        }
      } catch (e) {
        nama = (props.title || 'media') + '.jpg'
      }`

const regex = /let nama = 'media'\s+try \{\s+nama = new URL\(props\.src\)\.pathname\.split\('\/'\)\.pop\(\) \|\| 'media'\s+\} catch \(e\) \{\s+nama = \(props\.title \|\| 'media'\) \+ '\.jpg'\s+\}/

if (isi.includes("judulAman = props.title.trim()")) {
  console.log('[SUDAH ADA] Nama file unduhan sudah memakai judul')
} else if (isi.includes(cari)) {
  isi = isi.replace(cari, gantiDengan)
  simpan(FILE, isi)
  console.log('[BERHASIL] Nama file unduhan disesuaikan dengan judul')
} else if (regex.test(isi)) {
  isi = isi.replace(regex, gantiDengan.trim())
  simpan(FILE, isi)
  console.log('[BERHASIL] Nama file unduhan disesuaikan dengan judul (lewat regex)')
} else {
  console.log('[TIDAK KETEMU] Blok penentuan nama file di ui.jsx')
}

console.log('')
console.log('Selesai. Vite akan memuat ulang otomatis.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka foto yang memiliki judul, perbesar, lalu klik unduh.')
console.log('2. File yang tersimpan di perangkatmu sekarang bernama sesuai judul kegiatan.')
console.log('3. Spasi pada judul otomatis diubah menjadi tanda hubung supaya rapi.')
console.log('4. Karakter berbahaya seperti garis miring atau tanda tanya otomatis dibuang.')
console.log('5. Kalau foto tidak punya judul, nama file akan kembali memakai nama acak dari R2.')