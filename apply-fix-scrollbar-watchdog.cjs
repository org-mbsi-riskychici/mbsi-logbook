const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang watchdog indikator scrollbar (versi tahan indentasi)...')
console.log('')

const FILE_M = 'src/main.jsx'
if (!fs.existsSync(path.join(root, FILE_M))) {
  console.log('[GAGAL] main.jsx tidak ditemukan')
  process.exit(1)
}
let m = baca(FILE_M)
let berubah = false

/* ===== 1. Ganti blok timer dengan timer plus watchdog, indentasi mengikuti file ===== */
if (m.includes('mulaiWatchdog')) {
  console.log('[SUDAH ADA] Watchdog indikator scrollbar di main.jsx')
} else {
  const reTimer = /([ \t]*)let timer = null\n[ \t]*function sembunyikan\(\) \{ track\.classList\.remove\('aktif'\) \}\n[ \t]*function tampilkan\(\) \{\n[ \t]*track\.classList\.add\('aktif'\)\n[ \t]*if \(timer\) clearTimeout\(timer\)\n[ \t]*timer = setTimeout\(sembunyikan, 900\)\n[ \t]*\}/
  const BLOK = `let timer = null
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
  if (reTimer.test(m)) {
    m = m.replace(reTimer, function (match, ind) {
      return BLOK.split('\n').map(function (l) { return l.length ? ind + l : l }).join('\n')
    })
    berubah = true
    console.log('[BERHASIL] Blok timer diganti menjadi timer plus watchdog')
  } else {
    console.log('[TIDAK KETEMU] Blok timer indikator scrollbar di main.jsx')
  }
}

/* ===== 2. onScroll mencatat elemen sumber scroll terakhir ===== */
if (m.includes('sumber = t')) {
  console.log('[SUDAH ADA] Pencatatan sumber scroll di onScroll')
} else {
  const sebelum = m
  m = m.replace(/([ \t]*)ukur\(null, true, \{ top: 0, height: window\.innerHeight, right: window\.innerWidth \}\)/, function (match, ind) {
    return ind + 'sumber = null\n' + match
  })
  m = m.replace(/([ \t]*)const r = t\.getBoundingClientRect\(\)/, function (match, ind) {
    return ind + 'sumber = t\n' + match
  })
  if (m !== sebelum) {
    berubah = true
    console.log('[BERHASIL] onScroll kini mencatat elemen sumber scroll terakhir')
  } else {
    console.log('[TIDAK KETEMU] Pola onScroll indikator scrollbar di main.jsx')
  }
}

if (berubah) simpan(FILE_M, m)

/* ===== 3. Verifikasi ===== */
console.log('')
console.log('Verifikasi:')
const m2 = baca(FILE_M)
console.log((m2.includes('mulaiWatchdog') ? '[OK] ' : '[BELUM] ') + 'Watchdog indikator scrollbar terpasang')
console.log((m2.includes('sumber = t') ? '[OK] ' : '[BELUM] ') + 'Sumber scroll terakhir dicatat')
console.log((m2.includes('!sumber.isConnected') ? '[OK] ' : '[BELUM] ') + 'Indikator langsung hilang saat elemen sumber terlepas dari DOM')
console.log((m2.includes("function sembunyikan() { track.classList.remove('aktif'); stopWatchdog() }") ? '[OK] ' : '[BELUM] ') + 'Sembunyikan sekaligus mematikan watchdog')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Kenapa script kemarin gagal di main.jsx:')
console.log('1. Pola lama menulis jumlah spasi tetap di awal baris, padahal indentasi blok indikator di main.jsx-mu berbeda beberapa spasi, sehingga includes selalu gagal.')
console.log('2. Versi ini memakai regex dengan [ \t]* di tiap baris, jadi cocok berapapun indentasinya, dan indentasi blok pengganti otomatis mengikuti indentasi asli file.')
console.log('')
console.log('Cara kerja watchdog:')
console.log('1. Setiap kejadian scroll mencatat sumbernya: elemen untuk scroll dalam (daftar dropdown, isi modal, textarea) atau null untuk scroll halaman.')
console.log('2. Selama indikator aktif, interval 90ms memeriksa sumber terakhir: bila elemen sudah terlepas dari DOM (dropdown ditutup, modal dilepas) atau tidak lagi bisa digulir, indikator langsung disembunyikan saat itu juga.')
console.log('3. Untuk sumber halaman, indikator juga langsung hilang bila tinggi dokumen ternyata tidak lagi melebihi layar, misalnya setelah panel filter tertutup dan halaman menyusut.')
console.log('4. Bila sumber masih hidup dan masih bisa digulir, perilaku lama dipertahankan: indikator memudar 900ms setelah scroll berhenti.')
console.log('5. Interval watchdog hanya hidup selama indikator terlihat dan langsung dimatikan saat sembunyikan dipanggil, jadi tidak ada beban tambahan saat layar diam.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dropdown berisi daftar panjang, gulir di dalamnya, lalu tutup: garis scrollbar tipis hilang bersamaan dengan dropdown, tidak menunggu hampir satu detik.')
console.log('2. Buka modal detail, gulir isinya, tutup modal: indikator langsung hilang.')
console.log('3. Gulir halaman seperti biasa: indikator muncul dan tetap memudar sendiri setelah sekitar 0,9 detik.')
console.log('4. Tutup panel filter setelah menggulir halaman: indikator tidak menggantung meski timer belum jatuh tempo.')