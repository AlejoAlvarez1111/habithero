-- HabitHero: esquema de la base de datos
-- Cada tabla de datos personales tiene user_id y reglas de acceso por fila.

-- Configuración del usuario
create table public.settings (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  max_hp integer not null default 500,
  streak_days integer not null default 7,
  streak_multiplier numeric(4,2) not null default 1.25,
  timezone text not null default 'America/Bogota',
  created_at timestamptz not null default now()
);

-- Áreas de la vida
create table public.areas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  position integer not null default 0,
  unique (user_id, name)
);

-- Hábitos buenos y malos
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('good', 'bad')),
  tier text not null,
  area_id uuid references public.areas(id) on delete set null,
  xp integer not null default 0 check (xp >= 0),
  reales integer not null default 0 check (reales >= 0),
  hp_loss integer not null default 0 check (hp_loss >= 0),
  frequency text not null default 'daily' check (frequency in ('daily', 'weekly', 'monthly')),
  weekly_cap integer check (weekly_cap is null or weekly_cap > 0),
  is_active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- Registro de cada hábito marcado (guarda los puntos del momento)
create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  logged_on date not null default (timezone('America/Bogota', now()))::date,
  xp_awarded integer not null default 0,
  reales_awarded integer not null default 0,
  hp_lost integer not null default 0,
  streak_applied boolean not null default false,
  created_at timestamptz not null default now(),
  unique (habit_id, logged_on)
);
create index habit_logs_user_date_idx on public.habit_logs (user_id, logged_on desc);

-- Tienda y compras
create table public.shop_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  price integer not null check (price >= 0),
  is_active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  item_id uuid references public.shop_items(id) on delete set null,
  item_name text not null,
  price integer not null check (price >= 0),
  purchased_at timestamptz not null default now()
);
create index purchases_user_date_idx on public.purchases (user_id, purchased_at desc);

-- Jefes y sus etapas
create table public.bosses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  kind text not null check (kind in ('monthly', 'big')),
  period_start date not null,
  area_id uuid references public.areas(id) on delete set null,
  xp_reward integer not null default 0,
  reales_reward integer not null default 0,
  status text not null default 'active' check (status in ('active', 'defeated', 'escaped')),
  defeated_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.boss_steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  boss_id uuid not null references public.bosses(id) on delete cascade,
  title text not null,
  position integer not null default 0,
  done_at timestamptz
);

-- Logros: catálogo (igual para todos) y logros conseguidos
create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text not null default '',
  category text not null,
  tier text not null check (tier in ('facil', 'medio', 'dificil', 'muy_dificil', 'legendario')),
  reales_reward integer not null default 0 check (reales_reward >= 0)
);

create table public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (user_id, achievement_id)
);

-- Retos de revivir y caídas
create table public.revive_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.falls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  fell_at timestamptz not null default now(),
  challenge_id uuid references public.revive_challenges(id) on delete set null,
  revived_at timestamptz
);

-- Seguridad: solo el dueño ve y modifica sus filas
do $$
declare t text;
begin
  foreach t in array array[
    'settings', 'areas', 'habits', 'habit_logs', 'shop_items', 'purchases',
    'bosses', 'boss_steps', 'user_achievements', 'revive_challenges', 'falls'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "Solo el dueño accede" on public.%I for all to authenticated
       using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
  end loop;
end $$;

-- El catálogo de logros es de solo lectura para quien tenga sesión
alter table public.achievements enable row level security;
create policy "Lectura del catálogo" on public.achievements
  for select to authenticated using (true);

-- Permisos de acceso para usuarios con sesión (nunca para anónimos)
grant select, insert, update, delete on all tables in schema public to authenticated;
revoke insert, update, delete on public.achievements from authenticated;