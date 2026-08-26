-- Student registration + admin approval flow
create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  father_name text not null,
  b_form_cnic text not null,
  guardian_mobile text not null,
  guardian_email text not null,
  password text,
  address text not null,
  city text not null,
  program_type text not null,
  photo_uri text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  rejected_at timestamptz,
  constraint registrations_status_check check (status in ('pending', 'approved', 'rejected'))
);

-- Extra columns so approved registrations can auto-create students with login info
alter table students
  add column if not exists email text,
  add column if not exists password text,
  add column if not exists b_form_cnic text,
  add column if not exists city text,
  add column if not exists guardian_email text,
  add column if not exists guardian_mobile text;
