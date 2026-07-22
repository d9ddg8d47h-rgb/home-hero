-- Home Hero: coins (derived from completions, no new table needed), an
-- avatar a client can personalise, and persisted "treasure chest" opens so
-- the unlock reveal animation only plays once per milestone.

alter table public.profiles add column if not exists avatar_emoji text;

create table if not exists public.client_rewards (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  reward_type text not null check (reward_type in ('chest')),
  reward_key text not null,
  unlocked_at timestamptz not null default now(),
  unique (client_id, reward_type, reward_key)
);
create index if not exists client_rewards_client_id_idx on public.client_rewards(client_id);
alter table public.client_rewards enable row level security;

drop policy if exists "client_rewards: client full access to own rewards" on public.client_rewards;
create policy "client_rewards: client full access to own rewards"
  on public.client_rewards for all
  using (client_id = auth.uid())
  with check (client_id = auth.uid());

drop policy if exists "client_rewards: physio can view own clients rewards" on public.client_rewards;
create policy "client_rewards: physio can view own clients rewards"
  on public.client_rewards for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = client_rewards.client_id
        and profiles.physio_id = auth.uid()
    )
  );
