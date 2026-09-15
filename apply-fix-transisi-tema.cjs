const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai menyetel ulang transisi mode gelap dan terang agar cepat dan mulus...')
console.log('')

/* ===== 1. index.css: durasi lebih singkat, kurva responsif, properti lebih sedikit ===== */
const FILE_CSS = 'src/index.css'
const RULE_BARU = `.theme-transition, .theme-transition *, .theme-transition *::before, .theme-transition *::after {
  transition: background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.35s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
  transition-delay: 0s !important;
}`
if (!fs.existsSync(path.join(root, FILE_CSS))) {
  console.log('[LEWATI] index.css tidak ditemukan')
} else {
  let css = baca(FILE_CSS)
  const RE_RULE = /\.theme-transition, \.theme-transition \*, \.theme-transition \*::before, \.theme-transition \*::after \{[^}]*\}/
  if (css.includes('0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.35s')) {
    console.log('[SUDAH ADA] Aturan transisi tema versi cepat di index.css')
  } else if (RE_RULE.test(css)) {
    css = css.replace(RE_RULE, RULE_BARU)
    simpan(FILE_CSS, css)
    console.log('[BERHASIL] Aturan transisi tema diganti versi cepat dan ringan')
  } else {
    css = css.trimEnd() + '\n\n' + RULE_BARU + '\n'
    simpan(FILE_CSS, css)
    console.log('[BERHASIL] Aturan transisi tema versi cepat ditambahkan sebagai penimpa')
  }
}

/* ===== 2. main.jsx: persempit jendela kelas transisi menjadi 400 milidetik ===== */
const FILE_M = 'src/main.jsx'
if (!fs.existsSync(path.join(root, FILE_M))) {
  console.log('[LEWATI] main.jsx tidak ditemukan')
} else {
  let m = baca(FILE_M)
  const RE_TIMER = /(setTimeout\(function \(\) \{ akar\.classList\.remove\('theme-transition'\) \}, )\d+(\))/
  if (!m.includes('theme-transition')) {
    console.log('[TIDAK KETEMU] Logika transisi tema di main.jsx')
  } else if (RE_TIMER.test(m)) {
    m = m.replace(RE_TIMER, '$1400$2')
    simpan(FILE_M, m)
    console.log('[BERHASIL] Jendela kelas transisi dipersempit menjadi 400 milidetik')
  } else {
    console.log('[SUDAH ADA] Timer jendela transisi sudah singkat')
  }
}

/* ===== 3. Verifikasi ===== */
const css2 = baca(FILE_CSS)
const m2 = fs.existsSync(path.join(root, FILE_M)) ? baca(FILE_M) : ''
console.log('')
console.log('Verifikasi:')
console.log((css2.includes('0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.35s') ? '[OK] ' : '[BELUM] ') + 'Durasi transisi tema 0.35 detik dengan kurva responsif')
console.log((m2.includes("remove('theme-transition') }, 400)") ? '[OK] ' : '[BELUM] ') + 'Jendela kelas transisi 400 milidetik')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Kenapa sekarang terasa cepat dan mulus:')
console.log('1. Durasi dipangkas dari 0.7 detik menjadi 0.35 detik, cukup panjang untuk terlihat lembut tetapi tidak menahan mata.')
console.log('2. Kurva cubic-bezier 0.4 0 0.2 1 memulai perubahan segera setelah klik dan melambat halus di akhir, menghilangkan kesan patah di awal dan kesan menggantung di akhir.')
console.log('3. Properti yang ditransisi dipangkas dari lima menjadi tiga, jadi beban lukis ulang browser turun drastis dan pergantian terasa licin bahkan di device jadul.')
console.log('4. Jendela kelas transisi dipersempit ke 400 milidetik, sehingga hover tombol, animasi kartu, dan toast kembali lincah hampir seketika setelah mode berganti.')
console.log('5. Bayangan dan ornamen kecil kini berganti instan tanpa transisi, dan itu justru membuat mata membaca pergantian sebagai satu gerakan bersih.')
console.log('')
console.log('Langkah uji:')
console.log('1. Klik tombol bulan atau matahari: seluruh halaman luluh berganti mode dalam sekitar sepertiga detik, tegas namun lembut.')
console.log('2. Segera setelah pergantian, arahkan kursor ke tombol atau kartu: hover langsung responsif tanpa rasa tertahan.')
console.log('3. Bolak balik mode beberapa kali cepat: tidak ada penumpukan transisi maupun kedip.')
console.log('4. Bila menurutmu masih kurang cepat atau kurang lembut, sebutkan angka durasi yang diinginkan dan saya cukup mengganti satu angka di aturan CSS.')