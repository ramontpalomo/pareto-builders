-- ==============================================
-- Pareto Builders — Schema do Banco de Dados
-- Cole este SQL no Supabase SQL Editor e clique em Run
-- ==============================================

-- Extensão para UUIDs
create extension if not exists "uuid-ossp";

-- ==============================================
-- TABELAS
-- ==============================================

-- Tabela de perfis (todos os usuários)
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role text check (role in ('builder', 'company')) not null,
  full_name text not null,
  email text not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- Tabela de perfis dos AI Builders
create table if not exists builder_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  slug text unique not null,
  full_name text not null,
  headline text default '',
  bio text default '',
  avatar_url text,
  location text,
  linkedin_url text,
  github_url text,
  website_url text,
  specialties text[] default '{}',
  years_experience int default 0,
  availability text check (availability in ('available', 'busy', 'unavailable')) default 'available',
  hourly_rate_min int,
  hourly_rate_max int,
  fma_verified boolean default false,
  fma_grade text,
  profile_score int default 10,
  views_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabela de perfis das Empresas
create table if not exists company_profiles (
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

-- Tabela de certificações dos Builders
create table if not exists certifications (
  id uuid primary key default uuid_generate_v4(),
  builder_id uuid references builder_profiles(id) on delete cascade not null,
  name text not null,
  issuer text not null,
  issued_at date,
  credential_url text,
  diploma_url text,
  is_fma boolean default false,
  verified boolean default false,
  created_at timestamptz default now()
);

-- Tabela de projetos dos Builders
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  builder_id uuid references builder_profiles(id) on delete cascade not null,
  title text not null,
  description text default '',
  tags text[] default '{}',
  demo_url text,
  image_url text,
  results text,
  created_at timestamptz default now()
);

-- Tabela de configuração do Clone de IA
create table if not exists ai_clones (
  id uuid primary key default uuid_generate_v4(),
  builder_id uuid references builder_profiles(id) on delete cascade not null unique,
  personality text default '',
  context text default '',
  can_discuss_pricing boolean default true,
  can_schedule_meetings boolean default false,
  greeting text default '',
  enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==============================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================

alter table profiles enable row level security;
alter table builder_profiles enable row level security;
alter table company_profiles enable row level security;
alter table certifications enable row level security;
alter table projects enable row level security;
alter table ai_clones enable row level security;

-- Profiles: qualquer um vê, só o dono edita
create policy "Qualquer um pode ver perfis" on profiles for select using (true);
create policy "Usuário cria seu próprio perfil" on profiles for insert with check (auth.uid() = user_id);
create policy "Usuário atualiza seu próprio perfil" on profiles for update using (auth.uid() = user_id);

-- Builder profiles: qualquer um vê, só o dono edita
create policy "Qualquer um pode ver builder profiles" on builder_profiles for select using (true);
create policy "Builder cria seu próprio perfil" on builder_profiles for insert with check (auth.uid() = user_id);
create policy "Builder atualiza seu próprio perfil" on builder_profiles for update using (auth.uid() = user_id);

-- Company profiles: só o dono acessa
create policy "Empresa vê seu próprio perfil" on company_profiles for select using (auth.uid() = user_id);
create policy "Empresa cria seu próprio perfil" on company_profiles for insert with check (auth.uid() = user_id);
create policy "Empresa atualiza seu próprio perfil" on company_profiles for update using (auth.uid() = user_id);

-- Certifications: qualquer um vê, dono do builder gerencia
create policy "Qualquer um vê certificações" on certifications for select using (true);
create policy "Builder adiciona sua certificação" on certifications for insert
  with check (exists (select 1 from builder_profiles where id = builder_id and user_id = auth.uid()));
create policy "Builder deleta sua certificação" on certifications for delete
  using (exists (select 1 from builder_profiles where id = builder_id and user_id = auth.uid()));

-- Projects: qualquer um vê, dono do builder gerencia
create policy "Qualquer um vê projetos" on projects for select using (true);
create policy "Builder adiciona seu projeto" on projects for insert
  with check (exists (select 1 from builder_profiles where id = builder_id and user_id = auth.uid()));
create policy "Builder atualiza seu projeto" on projects for update
  using (exists (select 1 from builder_profiles where id = builder_id and user_id = auth.uid()));
create policy "Builder deleta seu projeto" on projects for delete
  using (exists (select 1 from builder_profiles where id = builder_id and user_id = auth.uid()));

-- AI Clones: qualquer um vê (para o chat público), só dono edita
create policy "Qualquer um vê clone config" on ai_clones for select using (true);
create policy "Builder cria seu clone" on ai_clones for insert
  with check (exists (select 1 from builder_profiles where id = builder_id and user_id = auth.uid()));
create policy "Builder atualiza seu clone" on ai_clones for update
  using (exists (select 1 from builder_profiles where id = builder_id and user_id = auth.uid()));

-- ==============================================
-- FUNÇÕES AUXILIARES
-- ==============================================

-- Atualiza o updated_at automaticamente
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger builder_profiles_updated_at
  before update on builder_profiles
  for each row execute function update_updated_at();

create trigger ai_clones_updated_at
  before update on ai_clones
  for each row execute function update_updated_at();
