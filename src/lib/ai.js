import { supabase } from './supabase.js'

async function ambilToken() {
  const { data } = await supabase.auth.getSession()
  return data.session ? data.session.access_token : ''
}

export async function bantuTulisLogbook(draft, kategoriList, unitList) {
  const token = await ambilToken()
  if (!token) throw new Error('Sesi login tidak terbaca. Masuk ulang dulu.')
  const r = await fetch('/api/ai/tulis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ draft: draft, kategori: kategoriList, unit: unitList })
  })
  const j = await r.json().catch(function () { return {} })
  if (!r.ok) throw new Error(j.error || 'Gagal memanggil AI')
  return j
}

export async function tanyaDospem(pertanyaan, riwayat) {
  const r = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pertanyaan: pertanyaan, riwayat: riwayat || [] })
  })
  const j = await r.json().catch(function () { return {} })
  if (!r.ok) throw new Error(j.error || 'Gagal memanggil AI')
  return j
}
