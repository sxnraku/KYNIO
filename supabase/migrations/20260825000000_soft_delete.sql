-- Soft delete: tombstones remotos para jejuns e refeições, para que um
-- registo apagado num dispositivo seja propagado aos restantes no sync.
alter table public.fasts
  add column if not exists deleted_at bigint;

alter table public.meals
  add column if not exists deleted_at bigint;
