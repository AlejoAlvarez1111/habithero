-- Solo puede haber una caída abierta (sin revivir) a la vez
create unique index if not exists falls_una_abierta_por_usuario
  on public.falls (user_id)
  where revived_at is null;