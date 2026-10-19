import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { hoyBogota, inicioMes, sumarDias } from '../lib/dates'
import { multiplicador, type Habit, type HabitLog, type Totals } from '../lib/game'

export function useGame() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [totals, setTotals] = useState<Totals | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hoy = hoyBogota()

  const cargar = useCallback(async () => {
    const desde = [inicioMes(hoy), sumarDias(hoy, -14)].sort()[0]
    const [h, l, t] = await Promise.all([
      supabase
        .from('habits')
        .select('id,name,kind,tier,xp,reales,hp_loss,frequency,weekly_cap,position,areas(name)')
        .eq('is_active', true)
        .order('position'),
      supabase.from('habit_logs').select('id,habit_id,logged_on').gte('logged_on', desde),
      supabase.from('player_totals').select('*').single(),
    ])

    const fallo = h.error ?? l.error ?? t.error
    if (fallo) {
      console.error(fallo)
      setError('No se pudieron cargar tus datos')
    } else {
      setHabits(h.data as unknown as Habit[])
      setLogs(l.data as HabitLog[])
      setTotals({ ...t.data, streak_multiplier: Number(t.data.streak_multiplier) } as Totals)
      setError(null)
    }
    setLoading(false)
  }, [hoy])

  useEffect(() => {
    void cargar()
  }, [cargar])

  async function marcar(habit: Habit) {
    if (!totals) return
    const m = multiplicador(habit, logs, hoy, totals)
    const bueno = habit.kind === 'good'
    const { error: fallo } = await supabase.from('habit_logs').insert({
      habit_id: habit.id,
      logged_on: hoy,
      xp_awarded: bueno ? Math.round(habit.xp * m) : 0,
      reales_awarded: bueno ? Math.round(habit.reales * m) : 0,
      hp_lost: bueno ? 0 : habit.hp_loss,
      streak_applied: m > 1,
    })
    if (fallo) {
      console.error(fallo)
      setError('No se pudo guardar el hábito')
      return
    }
    await cargar()
  }

  async function deshacer(logId: string) {
    const { error: fallo } = await supabase.from('habit_logs').delete().eq('id', logId)
    if (fallo) {
      console.error(fallo)
      setError('No se pudo deshacer')
      return
    }
    await cargar()
  }

  return { habits, logs, totals, loading, error, hoy, marcar, deshacer }
}