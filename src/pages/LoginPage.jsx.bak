import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginWithNim } from '../lib/auth.js'
import { inputCls, labelCls, btnPrimary } from '../components/ui.jsx'
import { EyeToggle, SizedIcon } from '../components/icons.jsx'

function pesanErrorLogin(err) {
  const pesan = String((err && err.message) || '')
  const rendah = pesan.toLowerCase()
  if (rendah.indexOf('invalid login credentials') !== -1) {
    return 'NIM atau kode akses yang kamu masukkan tidak cocok dengan data kami. Periksa kembali penulisannya, pastikan tidak ada spasi berlebih, lalu coba lagi.'
  }
  if (rendah.indexOf('not confirmed') !== -1) {
    return 'Akun untuk NIM ini belum diaktifkan. Hubungi admin tim magang untuk mengaktifkan akunmu terlebih dahulu.'
  }
  if (rendah.indexOf('too many requests') !== -1 || rendah.indexOf('try again after') !== -1 || rendah.indexOf('rate limit') !== -1) {
    return 'Terlalu banyak percobaan masuk dalam waktu singkat demi keamanan. Tunggu sekitar satu menit, lalu coba lagi.'
  }
  if (rendah.indexOf('fetch') !== -1 || rendah.indexOf('network') !== -1 || rendah.indexOf('failed to load') !== -1 || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return 'Tidak bisa terhubung ke server. Periksa koneksi internetmu, lalu coba lagi.'
  }
  if (rendah.indexOf('email') !== -1 && rendah.indexOf('format') !== -1) {
    return 'Format NIM tidak terbaca. Masukkan NIM berupa angka tanpa spasi, contoh: 24070041.'
  }
  if (pesan) return 'Gagal masuk: ' + pesan + '. Coba sekali lagi, atau hubungi admin tim magang bila masalah berlanjut.'
  return 'Terjadi kesalahan tidak terduga saat masuk. Coba sekali lagi, atau hubungi admin tim magang bila masalah berlanjut.'
}
export default function LoginPage() {
  const navigate = useNavigate()
  const [nim, setNim] = useState('')
  const [kode, setKode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [lihatKode, setLihatKode] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
  await loginWithNim(nim, kode)
  navigate('/dashboard')
} catch (err) {
  setError(pesanErrorLogin(err))
}
    setBusy(false)
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] items-start">
      <div className="card-hover rounded-[2rem] bg-bsi-900 text-white p-5 sm:p-8 lg:p-10">
        <span className="inline-flex px-3 py-1.5 rounded-full bg-white/10 text-[10px] font-semibold uppercase tracking-wide sm:px-4 sm:py-2 sm:text-xs">Area Intern</span>
        <h1 className="mt-6 text-2xl sm:text-3xl lg:text-4xl font-black leading-tight">Masuk untuk Mengisi Logbook, Galeri, dan Daftar Hadir</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/80 sm:mt-4 sm:text-base">Halaman ini hanya digunakan oleh mahasiswa magang. Dosen pembimbing dan kaprodi tidak perlu login untuk melihat halaman publik.</p>
      </div>
      <div className="card-hover bg-white rounded-[2rem] border border-slate-200 shadow-sm p-5 sm:p-8 lg:p-10">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">Login Mahasiswa Magang</h2>
        {error ? (
          <div className="mt-3 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
              <SizedIcon name="close" size={12} />
            </span>
            <div className="min-w-0">
              <p className="font-bold">Gagal Masuk</p>
              <p className="mt-1 leading-relaxed">{error}</p>
            </div>
          </div>
        ) : null}
        <form onSubmit={submit} className="mt-6 space-y-5">
          <div>
            <label className={labelCls}>NIM <span className="text-red-500">*</span></label>
            <input className={inputCls} value={nim} onChange={function (e) { setNim(e.target.value) }} aria-label="NIM" placeholder="Contoh: 20260001" required />
          </div>
          <div>
            <label className={labelCls}>Kode akses <span className="text-red-500">*</span></label>
            <div className="relative mt-1.5">
              <input
                type={lihatKode ? 'text' : 'password'}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-bsi-500"
                value={kode}
                onChange={function (e) { setKode(e.target.value) }}
                aria-label="Kode Akses" placeholder="Masukkan kode akses"
                required
              />
              <button
                type="button"
                onClick={function () { setLihatKode(function (v) { return !v }) }}
                title={lihatKode ? 'Sembunyikan Kode Akses' : 'Lihat Kode Akses'}
                className="absolute right-2 top-0 bottom-0 my-auto grid h-9 w-9 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-600"
              >
                <EyeToggle open={lihatKode} size={18} />
              </button>
            </div>
          </div>
          <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Memproses...' : 'Masuk ke Dashboard'}</button>
        </form>
      </div>
    </section>
  )
}
