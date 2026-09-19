#!/usr/bin/env node
/*
 * pasang-guard-edit.cjs
 * Menambahkan modal konfirmasi sebelum tombol Edit menimpa form yang belum disimpan.
 * Aman dijalankan ulang (idempoten) dan tidak menulis file bila penanda tidak cocok.
 *
 * Pakai (dari root proyek):  node pasang-guard-edit.cjs
 */
const fs = require('fs')
const path = require('path')

const REL = path.join('src', 'pages', 'DashboardPage.jsx')
const p = path.resolve(process.cwd(), REL)
if (!fs.existsSync(p)) { console.error('✗ File tidak ditemukan: ' + REL); process.exit(1) }

let isi = fs.readFileSync(p, 'utf8')
isi = isi.replace(/\r\n/g, '\n')

if (isi.indexOf('konfirmasiEdit') !== -1) {
  console.log('= Guard tombol Edit sudah terpasang, tidak ada yang diubah.')
  process.exit(0)
}

const masalah = []
const adaGuardLama = isi.indexOf('function isLogbookDirty') !== -1
const cekLog = adaGuardLama ? 'isLogbookDirty()' : 'logbookKotor()'
const cekGal = adaGuardLama ? 'isGaleriDirty()' : 'galeriKotor()'
const cekHadir = adaGuardLama ? 'isHadirDirty()' : 'hadirKotor()'

const PEMERIKSA = [
  'function logbookKotor() {',
  '  if (editLogId) return true',
  '  return !!(form.judul || form.kategori || form.unit || form.kendala || form.solusi || form.pembelajaran ||',
  '    items.some(function (it) { return it.judul || it.deskripsi || it.hasil || it.file }))',
  '}',
  'function galeriKotor() {',
  '  if (editGalId) return true',
  '  return !!(galForm.judul || galForm.deskripsi || galForm.kegiatan || galForm.file || galYtLink || galDriveLink)',
  '}',
  'function hadirKotor() {',
  '  if (editHadirId) return true',
  '  return hadirForm.status !== \'Masuk\' || !!hadirForm.alasan',
  '}',
  ''
].join('\n')

function bungkus(nama, param, cek, judulDom) {
  return [
    'function ' + nama + '(' + param + ') {',
    '  if (' + cek + ') {',
    '    setKonfirmasiEdit({',
    '      judul: \'Timpa draf ' + judulDom + '?\',',
    '      pesan: \'Isian form ' + judulDom + ' yang belum disimpan akan hilang dan diganti dengan data ' + judulDom + ' yang kamu pilih.\',',
    '      aksi: function () { lakukan' + nama.charAt(0).toUpperCase() + nama.slice(1) + '(' + param + ') }',
    '    })',
    '    return',
    '  }',
    '  lakukan' + nama.charAt(0).toUpperCase() + nama.slice(1) + '(' + param + ')',
    '}',
    ''
  ].join('\n')
}

/* 1) state modal konfirmasi */
const reState = /([ \t]*)const \[pendingDelete, setPendingDelete\] = useState\(null\)/
if (!reState.test(isi)) masalah.push('state pendingDelete tidak ditemukan')

/* 2) tiga fungsi startEdit */
const reLog = /([ \t]*)function startEditLog\(log\) \{/
const reGal = /([ \t]*)function startEditGal\(g\) \{/
const reHad = /([ \t]*)function startEditHadir\(h\) \{/
if (!reLog.test(isi)) masalah.push('function startEditLog tidak ditemukan')
if (!reGal.test(isi)) masalah.push('function startEditGal tidak ditemukan')
if (!reHad.test(isi)) masalah.push('function startEditHadir tidak ditemukan')

/* 3) anchor ConfirmModal setelah modal hapus */
const reModal = /([ \t]*)onConfirm=\{executeDelete\}\s*\n[ \t]*\/>/
if (!reModal.test(isi)) masalah.push('ConfirmModal pendingDelete tidak ditemukan')

if (masalah.length) {
  console.error('✗ GAGAL, file tidak diubah. Penanda tidak cocok:')
  masalah.forEach(function (x) { console.error('  - ' + x) })
  process.exit(1)
}

isi = isi.replace(reState, function (m, ind) {
  return m + '\n' + ind + 'const [konfirmasiEdit, setKonfirmasiEdit] = useState(null)'
})

isi = isi.replace(reLog, function (m, ind) {
  const pemeriksa = adaGuardLama ? '' : PEMERIKSA.split('\n').map(function (l) { return l ? ind + l : '' }).join('\n') + '\n'
  return pemeriksa + ind + bungkus('startEditLog', 'log', cekLog, 'logbook').split('\n').map(function (l) { return l ? ind + l : '' }).join('\n') + '\n' + ind + 'function lakukanStartEditLog(log) {'
})
isi = isi.replace(reGal, function (m, ind) {
  return ind + bungkus('startEditGal', 'g', cekGal, 'galeri').split('\n').map(function (l) { return l ? ind + l : '' }).join('\n') + '\n' + ind + 'function lakukanStartEditGal(g) {'
})
isi = isi.replace(reHad, function (m, ind) {
  return ind + bungkus('startEditHadir', 'h', cekHadir, 'daftar hadir').split('\n').map(function (l) { return l ? ind + l : '' }).join('\n') + '\n' + ind + 'function lakukanStartEditHadir(h) {'
})

isi = isi.replace(reModal, function (m, ind) {
  const modal = [
    '<ConfirmModal',
    '  open={!!konfirmasiEdit}',
    '  title={konfirmasiEdit ? konfirmasiEdit.judul : \'\'}',
    '  message={konfirmasiEdit ? konfirmasiEdit.pesan : \'\'}',
    '  confirmLabel="Ya, Timpa"',
    '  icon="trash"',
    '  tone="bahaya"',
    '  onCancel={function () { setKonfirmasiEdit(null) }}',
    '  onConfirm={function () { const aksi = konfirmasiEdit ? konfirmasiEdit.aksi : null; setKonfirmasiEdit(null); if (aksi) aksi() }}',
    '/>'
  ].map(function (l) { return ind + l }).join('\n')
  return m + '\n' + modal
})

const cekAkhir = ['konfirmasiEdit', 'lakukanStartEditLog', 'lakukanStartEditGal', 'lakukanStartEditHadir', 'open={!!konfirmasiEdit}']
const kurang = cekAkhir.filter(function (t) { return isi.indexOf(t) === -1 })
if (kurang.length) { console.error('✗ Verifikasi gagal: ' + kurang.join(', ')); process.exit(1) }

fs.writeFileSync(p + '.bak', fs.readFileSync(p, 'utf8'), 'utf8')
fs.writeFileSync(p, isi, 'utf8')
console.log('✓ SELESAI: konfirmasi tombol Edit terpasang di DashboardPage.jsx (backup: DashboardPage.jsx.bak)')
console.log('  - Edit logbook, Edit galeri, dan Edit daftar hadir kini mengecek draf belum disimpan.')
console.log('  - Bila form masih kosong/bersih, tombol Edit tetap langsung bekerja seperti biasa.')