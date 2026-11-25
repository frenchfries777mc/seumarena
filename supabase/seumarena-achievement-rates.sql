-- SeumArena: anonymous achievement rates ("what % of players have this achievement").
-- A player is a random id made in the browser; no account, name or other personal data is stored.
-- To remove everything again:
--   drop function public.seumarena_ach_sync(uuid, text[]); drop table public.seumarena_ach_done; drop table public.seumarena_ach_players;
create table public.seumarena_ach_players (
  pid uuid primary key,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now()
);
create table public.seumarena_ach_done (
  pid uuid not null references public.seumarena_ach_players(pid) on delete cascade,
  ach text not null check (ach ~ '^[a-z0-9_]{1,24}$'),
  at timestamptz not null default now(),
  primary key (pid, ach)
);
create index seumarena_ach_done_ach_idx on public.seumarena_ach_done (ach);
alter table public.seumarena_ach_players enable row level security;
alter table public.seumarena_ach_done enable row level security;
-- no policies: the tables are reached only through the function below

create function public.seumarena_ach_sync(p_pid uuid, p_achs text[])
returns jsonb language plpgsql security definer set search_path = '' as $$
declare res jsonb;
begin
  if p_pid is null then raise exception 'pid required'; end if;
  insert into public.seumarena_ach_players (pid) values (p_pid)
    on conflict (pid) do update set last_seen = now();
  if coalesce(array_length(p_achs, 1), 0) between 1 and 64
     and (select count(*) from public.seumarena_ach_done d where d.pid = p_pid) < 64 then
    insert into public.seumarena_ach_done (pid, ach)
      select distinct p_pid, a from unnest(p_achs) a where a ~ '^[a-z0-9_]{1,24}$'
      on conflict do nothing;
  end if;
  select jsonb_build_object(
    'players', (select count(*) from public.seumarena_ach_players),
    'ach', coalesce((select jsonb_object_agg(t.ach, t.c) from (select d.ach, count(*) c from public.seumarena_ach_done d group by d.ach) t), '{}'::jsonb)
  ) into res;
  return res;
end $$;
revoke all on function public.seumarena_ach_sync(uuid, text[]) from public;
grant execute on function public.seumarena_ach_sync(uuid, text[]) to anon, authenticated;
