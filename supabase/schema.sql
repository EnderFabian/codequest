-- Cuentas y progreso de CodeQuest.
-- El usuario entra con nombre y contraseña. El correo interno no se confirma.

grant usage on schema public to anon, authenticated;

create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  nombre text not null,
  rol text not null check (rol in ('estudiante', 'padre', 'profesional')),
  codigo text,
  acceso_libre boolean not null default false
);

alter table public.perfiles add column if not exists acceso_libre boolean not null default false;

alter table public.perfiles add column if not exists codigo text;
create unique index if not exists perfiles_codigo_unico on public.perfiles (codigo) where codigo is not null;

create table if not exists public.vinculos (
  acompanante_id uuid not null references public.perfiles (id) on delete cascade,
  estudiante_id uuid not null references public.perfiles (id) on delete cascade,
  creado_en timestamptz not null default now(),
  primary key (acompanante_id, estudiante_id)
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
grant select on public.vinculos to authenticated;
grant select, insert, update on public.progreso to authenticated;
grant select, insert on public.intentos to authenticated;
grant select, update on public.ajuste_tiempo to authenticated;

alter table public.perfiles enable row level security;
alter table public.vinculos enable row level security;
alter table public.progreso enable row level security;
alter table public.intentos enable row level security;
alter table public.ajuste_tiempo enable row level security;

drop policy if exists "perfil propio" on public.perfiles;
create policy "perfil propio" on public.perfiles
  for all to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create or replace function public.esta_vinculado(p_estudiante uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.vinculos
    where acompanante_id = auth.uid() and estudiante_id = p_estudiante
  );
$$;

grant execute on function public.esta_vinculado(uuid) to authenticated;

drop policy if exists "vinculos propios" on public.vinculos;
create policy "vinculos propios" on public.vinculos
  for select to authenticated
  using (acompanante_id = auth.uid());

drop policy if exists "estudiantes visibles para acompanantes" on public.perfiles;
drop policy if exists "estudiantes vinculados" on public.perfiles;
create policy "estudiantes vinculados" on public.perfiles
  for select to authenticated
  using (rol = 'estudiante' and public.esta_vinculado(id));

drop policy if exists "progreso propio" on public.progreso;
create policy "progreso propio" on public.progreso
  for all to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

drop policy if exists "progreso visible para acompanantes" on public.progreso;
create policy "progreso visible para acompanantes" on public.progreso
  for select to authenticated
  using (public.esta_vinculado(usuario_id));

drop policy if exists "intentos propios" on public.intentos;
create policy "intentos propios" on public.intentos
  for all to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

drop policy if exists "intentos visibles para acompanantes" on public.intentos;
create policy "intentos visibles para acompanantes" on public.intentos
  for select to authenticated
  using (public.esta_vinculado(usuario_id));

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
    select 1
    from public.vinculos v
    join public.perfiles e on e.id = v.estudiante_id
    join public.perfiles a on a.id = v.acompanante_id
    where v.acompanante_id = auth.uid()
      and a.rol = 'profesional'
      and e.username = lower(p_username)
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

create or replace function public.asignar_codigo_estudiante()
returns trigger
language plpgsql
as $$
declare
  alfabeto constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  nuevo text;
  i int;
  intentos int := 0;
begin
  if new.rol is distinct from 'estudiante' then
    new.codigo := null;
    return new;
  end if;

  if tg_op = 'UPDATE' and old.codigo is not null then
    new.codigo := old.codigo;
    return new;
  end if;

  loop
    nuevo := '';
    for i in 1..8 loop
      nuevo := nuevo || substr(alfabeto, 1 + floor(random() * length(alfabeto))::int, 1);
    end loop;
    nuevo := substr(nuevo, 1, 4) || '-' || substr(nuevo, 5, 4);
    exit when not exists (select 1 from public.perfiles where codigo = nuevo);
    intentos := intentos + 1;
    if intentos > 20 then
      raise exception 'No se pudo crear un código único';
    end if;
  end loop;

  new.codigo := nuevo;
  return new;
end;
$$;

drop trigger if exists perfiles_codigo on public.perfiles;
create trigger perfiles_codigo
  before insert or update on public.perfiles
  for each row execute function public.asignar_codigo_estudiante();

update public.perfiles
set nombre = nombre
where rol = 'estudiante' and codigo is null;

create or replace function public.vincular_por_codigo(p_codigo text)
returns table (estudiante_id uuid, nombre text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rol text;
  v_est uuid;
  v_nombre text;
  v_codigo text;
begin
  select perfiles.rol into v_rol from public.perfiles where id = auth.uid();
  if v_rol is null or v_rol not in ('padre', 'profesional') then
    raise exception 'Solo un padre o un profesional puede vincular un estudiante.';
  end if;

  v_codigo := upper(regexp_replace(coalesce(p_codigo, ''), '[^A-Za-z0-9]', '', 'g'));
  if length(v_codigo) <> 8 then
    raise exception 'Ese código no corresponde a ningún estudiante.';
  end if;
  v_codigo := substr(v_codigo, 1, 4) || '-' || substr(v_codigo, 5, 4);

  select id, perfiles.nombre into v_est, v_nombre
  from public.perfiles
  where rol = 'estudiante' and codigo = v_codigo;

  if v_est is null then
    raise exception 'Ese código no corresponde a ningún estudiante.';
  end if;

  insert into public.vinculos (acompanante_id, estudiante_id)
  values (auth.uid(), v_est)
  on conflict do nothing;

  return query select v_est, v_nombre;
end;
$$;

grant execute on function public.vincular_por_codigo(text) to authenticated;
