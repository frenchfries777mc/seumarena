-- SeumArena 랭크전 · 길드 · 길드 대항전
-- Supabase > SQL Editor 에서 한 번 실행. 여러 번 실행해도 됨.
-- 실행 뒤 마지막 줄 안내대로 서버 키를 한 번 넣어 주세요 (오라클 서버의 /etc/sa-host.env SA_SB_KEY 와 같은 값).

-- 서버 키 (클라이언트는 못 읽음). 서버만 경기 결과를 기록할 수 있게 함
create table if not exists public.seumarena_srv (k text primary key, v text not null);
alter table public.seumarena_srv enable row level security;
revoke all on public.seumarena_srv from anon, authenticated;

create or replace function public.seumarena_srv_ok(p_key text) returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(length(p_key) >= 24 and p_key = (select v from public.seumarena_srv where k = 'key'), false) $$;
revoke all on function public.seumarena_srv_ok(text) from public, anon, authenticated;

-- 욕설 거르기 (채팅·길드 이름·소개)
create or replace function public.seumarena_clean(t text, n int) returns text language sql immutable as $$
  select left(regexp_replace(regexp_replace(coalesce(t, ''), '[\x00-\x1f<>]', '', 'g'),
    '(시발|씨발|ㅅㅂ|병신|ㅂㅅ|개새끼|새끼|좆|존나|fuck|shit)', '**', 'gi'), n) $$;

------------------------------------------------------------------ 랭크전
-- 점수 rp: 한 칸 100점. 칸 0-2 브론즈, 3-5 실버, 6-8 골드, 9-11 플래티넘, 12-14 다이아, 15-19 마스터, 20-24 그랜드마스터, 25~ 챔피언
create table if not exists public.seumarena_rank (
  user_id     uuid primary key,
  season      text not null,
  rp          int  not null default 0,
  peak        int  not null default 0,       -- 이번 시즌 최고 점수
  games       int  not null default 0,
  wins        int  not null default 0,
  shield      boolean not null default false, -- 승급 직후 첫 패배 0점
  nick        text not null default '',
  ban_until   timestamptz,
  last_season text,
  last_peak   int,
  updated     timestamptz not null default now()
);
alter table public.seumarena_rank enable row level security;
revoke all on public.seumarena_rank from anon, authenticated;
grant select on public.seumarena_rank to anon, authenticated;
drop policy if exists "rank read" on public.seumarena_rank;
create policy "rank read" on public.seumarena_rank for select using (true);
create index if not exists seumarena_rank_top on public.seumarena_rank (season, rp desc);

-- 새 시즌 시작점: 마스터 이상 -> 플래티넘 I, 다이아 -> 골드 I, 그 아래는 그대로
create or replace function public.seumarena_rank_reset(rp int) returns int language sql immutable as $$
  select case when rp >= 1500 then 900 when rp >= 1200 then 600 else rp end $$;

-- 내 랭크 (없으면 만들고, 시즌이 바뀌었으면 시작점으로)
create or replace function public.seumarena_rank_row(p_uid uuid, p_season text, p_nick text) returns public.seumarena_rank
language plpgsql security definer set search_path = public as $$
declare r public.seumarena_rank;
begin
  select * into r from public.seumarena_rank where user_id = p_uid for update;
  if not found then
    insert into public.seumarena_rank(user_id, season, nick) values (p_uid, p_season, coalesce(public.seumarena_clean(p_nick, 16), '')) returning * into r;
  elsif r.season <> p_season then
    update public.seumarena_rank set last_season = r.season, last_peak = r.peak, season = p_season, rp = public.seumarena_rank_reset(r.rp),
      peak = public.seumarena_rank_reset(r.rp), games = 0, wins = 0, shield = false, updated = now() where user_id = p_uid returning * into r;
  end if;
  if p_nick is not null and p_nick <> '' and r.nick <> public.seumarena_clean(p_nick, 16) then
    update public.seumarena_rank set nick = public.seumarena_clean(p_nick, 16) where user_id = p_uid returning * into r;
  end if;
  return r;
end $$;
revoke all on function public.seumarena_rank_row(uuid, text, text) from public, anon, authenticated;

create or replace function public.seumarena_rank_me(p_season text, p_nick text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); r public.seumarena_rank; pos int;
begin
  if uid is null then return jsonb_build_object('r', 'login'); end if;
  r := public.seumarena_rank_row(uid, p_season, p_nick);
  select count(*) + 1 into pos from public.seumarena_rank where season = p_season and rp > r.rp;
  return jsonb_build_object('r', 'ok', 'rp', r.rp, 'peak', r.peak, 'games', r.games, 'wins', r.wins, 'pos', pos,
    'ban', case when r.ban_until > now() then ceil(extract(epoch from r.ban_until - now())) else 0 end,
    'last_season', r.last_season, 'last_peak', r.last_peak);
end $$;
revoke all on function public.seumarena_rank_me(text, text) from public, anon;
grant execute on function public.seumarena_rank_me(text, text) to authenticated;

-- 이긴 점수 / 진 점수 (지금 칸 기준)
create or replace function public.seumarena_rank_win(rp int) returns int language sql immutable as $$ select case when rp < 900 then 25 when rp < 1500 then 20 else 15 end $$;
create or replace function public.seumarena_rank_loss(rp int) returns int language sql immutable as $$ select case when rp < 900 then 5 when rp < 1500 then 15 else 20 end $$;
-- 강등 보호 바닥: 골드 I(600) · 다이아 I(1200) · 마스터 I(1500)에 한 번 올라가면 그 아래로는 안 떨어짐
create or replace function public.seumarena_rank_floor(peak int) returns int language sql immutable as $$ select case when peak >= 1500 then 1500 when peak >= 1200 then 1200 when peak >= 600 then 600 else 0 end $$;

-- 서버가 경기 결과를 기록 (p_leaver: 도중에 나간 사람, 진 사람과 같음 · -10 더 · 5분 금지)
create or replace function public.seumarena_rank_result(p_key text, p_season text, p_win uuid, p_lose uuid, p_leaver uuid, p_wnick text, p_lnick text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare w public.seumarena_rank; l public.seumarena_rank; dw int; dl int; nl int;
begin
  if not public.seumarena_srv_ok(p_key) then return jsonb_build_object('r', 'key'); end if;
  if p_win is null or p_lose is null or p_win = p_lose then return jsonb_build_object('r', 'bad'); end if;
  if p_win < p_lose then w := public.seumarena_rank_row(p_win, p_season, p_wnick); l := public.seumarena_rank_row(p_lose, p_season, p_lnick);
  else l := public.seumarena_rank_row(p_lose, p_season, p_lnick); w := public.seumarena_rank_row(p_win, p_season, p_wnick); end if;      -- 같은 순서로 잠금
  dw := public.seumarena_rank_win(w.rp);
  update public.seumarena_rank set rp = rp + dw, peak = greatest(peak, rp + dw), games = games + 1, wins = wins + 1,
    shield = shield or (rp + dw) / 100 > rp / 100, updated = now() where user_id = p_win;
  if l.shield and p_leaver is distinct from p_lose then dl := 0;
  else dl := public.seumarena_rank_loss(l.rp) + case when p_leaver = p_lose then 10 else 0 end; end if;
  nl := greatest(public.seumarena_rank_floor(l.peak), l.rp - dl);
  if nl > l.rp then nl := l.rp; end if;
  update public.seumarena_rank set rp = nl, games = games + 1, shield = false,
    ban_until = case when p_leaver = p_lose then now() + interval '5 minutes' else ban_until end, updated = now() where user_id = p_lose;
  return jsonb_build_object('r', 'ok', 'win', dw, 'lose', nl - l.rp);
end $$;
revoke all on function public.seumarena_rank_result(text, text, uuid, uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function public.seumarena_rank_result(text, text, uuid, uuid, uuid, text, text) to anon;      -- 서버 키가 있어야만 동작

------------------------------------------------------------------ 길드
create table if not exists public.seumarena_guilds (
  id          bigserial primary key,
  name        text not null,
  tag         text not null check (tag ~ '^[0-9A-Z가-힣]{2,4}$'),
  logo        smallint not null default 0 check (logo between 0 and 11),
  color       smallint not null default 0 check (color between 0 and 7),
  intro       text not null default '',
  join_type   smallint not null default 0 check (join_type between 0 and 2),   -- 0 누구나 · 1 승인 후 · 2 초대만(코드)
  min_karma   int not null default 0,
  code        text not null default upper(substr(md5(random()::text), 1, 6)),  -- 초대 코드
  league      smallint not null default 0 check (league between 0 and 4),     -- 대항전 리그 0 브론즈 · 1 실버 · 2 골드 · 3 다이아 · 4 챔피언
  gw_zero     smallint not null default 0,      -- 대항전 연속 0점 주 수
  gw_off      boolean not null default false,   -- 2주 연속 0점이면 조 짜기에서 빠짐 (참가 버튼으로 다시)
  border_week int,                              -- 챔피언 리그 1등: 이 주까지 로고 테두리
  created     timestamptz not null default now()
);
create unique index if not exists seumarena_guilds_name on public.seumarena_guilds (lower(name));
create unique index if not exists seumarena_guilds_tag on public.seumarena_guilds (tag);
create table if not exists public.seumarena_guild_members (
  user_id  uuid primary key,
  guild_id bigint not null references public.seumarena_guilds(id) on delete cascade,
  role     smallint not null default 0 check (role between 0 and 2),        -- 0 멤버 · 1 부길드장 · 2 길드장
  nick     text not null default '',
  joined   timestamptz not null default now()
);
create index if not exists seumarena_guild_members_g on public.seumarena_guild_members (guild_id);
create table if not exists public.seumarena_guild_req (
  guild_id bigint not null references public.seumarena_guilds(id) on delete cascade,
  user_id  uuid not null,
  nick     text not null default '',
  karma    int not null default 0,
  at       timestamptz not null default now(),
  primary key (guild_id, user_id)
);
create table if not exists public.seumarena_guild_chat (
  id       bigserial primary key,
  guild_id bigint not null references public.seumarena_guilds(id) on delete cascade,
  user_id  uuid,
  nick     text not null default '',
  kind     smallint not null default 0,      -- 0 채팅 · 1 소식
  txt      text not null,
  at       timestamptz not null default now()
);
create index if not exists seumarena_guild_chat_g on public.seumarena_guild_chat (guild_id, id);
alter table public.seumarena_guilds enable row level security;
alter table public.seumarena_guild_members enable row level security;
alter table public.seumarena_guild_req enable row level security;
alter table public.seumarena_guild_chat enable row level security;
revoke all on public.seumarena_guilds, public.seumarena_guild_members, public.seumarena_guild_req, public.seumarena_guild_chat from anon, authenticated;
-- 읽기·쓰기는 모두 아래 함수로만

create or replace function public.seumarena_karma(p_uid uuid) returns int language plpgsql stable security definer set search_path = public as $$
declare k int := 0;
begin
  begin execute 'select coalesce((data->''cos''->>''karma'')::int, 0) from public.seumarena_saves where user_id = $1' into k using p_uid;
  exception when others then k := 0; end;
  return coalesce(k, 0);
end $$;
revoke all on function public.seumarena_karma(uuid) from public, anon, authenticated;

create or replace function public.seumarena_gnews(p_gid bigint, p_txt text) returns void language sql security definer set search_path = public as $$
  insert into public.seumarena_guild_chat(guild_id, kind, txt) values (p_gid, 1, p_txt) $$;
revoke all on function public.seumarena_gnews(bigint, text) from public, anon, authenticated;

create or replace function public.seumarena_gweek(t timestamptz default now()) returns int language sql stable as $$
  select floor((extract(epoch from t) / 86400 - 4) / 7)::int $$;      -- 월요일 0시(GMT)에 바뀌는 주 번호

-- 내 길드 전체 정보
create or replace function public.seumarena_guild_mine() returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); me public.seumarena_guild_members; g public.seumarena_guilds; season text;
begin
  if uid is null then return jsonb_build_object('r', 'login'); end if;
  select * into me from public.seumarena_guild_members where user_id = uid;
  if not found then return jsonb_build_object('r', 'none', 'reqs', (select coalesce(jsonb_agg(guild_id), '[]') from public.seumarena_guild_req where user_id = uid)); end if;
  select * into g from public.seumarena_guilds where id = me.guild_id;
  select r.season into season from public.seumarena_rank r where r.user_id = uid;
  return jsonb_build_object('r', 'ok', 'role', me.role,
    'g', jsonb_build_object('id', g.id, 'name', g.name, 'tag', g.tag, 'logo', g.logo, 'color', g.color, 'intro', g.intro, 'join', g.join_type, 'min', g.min_karma,
      'code', case when me.role >= 1 then g.code end, 'league', g.league, 'off', g.gw_off, 'border', coalesce(g.border_week >= public.seumarena_gweek(), false)),
    'members', (select coalesce(jsonb_agg(jsonb_build_object('u', m.user_id, 'n', m.nick, 'role', m.role, 'rp', coalesce(r.rp, 0)) order by m.role desc, coalesce(r.rp, 0) desc), '[]')
      from public.seumarena_guild_members m left join public.seumarena_rank r on r.user_id = m.user_id where m.guild_id = g.id),
    'reqs', case when me.role >= 1 then (select coalesce(jsonb_agg(jsonb_build_object('u', q.user_id, 'n', q.nick, 'k', q.karma) order by q.at), '[]') from public.seumarena_guild_req q where q.guild_id = g.id) else '[]'::jsonb end);
end $$;

create or replace function public.seumarena_guild_search(p_q text) returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(x order by (x->>'cnt')::int desc), '[]'::jsonb) from (
    select jsonb_build_object('id', g.id, 'name', g.name, 'tag', g.tag, 'logo', g.logo, 'color', g.color, 'intro', g.intro, 'join', g.join_type, 'min', g.min_karma, 'league', g.league,
      'cnt', (select count(*) from public.seumarena_guild_members m where m.guild_id = g.id)) x
    from public.seumarena_guilds g
    where coalesce(p_q, '') = '' or g.name ilike '%' || replace(replace(p_q, '%', ''), '_', '') || '%' or g.tag = upper(p_q)
    order by g.id desc limit 40) s $$;

create or replace function public.seumarena_guild_create(p_name text, p_tag text, p_logo int, p_color int, p_intro text, p_join int, p_min int, p_nick text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); nm text := btrim(public.seumarena_clean(p_name, 12)); tg text := upper(btrim(coalesce(p_tag, ''))); gid bigint;
begin
  if uid is null then return jsonb_build_object('r', 'login'); end if;
  if exists (select 1 from public.seumarena_guild_members where user_id = uid) then return jsonb_build_object('r', 'already'); end if;
  if char_length(nm) < 2 or nm like '%**%' then return jsonb_build_object('r', 'name'); end if;
  if tg !~ '^[0-9A-Z가-힣]{2,4}$' then return jsonb_build_object('r', 'tag'); end if;
  if exists (select 1 from public.seumarena_guilds where lower(name) = lower(nm)) then return jsonb_build_object('r', 'name_taken'); end if;
  if exists (select 1 from public.seumarena_guilds where tag = tg) then return jsonb_build_object('r', 'tag_taken'); end if;
  insert into public.seumarena_guilds(name, tag, logo, color, intro, join_type, min_karma)
    values (nm, tg, greatest(0, least(11, coalesce(p_logo, 0))), greatest(0, least(7, coalesce(p_color, 0))), public.seumarena_clean(p_intro, 100), greatest(0, least(2, coalesce(p_join, 0))), greatest(0, least(100000, coalesce(p_min, 0))))
    returning id into gid;
  insert into public.seumarena_guild_members(user_id, guild_id, role, nick) values (uid, gid, 2, public.seumarena_clean(p_nick, 16));
  delete from public.seumarena_guild_req where user_id = uid;
  perform public.seumarena_gnews(gid, public.seumarena_clean(p_nick, 16) || ' 님이 길드를 만들었어요');
  return jsonb_build_object('r', 'ok', 'id', gid);
end $$;

create or replace function public.seumarena_guild_update(p_intro text, p_logo int, p_color int, p_join int, p_min int, p_newcode boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); me public.seumarena_guild_members;
begin
  select * into me from public.seumarena_guild_members where user_id = uid;
  if not found or me.role < 1 then return jsonb_build_object('r', 'role'); end if;
  update public.seumarena_guilds set intro = coalesce(public.seumarena_clean(p_intro, 100), intro), logo = coalesce(greatest(0, least(11, p_logo)), logo),
    color = coalesce(greatest(0, least(7, p_color)), color), join_type = coalesce(greatest(0, least(2, p_join)), join_type), min_karma = coalesce(greatest(0, least(100000, p_min)), min_karma),
    code = case when p_newcode then upper(substr(md5(random()::text), 1, 6)) else code end
  where id = me.guild_id;
  return jsonb_build_object('r', 'ok');
end $$;

-- 들어가기: 누구나 -> 바로 · 승인 후 -> 신청 · 초대만 -> p_code 가 맞아야 바로
create or replace function public.seumarena_guild_join(p_gid bigint, p_code text, p_nick text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); g public.seumarena_guilds; k int; nk text := public.seumarena_clean(p_nick, 16);
begin
  if uid is null then return jsonb_build_object('r', 'login'); end if;
  if exists (select 1 from public.seumarena_guild_members where user_id = uid) then return jsonb_build_object('r', 'already'); end if;
  if p_gid is null and coalesce(p_code, '') <> '' then select * into g from public.seumarena_guilds where code = upper(btrim(p_code)) for update;
  else select * into g from public.seumarena_guilds where id = p_gid for update; end if;
  if not found then return jsonb_build_object('r', 'gone'); end if;
  if (select count(*) from public.seumarena_guild_members where guild_id = g.id) >= 50 then return jsonb_build_object('r', 'full'); end if;
  k := public.seumarena_karma(uid);
  if k < g.min_karma then return jsonb_build_object('r', 'karma', 'min', g.min_karma); end if;
  if g.join_type = 2 and upper(btrim(coalesce(p_code, ''))) <> g.code then return jsonb_build_object('r', 'code'); end if;
  if g.join_type = 1 and upper(btrim(coalesce(p_code, ''))) <> g.code then
    insert into public.seumarena_guild_req(guild_id, user_id, nick, karma) values (g.id, uid, nk, k) on conflict (guild_id, user_id) do update set at = now(), nick = excluded.nick;
    return jsonb_build_object('r', 'asked');
  end if;
  insert into public.seumarena_guild_members(user_id, guild_id, nick) values (uid, g.id, nk);
  delete from public.seumarena_guild_req where user_id = uid;
  perform public.seumarena_gnews(g.id, nk || ' 님이 들어왔어요');
  return jsonb_build_object('r', 'ok', 'id', g.id);
end $$;

create or replace function public.seumarena_guild_leave() returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); me public.seumarena_guild_members; nx uuid;
begin
  select * into me from public.seumarena_guild_members where user_id = uid for update;
  if not found then return jsonb_build_object('r', 'none'); end if;
  delete from public.seumarena_guild_members where user_id = uid;
  if not exists (select 1 from public.seumarena_guild_members where guild_id = me.guild_id) then delete from public.seumarena_guilds where id = me.guild_id; return jsonb_build_object('r', 'ok', 'gone', true); end if;
  if me.role = 2 then      -- 길드장이 나가면 부길드장 중 가장 오래된 사람, 없으면 가장 오래된 멤버가 길드장
    select user_id into nx from public.seumarena_guild_members where guild_id = me.guild_id order by role desc, joined limit 1;
    update public.seumarena_guild_members set role = 2 where user_id = nx;
  end if;
  perform public.seumarena_gnews(me.guild_id, me.nick || ' 님이 나갔어요');
  return jsonb_build_object('r', 'ok');
end $$;

-- 멤버 관리: 'kick' 내보내기 · 'up' 부길드장 · 'down' 멤버로 · 'lead' 길드장 넘기기 (길드장만 up/down/lead)
create or replace function public.seumarena_guild_member(p_uid uuid, p_act text) returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); me public.seumarena_guild_members; t public.seumarena_guild_members;
begin
  select * into me from public.seumarena_guild_members where user_id = uid;
  select * into t from public.seumarena_guild_members where user_id = p_uid;
  if me.user_id is null or t.user_id is null or t.guild_id <> me.guild_id or uid = p_uid then return jsonb_build_object('r', 'bad'); end if;
  if p_act = 'kick' and me.role >= 1 and t.role < me.role then
    delete from public.seumarena_guild_members where user_id = p_uid; perform public.seumarena_gnews(me.guild_id, t.nick || ' 님이 내보내졌어요');
  elsif p_act = 'up' and me.role = 2 then update public.seumarena_guild_members set role = 1 where user_id = p_uid; perform public.seumarena_gnews(me.guild_id, t.nick || ' 님이 부길드장이 됐어요');
  elsif p_act = 'down' and me.role = 2 then update public.seumarena_guild_members set role = 0 where user_id = p_uid;
  elsif p_act = 'lead' and me.role = 2 then update public.seumarena_guild_members set role = 2 where user_id = p_uid; update public.seumarena_guild_members set role = 1 where user_id = uid;
    perform public.seumarena_gnews(me.guild_id, t.nick || ' 님이 길드장이 됐어요');
  else return jsonb_build_object('r', 'role'); end if;
  return jsonb_build_object('r', 'ok');
end $$;

create or replace function public.seumarena_guild_answer(p_uid uuid, p_ok boolean) returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); me public.seumarena_guild_members; q public.seumarena_guild_req;
begin
  select * into me from public.seumarena_guild_members where user_id = uid;
  if not found or me.role < 1 then return jsonb_build_object('r', 'role'); end if;
  select * into q from public.seumarena_guild_req where guild_id = me.guild_id and user_id = p_uid for update;
  if not found then return jsonb_build_object('r', 'gone'); end if;
  delete from public.seumarena_guild_req where guild_id = me.guild_id and user_id = p_uid;
  if not p_ok then return jsonb_build_object('r', 'ok'); end if;
  if exists (select 1 from public.seumarena_guild_members where user_id = p_uid) then return jsonb_build_object('r', 'already'); end if;
  if (select count(*) from public.seumarena_guild_members where guild_id = me.guild_id) >= 50 then return jsonb_build_object('r', 'full'); end if;
  insert into public.seumarena_guild_members(user_id, guild_id, nick) values (p_uid, me.guild_id, q.nick);
  delete from public.seumarena_guild_req where user_id = p_uid;
  perform public.seumarena_gnews(me.guild_id, q.nick || ' 님이 들어왔어요');
  return jsonb_build_object('r', 'ok');
end $$;

create or replace function public.seumarena_guild_say(p_txt text, p_nick text) returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); me public.seumarena_guild_members; t text := btrim(public.seumarena_clean(p_txt, 120));
begin
  select * into me from public.seumarena_guild_members where user_id = uid;
  if not found then return jsonb_build_object('r', 'none'); end if;
  if t = '' then return jsonb_build_object('r', 'empty'); end if;
  if (select count(*) from public.seumarena_guild_chat where user_id = uid and at > now() - interval '10 seconds') >= 5 then return jsonb_build_object('r', 'slow'); end if;
  insert into public.seumarena_guild_chat(guild_id, user_id, nick, txt) values (me.guild_id, uid, coalesce(nullif(public.seumarena_clean(p_nick, 16), ''), me.nick), t);
  delete from public.seumarena_guild_chat where guild_id = me.guild_id and id < (select min(id) from (select id from public.seumarena_guild_chat where guild_id = me.guild_id order by id desc limit 200) s);
  return jsonb_build_object('r', 'ok');
end $$;

create or replace function public.seumarena_guild_chat_since(p_id bigint) returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); gid bigint;
begin
  select guild_id into gid from public.seumarena_guild_members where user_id = uid;
  if gid is null then return '[]'::jsonb; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'n', c.nick, 'k', c.kind, 't', c.txt, 'at', c.at, 'me', c.user_id = uid) order by c.id), '[]')
    from (select * from public.seumarena_guild_chat where guild_id = gid and id > coalesce(p_id, 0) order by id desc limit 60) c);
end $$;

-- 길드 순위: 멤버 랭크 점수 합계 (이번 시즌)
create or replace function public.seumarena_guild_top(p_season text) returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(x order by (x->>'rp')::int desc), '[]'::jsonb) from (
    select jsonb_build_object('id', g.id, 'name', g.name, 'tag', g.tag, 'logo', g.logo, 'color', g.color, 'league', g.league, 'cnt', count(m.user_id),
      'rp', coalesce(sum(case when r.season = p_season then r.rp else 0 end), 0)) x
    from public.seumarena_guilds g join public.seumarena_guild_members m on m.guild_id = g.id left join public.seumarena_rank r on r.user_id = m.user_id
    group by g.id order by coalesce(sum(case when r.season = p_season then r.rp else 0 end), 0) desc limit 50) s $$;

-- 순위표 (위 100명)
create or replace function public.seumarena_rank_top(p_season text) returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('n', r.nick, 'rp', r.rp, 'g', g.tag) order by r.rp desc, r.updated), '[]'::jsonb)
  from (select * from public.seumarena_rank where season = p_season and games > 0 order by rp desc, updated limit 100) r
  left join public.seumarena_guild_members m on m.user_id = r.user_id left join public.seumarena_guilds g on g.id = m.guild_id $$;

------------------------------------------------------------------ 길드 대항전
-- 매주 월요일 0시(GMT) 조 짜기 · 금·토·일 전투 · 다음 월요일 0시 결과
create table if not exists public.seumarena_gw_group (
  week     int not null,
  guild_id bigint not null references public.seumarena_guilds(id) on delete cascade,
  grp      int not null,
  league   smallint not null,
  pts      int not null default 0,
  place    smallint,
  closed   boolean not null default false,
  primary key (week, guild_id)
);
create table if not exists public.seumarena_gw_play (
  week     int not null,
  day      date not null,
  user_id  uuid not null,
  guild_id bigint not null,
  n        smallint not null default 0,      -- 그날 쓴 표 (최대 4)
  pts      int not null default 0,
  primary key (day, user_id)
);
create index if not exists seumarena_gw_play_w on public.seumarena_gw_play (week, user_id);
create table if not exists public.seumarena_gw_claim (week int not null, user_id uuid not null, primary key (week, user_id));
alter table public.seumarena_gw_group enable row level security;
alter table public.seumarena_gw_play enable row level security;
alter table public.seumarena_gw_claim enable row level security;
revoke all on public.seumarena_gw_group, public.seumarena_gw_play, public.seumarena_gw_claim from anon, authenticated;

create or replace function public.seumarena_gw_day(t timestamptz default now()) returns boolean language sql stable as $$
  select extract(isodow from t at time zone 'UTC') in (5, 6, 7) $$;      -- 금·토·일 (GMT)

-- 서버가 10분마다 부름: 지난 주 결과 정리 + 이번 주 조 짜기 (몇 번 불러도 같음)
create or replace function public.seumarena_gw_tick(p_key text) returns jsonb language plpgsql security definer set search_path = public as $$
declare wk int := public.seumarena_gweek(); w int; gp int; n int; ng int; i int; rec record; allzero boolean; lastp int; made int := 0; nclosed int := 0;
begin
  if not public.seumarena_srv_ok(p_key) then return jsonb_build_object('r', 'key'); end if;
  perform pg_advisory_xact_lock(hashtext('seumarena_gw_tick'));
  -- 1) 지난 주들 정리
  for w in select distinct week from public.seumarena_gw_group where week < wk and not closed loop
    for gp in select distinct grp from public.seumarena_gw_group where week = w loop
      select bool_and(pts = 0), count(*) into allzero, n from public.seumarena_gw_group where week = w and grp = gp;
      i := 0;
      for rec in select guild_id, pts, league from public.seumarena_gw_group where week = w and grp = gp order by pts desc, guild_id loop
        i := i + 1;
        update public.seumarena_gw_group set place = i, closed = true where week = w and guild_id = rec.guild_id;
        if not allzero then
          if i = 1 and rec.pts > 0 then
            update public.seumarena_guilds set league = least(4, league + 1), border_week = case when league = 4 then w + 1 else border_week end where id = rec.guild_id;
          elsif i = n and n >= 2 then
            update public.seumarena_guilds set league = greatest(0, league - 1) where id = rec.guild_id;
          end if;
        end if;
        update public.seumarena_guilds set gw_zero = case when rec.pts = 0 then gw_zero + 1 else 0 end where id = rec.guild_id;
        update public.seumarena_guilds set gw_off = true where id = rec.guild_id and gw_zero >= 2;
      end loop;
      nclosed := nclosed + 1;
    end loop;
  end loop;
  -- 2) 이번 주 조 짜기: 리그가 비슷한 길드끼리 4개씩 (모자라면 2~3개), 1개뿐이면 이번 주는 없음
  if not exists (select 1 from public.seumarena_gw_group where week = wk) then
    select count(*) into n from public.seumarena_guilds g where not g.gw_off and exists (select 1 from public.seumarena_guild_members m where m.guild_id = g.id);
    if n >= 2 then
      ng := ceil(n / 4.0); i := 0;
      for rec in select g.id, g.league from public.seumarena_guilds g where not g.gw_off and exists (select 1 from public.seumarena_guild_members m where m.guild_id = g.id)
                 order by g.league desc, random() loop
        insert into public.seumarena_gw_group(week, guild_id, grp, league) values (wk, rec.id, floor(i * ng / n::numeric)::int, rec.league);
        i := i + 1; made := made + 1;
      end loop;
    end if;
  end if;
  return jsonb_build_object('r', 'ok', 'week', wk, 'closed', nclosed, 'made', made);
end $$;
revoke all on function public.seumarena_gw_tick(text) from public, anon, authenticated;
grant execute on function public.seumarena_gw_tick(text) to anon;      -- 서버 키가 있어야만 동작

-- 서버가 대항전 경기 결과를 기록. p_players = [{"u": uuid, "t": 팀}], p_win = 이긴 팀 (-1 무승부)
-- 점수: 승리 4 · 패배(무승부) 1 · 상대 팀에 같은 조 다른 길드원이 있으면 2배 · 같은 팀에 우리 길드원이 있으면 +1 · 하루 표 4장까지
create or replace function public.seumarena_gw_result(p_key text, p_players jsonb, p_win int) returns jsonb language plpgsql security definer set search_path = public as $$
declare wk int := public.seumarena_gweek(); d date := (now() at time zone 'UTC')::date; p record; v int; vs boolean; mate boolean; out jsonb := '{}'::jsonb; used int;
begin
  if not public.seumarena_srv_ok(p_key) then return jsonb_build_object('r', 'key'); end if;
  if not public.seumarena_gw_day() then return jsonb_build_object('r', 'day'); end if;
  create temp table if not exists _gwp (u uuid, t int, g bigint, grp int) on commit drop; truncate _gwp;
  insert into _gwp select (e->>'u')::uuid, (e->>'t')::int, m.guild_id, gr.grp
    from jsonb_array_elements(p_players) e left join public.seumarena_guild_members m on m.user_id = (e->>'u')::uuid
    left join public.seumarena_gw_group gr on gr.week = wk and gr.guild_id = m.guild_id
    where (e->>'u') ~ '^[0-9a-f-]{36}$';
  for p in select * from _gwp where grp is not null loop
    select coalesce(n, 0) into used from public.seumarena_gw_play where day = d and user_id = p.u;
    if coalesce(used, 0) >= 4 then out := out || jsonb_build_object(p.u::text, jsonb_build_object('pts', 0, 'left', 0)); continue; end if;
    vs := exists (select 1 from _gwp o where o.t <> p.t and o.grp = p.grp and o.g <> p.g);
    mate := exists (select 1 from _gwp o where o.t = p.t and o.u <> p.u and o.g = p.g);
    v := (case when p_win = p.t then 4 else 1 end) * (case when vs then 2 else 1 end) + (case when mate then 1 else 0 end);
    insert into public.seumarena_gw_play as x (week, day, user_id, guild_id, n, pts) values (wk, d, p.u, p.g, 1, v)
      on conflict (day, user_id) do update set n = x.n + 1, pts = x.pts + excluded.pts;
    update public.seumarena_gw_group as x set pts = x.pts + v where x.week = wk and x.guild_id = p.g;
    out := out || jsonb_build_object(p.u::text, jsonb_build_object('pts', v, 'left', 3 - coalesce(used, 0), 'vs', vs));
  end loop;
  return jsonb_build_object('r', 'ok', 'p', out);
end $$;
revoke all on function public.seumarena_gw_result(text, jsonb, int) from public, anon, authenticated;
grant execute on function public.seumarena_gw_result(text, jsonb, int) to anon;

-- 내 대항전: 이번 주 조 순위, 오늘 남은 표, 받을 보상이 있는 지난 주
create or replace function public.seumarena_gw_me() returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); gid bigint; wk int := public.seumarena_gweek(); me public.seumarena_gw_group; used int; cw record;
begin
  select guild_id into gid from public.seumarena_guild_members where user_id = uid;
  if gid is null then return jsonb_build_object('r', 'none'); end if;
  select * into me from public.seumarena_gw_group where week = wk and guild_id = gid;
  select coalesce(n, 0) into used from public.seumarena_gw_play where day = (now() at time zone 'UTC')::date and user_id = uid;
  select g.week, g.place, g.league, (select count(*) from public.seumarena_gw_group x where x.week = g.week and x.grp = g.grp) as n into cw
    from public.seumarena_gw_play p join public.seumarena_gw_group g on g.week = p.week and g.guild_id = p.guild_id
    where p.user_id = uid and g.closed and not exists (select 1 from public.seumarena_gw_claim c where c.week = p.week and c.user_id = uid)
    order by g.week desc limit 1;
  return jsonb_build_object('r', 'ok', 'week', wk, 'day', public.seumarena_gw_day(), 'left', 4 - coalesce(used, 0),
    'grp', case when me.guild_id is null then null else (select jsonb_agg(jsonb_build_object('id', g.id, 'name', g.name, 'tag', g.tag, 'logo', g.logo, 'color', g.color, 'pts', x.pts, 'me', g.id = gid) order by x.pts desc, g.id)
      from public.seumarena_gw_group x join public.seumarena_guilds g on g.id = x.guild_id where x.week = wk and x.grp = me.grp) end,
    'gnum', me.grp, 'league', (select league from public.seumarena_guilds where id = gid),
    'off', (select gw_off from public.seumarena_guilds where id = gid),
    'claim', case when cw.week is null then null else jsonb_build_object('week', cw.week, 'place', cw.place, 'league', cw.league, 'n', cw.n) end);
end $$;

create or replace function public.seumarena_gw_claim(p_week int) returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); g record;
begin
  if uid is null then return jsonb_build_object('r', 'login'); end if;
  select gr.place, gr.league, (select count(*) from public.seumarena_gw_group x where x.week = gr.week and x.grp = gr.grp) as n into g
    from public.seumarena_gw_play p join public.seumarena_gw_group gr on gr.week = p.week and gr.guild_id = p.guild_id
    where p.user_id = uid and p.week = p_week and gr.closed limit 1;
  if not found then return jsonb_build_object('r', 'none'); end if;
  insert into public.seumarena_gw_claim(week, user_id) values (p_week, uid) on conflict do nothing;
  if not found then return jsonb_build_object('r', 'taken'); end if;
  return jsonb_build_object('r', 'ok', 'place', g.place, 'league', g.league, 'n', g.n);
end $$;

-- 2주 연속 0점으로 빠진 길드가 다시 참가 (길드장·부길드장)
create or replace function public.seumarena_gw_rejoin() returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); me public.seumarena_guild_members;
begin
  select * into me from public.seumarena_guild_members where user_id = uid;
  if not found or me.role < 1 then return jsonb_build_object('r', 'role'); end if;
  update public.seumarena_guilds set gw_off = false, gw_zero = 0 where id = me.guild_id;
  return jsonb_build_object('r', 'ok');
end $$;

-- 로그인한 사람만 부를 수 있는 함수들
do $$ declare f text; begin
  foreach f in array array['seumarena_guild_mine()', 'seumarena_guild_search(text)', 'seumarena_guild_create(text,text,int,int,text,int,int,text)',
    'seumarena_guild_update(text,int,int,int,int,boolean)', 'seumarena_guild_join(bigint,text,text)', 'seumarena_guild_leave()', 'seumarena_guild_member(uuid,text)',
    'seumarena_guild_answer(uuid,boolean)', 'seumarena_guild_say(text,text)', 'seumarena_guild_chat_since(bigint)', 'seumarena_gw_me()', 'seumarena_gw_claim(int)', 'seumarena_gw_rejoin()'] loop
    execute 'revoke all on function public.' || f || ' from public, anon';
    execute 'grant execute on function public.' || f || ' to authenticated';
  end loop;
  foreach f in array array['seumarena_rank_top(text)', 'seumarena_guild_top(text)'] loop
    execute 'revoke all on function public.' || f || ' from public';
    execute 'grant execute on function public.' || f || ' to anon, authenticated';
  end loop;
end $$;

-- 서버 키 넣기 (한 번만, 따옴표 안을 긴 무작위 글자로 바꿔서 실행 · 같은 값을 오라클 서버 /etc/sa-host.env 의 SA_SB_KEY= 에도 넣기):
-- insert into public.seumarena_srv(k, v) values ('key', '여기에-긴-무작위-글자-32자-이상') on conflict (k) do update set v = excluded.v;
