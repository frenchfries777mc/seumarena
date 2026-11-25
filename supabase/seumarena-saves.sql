-- SeumArena player saves (gold, karma, mastery, achievements, quests, attendance, titles, skins owned and worn, emotes,
-- character and skill choices). One row per Frenchfries777 account; a player reads and writes only their own row.
-- Same pattern as public.beaconfall_saves, plus a revision number so two devices never write over each other blindly.
-- Run once in Supabase > SQL Editor (or applied as migration "seumarena_saves").
-- To remove: drop table public.seumarena_saves; drop function public.seumarena_saves_touch();

create table if not exists public.seumarena_saves (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 200000),
  rev integer not null default 1 check (rev >= 1),
  updated_at timestamptz not null default now()
);

create or replace function public.seumarena_saves_touch()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at := now(); return new; end $$;
drop trigger if exists seumarena_saves_touch on public.seumarena_saves;
create trigger seumarena_saves_touch before update on public.seumarena_saves for each row execute function public.seumarena_saves_touch();

alter table public.seumarena_saves enable row level security;
drop policy if exists seumarena_saves_select_own on public.seumarena_saves;
create policy seumarena_saves_select_own on public.seumarena_saves for select to authenticated using (auth.uid() = user_id);
drop policy if exists seumarena_saves_insert_own on public.seumarena_saves;
create policy seumarena_saves_insert_own on public.seumarena_saves for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists seumarena_saves_update_own on public.seumarena_saves;
create policy seumarena_saves_update_own on public.seumarena_saves for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- no delete policy: a save cannot be deleted from the game
revoke all on public.seumarena_saves from anon;
grant select, insert, update on public.seumarena_saves to authenticated;


-- ===================== test (run separately; everything is rolled back at the end) =====================
-- It pretends to be two different signed-in players and checks that each sees and changes only their own row.
-- Expected results are written next to each step. Nothing stays in the table afterwards.
/*
begin;
-- two real account ids from auth.users (any two)
create temp table t_ids as select id from auth.users order by created_at limit 2;
grant select on t_ids to authenticated, anon;

-- player A writes a save
select set_config('request.jwt.claims', json_build_object('sub', (select id from t_ids order by id limit 1), 'role', 'authenticated')::text, true);
set local role authenticated;
insert into public.seumarena_saves (user_id, data) values ((select id from t_ids order by id limit 1), '{"cos":{"gold":123}}');
select count(*) as a_sees_rows from public.seumarena_saves;                          -- 1 (only A's own row)

-- player A tries to write a row for player B: must fail
savepoint s1;
insert into public.seumarena_saves (user_id, data) values ((select id from t_ids order by id desc limit 1), '{}');   -- ERROR: new row violates row-level security policy
rollback to savepoint s1;

-- player B
reset role;
select set_config('request.jwt.claims', json_build_object('sub', (select id from t_ids order by id desc limit 1), 'role', 'authenticated')::text, true);
set local role authenticated;
select count(*) as b_sees_rows from public.seumarena_saves;                          -- 0 (B cannot see A's row)
with u as (update public.seumarena_saves set data = '{"cos":{"gold":999999}}' returning 1) select count(*) as b_changed_rows from u;   -- 0 (B cannot change A's row)

-- not signed in (anon)
reset role;
set local role anon;
savepoint s2;
select count(*) from public.seumarena_saves;                                         -- ERROR: permission denied (anon has no access)
rollback to savepoint s2;

reset role;
select data->'cos'->>'gold' as a_gold_still from public.seumarena_saves;             -- 123 (B's attempt changed nothing)
rollback;
*/
