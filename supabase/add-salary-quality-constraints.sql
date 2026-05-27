alter table public.salary_reports
drop constraint if exists salary_reports_amount_monthly_check;

alter table public.salary_reports
add constraint salary_reports_amount_monthly_check
check (amount_monthly between 50000 and 20000000);
