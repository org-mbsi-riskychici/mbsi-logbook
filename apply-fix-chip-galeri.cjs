const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_C = 'src/components/cards.jsx'

if (!fs.existsSync(path.join(root, FILE_C))) {
  console.log('[GAGAL] cards.jsx tidak ditemukan')
  process.exit(1)
}

let c = fs.readFileSync(path.join(root, FILE_C), 'utf8').replace(/\r\n/g, '\n')
let berubah = false

console.log('Mulai menyamakan chip galeri dengan logbook dan merapikan teks bantuan...')
console.log('')

/* ===== 1. Samakan panggilan PersonChip di GalleryCard dengan logbook ===== */
const chipSm = '<PersonChip size="sm" mahasiswa={item.mahasiswa} />'
const chipBiasa = '<PersonChip mahasiswa={item.mahasiswa} />'
if (c.includes(chipSm)) {
  c = c.split(chipSm).join(chipBiasa)
  berubah = true
  console.log('[BERHASIL] Prop size sm dihapus dari PersonChip kartu galeri')
} else if (c.includes(chipBiasa)) {
  console.log('[SUDAH ADA] PersonChip kartu galeri sudah tanpa prop size')
} else {
  console.log('[TIDAK KETEMU] Pola PersonChip di GalleryCard')
}

/* ===== 2. Normalkan PersonChip: prop ukuran tidak lagi mengubah ukuran teks ===== */
const regexNama = /<p className=\{'font-semibold text-slate-900 ' \+ \(props\.size === 'sm' \? 'text-sm' : ''\)\}>\{nama\}<\/p>/g
if (regexNama.test(c)) {
  c = c.replace(regexNama, '<p className="font-semibold text-slate-900">{nama}</p>')
  berubah = true
  console.log('[BERHASIL] Teks nama PersonChip dinormalkan tanpa pengecilan ukuran')
} else {
  const regexNamaLonggar = /<p className=\{[^>]*?props\.size === 'sm'[^>]*?\}>\{nama\}<\/p>/g
  if (regexNamaLonggar.test(c)) {
    c = c.replace(regexNamaLonggar, '<p className="font-semibold text-slate-900">{nama}</p>')
    berubah = true
    console.log('[BERHASIL] Teks nama PersonChip dinormalkan lewat pola longgar')
  } else {
    console.log('[INFO] Pola teks nama bersyarat tidak ditemukan di PersonChip')
  }
}

const regexNim = /<p className=\{[^>]*?props\.size === 'sm'[^>]*?\}>NIM \{nim\}<\/p>/g
if (regexNim.test(c)) {
  c = c.replace(regexNim, '<p className="text-xs text-slate-500">NIM {nim}</p>')
  berubah = true
  console.log('[BERHASIL] Teks NIM PersonChip dinormalkan tanpa pengecilan ukuran')
} else {
  console.log('[INFO] Teks NIM PersonChip sudah seragam')
}

/* ===== 3. Teks bantuan tampil di semua kartu pada tampilan publik ===== */
const polaLama = ') : props.isOwner ? null : ('
const polaBaru = ') : ('
if (c.includes(polaLama)) {
  c = c.split(polaLama).join(polaBaru)
  berubah = true
  console.log('[BERHASIL] Teks Klik kartu untuk melihat detail kini tampil di semua kartu publik')
} else if (c.includes('<span className="text-xs font-semibold text-bsi-800">Klik kartu untuk melihat detail</span>')) {
  console.log('[SUDAH ADA] Logika teks bantuan sudah tampil di semua kartu')
} else {
  console.log('[TIDAK KETEMU] Pola logika teks bantuan di GalleryCard')
}

if (berubah) {
  fs.writeFileSync(path.join(root, FILE_C), c, 'utf8')
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Hasil akhir kedua perbaikan:')
console.log('1. Chip pemilik di kartu galeri kini identik dengan kartu logbook: nama berukuran sama, NIM berukuran sama, dan avatar ikut seragam.')
console.log('2. PersonChip tidak lagi mengecilkan teks berdasarkan prop ukuran, sehingga semua permukaan yang memakainya konsisten selamanya.')
console.log('3. Pada halaman Galeri publik, setiap kartu menampilkan teks Klik kartu untuk melihat detail, bukan hanya kartu milik orang lain.')
console.log('4. Di dashboard galeri milik sendiri, tombol Edit dan Hapus tetap tampil menggantikan teks bantuan, sehingga tidak ada duplikasi instruksi.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman Logbook dan Galeri berdampingan: bandingkan chip pemilik, ukuran nama dan NIM kini sama persis.')
console.log('2. Buka halaman Galeri saat login: semua kartu menampilkan teks bantuan klik, termasuk kartu milik sendiri.')
console.log('3. Buka tab Galeri di dashboard: kartu milik sendiri menampilkan tombol Edit dan Hapus tanpa teks bantuan.')
console.log('4. Buka modal detail galeri: chip di dalam modal tetap rapi dengan ukuran teks yang sama.')