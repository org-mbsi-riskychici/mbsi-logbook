const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai membuat popup detail bisa digulir di dalam panelnya...')
console.log('')

/* ===== 1. ui.jsx: panel Modal diberi tinggi maksimal dan gulir internal ===== */
const FILE_U = 'src/components/ui.jsx'
if (!fs.existsSync(path.join(root, FILE_U))) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}
let u = baca(FILE_U)
const idx = u.indexOf('function Modal(')
if (idx === -1) {
  console.log('[TIDAK KETEMU] Fungsi Modal di ui.jsx')
} else {
  const idxOpen = u.indexOf('{', idx)
  let brace = 0, akhir = -1, inStr = false, strCh = ''
  for (let i = idxOpen; i < u.length; i++) {
    const ch = u[i]
    const prev = i > 0 ? u[i - 1] : ''
    if (inStr) { if (ch === strCh && prev !== '\\') inStr = false; continue }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue }
    if (ch === '{') brace++
    if (ch === '}') { brace--; if (brace === 0) { akhir = i + 1; break } }
  }
  if (akhir === -1) {
    console.log('[GAGAL] Batas fungsi Modal tidak terbaca')
  } else {
    let span = u.slice(idx, akhir)
    if (span.includes('max-h-[88vh]')) {
      console.log('[SUDAH ADA] Panel Modal sudah punya gulir internal')
    } else {
      const baru = span.replace(/className="anim-modal ([^"]*)"/, function (m, cls) {
        return 'className="anim-modal ' + cls + ' max-h-[88vh] overflow-y-auto overscroll-contain"'
      })
      if (baru === span) {
        console.log('[TIDAK KETEMU] Kelas panel anim-modal di dalam Modal')
      } else {
        u = u.slice(0, idx) + baru + u.slice(akhir)
        simpan(FILE_U, u)
        console.log('[BERHASIL] Panel Modal kini maksimal 88 persen layar dan menggulir di dalam')
      }
    }
  }
}

/* ===== 2. index.css: header popup menempel saat isi digulir ===== */
const FILE_CSS = 'src/index.css'
const CSS_STICKY = `/* header-detail-sticky: judul dan tombol tutup popup detail tetap terlihat saat isi digulir di dalam panel */
.anim-modal > div:first-child {
  position: sticky;
  top: 0;
  z-index: 5;
  background: inherit;
}
`
if (!fs.existsSync(path.join(root, FILE_CSS))) {
  console.log('[LEWATI] index.css tidak ditemukan')
} else {
  let css = baca(FILE_CSS)
  if (css.includes('header-detail-sticky')) {
    console.log('[SUDAH ADA] CSS header sticky di index.css')
  } else {
    simpan(FILE_CSS, css.trimEnd() + '\n\n' + CSS_STICKY)
    console.log('[BERHASIL] CSS header sticky ditambahkan di index.css')
  }
}

/* ===== 3. Verifikasi ===== */
u = baca(FILE_U)
const css2 = baca(FILE_CSS)
console.log('')
console.log('Verifikasi:')
console.log((u.includes('max-h-[88vh] overflow-y-auto overscroll-contain') ? '[OK] ' : '[BELUM] ') + 'Panel Modal punya tinggi maksimal dan gulir internal')
console.log((css2.includes('header-detail-sticky') ? '[OK] ' : '[BELUM] ') + 'CSS header sticky terpasang')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perilaku baru:')
console.log('1. Panel popup detail dibatasi maksimal 88 persen tinggi layar, jadi tidak pernah menjebol keluar viewport.')
console.log('2. Bila isi detail panjang, yang menggulir adalah bagian dalam panelnya, bukan latar belakang halaman.')
console.log('3. Guliran tidak merembet ke halaman di belakangnya karena overscroll-contain, dan kunci scroll body sudah ada sebelumnya.')
console.log('4. Baris judul Detail beserta tombol X menempel di atas panel saat isi digulir, jadi tombol tutup selalu terjangkau.')
console.log('5. Warna latar header mengikuti warna panel secara otomatis, termasuk saat mode gelap, sehingga isi yang lewat di bawahnya tidak tembus.')
console.log('6. Modal konfirmasi dan dropdown filter tidak terpengaruh karena keduanya tidak punya wadah gulir.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka detail logbook yang punya banyak kegiatan sehingga isinya panjang.')
console.log('2. Gulir di dalam popup: isi bergerak, panel tetap di tengah layar, halaman belakang diam.')
console.log('3. Perhatikan header Detail dan tombol X tetap berada di tempatnya selama menggulir.')
console.log('4. Gulir sampai mentok bawah: guliran tidak lolos ke halaman di belakangnya.')
console.log('5. Tutup popup: animasi keluar tetap bermain mulus seperti sebelumnya.')
console.log('6. Ulangi pada mode gelap: header tetap solid tanpa isi yang tembus di belakangnya.')