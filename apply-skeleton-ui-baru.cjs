const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai menulis ulang skeleton agar identik dengan UI kartu saat ini...')
console.log('')

/* ===== 1. Baca bentuk borderRadius yang dipakai komponen Avatar saat ini ===== */
const FILE_U = 'src/components/ui.jsx'
let RAD = '9999px'
if (fs.existsSync(path.join(root, FILE_U))) {
  const u = baca(FILE_U)
  const idx = u.indexOf('function Avatar(')
  if (idx !== -1) {
    const idxOpen = u.indexOf('{', idx)
    let brace = 0, akhir = -1, inStr = false, strCh = ''
    for (let i = idxOpen; i < u.length; i++) {
      const ch = u[i]
      const prev = i > 0 ? u[i - 1] : ''
      if (inStr) { if (ch === strCh && prev !== '\\') inStr = false; continue }
      if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue }
      if (ch === '{') brace++
      if (ch === '}') { brace--; if (brace === 0) { akhir = i + 1; break } }
    }
    if (akhir !== -1) {
      const span = u.slice(idx, akhir)
      const m = span.match(/borderRadius:\s*['"]([^'"]+)['"]/) || span.match(/borderRadius:\s*([^,'}\s]+)/)
      if (m) RAD = m[1]
    }
  }
  console.log('[INFO] Bentuk avatar saat ini memakai borderRadius: ' + RAD)
} else {
  console.log('[LEWATI] ui.jsx tidak ditemukan, memakai borderRadius bawaan')
}

/* ===== 2. Tulis ulang Skeleton.jsx sesuai UI kartu terkini ===== */
const FILE_S = 'src/components/Skeleton.jsx'
const ISI = `export function SkeletonLogbookCard() {
  return (
    <div className="card-hover flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="skeleton aspect-video w-full rounded-2xl"></div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="skeleton h-6 w-24 rounded-full"></div>
        <div className="skeleton h-6 w-20 rounded-full"></div>
        <div className="skeleton ml-auto h-6 w-20 rounded-full"></div>
      </div>
      <div className="skeleton h-4 w-36 rounded-full"></div>
      <div className="skeleton h-6 w-40 rounded-full"></div>
      <div className="skeleton h-4 w-32 rounded-full"></div>
      <div className="skeleton h-3 w-24 rounded-full"></div>
      <div className="mt-auto flex items-center gap-3 border-t border-slate-100 pt-4">
        <div className="skeleton h-10 w-10" style={{ borderRadius: '${RAD}' }}></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-36 rounded-full"></div>
          <div className="skeleton h-3 w-24 rounded-full"></div>
        </div>
        <div className="skeleton h-9 w-20 rounded-2xl"></div>
      </div>
    </div>
  )
}

export function SkeletonGalleryCard() {
  return (
    <div className="card-hover flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="skeleton aspect-video w-full rounded-2xl"></div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="skeleton h-6 w-24 rounded-full"></div>
        <div className="skeleton ml-auto h-6 w-20 rounded-full"></div>
      </div>
      <div className="skeleton h-4 w-36 rounded-full"></div>
      <div className="skeleton h-6 w-44 rounded-full"></div>
      <div className="mt-auto flex items-center gap-3 border-t border-slate-100 pt-4">
        <div className="skeleton h-10 w-10" style={{ borderRadius: '${RAD}' }}></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-36 rounded-full"></div>
          <div className="skeleton h-3 w-24 rounded-full"></div>
        </div>
        <div className="skeleton h-9 w-20 rounded-2xl"></div>
      </div>
    </div>
  )
}

export function SkeletonAttendanceCard() {
  return (
    <div className="card-hover flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="skeleton h-6 w-20 rounded-full"></div>
        <div className="skeleton h-4 w-32 rounded-full"></div>
      </div>
      <div className="skeleton h-5 w-28 rounded-full"></div>
      <div className="skeleton h-4 w-full rounded-full"></div>
      <div className="mt-auto flex items-center gap-3 border-t border-slate-100 pt-4">
        <div className="skeleton h-10 w-10" style={{ borderRadius: '${RAD}' }}></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-36 rounded-full"></div>
          <div className="skeleton h-3 w-24 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonPersonCard() {
  return (
    <div className="card-hover flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="skeleton h-14 w-14" style={{ borderRadius: '${RAD}' }}></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-5 w-40 rounded-full"></div>
          <div className="skeleton h-3 w-24 rounded-full"></div>
          <div className="skeleton h-5 w-28 rounded-full"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="skeleton h-16 rounded-2xl"></div>
        <div className="skeleton h-16 rounded-2xl"></div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="skeleton h-12 rounded-xl"></div>
        <div className="skeleton h-12 rounded-xl"></div>
        <div className="skeleton h-12 rounded-xl"></div>
      </div>
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="skeleton h-14 w-14" style={{ borderRadius: '${RAD}' }}></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-44 rounded-full"></div>
          <div className="skeleton h-3 w-28 rounded-full"></div>
        </div>
        <div className="skeleton h-10 w-28 rounded-2xl"></div>
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="skeleton h-5 w-36 rounded-full"></div>
          <div className="skeleton h-10 w-full rounded-2xl"></div>
          <div className="skeleton h-10 w-full rounded-2xl"></div>
          <div className="skeleton h-20 w-full rounded-2xl"></div>
          <div className="skeleton h-11 w-44 rounded-2xl"></div>
        </div>
        <div className="space-y-5">
          <div className="skeleton h-6 w-32 rounded-full"></div>
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
simpan(FILE_S, ISI)
console.log('[BERHASIL] Skeleton.jsx ditulis ulang dengan lima komponen sesuai UI terkini')

/* ===== 3. Verifikasi ===== */
const s2 = baca(FILE_S)
console.log('')
console.log('Verifikasi:')
console.log((s2.includes('export function SkeletonLogbookCard') ? '[OK] ' : '[BELUM] ') + 'SkeletonLogbookCard')
console.log((s2.includes('export function SkeletonGalleryCard') ? '[OK] ' : '[BELUM] ') + 'SkeletonGalleryCard')
console.log((s2.includes('export function SkeletonAttendanceCard') ? '[OK] ' : '[BELUM] ') + 'SkeletonAttendanceCard')
console.log((s2.includes('export function SkeletonPersonCard') ? '[OK] ' : '[BELUM] ') + 'SkeletonPersonCard')
console.log((s2.includes('export function SkeletonDashboard') ? '[OK] ' : '[BELUM] ') + 'SkeletonDashboard')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Penyesuaian skeleton terhadap UI saat ini:')
console.log('1. Skeleton logbook dan galeri kini punya blok media aspect-video di bagian atas, meniru kartu yang menampilkan foto atau video.')
console.log('2. Baris chip dibuat tiga bagian dengan chip status terdorong ke kanan, sama seperti chip kategori, unit, dan Siap dilihat pada kartu asli.')
console.log('3. Ditambahkan baris pendek peniru daftar kegiatan dan tanggal, sehingga tinggi skeleton mendekati kartu berisi.')
console.log('4. Bentuk blok avatar dibaca langsung dari komponen Avatar di ui.jsx, jadi skeleton selalu mengikuti bentuk avatar yang berlaku tanpa perlu ditebak.')
console.log('5. Skeleton kartu profil meniru kotak statistik Logbook dan Media serta tiga kotak rekap kehadiran, sesuai kartu di halaman Tim & Dospem.')
console.log('6. Skeleton dashboard meniru kartu kepala profil, panel form kiri, dan grid daftar kanan, sehingga layar memuat sesi terlihat seperti dashboard sungguhan.')
console.log('7. Semua blok memakai kelas skeleton bawaan yang sudah punya efek shimmer dan varian mode gelap, jadi tidak ada CSS baru yang perlu dipelihara.')
console.log('')
console.log('Langkah uji:')
console.log('1. Muat halaman Logbook publik dalam kondisi jaringan lambat atau saat data belum siap: skeleton kartu kini berbentuk sama dengan kartu asli termasuk blok media.')
console.log('2. Buka dashboard saat sesi masih dimuat: kerangka dua kolom muncul dan begitu data siap pergantiannya mulus tanpa lompatan bentuk.')
console.log('3. Buka halaman Tim & Dospem saat memuat: skeleton profil menampilkan kotak statistik dan rekap kehadiran tiruan.')
console.log('4. Aktifkan mode gelap: seluruh skeleton menyesuaikan warna gelap dengan kilau lembut yang sama.')
console.log('5. Ganti halaman pagination dengan cepat: skeleton tidak lagi muncul karena data sudah termuat, tetapi saat muat ulang penuh bentuknya konsisten.')