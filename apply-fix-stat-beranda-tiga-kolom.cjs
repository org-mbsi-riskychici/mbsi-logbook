const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }
function gantiBlok(isi, penandaMulai, penandaAkhir, blokBaru) {
  const a = isi.indexOf(penandaMulai)
  const b = isi.indexOf(penandaAkhir)
  if (a === -1 || b === -1 || b < a) return null
  return isi.slice(0, a) + blokBaru + isi.slice(b)
}

console.log('Mulai menyusun statistik beranda menjadi 3 kolom proporsional di mobile...')
console.log('')

/* ===== 1. ui.jsx: StatCard mendukung mode rapat dan label pendek mobile ===== */
const FILE_U = 'src/components/ui.jsx'
const STATCARD_BARU = `export function StatCard(props) {
  const rapat = props.rapat
  const clsWadah = rapat ? ' p-3 sm:p-6' : ' p-4 sm:p-6'
  const clsLabel = (rapat ? 'text-[11px] leading-snug sm:text-sm' : 'text-xs sm:text-sm') + ' text-slate-500'
  const clsLabelRapat = 'text-[11px] leading-snug font-semibold text-slate-500 sm:hidden'
  const clsValue = (rapat ? 'mt-1 text-xl sm:text-3xl' : 'mt-2 text-2xl sm:text-3xl') + ' font-black text-bsi-900'
  const clsSub = (rapat ? 'hidden sm:block ' : '') + 'mt-1 text-[11px] leading-snug sm:text-xs text-slate-500'
  return (
    <div className={cardCls + clsWadah}>
      {props.labelRapat ? <p className={clsLabelRapat}>{props.labelRapat}</p> : null}
      <p className={clsLabel + (props.labelRapat ? ' hidden sm:block' : '')}>{props.label}</p>
      <p className={clsValue}>{props.value}</p>
      {props.sub ? <p className={clsSub}>{props.sub}</p> : null}
    </div>
  )
}
`
if (!ada(FILE_U)) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}
let u = baca(FILE_U)
if (u.indexOf('const rapat = props.rapat') !== -1) {
  console.log('[SUDAH ADA] StatCard mode rapat di ui.jsx')
} else {
  const hasil = gantiBlok(u, 'export function StatCard(props) {', 'export function EmptyState(props) {', STATCARD_BARU)
  if (hasil) {
    u = hasil
    simpan(FILE_U, u)
    console.log('[BERHASIL] StatCard diganti dengan versi mendukung prop rapat dan labelRapat')
  } else {
    console.log('[TIDAK KETEMU] Blok StatCard di ui.jsx')
  }
}

/* ===== 2. HomePage.jsx: grid statistik 3 kolom di mobile plus prop rapat ===== */
const FILE_H = 'src/pages/HomePage.jsx'
const GANTI_H = [
  ['<div className="grid gap-4">', '<div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-1 lg:gap-4">'],
  ['<StatCard key="mahasiswa" label="Total mahasiswa magang" value={stats.mahasiswa} sub="Mahasiswa terdaftar dalam tim" />',
   '<StatCard key="mahasiswa" label="Total mahasiswa magang" labelRapat="Mahasiswa" value={stats.mahasiswa} sub="Mahasiswa terdaftar dalam tim" rapat />'],
  ['<StatCard key="logbook" label="Total logbook publik" value={stats.logbook} sub="Catatan kegiatan harian" />',
   '<StatCard key="logbook" label="Total logbook publik" labelRapat="Logbook" value={stats.logbook} sub="Catatan kegiatan harian" rapat />'],
  ['<StatCard key="galeri" label="Total media galeri" value={stats.galeri} sub="Foto dan video dokumentasi" />',
   '<StatCard key="galeri" label="Total media galeri" labelRapat="Media" value={stats.galeri} sub="Foto dan video dokumentasi" rapat />']
]
if (!ada(FILE_H)) {
  console.log('[GAGAL] HomePage.jsx tidak ditemukan')
} else {
  let h = baca(FILE_H)
  let berubahH = false
  for (let i = 0; i < GANTI_H.length; i++) {
    const lama = GANTI_H[i][0]
    const baru = GANTI_H[i][1]
    if (h.indexOf(baru) !== -1) {
      console.log('[SUDAH ADA] ' + baru.slice(0, 48) + '...')
      continue
    }
    if (h.indexOf(lama) === -1) {
      console.log('[TIDAK KETEMU] Pola: ' + lama.slice(0, 48) + '...')
      continue
    }
    h = h.split(lama).join(baru)
    berubahH = true
    console.log('[BERHASIL] ' + baru.slice(0, 48) + '...')
  }
  if (berubahH) simpan(FILE_H, h)
}

/* ===== 3. Skeleton.jsx: SkeletonStatCard mengikuti padding dan lebar bar baru ===== */
const FILE_S = 'src/components/Skeleton.jsx'
const SKELETON_BARU = `export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-3 sm:p-6">
      <div className="skeleton h-3 w-3/4 sm:h-4 sm:w-28"></div>
      <div className="skeleton h-6 w-1/2 mt-1 sm:h-9 sm:w-16 sm:mt-3"></div>
      <div className="skeleton h-3 w-36 mt-2 hidden sm:block"></div>
    </div>
  )
}
`
if (!ada(FILE_S)) {
  console.log('[GAGAL] Skeleton.jsx tidak ditemukan')
} else {
  let s = baca(FILE_S)
  if (s.indexOf('shadow-sm p-3 sm:p-6') !== -1) {
    console.log('[SUDAH ADA] SkeletonStatCard versi rapat')
  } else {
    const hasil = gantiBlok(s, 'export function SkeletonStatCard() {', 'export function SkeletonChartRow() {', SKELETON_BARU)
    if (hasil) {
      simpan(FILE_S, hasil)
      console.log('[BERHASIL] SkeletonStatCard disesuaikan dengan kartu 3 kolom')
    } else {
      console.log('[TIDAK KETEMU] Blok SkeletonStatCard di Skeleton.jsx')
    }
  }
}

/* ===== 4. Verifikasi ===== */
console.log('')
console.log('Verifikasi:')
const u2 = ada(FILE_U) ? baca(FILE_U) : ''
const h2 = ada(FILE_H) ? baca(FILE_H) : ''
const s2 = ada(FILE_S) ? baca(FILE_S) : ''
console.log((u2.indexOf('const rapat = props.rapat') !== -1 ? '[OK] ' : '[BELUM] ') + 'StatCard mendukung prop rapat')
console.log((u2.indexOf('props.labelRapat') !== -1 ? '[OK] ' : '[BELUM] ') + 'StatCard mendukung label pendek mobile')
console.log((u2.indexOf("rapat ? 'hidden sm:block '") !== -1 ? '[OK] ' : '[BELUM] ') + 'Keterangan kartu rapat disembunyikan di mobile')
console.log((h2.indexOf('grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-1 lg:gap-4') !== -1 ? '[OK] ' : '[BELUM] ') + 'Grid statistik beranda 3 kolom di mobile')
console.log((h2.split('rapat />').length - 1 === 3 ? '[OK] ' : '[BELUM] ') + 'Tiga StatCard beranda memakai mode rapat (' + (h2.split('rapat />').length - 1) + ' lokasi)')
console.log((h2.indexOf('labelRapat="Mahasiswa"') !== -1 && h2.indexOf('labelRapat="Logbook"') !== -1 && h2.indexOf('labelRapat="Media"') !== -1 ? '[OK] ' : '[BELUM] ') + 'Label pendek Mahasiswa, Logbook, Media terpasang')
console.log((s2.indexOf('shadow-sm p-3 sm:p-6') !== -1 ? '[OK] ' : '[BELUM] ') + 'SkeletonStatCard mengikuti padding baru')

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Penyesuaian yang diterapkan:')
console.log('1. Pembungkus tiga statistik di beranda kini memakai grid-cols-3 sejak lebar terkecil dengan gap 8px, jadi Total mahasiswa, Total logbook, dan Total media tampil sejajar satu baris seperti permintaanmu, bukan tiga kartu bongsor bertumpuk. Di 640px gap melonggar menjadi 12px, dan di 1024px kembali menjadi satu kolom vertikal di samping hero persis seperti tata letak desktop sebelumnya.')
console.log('2. StatCard mendapat prop rapat yang dipakai khusus statistik beranda: padding mobile 12px, label 11px dengan baris rapat, angka 20px, dan jarak atas angka dipangkas, sehingga kartu sepertiga lebar layar tetap pendek dan sejajar rapi.')
console.log('3. Prop labelRapat memberi label satu kata di mobile yaitu Mahasiswa, Logbook, dan Media. Label penuh seperti Total mahasiswa magang baru muncul di 640px ke atas, jadi di ponsel tidak ada label yang melipat menjadi tiga baris di dalam kartu sempit.')
console.log('4. Baris keterangan sub disembunyikan di bawah 640px hanya untuk kartu rapat karena isinya pengulangan dari label, lalu muncul kembali di tablet ke atas. StatCard tanpa prop rapat milik halaman Daftar Hadir tidak berubah perilaku sehingga susunan 2x2 hasil perbaikan sebelumnya tetap utuh lengkap dengan keterangannya.')
console.log('5. SkeletonStatCard mengikuti padding 12px dan lebar bar berbasis persentase di mobile, plus bar keterangan disembunyikan, sehingga tampilan memuat sama persis tingginya dengan kartu akhir dan tidak ada lompatan tata letak.')
console.log('6. Seluruh ukuran memakai varian sm: sehingga di 640px ke atas kartu kembali ke padding 24px, label 14px, angka 30px, dan keterangan 12px, identik dengan tampilan desktop saat ini.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka beranda di ponsel: tiga kartu statistik berjajar tiga kolom di bawah hero, masing masing menampilkan label satu kata dan angka besar yang seimbang, tinggi kartu hanya sekitar sepertiga sebelumnya.')
console.log('2. Gulir saat data masih memuat: tiga skeleton kartu tampil tiga kolom dengan bar yang tidak melebar keluar kartu.')
console.log('3. Lebarkan ke 640px: label panjang dan baris keterangan muncul kembali, jarak antar kartu melonggar, tetap tiga kolom karena area ini masih satu kolom penuh.')
console.log('4. Lebarkan ke 1024px: statistik kembali menumpuk vertikal di kolom kanan mendampingi kartu hero, persis seperti tampilan desktop sebelumnya.')
console.log('5. Buka Daftar Hadir di ponsel: empat kartu statistik tetap 2x2 dengan keterangan terlihat, tidak terpengaruh mode rapat.')
console.log('6. Aktifkan mode gelap: warna kartu dan teks menyesuaikan seperti biasa karena hanya kelas ukuran dan kolom yang berubah.')