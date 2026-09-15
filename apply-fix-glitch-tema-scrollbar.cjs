const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai memperbaiki glitch transisi tema dan scrollbar indikator yang menempel...')
console.log('')

/* ===== 1. theme.jsx: bungkus update view transition dengan kelas vt-tema ===== */
const FILE_T = 'src/lib/theme.jsx'
if (!ada(FILE_T)) {
  console.log('[GAGAL] theme.jsx tidak ditemukan')
  process.exit(1)
}
let t = baca(FILE_T)
const TOGGLE_LAMA = `const ganti = function () { setDark(function (d) { return !d }) }
if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(ganti)
else ganti()`
const TOGGLE_BARU = `const ganti = function () { setDark(function (d) { return !d }) }
if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const akar = document.documentElement
  const vt = document.startViewTransition(function () {
    akar.classList.add('vt-tema')
    ganti()
  })
  const lepas = function () { akar.classList.remove('vt-tema') }
  vt.finished.then(lepas, lepas)
  setTimeout(lepas, 600)
} else ganti()`
if (t.includes('vt-tema')) {
  console.log('[SUDAH ADA] Kelas vt-tema di theme.jsx')
} else if (t.includes(TOGGLE_LAMA)) {
  t = t.replace(TOGGLE_LAMA, TOGGLE_BARU)
  simpan(FILE_T, t)
  console.log('[BERHASIL] Toggle tema memasang vt-tema selama view transition berjalan')
} else {
  console.log('[TIDAK KETEMU] Pola toggle lama di theme.jsx')
}

/* ===== 2. index.css: aturan vt-tema, matikan transisi dan blur saat capture snapshot ===== */
const FILE_CSS = 'src/index.css'
const CSS_BLOK = `/* transisi-tema-v4: capture snapshot bersih, navbar tidak berkedip dan tepi layar tidak menyala putih saat crossfade */
.vt-tema, .vt-tema *, .vt-tema *::before, .vt-tema *::after {
  transition: none !important;
}
.vt-tema [class*="backdrop-blur"] {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
`
if (!ada(FILE_CSS)) {
  console.log('[GAGAL] index.css tidak ditemukan')
  process.exit(1)
}
let css = baca(FILE_CSS)
if (css.includes('transisi-tema-v4')) {
  console.log('[SUDAH ADA] CSS transisi-tema-v4 di index.css')
} else {
  simpan(FILE_CSS, css.trimEnd() + '\n\n' + CSS_BLOK)
  console.log('[BERHASIL] CSS vt-tema ditambahkan di index.css')
}

/* ===== 3. main.jsx: watchdog supaya indikator scrollbar langsung hilang saat sumber scroll hilang ===== */
const FILE_M = 'src/main.jsx'
if (!ada(FILE_M)) {
  console.log('[GAGAL] main.jsx tidak ditemukan')
  process.exit(1)
}
let m = baca(FILE_M)
let berubahM = false

const BLOK_TIMER_LAMA = `     let timer = null
     function sembunyikan() { track.classList.remove('aktif') }
     function tampilkan() {
       track.classList.add('aktif')
       if (timer) clearTimeout(timer)
       timer = setTimeout(sembunyikan, 900)
     }`
const BLOK_TIMER_BARU = `     let timer = null
     let sumber = null
     let watchdog = null
     function stopWatchdog() {
       if (watchdog) { clearInterval(watchdog); watchdog = null }
     }
     function mulaiWatchdog() {
       if (watchdog) return
       watchdog = setInterval(function () {
         if (!track.classList.contains('aktif')) { stopWatchdog(); return }
         if (sumber) {
           if (!sumber.isConnected || sumber.scrollHeight - sumber.clientHeight <= 4) {
             sembunyikan()
             sumber = null
             stopWatchdog()
           }
         } else if (document.documentElement.scrollHeight - window.innerHeight <= 4) {
           sembunyikan()
           stopWatchdog()
         }
       }, 90)
     }
     function sembunyikan() { track.classList.remove('aktif'); stopWatchdog() }
     function tampilkan() {
       track.classList.add('aktif')
       if (timer) clearTimeout(timer)
       timer = setTimeout(sembunyikan, 900)
       mulaiWatchdog()
     }`
if (m.includes('mulaiWatchdog')) {
  console.log('[SUDAH ADA] Watchdog indikator scrollbar di main.jsx')
} else if (m.includes(BLOK_TIMER_LAMA)) {
  m = m.replace(BLOK_TIMER_LAMA, BLOK_TIMER_BARU)
  berubahM = true
  console.log('[BERHASIL] Watchdog sumber scroll dipasang pada indikator scrollbar')
} else {
  console.log('[TIDAK KETEMU] Blok timer indikator scrollbar di main.jsx')
}

const ONSCROLL_LAMA = `     function onScroll(e) {
       const t = e.target
       if (t === document || t === document.documentElement || t === window || !t || t.nodeType !== 1) {
         ukur(null, true, { top: 0, height: window.innerHeight, right: window.innerWidth })
       } else {
         const r = t.getBoundingClientRect()
         ukur(t, false, { top: r.top, height: r.height, right: r.right })
       }
       tampilkan()
     }`
const ONSCROLL_BARU = `     function onScroll(e) {
       const t = e.target
       if (t === document || t === document.documentElement || t === window || !t || t.nodeType !== 1) {
         sumber = null
         ukur(null, true, { top: 0, height: window.innerHeight, right: window.innerWidth })
       } else {
         sumber = t
         const r = t.getBoundingClientRect()
         ukur(t, false, { top: r.top, height: r.height, right: r.right })
       }
       tampilkan()
     }`
if (m.includes('sumber = t')) {
  console.log('[SUDAH ADA] Pencatatan sumber scroll di onScroll')
} else if (m.includes(ONSCROLL_LAMA)) {
  m = m.replace(ONSCROLL_LAMA, ONSCROLL_BARU)
  berubahM = true
  console.log('[BERHASIL] onScroll kini mencatat elemen sumber scroll terakhir')
} else {
  console.log('[TIDAK KETEMU] Blok onScroll indikator scrollbar di main.jsx')
}

if (berubahM) simpan(FILE_M, m)

/* ===== 4. Verifikasi ===== */
console.log('')
console.log('Verifikasi:')
const t2 = baca(FILE_T)
const c2 = baca(FILE_CSS)
const m2 = baca(FILE_M)
console.log((t2.includes('akar.classList.add(\'vt-tema\')') ? '[OK] ' : '[BELUM] ') + 'Toggle tema memasang kelas vt-tema saat view transition')
console.log((t2.includes('vt.finished.then(lepas, lepas)') ? '[OK] ' : '[BELUM] ') + 'Kelas vt-tema dilepas lagi saat transisi selesai')
console.log((c2.includes('transisi-tema-v4') ? '[OK] ' : '[BELUM] ') + 'CSS vt-tema tersedia di index.css')
console.log((c2.includes('.vt-tema [class*="backdrop-blur"]') ? '[OK] ' : '[BELUM] ') + 'Backdrop blur dimatikan selama capture snapshot')
console.log((m2.includes('mulaiWatchdog') ? '[OK] ' : '[BELUM] ') + 'Watchdog indikator scrollbar terpasang')
console.log((m2.includes('sumber = t') ? '[OK] ' : '[BELUM] ') + 'Sumber scroll terakhir dicatat')
console.log((m2.includes('!sumber.isConnected') ? '[OK] ' : '[BELUM] ') + 'Indikator langsung hilang saat elemen sumber terlepas dari DOM')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Penyebab dan cara kerja perbaikan:')
console.log('1. Glitch tepi putih: snapshot baru view transition direkam saat warna body dan tombol masih bertransisi, jadi ia merekam warna lama dan layar melompat satu frame di ujung transisi. Kini kelas vt-tema mematikan seluruh transisi selama capture, sehingga snapshot baru langsung berisi warna final dan crossfade mulus sampai habis.')
console.log('2. Navbar hilang lalu muncul: backdrop-filter header dihitung ulang terhadap latar snapshot saat capture. Kini vt-tema mematikan backdrop-filter hanya selama transisi berjalan, jadi navbar tertangkap utuh di kedua snapshot dan tidak berkedip lagi.')
console.log('3. Kelas vt-tema dipasang di dalam callback update view transition dan dilepas lewat promise finished plus pengaman 600ms, sehingga perilaku normal setelah transisi tidak berubah sama sekali.')
console.log('4. Scrollbar menempel: indikator dulu hanya mengandalkan timer 900ms. Kini watchdog 90ms memeriksa elemen sumber scroll terakhir; begitu elemen terlepas dari DOM (dropdown ditutup, modal dilepas) atau tidak lagi bisa digulir, indikator langsung disembunyikan tanpa menunggu timer.')
console.log('5. Untuk sumber scroll halaman biasa, watchdog juga menyembunyikan indikator bila halaman ternyata tidak lagi bisa digulir, misalnya setelah panel tertutup dan tinggi halaman menyusut.')
console.log('6. Perilaku auto hide normal tetap sama: indikator masih memudar 900ms setelah scroll berhenti selama sumber scrollnya masih hidup.')
console.log('')
console.log('Langkah uji:')
console.log('1. Ketuk tombol tema berulang kali: crossfade lembut tanpa navbar berkedip dan tanpa kilat putih di tepi layar.')
console.log('2. Buka dropdown berisi daftar panjang, gulir di dalamnya, lalu tutup: indikator scrollbar tipis langsung hilang bersamaan dengan dropdown.')
console.log('3. Buka modal detail, gulir isinya, tutup modal: indikator langsung hilang.')
console.log('4. Gulir halaman seperti biasa: indikator masih muncul dan memudar sendiri setelah sekitar 0,9 detik.')
console.log('5. Aktifkan reduce motion: pergantian tema tetap instan tanpa animasi.')