-- Klyron private admin dashboard
-- Run in Supabase SQL Editor after schema.sql.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'admin' check (role in ('admin', 'viewer')),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_klyron_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_klyron_admin() from public;
grant execute on function public.is_klyron_admin() to authenticated;

drop policy if exists "Admins can read their profile" on public.admin_users;
create policy "Admins can read their profile"
  on public.admin_users for select
  to authenticated
  using (user_id = auth.uid());

alter table public.meeting_requests
  add column if not exists internal_notes text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.contact_messages
  add column if not exists status text not null default 'new',
  add column if not exists internal_notes text,
  add column if not exists updated_at timestamptz not null default now();

-- Keep public forms append-only and prevent anonymous callers from assigning
-- themselves an internal status or writing private notes.
drop policy if exists "Anyone can submit a meeting request" on public.meeting_requests;
create policy "Anyone can submit a meeting request"
  on public.meeting_requests for insert
  to anon
  with check (status = 'pending' and internal_notes is null);

drop policy if exists "Anyone can submit a contact message" on public.contact_messages;
create policy "Anyone can submit a contact message"
  on public.contact_messages for insert
  to anon
  with check (status = 'new' and internal_notes is null);

alter table public.meeting_requests
  drop constraint if exists meeting_requests_status_check;
alter table public.meeting_requests
  add constraint meeting_requests_status_check
  check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no_show'));

alter table public.contact_messages
  drop constraint if exists contact_messages_status_check;
alter table public.contact_messages
  add constraint contact_messages_status_check
  check (status in ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost'));

drop policy if exists "Admins can read meetings" on public.meeting_requests;
create policy "Admins can read meetings"
  on public.meeting_requests for select
  to authenticated
  using (public.is_klyron_admin());

drop policy if exists "Admins can update meetings" on public.meeting_requests;
create policy "Admins can update meetings"
  on public.meeting_requests for update
  to authenticated
  using (public.is_klyron_admin())
  with check (public.is_klyron_admin());

drop policy if exists "Admins can read enquiries" on public.contact_messages;
create policy "Admins can read enquiries"
  on public.contact_messages for select
  to authenticated
  using (public.is_klyron_admin());

drop policy if exists "Admins can update enquiries" on public.contact_messages;
create policy "Admins can update enquiries"
  on public.contact_messages for update
  to authenticated
  using (public.is_klyron_admin())
  with check (public.is_klyron_admin());

grant select, update on public.meeting_requests to authenticated;
grant select, update on public.contact_messages to authenticated;
grant select on public.admin_users to authenticated;

create index if not exists meeting_requests_date_status_idx on public.meeting_requests(date, status);
create index if not exists contact_messages_created_status_idx on public.contact_messages(created_at desc, status);

-- After creating an Auth user in Supabase Authentication, grant access with:
-- insert into public.admin_users (user_id, full_name, role)
-- select id, 'Administrator', 'admin' from auth.users where email = 'YOUR_ADMIN_EMAIL';
