const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_L = 'src/components/Layout.jsx'

console.log('Mulai mengubah tahun footer menjadi statis 2026...')
console.log('')

if (!fs.existsSync(path.join(root, FILE_L))) {
  console.log('[GAGAL] Layout.jsx tidak ditemukan')
  process.exit(1)
}

let l = fs.readFileSync(path.join(root, FILE_L), 'utf8').replace(/\r\n/g, '\n')

if (l.includes('2026 Tim Magang BSI') && !l.includes('new Date().getFullYear()')) {
  console.log('[SUDAH ADA] Tahun footer sudah statis 2026')
} else if (l.includes('{new Date().getFullYear()}')) {
  l = l.replace('{new Date().getFullYear()}', '2026')
  fs.writeFileSync(path.join(root, FILE_L), l, 'utf8')
  console.log('[BERHASIL] Tahun footer diubah menjadi statis 2026')
} else {
  console.log('[TIDAK KETEMU] Pola tahun dinamis di Layout.jsx')
}

l = fs.readFileSync(path.join(root, FILE_L), 'utf8')
console.log('')
console.log('Verifikasi:')
console.log((l.includes('2026 Tim Magang BSI') ? '[OK] ' : '[BELUM] ') + 'Teks footer memuat angka 2026 secara statis')
console.log((!l.includes('new Date().getFullYear()') ? '[OK] ' : '[BELUM] ') + 'Fungsi new Date() sudah tidak dipakai di footer')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perubahan:')
console.log('1. Teks footer kini tertulis paten: © 2026 Tim Magang BSI.')
console.log('2. Tidak ada lagi pemanggilan fungsi waktu sistem, sehingga footer tidak akan pernah berubah meski dibuka pada tahun 2027 atau seterusnya.')
console.log('3. Ukuran file sedikit lebih ringan karena tidak perlu mengevaluasi ekspresi JavaScript saat merender footer.')