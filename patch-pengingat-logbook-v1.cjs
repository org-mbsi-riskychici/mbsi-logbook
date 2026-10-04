#!/usr/bin/env node
/* patch-pengingat-logbook-v1.cjs
   Pemakaian: node patch-pengingat-logbook-v1.cjs   (jalankan dari root repo)
   Memasang fitur pengingat logbook terlewat:
   - komponen baru PengingatBanner (banner amber, daftar tanggal + tombol Isi Logbook),
   - Dashboard: banner tampil tiap kali halaman dibuka, tombol tanggal mengisi
     form logbook (dengan konfirmasi bila ada draf), dukungan /dashboard?isi=TANGGAL,
   - /cepat: banner sama, tombolnya membawa ke dashboard dengan tanggal terpasang.
   Aturan: hari kerja Sen-Jum dari MULAI_MAGANG s/d kemarin; Sabtu/Minggu dan
   hari berstatus Izin/Bolos dilewati; hari ini tidak dihitung (belum terlewat).
   Idempoten: bagian yang sudah terpasang akan dilewati. */
const fs = require('fs')
const path = require('path')

const ROOT = process.cwd()
const gagal = []
const catatan = []

function baca(rel) {
  const p = path.join(ROOT, rel)
  if (!fs.existsSync(p)) { gagal.push(rel + ' : file tidak ditemukan'); return null }
  return fs.readFileSync(p, 'utf8')
}
function ganti(rel, src, pola, pengganti, label) {
  if (src == null) return src
  const hasil = src.replace(pola, pengganti)
  if (hasil === src) gagal.push(rel + ' : pola tidak ditemukan -> ' + label)
  return hasil
}
function tulis(rel, isi) {
  fs.writeFileSync(path.join(ROOT, rel), isi, 'utf8')
}

/* ========== 1. Komponen baru: src/components/PengingatBanner.jsx ========== */
const KOMPONEN = `import { useState } from 'react'
import { SizedIcon } from './icons.jsx'
import { formatTanggal } from '../lib/format.js'
import { MULAI_MAGANG } from '../lib/constants.js'

function pad2(n) { return (n < 10 ? '0' : '') + n }
function isoDari(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) }
/* Batas akhir pengingat = kemarin; hari ini belum dianggap terlewat karena masih bisa diisi */
function kemarinIso() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return isoDari(d)
}

/* Daftar hari kerja (Sen-Jum) dari MULAI_MAGANG s/d kemarin yang tidak punya
   logbook dan tidak berstatus Izin/Bolos pada daftar hadir. */
export function hitungTanggalTerlewat(tanggalLogbook, hadir) {
  const punyaLog = new Set(tanggalLogbook || [])
  const absen = new Set()
  ;(hadir || []).forEach(function (h) {
    if (h.status === 'Izin' || h.status === 'Bolos') absen.add(h.tanggal)
  })
  const hasil = []
  const d = new Date(MULAI_MAGANG + 'T00:00:00')
  const batas = new Date(kemarinIso() + 'T00:00:00')
  while (d <= batas) {
    const iso = isoDari(d)
    const hari = d.getDay()
    if (hari !== 0 && hari !== 6 && !punyaLog.has(iso) && !absen.has(iso)) hasil.push(iso)
    d.setDate(d.getDate() + 1)
  }
  return hasil
}

export default function PengingatBanner(props) {
  const [tutup, setTutup] = useState(false)
  const terlewat = hitungTanggalTerlewat(props.tanggalLogbook, props.hadir)
  if (tutup || !terlewat.length) return null
  return (
    <section className="mt-6 rounded-[2rem] border border-amber-200 bg-amber-50 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800">
            <SizedIcon name="clipboard" size={18} />
          </span>
          <div>
            <h2 className="text-base font-black text-amber-800 sm:text-lg">
              {terlewat.length} hari kerja belum punya logbook
            </h2>
            <p className="mt-1 text-xs text-amber-800 sm:text-sm">
              Sabtu-Minggu serta hari berstatus Izin atau Bolos tidak dihitung. Isi logbook untuk tanggal di bawah supaya catatan magangmu lengkap.
            </p>
          </div>
        </div>
        <button type="button" onClick={function () { setTutup(true) }} title="Sembunyikan Pengingat" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200">
          <SizedIcon name="close" size={14} />
        </button>
      </div>
      <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
        {terlewat.map(function (t) {
          return (
            <li key={t} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-white p-3">
              <p className="text-sm font-semibold text-slate-800">{formatTanggal(t)}</p>
              <button type="button" onClick={function () { props.onIsi(t) }} className="rounded-xl bg-bsi-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-bsi-900 sm:text-sm">
                Isi Logbook
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
`

const relKomp = 'src/components/PengingatBanner.jsx'
if (fs.existsSync(path.join(ROOT, relKomp))) {
  catatan.push('LEWATI ' + relKomp + ' (file sudah ada)')
} else {
  tulis(relKomp, KOMPONEN)
  catatan.push('BARU  ' + relKomp)
}

/* ========== 2. src/pages/DashboardPage.jsx ========== */
const EFFECT_ISI = `   useEffect(function () {
     if (!mahasiswa || !dataSiap) return
     const t = searchParams.get('isi')
     if (!t) return
     setSearchParams({}, { replace: true })
     const pesan = pesanTanggalTerlarang(t, batas.min, batas.max)
     if (pesan) { toast.gagal(pesan); return }
     isiLogbookTanggal(t)
   }, [mahasiswa, dataSiap])
`
const HANDLER_ISI = `
   function terapkanIsiTanggal(t) {
     cancelEditLog()
     setForm(function (f) { return Object.assign({}, f, { tanggal: t }) })
     setTab('logbook')
     gulirKeForm(refFormLog)
   }
   function isiLogbookTanggal(t) {
     if (isLogbookDirty()) {
       setKonfirmasiEdit({
         judul: 'Ganti Draf Logbook?',
         pesan: 'Isian form logbook yang belum disimpan akan hilang dan diganti dengan tanggal terlewat yang kamu pilih.',
         aksi: function () { terapkanIsiTanggal(t) }
       })
       return
     }
     terapkanIsiTanggal(t)
   }
`
const BANNER_DASH = `       {dataSiap ? (
         <PengingatBanner
           tanggalLogbook={logs.map(function (l) { return l.tanggal })}
           hadir={hadir}
           onIsi={isiLogbookTanggal}
         />
       ) : null}
`
let dash = baca('src/pages/DashboardPage.jsx')
if (dash != null && dash.indexOf('PengingatBanner') !== -1) {
  catatan.push('LEWATI src/pages/DashboardPage.jsx (sudah ada PengingatBanner)')
  dash = null
} else if (dash != null) {
  dash = ganti('src/pages/DashboardPage.jsx', dash,
    /import \{ useNavigate \} from 'react-router-dom'/,
    "import { useNavigate, useSearchParams } from 'react-router-dom'",
    'import useSearchParams')
  dash = ganti('src/pages/DashboardPage.jsx', dash,
    /(import \{ FilterBar, FilterSelect, TimeFilter, countActiveFilters, SortSelect \} from '\.\.\/components\/FilterBar\.jsx'\n)/,
    "$1import PengingatBanner from '../components/PengingatBanner.jsx'\n",
    'import PengingatBanner')
  dash = ganti('src/pages/DashboardPage.jsx', dash,
    /(const \[konfirmasiEdit, setKonfirmasiEdit\] = useState\(null\)\n)/,
    '$1  const [dataSiap, setDataSiap] = useState(false)\n  const [searchParams, setSearchParams] = useSearchParams()\n',
    'state dataSiap & searchParams')
  dash = ganti('src/pages/DashboardPage.jsx', dash,
    /(setHadir\(h\.data \|\| \[\]\)\n)/,
    '$1    setDataSiap(true)\n',
    'tandai data selesai dimuat')
  dash = ganti('src/pages/DashboardPage.jsx', dash,
    /(document\.removeEventListener\('click', onClickLink, true\)\s*\n\s*\}\s*\n\s*\)\))/,
    '$1\n' + EFFECT_ISI,
    'efek param ?isi=')
  dash = ganti('src/pages/DashboardPage.jsx', dash,
    /(function cancelEditHadir\(\) \{\s*\n\s*setEditHadirId\(null\)\s*\n\s*setHadirForm\(\{ tanggal: todayInput\(\), status: 'Masuk', alasan: '' \}\)\s*\n\s*\})/,
    '$1' + HANDLER_ISI,
    'handler tombol Isi Logbook')
  dash = ganti('src/pages/DashboardPage.jsx', dash,
    /(<\/section>\n)(\s*)(\{tab === 'profil' \?)/,
    '$1' + BANNER_DASH + '$2$3',
    'render banner di bawah header')
  catatan.push('UBAH  src/pages/DashboardPage.jsx (banner + aksi isi tanggal + param ?isi=)')
}

/* ========== 3. src/pages/QuickPage.jsx ========== */
const FETCH_QUICK = `    const pg = await supabase.from('logbooks').select('tanggal').eq('mahasiswa_id', mhs.id)
    const ph = await supabase.from('daftar_hadir').select('tanggal, status').eq('mahasiswa_id', mhs.id)
    setTanggalLogs((pg.data || []).map(function (x) { return x.tanggal }))
    setHadirRows(ph.data || [])
    `
const BANNER_QUICK = `      {!loading ? (
        <PengingatBanner
          tanggalLogbook={tanggalLogs}
          hadir={hadirRows}
          onIsi={function (t) { navigate('/dashboard?isi=' + t) }}
        />
      ) : null}
`
let quick = baca('src/pages/QuickPage.jsx')
if (quick != null && quick.indexOf('PengingatBanner') !== -1) {
  catatan.push('LEWATI src/pages/QuickPage.jsx (sudah ada PengingatBanner)')
  quick = null
} else if (quick != null) {
  quick = ganti('src/pages/QuickPage.jsx', quick,
    /(import \{ SizedIcon \} from '\.\.\/components\/icons\.jsx'\n)/,
    "$1import { useNavigate } from 'react-router-dom'\nimport PengingatBanner from '../components/PengingatBanner.jsx'\n",
    'import navigate & PengingatBanner')
  quick = ganti('src/pages/QuickPage.jsx', quick,
    /(const \[alasan, setAlasan\] = useState\(''\)\n)/,
    '$1  const navigate = useNavigate()\n  const [tanggalLogs, setTanggalLogs] = useState([])\n  const [hadirRows, setHadirRows] = useState([])\n',
    'state data pengingat')
  quick = ganti('src/pages/QuickPage.jsx', quick,
    /(if \(!senyap\) setLoading\(false\))/,
    FETCH_QUICK + '$1',
    'muat tanggal logbook & hadir')
  quick = ganti('src/pages/QuickPage.jsx', quick,
    /(<div className="mx-auto w-full max-w-xl space-y-5">\n)/,
    '$1' + BANNER_QUICK,
    'render banner di atas konten')
  catatan.push('UBAH  src/pages/QuickPage.jsx (banner + tombol ke dashboard)')
}

/* ========== Eksekusi ========== */
if (gagal.length) {
  console.error('PATCH DIBATALKAN (tidak ada file yang ditulis):')
  gagal.forEach(function (g) { console.error('  - ' + g) })
  process.exit(1)
}
if (dash != null) tulis('src/pages/DashboardPage.jsx', dash)
if (quick != null) tulis('src/pages/QuickPage.jsx', quick)
console.log('Patch pengingat logbook selesai:')
catatan.forEach(function (c) { console.log('  ' + c) })
console.log('Silakan jalankan npm run dev untuk verifikasi.')