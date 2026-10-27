import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { hoyBogota, inicioMes, sumarDias } from '../lib/dates'
import { multiplicador, type Habit, type HabitLog, type Totals } from '../lib/game'
import type { LogroNuevo } from '../lib/achievements'

export type Caida = { id: string; challenge_id: string | null }

export function useGame() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [totals, setTotals] = useState<Totals | null>(null)
  const [caida, setCaida] = useState<Caida | null>(null)
  const [nuevosLogros, setNuevosLogros] = useState<LogroNuevo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hoy = hoyBogota()

  const cargar = useCallback(async () => {
    const desde = [inicioMes(hoy), sumarDias(hoy, -14)].sort()[0]
    const [h, l, t, f] = await Promise.all([
      supabase
        .from('habits')
        .select('id,name,kind,tier,xp,reales,hp_loss,frequency,weekly_cap,position,areas(name)')
        .eq('is_active', true)
        .order('position'),
      supabase.from('habit_logs').select('id,habit_id,logged_on').gte('logged_on', desde),
      supabase.from('player_totals').select('*').single(),
      supabase
        .from('falls')
        .select('id,challenge_id')
        .is('revived_at', null)
        .order('fell_at', { ascending: false })
        .limit(1),
    ])

    const fallo = h.error ?? l.error ?? t.error ?? f.error
    if (fallo) {
      console.error(fallo)
      setError('No se pudieron cargar tus datos')
      setLoading(false)
      return
    }

    const totales = { ...t.data, streak_multiplier: Number(t.data.streak_multiplier) } as Totals
    let abierta = (f.data?.[0] ?? null) as Caida | null

    if (totales.hp <= 0 && !abierta) {
      // Llegó a 0 de vida: se registra la caída
      const { data, error: e } = await supabase
        .from('falls')
        .insert({ fell_at: new Date().toISOString() })
        .select('id,challenge_id')
        .single()
      if (!e) {
        abierta = data as Caida
      } else if (e.code === '23505') {
        // Otra carga ya la registró en el mismo instante
        const otra = await supabase
          .from('falls')
          .select('id,challenge_id')
          .is('revived_at', null)
          .limit(1)
        abierta = (otra.data?.[0] ?? null) as Caida | null
      } else {
        console.error(e)
      }
    } else if (totales.hp > 0 && abierta) {
      // Caída abierta que ya no corresponde: se limpia
      await supabase.from('falls').delete().eq('id', abierta.id)
      abierta = null
    }

    setHabits(h.data as unknown as Habit[])
    setLogs(l.data as HabitLog[])
    setTotals(totales)
    setCaida(abierta)
    setError(null)
    setLoading(false)
  }, [hoy])

  // Revisa los logros y después recarga los datos
  const recargar = useCallback(async () => {
    const { data, error: fallo } = await supabase.rpc('check_achievements')
    if (fallo) {
      console.error(fallo)
    } else if (data && data.length > 0) {
      setNuevosLogros((previos) => [...previos, ...(data as LogroNuevo[])])
    }
    await cargar()
  }, [cargar])

  useEffect(() => {
    void recargar()
  }, [recargar])

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
    await recargar()
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

  function descartarLogros() {
    setNuevosLogros([])
  }

  return {
    habits,
    logs,
    totals,
    caida,
    loading,
    error,
    hoy,
    marcar,
    deshacer,
    recargar,
    nuevosLogros,
    descartarLogros,
  }
}