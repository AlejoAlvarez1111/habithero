export type Nivel = 'facil' | 'medio' | 'dificil' | 'muy_dificil' | 'legendario'

export type Logro = {
  id: string
  code: string
  name: string
  description: string
  category: string
  tier: Nivel
  reales_reward: number
}

export type LogroNuevo = { code: string; name: string; reales_reward: number }

export const NIVELES: Record<Nivel, { etiqueta: string; claro: string; oscuro: string }> = {
  facil: { etiqueta: 'Bronce', claro: '#E0A070', oscuro: '#8A5222' },
  medio: { etiqueta: 'Plata', claro: '#D8DDE6', oscuro: '#8D95A3' },
  dificil: { etiqueta: 'Oro', claro: '#F7C85A', oscuro: '#B77C12' },
  muy_dificil: { etiqueta: 'Rubí', claro: '#FF4D52', oscuro: '#8E0F18' },
  legendario: { etiqueta: 'Legendaria', claro: '#FF7A3D', oscuro: '#E5262B' },
}

export const CATEGORIAS = [
  { clave: 'constancia', titulo: 'Constancia' },
  { clave: 'habitos', titulo: 'Hábitos específicos' },
  { clave: 'niveles', titulo: 'Niveles y áreas' },
  { clave: 'dinero', titulo: 'Dinero y tienda' },
  { clave: 'jefes', titulo: 'Jefes y supervivencia' },
  { clave: 'malos_habitos', titulo: 'Hábitos malos' },
]