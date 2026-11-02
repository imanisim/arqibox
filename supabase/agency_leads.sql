-- Run in the ARQWELL Agency Supabase project (separate from a public library is preferable).
create table if not exists public.agency_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('candidate','employer','training')),
  full_name text not null,
  email text not null,
  phone text,
  organization text,
  location text not null,
  role text not null,
  discipline text not null,
  availability text not null,
  details jsonb not null default '{}'::jsonb,
  consent boolean not null check (consent = true),
  share_permission boolean not null default false,
  status text not null default 'new' check (status in ('new','contacted','qualified','matched','closed'))
);
create index if not exists agency_leads_type_status_idx on public.agency_leads (type, status, created_at desc);
create index if not exists agency_leads_email_created_idx on public.agency_leads (email, created_at desc);
alter table public.agency_leads enable row level security;
-- Zero anonymous reads or writes. Only the verified Edge Function with service role may insert.
revoke all on public.agency_leads from public, anon, authenticated;
grant select, insert, update on public.agency_leads to service_role;
-- No anon/authenticated RLS policies are created intentionally.

-- If the previous two-sided table already exists, expand the type check:
alter table public.agency_leads drop constraint if exists agency_leads_type_check;
alter table public.agency_leads add constraint agency_leads_type_check check (type in ('candidate','employer','training'));
