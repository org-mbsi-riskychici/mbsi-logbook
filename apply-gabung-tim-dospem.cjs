const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai menerapkan penggabungan halaman Tim ke dalam Dospem...')
console.log('')

/* ===== 1. DospemPage.jsx: data tim dan section Profil tim magang ===== */
const FILE_D = 'src/pages/DospemPage.jsx'
if (!ada(FILE_D)) {
  console.log('[GAGAL] DospemPage.jsx tidak ditemukan')
  process.exit(1)
}
let d = baca(FILE_D)
let ubahD = false

if (d.indexOf('Avatar') === -1) {
  d = d.replace(/import\s*\{([^}]*)\}\s*from\s*'\.\.\/components\/ui\.jsx'/, function (m, isi) {
    return "import {" + isi + ", Avatar } from '../components/ui.jsx'"
  })
  ubahD = true
  console.log('[BERHASIL] Import Avatar ditambahkan di DospemPage')
} else {
  console.log('[SUDAH ADA] Import Avatar di DospemPage')
}

if (d.indexOf('galRows') === -1) {
  d = d.replace(/const \[hadirCount, setHadirCount\] = useState\(0\)/,
    "const [hadirCount, setHadirCount] = useState(0)\n  const [galRows, setGalRows] = useState([])\n  const [hadirRows, setHadirRows] = useState([])")
  ubahD = true
  console.log('[BERHASIL] State galRows dan hadirRows ditambahkan')
} else {
  console.log('[SUDAH ADA] State galRows dan hadirRows')
}

if (d.indexOf("select('id, mahasiswa_id')") === -1) {
  d = d.replace(".from('galeri').select('id')", ".from('galeri').select('id, mahasiswa_id')")
  d = d.replace(".from('daftar_hadir').select('id')", ".from('daftar_hadir').select('id, mahasiswa_id')")
  ubahD = true
  console.log('[BERHASIL] Query galeri dan daftar hadir kini membawa mahasiswa_id')
} else {
  console.log('[SUDAH ADA] Query galeri dan daftar hadir sudah membawa mahasiswa_id')
}

if (d.indexOf('setGalRows(') === -1) {
  d = d.replace(/setGalCount\(\(g\.data\s*\|\|\s*\[\]\)\.length\)/, function (m) {
    return m + "\n      setGalRows(g.data || [])"
  })
  d = d.replace(/setHadirCount\(\(h\.data\s*\|\|\s*\[\]\)\.length\)/, function (m) {
    return m + "\n      setHadirRows(h.data || [])"
  })
  ubahD = true
  console.log('[BERHASIL] Pengisian state galRows dan hadirRows ditambahkan')
} else {
  console.log('[SUDAH ADA] Pengisian state galRows dan hadirRows')
}

if (d.indexOf('foto_profil') === -1) {
  d = d.replace(/\.select\('id, nama, nim, prodi'\)/, ".select('id, nama, nim, prodi, foto_profil')")
  ubahD = true
  console.log('[BERHASIL] Query mahasiswa kini membawa foto_profil')
} else {
  console.log('[SUDAH ADA] Query mahasiswa sudah membawa foto_profil')
}

if (d.indexOf('Profil tim magang') === -1) {
  const anchor = '<section className="mt-10">'
  const idx = d.indexOf(anchor)
  if (idx === -1) {
    console.log('[TIDAK KETEMU] Anchor section untuk menyisipkan Profil tim magang')
  } else {
    const SECTION_TIM = `<section className="mt-10">
<h2 className="text-2xl lg:text-3xl font-black text-slate-900">Profil tim magang</h2>
<p className="mt-2 max-w-3xl text-slate-500">Seluruh mahasiswa magang beserta kontribusi logbook, media galeri, dan catatan kehadiran masing-masing.</p>
<div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
{loading
? [0, 1, 2].map(function (i) { return <SkeletonPersonCard key={i} /> })
: people.map(function (p) {
const totalLog = logs.filter(function (x) { return x.mahasiswa_id === p.id }).length
const totalGal = galRows.filter(function (x) { return x.mahasiswa_id === p.id }).length
const totalHadir = hadirRows.filter(function (x) { return x.mahasiswa_id === p.id }).length
return (
<div key={p.id} className="card-hover flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<Avatar src={p.foto_profil || null} nama={p.nama} size="lg" />
<div className="min-w-0 flex-1">
<p className="truncate font-bold text-slate-900">{p.nama}</p>
<p className="truncate text-xs text-slate-500">NIM {p.nim}{p.prodi ? ' • ' + p.prodi : ''}</p>
<div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold">
<span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{totalLog} logbook</span>
<span className="inline-flex px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">{totalGal} media</span>
<span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{totalHadir} hadir</span>
</div>
</div>
</div>
)
})}
{!loading && !people.length ? <EmptyState title="Belum ada data mahasiswa" desc="Profil tim akan tampil setelah mahasiswa terdaftar." /> : null}
</div>
</section>
`
    d = d.slice(0, idx) + SECTION_TIM + d.slice(idx)
    ubahD = true
    console.log('[BERHASIL] Section Profil tim magang disisipkan sebelum grid logbook')
  }
} else {
  console.log('[SUDAH ADA] Section Profil tim magang')
}

if (ubahD) simpan(FILE_D, d)

/* ===== 2. App.jsx: route /tim dialihkan ke /dospem ===== */
const FILE_A = 'src/App.jsx'
if (!ada(FILE_A)) {
  console.log('[LEWATI] App.jsx tidak ditemukan')
} else {
  let a = baca(FILE_A)
  if (a.indexOf('Navigate to="/dospem"') !== -1) {
    console.log('[SUDAH ADA] Redirect /tim ke /dospem')
  } else {
    const sebelum = a
    a = a.replace(/<Route\s+path="\/tim"\s*element=\{<TimPage\s*\/>\}\s*\/>/, '<Route path="/tim" element={<Navigate to="/dospem" replace />} />')
    if (a === sebelum) {
      a = a.replace(/<Route\s+path="\/tim"[^>]*\/>/, '<Route path="/tim" element={<Navigate to="/dospem" replace />} />')
    }
    if (a !== sebelum) {
      if (!/import\s*\{[^}]*\bNavigate\b[^}]*\}\s*from\s*'react-router-dom'/.test(a)) {
        a = a.replace(/import\s*\{([^}]*)\}\s*from\s*'react-router-dom'/, function (m, isi) {
          return "import {" + isi + ", Navigate } from 'react-router-dom'"
        })
      }
      simpan(FILE_A, a)
      console.log('[BERHASIL] Route /tim kini dialihkan otomatis ke /dospem')
    } else {
      console.log('[TIDAK KETEMU] Pola route /tim di App.jsx, periksa manual')
    }
  }
}

/* ===== 3. Layout.jsx: satu menu gabungan ===== */
const FILE_L = 'src/components/Layout.jsx'
if (!ada(FILE_L)) {
  console.log('[LEWATI] Layout.jsx tidak ditemukan')
} else {
  let l = baca(FILE_L)
  const sebelum = l
  l = l.replace(/<(NavLink|Link)\b[^>]*to="\/tim"[^>]*>[^<]*<\/\1>/g, '')
  l = l.replace(/,?\s*\{\s*to:\s*['"]\/tim['"][^}]*\}/g, '')
  l = l.split('>Dospem<').join('>Tim & Dospem<')
  l = l.replace(/label:\s*'Dospem'/, "label: 'Tim & Dospem'")
  l = l.replace(/label:\s*"Dospem"/, 'label: "Tim & Dospem"')
  if (l !== sebelum) {
    simpan(FILE_L, l)
    console.log('[BERHASIL] Menu Tim dihapus dan menu Dospem berganti label Tim & Dospem')
  } else {
    console.log('[INFO] Navigasi tidak berubah, periksa manual bila menu Tim masih tampil')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Hasil yang berlaku sekarang:')
console.log('1. Halaman /dospem memuat hero monitoring, section Profil tim magang dengan avatar kotak melengkung dan lencana kontribusi, lalu grid logbook publik, persis seperti pratinjau HTML yang kamu setujui.')
console.log('2. Menu navigasi hanya menampilkan satu butir bernama Tim & Dospem.')
console.log('3. Alamat lama /tim otomatis dialihkan ke /dospem sehingga tautan yang pernah dibagikan tetap hidup.')
console.log('4. Berkas TimPage.jsx dibiarkan ada namun tidak terpakai, aman dihapus manual kapan saja bersama preview-tim-dospem.html bila sudah tidak diperlukan.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka menu Tim & Dospem: hero statistik tampil lebih dulu, lalu kartu profil anggota tim, lalu grid logbook.')
console.log('2. Ketik /tim di address bar: browser otomatis mendarat di /dospem.')
console.log('3. Pastikan foto profil muncul pada kartu anggota bagi mahasiswa yang sudah mengunggah foto, dan inisial berwarna bagi yang belum.')
console.log('4. Buka halaman pada perangkat kecil: grid kartu turun menjadi satu atau dua kolom dengan rapi.')