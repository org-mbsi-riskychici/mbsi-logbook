const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_D = 'src/pages/DashboardPage.jsx'
if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
  process.exit(1)
}
let d = fs.readFileSync(path.join(root, FILE_D), 'utf8').replace(/\r\n/g, '\n')
const MARK = "toast.sukses('Data berhasil dihapus')"

console.log('Mulai memasang toast sukses hapus data (versi 2, target executeDelete)...')
console.log('')

if (d.includes(MARK)) {
  console.log('[SUDAH ADA] Toast sukses hapus data')
} else {
  let pasang = false

  /* Cara 1: masuk ke fungsi executeDelete, sisip setelah await refresh() pertama di dalamnya */
  const mulai = d.indexOf('async function executeDelete')
  if (mulai !== -1) {
    const idxRefresh = d.indexOf('await refresh()', mulai)
    if (idxRefresh !== -1) {
      const akhirBaris = d.indexOf('\n', idxRefresh)
      const awalBaris = d.lastIndexOf('\n', idxRefresh) + 1
      const spasi = d.slice(awalBaris, idxRefresh).match(/^([ \t]*)/)[1]
      d = d.slice(0, akhirBaris) + '\n' + spasi + MARK + d.slice(akhirBaris)
      pasang = true
      console.log('[BERHASIL] Toast sukses disisipkan setelah await refresh() di dalam executeDelete')
    } else {
      console.log('[INFO] executeDelete ketemu tetapi tidak ada await refresh() di dalamnya')
    }
  } else {
    console.log('[INFO] Fungsi executeDelete tidak ketemu, coba pola cadangan')
  }

  /* Cara 2: pola cadangan lewat cabang hapus daftar hadir */
  if (!pasang) {
    const re = /(await supabase\.from\('daftar_hadir'\)\.delete\(\)\.eq\('id', target\.data\.id\)\n[ \t]*\}\n([ \t]*)await refresh\(\))/
    if (re.test(d)) {
      d = d.replace(re, function (m, semua, spasiRef) { return semua + '\n' + spasiRef + MARK })
      pasang = true
      console.log('[BERHASIL] Toast sukses disisipkan lewat pola cabang daftar hadir')
    }
  }

  if (!pasang) {
    console.log('[TIDAK KETEMU] Pola executeDelete maupun cabang hapus daftar hadir')
    console.log('Kirim cuplikan fungsi executeDelete dari DashboardPage.jsx ke chat supaya dikunci manual.')
  } else {
    fs.writeFileSync(path.join(root, FILE_D), d, 'utf8')
  }
}

/* Verifikasi */
d = fs.readFileSync(path.join(root, FILE_D), 'utf8')
console.log('')
console.log('Verifikasi:')
console.log((d.includes(MARK) ? '[OK] ' : '[BELUM] ') + 'Toast sukses hapus data')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard, hapus salah satu logbook, media galeri, atau catatan hadir lewat modal konfirmasi.')
console.log('2. Setelah data hilang dari daftar, toast hijau Data berhasil dihapus muncul di pojok kanan atas.')
console.log('3. Toast otomatis hilang setelah 4 detik atau bisa ditutup manual.')