-- Migration: replace exclusion constraint with a BEFORE trigger for overlap prevention.
--
-- Rationale: the source seed data (meetingroom_reservations.xlsx) contains one
-- legacy double-booking (room 3, 2026-07-13 16:00~18:00 vs 16:00~17:00, both confirmed).
-- A table-level EXCLUDE constraint cannot grandfather existing rows (no NOT VALID for
-- exclusion constraints), so we enforce the rule with a trigger that only fires on new
-- INSERT/UPDATE. Historical overlaps loaded by seed.sql (with the trigger disabled) are
-- preserved, while all new/edited confirmed reservations are still blocked from overlapping.

-- Drop the exclusion constraint from 0001 (behavior now provided by the trigger below).
alter table public.reservations
  drop constraint if exists reservations_no_overlap;

create or replace function public.check_reservation_overlap()
returns trigger language plpgsql as $$
begin
  if new.status = 'confirmed' then
    if exists (
      select 1
      from public.reservations r
      where r.room_id = new.room_id
        and r.id <> new.id
        and r.status = 'confirmed'
        and tstzrange(r.start_time, r.end_time) && tstzrange(new.start_time, new.end_time)
    ) then
      -- 23P01 = exclusion_violation, so the client can detect a time conflict consistently.
      raise exception 'Overlapping confirmed reservation for room %', new.room_id
        using errcode = '23P01';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_reservations_no_overlap on public.reservations;
create trigger trg_reservations_no_overlap
  before insert or update on public.reservations
  for each row execute function public.check_reservation_overlap();
