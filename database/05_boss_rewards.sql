-- Reales: hábitos + jefes derrotados - compras
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
    - coalesce((select sum(p.price) from public.purchases p where p.user_id = s.user_id), 0)
  )::int as reales
from public.settings s;

-- XP por área: hábitos + jefes derrotados de esa área
create or replace view public.area_totals
with (security_invoker = true) as
select
  a.id as area_id,
  a.user_id,
  a.name,
  a.position,
  (
    coalesce((select sum(l.xp_awarded)
              from public.habit_logs l
              join public.habits h on h.id = l.habit_id
              where h.area_id = a.id), 0)
    + coalesce((select sum(b.xp_reward) from public.bosses b
                where b.area_id = a.id and b.status = 'defeated'), 0)
  )::int as xp
from public.areas a;

grant select on public.player_totals to authenticated;
grant select on public.area_totals to authenticated;