create extension if not exists "pgcrypto";
create table public.peserta (
  id uuid primary key default gen_random_uuid(),
  auth_uid uuid unique references auth.users(id) on delete cascade,
  nim varchar(20) not null unique,
  nama varchar(100) not null,
  created_at timestamptz not null default now()
);
create table public.logbooks (
  id uuid primary key default gen_random_uuid(),
  peserta_id uuid not null references public.peserta(id) on delete cascade,
  tanggal date not null,
  unit varchar(50),
  kategori varchar(50) not null,
  judul varchar(255) not null,
  kendala text,
  solusi text,
  pembelajaran text,
  status varchar(20) not null default 'draft' check (status in ('draft','publik')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.logbook_items (
  id uuid primary key default gen_random_uuid(),
  logbook_id uuid not null references public.logbooks(id) on delete cascade,
  urutan integer not null default 1,
  judul varchar(255) not null,
  deskripsi text,
  hasil text,
  media_path text,
  media_type varchar(10) check (media_type in ('foto','video')),
  show_in_gallery boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.galeri (
  id uuid primary key default gen_random_uuid(),
  peserta_id uuid not null references public.peserta(id) on delete cascade,
  logbook_item_id uuid unique references public.logbook_items(id) on delete cascade,
  judul varchar(255) not null,
  deskripsi text,
  tanggal date not null,
  kegiatan varchar(50),
  media_path text not null,
  media_type varchar(10) not null check (media_type in ('foto','video')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.daftar_hadir (
  id uuid primary key default gen_random_uuid(),
  peserta_id uuid not null references public.peserta(id) on delete cascade,
  tanggal date not null,
  status varchar(20) not null check (status in ('Masuk','Izin','Bolos')),
  alasan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (peserta_id, tanggal)
);
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;
create trigger trg_logbooks_upd before update on public.logbooks for each row execute function public.set_updated_at();
create trigger trg_galeri_upd before update on public.galeri for each row execute function public.set_updated_at();
create trigger trg_hadir_upd before update on public.daftar_hadir for each row execute function public.set_updated_at();
create index idx_logbooks_peserta on public.logbooks(peserta_id, tanggal desc);
create index idx_logbooks_status on public.logbooks(status);
create index idx_items_logbook on public.logbook_items(logbook_id, urutan);
create index idx_galeri_peserta on public.galeri(peserta_id, tanggal desc);
create index idx_galeri_item on public.galeri(logbook_item_id);
create index idx_hadir_peserta on public.daftar_hadir(peserta_id, tanggal desc);
alter table public.peserta enable row level security;
alter table public.logbooks enable row level security;
alter table public.logbook_items enable row level security;
alter table public.galeri enable row level security;
alter table public.daftar_hadir enable row level security;
create policy "peserta_read_all" on public.peserta for select using (true);
create policy "peserta_update_self" on public.peserta for update using (auth_uid = auth.uid());
create policy "logbooks_read" on public.logbooks for select using (
  status = 'publik' or peserta_id = (select id from public.peserta where auth_uid = auth.uid())
);
create policy "logbooks_insert_self" on public.logbooks for insert with check (
  peserta_id = (select id from public.peserta where auth_uid = auth.uid())
);
create policy "logbooks_update_self" on public.logbooks for update using (
  peserta_id = (select id from public.peserta where auth_uid = auth.uid())
);
create policy "logbooks_delete_self" on public.logbooks for delete using (
  peserta_id = (select id from public.peserta where auth_uid = auth.uid())
);
create policy "items_read" on public.logbook_items for select using (
  exists (select 1 from public.logbooks l where l.id = logbook_id
    and (l.status = 'publik' or l.peserta_id = (select id from public.peserta where auth_uid = auth.uid())))
);
create policy "items_write_self" on public.logbook_items for all using (
  exists (select 1 from public.logbooks l where l.id = logbook_id
    and l.peserta_id = (select id from public.peserta where auth_uid = auth.uid()))
) with check (
  exists (select 1 from public.logbooks l where l.id = logbook_id
    and l.peserta_id = (select id from public.peserta where auth_uid = auth.uid()))
);
create policy "galeri_read_all" on public.galeri for select using (true);
create policy "galeri_insert_self" on public.galeri for insert with check (
  peserta_id = (select id from public.peserta where auth_uid = auth.uid())
);
create policy "galeri_update_self" on public.galeri for update using (
  peserta_id = (select id from public.peserta where auth_uid = auth.uid())
);
create policy "galeri_delete_self" on public.galeri for delete using (
  peserta_id = (select id from public.peserta where auth_uid = auth.uid())
);
create policy "hadir_read_all" on public.daftar_hadir for select using (true);
create policy "hadir_insert_self" on public.daftar_hadir for insert with check (
  peserta_id = (select id from public.peserta where auth_uid = auth.uid())
);
create policy "hadir_update_self" on public.daftar_hadir for update using (
  peserta_id = (select id from public.peserta where auth_uid = auth.uid())
);
create policy "hadir_delete_self" on public.daftar_hadir for delete using (
  peserta_id = (select id from public.peserta where auth_uid = auth.uid())
);
