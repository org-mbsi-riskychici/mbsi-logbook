import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { createClient } from '@supabase/supabase-js'

const s3 = new S3Client({
  region: 'auto',
  endpoint: 'https://' + process.env.R2_ACCOUNT_ID + '.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
})

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Belum login' })

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } }
  })
  const check = await supabase.auth.getUser(token)
  if (check.error || !check.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })

  const { key } = req.body || {}
  if (!key) return res.status(400).json({ error: 'Key tidak ada' })
  await s3.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }))
  return res.status(200).json({ ok: true })
}
