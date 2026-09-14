const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ganti(rel, cari, gantiDengan, label) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan (' + label + ')'); return }
  let isi = baca(rel)
  if (isi.includes(gantiDengan)) { console.log('[SUDAH ADA] ' + label); return }
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label + ' di ' + rel); return }
  isi = isi.replace(cari, gantiDengan)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

console.log('Mulai membuat toast opaque yang ringan untuk device low end...')
console.log('')

/* ===== 1. ui.jsx: ganti kelas warna toast ke kelas khusus ===== */
ganti('src/components/ui.jsx',
  "(sukses ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50')",
  "(sukses ? 'toast-sukses' : 'toast-gagal')",
  'Kelas wadah toast diganti toast-sukses / toast-gagal')
ganti('src/components/ui.jsx',
  "'flex-1 text-sm font-semibold ' + (sukses ? 'text-emerald-800' : 'text-red-700')",
  "'flex-1 text-sm font-semibold toast-teks'",
  'Kelas teks toast diganti toast-teks')
ganti('src/components/ui.jsx',
  "onClick={function () { tutupToast(t.id) }} className=\"shrink-0 text-slate-400 hover:text-slate-600\"",
  "onClick={function () { tutupToast(t.id) }} className=\"toast-tutup shrink-0 text-slate-400 hover:text-slate-600\"",
  'Kelas tombol tutup toast ditambah toast-tutup')

/* ===== 2. index.css: gaya toast opaque tanpa backdrop-filter ===== */
const FILE_CSS = 'src/index.css'
const CSS_TOAST = `/* toast-opaque: latar solid bergradasi lembut, tanpa backdrop-filter agar ringan di device low end */
@keyframes anim-toast {
  from { opacity: 0; transform: translateX(14px) scale(0.98); }
  to { opacity: 1; transform: translateX(0) scale(1); }
}
.anim-toast { animation: anim-toast 0.22s ease-out; opacity: 1; }
.toast-sukses {
  background: linear-gradient(180deg, #ffffff 0%, #ecfdf5 100%);
  border-color: #a7f3d0;
  box-shadow: 0 10px 30px rgba(6, 95, 70, 0.16);
}
.toast-gagal {
  background: linear-gradient(180deg, #ffffff 0%, #fef2f2 100%);
  border-color: #fecaca;
  box-shadow: 0 10px 30px rgba(153, 27, 27, 0.16);
}
.toast-sukses .toast-teks { color: #065f46; }
.toast-gagal .toast-teks { color: #991b1b; }
.toast-tutup:hover { color: #334155; }
.dark .toast-sukses {
  background: linear-gradient(180deg, #065f46 0%, #064e3b 100%);
  border-color: rgba(52, 211, 153, 0.45);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
}
.dark .toast-gagal {
  background: linear-gradient(180deg, #991b1b 0%, #7f1d1d 100%);
  border-color: rgba(248, 113, 113, 0.45);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
}
.dark .toast-sukses .toast-teks { color: #d1fae5 !important; }
.dark .toast-gagal .toast-teks { color: #fee2e2 !important; }
.dark .toast-tutup { color: #cbd5e1 !important; }
.dark .toast-tutup:hover { color: #ffffff !important; }
`
if (!fs.existsSync(path.join(root, FILE_CSS))) {
  console.log('[LEWATI] index.css tidak ditemukan')
} else {
  let css = baca(FILE_CSS)
  if (css.includes('/* toast-opaque */')) {
    console.log('[SUDAH ADA] CSS toast-opaque di index.css')
  } else {
    simpan(FILE_CSS, css.trimEnd() + '\n\n' + CSS_TOAST)
    console.log('[BERHASIL] CSS toast-opaque ditambahkan di index.css')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Kenapa versi ini ringan di device jadul:')
console.log('1. Tidak memakai backdrop-filter blur sama sekali, jadi GPU tidak perlu merender ulang area di belakang toast setiap frame.')
console.log('2. Latar diganti gradasi solid yang hanya dirasterisasi sekali, bukan warna semi transparan yang tembus pandang.')
console.log('3. Animasi masuk hanya memakai opacity dan transform, dua properti termurah yang dikerjakan kompositor GPU.')
console.log('4. Kedalaman visual didapat dari box-shadow statis, bukan dari efek blur hidup.')
console.log('5. Mode gelap memakai hijau tua dan merah tua pekat dengan teks terang, kontras nyaman dibaca dan tidak tembus.')
console.log('')
console.log('Langkah uji:')
console.log('1. Mode gelap: hapus sebuah data, toast muncul hijau tua pekat, tombol Dashboard dan Keluar di belakangnya tidak lagi tembus.')
console.log('2. Mode terang: toast sukses putih kehijauan lembut, toast gagal putih kemerah-merahan, keduanya solid.')
console.log('3. Scroll halaman saat toast tampil: tidak ada patah patah karena tidak ada blur yang dihitung ulang.')
console.log('4. Tombol X tetap jelas di kedua mode dan berubah putih saat disentuh di mode gelap.')