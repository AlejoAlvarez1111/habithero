-- HabitHero: datos de ejemplo
-- Carga una configuración inicial NEUTRAL para probar la app.
-- Ejecútalo una sola vez, después de los archivos 01 a 08 y de crear tu usuario
-- en Supabase (Authentication > Users). Puedes editar todo desde la pantalla Ajustes.

do $$
declare uid uuid := (select id from auth.users order by created_at limit 1);
begin
  if uid is null then
    raise exception 'No hay ningún usuario creado en Authentication';
  end if;

  insert into public.settings (user_id) values (uid) on conflict do nothing;

  insert into public.areas (user_id, name, position) values
    (uid, 'Espiritual', 1), (uid, 'Familia', 2), (uid, 'Pareja', 3),
    (uid, 'Social', 4), (uid, 'Estudios y carrera', 5), (uid, 'Salud', 6),
    (uid, 'Creatividad', 7), (uid, 'Finanzas', 8), (uid, 'Aprendizaje', 9);

  -- Hábitos buenos
  insert into public.habits (user_id, name, kind, tier, area_id, xp, reales, hp_loss, frequency, weekly_cap, code, position)
  select uid, h.name, 'good', h.tier, a.id, h.xp, h.reales, 0, h.freq, nullif(h.cap, 0), h.code, h.pos
  from (values
    ('Tender la cama', 'alto', 'Salud', 60, 4000, 'daily', 0, 'tender_cama', 1),
    ('Beber 2 L de agua', 'normal', 'Salud', 20, 1000, 'daily', 0, 'agua', 2),
    ('Gym', 'normal', 'Salud', 20, 1000, 'daily', 5, 'gym', 3),
    ('Orar o meditar', 'normal', 'Espiritual', 20, 1000, 'daily', 0, null, 4),
    ('Tiempo de calidad con la familia', 'normal', 'Familia', 20, 1000, 'daily', 0, null, 5),
    ('Detalle o tiempo con mi pareja', 'medio', 'Pareja', 35, 2000, 'daily', 0, null, 6),
    ('Ver o llamar a un amigo', 'medio', 'Social', 35, 2000, 'daily', 0, null, 7),
    ('30 minutos de algo creativo', 'normal', 'Creatividad', 20, 1000, 'daily', 0, null, 8),
    ('Planificar el día', 'normal', 'Estudios y carrera', 20, 1000, 'daily', 0, null, 9),
    ('Menos de 60 minutos de redes', 'alto', 'Estudios y carrera', 60, 4000, 'daily', 0, 'sin_redes', 10),
    ('Establecer metas del mes', 'mensual', 'Estudios y carrera', 300, 40000, 'monthly', 0, null, 11),
    ('Leer mínimo 30 minutos', 'normal', 'Aprendizaje', 20, 1000, 'daily', 0, 'leer', 12),
    ('Estudiar inglés 30 minutos', 'normal', 'Aprendizaje', 20, 1000, 'daily', 0, 'ingles', 13),
    ('Registrar ingresos y gastos', 'normal', 'Finanzas', 20, 1000, 'daily', 0, null, 14),
    ('Ahorrar', 'semanal', 'Finanzas', 100, 10000, 'weekly', 0, null, 15)
  ) as h(name, tier, area, xp, reales, freq, cap, code, pos)
  join public.areas a on a.user_id = uid and a.name = h.area;

  -- Hábitos malos
  insert into public.habits (user_id, name, kind, tier, hp_loss, frequency, code, position)
  select uid, b.name, 'bad', b.tier, b.hp, 'daily', b.code, b.pos
  from (values
    ('Revisar redes apenas despierto', 'leve', 5, null, 1),
    ('Beber poca agua', 'leve', 5, null, 2),
    ('Procrastinar', 'normal', 10, null, 3),
    ('Trasnochar', 'normal', 10, null, 4),
    ('Comida chatarra', 'normal', 10, null, 5),
    ('Compras impulsivas', 'normal', 10, null, 6),
    ('Pedir domicilios innecesarios', 'normal', 10, 'domicilios', 7),
    ('Mentir', 'medio', 20, null, 8),
    ('Endeudarme', 'medio', 20, null, 9),
    ('Hábito de riesgo alto (ejemplo)', 'alto', 50, null, 10)
  ) as b(name, tier, hp, code, pos);

  -- Tienda
  insert into public.shop_items (user_id, name, price, position)
  select uid, s.name, s.price, s.pos
  from (values
    ('Postre o dulce', 15000, 1),
    ('1 hora extra de redes', 15000, 2),
    ('Comida favorita a domicilio', 30000, 3),
    ('Maratón de series', 50000, 4),
    ('Salida especial', 200000, 5),
    ('Día libre total sin culpa', 600000, 6)
  ) as s(name, price, pos);

  -- Retos de revivir
  insert into public.revive_challenges (user_id, name)
  select uid, r.name
  from (values
    ('10 km trotando + 10 km en bicicleta + 100 flexiones el mismo día'),
    ('Caminar 25 km en un día'),
    ('Leer 100 páginas en un día')
  ) as r(name);
end $$;
