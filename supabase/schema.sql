-- Habit Tracker — Supabase schema.
--
-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query → paste → Run)
-- on a fresh project. Safe to re-run: everything is IF NOT EXISTS / CREATE OR REPLACE.
--
-- Source of truth is habit configuration + check-in history; derived stats (streaks,
-- completion rate) are computed client-side from these, never stored redundantly.

-- ---------------------------------------------------------------------------------
-- profiles — one row per user, public-ish within the app (needed so people can be
-- found for the community/friend-matching feature). Created automatically on signup
-- via the trigger below.
-- ---------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  bio text default '',
  avatar_emoji text default '🙂',
  traits text[] not null default '{}',      -- e.g. "early-riser", "reader", "runner"
  goal_tags text[] not null default '{}',    -- e.g. "fitness", "mindfulness", "study"
  sharing_level text not null default 'streak_only'
    check (sharing_level in ('streak_only', 'completion_percent', 'selected_habits', 'weekly_progress')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are readable by any signed-in user" on public.profiles;
create policy "profiles are readable by any signed-in user"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "users manage their own profile" on public.profiles;
create policy "users manage their own profile"
  on public.profiles for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create a profile row when someone signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'display_name', 'New user')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------------
-- habits — one row per habit. frequency_type/scheduled_days/frequency_target mirror
-- the client's lib/frequency.js rules exactly.
-- ---------------------------------------------------------------------------------
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text default '',
  emoji text default '✅',
  color text default '#2f6f4f',
  frequency_type text not null default 'daily'
    check (frequency_type in ('daily', 'days', 'week', 'month')),
  scheduled_days int[] not null default '{}',   -- 0=Sun..6=Sat, used when frequency_type = 'days'
  frequency_target int not null default 1,       -- used when frequency_type = 'week' | 'month'
  reminder_enabled boolean not null default false,
  reminder_time time,
  start_date date not null default current_date,
  active boolean not null default true,          -- soft delete
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists habits_user_id_idx on public.habits(user_id);

alter table public.habits enable row level security;

drop policy if exists "users manage their own habits" on public.habits;
create policy "users manage their own habits"
  on public.habits for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------------
-- check_ins — one row per (habit, date). The unique constraint is what actually
-- prevents duplicate completions for a day, enforced by the database, not just the UI.
-- ---------------------------------------------------------------------------------
create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  status text not null default 'done' check (status in ('done', 'skipped')),
  value numeric,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (habit_id, date)
);

create index if not exists check_ins_habit_id_idx on public.check_ins(habit_id);
create index if not exists check_ins_user_id_idx on public.check_ins(user_id);

alter table public.check_ins enable row level security;

drop policy if exists "users manage their own check-ins" on public.check_ins;
create policy "users manage their own check-ins"
  on public.check_ins for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------------
-- friend_connections — accountability partners (1:1). A single row per pair,
-- regardless of who sent the request; `status` tracks pending/accepted/declined.
-- ---------------------------------------------------------------------------------
create table if not exists public.friend_connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> recipient_id),
  unique (requester_id, recipient_id)
);

-- Prevent A→B and B→A both existing at once (a duplicate request in reverse).
create unique index if not exists friend_connections_unordered_pair_idx
  on public.friend_connections (least(requester_id, recipient_id), greatest(requester_id, recipient_id));

alter table public.friend_connections enable row level security;

drop policy if exists "users see their own friend connections" on public.friend_connections;
create policy "users see their own friend connections"
  on public.friend_connections for select
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = recipient_id);

drop policy if exists "users send friend requests" on public.friend_connections;
create policy "users send friend requests"
  on public.friend_connections for insert
  to authenticated
  with check (auth.uid() = requester_id);

drop policy if exists "users respond to or remove their connections" on public.friend_connections;
create policy "users respond to or remove their connections"
  on public.friend_connections for update
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = recipient_id)
  with check (auth.uid() = requester_id or auth.uid() = recipient_id);

drop policy if exists "users remove their connections" on public.friend_connections;
create policy "users remove their connections"
  on public.friend_connections for delete
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = recipient_id);

-- ---------------------------------------------------------------------------------
-- circles — small groups working toward a shared goal ("friend circles"). Membership
-- is open by invite only: a circle is discoverable by its members.
-- ---------------------------------------------------------------------------------
create table if not exists public.circles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  icon text default '🎯',
  goal_description text default '',   -- e.g. "Run 3x/week through the end of the month"
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.circle_members (
  circle_id uuid not null references public.circles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (circle_id, user_id)
);

alter table public.circles enable row level security;
alter table public.circle_members enable row level security;

drop policy if exists "members can see their circles" on public.circles;
create policy "members can see their circles"
  on public.circles for select
  to authenticated
  using (exists (
    select 1 from public.circle_members m
    where m.circle_id = circles.id and m.user_id = auth.uid()
  ));

drop policy if exists "authenticated users can create circles" on public.circles;
create policy "authenticated users can create circles"
  on public.circles for insert
  to authenticated
  with check (auth.uid() = created_by);

drop policy if exists "owners manage their circle" on public.circles;
create policy "owners manage their circle"
  on public.circles for update
  to authenticated
  using (exists (
    select 1 from public.circle_members m
    where m.circle_id = circles.id and m.user_id = auth.uid() and m.role = 'owner'
  ));

drop policy if exists "members can see circle membership" on public.circle_members;
create policy "members can see circle membership"
  on public.circle_members for select
  to authenticated
  using (exists (
    select 1 from public.circle_members m
    where m.circle_id = circle_members.circle_id and m.user_id = auth.uid()
  ));

drop policy if exists "users join circles they were invited to" on public.circle_members;
create policy "users join circles they were invited to"
  on public.circle_members for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users leave circles" on public.circle_members;
create policy "users leave circles"
  on public.circle_members for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------------
-- ai_insights — generated server-side (see /api/weekly-insight) using the service
-- role key, so the Anthropic API key never reaches the browser. Clients only read.
-- ---------------------------------------------------------------------------------
create table if not exists public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('weekly_insight', 'frequency_suggestion')),
  week_start_date date,
  content jsonb not null,
  dismissed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists ai_insights_user_id_idx on public.ai_insights(user_id);

alter table public.ai_insights enable row level security;

drop policy if exists "users read their own insights" on public.ai_insights;
create policy "users read their own insights"
  on public.ai_insights for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "users dismiss their own insights" on public.ai_insights;
create policy "users dismiss their own insights"
  on public.ai_insights for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Insight rows are written by the serverless function via the service role key,
-- which bypasses RLS entirely — no insert policy is granted to `authenticated`.
