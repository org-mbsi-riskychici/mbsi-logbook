const fs = require('fs')
const path = require('path')

const root = process.cwd()
const FILE = 'src/components/ui.jsx'

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
    console.log('[TIDAK KETEMU] ' + label)
    return
  }
  isi = isi.replace(cari, gantiDengan)
  simpan(FILE, isi)
  console.log('[BERHASIL] ' + label)
}

if (!fs.existsSync(path.join(root, FILE))) {
  console.log('File ' + FILE + ' tidak ditemukan. Jalankan script ini di root project.')
  process.exit(1)
}

console.log('Mulai menerapkan pengunci scroll latar belakang modal...')
console.log('')

/* ===== 1. Tambahkan hook useBodyScrollLock setelah baris import ===== */
let isi = baca(FILE)
if (isi.includes('function useBodyScrollLock')) {
  console.log('[SUDAH ADA] Hook useBodyScrollLock')
} else {
  const HOOK = `
function useBodyScrollLock(active) {
  useEffect(function () {
    if (!active) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return function () {
      document.body.style.overflow = previous
    }
  }, [active])
}
`
  const duaBaris = `import { useEffect, useRef } from 'react'
import { SizedIcon } from './icons.jsx'`
  const satuBaris = `import { SizedIcon } from './icons.jsx'`
  if (isi.includes(duaBaris)) {
    isi = isi.replace(duaBaris, duaBaris + HOOK)
    simpan(FILE, isi)
    console.log('[BERHASIL] Hook useBodyScrollLock ditambahkan')
  } else if (isi.includes(satuBaris)) {
    isi = isi.replace(satuBaris, `import { useEffect, useRef } from 'react'
import { SizedIcon } from './icons.jsx'` + HOOK)
    simpan(FILE, isi)
    console.log('[BERHASIL] Import react dan hook useBodyScrollLock ditambahkan')
  } else {
    console.log('[TIDAK KETEMU] Baris import ui.jsx untuk menyisipkan hook')
  }
}

/* ===== 2. Modal mengunci scroll latar ===== */
ganti(
  `export function Modal(props) {
  if (!props.open) return null`,
  `export function Modal(props) {
  useBodyScrollLock(props.open)
  if (!props.open) return null`,
  'Modal mengunci scroll latar'
)

/* ===== 3. ConfirmModal mengunci scroll latar ===== */
ganti(
  `export function ConfirmModal(props) {
  if (!props.open) return null`,
  `export function ConfirmModal(props) {
  useBodyScrollLock(props.open)
  if (!props.open) return null`,
  'ConfirmModal mengunci scroll latar'
)

/* ===== 4. Lapisan Modal memakai overscroll-contain ===== */
ganti(
  `    <div className="anim-overlay fixed inset-0 z-[60] overflow-y-auto bg-slate-900/60 p-4" onClick={props.onClose}>`,
  `    <div className="anim-overlay fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-slate-900/60 p-4" onClick={props.onClose}>`,
  'Lapisan Modal memakai overscroll-contain'
)

/* ===== 5. Lapisan ConfirmModal memakai overscroll-contain ===== */
ganti(
  `    <div className="anim-overlay fixed inset-0 z-[70] overflow-y-auto bg-slate-900/60 p-4" onClick={props.onCancel}>`,
  `    <div className="anim-overlay fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-slate-900/60 p-4" onClick={props.onCancel}>`,
  'Lapisan ConfirmModal memakai overscroll-contain'
)

console.log('')
console.log('Selesai. Uji dengan membuka modal detail lalu mencoba menggulir latar belakangnya.')
console.log('Halaman harus terkunci, dan kembali normal setelah modal ditutup.')