const fs = require('fs')
const path = require('path')

const root = process.cwd()

function baca(file) {
  return fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n')
}

function simpan(file, isi) {
  fs.writeFileSync(path.join(root, file), isi, 'utf8')
}

function ada(file) {
  return fs.existsSync(path.join(root, file))
}

function ganti(file, cari, gantiDengan, label) {
  if (!ada(file)) {
    console.log('[LEWATI] File tidak ditemukan: ' + file)
    return
  }
  let isi = baca(file)
  if (isi.includes(gantiDengan)) {
    console.log('[SUDAH ADA] ' + label)
    return
  }
  if (!isi.includes(cari)) {
    console.log('[TIDAK KETEMU] ' + label + ' di ' + file)
    return
  }
  isi = isi.replace(cari, gantiDengan)
  simpan(file, isi)
  console.log('[BERHASIL] ' + label)
}

const FILE_TARGET = 'src/pages/DashboardPage.jsx'

if (!ada(FILE_TARGET)) {
  console.log('Jalankan script ini di root project (folder yang berisi folder src).')
  process.exit(1)
}

const dash = baca(FILE_TARGET)
if (!dash.includes('pendingDelete')) {
  console.log('[PERINGATAN] Paket modal konfirmasi hapus sebelumnya sepertinya belum diterapkan.')
  console.log('Jalankan dulu apply-confirm-delete.cjs sebelum script ini.')
  process.exit(1)
}

console.log('Mulai menerapkan konfirmasi hapus gambar pada form...')
console.log('')

ganti(
  FILE_TARGET,
  `                          <button type="button" onClick={function () { removeItemFile(i) }} title="Hapus gambar"`,
  `                          <button type="button" onClick={function () { setPendingDelete({ type: 'media-item', data: i }) }} title="Hapus gambar"`,
  'Tombol silang pratinjau kegiatan memakai konfirmasi'
)

ganti(
  FILE_TARGET,
  `                  <button type="button" onClick={removeGalFile} title="Hapus gambar"`,
  `                  <button type="button" onClick={function () { setPendingDelete({ type: 'media-gal' }) }} title="Hapus gambar"`,
  'Tombol silang pratinjau galeri memakai konfirmasi'
)

ganti(
  FILE_TARGET,
  `  function confirmInfo() {
    if (!pendingDelete) return null
    if (pendingDelete.type === 'log') {`,
  `  function confirmInfo() {
    if (!pendingDelete) return null
    if (pendingDelete.type === 'media-item') {
      return {
        title: 'Hapus gambar?',
        message: 'Lampiran gambar pada kegiatan ini akan dibatalkan. Kamu bisa memilih file lain setelahnya.'
      }
    }
    if (pendingDelete.type === 'media-gal') {
      return {
        title: 'Hapus gambar?',
        message: 'Lampiran gambar pada form galeri akan dibatalkan. Kamu bisa memilih file lain setelahnya.'
      }
    }
    if (pendingDelete.type === 'log') {`,
  'Pesan konfirmasi untuk hapus gambar'
)

ganti(
  FILE_TARGET,
  `  async function executeDelete() {
    if (!pendingDelete) return
    const target = pendingDelete
    setPendingDelete(null)
    if (target.type === 'log') {`,
  `  async function executeDelete() {
    if (!pendingDelete) return
    const target = pendingDelete
    setPendingDelete(null)
    if (target.type === 'media-item') {
      removeItemFile(target.data)
      return
    }
    if (target.type === 'media-gal') {
      setGalForm(function (g) { return Object.assign({}, g, { file: null, preview: '', oldPath: '' }) })
      return
    }
    if (target.type === 'log') {`,
  'Eksekusi konfirmasi untuk hapus gambar'
)

console.log('')
console.log('Selesai. Tombol silang pada pratinjau gambar kini memunculkan modal konfirmasi.')
console.log('Gambar hanya benar-benar dibatalkan jika user menekan tombol Ya, Hapus.')