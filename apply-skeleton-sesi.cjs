const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai mengganti teks Memuat sesi dengan skeleton dashboard...')
console.log('')

/* ===== 1. index.css: kelas bar shimmer untuk skeleton sesi ===== */
const FILE_CSS = 'src/index.css'
const CSS_BLOK = `/* skeleton-sesi: bar berkilau untuk tampilan memuat sesi dashboard */
.skeleton-bar {
  position: relative;
  overflow: hidden;
  background: #e2e8f0;
}
.dark .skeleton-bar { background: #1e293b; }
.skeleton-bar::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
  animation: skeletonSweep 1.4s ease-in-out infinite;
}
.dark .skeleton-bar::after {
  background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.18), transparent);
}
@keyframes skeletonSweep {
  100% { transform: translateX(100%); }
}
`
if (!fs.existsSync(path.join(root, FILE_CSS))) {
  console.log('[LEWATI] index.css tidak ditemukan')
} else {
  let css = baca(FILE_CSS)
  if (css.includes('skeleton-sesi')) {
    console.log('[SUDAH ADA] CSS skeleton-sesi di index.css')
  } else {
    simpan(FILE_CSS, css.trimEnd() + '\n\n' + CSS_BLOK)
    console.log('[BERHASIL] CSS skeleton-sesi ditambahkan di index.css')
  }
}

/* ===== 2. Skeleton.jsx: komponen SkeletonDashboard ===== */
const FILE_S = 'src/components/Skeleton.jsx'
const KOMPONEN = `
export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="skeleton-bar h-14 w-14 rounded-2xl"></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton-bar h-4 w-44 rounded-full"></div>
          <div className="skeleton-bar h-3 w-28 rounded-full"></div>
        </div>
        <div className="skeleton-bar h-10 w-28 rounded-2xl"></div>
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="skeleton-bar h-5 w-36 rounded-full"></div>
          <div className="skeleton-bar h-10 w-full rounded-2xl"></div>
          <div className="skeleton-bar h-10 w-full rounded-2xl"></div>
          <div className="skeleton-bar h-20 w-full rounded-2xl"></div>
          <div className="skeleton-bar h-11 w-44 rounded-2xl"></div>
        </div>
        <div className="space-y-5">
          <div className="skeleton-bar h-6 w-32 rounded-full"></div>
          <div className="grid gap-5 md:grid-cols-2">
            <SkeletonLogbookCard />
            <SkeletonLogbookCard />
            <SkeletonLogbookCard />
            <SkeletonLogbookCard />
          </div>
        </div>
      </div>
    </div>
  )
}
`
if (!fs.existsSync(path.join(root, FILE_S))) {
  console.log('[LEWATI] Skeleton.jsx tidak ditemukan')
} else {
  let s = baca(FILE_S)
  if (s.includes('export function SkeletonDashboard')) {
    console.log('[SUDAH ADA] Komponen SkeletonDashboard di Skeleton.jsx')
  } else {
    simpan(FILE_S, s.trimEnd() + '\n' + KOMPONEN)
    console.log('[BERHASIL] Komponen SkeletonDashboard ditambahkan di Skeleton.jsx')
  }
}

/* ===== 3. App.jsx: import dan ganti teks Memuat sesi ===== */
const FILE_A = 'src/App.jsx'
if (!fs.existsSync(path.join(root, FILE_A))) {
  console.log('[LEWATI] App.jsx tidak ditemukan')
} else {
  let a = baca(FILE_A)
  let berubah = false
  if (!a.includes("import { SkeletonDashboard } from './components/Skeleton.jsx'")) {
    a = "import { SkeletonDashboard } from './components/Skeleton.jsx'\n" + a
    berubah = true
    console.log('[BERHASIL] Import SkeletonDashboard ditambahkan di App.jsx')
  } else {
    console.log('[SUDAH ADA] Import SkeletonDashboard di App.jsx')
  }
  const RE_TEKS = /<div className="[^"]*">Memuat sesi\.\.\.<\/div>/
  if (a.includes('<SkeletonDashboard />')) {
    console.log('[SUDAH ADA] Skeleton dipakai pada keadaan memuat sesi')
  } else if (RE_TEKS.test(a)) {
    a = a.replace(RE_TEKS, '<div className="mx-auto w-full max-w-7xl px-4 py-6 lg:py-8"><SkeletonDashboard /></div>')
    berubah = true
    console.log('[BERHASIL] Teks Memuat sesi diganti skeleton dashboard')
  } else {
    console.log('[TIDAK KETEMU] Pola teks Memuat sesi di App.jsx')
  }
  if (berubah) simpan(FILE_A, a)
}

/* ===== 4. Verifikasi ===== */
const css2 = fs.existsSync(path.join(root, FILE_CSS)) ? baca(FILE_CSS) : ''
const s2 = fs.existsSync(path.join(root, FILE_S)) ? baca(FILE_S) : ''
const a2 = fs.existsSync(path.join(root, FILE_A)) ? baca(FILE_A) : ''
console.log('')
console.log('Verifikasi:')
console.log((css2.includes('.skeleton-bar') ? '[OK] ' : '[BELUM] ') + 'Kelas bar shimmer tersedia di index.css')
console.log((s2.includes('export function SkeletonDashboard') ? '[OK] ' : '[BELUM] ') + 'Komponen SkeletonDashboard ada di Skeleton.jsx')
console.log((a2.includes('<SkeletonDashboard />') ? '[OK] ' : '[BELUM] ') + 'RequireAuth merender skeleton saat memuat sesi')
console.log((!a2.includes('Memuat sesi...') ? '[OK] ' : '[BELUM] ') + 'Teks Memuat sesi sudah tidak dipakai lagi')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perilaku baru:')
console.log('1. Saat masuk ke dashboard dan sesi masih diperiksa, layar langsung menampilkan kerangka dashboard tiruan, bukan teks polos.')
console.log('2. Kerangka terdiri dari kartu kepala profil, panel form sebelah kiri, dan grid empat kartu logbook di sebelah kanan, meniru tata letak dashboard asli.')
console.log('3. Semua bar memakai efek shimmer berkilau yang sama dengan skeleton kartu lainnya, lengkap dengan varian mode gelap.')
console.log('4. Begitu sesi selesai, skeleton langsung diganti dashboard asli tanpa lompatan tata letak karena bentuknya memang meniru dashboard.')
console.log('5. Tidak ada logika autentikasi yang disentuh, hanya tampilan keadaan memuat yang diganti.')
console.log('')
console.log('Langkah uji:')
console.log('1. Keluar dari dashboard lalu masuk kembali, perhatikan momen sebelum dashboard tampil.')
console.log('2. Kini muncul kerangka dashboard berkilau menggantikan tulisan Memuat sesi.')
console.log('3. Aktifkan mode gelap lalu ulangi: warna skeleton menyesuaikan latar gelap dengan kilau lembut.')
console.log('4. Setelah sesi siap, dashboard asli muncul mulus tanpa kedip maupun pergeseran besar.')
console.log('5. Buka halaman publik biasa: tidak ada perubahan apa pun karena skeleton hanya dipakai di gerbang dashboard.')