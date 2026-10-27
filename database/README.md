# Base de datos

Todo el esquema vive en archivos SQL numerados. Se ejecutan **en orden** en el **SQL Editor** de Supabase (si aparece un aviso sobre RLS, elige *Run and enable RLS*).

| Archivo | Contenido |
|---|---|
| `01_schema.sql` | 12 tablas, índices y reglas de seguridad por filas (RLS) |
| `02_achievements.sql` | Catálogo de los 27 logros con su dificultad y sus Reales |
| `03_player_totals.sql` | Vista con la vida y los Reales actuales |
| `04_area_totals.sql` | Vista con el XP de cada área |
| `05_boss_rewards.sql` | Las recompensas de los jefes entran en los totales |
| `06_achievement_logic.sql` | Funciones del nivel de las áreas y del desbloqueo automático de logros (`check_achievements`) |
| `07_falls_rules.sql` | Solo puede haber una caída abierta a la vez |
| `08_daily_summary.sql` | Vista con el resumen diario para el historial |
| `seed.example.sql` | Datos de ejemplo neutrales (ejecutar al final, una sola vez) |

Los archivos `03`, `04` y `05` redefinen vistas que `06` vuelve a actualizar. Se mantienen separados para conservar el orden en que evolucionó el proyecto, y todos usan `create or replace`, así que se pueden ejecutar completos sin problema.

## Seguridad

- Todas las tablas con datos personales tienen RLS activado, con una política que solo permite acceder a las filas del usuario autenticado (`user_id = auth.uid()`).
- El catálogo de logros es de solo lectura para usuarios con sesión.
- Las vistas usan `security_invoker`, por lo que respetan las reglas de quien las consulta.
- Los permisos se otorgan solo al rol `authenticated`, nunca a usuarios anónimos.
