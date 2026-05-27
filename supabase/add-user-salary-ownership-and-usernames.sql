alter table public.profiles
add column if not exists username text;

update public.profiles
set username = 'Usuario_' || substr(replace(id::text, '-', ''), 1, 8)
where username is null;

alter table public.profiles
alter column username set not null;

create unique index if not exists profiles_username_key
on public.profiles(username);

alter table public.salary_reports
add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.salary_reports
add column if not exists updated_at timestamptz not null default now();

alter table public.salary_reports
drop constraint if exists salary_reports_amount_monthly_check;

alter table public.salary_reports
add constraint salary_reports_amount_monthly_check
check (amount_monthly between 50000 and 20000000);

with profile_count as (
  select count(*) as total from public.profiles
),
only_profile as (
  select uid
  from public.profiles
  where (select total from profile_count) = 1
  limit 1
)
update public.salary_reports
set user_id = (select uid from only_profile)
where user_id is null
  and exists (select 1 from only_profile);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'salary_reports_user_id_profession_id_key'
      and conrelid = 'public.salary_reports'::regclass
  ) then
    alter table public.salary_reports
    add constraint salary_reports_user_id_profession_id_key unique (user_id, profession_id);
  end if;
end $$;

create index if not exists salary_reports_user_id_idx
on public.salary_reports(user_id);

drop policy if exists "authenticated users can create salary reports" on public.salary_reports;
create policy "authenticated users can create salary reports"
on public.salary_reports for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can update own salary reports" on public.salary_reports;
create policy "users can update own salary reports"
on public.salary_reports for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
