-- Klyron Consulting — Supabase schema
-- Run this once in a fresh project's SQL Editor (Dashboard → SQL Editor → New query).
-- Recreates what the frontend (Contact.js, MeetingScheduler.js) expects.

-- === contact_messages ===
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  company text,
  message text not null
);

alter table public.contact_messages enable row level security;

create policy "Anyone can submit a contact message"
  on public.contact_messages for insert
  to anon
  with check (true);

grant insert on public.contact_messages to anon;

-- === meeting_requests ===
create table if not exists public.meeting_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  company text,
  notes text,
  date date not null,
  time text not null,
  timezone text,
  status text not null default 'pending'
);

alter table public.meeting_requests enable row level security;

create policy "Anyone can submit a meeting request"
  on public.meeting_requests for insert
  to anon
  with check (true);

grant insert on public.meeting_requests to anon;

-- get_booked_times: lets the booking widget know which time slots on a given
-- date are already taken, without exposing the rest of each booking's data.
create or replace function public.get_booked_times(booking_date date)
returns table (booked_time text)
language sql
security definer
set search_path = public
as $$
  select time as booked_time
  from public.meeting_requests
  where date = booking_date;
$$;

grant execute on function public.get_booked_times(date) to anon;

-- === Database Webhooks (via pg_net) ===
-- Fires the two Edge Functions automatically whenever a row is inserted.
-- Run this AFTER both functions are deployed. Replace <ANON_KEY> with the
-- project's anon public key (Project Settings → API).

create extension if not exists pg_net with schema extensions;

create or replace function public.notify_new_contact()
returns trigger
language plpgsql
security definer
as $$
begin
  perform net.http_post(
    url := 'https://uvmdhmvuqznyuzafvsti.supabase.co/functions/v1/notify-new-contact',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <ANON_KEY>'
    ),
    body := jsonb_build_object('record', to_jsonb(NEW))
  );
  return NEW;
end;
$$;

drop trigger if exists on_contact_message_insert on public.contact_messages;
create trigger on_contact_message_insert
  after insert on public.contact_messages
  for each row execute function public.notify_new_contact();

create or replace function public.notify_new_meeting()
returns trigger
language plpgsql
security definer
as $$
begin
  perform net.http_post(
    url := 'https://uvmdhmvuqznyuzafvsti.supabase.co/functions/v1/notify-new-meeting',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <ANON_KEY>'
    ),
    body := jsonb_build_object('record', to_jsonb(NEW))
  );
  return NEW;
end;
$$;

drop trigger if exists on_meeting_request_insert on public.meeting_requests;
create trigger on_meeting_request_insert
  after insert on public.meeting_requests
  for each row execute function public.notify_new_meeting();
