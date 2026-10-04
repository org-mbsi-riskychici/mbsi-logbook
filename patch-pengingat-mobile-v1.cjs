#!/usr/bin/env node
/* patch-pengingat-mobile-v1.cjs
   Pemakaian: node patch-pengingat-mobile-v1.cjs
   Menyingkat format tanggal di banner pengingat logbook khusus untuk tampilan mobile
   (misal: "Senin, 8 September" menjadi "Sen, 8 Sept"). */
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

if (src.indexOf('formatTanggalMobile') !== -1) {
  console.log('LEWATI ' + rel + ' (sudah ada formatTanggalMobile)')
  process.exit(0)
}

// 1. Sisipkan helper function untuk format tanggal pendek
const HELPER = `
const HARI_PENDEK = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sept', 'Okt', 'Nov', 'Des']
function formatTanggalMobile(s) {
  if (!s) return ''
  const d = new Date(s + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return s
  return HARI_PENDEK[d.getDay()] + ', ' + d.getDate() + ' ' + BULAN_PENDEK[d.getMonth()]
}
`
src = src.replace(/(import \{ MULAI_MAGANG \} from '\.\.\/lib\/constants\.js'\n)/, '$1' + HELPER)

// 2. Ganti elemen tanggal dengan responsive span
const OLD_DATE = `<p className="text-sm font-semibold text-slate-800">{formatTanggal(t)}</p>`
const NEW_DATE = `<p className="text-sm font-semibold text-slate-800">
          <span className="hidden sm:inline">{formatTanggal(t)}</span>
          <span className="sm:hidden">{formatTanggalMobile(t)}</span>
        </p>`

if (src.indexOf(OLD_DATE) === -1) {
  console.error('Pola tanggal tidak ditemukan. Pastikan file PengingatBanner.jsx belum diubah manual.')
  process.exit(1)
}

src = src.replace(OLD_DATE, NEW_DATE)

if (crlf) src = src.split('\n').join('\r\n')
fs.writeFileSync(p, src, 'utf8')
console.log('UBAH  ' + rel + ' (tanggal mobile disingkat)')
console.log('Silakan jalankan npm run dev untuk verifikasi.')