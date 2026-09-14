const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_D = 'src/pages/DashboardPage.jsx'
if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
  process.exit(1)
}
let d = fs.readFileSync(path.join(root, FILE_D), 'utf8').replace(/\r\n/g, '\n')

console.log('Mulai memasang toast sukses hapus data...')
console.log('')

const MARK = "toast.sukses('Data berhasil dihapus')"
if (d.includes(MARK)) {
  console.log('[SUDAH ADA] Toast sukses hapus data')
} else {
  // Cari pola: await refresh() yang berada di dalam fungsi executeConfirm
  // lalu sisipkan toast.sukses tepat setelah await refresh()
  const regex = /(await refresh\(\)\n)([\s\S]*?)(function confirmInfo)/
  const match = d.match(regex)
  if (match) {
    // Cek apakah blok antara await refresh() dan function confirmInfo 
    // tidak sudah mengandung toast sukses
    const blokAntara = match[2]
    if (!blokAntara.includes('toast.sukses')) {
      // Ambil indentasi dari baris await refresh()
      const barisRefresh = d.substring(d.lastIndexOf('\n', d.indexOf(match[0])) + 1, d.indexOf(match[0]) + match[1].length)
      const spasi = barisRefresh.match(/^(\s*)/)[1]
      
      d = d.replace(regex, '$1' + spasi + "toast.sukses('Data berhasil dihapus')\n$2$3")
      fs.writeFileSync(path.join(root, FILE_D), d, 'utf8')
      console.log('[BERHASIL] Toast sukses hapus data dipasang')
    }
  } else {
    // Fallback: cari await refresh() terakhir sebelum confirmInfo
    const idxConfirm = d.indexOf('function confirmInfo')
    if (idxConfirm !== -1) {
      const bagianAtas = d.substring(0, idxConfirm)
      const idxRefresh = bagianAtas.lastIndexOf('await refresh()')
      if (idxRefresh !== -1) {
        const akhirBaris = d.indexOf('\n', idxRefresh)
        const awalBaris = d.lastIndexOf('\n', idxRefresh) + 1
        const spasi = d.substring(awalBaris, idxRefresh).match(/^(\s*)/)[1]
        d = d.substring(0, akhirBaris) + '\n' + spasi + "toast.sukses('Data berhasil dihapus')" + d.substring(akhirBaris)
        fs.writeFileSync(path.join(root, FILE_D), d, 'utf8')
        console.log('[BERHASIL] Toast sukses hapus data dipasang (fallback)')
      } else {
        console.log('[TIDAK KETEMU] Pola await refresh() sebelum confirmInfo')
      }
    } else {
      console.log('[TIDAK KETEMU] function confirmInfo di DashboardPage')
    }
  }
}

// Verifikasi
d = fs.readFileSync(path.join(root, FILE_D), 'utf8')
console.log('')
console.log('Verifikasi:')
console.log((d.includes(MARK) ? '[OK] ' : '[BELUM] ') + 'Toast sukses hapus data')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')