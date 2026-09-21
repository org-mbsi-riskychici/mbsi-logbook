import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { cekSesi } from '../_lib/sesi.js'

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
  const user = await cekSesi(process.env, req.headers.authorization)
  if (!user) return res.status(401).json({ error: 'Sesi tidak valid' })
  const { filename, contentType, kind } = req.body || {}
  if (!filename || !contentType || !kind) return res.status(400).json({ error: 'Payload tidak lengkap' })
  const ext = (filename.split('.').pop() || 'bin').toLowerCase()
  const key = kind + '/' + new Date().getFullYear() + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext
  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key, ContentType: contentType }),
    { expiresIn: 300 }
  )
  const publicUrl = '/api/r2/file?key=' + key
  return res.status(200).json({ uploadUrl, publicUrl, key })
}
