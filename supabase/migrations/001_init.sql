create extension if not exists "pgcrypto";

create type booking_status as enum ('pending_payment', 'confirmed', 'in_progress', 'completed', 'cancelled');
create type media_type as enum ('image', 'video');
create type profile_role as enum ('admin', 'staff');

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  make text not null,
  model text not null,
  engine text not null,
  year_from int,
  year_to int,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.job_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.vehicle_services (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  job_type_id uuid not null references public.job_types(id) on delete cascade,
  price_gbp numeric(10,2) not null,
  duration_hours numeric(10,2) not null,
  downtime_label text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (vehicle_id, job_type_id)
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  first_name text not null,
  last_name text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  vehicle_service_id uuid not null references public.vehicle_services(id) on delete restrict,
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  job_type_id uuid not null references public.job_types(id) on delete restrict,
  booking_date date not null,
  status booking_status not null default 'confirmed',
  price_gbp numeric(10,2) not null,
  duration_hours numeric(10,2) not null,
  downtime_label text not null,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  tracking_token text not null unique default encode(gen_random_bytes(18), 'hex'),
  reg_number text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.booking_allocations (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  allocation_date date not null,
  hours_allocated numeric(10,2) not null,
  sequence_no int not null,
  created_at timestamptz not null default now()
);

create table if not exists public.booking_updates (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  title text not null,
  body text not null,
  is_customer_visible boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.booking_media (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  storage_path text not null,
  media_type media_type not null,
  caption text,
  is_customer_visible boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete set null,
  customer_name text not null,
  rating int not null check (rating between 1 and 5),
  body text not null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.business_settings (
  id uuid primary key default gen_random_uuid(),
  workshop_daily_capacity_hours numeric(10,2) not null default 6.5,
  working_days int[] not null default array[1,2,3,4,5],
  business_name text not null default 'Wigan Wetbelts',
  phone text,
  email text,
  stripe_success_url text,
  stripe_cancel_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role profile_role not null default 'staff',
  created_at timestamptz not null default now()
);

insert into public.business_settings (id, workshop_daily_capacity_hours, working_days, business_name, phone, email)
values (
  '00000000-0000-0000-0000-000000000001',
  6.5,
  array[1,2,3,4,5],
  'Wigan Wetbelts',
  '08000982580',
  'accounts@voodoomotorworks.co.uk'
)
on conflict (id) do nothing;

alter table public.vehicles enable row level security;
alter table public.job_types enable row level security;
alter table public.vehicle_services enable row level security;
alter table public.customers enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_allocations enable row level security;
alter table public.booking_updates enable row level security;
alter table public.booking_media enable row level security;
alter table public.reviews enable row level security;
alter table public.business_settings enable row level security;
alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create policy "public read approved reviews" on public.reviews
for select using (is_approved = true);

create policy "public read active vehicles" on public.vehicles
for select using (is_active = true);

create policy "public read active job types" on public.job_types
for select using (is_active = true);

create policy "public read active vehicle services" on public.vehicle_services
for select using (is_active = true);

create policy "customer read own tracking booking by token" on public.bookings
for select using (true);

create policy "admin full vehicles" on public.vehicles
for all using (public.is_admin()) with check (public.is_admin());

create policy "admin full job types" on public.job_types
for all using (public.is_admin()) with check (public.is_admin());

create policy "admin full vehicle services" on public.vehicle_services
for all using (public.is_admin()) with check (public.is_admin());

create policy "admin full customers" on public.customers
for all using (public.is_admin()) with check (public.is_admin());

create policy "admin full bookings" on public.bookings
for all using (public.is_admin()) with check (public.is_admin());

create policy "admin full allocations" on public.booking_allocations
for all using (public.is_admin()) with check (public.is_admin());

create policy "admin full booking updates" on public.booking_updates
for all using (public.is_admin()) with check (public.is_admin());

create policy "admin full booking media" on public.booking_media
for all using (public.is_admin()) with check (public.is_admin());

create policy "admin full reviews" on public.reviews
for all using (public.is_admin()) with check (public.is_admin());

create policy "admin full settings" on public.business_settings
for all using (public.is_admin()) with check (public.is_admin());

create policy "admin full profiles" on public.profiles
for all using (public.is_admin()) with check (public.is_admin());

create index if not exists idx_vehicles_make_model on public.vehicles (make, model);
create index if not exists idx_bookings_status_date on public.bookings (status, booking_date);
create index if not exists idx_booking_allocations_date on public.booking_allocations (allocation_date);
create index if not exists idx_reviews_approved on public.reviews (is_approved, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_business_settings_updated_at on public.business_settings;
create trigger trg_business_settings_updated_at
before update on public.business_settings
for each row
execute function public.set_updated_at();
