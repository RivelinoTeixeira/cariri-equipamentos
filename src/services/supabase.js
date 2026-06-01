import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    })
  : null

export const SUPABASE_SCHEMA_SQL = `
-- Execute este SQL no editor do Supabase (SQL Editor)
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  plan_id text not null,
  plan_value numeric not null,
  used_coupon boolean not null default false,
  coupon_value numeric not null default 0,
  expires_at timestamptz,
  created_at timestamptz default now()
);
-- Se a tabela ja existir sem as colunas novas:
-- alter table public.clients add column if not exists used_coupon boolean not null default false;
-- alter table public.clients add column if not exists coupon_value numeric not null default 0;
-- alter table public.clients add column if not exists expires_at timestamptz;

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  value numeric not null,
  type text not null check (type in ('income','expense')),
  created_at timestamptz default now()
);

alter table public.clients enable row level security;
alter table public.entries enable row level security;

create policy "clients_owner" on public.clients
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "entries_owner" on public.entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
`
