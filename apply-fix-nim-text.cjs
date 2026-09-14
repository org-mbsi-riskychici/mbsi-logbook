const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_D = 'src/pages/DospemPage.jsx'

if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] DospemPage.jsx tidak ditemukan')
  process.exit(1)
}

let d = fs.readFileSync(path.join(root, FILE_D), 'utf8').replace(/\r\n/g, '\n')

/* Cari baris NIM di dalam kartu Profil Tim yang masih menggunakan text-sm */
const cari = '<p className="truncate text-sm text-slate-500">NIM {p.nim}</p>'
const ganti = '<p className="truncate text-xs text-slate-500">NIM {p.nim}</p>'

if (d.includes(ganti)) {
  console.log('[SUDAH ADA] Teks NIM sudah menggunakan text-xs')
  process.exit(0)
}

if (!d.includes(cari)) {
  console.log('[TIDAK KETEMU] Pola teks NIM dengan text-sm di kartu Profil Tim')
  process.exit(1)
}

d = d.split(cari).join(ganti)
fs.writeFileSync(path.join(root, FILE_D), d, 'utf8')

console.log('[BERHASIL] Teks NIM di kartu Profil Tim diubah dari text-sm menjadi text-xs')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Hasil perubahan:')
console.log('1. Nama mahasiswa tetap menonjol dengan ukuran text-lg dan ketebalan font-black.')
console.log('2. NIM turun satu tingkat menjadi text-xs sehingga terlihat lebih tipis dan tidak bersaing dengan nama.')
console.log('3. Pil prodi hijau mint di bawahnya tetap memakai ukuran text-[11px] sehingga selaras dengan NIM yang baru diperkecil.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka menu Tim & Dospem, lihat section Profil tim magang.')
console.log('2. Perhatikan urutan tipografi: nama besar tebal, NIM kecil tipis, pil prodi mungil berwarna.')
console.log('3. Pastikan tidak ada teks yang saling bertumpuk atau keluar dari batas kartu.')