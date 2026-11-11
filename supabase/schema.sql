-- Cuentas y progreso de CodeQuest.
-- El usuario entra con nombre y contraseña. El correo interno no se confirma.

grant usage on schema public to anon, authenticated;

create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  nombre text not null,
  rol text not null check (rol in ('estudiante', 'padre', 'profesional'))
);

create table if not exists public.progreso (
  usuario_id uuid primary key references public.perfiles (id) on delete cascade,
  completed text[] not null default '{}',
  estrellas_totales integer not null default 0,
  puntos_totales integer not null default 0,
  best_scores jsonb not null default '{}',
  badges text[] not null default '{}',
  attempt_counts jsonb not null default '{}',
  tiempo_usado_seg integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.intentos (
  id text primary key,
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  challenge_id text not null,
  fecha_hora timestamptz not null,
  aciertos boolean not null,
  numero_intentos integer not null,
  tiempo_resolucion_seg integer not null,
  secuencia jsonb not null default '[]'
);

create table if not exists public.ajuste_tiempo (
  id integer primary key default 1 check (id = 1),
  limite_min integer not null default 120
);

insert into public.ajuste_tiempo (id, limite_min)
values (1, 120)
on conflict (id) do nothing;

grant select, insert, update on public.perfiles to authenticated;
grant select, insert, update on public.progreso to authenticated;
grant select, insert on public.intentos to authenticated;
grant select, update on public.ajuste_tiempo to authenticated;

alter table public.perfiles enable row level security;
alter table public.progreso enable row level security;
alter table public.intentos enable row level security;
alter table public.ajuste_tiempo enable row level security;

drop policy if exists "perfil propio" on public.perfiles;
create policy "perfil propio" on public.perfiles
  for all to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "progreso propio" on public.progreso;
create policy "progreso propio" on public.progreso
  for all to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

drop policy if exists "progreso visible para acompanantes" on public.progreso;
create policy "progreso visible para acompanantes" on public.progreso
  for select to authenticated
  using (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol in ('padre', 'profesional')
    )
  );

drop policy if exists "intentos propios" on public.intentos;
create policy "intentos propios" on public.intentos
  for all to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

drop policy if exists "leer limite" on public.ajuste_tiempo;
create policy "leer limite" on public.ajuste_tiempo
  for select to authenticated
  using (true);

drop policy if exists "profesional cambia limite" on public.ajuste_tiempo;
create policy "profesional cambia limite" on public.ajuste_tiempo
  for update to authenticated
  using (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol = 'profesional'
    )
  )
  with check (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol = 'profesional'
    )
  );

create or replace function public.reiniciar_tiempo(p_username text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.perfiles where id = auth.uid() and rol = 'profesional'
  ) then
    raise exception 'no autorizado';
  end if;

  update public.progreso
  set tiempo_usado_seg = 0, updated_at = now()
  where usuario_id = (
    select id from public.perfiles where username = lower(p_username)
  );
end;
$$;

grant execute on function public.reiniciar_tiempo(text) to authenticated;
