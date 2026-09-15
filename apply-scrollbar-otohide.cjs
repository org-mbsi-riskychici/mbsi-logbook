const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang scrollbar auto hide tanpa geser layout...')
console.log('')

/* ===== 1. index.css: matikan scrollbar bawaan dan gayakan indikator overlay ===== */
const FILE_CSS = 'src/index.css'
const CSS_BLOK = `/* scrollbar-otohide: scrollbar bawaan dinolkan lebarnya, indikator overlay muncul hanya saat menggulir */
* {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}
*::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
}
#scroll-indicator {
  position: fixed;
  right: 3px;
  top: 0;
  width: 8px;
  z-index: 95;
  border-radius: 9999px;
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}
#scroll-indicator.aktif { opacity: 1; }
#scroll-thumb {
  width: 6px;
  margin-left: 1px;
  border-radius: 9999px;
  background: rgba(100, 116, 139, 0.55);
}
.dark #scroll-thumb { background: rgba(148, 163, 184, 0.55); }
`
if (!fs.existsSync(path.join(root, FILE_CSS))) {
  console.log('[LEWATI] index.css tidak ditemukan')
} else {
  let css = baca(FILE_CSS)
  if (css.includes('scrollbar-otohide')) {
    console.log('[SUDAH ADA] CSS scrollbar auto hide di index.css')
  } else {
    simpan(FILE_CSS, css.trimEnd() + '\n\n' + CSS_BLOK)
    console.log('[BERHASIL] CSS scrollbar auto hide ditambahkan di index.css')
  }
}

/* ===== 2. main.jsx: logika indikator scrollbar yang mengikuti wadah gulir mana pun ===== */
const FILE_M = 'src/main.jsx'
const JS_BLOK = `
/* ===== Indikator scrollbar auto hide, overlay tanpa menggeser layout ===== */
;(function () {
  if (typeof document === 'undefined') return
  function pasang() {
    if (document.getElementById('scroll-indicator')) return
    const track = document.createElement('div')
    track.id = 'scroll-indicator'
    const thumb = document.createElement('div')
    thumb.id = 'scroll-thumb'
    track.appendChild(thumb)
    document.body.appendChild(track)
    let timer = null
    function sembunyikan() { track.classList.remove('aktif') }
    function tampilkan() {
      track.classList.add('aktif')
      if (timer) clearTimeout(timer)
      timer = setTimeout(sembunyikan, 900)
    }
    function ukur(el, adalahWindow, rect) {
      const scrollTop = adalahWindow ? (window.scrollY || document.documentElement.scrollTop) : el.scrollTop
      const scrollHeight = adalahWindow ? document.documentElement.scrollHeight : el.scrollHeight
      const clientHeight = adalahWindow ? window.innerHeight : el.clientHeight
      const selisih = scrollHeight - clientHeight
      if (selisih <= 4) { sembunyikan(); return }
      const ratio = clientHeight / scrollHeight
      const trackTinggi = rect.height - 8
      const thumbTinggi = Math.max(36, trackTinggi * ratio)
      const maxTop = trackTinggi - thumbTinggi
      let gerak = scrollTop / selisih
      if (gerak < 0) gerak = 0
      if (gerak > 1) gerak = 1
      thumb.style.height = thumbTinggi + 'px'
      thumb.style.transform = 'translateY(' + (4 + gerak * maxTop) + 'px)'
      track.style.top = rect.top + 'px'
      track.style.height = rect.height + 'px'
      track.style.right = (window.innerWidth - rect.right + 3) + 'px'
    }
    function onScroll(e) {
      const t = e.target
      if (t === document || t === document.documentElement || t === window || !t || t.nodeType !== 1) {
        ukur(null, true, { top: 0, height: window.innerHeight, right: window.innerWidth })
      } else {
        const r = t.getBoundingClientRect()
        ukur(t, false, { top: r.top, height: r.height, right: r.right })
      }
      tampilkan()
    }
    window.addEventListener('scroll', onScroll, true)
    document.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', sembunyikan)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pasang)
  else pasang()
})()
`
if (!fs.existsSync(path.join(root, FILE_M))) {
  console.log('[LEWATI] main.jsx tidak ditemukan')
} else {
  let m = baca(FILE_M)
  if (m.includes('scroll-indicator')) {
    console.log('[SUDAH ADA] Logika indikator scrollbar di main.jsx')
  } else {
    simpan(FILE_M, m.trimEnd() + '\n' + JS_BLOK)
    console.log('[BERHASIL] Logika indikator scrollbar ditambahkan di main.jsx')
  }
}

/* ===== 3. Verifikasi ===== */
const css2 = baca(FILE_CSS)
const m2 = fs.existsSync(path.join(root, FILE_M)) ? baca(FILE_M) : ''
console.log('')
console.log('Verifikasi:')
console.log((css2.includes('scrollbar-width: none !important') ? '[OK] ' : '[BELUM] ') + 'Scrollbar bawaan dinolkan lebarnya')
console.log((css2.includes('#scroll-indicator') ? '[OK] ' : '[BELUM] ') + 'Gaya indikator overlay tersedia')
console.log((m2.includes('scroll-indicator') ? '[OK] ' : '[BELUM] ') + 'Logika auto hide terpasang di main.jsx')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Cara kerja fitur baru:')
console.log('1. Scrollbar bawaan browser dilebarkan nol di semua elemen, jadi tidak pernah memakan tempat dan tidak ada lagi pergeseran konten saat muncul atau hilang.')
console.log('2. Indikator tipis milik kita digambar sebagai elemen fixed di tepi kanan, murni overlay, sehingga layout tidak mungkin bergeser.')
console.log('3. Indikator muncul saat ada aktivitas gulir apa pun dan memudar sendiri sekitar 0.9 detik setelah user berhenti menggulir.')
console.log('4. Indikator pintar mengikuti wadah yang digulir: gulir halaman maka ia di tepi layar, gulir isi popup detail maka ia menempel di tepi kanan panel popup.')
console.log('5. Panjang dan posisi thumb dihitung dari rasio scroll, jadi terasa seperti scrollbar asli namun versi minimalis.')
console.log('6. Mode gelap memakai warna thumb lebih terang supaya tetap terlihat di latar gelap.')
console.log('7. Efek samping bonus: membuka atau menutup modal tidak lagi membuat halaman melompat karena lebar scrollbar tidak pernah berubah.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman Logbook dalam keadaan diam: tidak ada scrollbar sama sekali di tepi kanan.')
console.log('2. Gulir ke bawah: thumb tipis muncul, lalu memudar sendiri setelah berhenti sekitar satu detik.')
console.log('3. Perhatikan kartu dan header: tidak bergeser satu piksel pun saat thumb muncul atau hilang.')
console.log('4. Buka popup detail berisi panjang lalu gulir isinya: thumb muncul menempel di tepi kanan panel popup, bukan di tepi layar.')
console.log('5. Buka dan tutup modal berulang kali: lebar konten tetap stabil tanpa lompatan.')