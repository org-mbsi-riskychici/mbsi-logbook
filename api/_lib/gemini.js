const BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const DEFAULT_MODEL = 'gemini-2.0-flash'

export function modelGemini(env) {
  return env.GEMINI_MODEL || DEFAULT_MODEL
}

export async function panggilGemini(env, opsi) {
  const key = env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY belum dikonfigurasi di environment')
  const url = BASE + '/' + modelGemini(env) + ':generateContent?key=' + key
  const body = {
    contents: [{ parts: [{ text: opsi.prompt }] }],
    generationConfig: {
      temperature: opsi.temperature == null ? 0.7 : opsi.temperature
    }
  }
  if (opsi.schema) {
    body.generationConfig.responseMimeType = 'application/json'
    body.generationConfig.responseSchema = opsi.schema
  }
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const teks = await r.text()
  if (!r.ok) {
    let pesan = 'Gemini API gagal (status ' + r.status + ')'
    try {
      const j = JSON.parse(teks)
      if (j && j.error && j.error.message) pesan = j.error.message
    } catch (e) {}
    throw new Error(pesan)
  }
  const data = JSON.parse(teks)
  const kand = data && data.candidates && data.candidates[0]
  const parts = kand && kand.content && kand.content.parts
  if (!parts || !parts.length) throw new Error('Gemini tidak mengembalikan jawaban')
  const out = parts.map(function (p) { return p.text || '' }).join('').trim()
  if (!out) throw new Error('Gemini mengembalikan jawaban kosong')
  return out
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

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    judul: { type: 'STRING' },
    kategori: { type: 'STRING' },
    unit: { type: 'STRING' },
    kendala: { type: 'STRING' },
    solusi: { type: 'STRING' },
    pembelajaran: { type: 'STRING' },
    items: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          judul: { type: 'STRING' },
          deskripsi: { type: 'STRING' }
        },
        required: ['judul', 'deskripsi']
      }
    }
  },
  required: ['judul', 'kategori', 'items']
}

function potong(s, n) { return String(s || '').slice(0, n) }

export async function susunLogbookDenganGemini(env, opts) {
  const draft = String(opts.draft || '').trim()
  if (!draft) throw new Error('Catatan kosong')
  if (draft.length > 2000) throw new Error('Catatan terlalu panjang (maks 2000 karakter)')
  const kat = (opts.kategoriList && opts.kategoriList.length) ? opts.kategoriList : []
  const unit = (opts.unitList && opts.unitList.length) ? opts.unitList : []

  const raw = await panggilGemini(env, {
    prompt: bangunPrompt(draft, kat, unit),
    schema: SCHEMA,
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
