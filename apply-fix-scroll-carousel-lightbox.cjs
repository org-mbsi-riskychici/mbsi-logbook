const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai mempercepat hilangnya scrollbar, memperbaiki panah carousel, dan menambah animasi keluar masuk lightbox...')
console.log('')

/* ===== 1. main.jsx: timer auto hide scrollbar dipangkas ===== */
const FILE_M = 'src/main.jsx'
if (!ada(FILE_M)) {
  console.log('[GAGAL] main.jsx tidak ditemukan')
  process.exit(1)
}
let m = baca(FILE_M)
if (m.includes('setTimeout(sembunyikan, 400)')) {
  console.log('[SUDAH ADA] Timer auto hide scrollbar 400ms')
} else if (m.includes('setTimeout(sembunyikan, 900)')) {
  m = m.replace('setTimeout(sembunyikan, 900)', 'setTimeout(sembunyikan, 400)')
  simpan(FILE_M, m)
  console.log('[BERHASIL] Timer auto hide scrollbar dipangkas dari 900ms menjadi 400ms')
} else {
  console.log('[TIDAK KETEMU] Timer auto hide scrollbar di main.jsx')
}

/* ===== 2. index.css: fade keluar indikator lebih cepat plus animasi lightbox ===== */
const FILE_CSS = 'src/index.css'
if (!ada(FILE_CSS)) {
  console.log('[GAGAL] index.css tidak ditemukan')
  process.exit(1)
}
let css = baca(FILE_CSS)
let berubahC = false
const reFade = /opacity: 0;\n([ \t]*)transition: opacity 0\.25s ease;\n([ \t]*)pointer-events: none;/
if (css.includes('transition: opacity 0.18s ease;')) {
  console.log('[SUDAH ADA] Fade keluar indikator 0.18s')
} else if (reFade.test(css)) {
  css = css.replace(reFade, function (match, i1, i2) {
    return 'opacity: 0;\n' + i1 + 'transition: opacity 0.18s ease;\n' + i2 + 'pointer-events: none;'
  })
  berubahC = true
  console.log('[BERHASIL] Fade keluar indikator scrollbar dipercepat menjadi 0.18s')
} else {
  console.log('[TIDAK KETEMU] Blok transisi opacity indikator scrollbar')
}
const ATURAN_CAROUSEL_LAMA = '.media-carousel button:active { transform: translateY(-50%) scale(.97); }'
if (css.includes(ATURAN_CAROUSEL_LAMA)) {
  css = css.replace(ATURAN_CAROUSEL_LAMA, '.media-carousel button:active { transform: scale(.97); }')
  berubahC = true
  console.log('[BERHASIL] Aturan tekan tombol carousel tidak lagi membawa translateY')
} else {
  console.log('[INFO] Aturan tekan tombol carousel lama tidak ditemukan atau sudah bersih')
}
const CSS_LIGHTBOX = `/* lightbox-anim-v1: masuk keluar lightbox mulus, keluar memakai animasi mundur sebelum dilepas */
@keyframes lightboxIn {
  from { opacity: 0; transform: scale(0.96) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes lightboxOut {
  from { opacity: 1; transform: scale(1) translateY(0); }
  to { opacity: 0; transform: scale(0.96) translateY(8px); }
}
.lightbox-isi { animation: lightboxIn 0.28s cubic-bezier(0.16, 1, 0.3, 1); }
.lightbox-tutup { pointer-events: none; }
.lightbox-tutup.anim-overlay { animation: overlayFadeOut 0.2s ease-in forwards; }
.lightbox-tutup .lightbox-isi { animation: lightboxOut 0.2s ease-in forwards; }
`
if (css.includes('lightbox-anim-v1')) {
  console.log('[SUDAH ADA] CSS lightbox-anim-v1 di index.css')
} else {
  css = css.trimEnd() + '\n\n' + CSS_LIGHTBOX
  berubahC = true
  console.log('[BERHASIL] CSS animasi keluar masuk lightbox ditambahkan')
}
if (berubahC) simpan(FILE_CSS, css)

/* ===== 3. Carousel.jsx: panah ditengahkan lewat margin auto supaya tidak melorot saat ditekan ===== */
const FILE_R = 'src/components/Carousel.jsx'
if (!ada(FILE_R)) {
  console.log('[GAGAL] Carousel.jsx tidak ditemukan')
  process.exit(1)
}
let r = baca(FILE_R)
let berubahR = false
const PANAH_KIRI_LAMA = 'className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/40 text-white grid place-items-center opacity-100 xl:opacity-0 xl:group-hover:opacity-100 hover:bg-black/60"'
const PANAH_KIRI_BARU = 'className="absolute left-2 top-0 bottom-0 my-auto z-10 h-8 w-8 rounded-full bg-black/40 text-white grid place-items-center opacity-100 xl:opacity-0 xl:group-hover:opacity-100 hover:bg-black/60"'
const PANAH_KANAN_LAMA = 'className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/40 text-white grid place-items-center opacity-100 xl:opacity-0 xl:group-hover:opacity-100 hover:bg-black/60"'
const PANAH_KANAN_BARU = 'className="absolute right-2 top-0 bottom-0 my-auto z-10 h-8 w-8 rounded-full bg-black/40 text-white grid place-items-center opacity-100 xl:opacity-0 xl:group-hover:opacity-100 hover:bg-black/60"'
if (r.includes('top-0 bottom-0 my-auto z-10 h-8 w-8')) {
  console.log('[SUDAH ADA] Panah carousel memakai penengahan margin auto')
} else {
  if (r.includes(PANAH_KIRI_LAMA)) { r = r.replace(PANAH_KIRI_LAMA, PANAH_KIRI_BARU); berubahR = true; console.log('[BERHASIL] Panah kiri carousel tidak lagi bergantung pada transform') }
  else console.log('[TIDAK KETEMU] Pola panah kiri carousel')
  if (r.includes(PANAH_KANAN_LAMA)) { r = r.replace(PANAH_KANAN_LAMA, PANAH_KANAN_BARU); berubahR = true; console.log('[BERHASIL] Panah kanan carousel tidak lagi bergantung pada transform') }
  else console.log('[TIDAK KETEMU] Pola panah kanan carousel')
}
if (berubahR) simpan(FILE_R, r)

/* ===== 4. ui.jsx: Lightbox menahan diri 200ms saat ditutup supaya animasi keluar sempat main ===== */
const FILE_U = 'src/components/ui.jsx'
if (!ada(FILE_U)) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}
let u = baca(FILE_U)
const idxL = u.indexOf('export function Lightbox(props) {')
const idxZ = u.indexOf('export function ZoomableMedia(props) {')
if (idxL === -1 || idxZ === -1 || idxZ < idxL) {
  console.log('[TIDAK KETEMU] Blok Lightbox di ui.jsx')
} else {
  let seg = u.slice(idxL, idxZ)
  let berubahU = false
  if (seg.includes('function mintaTutup(')) {
    console.log('[SUDAH ADA] Pintu keluar mintaTutup di Lightbox')
  } else {
    const reBusy = /([ \t]*)const \[busyUnduh, setBusyUnduh\] = useState\(false\)\n/
    if (reBusy.test(seg)) {
      seg = seg.replace(reBusy, function (match, ind) {
        return match +
          ind + 'const [tutup, setTutup] = useState(false)\n' +
          ind + 'const sedangTutup = useRef(false)\n' +
          ind + 'function mintaTutup() {\n' +
          ind + '  if (sedangTutup.current) return\n' +
          ind + '  sedangTutup.current = true\n' +
          ind + '  setTutup(true)\n' +
          ind + '  setTimeout(function () { props.onClose() }, 200)\n' +
          ind + '}\n'
      })
      berubahU = true
      console.log('[BERHASIL] State tutup dan fungsi mintaTutup dipasang di Lightbox')
    } else {
      console.log('[TIDAK KETEMU] Anchor state busyUnduh di Lightbox')
    }
  }
  if (seg.includes("if (e.key === 'Escape') mintaTutup()")) {
    console.log('[SUDAH ADA] Tombol Esc memakai mintaTutup')
  } else if (seg.includes("if (e.key === 'Escape') props.onClose()")) {
    seg = seg.replace("if (e.key === 'Escape') props.onClose()", "if (e.key === 'Escape') mintaTutup()")
    berubahU = true
    console.log('[BERHASIL] Tombol Esc kini melewati pintu keluar beranimasi')
  } else {
    console.log('[TIDAK KETEMU] Pola handler Esc di Lightbox')
  }
  const ROOT_LAMA = '<div className="anim-overlay fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/95 p-4" onClick={props.onClose}>'
  const ROOT_BARU = "<div className={'anim-overlay fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/95 p-4' + (tutup ? ' lightbox-tutup' : '')} onClick={mintaTutup}>"
  if (seg.includes('lightbox-tutup')) {
    console.log('[SUDAH ADA] Kelas lightbox-tutup pada akar Lightbox')
  } else if (seg.includes(ROOT_LAMA)) {
    seg = seg.replace(ROOT_LAMA, ROOT_BARU)
    berubahU = true
    console.log('[BERHASIL] Akar Lightbox memakai kelas lightbox-tutup saat animasi keluar')
  } else {
    console.log('[TIDAK KETEMU] Pola akar Lightbox')
  }
  const ISI_LAMA = '<div className="relative w-full max-w-5xl" onClick={function (e) { e.stopPropagation() }}>'
  const ISI_BARU = '<div className="lightbox-isi relative w-full max-w-5xl" onClick={function (e) { e.stopPropagation() }}>'
  if (seg.includes('lightbox-isi relative w-full max-w-5xl')) {
    console.log('[SUDAH ADA] Kelas lightbox-isi pada wadah konten Lightbox')
  } else if (seg.includes(ISI_LAMA)) {
    seg = seg.replace(ISI_LAMA, ISI_BARU)
    berubahU = true
    console.log('[BERHASIL] Wadah konten Lightbox diberi kelas lightbox-isi untuk animasi masuk keluar')
  } else {
    console.log('[TIDAK KETEMU] Pola wadah konten Lightbox')
  }
  if (seg.includes('onClick={props.onClose}')) {
    seg = seg.split('onClick={props.onClose}').join('onClick={mintaTutup}')
    berubahU = true
    console.log('[BERHASIL] Sisa penutup langsung (klik backdrop dan tombol tutup) dialihkan ke mintaTutup')
  }
  u = u.slice(0, idxL) + seg + u.slice(idxZ)
  if (berubahU) simpan(FILE_U, u)
}

/* ===== 5. Verifikasi ===== */
console.log('')
console.log('Verifikasi:')
const m2 = baca(FILE_M)
const c2 = baca(FILE_CSS)
const r2 = baca(FILE_R)
const u2 = baca(FILE_U)
console.log((m2.includes('setTimeout(sembunyikan, 400)') ? '[OK] ' : '[BELUM] ') + 'Timer auto hide scrollbar 400ms')
console.log((c2.includes('transition: opacity 0.18s ease;') ? '[OK] ' : '[BELUM] ') + 'Fade keluar indikator scrollbar 0.18s')
console.log((r2.split('top-0 bottom-0 my-auto z-10 h-8 w-8').length - 1 === 2 ? '[OK] ' : '[BELUM] ') + 'Kedua panah carousel memakai penengahan margin auto')
console.log((!r2.includes('-translate-y-1/2 z-10 h-8 w-8') ? '[OK] ' : '[BELUM] ') + 'Panah carousel tidak lagi memakai transform untuk penengahan')
console.log((!c2.includes('.media-carousel button:active { transform: translateY(-50%) scale(.97); }') ? '[OK] ' : '[BELUM] ') + 'Aturan tekan tombol carousel bebas translateY')
console.log((c2.includes('lightbox-anim-v1') ? '[OK] ' : '[BELUM] ') + 'CSS animasi keluar masuk lightbox tersedia')
console.log((u2.includes('function mintaTutup(') ? '[OK] ' : '[BELUM] ') + 'Pintu keluar beranimasi terpasang di Lightbox')
console.log((u2.includes('lightbox-isi relative w-full max-w-5xl') ? '[OK] ' : '[BELUM] ') + 'Konten lightbox memakai kelas animasi')
console.log((u2.includes('<button onClick={props.onClose} className="h-9 w-9 rounded-full bg-slate-100') ? '[OK] ' : '[BELUM] ') + 'Modal biasa tidak ikut berubah')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Penyebab dan cara kerja perbaikan:')
console.log('1. Scrollbar: jeda auto hide dipangkas dari 900ms menjadi 400ms dan pudar opacity dari 0.25s menjadi 0.18s, jadi sekitar setengah detik setelah scroll berhenti garis langsung lenyap, sementara watchdog pelepasan sumber scroll tetap bekerja seperti sebelumnya.')
console.log('2. Panah carousel: efek tekan global button:active menimpa property transform yang dipakai kelas -translate-y-1/2, sehingga selama ditekan panah kehilangan penengahannya dan terlihat melorot lalu naik lagi. Kini penengahan memakai top-0 bottom-0 my-auto berbasis margin, jadi transform tekan hanya mengecilkan tombol di tempat tanpa menggeser posisi.')
console.log('3. Lightbox keluar: sebelumnya induk langsung melepas komponen saat onClose dipanggil sehingga tidak ada frame untuk animasi keluar. Kini semua jalur tutup (klik backdrop, tombol X, Esc, dan klik zoom out pada gambar) melewati mintaTutup yang memasang kelas lightbox-tutup, memainkan overlayFadeOut plus lightboxOut selama 200ms, baru memanggil onClose induk.')
console.log('4. Lightbox masuk: wadah konten diberi kelas lightbox-isi sehingga saat terbuka konten muncul dengan pop lembut scale 0.96 plus geser naik, berpadu dengan fade overlay yang sudah ada, jadi arah masuk dan keluar sama sama mulus.')
console.log('5. Selama animasi keluar, pointer events dimatikan lewat kelas lightbox-tutup supaya backdrop tidak bisa diklik dua kali dan tombol tidak terpicu saat sedang menghilang.')
console.log('6. Modal detail biasa tidak disentuh sama sekali karena seluruh perubahan Lightbox dibatasi hanya di dalam blok fungsi Lightbox.')
console.log('')
console.log('Langkah uji:')
console.log('1. Gulir halaman lalu diamkan: garis scrollbar kini hilang sekitar setengah detik setelah berhenti, lebih sigap dari sebelumnya.')
console.log('2. Buka kartu bermedia lebih dari satu, klik panah kiri dan kanan berulang: panah mengecil sesaat saat ditekan tetapi tetap berada di tempatnya, tidak lagi turun lalu naik.')
console.log('3. Klik tombol perbesar media: lightbox terbuka dengan pop lembut.')
console.log('4. Tutup lewat tombol X, klik backdrop, atau Esc: konten mengecil turun sambil layar memudar selama 0.2 detik, baru kemudian lightbox benar benar lepas.')
console.log('5. Buka tutup lightbox cepat cepat: animasi tidak menumpuk karena penjaga sedangTutup menahan permintaan tutup ganda.')