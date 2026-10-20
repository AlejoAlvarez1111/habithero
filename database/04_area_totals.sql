create or replace view public.area_totals
with (security_invoker = true) as
select
  a.id as area_id,
  a.user_id,
  a.name,
  a.position,
  coalesce(sum(l.xp_awarded), 0)::int as xp
from public.areas a
left join public.habits h on h.area_id = a.id
left join public.habit_logs l on l.habit_id = h.id
group by a.id, a.user_id, a.name, a.position;

grant select on public.area_totals to authenticated;