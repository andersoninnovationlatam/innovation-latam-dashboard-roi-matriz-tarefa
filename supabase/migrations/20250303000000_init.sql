-- Migração inicial do boilerplate.
-- O Supabase Auth já cria a tabela auth.users; aqui podem ser criadas
-- tabelas extras (ex.: public.profiles) conforme necessidade do projeto.

-- Exemplo: perfil público do usuário (opcional).
-- Descomente e ajuste se for usar.
/*
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  display_name text,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
*/
