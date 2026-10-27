create or replace view public.daily_summary
with (security_invoker = true) as
select
  l.user_id,
  l.logged_on,
  (count(*) filter (where h.kind = 'good'))::int as buenos,
  (count(*) filter (where h.kind = 'bad'))::int as malos,
  coalesce(sum(l.hp_lost), 0)::int as vida_perdida,
  coalesce(sum(l.xp_awarded), 0)::int as xp,
  coalesce(sum(l.reales_awarded), 0)::int as reales
from public.habit_logs l
join public.habits h on h.id = l.habit_id
group by l.user_id, l.logged_on;

grant select on public.daily_summary to authenticated;