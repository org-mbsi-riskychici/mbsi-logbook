const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai menyusun ulang grid statistik menjadi 2 kolom di mobile dan merapatkan kepala halaman Tim & Dospem serta Daftar Hadir...')
console.log('')

const GRID_LAMA_1 = '<div className="mt-6 grid gap-3 sm:mt-8 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">'
const GRID_LAMA_2 = '<div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">'
const GRID_BARU = '<div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-4 xl:grid-cols-4">'

const REPL = [
  {
    file: 'src/pages/DospemPage.jsx',
    items: [
      { olds: ['p-8 lg:p-12'], baru: 'p-5 sm:p-8 lg:p-12', label: 'Padding hero dospem rapat di mobile' },
      { olds: ['text-3xl lg:text-5xl'], baru: 'text-2xl sm:text-3xl lg:text-5xl', label: 'Judul hero dospem mengecil di mobile' },
      { olds: [GRID_LAMA_1, GRID_LAMA_2], baru: GRID_BARU, label: 'Grid statistik dospem menjadi 2 kolom sejak mobile' },
      { olds: ['rounded-[1.5rem] bg-white/10 p-5'], baru: 'rounded-2xl bg-white/10 p-4 sm:rounded-[1.5rem] sm:p-5', label: 'Kartu statistik hero dospem kompak di mobile' },
      { olds: ['text-sm text-white/70'], baru: 'text-xs sm:text-sm text-white/70', label: 'Label statistik hero dospem mengecil di mobile' },
      { olds: ['mt-1 text-3xl font-black'], baru: 'mt-1 text-2xl sm:text-3xl font-black', label: 'Angka statistik hero dospem mengecil di mobile' }
    ]
  },
  {
    file: 'src/pages/AttendancePage.jsx',
    items: [
      { olds: ['p-8 lg:p-10'], baru: 'p-5 sm:p-8 lg:p-10', label: 'Padding kepala daftar hadir rapat di mobile' },
      { olds: ['text-3xl lg:text-4xl'], baru: 'text-2xl sm:text-3xl lg:text-4xl', label: 'Judul kepala daftar hadir mengecil di mobile' },
      { olds: [GRID_LAMA_1, GRID_LAMA_2], baru: GRID_BARU, label: 'Grid statistik daftar hadir menjadi 2 kolom sejak mobile' }
    ]
  },
  {
    file: 'src/components/ui.jsx',
    items: [
      { olds: ["cardCls + ' p-5 sm:p-6'", "cardCls + ' p-6'"], baru: "cardCls + ' p-4 sm:p-6'", label: 'Padding StatCard rapat di mobile' },
      { olds: ['<p className="text-sm text-slate-500">{props.label}</p>'], baru: '<p className="text-xs sm:text-sm text-slate-500">{props.label}</p>', label: 'Label StatCard mengecil di mobile' },
      { olds: ['mt-2 text-3xl font-black text-bsi-900'], baru: 'mt-2 text-2xl sm:text-3xl font-black text-bsi-900', label: 'Angka StatCard mengecil di mobile' },
      { olds: ['<p className="mt-1 text-xs text-slate-500">{props.sub}</p>'], baru: '<p className="mt-1 text-[11px] leading-snug sm:text-xs text-slate-500">{props.sub}</p>', label: 'Keterangan StatCard mengecil di mobile' }
    ]
  },
  {
    file: 'src/components/Skeleton.jsx',
    items: [
      { olds: ['bg-white rounded-3xl border border-slate-200 shadow-sm p-6'], baru: 'bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6', label: 'SkeletonStatCard mengikuti padding baru' }
    ]
  }
]

for (let f = 0; f < REPL.length; f++) {
  const rel = REPL[f].file
  if (!ada(rel)) {
    console.log('[GAGAL] ' + rel + ' tidak ditemukan')
    continue
  }
  let isi = baca(rel)
  let berubah = false
  const items = REPL[f].items
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    let kena = 0
    for (let o = 0; o < item.olds.length; o++) {
      const lama = item.olds[o]
      if (isi.indexOf(lama) === -1) continue
      kena = isi.split(lama).length - 1
      isi = isi.split(lama).join(item.baru)
      break
    }
    if (kena > 0) {
      berubah = true
      console.log('[BERHASIL] ' + rel + ': ' + item.label + ' (' + kena + ' lokasi)')
    } else if (isi.indexOf(item.baru) !== -1) {
      console.log('[SUDAH ADA] ' + rel + ': ' + item.label)
    } else {
      console.log('[TIDAK KETEMU] ' + rel + ': ' + item.label)
    }
  }
  if (berubah) simpan(rel, isi)
}

/* ===== Verifikasi ===== */
console.log('')
console.log('Verifikasi:')
const d2 = ada('src/pages/DospemPage.jsx') ? baca('src/pages/DospemPage.jsx') : ''
const a2 = ada('src/pages/AttendancePage.jsx') ? baca('src/pages/AttendancePage.jsx') : ''
const u2 = ada('src/components/ui.jsx') ? baca('src/components/ui.jsx') : ''
const s2 = ada('src/components/Skeleton.jsx') ? baca('src/components/Skeleton.jsx') : ''
console.log((d2.indexOf(GRID_BARU) !== -1 ? '[OK] ' : '[BELUM] ') + 'Grid statistik dospem 2 kolom di mobile')
console.log((d2.indexOf('rounded-2xl bg-white/10 p-4 sm:rounded-[1.5rem] sm:p-5') !== -1 ? '[OK] ' : '[BELUM] ') + 'Kartu statistik hero dospem kompak')
console.log((d2.indexOf('text-xs sm:text-sm text-white/70') !== -1 ? '[OK] ' : '[BELUM] ') + 'Label statistik hero dospem mengecil')
console.log((a2.indexOf(GRID_BARU) !== -1 ? '[OK] ' : '[BELUM] ') + 'Grid statistik daftar hadir 2 kolom di mobile')
console.log((a2.indexOf('p-5 sm:p-8 lg:p-10') !== -1 ? '[OK] ' : '[BELUM] ') + 'Padding kepala daftar hadir rapat di mobile')
console.log((u2.indexOf("cardCls + ' p-4 sm:p-6'") !== -1 ? '[OK] ' : '[BELUM] ') + 'Padding StatCard rapat di mobile')
console.log((u2.indexOf('text-xs sm:text-sm text-slate-500">{props.label}') !== -1 ? '[OK] ' : '[BELUM] ') + 'Label StatCard mengecil di mobile')
console.log((u2.indexOf('text-[11px] leading-snug sm:text-xs') !== -1 ? '[OK] ' : '[BELUM] ') + 'Keterangan StatCard mengecil di mobile')
console.log((s2.indexOf('shadow-sm p-4 sm:p-6') !== -1 ? '[OK] ' : '[BELUM] ') + 'SkeletonStatCard mengikuti padding baru')

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Penyesuaian yang diterapkan:')
console.log('1. Grid empat statistik di hero Tim & Dospem dan di kepala Daftar Hadir kini memakai grid-cols-2 sejak lebar terkecil dengan gap 10px, jadi keempat kartu tersusun 2 baris isi 2 kartu seperti permintaanmu, bukan menumpuk satu kolom yang membuat kepala halaman setinggi layar penuh. Di 1280px ke atas kembali menjadi 4 kolom satu baris, dan di rentang tablet tetap 2 kolom seperti sebelumnya.')
console.log('2. Jarak atas grid dirapatkan menjadi 20px di mobile supaya judul dan angka menyatu sebagai satu blok kepala yang padat, lalu kembali 32px di tablet ke atas.')
console.log('3. Kartu statistik hero dospem dirapatkan untuk lebar setengah: padding 16px, sudut 16px, label 12px, dan angka 24px, sehingga kartu setengah lebar tidak terasa kosong dan tinggi tiap kartu turun drastis.')
console.log('4. StatCard putih milik Daftar Hadir dan Beranda ikut dirapatkan: padding mobile 16px, label 12px, angka 24px, dan keterangan 11px dengan baris rapat, jadi teks seperti Total catatan hadir atau Dengan keterangan muat rapi di kartu setengah lebar tanpa membungkus liar.')
console.log('5. SkeletonStatCard mengikuti padding baru supaya ukuran saat memuat sama dengan ukuran akhir, tidak ada lompatan tata letak ketika data masuk.')
console.log('6. Pengaman ukuran header dipasang ulang di kedua halaman tersebut: padding kartu kepala 20px dan judul 24px di mobile. Bila script perbaikan header sebelumnya sudah dijalankan, bagian ini otomatis dilaporkan SUDAH ADA dan tidak ditimpa.')
console.log('7. Seluruh perubahan memakai kelas dasar yang ditimpa oleh varian sm: dan xl:, sehingga tampilan tablet dan desktop identik dengan sebelumnya.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman Tim & Dospem di ponsel: empat statistik tampil 2 kartu per baris dalam 2 baris, tinggi hero kira kira separuh sebelumnya, dan tombol Lihat logbook langsung terlihat tanpa gulir jauh.')
console.log('2. Buka halaman Daftar Hadir di ponsel: kartu kepala langsung menampilkan 2x2 statistik Masuk, Izin, Bolos, dan total, sehingga FilterBar terlihat di layar pertama.')
console.log('3. Buka Beranda di ponsel: tiga StatCard di bawah hero ikut lebih rapat dan konsisten dengan bahasa ukuran yang baru.')
console.log('4. Perhatikan kondisi memuat: kartu skeleton berukuran sama dengan kartu akhir sehingga tidak ada lompatan saat data selesai diambil.')
console.log('5. Lebarkan jendela ke 640px: padding dan huruf kembali ke ukuran tablet, grid tetap 2 kolom dengan gap 16px.')
console.log('6. Lebarkan ke 1280px: keempat statistik kembali sejajar satu baris persis seperti tampilan desktop sebelumnya.')
console.log('7. Aktifkan mode gelap: hanya ukuran yang berubah, seluruh warna kartu statistik aman seperti biasa.')