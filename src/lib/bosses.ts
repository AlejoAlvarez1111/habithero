import { inicioMes, inicioTrimestre, sumarMeses } from './dates'

export type Etapa = { id: string; title: string; position: number; done_at: string | null }

export type Boss = {
  id: string
  title: string
  kind: 'monthly' | 'big'
  period_start: string
  xp_reward: number
  reales_reward: number
  status: 'active' | 'defeated' | 'escaped'
  defeated_at: string | null
  areas: { name: string } | null
  boss_steps: Etapa[]
}

export const PREMIOS = {
  monthly: { xp: 500, reales: 250000, etiqueta: 'Jefe del mes' },
  big: { xp: 1500, reales: 1000000, etiqueta: 'Jefe grande (trimestre)' },
} as const

export function inicioPeriodo(kind: 'monthly' | 'big', hoy: string): string {
  return kind === 'monthly' ? inicioMes(hoy) : inicioTrimestre(hoy)
}

// Fecha en la que el periodo del jefe termina
export function finPeriodo(jefe: Boss): string {
  return sumarMeses(jefe.period_start, jefe.kind === 'monthly' ? 1 : 3)
}

export function progreso(jefe: Boss): { total: number; hechas: number } {
  return {
    total: jefe.boss_steps.length,
    hechas: jefe.boss_steps.filter((e) => e.done_at).length,
  }
}