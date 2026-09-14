const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai menata ulang tab Profil agar tidak duplikat...')
console.log('')

/* ===== 1. ui.jsx: tambah ukuran 2xl pada Avatar ===== */
const FILE_U = 'src/components/ui.jsx'
let u = baca(FILE_U)
if (u.includes("size === '2xl'")) {
  console.log('[SUDAH ADA] Ukuran 2xl pada Avatar')
} else {
  const cariU = `size === 'xl' ? 'h-24 w-24 text-2xl' : 'h-11 w-11 text-sm'`
  if (u.includes(cariU)) {
    u = u.replace(cariU, `size === 'xl' ? 'h-24 w-24 text-2xl' : size === '2xl' ? 'h-40 w-40 text-4xl' : 'h-11 w-11 text-sm'`)
    simpan(FILE_U, u)
    console.log('[BERHASIL] Ukuran 2xl ditambahkan pada Avatar')
  } else {
    console.log('[TIDAK KETEMU] Pola ukuran Avatar di ui.jsx')
  }
}

/* ===== 2. DashboardPage: ganti isi tab Profil dengan tata letak dua kolom ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
let d = baca(FILE_D)
const mulaiProfil = d.indexOf("{tab === 'profil' ? (")
if (mulaiProfil === -1) {
  console.log('[TIDAK KETEMU] Blok tab Profil di DashboardPage')
} else {
  const akhirSection = d.indexOf('</section>', mulaiProfil)
  const akhirBlok = d.indexOf(') : null}', akhirSection)
  if (akhirSection === -1 || akhirBlok === -1) {
    console.log('[TIDAK KETEMU] Batas akhir blok tab Profil')
  } else {
    const BLOK_BARU = `{tab === 'profil' ? (
<section className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] items-start">
<div className="card-hover rounded-[2rem] bg-white border border-slate-200 p-8 shadow-sm flex flex-col items-center text-center">
<Avatar src={mahasiswa.foto_profil || null} nama={mahasiswa.nama} size="2xl" />
<h2 className="mt-4 text-xl font-black text-slate-900">{mahasiswa.nama}</h2>
<p className="mt-1 text-sm text-slate-500">NIM {mahasiswa.nim}</p>
<p className="text-sm text-slate-500">{mahasiswa.prodi}</p>
<div className="mt-5 flex flex-wrap justify-center gap-2">
<button type="button" onClick={function () { setShowUploadFoto(!showUploadFoto) }} className="px-4 py-2 rounded-xl text-sm font-bold bg-bsi-800 text-white hover:bg-bsi-700 transition">{mahasiswa.foto_profil ? 'Ganti Foto' : 'Upload Foto'}</button>
{mahasiswa.foto_profil ? <button type="button" onClick={hapusFotoProfilKu} className="px-4 py-2 rounded-xl text-sm font-bold bg-red-50 text-red-700 hover:bg-red-100 transition">Hapus Foto</button> : null}
</div>
{showUploadFoto ? (
<div className="mt-5 w-full border-t border-slate-200 pt-5 text-left">
<div className="flex flex-wrap items-start gap-4">
{fotoPreview ? <img src={fotoPreview} alt="Pratinjau foto profil" className="h-20 w-20 rounded-full object-cover border-2 border-white shadow-md" /> : null}
<div className="min-w-0 flex-1">
<input type="file" accept="image/png,image/jpeg,image/webp" onChange={pilihFotoProfil} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100" />
<p className="mt-2 text-xs text-slate-500">Format JPG, PNG, atau WebP. Maksimal 5 MB.</p>
</div>
</div>
<div className="mt-4 flex gap-2">
<button type="button" onClick={simpanFotoProfil} disabled={uploadingFoto || !fotoFile} className="px-4 py-2 rounded-xl text-sm font-bold bg-bsi-800 text-white hover:bg-bsi-700 transition disabled:opacity-50">{uploadingFoto ? 'Mengunggah...' : 'Simpan Foto'}</button>
<button type="button" onClick={function () { setShowUploadFoto(false); setFotoPreview(null); setFotoFile(null) }} className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition">Batal</button>
</div>
</div>
) : null}
</div>
<div className="card-hover rounded-[2rem] bg-white border border-slate-200 p-8 shadow-sm">
<h2 className="text-lg font-black text-slate-900">Ringkasan aktivitas magang</h2>
<div className="mt-4 grid grid-cols-3 gap-4">
<div className="rounded-2xl bg-slate-50 p-4 text-center"><p className="text-2xl font-black text-bsi-800">{typeof logs !== 'undefined' ? logs.length : 0}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Logbook</p></div>
<div className="rounded-2xl bg-slate-50 p-4 text-center"><p className="text-2xl font-black text-bsi-800">{typeof galeri !== 'undefined' ? galeri.length : 0}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Media Galeri</p></div>
<div className="rounded-2xl bg-slate-50 p-4 text-center"><p className="text-2xl font-black text-bsi-800">{typeof hadir !== 'undefined' ? hadir.length : 0}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Kehadiran</p></div>
</div>
<div className="mt-6 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
<p>Foto profil tampil otomatis di kartu kamu pada halaman publik, logbook, galeri, dan daftar hadir.</p>
<p>Gunakan foto dengan pencahayaan baik dan wajah terlihat jelas agar mudah dikenali dosen pembimbing.</p>
<p>Klik foto pada kartu header kapan saja untuk kembali ke halaman ini dan memperbarui foto.</p>
</div>
</div>
</section>
) : null}`
    d = d.slice(0, mulaiProfil) + BLOK_BARU + d.slice(akhirBlok + ') : null}'.length)
    simpan(FILE_D, d)
    console.log('[BERHASIL] Tab Profil ditata ulang menjadi dua kolom')
  }
}

/* ===== 3. DashboardPage: avatar header menjadi tombol pintasan ke tab Profil ===== */
d = baca(FILE_D)
const avatarHeader = `<Avatar src={mahasiswa.foto_profil || null} nama={mahasiswa.nama} size="xl" />`
if (d.includes('title="Kelola foto profil"')) {
  console.log('[SUDAH ADA] Avatar header sebagai tombol pintasan')
} else if (d.includes(avatarHeader)) {
  d = d.replace(avatarHeader,
    `<button type="button" onClick={function () { setTab('profil') }} title="Kelola foto profil" className="rounded-full transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-gold-300">
<Avatar src={mahasiswa.foto_profil || null} nama={mahasiswa.nama} size="xl" />
</button>`)
  simpan(FILE_D, d)
  console.log('[BERHASIL] Avatar header kini bisa diklik menuju tab Profil')
} else {
  console.log('[TIDAK KETEMU] Avatar pada kartu header')
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Hasil akhir yang akan kamu lihat:')
console.log('1. Header tetap ringkas: avatar, nama, NIM, prodi, dan deretan tab tanpa section duplikat di bawahnya.')
console.log('2. Klik avatar di header langsung membuka tab Profil, jadi jalur ganti foto terasa alami.')
console.log('3. Tab Profil menampilkan foto besar sebagai pusat perhatian beserta tombol Ganti atau Upload dan Hapus.')
console.log('4. Form upload muncul di dalam kartu foto yang sama, lengkap dengan pratinjau bulat dan tombol Simpan atau Batal.')
console.log('5. Kolom kanan memberi nilai tambah berupa ringkasan jumlah logbook, media galeri, dan kehadiran plus panduan foto.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard: tidak ada lagi kartu Foto Profil duplikat di bawah header.')
console.log('2. Klik avatar di header: tab Profil terbuka otomatis.')
console.log('3. Klik Upload atau Ganti Foto: form muncul rapi di bawah tombol dalam kartu yang sama.')
console.log('4. Simpan foto: avatar besar, avatar header, dan seluruh kartu publik langsung memakai foto baru.')
console.log('5. Hapus foto: semua permukaan kembali ke inisial berwarna tema tanpa sisa tampilan rusak.')