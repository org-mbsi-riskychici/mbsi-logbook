const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang crossfade kompositor untuk pergantian tema...')
console.log('')

/* ===== 1. theme.jsx: bungkus pergantian tema dengan startViewTransition ===== */
const FILE_T = 'src/lib/theme.jsx'
if (!fs.existsSync(path.join(root, FILE_T))) {
  console.log('[GAGAL] theme.jsx tidak ditemukan')
  process.exit(1)
}
let t = baca(FILE_T)
if (t.includes('startViewTransition')) {
  console.log('[SUDAH ADA] Toggle tema memakai startViewTransition')
} else {
  const RE_INLINE = /toggle: function \(\) \{ setDark\(function \(d\) \{ return !d \}\) \}/
  const RE_STANDALONE = /function toggle\(\) \{\s*setDark\(function \(d\) \{ return !d \}\)\s*\}/
  const BADAN = "const ganti = function () { setDark(function (d) { return !d }) }\nif (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(ganti)\nelse ganti()"
  if (RE_INLINE.test(t)) {
    t = t.replace(RE_INLINE, 'toggle: function () {\n' + BADAN + '\n}')
    simpan(FILE_T, t)
    console.log('[BERHASIL] Toggle tema dibungkus startViewTransition')
  } else if (RE_STANDALONE.test(t)) {
    t = t.replace(RE_STANDALONE, 'function toggle() {\n' + BADAN + '\n}')
    simpan(FILE_T, t)
    console.log('[BERHASIL] Fungsi toggle tema dibungkus startViewTransition')
  } else {
    console.log('[TIDAK KETEMU] Pola fungsi toggle di theme.jsx')
  }
}

/* ===== 2. main.jsx: lewati transisi fallback bila View Transitions tersedia ===== */
const FILE_M = 'src/main.jsx'
if (fs.existsSync(path.join(root, FILE_M))) {
  let m = baca(FILE_M)
  const RE_OBS = /gelap = sekarang(\s*)akar\.classList\.add\('theme-transition'\)/
  if (m.includes("if (document.startViewTransition) return")) {
    console.log('[SUDAH ADA] Penjaga View Transitions di pengamat main.jsx')
  } else if (RE_OBS.test(m)) {
    m = m.replace(RE_OBS, "gelap = sekarang$1if (document.startViewTransition) return$1akar.classList.add('theme-transition')")
    simpan(FILE_M, m)
    console.log('[BERHASIL] Pengamat tema melewati fallback bila View Transitions tersedia')
  } else {
    console.log('[TIDAK KETEMU] Pola pengamat tema di main.jsx')
  }
} else {
  console.log('[LEWATI] main.jsx tidak ditemukan')
}

/* ===== 3. index.css: aturan crossfade snapshot dan pemutus blur saat fallback ===== */
const FILE_CSS = 'src/index.css'
const CSS_BLOK = `/* transisi-tema-v3: crossfade snapshot di kompositor, bebas lukis ulang elemen */
::view-transition-old(root), ::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
::view-transition-old(root) { z-index: 1; }
::view-transition-new(root) { z-index: 2; }
@keyframes vtTema {
  from { opacity: 0; }
  to { opacity: 1; }
}
::view-transition-new(root) { animation: vtTema 0.4s ease; }
/* selama fallback transisi warna berjalan, matikan blur mahal supaya tidak patah */
.theme-transition [class*="backdrop-blur"] { backdrop-filter: none !important; }
`
if (!fs.existsSync(path.join(root, FILE_CSS))) {
  console.log('[LEWATI] index.css tidak ditemukan')
} else {
  let css = baca(FILE_CSS)
  if (css.includes('transisi-tema-v3')) {
    console.log('[SUDAH ADA] CSS transisi-tema-v3 di index.css')
  } else {
    simpan(FILE_CSS, css.trimEnd() + '\n\n' + CSS_BLOK)
    console.log('[BERHASIL] CSS crossfade snapshot ditambahkan di index.css')
  }
}

/* ===== 4. Verifikasi ===== */
t = baca(FILE_T)
const m2 = fs.existsSync(path.join(root, FILE_M)) ? baca(FILE_M) : ''
const css2 = baca(FILE_CSS)
console.log('')
console.log('Verifikasi:')
console.log((t.includes('startViewTransition') ? '[OK] ' : '[BELUM] ') + 'Toggle tema memakai View Transitions')
console.log((m2.includes('if (document.startViewTransition) return') ? '[OK] ' : '[BELUM] ') + 'Fallback dilewati bila View Transitions ada')
console.log((css2.includes('::view-transition-new(root)') ? '[OK] ' : '[BELUM] ') + 'Aturan crossfade snapshot tersedia')
console.log((css2.includes('.theme-transition [class*="backdrop-blur"]') ? '[OK] ' : '[BELUM] ') + 'Blur mahal dimatikan selama fallback')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Kenapa versi ini akhirnya mulus:')
console.log('1. Pergantian tema tidak lagi mentransisikan warna ratusan elemen satu per satu yang memaksa lukis ulang tiap frame.')
console.log('2. Browser mengambil snapshot layar lama dan baru sebagai tekstur, lalu crossfade 0.4 detik dikerjakan kompositor GPU, jadi terasa seperti video lembut.')
console.log('3. Elemen ber-backdrop-blur tidak lagi menghitung ulang blur tiap frame karena tidak ada warna yang beranimasi di bawahnya pada jalur View Transitions.')
console.log('4. Bila browser belum mendukung View Transitions, fallback transisi warna tetap jalan tetapi blur header dimatikan sementara selama jendela transisi, sumber patah utama ikut hilang.')
console.log('5. Pengguna dengan reduce motion langsung mendapat pergantian instan tanpa animasi, sesuai standar aksesibilitas.')
console.log('6. Klik beruntun tetap aman karena transisi yang sedang berjalan otomatis dibatalkan oleh transisi baru.')
console.log('')
console.log('Langkah uji:')
console.log('1. Klik tombol bulan atau matahari: seluruh layar luluh berganti mode dalam satu gerakan crossfade lembut tanpa sendatan.')
console.log('2. Perhatikan header berblur: tidak ada lagi getar atau patah saat warna berganti.')
console.log('3. Klik bolak balik dengan cepat: setiap pergantian tetap halus dan tidak menumpuk.')
console.log('4. Uji di browser lama bila ada: pergantian tetap beranimasi lewat fallback tanpa blur yang memberatkan.')