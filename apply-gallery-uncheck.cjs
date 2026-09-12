const fs = require('fs')
const path = require('path')

const root = process.cwd()
const FILE = 'src/pages/DashboardPage.jsx'

function baca(file) {
  return fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n')
}

function simpan(file, isi) {
  fs.writeFileSync(path.join(root, file), isi, 'utf8')
}

function ganti(cari, gantiDengan, label) {
  let isi = baca(FILE)
  if (isi.includes(gantiDengan)) {
    console.log('[SUDAH ADA] ' + label)
    return
  }
  if (!isi.includes(cari)) {
    console.log('[TIDAK KETEMU] ' + label + ' di ' + FILE)
    return
  }
  isi = isi.replace(cari, gantiDengan)
  simpan(FILE, isi)
  console.log('[BERHASIL] ' + label)
}

if (!fs.existsSync(path.join(root, FILE))) {
  console.log('File ' + FILE + ' tidak ditemukan.')
  console.log('Pastikan script dijalankan di root project (folder yang berisi folder src).')
  process.exit(1)
}

console.log('Mulai menerapkan sinkronisasi centang galeri saat media dihapus...')
console.log('')

/* ===== 1. Matikan centang show_in_gallery saat entri galeri turunan dihapus ===== */
ganti(
  `    } else if (target.type === 'gal') {
      const url = target.data.logbook_item_id ? '' : target.data.media_path
      await supabase.from('galeri').delete().eq('id', target.data.id)
      if (url) await hapusMediaR2(url)
    } else if (target.type === 'hadir') {`,
  `    } else if (target.type === 'gal') {
      const url = target.data.logbook_item_id ? '' : target.data.media_path
      await supabase.from('galeri').delete().eq('id', target.data.id)
      if (target.data.logbook_item_id) {
        await supabase.from('logbook_items').update({ show_in_gallery: false }).eq('id', target.data.logbook_item_id)
      }
      if (url) await hapusMediaR2(url)
    } else if (target.type === 'hadir') {`,
  'Centang galeri dimatikan saat entri galeri turunan dihapus'
)

/* ===== 2. Perjelas pesan konfirmasi hapus galeri turunan ===== */
ganti(
  `      const extra = pendingDelete.data.logbook_item_id
        ? ' Media ini berasal dari logbook, jadi logbook asalnya tidak ikut terhapus.'
        : ''`,
  `      const extra = pendingDelete.data.logbook_item_id
        ? ' Media ini berasal dari logbook, jadi logbook asalnya tidak ikut terhapus. Centang tampilan galeri pada kegiatan logbook akan dimatikan dan bisa dinyalakan lagi kapan saja.'
        : ''`,
  'Pesan konfirmasi hapus galeri diperjelas'
)

console.log('')
console.log('Selesai. Vite akan memuat ulang otomatis.')
console.log('')
console.log('Langkah uji yang disarankan:')
console.log('1. Buat logbook dengan satu foto, centang tampilkan di galeri, lalu simpan.')
console.log('2. Pindah ke tab Galeri, hapus media tersebut, dan konfirmasi.')
console.log('3. Kembali ke tab Logbook dan tekan Edit. Kotak centang harus kosong.')
console.log('4. Centang lagi kotak tersebut, simpan, lalu cek tab Galeri. Media harus muncul kembali.')
console.log('5. Pastikan menyimpan logbook tanpa mengubah apa pun tidak menciptakan ulang entri galeri yang sudah dihapus.')