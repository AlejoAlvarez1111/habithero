-- HabitHero: lógica de logros
-- Requiere las tablas y vistas anteriores (01 a 05).

-- Código estable para identificar hábitos especiales (no depende del nombre)
alter table public.habits add column if not exists code text;

-- Nivel de un área según su XP: pasar del nivel n al n+1 cuesta 200 x n XP
create or replace function public.level_of(xp integer)
returns integer
language plpgsql
immutable
as $$
declare
  n integer := 1;
  resto integer := greatest(xp, 0);
begin
  while resto >= 200 * n loop
    resto := resto - 200 * n;
    n := n + 1;
  end loop;
  return n;
end;
$$;

-- Racha más larga de días consecutivos dentro de una lista de fechas
create or replace function public.max_run(dias date[])
returns integer
language sql
immutable
as $$
  select coalesce(max(n), 0)::int
  from (
    select count(*) as n
    from (
      select d, d - (row_number() over (order by d))::int as g
      from (select distinct unnest(dias) as d) x
    ) y
    group by g
  ) z
$$;

-- Racha más larga de un hábito identificado por su código
create or replace function public.racha_habito(p_uid uuid, p_code text)
returns integer
language sql
stable
as $$
  select public.max_run(array_agg(l.logged_on))
  from public.habit_logs l
  join public.habits h on h.id = l.habit_id
  where l.user_id = p_uid and h.code = p_code
$$;

-- Los Reales de los logros también suman al saldo
create or replace view public.player_totals
with (security_invoker = true) as
select
  s.user_id,
  s.max_hp,
  s.streak_days,
  s.streak_multiplier,
  greatest(0, s.max_hp - coalesce((
    select sum(l.hp_lost)
    from public.habit_logs l
    where l.user_id = s.user_id
      and l.created_at > coalesce(
        (select max(f.revived_at) from public.falls f where f.user_id = s.user_id),
        '-infinity'::timestamptz)
  ), 0))::int as hp,
  (
    coalesce((select sum(l.reales_awarded) from public.habit_logs l where l.user_id = s.user_id), 0)
    + coalesce((select sum(b.reales_reward) from public.bosses b
                where b.user_id = s.user_id and b.status = 'defeated'), 0)
    + coalesce((select sum(a.reales_reward)
                from public.user_achievements ua
                join public.achievements a on a.id = ua.achievement_id
                where ua.user_id = s.user_id), 0)
    - coalesce((select sum(p.price) from public.purchases p where p.user_id = s.user_id), 0)
  )::int as reales
from public.settings s;

-- Revisa todos los logros y desbloquea los que ya se cumplen.
-- Devuelve solo los que se desbloquearon en esta revisión.
create or replace function public.check_achievements()
returns table (code text, name text, reales_reward integer)
language plpgsql
set search_path = public
as $$
#variable_conflict use_column
declare
  uid uuid := auth.uid();
  v_max_hp integer;
  v_hp integer;
  v_reales integer;
  v_codes text[] := '{}';
  v_primer_log timestamptz;
  v_ultimo_revivir timestamptz;
  v_inicio_vida timestamptz;
  v_bajo_300 timestamptz;
  v_racha integer;
  v_ganado bigint;
  v_n_areas integer;
  v_nivel_min integer;
  v_nivel_max integer;
begin
  if uid is null then
    return;
  end if;

  select s.max_hp into v_max_hp from settings s where s.user_id = uid;
  if v_max_hp is null then
    return;
  end if;

  select t.hp, t.reales into v_hp, v_reales from player_totals t where t.user_id = uid;

  -- CONSTANCIA
  if exists (select 1 from habit_logs l join habits h on h.id = l.habit_id
             where l.user_id = uid and h.kind = 'good') then
    v_codes := array_append(v_codes, 'primer_paso');
  end if;

  -- Semana perfecta: 7 días seguidos con todos los hábitos diarios normales (sin tope semanal)
  if public.max_run(array(
       select l.logged_on
       from habit_logs l
       where l.user_id = uid
         and l.habit_id in (select h.id from habits h
                            where h.user_id = uid and h.is_active and h.kind = 'good'
                              and h.frequency = 'daily' and h.tier = 'normal' and h.weekly_cap is null)
       group by l.logged_on
       having count(distinct l.habit_id) = (select count(*) from habits h
                            where h.user_id = uid and h.is_active and h.kind = 'good'
                              and h.frequency = 'daily' and h.tier = 'normal' and h.weekly_cap is null)
     )) >= 7 then
    v_codes := array_append(v_codes, 'semana_perfecta');
  end if;

  -- Rachas de un mismo hábito diario
  select coalesce(max(r.n), 0) into v_racha from (
    select public.max_run(array_agg(l.logged_on)) as n
    from habit_logs l join habits h on h.id = l.habit_id
    where l.user_id = uid and h.kind = 'good' and h.frequency = 'daily' and h.weekly_cap is null
    group by l.habit_id
  ) r;
  if v_racha >= 21 then v_codes := array_append(v_codes, 'racha_21'); end if;
  if v_racha >= 100 then v_codes := array_append(v_codes, 'racha_100'); end if;

  -- Vida: inicio de la vida actual (primer hábito o último reto de revivir)
  select max(f.revived_at) into v_ultimo_revivir from falls f where f.user_id = uid;
  select min(l.created_at) into v_primer_log from habit_logs l where l.user_id = uid;
  v_inicio_vida := coalesce(v_ultimo_revivir, v_primer_log);

  if v_inicio_vida is not null then
    select min(x.created_at) into v_bajo_300 from (
      select l.created_at,
             v_max_hp - sum(l.hp_lost) over (order by l.created_at, l.id) as hp_despues
      from habit_logs l
      where l.user_id = uid
        and l.created_at > coalesce(v_ultimo_revivir, '-infinity'::timestamptz)
    ) x
    where x.hp_despues < 300;

    -- Imparable: 30 días sin bajar de 300 de vida
    if coalesce(v_bajo_300, now()) - v_inicio_vida >= interval '30 days' then
      v_codes := array_append(v_codes, 'imparable');
    end if;

    -- Intocable: 60 días sin llegar a 0 de vida
    if v_hp > 0 and now() - v_inicio_vida >= interval '60 days' then
      v_codes := array_append(v_codes, 'intocable');
    end if;
  end if;

  -- HÁBITOS ESPECÍFICOS
  if public.racha_habito(uid, 'sin_redes') >= 7 then v_codes := array_append(v_codes, 'sin_redes_7'); end if;
  if public.racha_habito(uid, 'tender_cama') >= 14 then v_codes := array_append(v_codes, 'madrugador'); end if;
  if public.racha_habito(uid, 'agua') >= 30 then v_codes := array_append(v_codes, 'hidratado'); end if;

  -- Primer mes de ejercicio: 16 días de gym dentro de 30 días
  if exists (
    select 1
    from habit_logs a join habits h on h.id = a.habit_id
    where a.user_id = uid and h.code = 'gym'
      and (select count(*) from habit_logs b
           where b.habit_id = a.habit_id
             and b.logged_on between a.logged_on - 29 and a.logged_on) >= 16
  ) then
    v_codes := array_append(v_codes, 'mes_ejercicio');
  end if;

  -- Lector: 34 sesiones de 30 minutos son más de 1.000 minutos
  if (select count(*) from habit_logs l join habits h on h.id = l.habit_id
      where l.user_id = uid and h.code = 'leer') >= 34 then
    v_codes := array_append(v_codes, 'lector');
  end if;

  if (select count(*) from habit_logs l join habits h on h.id = l.habit_id
      where l.user_id = uid and h.code = 'ingles') >= 50 then
    v_codes := array_append(v_codes, 'poliglota');
  end if;

  -- NIVELES Y ÁREAS
  select count(*), min(public.level_of(a.xp)), max(public.level_of(a.xp))
    into v_n_areas, v_nivel_min, v_nivel_max
  from area_totals a where a.user_id = uid;

  if v_n_areas > 0 then
    if v_nivel_max >= 2 then v_codes := array_append(v_codes, 'primer_nivel'); end if;
    if v_nivel_max >= 5 then v_codes := array_append(v_codes, 'nivel_5'); end if;
    if v_nivel_min >= 2 then v_codes := array_append(v_codes, 'sin_puntos_debiles'); end if;
    if v_nivel_min >= 3 then v_codes := array_append(v_codes, 'equilibrio'); end if;
    if v_nivel_min >= 10 then v_codes := array_append(v_codes, 'heroe_completo'); end if;
  end if;

  -- DINERO Y TIENDA
  select coalesce(sum(l.reales_awarded), 0) into v_ganado from habit_logs l where l.user_id = uid;
  v_ganado := v_ganado + coalesce((select sum(b.reales_reward) from bosses b
                                   where b.user_id = uid and b.status = 'defeated'), 0);
  if v_ganado >= 1000000 then v_codes := array_append(v_codes, 'primer_millon'); end if;
  if v_reales >= 500000 then v_codes := array_append(v_codes, 'ahorrador'); end if;

  if v_primer_log is not null and v_primer_log <= now() - interval '7 days'
     and not exists (select 1 from purchases p
                     where p.user_id = uid and p.purchased_at >= now() - interval '7 days') then
    v_codes := array_append(v_codes, 'con_moderacion');
  end if;

  -- JEFES Y SUPERVIVENCIA
  if exists (select 1 from bosses b where b.user_id = uid and b.status = 'defeated') then
    v_codes := array_append(v_codes, 'cazador');
  end if;
  if exists (select 1 from bosses b where b.user_id = uid and b.kind = 'big' and b.status = 'defeated') then
    v_codes := array_append(v_codes, 'jefe_grande');
  end if;
  if exists (select 1 from falls f where f.user_id = uid and f.revived_at is not null) then
    v_codes := array_append(v_codes, 'renacido');
  end if;

  -- Racha de jefes: 3 meses seguidos derrotando al jefe mensual
  if (select coalesce(max(n), 0) from (
        select count(*) as n
        from (
          select m, m - (row_number() over (order by m))::int as g
          from (select distinct (extract(year from b.period_start) * 12
                                 + extract(month from b.period_start))::int as m
                from bosses b
                where b.user_id = uid and b.kind = 'monthly' and b.status = 'defeated') x
        ) y
        group by g
      ) z) >= 3 then
    v_codes := array_append(v_codes, 'racha_jefes');
  end if;

  -- MALOS HÁBITOS: días en que hubo hábitos buenos y ningún hábito malo (o ninguno del tipo indicado)
  if public.max_run(array(
       select l.logged_on from habit_logs l join habits h on h.id = l.habit_id
         where l.user_id = uid and h.kind = 'good'
       except
       select l.logged_on from habit_logs l join habits h on h.id = l.habit_id
         where l.user_id = uid and h.kind = 'bad'
     )) >= 7 then
    v_codes := array_append(v_codes, 'semana_limpia');
  end if;

  if public.max_run(array(
       select l.logged_on from habit_logs l join habits h on h.id = l.habit_id
         where l.user_id = uid and h.kind = 'good'
       except
       select l.logged_on from habit_logs l join habits h on h.id = l.habit_id
         where l.user_id = uid and h.kind = 'bad' and h.tier = 'alto'
     )) >= 30 then
    v_codes := array_append(v_codes, 'mes_limpio');
  end if;

  if public.max_run(array(
       select l.logged_on from habit_logs l join habits h on h.id = l.habit_id
         where l.user_id = uid and h.kind = 'good'
       except
       select l.logged_on from habit_logs l join habits h on h.id = l.habit_id
         where l.user_id = uid and h.code = 'domicilios'
     )) >= 30 then
    v_codes := array_append(v_codes, 'sin_domicilios');
  end if;

  -- Desbloquear los nuevos y devolverlos
  return query
  with nuevos as (
    insert into user_achievements (user_id, achievement_id)
    select uid, a.id from achievements a where a.code = any(v_codes)
    on conflict (user_id, achievement_id) do nothing
    returning achievement_id
  )
  select a.code, a.name, a.reales_reward
  from achievements a join nuevos n on n.achievement_id = a.id
  order by a.reales_reward;
end;
$$;

revoke execute on function public.check_achievements() from public, anon;
grant execute on function public.check_achievements() to authenticated;
grant select on public.player_totals to authenticated;