#!/usr/bin/env node
/* patch-pengingat-lihat-semua-v1.cjs
   Pemakaian: node patch-pengingat-lihat-semua-v1.cjs   (jalankan dari root repo)
   Membatasi banner pengingat logbook: hanya 3 tanggal terlewat yang tampil
   pada awalnya, plus tombol "Lihat Semua" untuk menampilkan seluruhnya.
   Idempoten: dilewati bila fitur sudah terpasang. */
const fs = require('fs')
const path = require('path')
const rel = 'src/components/PengingatBanner.jsx'
const p = path.join(process.cwd(), rel)
if (!fs.existsSync(p)) {
  console.error('File tidak ditemukan: ' + rel)
  process.exit(1)
}
let src = fs.readFileSync(p, 'utf8')
const crlf = src.indexOf('\r\n') !== -1
if (crlf) src = src.split('\r\n').join('\n')

if (src.indexOf('lihatSemua') !== -1) {
  console.log('LEWATI ' + rel + ' (fitur Lihat Semua sudah ada)')
  process.exit(0)
}

const gagal = []
function ganti(pola, pengganti, label) {
  const hasil = src.replace(pola, pengganti)
  if (hasil === src) gagal.push(label)
  else src = hasil
}

/* 1. State lihatSemua + daftar tampil (maksimal 3 tanggal) */
ganti(
  'const [tutup, setTutup] = useState(false)\n  const terlewat = hitungTanggalTerlewat(props.tanggalLogbook, props.hadir)\n',
  'const [tutup, setTutup] = useState(false)\n  const [lihatSemua, setLihatSemua] = useState(false)\n  const terlewat = hitungTanggalTerlewat(props.tanggalLogbook, props.hadir)\n  const tampil = lihatSemua ? terlewat : terlewat.slice(0, 3)\n',
  'state lihatSemua & daftar tampil'
)

/* 2. Render daftar tampil, bukan seluruh terlewat */
ganti(
  '{terlewat.map(function (t) {',
  '{tampil.map(function (t) {',
  'render daftar tampil'
)

/* 3. Tombol Lihat Semua di bawah daftar */
ganti(
  '</ul>\n    </section>',
  '</ul>\n      {terlewat.length > 3 && !lihatSemua ? (\n        <button type="button" onClick={function () { setLihatSemua(true) }} className="mt-3 w-full rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-xs font-bold text-amber-800 hover:bg-amber-100 sm:text-sm">\n          Lihat Semua ({terlewat.length} tanggal)\n        </button>\n      ) : null}\n    </section>',
  'tombol Lihat Semua'
)

if (gagal.length) {
  console.error('PATCH DIBATALKAN (tidak ada file yang ditulis):')
  gagal.forEach(function (g) { console.error('  - ' + g) })
  process.exit(1)
}

const keluaran = crlf ? src.split('\n').join('\r\n') : src
fs.writeFileSync(p, keluaran, 'utf8')
console.log('UBAH  ' + rel + ' (banner menampilkan 3 tanggal + tombol Lihat Semua)')
console.log('Silakan jalankan npm run dev untuk verifikasi.')