-- Execute este ficheiro uma vez no SQL Editor de um projeto Supabase alojado na UE.
-- Todas as tabelas exigem uma sessão autenticada e isolam os dados por auth.uid().

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  avatar_path text,
  display_name text not null default 'Utilizador KYNIO',
  bio text not null default '',
  total_xp integer not null default 0,
  streak_days integer not null default 0,
  updated_at bigint not null default 0
);

alter table public.profiles add column if not exists avatar_path text;

create table if not exists public.fasts (
  user_id uuid not null references auth.users(id) on delete cascade,
  record_key text not null,
  start_time bigint not null,
  end_time bigint not null,
  target_hours integer not null,
  completed boolean not null default false,
  xp_earned integer not null default 0,
  updated_at bigint not null,
  primary key (user_id, record_key)
);

create table if not exists public.meals (
  user_id uuid not null references auth.users(id) on delete cascade,
  record_key text not null,
  timestamp bigint not null,
  estimated_calories integer,
  protein_grams double precision,
  carbs_grams double precision,
  fat_grams double precision,
  tags jsonb not null default '[]'::jsonb,
  xp_earned integer not null default 0,
  updated_at bigint not null,
  primary key (user_id, record_key)
);

create table if not exists public.workouts (
  user_id uuid not null references auth.users(id) on delete cascade,
  record_key text not null,
  timestamp bigint not null,
  type text not null,
  duration_minutes integer not null,
  effort text not null check (effort in ('light', 'moderate', 'intense')),
  notes text,
  xp_earned integer not null default 0,
  updated_at bigint not null,
  primary key (user_id, record_key)
);

create table if not exists public.friend_contacts (
  user_id uuid not null references auth.users(id) on delete cascade,
  record_key text not null,
  display_name text not null,
  created_at bigint not null,
  updated_at bigint not null,
  primary key (user_id, record_key)
);

alter table public.profiles enable row level security;
alter table public.fasts enable row level security;
alter table public.meals enable row level security;
alter table public.workouts enable row level security;
alter table public.friend_contacts enable row level security;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.fasts to authenticated;
grant select, insert, update, delete on public.meals to authenticated;
grant select, insert, update, delete on public.workouts to authenticated;
grant select, insert, update, delete on public.friend_contacts to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['profiles', 'fasts', 'meals', 'workouts', 'friend_contacts']
  loop
    execute format('drop policy if exists "owner_all" on public.%I', table_name);
    execute format(
      'create policy "owner_all" on public.%I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      table_name
    );
  end loop;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-avatars',
  'profile-avatars',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatar_owner_select" on storage.objects;
drop policy if exists "avatar_owner_insert" on storage.objects;
drop policy if exists "avatar_owner_update" on storage.objects;
drop policy if exists "avatar_owner_delete" on storage.objects;

create policy "avatar_owner_select" on storage.objects for select to authenticated
using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatar_owner_insert" on storage.objects for insert to authenticated
with check (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatar_owner_update" on storage.objects for update to authenticated
using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatar_owner_delete" on storage.objects for delete to authenticated
using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Limitação anónima da função de análise de refeições. Guarda apenas um hash
-- salgado e temporário do endereço de rede; nunca guarda fotografias ou descrições.
create table if not exists public.ai_rate_limits (
  request_key text primary key,
  window_start bigint not null,
  request_count integer not null default 1,
  expires_at bigint not null
);

alter table public.ai_rate_limits enable row level security;
revoke all on public.ai_rate_limits from anon, authenticated;
grant select, insert, update, delete on public.ai_rate_limits to service_role;

create or replace function public.consume_ai_rate_limit(
  p_request_key text,
  p_window_start bigint,
  p_expires_at bigint,
  p_limit integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_rows integer;
begin
  delete from public.ai_rate_limits where expires_at < (extract(epoch from now()) * 1000)::bigint;

  insert into public.ai_rate_limits (request_key, window_start, request_count, expires_at)
  values (p_request_key, p_window_start, 1, p_expires_at)
  on conflict (request_key) do update
    set request_count = public.ai_rate_limits.request_count + 1,
        expires_at = excluded.expires_at
    where public.ai_rate_limits.request_count < p_limit;

  get diagnostics affected_rows = row_count;
  return affected_rows > 0;
end;
$$;

revoke all on function public.consume_ai_rate_limit(text, bigint, bigint, integer) from public;
grant execute on function public.consume_ai_rate_limit(text, bigint, bigint, integer) to service_role;
