alter table public.packages
  add column if not exists marketplace_stop_number integer
  check (marketplace_stop_number > 0);

alter table public.route_stops
  add column if not exists marketplace_stop_number integer
  check (marketplace_stop_number > 0);

create index if not exists packages_route_marketplace_stop_idx
  on public.packages(route_id, marketplace_stop_number);
