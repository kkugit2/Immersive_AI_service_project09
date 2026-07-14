-- Migration: pin a stable search_path on functions (addresses function_search_path_mutable advisor).
-- Functions already fully-qualify their table references; pg_catalog is always searched implicitly.

alter function public.set_updated_at() set search_path = '';
alter function public.check_reservation_overlap() set search_path = '';
