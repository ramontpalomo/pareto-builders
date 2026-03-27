-- ============================================================
-- PARETO BUILDERS — Schema do Banco de Dados
-- Execute este SQL no Supabase: Dashboard → SQL Editor → Run
-- ============================================================

-- Extensão para slugs e UUIDs
create extension if not exists "uuid-ossp";
create extension if not exists "unaccent";

-- ============================================================
-- TABELA: profiles (todos os usuários)
-- ============================================================
create table public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role text not null check (role in ('builder', 'company')),
  full_name text not null,
  email text not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: builder_profiles
-- ============================================================
create table public.builder_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  slug text unique not null,
  full_name text not null,
  headline text,
  bio text,
  avatar_url text,
  location text,
  linkedin_url text,
  github_url text,
  website_url text,
  specialties text[] default '{}',
  years_experience integer default 0,
  availability text default 'available' check (availability in ('available', 'busy', 'unavailable')),
  hourly_rate_min integer,
  hourly_rate_max integer,
  fma_verified boolean default false,
  fma_grade text,
  profile_score integer default 0,
  views_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- TABELA: certifications
-- ============================================================
create table public.certifications (
  id uuid primary key default uuid_generate_v4(),
  builder_id uuid references public.builder_profiles(id) on delete cascade not null,
  name text not null,
  issuer text not null,
  issued_at date,
  credential_url text,
  diploma_url text,
  is_fma boolean default false,
  verified boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: projects
-- ============================================================
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  builder_id uuid references public.builder_profiles(id) on delete cascade not null,
  title text not null,
  description text,
  tags text[] default '{}',
  demo_url text,
  image_url text,
  results text,
  featured boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: company_profiles
-- ============================================================
create table public.company_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  company_name text not null,
  industry text,
  size text,
  website_url text,
  description text,
  logo_url text,
  created_at timestamptz default now()
);

-- ============================================================
-- TABELA: saved_builders (empresas salvam builders)
-- ============================================================
create table public.saved_builders (
  id uuid primary key default uuid_generate_v4(),
  company_user_id uuid references auth.users(id) on delete cascade not null,
  builder_id uuid references public.builder_profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(company_user_id, builder_id)
);

-- ============================================================
-- SEGURANÇA: Row Level Security (RLS)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.builder_profiles enable row level security;
alter table public.certifications enable row level security;
alter table public.projects enable row level security;
alter table public.company_profiles enable row level security;
alter table public.saved_builders enable row level security;

-- Profiles: todos podem ver, só o dono edita
create policy "Profiles são públicos" on public.profiles for select using (true);
create policy "Usuário cria próprio profile" on public.profiles for insert with check (auth.uid() = user_id);
create policy "Usuário edita próprio profile" on public.profiles for update using (auth.uid() = user_id);

-- Builder profiles: todos podem ver, só o dono edita
create policy "Builder profiles são públicos" on public.builder_profiles for select using (true);
create policy "Builder cria próprio perfil" on public.builder_profiles for insert with check (auth.uid() = user_id);
create policy "Builder edita próprio perfil" on public.builder_profiles for update using (auth.uid() = user_id);

-- Certifications: todos podem ver, só o builder dono edita
create policy "Certifications são públicas" on public.certifications for select using (true);
create policy "Builder gerencia suas certifications" on public.certifications for insert
  with check (exists (select 1 from public.builder_profiles where id = builder_id and user_id = auth.uid()));
create policy "Builder deleta suas certifications" on public.certifications for delete
  using (exists (select 1 from public.builder_profiles where id = builder_id and user_id = auth.uid()));

-- Projects: todos podem ver, só o builder dono edita
create policy "Projects são públicos" on public.projects for select using (true);
create policy "Builder gerencia seus projects" on public.projects for insert
  with check (exists (select 1 from public.builder_profiles where id = builder_id and user_id = auth.uid()));
create policy "Builder deleta seus projects" on public.projects for delete
  using (exists (select 1 from public.builder_profiles where id = builder_id and user_id = auth.uid()));
create policy "Builder atualiza seus projects" on public.projects for update
  using (exists (select 1 from public.builder_profiles where id = builder_id and user_id = auth.uid()));

-- Company profiles: só o dono vê e edita
create policy "Company vê próprio perfil" on public.company_profiles for select using (auth.uid() = user_id);
create policy "Company cria próprio perfil" on public.company_profiles for insert with check (auth.uid() = user_id);
create policy "Company edita próprio perfil" on public.company_profiles for update using (auth.uid() = user_id);

-- Saved builders
create policy "Company gerencia saved builders" on public.saved_builders for all using (auth.uid() = company_user_id);

-- ============================================================
-- DADOS DE EXEMPLO (para visualizar o marketplace)
-- ============================================================

-- Descomente e ajuste para inserir dados de teste se quiser
-- (Requer criar usuários primeiro via Auth)
