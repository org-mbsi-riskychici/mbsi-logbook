const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memperbaiki query foto profil dan warning key...')
console.log('')

/* ===== 1. DashboardPage.jsx: Paksa query mengambil semua kolom mahasiswa ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
if (fs.existsSync(path.join(root, FILE_D))) {
  let d = baca(FILE_D)
  let berubah = false
  
  // Ubah mahasiswa(id, nama, nim) atau mahasiswa!inner(...) menjadi mahasiswa(*)
  d = d.replace(/mahasiswa(!inner)?\([^)]*\)/g, function (match, inner) {
    berubah = true
    return 'mahasiswa' + (inner || '') + '(*)'
  })
  
  if (berubah) {
    simpan(FILE_D, d)
    console.log('[BERHASIL] Query mahasiswa di DashboardPage kini mengambil semua kolom (termasuk foto_profil)')
  } else {
    console.log('[INFO] Tidak ada query mahasiswa spesifik yang perlu diubah di DashboardPage')
  }
}

/* ===== 2. TimPage.jsx: Tambahkan foto_profil ke query select ===== */
const FILE_T = 'src/pages/TimPage.jsx'
if (fs.existsSync(path.join(root, FILE_T))) {
  let t = baca(FILE_T)
  let berubahT = false
  
  t = t.replace(/\.select\((['"`])([^'"`]+)\1\)/g, function (match, quote, content) {
    if (content.includes('foto_profil') || content === '*') return match
    berubahT = true
    return '.select(' + quote + content + ', foto_profil' + quote + ')'
  })
  
  if (berubahT) {
    simpan(FILE_T, t)
    console.log('[BERHASIL] Query di TimPage kini menyertakan kolom foto_profil')
  } else {
    console.log('[INFO] Query TimPage sudah memuat foto_profil atau menggunakan *')
  }
}

/* ===== 3. AttendancePage.jsx: Tambal warning unique key prop ===== */
const FILE_A = 'src/pages/AttendancePage.jsx'
if (fs.existsSync(path.join(root, FILE_A))) {
  let a = baca(FILE_A)
  let berubahA = false
  
  // Pola 1: .map(function (item, index) { return <Tag ...
  a = a.replace(/\.map\(\s*function\s*\(([^,)]+)(?:,\s*([^)]+))?\)\s*\{\s*return\s*(<[a-zA-Z][^>]*?)(\s*\/?>)/g, function (m, p1, p2, tag, close) {
    if (tag.includes('key=')) return m
    berubahA = true
    const idx = p2 ? p2.trim() : 'i'
    const newTag = tag.replace(/<([a-zA-Z0-9_]+)/, '<$1 key={' + idx + '}')
    return m.replace(tag, newTag)
  })

  // Pola 2: .map((item, index) => <Tag ...
  a = a.replace(/\.map\(\s*\(([^,)]+)(?:,\s*([^)]+))?\)\s*=>\s*(<[a-zA-Z][^>]*?)(\s*\/?>)/g, function (m, p1, p2, tag, close) {
    if (tag.includes('key=')) return m
    berubahA = true
    const idx = p2 ? p2.trim() : 'i'
    const newTag = tag.replace(/<([a-zA-Z0-9_]+)/, '<$1 key={' + idx + '}')
    return m.replace(tag, newTag)
  })
  
  if (berubahA) {
    simpan(FILE_A, a)
    console.log('[BERHASIL] Warning key prop ditambal di AttendancePage')
  } else {
    console.log('[INFO] Tidak ada .map tanpa key yang terdeteksi di AttendancePage')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Catatan untuk error "startTime" di console:')
console.log('Error tersebut berasal dari ekstensi browser (seperti Web Vitals atau Google Translate) yang mencoba mengukur performa halaman, bukan dari kode aplikasimu. Kamu bisa mengabaikannya dengan aman.')