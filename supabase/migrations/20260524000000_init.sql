-- DevFlow initial schema: profiles + AI reviews, with Row Level Security.
-- Apply via the Supabase SQL editor or `supabase db push`.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.severity as enum ('low', 'medium', 'high');

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user, populated on signup by a trigger below.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  github_username text,
  avatar_url text,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Public profile mirror of auth.users, keyed by user id.';

-- ---------------------------------------------------------------------------
-- reviews: persisted AI code reviews, owned by a single user.
-- ---------------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  repo_full_name text not null,
  pr_number integer not null,
  pr_title text not null,
  ai_summary text not null,
  ai_bugs jsonb not null default '[]'::jsonb,
  ai_suggestions jsonb not null default '[]'::jsonb,
  severity public.severity not null,
  created_at timestamptz not null default now()
);

comment on table public.reviews is 'AI-generated PR reviews. RLS-scoped to the owning user.';

-- History page lists newest-first per user.
create index reviews_user_created_idx on public.reviews (user_id, created_at desc);
-- Lookup "has this PR been reviewed before?" without a full scan.
create index reviews_user_repo_pr_idx on public.reviews (user_id, repo_full_name, pr_number);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Every policy compares auth.uid() so a user can only ever touch their own rows.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.reviews enable row level security;

-- profiles
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- reviews
create policy "reviews_select_own"
  on public.reviews for select
  using (auth.uid() = user_id);

create policy "reviews_insert_own"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "reviews_delete_own"
  on public.reviews for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Auto-provision a profile when a new auth user is created.
-- security definer so it can write to public.profiles despite RLS; search_path
-- is pinned empty to prevent search-path hijacking.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, github_username, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'user_name',
      new.raw_user_meta_data ->> 'preferred_username'
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
