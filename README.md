# Wigan Wetbelts

Production minded starter for a vehicle booking and workshop progress platform built with:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- Stripe Checkout

## Core features included

- Public pages: Home, Book, Reviews, Contact
- Admin pages: login, dashboard, calendar, bookings, booking detail, vehicles, services, reviews, settings
- Workshop capacity engine with automatic carry over into next working day
- Stripe Checkout session creation
- Stripe webhook that creates bookings only after successful payment
- Customer tracking portal by secure token
- Review submission and admin approval flow
- Supabase SQL schema and starter row level security ideas

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Suggested setup order

1. Create Supabase project
2. Run SQL inside `supabase/migrations/001_init.sql`
3. Create storage bucket `booking-media`
4. Add environment variables
5. Create Stripe product mode keys and webhook
6. Test with Stripe CLI locally

## Notes

This scaffold gives you the full structure and core starter code. You will still want to tailor:
- business hours and non working days
- exact dropdown seed data
- email or SMS notifications
- admin permissions and polish
- production validation and observability
