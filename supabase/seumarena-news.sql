-- SeumArena lobby news (applied as migration "seumarena_news" on 2026-11-12).
-- Everyone reads; only the lead developer (public.ff_devs role 'owner') can add, change or delete.
-- Pictures go to the existing public bucket ff-images, in the writer's own folder (<uid>/seumarena-news/...).
-- To remove: drop table public.seumarena_news; drop function public.seumarena_news_writer(); drop function public.seumarena_news_touch();
create or replace function public.seumarena_news_writer()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.ff_devs where user_id = auth.uid() and role = 'owner');
$$;

create table public.seumarena_news (
  id text primary key check (id ~ '^[A-Za-z0-9_-]{1,40}$'),
  kind text not null default '공지' check (kind in ('공지','업데이트','이벤트','점검')),
  date date not null default (now() at time zone 'Asia/Seoul')::date,
  title text not null check (char_length(title) between 1 and 120),
  body text check (body is null or char_length(body) <= 4000),
  image text check (image is null or image ~ '^https://'),
  link_label text check (link_label is null or char_length(link_label) <= 30),
  link_url text check (link_url is null or link_url ~ '^https://'),
  popup boolean not null default true,
  pin boolean not null default false,
  start_at timestamptz,
  end_at timestamptz,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.seumarena_news_touch()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at := now(); return new; end $$;
create trigger seumarena_news_touch before update on public.seumarena_news for each row execute function public.seumarena_news_touch();

alter table public.seumarena_news enable row level security;
create policy seumarena_news_read on public.seumarena_news for select using (true);
create policy seumarena_news_ins on public.seumarena_news for insert with check (public.seumarena_news_writer());
create policy seumarena_news_upd on public.seumarena_news for update using (public.seumarena_news_writer()) with check (public.seumarena_news_writer());
create policy seumarena_news_del on public.seumarena_news for delete using (public.seumarena_news_writer());
revoke insert, update, delete on public.seumarena_news from anon;

-- ===== polls (applied as migration "seumarena_news_polls" on 2026-11-12) =====
-- A news item may carry a poll (its title is the question). Signed-in players vote once; counts are public.
alter table public.seumarena_news
  add column poll_options jsonb check (poll_options is null or (jsonb_typeof(poll_options) = 'array' and jsonb_array_length(poll_options) between 2 and 6)),
  add column poll_close_at timestamptz;

create table public.seumarena_news_votes (
  news_id text not null references public.seumarena_news(id) on delete cascade,
  user_id uuid not null,
  choice int not null check (choice between 0 and 5),
  created_at timestamptz not null default now(),
  primary key (news_id, user_id)
);
alter table public.seumarena_news_votes enable row level security;   -- no policies: only the two functions below touch it
revoke all on public.seumarena_news_votes from anon, authenticated;

create or replace function public.seumarena_poll_counts(p_ids text[])
returns table (news_id text, choice int, n bigint, mine boolean)
language sql stable security definer set search_path = public as $$
  select v.news_id, v.choice, count(*), bool_or(v.user_id = auth.uid())
  from public.seumarena_news_votes v
  where v.news_id = any(p_ids)
  group by v.news_id, v.choice;
$$;

create or replace function public.seumarena_poll_vote(p_news text, p_choice int)
returns text language plpgsql security definer set search_path = public as $$
declare v_opts jsonb; v_close timestamptz;
begin
  if auth.uid() is null then return 'login'; end if;
  select poll_options, poll_close_at into v_opts, v_close from public.seumarena_news where id = p_news;
  if v_opts is null or p_choice is null or p_choice < 0 or p_choice >= jsonb_array_length(v_opts) then return 'bad'; end if;
  if v_close is not null and v_close <= now() then return 'closed'; end if;
  insert into public.seumarena_news_votes (news_id, user_id, choice) values (p_news, auth.uid(), p_choice) on conflict do nothing;
  if not found then return 'already'; end if;
  return 'ok';
end $$;

revoke execute on function public.seumarena_poll_vote(text, int) from public, anon;
grant execute on function public.seumarena_poll_vote(text, int) to authenticated;
grant execute on function public.seumarena_poll_counts(text[]) to anon, authenticated;
