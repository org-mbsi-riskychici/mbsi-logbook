const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_D = 'src/pages/DashboardPage.jsx'

if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
  process.exit(1)
}

let d = fs.readFileSync(path.join(root, FILE_D), 'utf8')

console.log('Mulai menambahkan Pagination di tab Galeri...')
console.log('')

const MARK = 'onPageChange={gantiHalamanGal}'
if (d.includes(MARK)) {
  console.log('[SUDAH ADA] Pagination di tab Galeri sudah ada')
  process.exit(0)
}

// Cari pola: EmptyState galeri + penutup div grid galeri + penutup div wrapper
// Lalu sisipkan Pagination setelah penutup div grid
const regex = /(\{!filteredGaleri\.length \? <EmptyState icon="camera"[^}]*\} : null\})\s*\n(\s*)(<\/div>\s*\n\s*<\/div>)/

if (regex.test(d)) {
  d = d.replace(regex, function(match, emptyState, spasi, closingDivs) {
    return emptyState + spasi + closingDivs + spasi + '<Pagination totalItems={galTotal} perPage={PER_PAGE_DASH} page={galPageAman} onPageChange={gantiHalamanGal} />'
  })
  fs.writeFileSync(path.join(root, FILE_D), d, 'utf8')
  console.log('[BERHASIL] Pagination ditambahkan di tab Galeri')
} else {
  console.log('[TIDAK KETEMU] Pola grid galeri tidak cocok, coba cari manual')
  console.log('')
  console.log('Solusi manual: buka src/pages/DashboardPage.jsx, cari bagian:')
  console.log('  {!filteredGaleri.length ? <EmptyState icon="camera" ...')
  console.log('  </div>')
  console.log('Lalu tambahkan baris ini SETELAH </div> penutup grid:')
  console.log('  <Pagination totalItems={galTotal} perPage={PER_PAGE_DASH} page={galPageAman} onPageChange={gantiHalamanGal} />')
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard tab Galeri dengan lebih dari 6 media.')
console.log('2. Tombol nomor halaman (1, 2, dst) muncul di bawah daftar media.')
console.log('3. Klik nomor 2: hanya 6 media berikutnya yang tampil.')
console.log('4. Tab Logbook dan Daftar Hadir tetap berfungsi normal.')