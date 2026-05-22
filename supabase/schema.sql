create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  uid uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  photo_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.professions (
  id text primary key,
  slug text not null unique,
  name text not null,
  category text not null,
  keywords text[] default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.salary_reports (
  id uuid primary key default gen_random_uuid(),
  profession_id text not null,
  amount_monthly integer not null check (amount_monthly >= 0),
  modality text not null check (modality in ('en_blanco', 'en_negro', 'monotributo', 'autonomo')),
  workload text check (workload in ('full_time', 'part_time', 'por_horas')),
  seniority text not null check (seniority in ('junior', 'semi', 'senior', 'no_aplica')),
  province text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  title text not null,
  body text not null,
  flair text not null default 'consulta',
  category text not null,
  upvotes integer not null default 0,
  comments_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  parent_id uuid references public.replies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  body text not null,
  upvotes integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists salary_reports_profession_id_idx on public.salary_reports(profession_id);
create index if not exists posts_category_created_at_idx on public.posts(category, created_at desc);
create index if not exists replies_post_id_created_at_idx on public.replies(post_id, created_at);

alter table public.profiles enable row level security;
alter table public.professions enable row level security;
alter table public.salary_reports enable row level security;
alter table public.posts enable row level security;
alter table public.replies enable row level security;

drop policy if exists "profiles are readable" on public.profiles;
create policy "profiles are readable"
on public.profiles for select
using (true);

drop policy if exists "users can create own profile" on public.profiles;
create policy "users can create own profile"
on public.profiles for insert
with check (auth.uid() = uid);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles for update
using (auth.uid() = uid)
with check (auth.uid() = uid);

drop policy if exists "professions are readable" on public.professions;
create policy "professions are readable"
on public.professions for select
using (true);

drop policy if exists "salary reports are readable" on public.salary_reports;
create policy "salary reports are readable"
on public.salary_reports for select
using (true);

drop policy if exists "authenticated users can create salary reports" on public.salary_reports;
create policy "authenticated users can create salary reports"
on public.salary_reports for insert
to authenticated
with check (true);

drop policy if exists "posts are readable" on public.posts;
create policy "posts are readable"
on public.posts for select
using (true);

drop policy if exists "authenticated users can create posts" on public.posts;
create policy "authenticated users can create posts"
on public.posts for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "authenticated users can update post counters" on public.posts;
create policy "authenticated users can update post counters"
on public.posts for update
to authenticated
using (true)
with check (true);

drop policy if exists "replies are readable" on public.replies;
create policy "replies are readable"
on public.replies for select
using (true);

drop policy if exists "authenticated users can create replies" on public.replies;
create policy "authenticated users can create replies"
on public.replies for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "authenticated users can update reply counters" on public.replies;
create policy "authenticated users can update reply counters"
on public.replies for update
to authenticated
using (true)
with check (true);

drop policy if exists "admins can delete posts" on public.posts;
create policy "admins can delete posts"
on public.posts for delete
using (
  exists (
    select 1
    from public.profiles
    where profiles.uid = auth.uid()
      and profiles.role = 'admin'
  )
);

drop policy if exists "admins can delete salary reports" on public.salary_reports;
create policy "admins can delete salary reports"
on public.salary_reports for delete
using (
  exists (
    select 1
    from public.profiles
    where profiles.uid = auth.uid()
      and profiles.role = 'admin'
  )
);

insert into public.professions (id, slug, name, category, keywords) values
  ('programador-web', 'programador-web', 'Programador Web', 'Tecnologia', array['desarrollador', 'developer', 'sistemas', 'programacion']),
  ('desarrollador-backend', 'desarrollador-backend', 'Desarrollador Backend', 'Tecnologia', array['programador', 'developer', 'sistemas', 'back']),
  ('desarrollador-frontend', 'desarrollador-frontend', 'Desarrollador Frontend', 'Tecnologia', array['programador', 'developer', 'sistemas', 'front']),
  ('analista-de-datos', 'analista-de-datos', 'Analista de Datos', 'Tecnologia', array['data', 'analytics']),
  ('disenador-ux-ui', 'disenador-ux-ui', 'Disenador UX/UI', 'Tecnologia', array['design', 'web', 'interfaces']),
  ('soporte-tecnico', 'soporte-tecnico', 'Soporte Tecnico', 'Tecnologia', array['sistemas', 'helpdesk', 'it']),
  ('medico-clinico', 'medico-clinico', 'Medico Clinico', 'Salud', array[]::text[]),
  ('enfermero', 'enfermero', 'Enfermero/a', 'Salud', array[]::text[]),
  ('odontologo', 'odontologo', 'Odontologo/a', 'Salud', array[]::text[]),
  ('psicologo', 'psicologo', 'Psicologo/a', 'Salud', array[]::text[]),
  ('docente-primaria', 'docente-primaria', 'Docente Nivel Primario', 'Educacion', array[]::text[]),
  ('docente-secundaria', 'docente-secundaria', 'Docente Nivel Secundario', 'Educacion', array[]::text[]),
  ('plomero', 'plomero', 'Plomero', 'Oficios y Construccion', array[]::text[]),
  ('electricista', 'electricista', 'Electricista', 'Oficios y Construccion', array[]::text[]),
  ('gasista', 'gasista', 'Gasista Matriculado', 'Oficios y Construccion', array[]::text[]),
  ('albanil', 'albanil', 'Albanil', 'Oficios y Construccion', array[]::text[]),
  ('vendedor-local', 'vendedor-local', 'Vendedor/a de Local', 'Comercio y Ventas', array[]::text[]),
  ('cajero', 'cajero', 'Cajero/a', 'Comercio y Ventas', array[]::text[]),
  ('cocinero', 'cocinero', 'Cocinero/a', 'Gastronomia', array[]::text[]),
  ('chef', 'chef', 'Chef', 'Gastronomia', array[]::text[]),
  ('contador-publico', 'contador-publico', 'Contador/a Publico/a', 'Administracion y Finanzas', array[]::text[]),
  ('asistente-administrativo', 'asistente-administrativo', 'Asistente Administrativo', 'Administracion y Finanzas', array[]::text[]),
  ('ingeniero-civil', 'ingeniero-civil', 'Ingeniero/a Civil', 'Ingenieria', array[]::text[]),
  ('arquitecto', 'arquitecto', 'Arquitecto/a', 'Ingenieria y Construccion', array[]::text[]),
  ('abogado', 'abogado', 'Abogado/a General', 'Legales', array[]::text[]),
  ('disenador-grafico', 'disenador-grafico', 'Disenador/a Grafico/a', 'Diseno y Comunicacion', array[]::text[]),
  ('community-manager', 'community-manager', 'Community Manager', 'Diseno y Comunicacion', array[]::text[]),
  ('chofer-camion', 'chofer-camion', 'Chofer de Camion', 'Logistica y Transporte', array[]::text[]),
  ('repartidor', 'repartidor', 'Repartidor/a', 'Logistica y Transporte', array[]::text[]),
  ('policia', 'policia', 'Policia', 'Seguridad', array[]::text[]),
  ('empleada-domestica', 'empleada-domestica', 'Personal de Casas Particulares', 'Otros', array[]::text[])
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  category = excluded.category,
  keywords = excluded.keywords;
