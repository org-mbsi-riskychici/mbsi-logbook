const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai menghapus section Ringkasan logbook per mahasiswa...')
console.log('')

const TARGET = ['src/pages/DospemPage.jsx', 'src/pages/TimPage.jsx']
let totalHapus = 0

TARGET.forEach(function (rel) {
  if (!ada(rel)) return
  let isi = baca(rel)
  const idx = isi.indexOf('Ringkasan logbook per mahasiswa')
  if (idx === -1) {
    console.log('[INFO] Judul tidak ditemukan di ' + rel)
    return
  }
  const start = isi.lastIndexOf('<section', idx)
  const end = isi.indexOf('</section>', idx)
  if (start === -1 || end === -1) {
    console.log('[TIDAK KETEMU] Batas section di ' + rel)
    return
  }
  const endFull = end + '</section>'.length
  const potongan = isi.slice(start, endFull)
  isi = isi.slice(0, start) + isi.slice(endFull)
  isi = isi.replace(/\n{3,}/g, '\n\n')
  simpan(rel, isi)
  totalHapus++
  console.log('[BERHASIL] Section dihapus dari ' + rel + ' (' + potongan.length + ' karakter dibuang)')
})

if (totalHapus === 0) {
  console.log('[GAGAL] Tidak ada section yang berhasil dihapus')
  process.exit(1)
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Struktur halaman Tim & Dospem setelah penghapusan:')
console.log('1. Hero hijau gelap dengan empat kartu statistik dan tiga tombol pintasan.')
console.log('2. Section Profil tim magang berisi kartu anggota dengan foto, identitas, pil prodi, dan tiga kotak kontribusi.')
console.log('3. Tidak ada lagi section ringkasan per mahasiswa yang duplikat, sehingga halaman lebih ringkas dan cepat dimuat.')
console.log('')
console.log('Catatan aman:')
console.log('1. Data logbook publik tetap dapat dijelajahi penuh lewat menu Logbook atau tombol Lihat logbook di hero.')
console.log('2. State dan modal detail dibiarkan ada sebagai jaring pengaman bila masih dirujuk bagian lain, sehingga tidak ada error referensi.')
console.log('3. Berkas TimPage.jsx ikut dibersihkan bila judul yang sama masih tersisa di sana, meski halamannya sudah dialihkan ke /dospem.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka menu Tim & Dospem: setelah kartu profil tim, halaman langsung berakhir tanpa section ringkasan lama.')
console.log('2. Gulir sampai bawah untuk memastikan tidak ada sisa kartu bernama Logbook publik satuan.')
console.log('3. Klik tombol Lihat logbook di hero: halaman Logbook tetap menampilkan seluruh logbook publik seperti biasa.')