-- Migration: initial schema for Immersive_AI_service_project09 (회의실 예약 시스템)

-- Extensions
create extension if not exists "pgcrypto";

-- Enum: reservation status
do $$
begin
  if not exists (select 1 from pg_type where typname = 'reservation_status') then
    create type public.reservation_status as enum ('confirmed', 'cancelled');
  end if;
end $$;

-- Table: meeting_rooms
create table if not exists public.meeting_rooms (
  id          uuid primary key default gen_random_uuid(),
  room_number integer not null unique check (room_number between 1 and 6),
  room_name   text not null,
  capacity    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Table: reservations
create table if not exists public.reservations (
  id            uuid primary key default gen_random_uuid(),
  room_id       uuid not null references public.meeting_rooms(id) on delete cascade,
  reserver_name text not null,
  meeting_title text not null,
  start_time    timestamptz not null,
  end_time      timestamptz not null,
  status        public.reservation_status not null default 'confirmed',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint reservations_time_order check (end_time > start_time)
);

create index if not exists reservations_room_time_idx on public.reservations (room_id, start_time);
create index if not exists reservations_status_idx on public.reservations (status);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_meeting_rooms_updated_at on public.meeting_rooms;
create trigger trg_meeting_rooms_updated_at before update on public.meeting_rooms
  for each row execute function public.set_updated_at();

drop trigger if exists trg_reservations_updated_at on public.reservations;
create trigger trg_reservations_updated_at before update on public.reservations
  for each row execute function public.set_updated_at();

-- Prevent overlapping confirmed reservations in the same room (btree_gist required for exclusion on uuid + range)
create extension if not exists btree_gist;
alter table public.reservations
  drop constraint if exists reservations_no_overlap;
alter table public.reservations
  add constraint reservations_no_overlap
  exclude using gist (
    room_id with =,
    tstzrange(start_time, end_time) with &&
  ) where (status = 'confirmed');

-- Row Level Security (MVP: no auth; allow anon read/insert/update)
alter table public.meeting_rooms enable row level security;
alter table public.reservations enable row level security;

drop policy if exists "meeting_rooms read" on public.meeting_rooms;
create policy "meeting_rooms read" on public.meeting_rooms for select using (true);

drop policy if exists "reservations read" on public.reservations;
create policy "reservations read" on public.reservations for select using (true);

drop policy if exists "reservations insert" on public.reservations;
create policy "reservations insert" on public.reservations for insert with check (true);

drop policy if exists "reservations update" on public.reservations;
create policy "reservations update" on public.reservations for update using (true) with check (true);

-- Realtime
alter publication supabase_realtime add table public.reservations;
