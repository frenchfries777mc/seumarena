-- SeumArena 보상 코드 (사이트에서 6자리 코드 입력 -> 게임에서 보상 받기)
-- 아직 적용 안 함. 사용자 확인 후 Supabase SQL Editor에서 실행.

-- 1) 코드 목록 (사용자가 행을 추가해서 코드를 만듦)
create table if not exists public.seumarena_codes (
  code        text primary key check (code ~ '^[0-9A-Z]{6}$'),
  rewards     jsonb not null,          -- 예: [["g",500],["box",1]]  종류: g 코인, px 플레이어 XP, box 랜덤상자, ebox 에픽상자, rx/cx 캐릭터 XP, skin 스킨(값 = 최대 가격)
  max_uses    int,                     -- 전체 사용 횟수 제한 (null = 무제한)
  uses        int not null default 0,
  note        text,
  created_at  timestamptz not null default now(),
  constraint rewards_ok check (jsonb_typeof(rewards) = 'array' and jsonb_array_length(rewards) between 1 and 10
    and not jsonb_path_exists(rewards, '$[*] ? (!(@[0] like_regex "^(g|px|box|ebox|rx|cx|skin)$") || @[1].type() != "number" || @[1] <= 0 || @[1] > 100000)'))
);

-- 2) 누가 어떤 코드를 썼는지 (한 계정 한 코드 한 번)
create table if not exists public.seumarena_code_uses (
  code     text not null references public.seumarena_codes(code) on delete cascade,
  user_id  uuid not null default auth.uid(),
  rewards  jsonb not null,
  used_at  timestamptz not null default now(),
  primary key (code, user_id)
);

alter table public.seumarena_codes enable row level security;       -- 정책 없음 = 클라이언트가 코드 목록을 못 봄
alter table public.seumarena_code_uses enable row level security;
revoke all on public.seumarena_codes, public.seumarena_code_uses from anon, authenticated;
grant select on public.seumarena_code_uses to authenticated;
drop policy if exists "own uses" on public.seumarena_code_uses;
create policy "own uses" on public.seumarena_code_uses for select to authenticated using (user_id = auth.uid());

-- 3) 코드 사용 (사이트에서 호출). 결과: ok / login / bad / used / once(이미 다른 코드 사용) / full
create or replace function public.seumarena_redeem(p_code text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); c public.seumarena_codes; k text := upper(trim(p_code));
begin
  if uid is null then return jsonb_build_object('r','login'); end if;
  if k !~ '^[0-9A-Z]{6}$' then return jsonb_build_object('r','bad'); end if;
  select * into c from public.seumarena_codes where code = k for update;
  if not found then return jsonb_build_object('r','bad'); end if;
  if exists (select 1 from public.seumarena_code_uses where code = k and user_id = uid) then return jsonb_build_object('r','used'); end if;
  -- 한 계정은 코드를 딱 1개만 (동시에 두 코드를 넣어도 1개만 되게 계정별 잠금)
  perform pg_advisory_xact_lock(hashtext('seumarena_redeem:' || uid::text));
  if exists (select 1 from public.seumarena_code_uses where user_id = uid) then return jsonb_build_object('r','once'); end if;
  if c.max_uses is not null and c.uses >= c.max_uses then return jsonb_build_object('r','full'); end if;
  insert into public.seumarena_code_uses(code, user_id, rewards) values (k, uid, c.rewards);
  update public.seumarena_codes set uses = uses + 1 where code = k;
  return jsonb_build_object('r','ok','rewards',c.rewards);
end $$;
revoke all on function public.seumarena_redeem(text) from public, anon;
grant execute on function public.seumarena_redeem(text) to authenticated;

-- 4) 실제 코드 값은 공개 저장소에 두지 않음 (SQL Editor에서 직접 추가)

-- 코드 더 만들기: insert into public.seumarena_codes(code, rewards, max_uses) values ('ABC123', '[["g",500]]', 100);
-- 사용 현황: select code, uses, max_uses from public.seumarena_codes;

-- 되돌리기:
-- drop function if exists public.seumarena_redeem(text);
-- drop table if exists public.seumarena_code_uses; drop table if exists public.seumarena_codes;
