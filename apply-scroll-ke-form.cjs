const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_D = 'src/pages/DashboardPage.jsx'
if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
  process.exit(1)
}
let d = fs.readFileSync(path.join(root, FILE_D), 'utf8').replace(/\r\n/g, '\n')

console.log('Mulai mengarahkan scroll tombol Edit ke kartu form, bukan ke puncak halaman...')
console.log('')

/* ===== 1. Tambahkan tiga ref untuk kartu form ===== */
if (d.includes('const refFormLog = useRef(null)')) {
  console.log('[SUDAH ADA] Ref kartu form di DashboardPage')
} else if (d.includes('const refListLog = useRef(null)')) {
  d = d.replace('const refListLog = useRef(null)',
    'const refListLog = useRef(null)\nconst refFormLog = useRef(null)\nconst refFormGal = useRef(null)\nconst refFormHadir = useRef(null)')
  console.log('[BERHASIL] Ref kartu form ditambahkan')
} else if (d.includes('const toast = useToast()')) {
  d = d.replace('const toast = useToast()',
    'const toast = useToast()\nconst refFormLog = useRef(null)\nconst refFormGal = useRef(null)\nconst refFormHadir = useRef(null)')
  console.log('[BERHASIL] Ref kartu form ditambahkan lewat anchor toast')
} else {
  console.log('[TIDAK KETEMU] Anchor untuk menyisipkan ref kartu form')
}

/* ===== 2. Tambahkan fungsi bantu gulirKeForm ===== */
const HELPER = `function gulirKeForm(ref) {
requestAnimationFrame(function () {
if (ref && ref.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
})
}
`
if (d.includes('function gulirKeForm(')) {
  console.log('[SUDAH ADA] Fungsi bantu gulirKeForm')
} else if (d.includes('function startEditLog(')) {
  d = d.replace('function startEditLog(', HELPER + 'function startEditLog(')
  console.log('[BERHASIL] Fungsi bantu gulirKeForm ditambahkan')
} else {
  console.log('[TIDAK KETEMU] Anchor fungsi startEditLog')
}

/* ===== 3. Ganti window.scrollTo di dalam tiap startEdit ===== */
const TARGET = "window.scrollTo({ top: 0, behavior: 'smooth' })"
function gantiScrollDalam(namaFn, pengganti) {
  const idx = d.indexOf('function ' + namaFn + '(')
  if (idx === -1) { console.log('[TIDAK KETEMU] Fungsi ' + namaFn); return }
  const nextFn = d.indexOf('\nfunction ', idx + 5)
  const batas = nextFn === -1 ? d.length : nextFn
  const seg = d.slice(idx, batas)
  if (seg.includes(pengganti)) { console.log('[SUDAH ADA] Scroll ke form di ' + namaFn); return }
  if (!seg.includes(TARGET)) { console.log('[TIDAK KETEMU] window.scrollTo di ' + namaFn); return }
  d = d.slice(0, idx) + seg.replace(TARGET, pengganti) + d.slice(batas)
  console.log('[BERHASIL] Scroll ' + namaFn + ' diarahkan ke kartu form')
}
gantiScrollDalam('startEditLog', 'gulirKeForm(refFormLog)')
gantiScrollDalam('startEditGal', 'gulirKeForm(refFormGal)')
gantiScrollDalam('startEditHadir', 'gulirKeForm(refFormHadir)')

/* ===== 4. Pasang ref dan scroll margin pada ketiga kartu form ===== */
const pasangan = [
  ['editLogId', 'refFormLog'],
  ['editGalId', 'refFormGal'],
  ['editHadirId', 'refFormHadir']
]
pasangan.forEach(function (p) {
  const re = new RegExp("<div className=\\{'card-hover bg-white rounded-\\[2rem\\] border shadow-sm p-8 min-w-0 ' \\+ \\(" + p[0])
  if (d.includes('ref={' + p[1] + '}')) {
    console.log('[SUDAH ADA] Ref terpasang di kartu form ' + p[0])
  } else if (re.test(d)) {
    d = d.replace(re, "<div ref={" + p[1] + "} className={'card-hover scroll-mt-24 bg-white rounded-[2rem] border shadow-sm p-8 min-w-0 ' + (" + p[0])
    console.log('[BERHASIL] Ref dan scroll margin terpasang di kartu form ' + p[0])
  } else {
    console.log('[TIDAK KETEMU] Pola kartu form ' + p[0])
  }
})

fs.writeFileSync(path.join(root, FILE_D), d, 'utf8')

/* ===== 5. Verifikasi ===== */
d = fs.readFileSync(path.join(root, FILE_D), 'utf8')
console.log('')
console.log('Verifikasi:')
console.log((d.includes('const refFormLog = useRef(null)') ? '[OK] ' : '[BELUM] ') + 'Ref kartu form tersedia')
console.log((d.includes('function gulirKeForm(') ? '[OK] ' : '[BELUM] ') + 'Fungsi bantu gulirKeForm tersedia')
console.log((d.includes('gulirKeForm(refFormLog)') ? '[OK] ' : '[BELUM] ') + 'Edit logbook menggulir ke form')
console.log((d.includes('gulirKeForm(refFormGal)') ? '[OK] ' : '[BELUM] ') + 'Edit galeri menggulir ke form')
console.log((d.includes('gulirKeForm(refFormHadir)') ? '[OK] ' : '[BELUM] ') + 'Edit daftar hadir menggulir ke form')
console.log((d.includes('scroll-mt-24 bg-white rounded-[2rem]') ? '[OK] ' : '[BELUM] ') + 'Scroll margin agar form berhenti di bawah header')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perilaku baru:')
console.log('1. Klik Edit pada kartu logbook, galeri, atau daftar hadir: layar menggulir mulus hanya sampai kartu form edit, bukan ke puncak halaman.')
console.log('2. Kartu form berhenti tepat di bawah header sticky berkat scroll margin 96 piksel, jadi judul form dan badge Mode Edit langsung terlihat seperti lampiranmu.')
console.log('3. Pengguliran dijalankan satu frame setelah state edit aktif, sehingga posisi form sudah final sebelum scroll dimulai dan tidak meleset.')
console.log('4. Tombol Batal Edit dan alur simpan tidak disentuh sama sekali, jadi perilaku lainnya tetap identik.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard, gulir daftar logbook sampai bawah, lalu klik Edit pada kartu mana pun.')
console.log('2. Perhatikan layar berhenti dengan kartu form Ubah logbook harian terlihat penuh di area pandang, bukan layar paling atas.')
console.log('3. Ulangi pada tab Galeri dan Daftar Hadir: perilaku sama pada form masing masing.')
console.log('4. Klik Batal Edit lalu Edit lagi: scroll tetap konsisten berhenti di posisi form.')