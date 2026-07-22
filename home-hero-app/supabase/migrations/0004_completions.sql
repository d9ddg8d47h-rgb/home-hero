-- Tracks each time a client marks a prescribed exercise as done for the
-- day. Powers the "mark as done" toggle, streaks, and badges on the
-- client side. One row per prescription per calendar day (toggling just
-- inserts/deletes that row).

create table if not exists public.completions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  prescription_id uuid not null references public.prescriptions(id) on delete cascade,
  completed_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (prescription_id, completed_on)
);

create index if not exists completions_client_id_idx on public.completions(client_id);
create index if not exists completions_prescription_id_idx on public.completions(prescription_id);
create index if not exists completions_completed_on_idx on public.completions(completed_on);

alter table public.completions enable row level security;

-- Clients manage their own completion history.
drop policy if exists "completions: client full access to own completions" on public.completions;
create policy "completions: client full access to own completions"
  on public.completions for all
  using (client_id = auth.uid())
  with check (client_id = auth.uid());

-- Physios can view (read-only) completions logged by their own clients,
-- so a future "progress" view is possible without a schema change.
drop policy if exists "completions: physio can view own clients completions" on public.completions;
create policy "completions: physio can view own clients completions"
  on public.completions for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = completions.client_id
        and profiles.physio_id = auth.uid()
    )
  );
