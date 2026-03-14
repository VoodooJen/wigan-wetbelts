insert into public.job_types (name, slug, description)
values
  ('Wet belt replacement', 'wet-belt-replacement', 'Wet belt replacement service'),
  ('Timing belt replacement', 'timing-belt-replacement', 'Timing belt replacement service'),
  ('Timing chain replacement', 'timing-chain-replacement', 'Timing chain replacement service')
on conflict (slug) do nothing;

insert into public.vehicles (make, model, engine, year_from, year_to, sort_order)
values
  ('Ford', 'EcoSport', '1.0 EcoBoost', 2018, null, 10),
  ('Ford', 'Focus', '1.0 EcoBoost', 2018, null, 20),
  ('Peugeot', '208', '1.2 PureTech', 2015, null, 30)
on conflict do nothing;
