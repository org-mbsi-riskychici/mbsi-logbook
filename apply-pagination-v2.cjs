const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }
function batasFungsi(isi, mulai) {
  let brace = 0, akhir = -1, inStr = false, strCh = ''
  for (let i = mulai; i < isi.length; i++) {
    const ch = isi[i]
    const prev = i > 0 ? isi[i - 1] : ''
    if (inStr) { if (ch === strCh && prev !== '\\') inStr = false; continue }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue }
    if (ch === '{') brace++
    if (ch === '}') { brace--; if (brace === 0) { akhir = i + 1; break } }
  }
  return akhir
}

console.log('Mulai memperbarui pagination versi 2: teks lebih jelas dan tombol nomor bertema...')
console.log('')

/* =====================================================
   KOMPONEN PAGINATION VERSI 2
   ===================================================== */
const PAGINATION_V2 = `export function Pagination(props) {
  /* pagination-v2: tombol nomor halaman sesuai tema BSI */
  const totalItems = props.totalItems || 0
  const perPage = props.perPage || 10
  const page = props.page || 1
  const onPageChange = props.onPageChange || function () {}
  const totalPages = Math.ceil(totalItems / perPage)
  if (!totalItems) return null
  const halaman = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) halaman.push(i)
  } else {
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        halaman.push(i)
      } else if (halaman[halaman.length - 1] !== '...') {
        halaman.push('...')
      }
    }
  }
  const clsAngka = 'grid h-10 min-w-10 place-items-center rounded-xl px-3 text-sm font-bold transition '
  const clsNav = 'flex h-10 items-center rounded-xl px-4 text-sm font-semibold transition '
  const clsNetral = 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-bsi-800'
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {totalPages > 1 ? (
        <button
          type="button"
          disabled={page <= 1}
          onClick={function () { onPageChange(page - 1) }}
          className={clsNav + clsNetral + ' disabled:cursor-not-allowed disabled:opacity-40'}
        >
          Sebelumnya
        </button>
      ) : null}
      {halaman.map(function (h, idx) {
        if (h === '...') {
          return <span key={'lompat' + idx} className="px-1 text-sm font-bold text-slate-400">...</span>
        }
        const aktif = h === page
        return (
          <button
            key={'hal' + h}
            type="button"
            onClick={function () { onPageChange(h) }}
            className={clsAngka + (aktif
              ? 'bg-bsi-800 text-white shadow-lg shadow-bsi-900/25'
              : clsNetral)}
          >
            {h}
          </button>
        )
      })}
      {totalPages > 1 ? (
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={function () { onPageChange(page + 1) }}
          className={clsNav + clsNetral + ' disabled:cursor-not-allowed disabled:opacity-40'}
        >
          Berikutnya
        </button>
      ) : null}
    </div>
  )
}`

/* =====================================================
   LANGKAH 1: GANTI KOMPONEN PAGINATION DI ui.jsx
   ===================================================== */
const FILE_U = 'src/components/ui.jsx'
if (!ada(FILE_U)) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}
let u = baca(FILE_U)
if (u.includes('/* pagination-v2')) {
  console.log('[SUDAH ADA] Komponen Pagination versi 2 di ui.jsx')
} else {
  const mulai = u.indexOf('export function Pagination(props) {')
  if (mulai === -1) {
    u = u.trimEnd() + '\n\n' + PAGINATION_V2 + '\n'
    simpan(FILE_U, u)
    console.log('[BERHASIL] Komponen Pagination ditambahkan di ui.jsx')
  } else {
    const akhir = batasFungsi(u, mulai)
    if (akhir === -1) {
      console.log('[GAGAL] Batas fungsi Pagination lama tidak terbaca')
    } else {
      u = u.slice(0, mulai) + PAGINATION_V2 + u.slice(akhir)
      simpan(FILE_U, u)
      console.log('[BERHASIL] Komponen Pagination lama diganti versi 2 di ui.jsx')
    }
  }
}

/* =====================================================
   LANGKAH 2: GANTI TEKS INFO DI TIGA HALAMAN
   ===================================================== */
const TARGET = [
  {
    rel: 'src/pages/LogbookPage.jsx',
    lama: 'Menampilkan {mulai} sampai {akhir} dari {totalData} logbook',
    baru: 'Halaman {pageAman} dari {totalPages} • {totalData} logbook'
  },
  {
    rel: 'src/pages/GalleryPage.jsx',
    lama: 'Menampilkan {mulai} sampai {akhir} dari {totalData} media',
    baru: 'Halaman {pageAman} dari {totalPages} • {totalData} media'
  },
  {
    rel: 'src/pages/AttendancePage.jsx',
    lama: 'Menampilkan {mulai} sampai {akhir} dari {totalData} catatan',
    baru: 'Halaman {pageAman} dari {totalPages} • {totalData} catatan'
  }
]
TARGET.forEach(function (t) {
  if (!ada(t.rel)) { console.log('[LEWATI] ' + t.rel + ' tidak ditemukan'); return }
  let isi = baca(t.rel)
  if (isi.includes('Halaman {pageAman} dari {totalPages}')) {
    console.log('[SUDAH ADA] Teks info baru di ' + t.rel)
  } else if (isi.includes(t.lama)) {
    isi = isi.split(t.lama).join(t.baru)
    simpan(t.rel, isi)
    console.log('[BERHASIL] Teks info diperbarui di ' + t.rel)
  } else {
    console.log('[TIDAK KETEMU] Teks info lama di ' + t.rel)
  }
})

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perubahan versi 2:')
console.log('1. Teks info kini berbunyi Halaman 1 dari 1 • 4 logbook, jauh lebih mudah dipahami daripada rentang angka.')
console.log('2. Nomor halaman tampil sebagai tombol persegi membulat bertema: halaman aktif hijau BSI dengan bayangan lembut, halaman lain putih dengan border tipis.')
console.log('3. Tombol nomor hanya dibuat sebanyak halaman yang benar-benar ada. Data 7 buah berarti 1 halaman, jadi hanya tombol 1.')
console.log('4. Bila hanya ada 1 halaman, tombol Sebelumnya dan Berikutnya tidak ditampilkan sama sekali supaya tidak membingungkan.')
console.log('5. Bila halaman lebih dari 7, nomor di tengah diringkas dengan titik tiga, misalnya 1 ... 4 5 6 ... 10, supaya baris tombol tetap rapi.')
console.log('6. Mode gelap otomatis mengikuti karena kelas yang dipakai sama dengan komponen lain di proyek ini.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman Logbook dengan 4 data: terlihat teks Halaman 1 dari 1 • 4 logbook dan satu tombol nomor 1.')
console.log('2. Tambahkan data sampai lebih dari 10: tombol 2 muncul beserta Sebelumnya dan Berikutnya.')
console.log('3. Klik tombol 2: tombol berubah hijau dan teks info menjadi Halaman 2 dari 2.')
console.log('4. Ulangi pengecekan di halaman Galeri dan Daftar Hadir.')