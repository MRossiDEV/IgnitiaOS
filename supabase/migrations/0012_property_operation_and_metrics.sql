-- ======================================================
-- Property operation (sale/rent) + neighborhood price/m²
-- supabase/migrations/0012_property_operation_and_metrics.sql
-- ======================================================
-- `operation` lets rental-yield math tell sale listings apart from
-- rentals (existing rows default to 'unknown' until the ingestion
-- nodes are updated to actually populate it going forward).
-- `median_price_per_m2` completes the four key metrics
-- (price/m², rental yield, inventory, days on market) as first-class
-- columns on both the current-state and historical-snapshot tables.

alter table public.re_properties
  add column if not exists operation character varying(10) not null default 'unknown';

alter table public.re_property_snapshots
  add column if not exists operation character varying(10);

alter table public.re_neighborhoods
  add column if not exists median_price_per_m2 numeric(14, 2);

alter table public.re_neighborhood_snapshots
  add column if not exists median_price_per_m2 numeric(14, 2);
