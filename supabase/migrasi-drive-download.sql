-- Migrasi fitur download Google Drive
-- Jalankan SQL ini di Supabase Dashboard > SQL Editor
-- jika kolom drive_id belum ada.

alter table public.logbook_items add column if not exists drive_id text;
alter table public.galeri add column if not exists drive_id text;
