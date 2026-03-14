alter type booking_status add value if not exists 'waiting_parts';

alter table public.bookings
add column if not exists preferred_start_time text;
