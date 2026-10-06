import { useEffect, useLayoutEffect, useRef, useState } from 'react'
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

/* Batas akhir pengingat logbook = kemarin; hari ini belum dianggap terlewat karena masih bisa diisi */
function kemarinIso() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return isoDari(d)
}

/* ===== LOGIKA REMINDER LOGBOOK =====
   Hanya hari yang berstatus "Masuk" yang perlu logbook.
   Hari tanpa catatan hadir (akan jadi Bolos otomatis besoknya) atau
   yang berstatus Izin/Bolos tidak perlu diingatkan. */
export function hitungTanggalTerlewat(tanggalLogbook, hadir) {
  const punyaLog = new Set(tanggalLogbook || [])
  const hariMasuk = new Set()
  ;(hadir || []).forEach(function (h) {
    if (h.status === 'Masuk') hariMasuk.add(h.tanggal)
  })
  const hasil = []
  const d = new Date(MULAI_MAGANG + 'T00:00:00')
  const batas = new Date(kemarinIso() + 'T00:00:00')
  while (d <= batas) {
    const iso = isoDari(d)
    const hari = d.getDay()
    if (hari !== 0 && hari !== 6 && !punyaLog.has(iso) && hariMasuk.has(iso)) hasil.push(iso)
    d.setDate(d.getDate() + 1)
  }
  return hasil
}

/* ===== LOGIKA REMINDER HADIR =====
   Muncul HANYA untuk HARI INI, mulai jam 07:00 sampai tengah malam.
   Lewat tengah malam, hari ini otomatis jadi Bolos besoknya lewat autoIsiBolos(),
   jadi tidak perlu diingatkan lagi (sudah di luar window). */
export function hitungTanggalTerlewatHadir(hadir) {
  const punyaHadir = new Set((hadir || []).map(function (h) { return h.tanggal }))
  const now = new Date()
  const hari = now.getDay()

  /* Sabtu/Minggu bukan hari kerja */
  if (hari === 0 || hari === 6) return []

  /* Sebelum jam 7 pagi, user masih punya waktu; jangan ganggu */
  if (now.getHours() < 7) return []

  /* Sudah isi absen hari ini → tidak perlu reminder */
  const hariIni = isoDari(now)
  if (punyaHadir.has(hariIni)) return []

  return [hariIni]
}

/* gulir-atas-dulu-v1: saat daftar tambahan ditutup, gulir internal dinaikkan
   mulus ke puncak dulu; aksi penutup dipanggil setelah gulir selesai (atau
   jatuh tempo) supaya tinggi banner baru menyusut sesudahnya */
function gulirKeAtasLalu(el, selesai) {
  if (!el || el.scrollTop <= 0) { selesai(); return }
  const reduksi = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduksi) { el.scrollTop = 0; selesai(); return }
  let done = false
  const panggil = function () { if (done) return; done = true; selesai() }
  el.addEventListener('scrollend', panggil, { once: true })
  el.scrollTo({ top: 0, behavior: 'smooth' })
  const mulai = Date.now()
  const cek = function () {
    if (done) return
    if (el.scrollTop <= 0 || Date.now() - mulai > 700) { panggil(); return }
    setTimeout(cek, 80)
  }
  setTimeout(cek, 80)
}

export default function PengingatBanner(props) {
  const tipe = props.tipe || 'logbook'
  const [tutup, setTutup] = useState(false)
  const [lihatSemua, setLihatSemua] = useState(false)
  const [buka, setBuka] = useState(false)
  const [keluar, setKeluar] = useState(false)
  const [hilang, setHilang] = useState(false)
  const simpanRef = useRef(null)
  const refScroll = useRef(null)
  const sedangTutup = useRef(false)
  const refTiga = useRef(null)
  const [tinggiTiga, setTinggiTiga] = useState(0)
  const [capBuka, setCapBuka] = useState(311)

  /* ticker-minutes: re-render tiap 60 detik supaya reminder hadir otomatis
     muncul saat masuk jam 07:00 tanpa user perlu refresh halaman. */
  const [, setTick] = useState(0)
  useEffect(function () {
    const iv = setInterval(function () { setTick(function (t) { return t + 1 }) }, 60000)
    return function () { clearInterval(iv) }
  }, [])

  const mentah = tipe === 'hadir'
    ? hitungTanggalTerlewatHadir(props.hadir)
    : hitungTanggalTerlewat(props.tanggalLogbook, props.hadir)
  if (mentah.length && !tutup) simpanRef.current = mentah
  const harusHilang = tutup || !mentah.length
  /* saat menghilang, pakai salinan terakhir supaya isi banner tetap utuh selama animasi keluar */
  const terlewat = mentah.length ? mentah : (simpanRef.current || [])

  const konfigurasi = tipe === 'hadir'
    ? {
        judul: 'Kamu belum isi daftar hadir hari ini',
        deskripsi: 'Isi sebelum tengah malam. Kalau lewat, hari ini akan otomatis tercatat Bolos.',
        aksi: 'Isi Daftar Hadir'
      }
    : {
        judul: terlewat.length + ' hari kerja belum punya logbook',
        deskripsi: 'Hanya hari dengan status kehadiran Masuk yang perlu logbook. Sabtu-Minggu, Izin, dan Bolos tidak dihitung.',
        aksi: 'Isi Logbook'
      }

  /* ukur tinggi 3 item pertama supaya tinggi lipatan presisi di semua lebar layar */
  useLayoutEffect(function () {
    function ukur() {
      if (refTiga.current) setTinggiTiga(refTiga.current.offsetHeight)
      setCapBuka(window.matchMedia('(max-width: 639px)').matches ? 293 : 311)
    }
    ukur()
    window.addEventListener('resize', ukur)
    let ro = null
    if (refTiga.current && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(ukur)
      ro.observe(refTiga.current)
    }
    return function () { window.removeEventListener('resize', ukur); if (ro) ro.disconnect() }
  }, [terlewat.length])

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
                  {konfigurasi.judul}
                </h2>
                <p className="mt-1 text-xs text-amber-800 sm:text-sm">
                  {konfigurasi.deskripsi}
                </p>
              </div>
            </div>
            <button type="button" onClick={function () { setTutup(true) }} title="Sembunyikan Pengingat" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200">
              <SizedIcon name="close" size={14} />
            </button>
          </div>

          <div ref={refScroll} className={'mt-4 pengingat-scroll' + (lihatSemua ? ' pengingat-scroll-buka' : '')} style={{ maxHeight: lihatSemua ? capBuka : (tinggiTiga || undefined) }}>
            <ul ref={refTiga} className="space-y-2">
              {terlewat.slice(0, 3).map(function (t) {
                return (
                  <li key={t} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-white p-3">
                    <p className="text-sm font-semibold text-slate-800">
                      <span className="hidden sm:inline">{formatTanggal(t)}</span>
                      <span className="sm:hidden">{formatTanggalMobile(t)}</span>
                    </p>
                    <button type="button" onClick={function () { props.onIsi(t) }} className="rounded-xl bg-bsi-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-bsi-900 sm:text-sm">
                      {konfigurasi.aksi}
                    </button>
                  </li>
                )
              })}
            </ul>
            {terlewat.length > 3 ? (
              <ul className="pengingat-daftar-extra space-y-2 pt-2">
                {terlewat.slice(3).map(function (t) {
                  return (
                    <li key={t} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-white p-3">
                      <p className="text-sm font-semibold text-slate-800">
                        <span className="hidden sm:inline">{formatTanggal(t)}</span>
                        <span className="sm:hidden">{formatTanggalMobile(t)}</span>
                      </p>
                      <button type="button" onClick={function () { props.onIsi(t) }} className="rounded-xl bg-bsi-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-bsi-900 sm:text-sm">
                        {konfigurasi.aksi}
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </div>

          {terlewat.length > 3 ? (
            <button type="button" onClick={function () {
              if (!lihatSemua) { setLihatSemua(true); return }
              if (sedangTutup.current) return
              sedangTutup.current = true
              gulirKeAtasLalu(refScroll.current, function () {
                sedangTutup.current = false
                setLihatSemua(false)
              })
            }} className="mt-3 w-full rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-xs font-bold text-amber-800 hover:bg-amber-100 sm:text-sm">
              {lihatSemua ? 'Sembunyikan' : 'Lihat Semua (' + terlewat.length + ' tanggal)'}
            </button>
          ) : null}
        </section>
      </div>
    </div>
  )
}