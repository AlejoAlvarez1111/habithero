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

// Primer día del mes que está n meses adelante
export function sumarMeses(fecha: string, meses: number): string {
  const d = aUtc(inicioMes(fecha))
  d.setUTCMonth(d.getUTCMonth() + meses)
  return aTexto(d)
}

// Primer día del trimestre (enero, abril, julio u octubre)
export function inicioTrimestre(fecha: string): string {
  const [y, m] = fecha.split('-').map(Number)
  const mesInicio = Math.floor((m - 1) / 3) * 3 + 1
  return `${y}-${String(mesInicio).padStart(2, '0')}-01`
}
