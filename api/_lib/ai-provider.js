import { susunLogbookDenganGroq } from './groq.js'

/* Titik masuk tunggal untuk semua fitur AI di aplikasi.
   Saat ini memakai Groq (Qwen 3.8 27B) sebagai provider tunggal.
   Kalau nanti mau tambah provider lain, cukup tambahkan cabang
   di sini tanpa mengubah tulis.js atau vite.config.js. */
export async function susunLogbookAi(env, opts) {
  return susunLogbookDenganGroq(env, opts)
}
