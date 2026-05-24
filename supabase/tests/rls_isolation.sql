-- ===========================================================================
-- RLS isolation test for DevFlow.
--
-- Verifies that one user can never read another user's reviews. Creates two
-- throwaway users, has each insert a review while acting as themselves (role +
-- JWT claim simulated), and asserts each sees ONLY their own row.
--
-- Run in the Supabase SQL Editor (as the default postgres role). The whole thing
-- runs in a transaction and ROLLS BACK at the end — it leaves no data behind.
--
-- A passing run prints two "RLS OK" notices and no exceptions.
-- Note: auth.users column requirements can vary slightly between Supabase
-- versions; the inserts below include the historically-required NOT NULL columns.
-- ===========================================================================

begin;

-- 1. Create two users. The on_auth_user_created trigger auto-creates profiles.
--    Their ids are stashed in session settings so we can read them under any role.
do $$
declare
  uid_a uuid := gen_random_uuid();
  uid_b uuid := gen_random_uuid();
begin
  perform set_config('devflow.uid_a', uid_a::text, false);
  perform set_config('devflow.uid_b', uid_b::text, false);

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token, email_change_token_new, email_change
  )
  values
    ('00000000-0000-0000-0000-000000000000', uid_a, 'authenticated', 'authenticated',
     'alice@example.com', '', now(), now(), now(),
     '{"provider":"github"}'::jsonb, '{"user_name":"alice"}'::jsonb, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', uid_b, 'authenticated', 'authenticated',
     'bob@example.com', '', now(), now(), now(),
     '{"provider":"github"}'::jsonb, '{"user_name":"bob"}'::jsonb, '', '', '', '');
end $$;

-- 2. Act as Alice and insert her review.
set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', current_setting('devflow.uid_a'), 'role', 'authenticated')::text,
  true
);
insert into public.reviews
  (user_id, repo_full_name, pr_number, pr_title, ai_summary, ai_bugs, ai_suggestions, severity)
values
  (auth.uid(), 'octocat/alice-repo', 1, 'Alice PR', 'summary', '[]'::jsonb, '[]'::jsonb, 'low');

-- 3. Act as Bob and insert his review.
select set_config(
  'request.jwt.claims',
  json_build_object('sub', current_setting('devflow.uid_b'), 'role', 'authenticated')::text,
  true
);
insert into public.reviews
  (user_id, repo_full_name, pr_number, pr_title, ai_summary, ai_bugs, ai_suggestions, severity)
values
  (auth.uid(), 'octocat/bob-repo', 2, 'Bob PR', 'summary', '[]'::jsonb, '[]'::jsonb, 'low');

-- 4. As Bob, assert he sees exactly his own review and none of Alice's.
do $$
begin
  if (select count(*) from public.reviews) <> 1 then
    raise exception 'RLS FAIL: Bob sees % review(s), expected 1', (select count(*) from public.reviews);
  end if;
  if exists (select 1 from public.reviews where repo_full_name = 'octocat/alice-repo') then
    raise exception 'RLS FAIL: Bob can read Alice''s review';
  end if;
  raise notice 'RLS OK: Bob sees only his own review';
end $$;

-- 5. Switch to Alice and assert the mirror image.
select set_config(
  'request.jwt.claims',
  json_build_object('sub', current_setting('devflow.uid_a'), 'role', 'authenticated')::text,
  true
);
do $$
begin
  if (select count(*) from public.reviews) <> 1 then
    raise exception 'RLS FAIL: Alice sees % review(s), expected 1', (select count(*) from public.reviews);
  end if;
  if exists (select 1 from public.reviews where repo_full_name = 'octocat/bob-repo') then
    raise exception 'RLS FAIL: Alice can read Bob''s review';
  end if;
  raise notice 'RLS OK: Alice sees only her own review';
end $$;

reset role;
rollback;
