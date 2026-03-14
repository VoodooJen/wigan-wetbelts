do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'payment_status'
  ) then
    create type payment_status as enum ('pending', 'booking_fee_paid', 'fully_paid', 'refunded', 'cancelled');
  end if;
end $$;

alter table public.bookings
add column if not exists booking_fee_paid_gbp numeric(10,2) not null default 0,
add column if not exists remaining_balance_gbp numeric(10,2) not null default 0,
add column if not exists payment_status payment_status not null default 'pending';

update public.bookings
set
  booking_fee_paid_gbp = case
    when status = 'cancelled' then 0
    else least(price_gbp, 50)
  end,
  remaining_balance_gbp = case
    when status = 'cancelled' then 0
    when stripe_payment_intent_id is not null then 0
    else greatest(price_gbp - least(price_gbp, 50), 0)
  end,
  payment_status = case
    when status = 'cancelled' then 'cancelled'::payment_status
    when stripe_payment_intent_id is not null then 'fully_paid'::payment_status
    when status = 'pending_payment' then 'pending'::payment_status
    else 'pending'::payment_status
  end
where true;
