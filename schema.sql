-- =========================================================
-- Sistema de Gestión de Equipos y Componentes Informáticos
-- Script de creación de la tabla en Supabase (PostgreSQL)
-- =========================================================

-- 1. Extensión necesaria para generar UUIDs automáticamente
create extension if not exists "pgcrypto";

-- 2. Tabla principal
create table if not exists componentes (
  id               uuid primary key default gen_random_uuid(),
  codigo           text not null unique,
  nombre           text not null,
  categoria        text not null,
  marca            text,
  cantidad         integer not null check (cantidad >= 0),
  estado           text not null default 'Disponible'
                     check (estado in ('Disponible','En uso','Reparación','Baja')),
  descripcion      text,
  fecha_registro   timestamptz not null default now()
);

-- 3. Habilitar Row Level Security (RLS)
alter table componentes enable row level security;

-- 4. Políticas de acceso
-- Para este trabajo escolar la app NO tiene login, así que se habilita
-- acceso público de lectura/escritura usando la clave "anon" (nunca la
-- clave "service_role"). En un sistema real, estas políticas deberían
-- exigir autenticación (auth.uid() is not null).

create policy "Lectura pública"
  on componentes for select
  using (true);

create policy "Insertar público"
  on componentes for insert
  with check (true);

create policy "Actualizar público"
  on componentes for update
  using (true);

create policy "Eliminar público"
  on componentes for delete
  using (true);

-- 5. (Opcional) Índice para acelerar la búsqueda por texto
create index if not exists idx_componentes_busqueda
  on componentes using gin (to_tsvector('spanish', codigo || ' ' || nombre || ' ' || coalesce(marca,'')));
