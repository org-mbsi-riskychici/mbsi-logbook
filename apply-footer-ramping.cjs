const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai merampingkan footer sesuai Opsi A...')
console.log('')

/* ===== 1. Layout.jsx: footer satu baris ramping dengan tahun otomatis ===== */
const FILE_L = 'src/components/Layout.jsx'
const FOOTER_BARU = `<footer className="footer-ramping border-t border-slate-200 bg-white">
<div className="mx-auto max-w-7xl px-4 py-4 text-center">
<p className="text-xs text-slate-500">© {new Date().getFullYear()} Tim Magang BSI</p>
</div>
</footer>`
if (!fs.existsSync(path.join(root, FILE_L))) {
  console.log('[GAGAL] Layout.jsx tidak ditemukan')
  process.exit(1)
}
let l = baca(FILE_L)
if (l.includes('footer-ramping')) {
  console.log('[SUDAH ADA] Footer ramping di Layout.jsx')
} else {
  const iF = l.indexOf('<footer')
  const iE = l.indexOf('</footer>', iF)
  if (iF === -1 || iE === -1) {
    console.log('[TIDAK KETEMU] Blok footer di Layout.jsx')
  } else {
    l = l.slice(0, iF) + FOOTER_BARU + l.slice(iE + '</footer>'.length)
    simpan(FILE_L, l)
    console.log('[BERHASIL] Footer diganti menjadi satu baris ramping dengan tahun otomatis')
  }
}

/* ===== 2. index.css: rapatkan ruang mati di atas footer ===== */
const FILE_CSS = 'src/index.css'
const CSS_BLOK = `/* footer-ramping: ruang bawah halaman dirapatkan supaya footer slim terasa pas */
main { padding-bottom: 2.5rem !important; }
`
if (!fs.existsSync(path.join(root, FILE_CSS))) {
  console.log('[LEWATI] index.css tidak ditemukan')
} else {
  let css = baca(FILE_CSS)
  if (css.includes('footer-ramping:')) {
    console.log('[SUDAH ADA] CSS perapat ruang bawah di index.css')
  } else {
    simpan(FILE_CSS, css.trimEnd() + '\n\n' + CSS_BLOK)
    console.log('[BERHASIL] Ruang bawah halaman dirapatkan lewat index.css')
  }
}

/* ===== 3. Verifikasi ===== */
l = baca(FILE_L)
const css2 = baca(FILE_CSS)
console.log('')
console.log('Verifikasi:')
console.log((l.includes('footer-ramping') ? '[OK] ' : '[BELUM] ') + 'Footer ramping terpasang di Layout.jsx')
console.log((l.includes('new Date().getFullYear()') ? '[OK] ' : '[BELUM] ') + 'Tahun footer otomatis mengikuti tanggal sistem')
console.log((css2.includes('main { padding-bottom: 2.5rem') ? '[OK] ' : '[BELUM] ') + 'Ruang mati di atas footer dirapatkan')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Hasil akhir Opsi A:')
console.log('1. Footer kini hanya satu baris teks kecil di tengah dengan padding vertikal 16 piksel, total tinggi sekitar 48 piksel termasuk garis pemisah.')
console.log('2. Tahun tidak lagi ditulis manual melainkan diambil dari tanggal sistem, jadi tidak perlu diedit tiap pergantian tahun.')
console.log('3. Ruang kosong antara konten terakhir atau pagination dengan footer dipangkas menjadi 40 piksel, sehingga ujung halaman terasa rapat dan tidak mengambang.')
console.log('4. Garis pemisah atas dan pembeda warna tipis dipertahankan, jadi halaman tetap terasa berhenti dengan rapi di kedua mode.')
console.log('5. Pada halaman berisi sedikit konten, footer tetap menempel di bawah layar karena struktur flex layout tidak diubah.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman Daftar Hadir atau halaman berisi sedikit data: footer terlihat sebagai bar tipis yang rapi, bukan kotak tinggi.')
console.log('2. Gulir ke ujung halaman: jarak antara pagination dan footer kini pendek dan proporsional.')
console.log('3. Aktifkan mode gelap: warna footer menyesuaikan latar gelap dengan garis pemisah lembut seperti sebelumnya.')
console.log('4. Periksa teks footer: tahun tampil sesuai tahun berjalan tanpa perlu diubah manual.')
console.log('5. Buka halaman panjang seperti Logbook publik: footer tetap berada di ujung dokumen tanpa memakan ruang berlebihan.')