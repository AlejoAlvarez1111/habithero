import { inicioMes, inicioSemana, sumarDias } from './dates'

export type Habit = {
  id: string
  name: string
  kind: 'good' | 'bad'
  tier: string
  xp: number
  reales: number
  hp_loss: number
  frequency: 'daily' | 'weekly' | 'monthly'
  weekly_cap: number | null
  position: number
  areas: { name: string } | null
}

export type HabitLog = { id: string; habit_id: string; logged_on: string }

export type Totals = {
  hp: number
  max_hp: number
  reales: number
  streak_days: number
  streak_multiplier: number
}

export type Status =
  | { kind: 'available' }
  | { kind: 'done'; logId: string }
  | { kind: 'locked'; reason: string }

export function money(valor: number): string {
  return '$' + valor.toLocaleString('es-CO')
}

// Estado de un hábito hoy: disponible, hecho o bloqueado
export function statusOf(habit: Habit, logs: HabitLog[], hoy: string): Status {
  const mios = logs.filter((l) => l.habit_id === habit.id)
  const deHoy = mios.find((l) => l.logged_on === hoy)
  if (deHoy) return { kind: 'done', logId: deHoy.id }

  if (habit.frequency === 'weekly' && mios.some((l) => l.logged_on >= inicioSemana(hoy))) {
    return { kind: 'locked', reason: 'ya hecho esta semana' }
  }
  if (habit.frequency === 'monthly' && mios.some((l) => l.logged_on >= inicioMes(hoy))) {
    return { kind: 'locked', reason: 'ya hecho este mes' }
  }
  if (habit.weekly_cap) {
    const enLaSemana = mios.filter((l) => l.logged_on >= inicioSemana(hoy)).length
    if (enLaSemana >= habit.weekly_cap) {
      return { kind: 'locked', reason: 'máximo de la semana' }
    }
  }
  return { kind: 'available' }
}

// Días seguidos de un hábito, contando hacia atrás desde ayer
function diasSeguidos(habitId: string, logs: HabitLog[], hoy: string): number {
  const dias = new Set(logs.filter((l) => l.habit_id === habitId).map((l) => l.logged_on))
  let n = 0
  let dia = sumarDias(hoy, -1)
  while (dias.has(dia)) {
    n++
    dia = sumarDias(dia, -1)
  }
  return n
}

// 1 normalmente; 1,25 (según tu configuración) desde el día 7 seguido
export function multiplicador(habit: Habit, logs: HabitLog[], hoy: string, totals: Totals): number {
  if (habit.kind !== 'good' || habit.frequency !== 'daily') return 1
  return diasSeguidos(habit.id, logs, hoy) >= totals.streak_days - 1 ? totals.streak_multiplier : 1
}

function frecuencia(habit: Habit): string {
  if (habit.weekly_cap) return `máx. ${habit.weekly_cap} por semana`
  if (habit.frequency === 'weekly') return '1 vez por semana'
  if (habit.frequency === 'monthly') return '1 vez al mes'
  return '1 vez al día'
}

export function detalle(habit: Habit): string {
  if (habit.kind === 'bad') return `−${habit.hp_loss} de vida · ${frecuencia(habit)}`
  const area = habit.areas?.name ?? 'Sin área'
  return `${area} · +${habit.xp} XP · +${money(habit.reales)} · ${frecuencia(habit)}`
}