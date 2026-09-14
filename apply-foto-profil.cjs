const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

function sisipSetelah(rel, anchor, teks, marker, label) {
  if (!ada(rel)) { console.log('[LEWATI] ' + rel + ' tidak ditemukan (' + label + ')'); return }
  let isi = baca(rel)
  if (isi.includes(marker)) { console.log('[SUDAH ADA] ' + label); return }
  if (!isi.includes(anchor)) { console.log('[TIDAK KETEMU] Anchor untuk ' + label + ' di ' + rel); return }
  isi = isi.replace(anchor, anchor + '\n' + teks)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

function sisipSebelum(rel, anchor, teks, marker, label) {
  if (!ada(rel)) { console.log('[LEWATI] ' + rel + ' tidak ditemukan (' + label + ')'); return }
  let isi = baca(rel)
  if (isi.includes(marker)) { console.log('[SUDAH ADA] ' + label); return }
  if (!isi.includes(anchor)) { console.log('[TIDAK KETEMU] Anchor untuk ' + label + ' di ' + rel); return }
  isi = isi.replace(anchor, teks + '\n' + anchor)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

console.log('Mulai memasang fitur foto profil mahasiswa...')
console.log('')

/* ===== 1. src/lib/profil.js: helper upload, simpan, hapus foto profil ===== */
simpan('src/lib/profil.js', `import { supabase } from './supabase.js'

const MAKS_FOTO_PROFIL = 5 * 1024 * 1024

export async function uploadFotoProfil(file, userId) {
  if (!file) throw new Error('File foto tidak ditemukan')
  const tipe = String(file.type || '').toLowerCase()
  if (tipe.indexOf('heic') !== -1 || tipe.indexOf('heif') !== -1) {
    throw new Error('Format HEIC belum didukung untuk foto profil. Ubah dulu ke JPG atau PNG.')
  }
  if (tipe.indexOf('image/') !== 0) throw new Error('File harus berupa gambar')
  if (file.size > MAKS_FOTO_PROFIL) throw new Error('Ukuran foto maksimal 5 MB')
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const namaFile = userId + '/profil-' + Date.now() + '.' + ext
  const { error } = await supabase.storage
    .from('foto-profil')
    .upload(namaFile, file, { upsert: true, contentType: file.type })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('foto-profil').getPublicUrl(namaFile)
  return data.publicUrl
}

export async function updateFotoProfilMahasiswa(mahasiswaId, fotoUrl) {
  const { error } = await supabase.from('mahasiswa').update({ foto_profil: fotoUrl }).eq('id', mahasiswaId)
  if (error) throw new Error(error.message)
}

export async function hapusFotoProfil(mahasiswaId, fotoUrl) {
  if (fotoUrl) {
    const bagian = String(fotoUrl).split('/foto-profil/')
    if (bagian[1]) {
      await supabase.storage.from('foto-profil').remove([decodeURIComponent(bagian[1])])
    }
  }
  const { error } = await supabase.from('mahasiswa').update({ foto_profil: null }).eq('id', mahasiswaId)
  if (error) throw new Error(error.message)
}
`)
console.log('[BERHASIL] src/lib/profil.js ditulis')

/* ===== 2. ui.jsx: komponen Avatar dengan fallback inisial bertema ===== */
const FILE_U = 'src/components/ui.jsx'
sisipSetelah(FILE_U,
  'export function TitikAnim() {',
  `export function Avatar(props) {
  const size = props.size || 'md'
  const kelas = size === 'sm' ? 'h-9 w-9 text-xs' : size === 'lg' ? 'h-14 w-14 text-base' : size === 'xl' ? 'h-24 w-24 text-2xl' : 'h-11 w-11 text-sm'
  const nama = props.nama || ''
  const inisial = nama ? nama.trim().split(/\\s+/).map(function (w) { return w[0] }).join('').slice(0, 2).toUpperCase() : '?'
  const palet = ['bg-bsi-700', 'bg-bsi-600', 'bg-gold-600', 'bg-gold-500', 'bg-slate-700', 'bg-emerald-700']
  let hash = 0
  for (let i = 0; i < nama.length; i++) hash = (hash * 31 + nama.charCodeAt(i)) >>> 0
  const warna = palet[hash % palet.length]
  if (props.src) {
    return <img src={props.src} alt={nama || 'Foto profil'} className={kelas + ' rounded-full object-cover border-2 border-white shadow-md'} />
  }
  return <div className={kelas + ' ' + warna + ' rounded-full grid place-items-center font-black text-white border-2 border-white shadow-md'}>{inisial}</div>
}`,
  'export function Avatar',
  'Komponen Avatar ditambahkan di ui.jsx')

/* ===== 3. DashboardPage: import helper dan Avatar ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
sisipSetelah(FILE_D,
  `import { parseYouTubeId, ytThumb, fetchYouTubeQuota, unggahVideoYouTube } from '../lib/youtube.js'`,
  `import { uploadFotoProfil, updateFotoProfilMahasiswa, hapusFotoProfil } from '../lib/profil.js'
import { Avatar } from '../components/ui.jsx'`,
  "from '../lib/profil.js'",
  'Import helper foto profil dan Avatar di DashboardPage')

/* ===== 4. DashboardPage: state foto profil ===== */
sisipSetelah(FILE_D,
  'const [ytQuotaLoading, setYtQuotaLoading] = useState(true)',
  `  const [showUploadFoto, setShowUploadFoto] = useState(false)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [fotoFile, setFotoFile] = useState(null)
  const [uploadingFoto, setUploadingFoto] = useState(false)`,
  'showUploadFoto',
  'State foto profil ditambahkan di DashboardPage')

/* ===== 5. DashboardPage: handler foto profil ===== */
sisipSebelum(FILE_D,
  'async function submitHadir(e) {',
  `  function pilihFotoProfil(e) {
    const f = e.target.files[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { alert('Ukuran foto maksimal 5 MB.'); e.target.value = ''; return }
    setFotoFile(f)
    const reader = new FileReader()
    reader.onloadend = function () { setFotoPreview(reader.result) }
    reader.readAsDataURL(f)
  }
  async function simpanFotoProfil() {
    if (!fotoFile) { alert('Pilih file foto terlebih dahulu.'); return }
    setUploadingFoto(true)
    try {
      const url = await uploadFotoProfil(fotoFile, mahasiswa.id)
      await updateFotoProfilMahasiswa(mahasiswa.id, url)
      setMahasiswa(Object.assign({}, mahasiswa, { foto_profil: url }))
      setShowUploadFoto(false)
      setFotoPreview(null)
      setFotoFile(null)
    } catch (err) {
      alert('Gagal upload foto profil: ' + err.message)
    }
    setUploadingFoto(false)
  }
  async function hapusFotoProfilKu() {
    if (!window.confirm('Hapus foto profil saat ini?')) return
    try {
      await hapusFotoProfil(mahasiswa.id, mahasiswa.foto_profil)
      setMahasiswa(Object.assign({}, mahasiswa, { foto_profil: null }))
    } catch (err) {
      alert('Gagal menghapus foto profil: ' + err.message)
    }
  }`,
  'function simpanFotoProfil',
  'Handler foto profil ditambahkan di DashboardPage')

/* ===== 6. DashboardPage: section UI foto profil ===== */
const SECTION_FOTO = `<section className="mt-8 card-hover rounded-[2rem] bg-white border border-slate-200 p-6 shadow-sm">
  <div className="flex flex-wrap items-center gap-4">
    <Avatar src={mahasiswa.foto_profil || null} nama={mahasiswa.nama} size="xl" />
    <div className="min-w-0 flex-1">
      <h2 className="text-lg font-black text-slate-900">Foto Profil</h2>
      <p className="text-sm text-slate-500">Foto ini tampil di kartu kamu pada halaman publik, logbook, dan galeri.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={function () { setShowUploadFoto(!showUploadFoto) }} className="px-4 py-2 rounded-xl text-sm font-bold bg-bsi-800 text-white hover:bg-bsi-700 transition">{mahasiswa.foto_profil ? 'Ganti Foto' : 'Upload Foto'}</button>
        {mahasiswa.foto_profil ? <button type="button" onClick={hapusFotoProfilKu} className="px-4 py-2 rounded-xl text-sm font-bold bg-red-50 text-red-700 hover:bg-red-100 transition">Hapus Foto</button> : null}
      </div>
    </div>
  </div>
  {showUploadFoto ? (
    <div className="mt-4 border-t border-slate-200 pt-4">
      <div className="flex flex-wrap items-start gap-4">
        {fotoPreview ? <img src={fotoPreview} alt="Pratinjau foto profil" className="h-24 w-24 rounded-full object-cover border-2 border-white shadow-md" /> : null}
        <div className="min-w-0 flex-1">
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={pilihFotoProfil} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100" />
          <p className="mt-2 text-xs text-slate-500">Format JPG, PNG, atau WebP. Maksimal 5 MB.</p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={simpanFotoProfil} disabled={uploadingFoto || !fotoFile} className="px-4 py-2 rounded-xl text-sm font-bold bg-bsi-800 text-white hover:bg-bsi-700 transition disabled:opacity-50">{uploadingFoto ? 'Mengunggah...' : 'Simpan Foto'}</button>
            <button type="button" onClick={function () { setShowUploadFoto(false); setFotoPreview(null); setFotoFile(null) }} className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition">Batal</button>
          </div>
        </div>
      </div>
    </div>
  ) : null}
</section>`
if (ada(FILE_D)) {
  let d = baca(FILE_D)
  if (d.includes('>Foto Profil<')) {
    console.log('[SUDAH ADA] Section foto profil di DashboardPage')
  } else if (d.includes("{tab === 'logbook' ? (")) {
    d = d.replace("{tab === 'logbook' ? (", SECTION_FOTO + '\n' + "{tab === 'logbook' ? (")
    simpan(FILE_D, d)
    console.log('[BERHASIL] Section foto profil dipasang di DashboardPage')
  } else if (d.includes("{tab === 'galeri' ? (")) {
    d = d.replace("{tab === 'galeri' ? (", SECTION_FOTO + '\n' + "{tab === 'galeri' ? (")
    simpan(FILE_D, d)
    console.log('[BERHASIL] Section foto profil dipasang di DashboardPage (anchor galeri)')
  } else {
    console.log('[TIDAK KETEMU] Anchor section foto profil di DashboardPage')
  }
} else {
  console.log('[LEWATI] DashboardPage tidak ditemukan')
}

/* ===== 7. Best effort: ganti lingkaran inisial di kartu publik dan PersonChip dengan Avatar ===== */
const TARGET = ['src/components/cards.jsx', 'src/components/ui.jsx', 'src/pages/PublicPage.jsx', 'src/pages/BerandaPage.jsx']
const regexInisial = /<div\b[^>]*rounded-full[^>]*>\s*\{([^{}]*?\.nama[^{}]*?)\}\s*<\/div>/g
TARGET.forEach(function (rel) {
  if (!ada(rel)) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  let jumlah = 0
  const hasil = isi.replace(regexInisial, function (m, ekspresi) {
    const varMatch = ekspresi.match(/([A-Za-z0-9_]+)\.nama/)
    if (!varMatch) return m
    jumlah++
    const v = varMatch[1]
    return `<Avatar src={${v}.foto_profil || null} nama={${v}.nama} size="lg" />`
  })
  if (jumlah === 0) { console.log('[TIDAK KETEMU] Lingkaran inisial di ' + rel); return }
  let akhir = hasil
  if (rel !== 'src/components/ui.jsx' && !akhir.includes("import { Avatar } from")) {
    const impor = rel.indexOf('/pages/') !== -1 ? "import { Avatar } from '../components/ui.jsx'\n" : "import { Avatar } from './ui.jsx'\n"
    akhir = impor + akhir
  }
  simpan(rel, akhir)
  console.log('[BERHASIL] ' + jumlah + ' lingkaran inisial diganti Avatar di ' + rel)
})

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Pengingat wajib sebelum uji:')
console.log('1. SQL Langkah 1 harus sudah dijalankan: kolom foto_profil, bucket foto-profil, dan keempat policy storage.')
console.log('2. Bila query mahasiswa di DashboardPage memilih kolom tertentu, pastikan foto_profil ikut dipilih.')
console.log('')
console.log('Langkah uji:')
console.log('1. Login sebagai mahasiswa, lihat section Foto Profil di bagian atas dashboard.')
console.log('2. Klik Upload Foto, pilih JPG atau PNG di bawah 5 MB, pratinjau muncul, lalu Simpan Foto.')
console.log('3. Avatar besar langsung berubah menjadi foto kamu tanpa reload halaman.')
console.log('4. Buka halaman publik: kartu mahasiswa menampilkan foto, bukan lingkaran inisial.')
console.log('5. Klik Hapus Foto untuk menguji penghapusan; avatar kembali ke inisial berwarna tema.')
console.log('6. Foto tersimpan di bucket foto-profil dengan pola folder sesuai id user, aman per pengguna.')