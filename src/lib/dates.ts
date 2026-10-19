const ZONA = 'America/Bogota'

// Fecha de hoy en Colombia, con formato 2026-10-19
export function hoyBogota(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA }).format(new Date())
}

function aUtc(fecha: string): Date {
  const [y, m, d] = fecha.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function aTexto(fecha: Date): string {
  return fecha.toISOString().slice(0, 10)
}

export function sumarDias(fecha: string, dias: number): string {
  const d = aUtc(fecha)
  d.setUTCDate(d.getUTCDate() + dias)
  return aTexto(d)
}

// Lunes de la semana de esa fecha
export function inicioSemana(fecha: string): string {
  const d = aUtc(fecha)
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
  return aTexto(d)
}

export function inicioMes(fecha: string): string {
  return fecha.slice(0, 8) + '01'
}