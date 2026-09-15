const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_S = 'src/components/Skeleton.jsx'
if (!fs.existsSync(path.join(root, FILE_S))) {
  console.log('[GAGAL] Skeleton.jsx tidak ditemukan')
  process.exit(1)
}
let s = fs.readFileSync(path.join(root, FILE_S), 'utf8').replace(/\r\n/g, '\n')
let berubah = false

console.log('Mulai mengembalikan ekspor skeleton yang hilang...')
console.log('')

const STAT = `
export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <div className="skeleton h-4 w-28"></div>
      <div className="skeleton h-9 w-16 mt-3"></div>
      <div className="skeleton h-3 w-36 mt-2"></div>
    </div>
  )
}
`
const CHART = `
export function SkeletonChartRow() {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-4 w-32"></div>
          <div className="skeleton h-3 w-24"></div>
        </div>
        <div className="skeleton h-4 w-40"></div>
      </div>
      <div className="skeleton h-4 w-full rounded-full mt-4"></div>
    </div>
  )
}
`

if (s.includes('export function SkeletonStatCard')) {
  console.log('[SUDAH ADA] SkeletonStatCard di Skeleton.jsx')
} else {
  s = s.trimEnd() + '\n' + STAT
  berubah = true
  console.log('[BERHASIL] SkeletonStatCard dikembalikan ke Skeleton.jsx')
}
if (s.includes('export function SkeletonChartRow')) {
  console.log('[SUDAH ADA] SkeletonChartRow di Skeleton.jsx')
} else {
  s = s.trimEnd() + '\n' + CHART
  berubah = true
  console.log('[BERHASIL] SkeletonChartRow dikembalikan ke Skeleton.jsx')
}
if (berubah) fs.writeFileSync(path.join(root, FILE_S), s, 'utf8')

/* ===== Verifikasi menyeluruh: semua impor skeleton di proyek harus punya ekspor ===== */
function daftarFile(dir) {
  let out = []
  const nama = fs.readdirSync(dir)
  for (let i = 0; i < nama.length; i++) {
    const p = path.join(dir, nama[i])
    const st = fs.statSync(p)
    if (st.isDirectory()) out = out.concat(daftarFile(p))
    else if (p.endsWith('.jsx') || p.endsWith('.js')) out.push(p)
  }
  return out
}
s = fs.readFileSync(path.join(root, FILE_S), 'utf8')
const file = daftarFile(path.join(root, 'src'))
let masalah = 0
for (let i = 0; i < file.length; i++) {
  const isi = fs.readFileSync(file[i], 'utf8')
  const re = /import\s*\{([^}]*)\}\s*from\s*['"][^'"]*Skeleton\.jsx['"]/g
  let m
  while ((m = re.exec(isi)) !== null) {
    const nama = m[1].split(',').map(function (x) { return x.trim() }).filter(Boolean)
    for (let j = 0; j < nama.length; j++) {
      if (!s.includes('export function ' + nama[j])) {
        masalah++
        console.log('[KURANG] Ekspor ' + nama[j] + ' belum ada (dipakai di ' + path.relative(root, file[i]) + ')')
      }
    }
  }
}
console.log('')
console.log('Verifikasi:')
console.log((s.includes('export function SkeletonStatCard') ? '[OK] ' : '[BELUM] ') + 'SkeletonStatCard')
console.log((s.includes('export function SkeletonChartRow') ? '[OK] ' : '[BELUM] ') + 'SkeletonChartRow')
console.log((s.includes('export function SkeletonLogbookCard') ? '[OK] ' : '[BELUM] ') + 'SkeletonLogbookCard')
console.log((s.includes('export function SkeletonGalleryCard') ? '[OK] ' : '[BELUM] ') + 'SkeletonGalleryCard')
console.log((s.includes('export function SkeletonAttendanceCard') ? '[OK] ' : '[BELUM] ') + 'SkeletonAttendanceCard')
console.log((s.includes('export function SkeletonPersonCard') ? '[OK] ' : '[BELUM] ') + 'SkeletonPersonCard')
console.log((s.includes('export function SkeletonDashboard') ? '[OK] ' : '[BELUM] ') + 'SkeletonDashboard')
console.log((masalah === 0 ? '[OK] ' : '[BELUM] ') + 'Seluruh impor skeleton di proyek terpenuhi (' + masalah + ' kekurangan)')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Penjelasan perbaikan:')
console.log('1. Layar blank terjadi karena HomePage dan AttendancePage masih mengimpor SkeletonStatCard dan SkeletonChartRow yang sempat hilang dari Skeleton.jsx.')
console.log('2. Kedua komponen itu kini dikembalikan dengan bentuk yang sama seperti sebelumnya, jadi statistik dan baris grafik kehadiran kembali punya skeleton.')
console.log('3. Script sekaligus menyisir semua file di src dan mencocokkan setiap impor dari Skeleton.jsx dengan ekspor yang ada, sehingga bila masih ada yang kurang akan langsung terlihat di daftar KURANG.')
console.log('4. Tidak ada komponen skeleton lain yang diubah, jadi tampilan skeleton versi UI baru tetap utuh.')
console.log('')
console.log('Langkah uji:')
console.log('1. Muat ulang browser: aplikasi tidak lagi blank dan halaman Beranda tampil normal.')
console.log('2. Buka halaman Daftar Hadir saat memuat: kartu statistik dan baris grafik per orang tampil sebagai skeleton.')
console.log('3. Buka dashboard dan halaman publik lain: semua skeleton muncul sesuai bentuk kartu terkini.')
console.log('4. Bila konsol bersih dari error modul, berarti seluruh impor dan ekspor skeleton sudah sinkron.')