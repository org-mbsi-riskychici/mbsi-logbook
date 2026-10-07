import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { uploadMedia } from '../lib/upload.js'
import { syncGaleriFromLogbook } from '../lib/logbook.js'
import { urlPratinjau } from '../lib/konversi.js'
import { todayInput, formatTanggal, toTitleCase } from '../lib/format.js'
import { KATEGORI } from '../lib/constants.js'
import { inputCls, labelCls, btnPrimary, useToast, AutoTextArea, LabelProses, Avatar } from '../components/ui.jsx'
import { CustomSelect } from '../components/controls.jsx'
import { SizedIcon } from '../components/icons.jsx'
import { useNavigate } from 'react-router-dom'
import PengingatBanner from '../components/PengingatBanner.jsx'
import { SkeletonQuick } from '../components/Skeleton.jsx'

const STATUS_HADIR = ['Masuk', 'Izin', 'Bolos']

export default function QuickPage() {
  const { mahasiswa } = useAuth()
  const toast = useToast()
  const tanggal = todayInput()

  const [tab, setTab] = useState('logbook')
  const [loading, setLoading] = useState(true)
  const [todayLog, setTodayLog] = useState(null)
  const [hadirHariIni, setHadirHariIni] = useState(null)
  const [lastLogTanggal, setLastLogTanggal] = useState(null)
  const [lastHadirTanggal, setLastHadirTanggal] = useState(null)

  const [kategori, setKategori] = useState('')
  const [judulKegiatan, setJudulKegiatan] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [showGal, setShowGal] = useState(false)
  const [busy, setBusy] = useState(false)
  const [info, setInfo] = useState('')

  const [status, setStatus] = useState('Masuk')
  const [alasan, setAlasan] = useState('')
  const navigate = useNavigate()
  const [tanggalLogs, setTanggalLogs] = useState([])
  const [hadirRows, setHadirRows] = useState([])

  const cameraRef = useRef(null)
  const galeriRef = useRef(null)

  async function muatData(mhs, senyap) {
    if (!senyap) setLoading(true)
    const l = await supabase
      .from('logbooks')
      .select('*, logbook_items(*)')
      .eq('mahasiswa_id', mhs.id)
      .eq('tanggal', tanggal)
      .order('created_at', { ascending: false })
      .limit(1)
    const log = (l.data || [])[0] || null
    if (log) {
      log.logbook_items = (log.logbook_items || []).sort(function (a, b) { return (a.urutan || 0) - (b.urutan || 0) })
    }
    const h = await supabase
      .from('daftar_hadir')
      .select('*')
      .eq('mahasiswa_id', mhs.id)
      .eq('tanggal', tanggal)
      .limit(1)
    const hadir = (h.data || [])[0] || null
    const ll = await supabase
      .from('logbooks')
      .select('tanggal')
      .eq('mahasiswa_id', mhs.id)
      .order('tanggal', { ascending: false })
      .limit(1)
    const lh = await supabase
      .from('daftar_hadir')
      .select('tanggal')
      .eq('mahasiswa_id', mhs.id)
      .order('tanggal', { ascending: false })
      .limit(1)
    setTodayLog(log)
    setHadirHariIni(hadir)
    setLastLogTanggal(ll.data && ll.data[0] ? ll.data[0].tanggal : null)
    setLastHadirTanggal(lh.data && lh.data[0] ? lh.data[0].tanggal : null)
    if (hadir) {
      setStatus(hadir.status)
      setAlasan(hadir.alasan || '')
    }
        const pg = await supabase.from('logbooks').select('tanggal').eq('mahasiswa_id', mhs.id)
    const ph = await supabase.from('daftar_hadir').select('tanggal, status').eq('mahasiswa_id', mhs.id)
    setTanggalLogs((pg.data || []).map(function (x) { return x.tanggal }))
    setHadirRows(ph.data || [])
    if (!senyap) setLoading(false)
  }

  useEffect(function () {
    if (mahasiswa) muatData(mahasiswa)
  }, [mahasiswa])

  async function pilihFile(e) {
    const f = e.target.files[0]
    e.target.value = ''
    if (!f) return
    if (preview && preview.indexOf('blob:') === 0) URL.revokeObjectURL(preview)
    setFile(f)
    setPreview(await urlPratinjau(f))
  }

  function hapusFile() {
    if (preview && preview.indexOf('blob:') === 0) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview('')
    setShowGal(false)
  }

  async function submitLogbook(e) {
    e.preventDefault()
    if (!todayLog && !kategori) { toast.gagal('Pilih kategori terlebih dahulu.'); return }
    if (!judulKegiatan.trim()) { toast.gagal('Judul kegiatan wajib diisi.'); return }
    setBusy(true)
    try {
      let mediaPath = null
      let mediaThumb = null
      if (file) {
        const up = await uploadMedia(file, 'logbook', setInfo)
        mediaPath = up.publicUrl
        mediaThumb = up.thumbUrl || null
      }
      let logId = todayLog ? todayLog.id : null
      if (!todayLog) {
        const ins = await supabase.from('logbooks').insert({
  mahasiswa_id: mahasiswa.id, tanggal: tanggal, unit: '', kategori: kategori,
  judul: toTitleCase(judulKegiatan), kendala: '', solusi: '', pembelajaran: '', status: 'publik'
}).select().single()
        if (ins.error) throw new Error(ins.error.message)
        logId = ins.data.id
      }
      const urutan = todayLog ? todayLog.logbook_items.reduce(function (m, it) { return Math.max(m, it.urutan || 0) }, 0) + 1 : 1
      const insItem = await supabase.from('logbook_items').insert({
  logbook_id: logId,
  urutan: urutan,
  judul: toTitleCase(judulKegiatan),
        deskripsi: deskripsi.trim(),
        hasil: '',
        media_path: mediaPath,
        media_type: mediaPath ? 'foto' : null,
        media_thumb: mediaThumb,
        media_source: 'r2',
        youtube_id: null,
        drive_id: null,
        show_in_gallery: showGal && !!mediaPath
      }).select().single()
      if (insItem.error) throw new Error(insItem.error.message)
      if (todayLog && todayLog.status !== 'publik') {
        await supabase.from('logbooks').update({ status: 'publik' }).eq('id', todayLog.id)
      }
      if (showGal && mediaPath) {
        await syncGaleriFromLogbook(mahasiswa.id, [insItem.data], {
          tanggal: tanggal,
          kategori: todayLog ? todayLog.kategori : kategori
        })
      }
      const pertama = !todayLog
      setJudulKegiatan('')
      setDeskripsi('')
      hapusFile()
      if (pertama) setKategori('')
      await muatData(mahasiswa, true)
      toast.sukses(pertama ? 'Logbook hari ini berhasil dibuat' : 'Kegiatan baru berhasil ditambahkan')
    } catch (err) {
      toast.gagal('Gagal menyimpan logbook: ' + err.message)
    }
    setInfo('')
    setBusy(false)
  }

  async function submitAbsen(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const payload = {
        mahasiswa_id: mahasiswa.id,
        tanggal: tanggal,
        status: status,
        alasan: status === 'Masuk' ? '' : alasan.trim()
      }
      let res
      if (hadirHariIni) {
        res = await supabase.from('daftar_hadir').update(payload).eq('id', hadirHariIni.id)
      } else {
        res = await supabase.from('daftar_hadir').insert(payload)
      }
      if (res.error) throw new Error(res.error.message)
      await muatData(mahasiswa, true)
      toast.sukses(hadirHariIni ? 'Daftar hadir berhasil diperbarui' : 'Daftar hadir berhasil disimpan')
    } catch (err) {
      toast.gagal('Gagal menyimpan kehadiran: ' + err.message)
    }
    setBusy(false)
  }

  function infoTerakhir(tgl) {
    if (!tgl) return { teks: 'belum pernah', lama: true }
    const selisih = Math.round((new Date(tanggal + 'T00:00:00').getTime() - new Date(tgl + 'T00:00:00').getTime()) / 86400000)
    if (selisih <= 0) return { teks: 'hari ini', lama: false }
    if (selisih === 1) return { teks: 'kemarin', lama: false }
    return { teks: selisih + ' hari yang lalu', lama: true }
  }

  if (loading) {
    return <SkeletonQuick />
  }

  const infoLog = infoTerakhir(lastLogTanggal)
  const infoHadir = infoTerakhir(lastHadirTanggal)

  const tabCls = function (t) {
    return 'flex-1 px-4 py-2.5 rounded-xl text-xs sm:rounded-2xl sm:py-3 sm:text-sm font-bold ' + (tab === t ? 'bg-bsi-800 text-white shadow-sm' : 'bsi-panel text-slate-600 hover:text-bsi-800')
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-5">
      <section className="bsi-hero bsi-shadow relative overflow-hidden rounded-[2rem] p-5 sm:p-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="avatar-kepala-dash avatar-kepala-cepat"><Avatar src={mahasiswa.foto_profil || null} nama={mahasiswa.nama} size="xl" /></div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-black text-slate-900 sm:text-2xl">{mahasiswa.nama}</h1>
            <p className="mt-1 truncate text-sm text-slate-600">{formatTanggal(tanggal)}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={function () { setTab('logbook') }} className={tabCls('logbook')}>Logbook</button>
          <button type="button" onClick={function () { setTab('absen') }} className={tabCls('absen')}>Daftar Hadir</button>
        </div>
      </section>

      <div className={tab === 'logbook' ? '' : 'hidden'} style={{ marginTop: 0 }}>
        {!loading ? (
          <PengingatBanner
            tipe="logbook"
            tanggalLogbook={tanggalLogs}
            hadir={hadirRows}
            onIsi={function (t) { navigate('/dashboard?isi=' + t) }}
          />
        ) : null}
      </div>
      <div className={tab === 'absen' ? '' : 'hidden'} style={{ marginTop: 0 }}>
        {!loading ? (
          <PengingatBanner
            tipe="hadir"
            tanggalLogbook={tanggalLogs}
            hadir={hadirRows}
            onIsi={function (t) { navigate('/dashboard?isiHadir=' + t) }}
          />
        ) : null}
      </div>
      {tab === 'logbook' ? (
        <section className="rounded-[2rem] bsi-panel p-5 sm:p-8">
          <p className={'mb-4 flex items-center gap-1.5 text-xs font-semibold ' + (infoLog.lama ? 'text-amber-600' : 'text-slate-500')}>
            <SizedIcon name="calendar" size={13} />
            Terakhir mengisi logbook: {infoLog.teks}
          </p>
          {todayLog ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-bold text-emerald-800">Logbook hari ini sudah ada</p>
              <p className="mt-1 text-sm text-emerald-800">{todayLog.judul} • {todayLog.logbook_items.length} kegiatan</p>
              <div className="mt-2 space-y-1">
                {todayLog.logbook_items.map(function (it, i) {
                  return <p key={it.id} className="truncate text-xs text-emerald-800">{i + 1}. {it.judul}</p>
                })}
              </div>
              <p className="mt-2 text-xs text-emerald-800">Kegiatan baru ditambahkan di bawahnya tanpa menghapus kegiatan lama.</p>
              {todayLog.status !== 'publik' ? <p className="mt-1 text-xs font-semibold text-emerald-800">Status masih draf — akan otomatis dipublikasikan.</p> : null}
            </div>
          ) : (
            <div>
              <label className={labelCls}>Kategori Utama <span className="text-red-500">*</span></label>
              <div className="mt-1.5">
                <CustomSelect placeholder="Pilih Kategori" value={kategori} onChange={setKategori} options={KATEGORI.map(function (k) { return { value: k, label: k } })} />
              </div>
            </div>
          )}

          <form onSubmit={submitLogbook} className="mt-5 space-y-4">
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold text-bsi-800">{todayLog ? 'Kegiatan Baru (kegiatan ' + (todayLog.logbook_items.length + 1) + ')' : 'Kegiatan'}</p>
              <input className={inputCls} value={judulKegiatan} onChange={function (e) { setJudulKegiatan(e.target.value) }} aria-label="Judul Kegiatan" placeholder="Judul kegiatan" />
              <AutoTextArea className={inputCls} value={deskripsi} onChange={function (e) { setDeskripsi(e.target.value) }} aria-label="Deskripsi Kegiatan" placeholder="Deskripsi singkat kegiatan" />
              {preview ? (
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900">
                  <img src={preview} alt="Pratinjau" className="absolute inset-0 h-full w-full object-contain" />
                  <button type="button" onClick={hapusFile} title="Hapus Gambar" className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-red-500 text-white hover:bg-red-600">
                    <SizedIcon name="close" size={14} />
                  </button>
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={function () { cameraRef.current.click() }} className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-3 py-3.5 text-sm font-semibold text-slate-700 hover:border-bsi-500 hover:bg-slate-100">
                  <SizedIcon name="camera" size={18} /> Ambil Foto
                </button>
                <button type="button" onClick={function () { galeriRef.current.click() }} className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-3 py-3.5 text-sm font-semibold text-slate-700 hover:border-bsi-500 hover:bg-slate-100">
                  <SizedIcon name="image" size={18} /> Dari Galeri
                </button>
              </div>
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={pilihFile} />
              <input ref={galeriRef} type="file" accept="image/*" className="hidden" onChange={pilihFile} />
              {preview ? (
                <label className="flex w-full cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-3">
                  <input type="checkbox" checked={showGal} onChange={function (e) { setShowGal(e.target.checked) }} className="mt-0.5 h-4 w-4 rounded accent-bsi-800" />
                  <span className="text-sm font-semibold text-slate-800">Tampilkan kegiatan ini di galeri</span>
                </label>
              ) : null}
            </div>
            <button type="submit" disabled={busy} className={btnPrimary}>
              {busy ? <LabelProses teks={info || 'Menyimpan'} /> : 'Simpan'}
            </button>
          </form>
        </section>
      ) : null}

      {tab === 'absen' ? (
        <section className="rounded-[2rem] bsi-panel p-5 sm:p-8">
          <p className={'mb-4 flex items-center gap-1.5 text-xs font-semibold ' + (infoHadir.lama ? 'text-amber-600' : 'text-slate-500')}>
            <SizedIcon name="clipboard" size={13} />
            Terakhir mengisi daftar hadir: {infoHadir.teks}
          </p>
          {hadirHariIni ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-bold text-emerald-800">Kamu sudah mengisi daftar hadir hari ini ({hadirHariIni.status})</p>
              <p className="mt-1 text-xs text-emerald-800">Form di bawah bisa dipakai untuk memperbarui status bila ada perubahan.</p>
            </div>
          ) : null}
          <form onSubmit={submitAbsen} className={'space-y-4 ' + (hadirHariIni ? 'mt-5' : '')}>
            <div>
              <label className={labelCls}>Status Kehadiran <span className="text-red-500">*</span></label>
              <div className="mt-1.5 flex gap-2">
                {STATUS_HADIR.map(function (s) {
                  const aktif = status === s
                  const warna = aktif
                    ? (s === 'Masuk' ? 'bg-emerald-500 text-white' : s === 'Izin' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white')
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  return <button type="button" key={s} onClick={function () { setStatus(s) }} className={'flex-1 rounded-2xl px-3 py-3 text-sm font-bold ' + warna}>{s}</button>
                })}
              </div>
            </div>
            <div>
              <label className={labelCls}>Alasan atau Keterangan</label>
              <AutoTextArea
                className={inputCls + (status === 'Masuk' ? ' cursor-not-allowed opacity-60' : '')}
                value={alasan}
                onChange={function (e) { setAlasan(e.target.value) }}
                aria-label="Alasan atau Keterangan"
                placeholder={status === 'Masuk' ? 'Status Masuk tidak memerlukan alasan' : 'Contoh: Keperluan keluarga, sakit.'}
                disabled={status === 'Masuk'}
              />
            </div>
            <button type="submit" disabled={busy} className={btnPrimary}>
              {busy ? <LabelProses teks="Menyimpan" /> : 'Simpan'}
            </button>
          </form>
        </section>
      ) : null}
    </div>
  )
}
