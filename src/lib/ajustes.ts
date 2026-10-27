export type Preset = {
  tier: string
  etiqueta: string
  xp: number
  reales: number
  hp: number
  frequency: 'daily' | 'weekly' | 'monthly'
}

export const NIVELES_BUENOS: Preset[] = [
  { tier: 'normal', etiqueta: 'Normal (diario)', xp: 20, reales: 1000, hp: 0, frequency: 'daily' },
  { tier: 'medio', etiqueta: 'Medio (diario)', xp: 35, reales: 2000, hp: 0, frequency: 'daily' },
  { tier: 'alto', etiqueta: 'Alto (diario)', xp: 60, reales: 4000, hp: 0, frequency: 'daily' },
  { tier: 'semanal', etiqueta: 'Semanal (1 vez por semana)', xp: 100, reales: 10000, hp: 0, frequency: 'weekly' },
  { tier: 'semanal_alto', etiqueta: 'Semanal alto', xp: 150, reales: 15000, hp: 0, frequency: 'weekly' },
  { tier: 'mensual', etiqueta: 'Mensual (1 vez al mes)', xp: 300, reales: 40000, hp: 0, frequency: 'monthly' },
]

export const NIVELES_MALOS: Preset[] = [
  { tier: 'leve', etiqueta: 'Leve (−5)', xp: 0, reales: 0, hp: 5, frequency: 'daily' },
  { tier: 'normal', etiqueta: 'Normal (−10)', xp: 0, reales: 0, hp: 10, frequency: 'daily' },
  { tier: 'medio', etiqueta: 'Medio (−20)', xp: 0, reales: 0, hp: 20, frequency: 'daily' },
  { tier: 'alto', etiqueta: 'Alto (−50)', xp: 0, reales: 0, hp: 50, frequency: 'daily' },
]

// Convierte un texto en número entero mayor o igual a 0; si no se puede, devuelve null
export function entero(valor: string): number | null {
  const n = Number(valor)
  return valor.trim() !== '' && Number.isInteger(n) && n >= 0 ? n : null
}