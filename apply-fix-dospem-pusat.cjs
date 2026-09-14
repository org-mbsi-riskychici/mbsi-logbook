const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memperbaiki sisa pemasangan di DospemPage...')
console.log('')

const FILE_D = 'src/pages/DospemPage.jsx'
if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] DospemPage.jsx tidak ditemukan')
  process.exit(1)
}
let d = baca(FILE_D)
let berubah = false

/* ===== 1. Seimbangkan penutup kartu profil tim (tambah satu </div> pembungkus kolom) ===== */
const TUTUP_BENAR = '</div>\n</div>\n</div>\n</div>\n)\n})}'
const TUTUP_LAMA = '</div>\n</div>\n</div>\n)\n})}'
if (d.includes(TUTUP_BENAR)) {
  console.log('[SUDAH ADA] Penutup kartu profil tim sudah seimbang')
} else if (d.includes(TUTUP_LAMA)) {
  d = d.replace(TUTUP_LAMA, TUTUP_BENAR)
  berubah = true
  console.log('[BERHASIL] Penutup kartu profil tim diseimbangkan, error sintaks hilang')
} else {
  console.log('[TIDAK KETEMU] Pola penutup kartu profil tim')
}

/* ===== 2. Wadah grid logbook dospem menjadi grid-pusat ===== */
const CONT_LAMA = '<div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">'
const CONT_BARU = '<div className="grid-pusat mt-6">'
if (d.includes(CONT_BARU)) {
  console.log('[SUDAH ADA] Wadah grid logbook dospem sudah grid-pusat')
} else if (d.includes(CONT_LAMA)) {
  d = d.replace(CONT_LAMA, CONT_BARU)
  berubah = true
  console.log('[BERHASIL] Wadah grid logbook dospem menjadi grid-pusat')
} else {
  console.log('[TIDAK KETEMU] Wadah grid logbook dospem')
}

/* ===== 3. Skeleton logbook dospem dibungkus kolom ===== */
const SKEL_LAMA = '? [0, 1, 2].map(function (i) { return <SkeletonLogbookCard key={i} /> })'
const SKEL_BARU = '? [0, 1, 2, 3, 4, 5].map(function (i) { return <div key={i} className="kolom-kartu"><SkeletonLogbookCard /></div> })'
if (d.includes('kolom-kartu"><SkeletonLogbookCard')) {
  console.log('[SUDAH ADA] Skeleton logbook dospem dibungkus kolom')
} else if (d.includes(SKEL_LAMA)) {
  d = d.replace(SKEL_LAMA, SKEL_BARU)
  berubah = true
  console.log('[BERHASIL] Skeleton logbook dospem dibungkus kolom')
} else {
  console.log('[TIDAK KETEMU] Skeleton logbook dospem')
}

/* ===== 4. Grid logbook dospem: 6 terbaru dibungkus kolom (regex tahan indentasi) ===== */
const RE_MAP = /: logs\.map\(function \(l\) \{\s*return <LogbookCard key=\{l\.id\} log=\{l\} onDetail=\{function \(\) \{ setDetail\(l\) \}\} \/>\s*\}\)\}/
if (d.includes('logs.slice(0, 6)')) {
  console.log('[SUDAH ADA] Grid logbook dospem sudah 6 terbaru')
} else if (RE_MAP.test(d)) {
  d = d.replace(RE_MAP, `: logs.slice(0, 6).map(function (l) {
                return (
                  <div key={l.id} className="kolom-kartu">
                    <LogbookCard log={l} onDetail={function () { setDetail(l) }} />
                  </div>
                )
              })}`)
  berubah = true
  console.log('[BERHASIL] Grid logbook dospem menampilkan 6 terbaru rata tengah')
} else {
  console.log('[TIDAK KETEMU] Pola map logbook dospem')
}

/* ===== 5. EmptyState logbook dospem melebar penuh ===== */
const EMPTY_LAMA = '{!loading && !logs.length ? <EmptyState title="Belum ada logbook publik" desc="Logbook akan tampil setelah mahasiswa mengatur status siap dilihat." /> : null}'
const EMPTY_BARU = '{!loading && !logs.length ? <div className="w-full"><EmptyState title="Belum ada logbook publik" desc="Logbook akan tampil setelah mahasiswa mengatur status siap dilihat." /></div> : null}'
if (d.includes('<div className="w-full"><EmptyState title="Belum ada logbook publik"')) {
  console.log('[SUDAH ADA] EmptyState logbook dospem melebar penuh')
} else if (d.includes(EMPTY_LAMA)) {
  d = d.replace(EMPTY_LAMA, EMPTY_BARU)
  berubah = true
  console.log('[BERHASIL] EmptyState logbook dospem melebar penuh')
} else {
  console.log('[TIDAK KETEMU] EmptyState logbook dospem')
}

/* ===== 6. Tombol lihat semua sebelum penutup section logbook dospem ===== */
const RE_TOMBOL = /<\/div>\s*<\/section>\s*(<Modal open=\{!!detail\})/
if (d.includes('Lihat semua logbook')) {
  console.log('[SUDAH ADA] Tombol lihat semua di section logbook dospem')
} else if (RE_TOMBOL.test(d)) {
  d = d.replace(RE_TOMBOL, `</div>
        <div className="mt-8 flex justify-center">
          <Link to="/logbook" className="rounded-2xl bg-bsi-800 px-6 py-3 text-sm font-bold text-white hover:bg-bsi-900">Lihat semua logbook</Link>
        </div>
      </section>
      $1`)
  berubah = true
  console.log('[BERHASIL] Tombol lihat semua dipasang di section logbook dospem')
} else {
  console.log('[TIDAK KETEMU] Anchor tombol lihat semua di dospem')
}

if (berubah) simpan(FILE_D, d)

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perbaikan yang diterapkan:')
console.log('1. Penutup kartu profil tim kembali seimbang sehingga error sintaks dari langkah sebelumnya hilang.')
console.log('2. Grid logbook di Tim & Dospem memakai wadah grid-pusat dan hanya menampilkan 6 logbook terbaru.')
console.log('3. Tombol hijau Lihat semua logbook tampil di tengah bawah section aktivitas, menuju halaman Logbook.')
console.log('4. Kartu profil tim yang kurang dari satu baris penuh tetap berdiri di tengah karena pembungkus kolom.')
console.log('')
console.log('Langkah uji:')
console.log('1. Dev server tidak lagi menampilkan error sintaks setelah file tersimpan.')
console.log('2. Buka Tim & Dospem: kartu profil tim tampil rata tengah dan tidak ada kartu yang rusak.')
console.log('3. Section aktivitas menampilkan maksimal 6 kartu logbook terbaru dengan tombol lihat semua di bawahnya.')
console.log('4. Klik tombol tersebut: browser berpindah ke halaman Logbook lengkap dengan pagination 12 data.')