-- Home Hero: program builder upgrade — explicit ordering for a client's
-- prescribed exercises, plus reusable program templates a physio can save
-- and apply to any client (or use to duplicate one client's program onto
-- another).

alter table public.prescriptions add column if not exists order_index int not null default 0;
create index if not exists prescriptions_order_idx on public.prescriptions(client_id, order_index);

create table if not exists public.program_templates (
  id uuid primary key default gen_random_uuid(),
  physio_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
create index if not exists program_templates_physio_id_idx on public.program_templates(physio_id);
alter table public.program_templates enable row level security;
drop policy if exists "program_templates: physio full access to own templates" on public.program_templates;
create policy "program_templates: physio full access to own templates"
  on public.program_templates for all
  using (physio_id = auth.uid())
  with check (physio_id = auth.uid());

create table if not exists public.program_template_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.program_templates(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  sets int,
  reps int,
  note text,
  order_index int not null default 0
);
create index if not exists program_template_items_template_id_idx on public.program_template_items(template_id);
alter table public.program_template_items enable row level security;
drop policy if exists "program_template_items: physio full access via own template" on public.program_template_items;
create policy "program_template_items: physio full access via own template"
  on public.program_template_items for all
  using (
    exists (
      select 1 from public.program_templates t
      where t.id = program_template_items.template_id
        and t.physio_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.program_templates t
      where t.id = program_template_items.template_id
        and t.physio_id = auth.uid()
    )
  );
