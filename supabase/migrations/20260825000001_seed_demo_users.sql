-- Seed demo users into Supabase Auth so the demo login buttons work.
-- Requires the service role. If you use `supabase db push`, this runs with
-- full privileges. If you only have the anon/publishable key, run this from
-- the Supabase dashboard SQL editor instead.
--
-- Demo users:
--   admin@mms.com   / admin123   (role: admin)
--   teacher@mms.com / teacher123 (role: teacher)
--   parent@mms.com  / parent123  (role: parent)

create extension if not exists pgcrypto;

-- idempotent upsert per email
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
select
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  values.email,
  crypt(values.password, gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('role', values.role, 'full_name', values.full_name),
  now(),
  now()
from (
  values
    ('admin@mms.com', 'admin123', 'admin', 'System Administrator'),
    ('teacher@mms.com', 'teacher123', 'teacher', 'Maulana Abdullah'),
    ('parent@mms.com', 'parent123', 'parent', 'Muhammad Ali')
) as values (email, password, role, full_name)
where not exists (
  select 1 from auth.users u where u.email = values.email
);
