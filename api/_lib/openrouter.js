const BASE = 'https://openrouter.ai/api/v1/chat/completions'
const DEFAULT_MODEL = 'meta-llama/llama-3.3-70b-instruct:free'

export function modelOpenRouter(env) {
  return env.OPENROUTER_MODEL || DEFAULT_MODEL
}

export async function panggilOpenRouter(env, opsi) {
  const key = env.OPENROUTER_API_KEY
  if (!key) throw new Error('OPENROUTER_API_KEY belum dikonfigurasi di environment')

  const body = {
    model: modelOpenRouter(env),
    messages: [{ role: 'user', content: opsi.prompt }],
    temperature: opsi.temperature == null ? 0.7 : opsi.temperature
  }

  const r = await fetch(BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + key,
      'HTTP-Referer': 'https://mbsi-logbook.vercel.app',
      'X-Title': 'Portal Logbook Magang BSI'
    },
    body: JSON.stringify(body)
  })

  const teks = await r.text()
  if (!r.ok) {
    let pesan = 'OpenRouter API gagal (status ' + r.status + ')'
    try {
      const j = JSON.parse(teks)
      if (j && j.error && j.error.message) pesan = j.error.message
    } catch (e) {}
    if (r.status === 429) pesan = 'Kuota harian OpenRouter habis. Coba lagi besok, atau top-up $10 untuk naikkan limit ke 1.000 request/hari.'
    if (r.status === 401) pesan = 'API key OpenRouter tidak valid. Periksa kembali OPENROUTER_API_KEY di .env.local'
    throw new Error(pesan)
  }

  const data = JSON.parse(teks)
  const pilihan = data && data.choices && data.choices[0]
  const out = pilihan && pilihan.message && pilihan.message.content
  if (!out) throw new Error('OpenRouter tidak mengembalikan jawaban')
  return String(out).trim()
}

export function parseJsonDariTeks(teks) {
  try { return JSON.parse(teks) } catch (e) {}
  const m = String(teks).match(/\{[\s\S]*\}/)
  if (!m) return null
  try { return JSON.parse(m[0]) } catch (e) { return null }
}

function bangunPrompt(draft, kategoriList, unitList) {
  return [
    'Kamu asisten logbook magang Bank Syariah Indonesia (BSI).',
    '',
    'Tugas: dari catatan kasar mahasiswa, susun logbook harian yang rapi dan profesional dalam Bahasa Indonesia.',
    '',
    'WAJIB balas dengan JSON murni tanpa teks pembuka atau penutup. Struktur JSON:',
    '{',
    '  "judul": "string",',
    '  "kategori": "string",',
    '  "unit": "string",',
    '  "kendala": "string",',
    '  "solusi": "string",',
    '  "pembelajaran": "string",',
    '  "items": [{ "judul": "string", "deskripsi": "string" }]',
    '}',
    '',
    'Aturan:',
    '- "judul": ringkasan hari itu, maksimal 12 kata, tanpa titik di akhir.',
    '- "kategori": pilih SATU persis dari daftar ini: ' + kategoriList.join(', ') + '.',
    '- "unit": pilih SATU persis dari daftar berikut, atau "" kalau tidak jelas: ' + unitList.join(', ') + '.',
    '- "items": array 1 sampai 5 kegiatan. Tiap kegiatan punya "judul" (maks 10 kata) dan "deskripsi" (1-2 kalimat singkat).',
    '- "kendala", "solusi", "pembelajaran": isi hanya jika tercantum di catatan. Kalau tidak ada, isi string kosong "".',
    '- Jangan mengarang detail yang tidak ada di catatan.',
    '- Nada profesional, ringkas, tidak berlebihan.',
    '',
    'Catatan kasar mahasiswa:',
    '"""',
    draft.trim(),
    '"""'
  ].join('\n')
}

function potong(s, n) { return String(s || '').slice(0, n) }

export async function susunLogbookDenganOpenRouter(env, opts) {
  const draft = String(opts.draft || '').trim()
  if (!draft) throw new Error('Catatan kosong')
  if (draft.length > 2000) throw new Error('Catatan terlalu panjang (maks 2000 karakter)')
  const kat = (opts.kategoriList && opts.kategoriList.length) ? opts.kategoriList : []
  const unit = (opts.unitList && opts.unitList.length) ? opts.unitList : []

  const raw = await panggilOpenRouter(env, {
    prompt: bangunPrompt(draft, kat, unit),
    temperature: 0.7
  })
  const hasil = parseJsonDariTeks(raw)
  if (!hasil) throw new Error('AI tidak menghasilkan JSON valid')

  return {
    judul: potong(hasil.judul, 200),
    kategori: kat.indexOf(hasil.kategori) !== -1 ? hasil.kategori : '',
    unit: unit.indexOf(hasil.unit) !== -1 ? hasil.unit : '',
    kendala: potong(hasil.kendala, 800),
    solusi: potong(hasil.solusi, 800),
    pembelajaran: potong(hasil.pembelajaran, 800),
    items: Array.isArray(hasil.items)
      ? hasil.items.slice(0, 5).map(function (it) {
          return { judul: potong(it.judul, 200), deskripsi: potong(it.deskripsi, 800) }
        }).filter(function (it) { return it.judul })
      : []
  }
}