import { useEffect, useRef, useState } from 'react'
import { SizedIcon } from './icons.jsx'
import { formatTanggal } from '../lib/format.js'
import { MULAI_MAGANG } from '../lib/constants.js'

const HARI_PENDEK = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sept', 'Okt', 'Nov', 'Des']
function formatTanggalMobile(s) {
  if (!s) return ''
  const d = new Date(s + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return s
  return HARI_PENDEK[d.getDay()] + ', ' + d.getDate() + ' ' + BULAN_PENDEK[d.getMonth()] + ' ' + d.getFullYear()
}

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
  const [lihatSemua, setLihatSemua] = useState(false)
  const [buka, setBuka] = useState(false)
  const [keluar, setKeluar] = useState(false)
  const [hilang, setHilang] = useState(false)
  const simpanRef = useRef(null)
  const mentah = hitungTanggalTerlewat(props.tanggalLogbook, props.hadir)
  if (mentah.length && !tutup) simpanRef.current = mentah
  const harusHilang = tutup || !mentah.length
  /* saat menghilang, pakai salinan terakhir supaya isi banner tetap utuh selama animasi keluar */
  const terlewat = mentah.length ? mentah : (simpanRef.current || [])
  /* masuk: wrapper dibiarkan terlipat satu frame lalu dibuka supaya transisi tinggi
     berjalan dan konten di bawah bergeser mulus; keluar: wrapper merapat bersamaan
     dengan isi yang memudar, komponen dilepas setelah keduanya selesai */
  useEffect(function () {
    if (harusHilang) return undefined
    const r = requestAnimationFrame(function () { setBuka(true) })
    return function () { cancelAnimationFrame(r) }
  }, [harusHilang])
  useEffect(function () {
    if (!harusHilang) { setKeluar(false); setHilang(false); return undefined }
    if (!terlewat.length) { setHilang(true); return undefined }
    setBuka(false)
    setKeluar(true)
    const t = setTimeout(function () { setHilang(true) }, 400)
    return function () { clearTimeout(t) }
  }, [harusHilang])
  if (hilang || (harusHilang && !terlewat.length)) return null
  return (
    <div className={'pengingat-wrap' + (buka ? ' pengingat-wrap-buka' : '')}>
      <div className="pengingat-wrap-dalam">
    <section className={'mt-6 rounded-[2rem] border border-amber-200 bg-amber-50 p-5 sm:p-6 ' + (keluar ? 'pengingat-keluar' : 'pengingat-masuk')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
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
      <div className="mt-4">
        <ul className="space-y-2">
        {terlewat.slice(0, 3).map(function (t) {
          return (
            <li key={t} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-white p-3">
              <p className="text-sm font-semibold text-slate-800">
          <span className="hidden sm:inline">{formatTanggal(t)}</span>
          <span className="sm:hidden">{formatTanggalMobile(t)}</span>
        </p>
              <button type="button" onClick={function () { props.onIsi(t) }} className="rounded-xl bg-bsi-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-bsi-900 sm:text-sm">
                Isi Logbook
              </button>
            </li>
          )
        })}
      </ul>
        {terlewat.length > 3 ? (
          <div className={'pengingat-extra' + (lihatSemua ? ' pengingat-extra-buka' : '')}>
            <div className="pengingat-extra-dalam">
              <ul className="space-y-2 pt-2">
                {terlewat.slice(3).map(function (t) {
                  return (
                    <li key={t} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-white p-3">
                      <p className="text-sm font-semibold text-slate-800">
                        <span className="hidden sm:inline">{formatTanggal(t)}</span>
                        <span className="sm:hidden">{formatTanggalMobile(t)}</span>
                      </p>
                      <button type="button" onClick={function () { props.onIsi(t) }} className="rounded-xl bg-bsi-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-bsi-900 sm:text-sm">
                        Isi Logbook
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
      {terlewat.length > 3 ? (
        <button type="button" onClick={function () { setLihatSemua(function (v) { return !v }) }} className="mt-3 w-full rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-xs font-bold text-amber-800 hover:bg-amber-100 sm:text-sm">
          {lihatSemua ? 'Sembunyikan' : 'Lihat Semua (' + terlewat.length + ' tanggal)'}
        </button>
      ) : null}
    </section>
      </div>
    </div>
  )
}
