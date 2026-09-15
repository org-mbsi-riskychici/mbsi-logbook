const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_U = 'src/components/ui.jsx'
if (!fs.existsSync(path.join(root, FILE_U))) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}
let u = fs.readFileSync(path.join(root, FILE_U), 'utf8').replace(/\r\n/g, '\n')

console.log('Mulai menyimpan isi detail supaya tidak kosong saat animasi tutup...')
console.log('')

if (u.includes('isiSimpan')) {
  console.log('[SUDAH ADA] Penyangga isiSimpan di Modal')
} else {
  const idx = u.indexOf('export function Modal(')
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
      const SISIP = '\n  const isiSimpan = useRef(null)\n  if (props.open) isiSimpan.current = props.children'
      const ANCHOR1 = 'const [tutup, setTutup] = useState(false)'
      const ANCHOR2 = 'const [tampil, setTampil] = useState(props.open)'
      let ok = false
      if (span.includes(ANCHOR1)) {
        span = span.replace(ANCHOR1, ANCHOR1 + SISIP)
        ok = true
      } else if (span.includes(ANCHOR2)) {
        span = span.replace(ANCHOR2, ANCHOR2 + SISIP)
        ok = true
      }
      if (!ok) {
        console.log('[TIDAK KETEMU] Anchor state di kepala Modal')
      } else if (!span.includes('{props.children}')) {
        console.log('[TIDAK KETEMU] Penempatan {props.children} di dalam Modal')
      } else {
        span = span.split('{props.children}').join('{props.open ? props.children : isiSimpan.current}')
        u = u.slice(0, idx) + span + u.slice(akhir)
        fs.writeFileSync(path.join(root, FILE_U), u, 'utf8')
        console.log('[BERHASIL] Isi detail kini disimpan dan tetap tampil selama animasi tutup')
      }
    }
  }
}

u = fs.readFileSync(path.join(root, FILE_U), 'utf8')
console.log('')
console.log('Verifikasi:')
console.log((u.includes('const isiSimpan = useRef(null)') ? '[OK] ' : '[BELUM] ') + 'Ref penyangga isiSimpan ada di Modal')
console.log((u.includes('{props.open ? props.children : isiSimpan.current}') ? '[OK] ' : '[BELUM] ') + 'Render memakai isi simpanan saat menutup')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Penjelasan penyebab dan perbaikan:')
console.log('1. Saat tutup, halaman induk langsung mengosongkan state detail, sehingga props.children menjadi null di tengah animasi keluar.')
console.log('2. Modal kini menyalin isi terakhirnya ke ref isiSimpan setiap kali dalam keadaan terbuka.')
console.log('3. Selama fase menutup, panel merender isiSimpan.current, jadi kartu detail tetap utuh terlihat sambil mengecil dan memudar.')
console.log('4. Saat membuka kembali, render tetap memakai props.children asli sehingga data selalu segar dan tidak pernah basi.')
console.log('5. Perubahan terbatas di dalam fungsi Modal, jadi ConfirmModal, Lightbox, dan seluruh halaman tidak tersentuh.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman Logbook publik lalu klik Detail pada kartu mana pun.')
console.log('2. Klik tombol X: panel mengecil dan memudar sambil tetap menampilkan judul, kegiatan, dan isi logbook sampai benar benar hilang.')
console.log('3. Klik Detail kartu lain segera setelahnya: isi yang terbuka adalah data kartu yang baru diklik, bukan sisa kartu sebelumnya.')
console.log('4. Ulangi pada detail galeri dan daftar hadir: perilaku sama, isi tidak lagi kosong saat animasi tutup.')