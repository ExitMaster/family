create extension if not exists pgcrypto;

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  unique(family_id, name)
);

create table if not exists public.family_members (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'member' check (role in ('owner','member')),
  household_id uuid references public.households(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

create table if not exists public.family_invites (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  code_hash text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '30 days'),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  type text not null check (type in ('income','expense')),
  name text not null,
  sort_order int not null default 0,
  unique(family_id, type, name)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  txn_date date not null,
  type text not null check (type in ('income','expense')),
  category_id uuid references public.categories(id) on delete set null,
  description text not null,
  amount numeric(14,2) not null check (amount >= 0),
  household_id uuid references public.households(id) on delete set null,
  payment_method text,
  receipt_shared boolean,
  memo text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.settlements (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  settlement_date date not null,
  description text not null,
  total_amount numeric(14,2) not null check (total_amount >= 0),
  payer_household_id uuid not null references public.households(id) on delete restrict,
  memo text,
  is_example boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.settlement_shares (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  settlement_id uuid not null references public.settlements(id) on delete cascade,
  household_id uuid not null references public.households(id) on delete cascade,
  amount numeric(14,2) not null default 0 check (amount >= 0),
  status text not null default 'unpaid' check (status in ('self','paid','unpaid','excluded')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(settlement_id, household_id)
);

create table if not exists public.care_events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  event_date date not null,
  event_type text not null,
  place text,
  doctor text,
  companions text,
  content text,
  memo text,
  medication text,
  chemo_cycle int check (chemo_cycle between 1 and 12),
  sort_order int not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chemo_cycles (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  cycle_number int not null check (cycle_number between 1 and 12),
  cycle_date date,
  hospital text,
  medication text,
  condition_summary text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(family_id, cycle_number)
);

create table if not exists public.health_logs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  log_date date not null,
  weight_kg numeric(5,2),
  wbc numeric(10,3),
  anc numeric(10,3),
  neuropathy_score int check (neuropathy_score between 1 and 5),
  fatigue_score int check (fatigue_score between 1 and 5),
  meal_memo text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payout_accounts (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  household_id uuid not null references public.households(id) on delete cascade,
  bank_name text,
  account_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(family_id, household_id)
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  care_event_id uuid references public.care_events(id) on delete cascade,
  storage_path text not null unique,
  original_name text not null,
  mime_type text,
  password_protected boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.is_family_member(p_family_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.family_members fm where fm.family_id=p_family_id and fm.user_id=auth.uid());
$$;

create or replace function public.is_family_owner(p_family_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.family_members fm where fm.family_id=p_family_id and fm.user_id=auth.uid() and fm.role='owner');
$$;

create or replace function public.create_family(p_name text, p_display_name text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_family uuid;
  v_code text;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  if exists(select 1 from public.family_members where user_id=auth.uid()) then raise exception '이미 가족 공간에 참여 중입니다.'; end if;
  insert into public.families(name, created_by) values (p_name, auth.uid()) returning id into v_family;
  insert into public.households(family_id,name,sort_order) values
    (v_family,'하영',1),(v_family,'하림',2),(v_family,'경수',3);
  insert into public.categories(family_id,type,name,sort_order) values
    (v_family,'income','정기납입',1),(v_family,'income','추가갹출',2),(v_family,'income','이자',3),(v_family,'income','기타수입',4),
    (v_family,'expense','정기행사·기념일',1),(v_family,'expense','건강·의료',2),(v_family,'expense','주거·생활',3),(v_family,'expense','여가·기타',4),(v_family,'expense','기타잡비',5);
  insert into public.family_members(family_id,user_id,display_name,role) values(v_family,auth.uid(),p_display_name,'owner');
  for i in 1..12 loop insert into public.chemo_cycles(family_id,cycle_number,created_by) values(v_family,i,auth.uid()); end loop;
  v_code := upper(substr(encode(gen_random_bytes(8),'hex'),1,12));
  insert into public.family_invites(family_id,code_hash,created_by) values(v_family,crypt(v_code,gen_salt('bf')),auth.uid());
  return jsonb_build_object('family_id',v_family,'invite_code',v_code);
end $$;

create or replace function public.join_family(p_invite_code text, p_display_name text)
returns uuid language plpgsql security definer set search_path=public as $$
declare
  v_family uuid;
  v_count int;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  if exists(select 1 from public.family_members where user_id=auth.uid()) then raise exception '이미 가족 공간에 참여 중입니다.'; end if;
  select fi.family_id into v_family from public.family_invites fi
    where fi.active=true and fi.expires_at>now() and crypt(upper(trim(p_invite_code)),fi.code_hash)=fi.code_hash
    order by fi.created_at desc limit 1;
  if v_family is null then raise exception '유효하지 않거나 만료된 초대 코드입니다.'; end if;
  select count(*) into v_count from public.family_members where family_id=v_family;
  if v_count >= 8 then raise exception '이 가족 공간은 최대 8명까지 참여할 수 있습니다.'; end if;
  insert into public.family_members(family_id,user_id,display_name,role) values(v_family,auth.uid(),p_display_name,'member');
  return v_family;
end $$;

create or replace function public.create_invite_code(p_family_id uuid)
returns text language plpgsql security definer set search_path=public as $$
declare v_code text;
begin
  if not public.is_family_owner(p_family_id) then raise exception '관리자만 초대 코드를 만들 수 있습니다.'; end if;
  update public.family_invites set active=false where family_id=p_family_id and active=true;
  v_code := upper(substr(encode(gen_random_bytes(8),'hex'),1,12));
  insert into public.family_invites(family_id,code_hash,created_by) values(p_family_id,crypt(v_code,gen_salt('bf')),auth.uid());
  return v_code;
end $$;

grant execute on function public.create_family(text,text) to authenticated;
grant execute on function public.join_family(text,text) to authenticated;
grant execute on function public.create_invite_code(uuid) to authenticated;

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.households enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.settlements enable row level security;
alter table public.settlement_shares enable row level security;
alter table public.care_events enable row level security;
alter table public.chemo_cycles enable row level security;
alter table public.health_logs enable row level security;
alter table public.payout_accounts enable row level security;
alter table public.attachments enable row level security;
alter table public.family_invites enable row level security;

create policy families_select on public.families for select using (public.is_family_member(id));
create policy families_update on public.families for update using (public.is_family_owner(id)) with check (public.is_family_owner(id));
create policy members_select on public.family_members for select using (public.is_family_member(family_id));
create policy members_update on public.family_members for update using (public.is_family_owner(family_id)) with check (public.is_family_owner(family_id));
create policy invites_select on public.family_invites for select using (public.is_family_owner(family_id));

create policy households_all_select on public.households for select using (public.is_family_member(family_id));
create policy households_owner_insert on public.households for insert with check (public.is_family_owner(family_id));
create policy households_owner_update on public.households for update using (public.is_family_owner(family_id));
create policy households_owner_delete on public.households for delete using (public.is_family_owner(family_id));

create policy categories_select on public.categories for select using (public.is_family_member(family_id));
create policy categories_insert on public.categories for insert with check (public.is_family_owner(family_id));
create policy categories_update on public.categories for update using (public.is_family_owner(family_id));
create policy categories_delete on public.categories for delete using (public.is_family_owner(family_id));

create policy transactions_select on public.transactions for select using (public.is_family_member(family_id));
create policy transactions_insert on public.transactions for insert with check (public.is_family_member(family_id));
create policy transactions_update on public.transactions for update using (public.is_family_member(family_id));
create policy transactions_delete on public.transactions for delete using (public.is_family_member(family_id));

create policy settlements_select on public.settlements for select using (public.is_family_member(family_id));
create policy settlements_insert on public.settlements for insert with check (public.is_family_member(family_id));
create policy settlements_update on public.settlements for update using (public.is_family_member(family_id));
create policy settlements_delete on public.settlements for delete using (public.is_family_member(family_id));

create policy shares_select on public.settlement_shares for select using (public.is_family_member(family_id));
create policy shares_insert on public.settlement_shares for insert with check (public.is_family_member(family_id));
create policy shares_update on public.settlement_shares for update using (public.is_family_member(family_id));
create policy shares_delete on public.settlement_shares for delete using (public.is_family_member(family_id));

create policy care_select on public.care_events for select using (public.is_family_member(family_id));
create policy care_insert on public.care_events for insert with check (public.is_family_member(family_id));
create policy care_update on public.care_events for update using (public.is_family_member(family_id));
create policy care_delete on public.care_events for delete using (public.is_family_member(family_id));

create policy cycles_select on public.chemo_cycles for select using (public.is_family_member(family_id));
create policy cycles_insert on public.chemo_cycles for insert with check (public.is_family_member(family_id));
create policy cycles_update on public.chemo_cycles for update using (public.is_family_member(family_id));
create policy cycles_delete on public.chemo_cycles for delete using (public.is_family_member(family_id));

create policy health_select on public.health_logs for select using (public.is_family_member(family_id));
create policy health_insert on public.health_logs for insert with check (public.is_family_member(family_id));
create policy health_update on public.health_logs for update using (public.is_family_member(family_id));
create policy health_delete on public.health_logs for delete using (public.is_family_member(family_id));

create policy accounts_select on public.payout_accounts for select using (public.is_family_member(family_id));
create policy accounts_insert on public.payout_accounts for insert with check (public.is_family_owner(family_id));
create policy accounts_update on public.payout_accounts for update using (public.is_family_owner(family_id));
create policy accounts_delete on public.payout_accounts for delete using (public.is_family_owner(family_id));

create policy attachments_select on public.attachments for select using (public.is_family_member(family_id));
create policy attachments_insert on public.attachments for insert with check (public.is_family_member(family_id));
create policy attachments_update on public.attachments for update using (public.is_family_member(family_id));
create policy attachments_delete on public.attachments for delete using (public.is_family_member(family_id));

insert into storage.buckets(id,name,public) values('family-files','family-files',false)
on conflict(id) do update set public=false;

create policy family_files_select on storage.objects for select to authenticated using (
  bucket_id='family-files' and public.is_family_member(((storage.foldername(name))[1])::uuid)
);
create policy family_files_insert on storage.objects for insert to authenticated with check (
  bucket_id='family-files' and public.is_family_member(((storage.foldername(name))[1])::uuid)
);
create policy family_files_update on storage.objects for update to authenticated using (
  bucket_id='family-files' and public.is_family_member(((storage.foldername(name))[1])::uuid)
);
create policy family_files_delete on storage.objects for delete to authenticated using (
  bucket_id='family-files' and public.is_family_member(((storage.foldername(name))[1])::uuid)
);
