const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai menghaluskan perpindahan mode gelap dan terang...')
console.log('')

/* ===== 1. index.css: kelas transisi tema menyeluruh berdurasi pelan ===== */
const FILE_CSS = 'src/index.css'
const CSS_BLOK = `/* transisi-tema: pergantian mode pelan dan mulus, hanya aktif sesaat saat mode diganti supaya interaksi biasa tetap ringan */
.theme-transition, .theme-transition *, .theme-transition *::before, .theme-transition *::after {
  transition: background-color 0.7s ease-in-out, color 0.7s ease-in-out, border-color 0.7s ease-in-out, fill 0.7s ease-in-out, stroke 0.7s ease-in-out, box-shadow 0.7s ease-in-out !important;
  transition-delay: 0s !important;
}
`
if (!fs.existsSync(path.join(root, FILE_CSS))) {
  console.log('[LEWATI] index.css tidak ditemukan')
} else {
  let css = baca(FILE_CSS)
  if (css.includes('transisi-tema')) {
    console.log('[SUDAH ADA] CSS transisi-tema di index.css')
  } else {
    simpan(FILE_CSS, css.trimEnd() + '\n\n' + CSS_BLOK)
    console.log('[BERHASIL] CSS transisi-tema ditambahkan di index.css')
  }
}

/* ===== 2. main.jsx: nyalakan kelas transisi tepat saat kelas dark berubah ===== */
const FILE_M = 'src/main.jsx'
const JS_BLOK = `
/* ===== transisi-tema: aktifkan transisi pelan hanya pada momen pergantian mode ===== */
;(function () {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const akar = document.documentElement
  let gelap = akar.classList.contains('dark')
  let timer = null
  const obs = new MutationObserver(function () {
    const sekarang = akar.classList.contains('dark')
    if (sekarang === gelap) return
    gelap = sekarang
    akar.classList.add('theme-transition')
    if (timer) clearTimeout(timer)
    timer = setTimeout(function () { akar.classList.remove('theme-transition') }, 750)
  })
  obs.observe(akar, { attributes: true, attributeFilter: ['class'] })
})()
`
if (!fs.existsSync(path.join(root, FILE_M))) {
  console.log('[LEWATI] main.jsx tidak ditemukan')
} else {
  let m = baca(FILE_M)
  if (m.includes('theme-transition')) {
    console.log('[SUDAH ADA] Logika transisi-tema di main.jsx')
  } else {
    simpan(FILE_M, m.trimEnd() + '\n' + JS_BLOK)
    console.log('[BERHASIL] Logika transisi-tema ditambahkan di main.jsx')
  }
}

/* ===== 3. Verifikasi ===== */
const css2 = baca(FILE_CSS)
const m2 = fs.existsSync(path.join(root, FILE_M)) ? baca(FILE_M) : ''
console.log('')
console.log('Verifikasi:')
console.log((css2.includes('.theme-transition') ? '[OK] ' : '[BELUM] ') + 'Kelas transisi tema menyeluruh di index.css')
console.log((m2.includes('theme-transition') ? '[OK] ' : '[BELUM] ') + 'Pengamat pergantian kelas dark di main.jsx')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Kenapa sekarang terasa pelan dan mulus:')
console.log('1. Sebelumnya hanya body yang bertransisi 0.3 detik, sedangkan ratusan elemen lain berganti warna seketika, jadi perpindahan terlihat patah.')
console.log('2. Kini saat tombol mode diklik, kelas theme-transition dipasang ke akar dokumen tepat sebelum warna baru dihitung, sehingga seluruh elemen termasuk pseudo element ikut melunak selama 0.7 detik.')
console.log('3. Kurva ease-in-out membuat pergantian dimulai lembut, mengalir di tengah, lalu mendarat halus di akhir, terasa lebih pelan dari sebelumnya.')
console.log('4. Setelah 750 milidetik kelas transisi dilepas otomatis, jadi hover tombol, animasi kartu, dan interaksi harian tetap cepat dan tidak terlambat oleh transisi warna.')
console.log('5. Pengamat memakai MutationObserver pada atribut class akar dokumen, jadi tidak perlu menyentuh komponen tema maupun tombol mode sama sekali.')
console.log('6. Pengguna dengan pengaturan reduce motion otomatis dilewati, sesuai standar aksesibilitas yang sudah dipakai di seluruh web ini.')
console.log('')
console.log('Langkah uji:')
console.log('1. Klik tombol bulan atau matahari di header: seluruh halaman termasuk kartu, header, tombol, dan teks luluh perlahan dari gelap ke terang atau sebaliknya.')
console.log('2. Perhatikan tidak ada lagi bagian yang kedip instan; semua warna bergerak serentak selama kurang lebih tiga perempat detik.')
console.log('3. Segera setelah pergantian selesai, arahkan kursor ke tombol: hover tetap responsif seperti biasa tanpa rasa lambat.')
console.log('4. Bolak balik mode beberapa kali: setiap perpindahan sama halusnya tanpa sisa kelas transisi menumpuk.')
console.log('5. Buka mode gelap lalu muat ulang halaman: warna awal tetap benar karena kelas transisi hanya hidup sesaat saat pergantian.')