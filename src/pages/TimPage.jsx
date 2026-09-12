import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function TimPage() {
  const [people, setPeople] = useState([])
  const [logs, setLogs] = useState([])
  const [galeri, setGaleri] = useState([])

  useEffect(function () {
    async function load() {
      const p = await supabase.from('peserta').select('id, nama, nim, prodi').order('nama')
      const l = await supabase.from('logbooks').select('id, peserta_id').eq('status', 'publik')
      const g = await supabase.from('galeri').select('id, peserta_id')
      setPeople(p.data || [])
      setLogs(l.data || [])
      setGaleri(g.data || [])
    }
    load()
  }, [])

  return (
    <div>
      <section className="card-hover rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Profil tim</p>
        <h1 className="mt-2 text-3xl lg:text-4xl font-black text-slate-900">Tim magang Bank BSI</h1>
      </section>
      <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {people.map(function (p) {
          const totalLog = logs.filter(function (l) { return l.peserta_id === p.id }).length
          const totalGal = galeri.filter(function (g) { return g.peserta_id === p.id }).length
          const initials = p.nama.split(' ').slice(0, 2).map(function (w) { return w.charAt(0) || '' }).join('').toUpperCase()
          return (
            <div key={p.id} className="card-hover bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-3xl bg-bsi-800 text-white grid place-items-center text-xl font-black">{initials}</div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{p.nama}</p>
                  <p className="text-sm text-slate-500">NIM {p.nim}</p>
                  {p.prodi ? <span className="mt-1 inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-bsi-100 text-bsi-900">{p.prodi}</span> : null}
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Logbook publik</p><p className="mt-1 text-2xl font-black text-bsi-900">{totalLog}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Media galeri</p><p className="mt-1 text-2xl font-black text-bsi-900">{totalGal}</p></div>
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}