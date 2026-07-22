-- Home Hero: richer exercise library fields — clinical detail a physio can
-- fill in, and a parent-friendly tip surfaced directly to families.

alter table public.exercises add column if not exists body_area text;
alter table public.exercises add column if not exists difficulty text;
alter table public.exercises add column if not exists equipment text;
alter table public.exercises add column if not exists progression_tip text;
alter table public.exercises add column if not exists regression_tip text;
alter table public.exercises add column if not exists parent_tip text;
