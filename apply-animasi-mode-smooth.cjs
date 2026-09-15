const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai menghaluskan pergantian mode waktu dan pergeseran tombol sortir...')
console.log('')

/* ===== 1. index.css: easing lebih halus plus kelas bayangan cabang ===== */
const FILE_CSS = 'src/index.css'
const CSS_BLOK = `/* mode-smooth-v2: easing lebih lembut untuk masuk, bayangan cabang untuk keluar, tetangga bergeser mulus */
@keyframes gantiBulan {
from { opacity: 0; transform: translateX(-12px) scale(0.99); }
to { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes gantiRentang {
from { opacity: 0; transform: translateX(12px) scale(0.99); }
to { opacity: 1; transform: translateX(0) scale(1); }
}
.anim-ganti-bulan { animation: gantiBulan 0.32s cubic-bezier(0.22, 1, 0.36, 1); }
.anim-ganti-rentang { animation: gantiRentang 0.32s cubic-bezier(0.22, 1, 0.36, 1); }
.hantu-cabang { pointer-events: none; }
`
if (!fs.existsSync(path.join(root, FILE_CSS))) {
  console.log('[LEWATI] index.css tidak ditemukan')
} else {
  let css = baca(FILE_CSS)
  if (css.includes('mode-smooth-v2')) {
    console.log('[SUDAH ADA] CSS mode-smooth-v2 di index.css')
  } else {
    simpan(FILE_CSS, css.trimEnd() + '\n\n' + CSS_BLOK)
    console.log('[BERHASIL] CSS mode-smooth-v2 ditambahkan di index.css')
  }
}

/* ===== 2. main.jsx: bayangan keluar cabang lama dan FLIP untuk tetangga yang bergeser ===== */
const FILE_M = 'src/main.jsx'
const JS_BLOK = `
/* ===== Pergeseran mulus isi filter saat mode waktu berganti (bayangan keluar plus FLIP) ===== */
;(function () {
  if (typeof document === 'undefined') return
  function pasang() {
    document.addEventListener('click', function (e) {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const tombol = e.target && e.target.closest ? e.target.closest('.time-toggle button') : null
      if (!tombol) return
      if ((' ' + tombol.className + ' ').indexOf(' active ') !== -1) return
      const toggle = tombol.closest('.time-toggle')
      if (!toggle || !toggle.parentElement) return
      const wadah = tombol.closest('.rounded-3xl') || toggle.parentElement.parentElement || toggle.parentElement
      const cabang = toggle.parentElement.querySelector('.anim-ganti-bulan, .anim-ganti-rentang')
      if (cabang) {
        const r = cabang.getBoundingClientRect()
        if (r.width > 0) {
          const hantu = cabang.cloneNode(true)
          hantu.style.position = 'fixed'
          hantu.style.left = r.left + 'px'
          hantu.style.top = r.top + 'px'
          hantu.style.width = r.width + 'px'
          hantu.style.height = r.height + 'px'
          hantu.style.margin = '0'
          hantu.style.zIndex = '45'
          hantu.classList.add('hantu-cabang')
          document.body.appendChild(hantu)
          const keBulan = !tombol.previousElementSibling
          if (hantu.animate) {
            hantu.animate([
              { opacity: 1, transform: 'translateX(0)' },
              { opacity: 0, transform: keBulan ? 'translateX(10px)' : 'translateX(-10px)' }
            ], { duration: 180, easing: 'ease-in' }).onfinish = function () { if (hantu.parentNode) hantu.parentNode.removeChild(hantu) }
          } else {
            setTimeout(function () { if (hantu.parentNode) hantu.parentNode.removeChild(hantu) }, 200)
          }
        }
      }
      const snap = new Map()
      const els = wadah.querySelectorAll('*')
      for (let i = 0; i < els.length; i++) snap.set(els[i], els[i].getBoundingClientRect())
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          snap.forEach(function (rect, el) {
            if (!el.isConnected || !el.animate) return
            const r = el.getBoundingClientRect()
            const dx = rect.left - r.left
            const dy = rect.top - r.top
            if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return
            el.animate([
              { transform: 'translate(' + dx + 'px, ' + dy + 'px)' },
              { transform: 'translate(0, 0)' }
            ], { duration: 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' })
          })
        })
      })
    }, true)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pasang)
  else pasang()
})()
`
if (!fs.existsSync(path.join(root, FILE_M))) {
  console.log('[LEWATI] main.jsx tidak ditemukan')
} else {
  let m = baca(FILE_M)
  if (m.includes('hantu-cabang')) {
    console.log('[SUDAH ADA] Logika bayangan cabang dan FLIP di main.jsx')
  } else {
    simpan(FILE_M, m.trimEnd() + '\n' + JS_BLOK)
    console.log('[BERHASIL] Logika bayangan cabang dan FLIP ditambahkan di main.jsx')
  }
}

/* ===== 3. Verifikasi ===== */
const css2 = baca(FILE_CSS)
const m2 = fs.existsSync(path.join(root, FILE_M)) ? baca(FILE_M) : ''
console.log('')
console.log('Verifikasi:')
console.log((css2.includes('mode-smooth-v2') ? '[OK] ' : '[BELUM] ') + 'CSS easing halus dan kelas bayangan cabang')
console.log((m2.includes('hantu-cabang') ? '[OK] ' : '[BELUM] ') + 'Logika bayangan keluar dan FLIP di main.jsx')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Kenapa sekarang terasa jauh lebih smooth:')
console.log('1. Cabang lama tidak lagi lenyap seketika: sebuah bayangan salinannya memudar keluar ke arah berlawanan sambil cabang baru meluncur masuk, sehingga tercipta kesan silang yang halus.')
console.log('2. Animasi masuk memakai kurva cubic-bezier 0.22 1 0.36 0.36 versi lebih lembut dengan durasi 0.32 detik, gerakan cepat di awal lalu melambat mulus di akhir.')
console.log('3. Tombol sortir, tombol reset, dan kontrol lain yang ikut bergeser kini berpindah lewat teknik FLIP: posisi lama dicatat, lalu elemen dianimasikan lewat transform dari posisi lama ke posisi baru.')
console.log('4. Semua gerakan hanya memakai transform dan opacity lewat Web Animations API, jadi dikerjakan kompositor GPU tanpa menghitung ulang layout tiap frame.')
console.log('5. Pengguna dengan pengaturan reduce motion otomatis dilewati dari seluruh efek ini.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman Logbook publik lalu klik Rentang Waktu: kolom tanggal lama memudar ke kiri sambil dua kolom baru meluncur dari kanan.')
console.log('2. Perhatikan tombol sortir dan elemen di sebelahnya: mereka bergeser mulus mengikuti perubahan lebar, tidak lagi melompat.')
console.log('3. Klik Bulan kembali: arah animasi berbalik dengan kelembutan yang sama.')
console.log('4. Bolak balik cepat: bayangan cabang selalu bersih tanpa sisa elemen menumpuk di layar.')
console.log('5. Ulangi di dashboard: perilaku identik karena memakai komponen TimeFilter yang sama.')