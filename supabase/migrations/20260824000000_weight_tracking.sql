alter table public.profiles
  add column if not exists onboarding_completed_at bigint;

alter table public.profiles
  add column if not exists weight_unit text not null default 'kg';

create table if not exists public.weight_entries (
  user_id uuid not null references auth.users(id) on delete cascade,
  record_key text not null,
  timestamp bigint not null,
  weight_grams integer not null check (weight_grams > 0),
  updated_at bigint not null,
  primary key (user_id, record_key)
);

alter table public.weight_entries enable row level security;
grant select, insert, update, delete on public.weight_entries to authenticated;

drop policy if exists "owner_all" on public.weight_entries;
create policy "owner_all" on public.weight_entries
for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
