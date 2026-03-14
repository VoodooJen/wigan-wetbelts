do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'booking_hold_status'
  ) then
    create type booking_hold_status as enum ('active', 'converted', 'expired', 'cancelled');
  end if;
end $$;

create table if not exists public.booking_holds (
  id uuid primary key default gen_random_uuid(),
  vehicle_service_id uuid not null references public.vehicle_services(id) on delete cascade,
  preferred_start_date date not null,
  preferred_start_time text not null,
  allocations_json jsonb not null,
  expires_at timestamptz not null,
  status booking_hold_status not null default 'active',
  created_at timestamptz not null default now()
);

alter table public.booking_holds enable row level security;

create policy "admin full booking holds" on public.booking_holds
for all using (public.is_admin()) with check (public.is_admin());

create index if not exists idx_booking_holds_status_expiry
on public.booking_holds (status, expires_at);

create index if not exists idx_booking_holds_start_date
on public.booking_holds (preferred_start_date);
