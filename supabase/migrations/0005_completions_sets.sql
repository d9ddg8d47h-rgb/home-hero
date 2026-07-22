-- Home Hero: track progress per-set, not just per-exercise, so a client
-- can tap off "set 1 done", "set 2 done", etc. and see it fill in live,
-- instead of one all-or-nothing "mark as done" per exercise.

alter table public.completions add column if not exists sets_done int not null default 1;

alter table public.completions drop constraint if exists completions_sets_done_check;
alter table public.completions add constraint completions_sets_done_check check (sets_done >= 0);
