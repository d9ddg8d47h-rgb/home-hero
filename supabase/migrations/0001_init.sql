-- Home Hero: core schema
-- Run this once against your Supabase project (SQL Editor, or `supabase db push`).

create extension if not exists "pgcrypto";

-- One row per auth.users user. role tells us whether they're the physio
-- (clinic admin) or a client (parent/caregiver). Clients are scoped to the
-- physio who created them via physio_id.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('physio', 'client')),
  full_name text not null default '',
  email text not null,
  physio_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists profiles_physio_id_idx on public.profiles(physio_id);

-- The physio's reusable exercise library.
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  physio_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text not null default '',
  video_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists exercises_physio_id_idx on public.exercises(physio_id);

-- An exercise assigned to a specific client, with sets/reps/notes.
create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  sets int,
  reps int,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists prescriptions_client_id_idx on public.prescriptions(client_id);
create index if not exists prescriptions_exercise_id_idx on public.prescriptions(exercise_id);

-- Auto-create a profile row whenever a new auth.users row is created.
-- Physio self-signup omits metadata -> defaults to role 'physio'.
-- Client accounts are created by a physio via the admin API with
-- user_metadata = { role: 'client', full_name, physio_id }.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, email, physio_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'physio'),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    nullif(new.raw_user_meta_data->>'physio_id', '')::uuid
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists exercises_touch_updated_at on public.exercises;
create trigger exercises_touch_updated_at
  before update on public.exercises
  for each row execute procedure public.touch_updated_at();

drop trigger if exists prescriptions_touch_updated_at on public.prescriptions;
create trigger prescriptions_touch_updated_at
  before update on public.prescriptions
  for each row execute procedure public.touch_updated_at();

-- Row Level Security -------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.prescriptions enable row level security;

-- profiles: a physio can see their own row + their clients' rows.
-- a client can see only their own row.
drop policy if exists "profiles: physio can view self and own clients" on public.profiles;
create policy "profiles: physio can view self and own clients"
  on public.profiles for select
  using (id = auth.uid() or physio_id = auth.uid());

drop policy if exists "profiles: physio can update own clients" on public.profiles;
create policy "profiles: physio can update own clients"
  on public.profiles for update
  using (physio_id = auth.uid())
  with check (physio_id = auth.uid());

drop policy if exists "profiles: user can update own row" on public.profiles;
create policy "profiles: user can update own row"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "profiles: physio can delete own clients" on public.profiles;
create policy "profiles: physio can delete own clients"
  on public.profiles for delete
  using (physio_id = auth.uid());

-- exercises: physio has full control over their own library.
-- clients can read exercises that have been prescribed to them.
drop policy if exists "exercises: physio full access to own library" on public.exercises;
create policy "exercises: physio full access to own library"
  on public.exercises for all
  using (physio_id = auth.uid())
  with check (physio_id = auth.uid());

drop policy if exists "exercises: client can view prescribed exercises" on public.exercises;
create policy "exercises: client can view prescribed exercises"
  on public.exercises for select
  using (
    exists (
      select 1 from public.prescriptions p
      where p.exercise_id = exercises.id
        and p.client_id = auth.uid()
    )
  );

-- prescriptions: physio manages prescriptions for their own clients.
-- clients can view their own prescriptions.
drop policy if exists "prescriptions: physio full access for own clients" on public.prescriptions;
create policy "prescriptions: physio full access for own clients"
  on public.prescriptions for all
  using (
    exists (
      select 1 from public.profiles c
      where c.id = prescriptions.client_id
        and c.physio_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profiles c
      where c.id = prescriptions.client_id
        and c.physio_id = auth.uid()
    )
  );

drop policy if exists "prescriptions: client can view own" on public.prescriptions;
create policy "prescriptions: client can view own"
  on public.prescriptions for select
  using (client_id = auth.uid());
