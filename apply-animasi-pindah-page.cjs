const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_M = 'src/main.jsx'
if (!fs.existsSync(path.join(root, FILE_M))) {
  console.log('[GAGAL] main.jsx tidak ditemukan')
  process.exit(1)
}
let m = fs.readFileSync(path.join(root, FILE_M), 'utf8').replace(/\r\n/g, '\n')

const JS_BLOK = `
/* ===== transisi-halaman-v1: picu ulang animasi saat pindah rute dan pindah halaman pagination ===== */
;(function () {
  if (typeof document === 'undefined') return
  function ulangAnimasi(el) {
    if (!el) return
    el.style.animation = 'none'
    void el.offsetWidth
    el.style.animation = ''
  }
  function pasang() {
    document.addEventListener('click', function (e) {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const t = e.target
      if (!t || !t.closest) return
      const link = t.closest('a[href]')
      if (link) {
        const href = link.getAttribute('href') || ''
        const eksternal = link.target === '_blank' || href.indexOf('http') === 0 || href.indexOf('#') === 0
        if (!eksternal) {
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              ulangAnimasi(document.querySelector('main.anim-page') || document.querySelector('.anim-page'))
            })
          })
        }
        return
      }
      const pag = t.closest('.mt-8.flex.flex-wrap.items-center.justify-center.gap-2')
      if (pag && t.closest('button')) {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            const grid = document.querySelectorAll('.grid-pusat, .grid-pusat-rapat, .kartu-grid')
            for (let i = 0; i < grid.length; i++) {
              const anak = grid[i].children
              for (let j = 0; j < anak.length; j++) ulangAnimasi(anak[j])
            }
          })
        })
      }
    }, true)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pasang)
  else pasang()
})()
`

console.log('Mulai memasang animasi perpindahan halaman dan pagination...')
console.log('')

if (m.includes('transisi-halaman-v1')) {
  console.log('[SUDAH ADA] Logika transisi halaman di main.jsx')
} else {
  m = m.trimEnd() + '\n' + JS_BLOK
  fs.writeFileSync(path.join(root, FILE_M), m, 'utf8')
  console.log('[BERHASIL] Logika transisi halaman ditambahkan di main.jsx')
}

m = fs.readFileSync(path.join(root, FILE_M), 'utf8')
console.log('')
console.log('Verifikasi:')
console.log((m.includes('transisi-halaman-v1') ? '[OK] ' : '[BELUM] ') + 'Logika picu ulang animasi terpasang di main.jsx')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Cara kerja fitur baru:')
console.log('1. Saat tautan menu internal diklik (Beranda, Logbook, Galeri, Daftar Hadir, Tim & Dospem, Dashboard), animasi appFadeUp pada elemen main dipicu ulang setelah render rute baru selesai, sehingga halaman baru selalu masuk dengan fade naik yang lembut.')
console.log('2. Saat tombol pagination diklik (Sebelumnya, nomor halaman, Berikutnya), seluruh anak grid kartu dipicu ulang animasi stagger-nya, jadi kartu halaman baru muncul berurutan seperti air terjun, bukan mengganti isi secara datar.')
console.log('3. Teknik pemicuan memakai pola none lalu kembalikan kosong, cara standar memulai ulang animasi CSS tanpa menambah library apa pun.')
console.log('4. Penungguan dua requestAnimationFrame menjamin animasi dimulai setelah DOM baru benar benar terpasang, sehingga tidak ada kedip di awal.')
console.log('5. Tautan eksternal, target blank, dan anchor hash dilewati, dan pengguna dengan pengaturan reduce motion tidak mendapat efek apa pun.')
console.log('6. Scroll halus ke atas yang sudah ada tetap bekerja, jadi kombinasi gulir naik plus kartu berurutan terasa seperti satu gerakan utuh.')
console.log('')
console.log('Langkah uji:')
console.log('1. Klik pindah pindah menu di navigasi: setiap halaman baru masuk dengan fade naik halus, bukan ganti instan.')
console.log('2. Buka Logbook publik dengan data lebih dari satu halaman, klik halaman 2: kartu kartu muncul berurutan dari kiri ke kanan.')
console.log('3. Klik Berikutnya dan Sebelumnya berulang: animasi stagger selalu terputar rapi tiap pergantian.')
console.log('4. Ulangi pada grid Galeri, Daftar Hadir, dan daftar di dashboard: perilaku sama.')
console.log('5. Klik tautan luar atau anchor: tidak ada efek samping apa pun.')