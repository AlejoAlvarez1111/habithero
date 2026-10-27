import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { money } from '../lib/game'
import { hoyBogota, inicioMes, inicioSemana, sumarDias, sumarMeses } from '../lib/dates'

type Modo = 'semana' | 'mes'
type Dia = {
  logged_on: string
  buenos: number
  malos: number
  vida_perdida: number
  xp: number
  reales: number
}
type Compra = { id: string; item_name: string; price: number; purchased_at: string }
type Resultado = { clave: string; dias: Dia[]; compras: Compra[] }

function rango(modo: Modo, desfase: number, hoy: string) {
  if (modo === 'semana') {
    const inicio = sumarDias(inicioSemana(hoy), desfase * 7)
    return { inicio, fin: sumarDias(inicio, 6) }
  }
  const inicio = sumarMeses(inicioMes(hoy), desfase)
  return { inicio, fin: sumarDias(sumarMeses(inicio, 1), -1) }
}

function fechas(inicio: string, fin: string): string[] {
  const lista: string[] = []
  let dia = inicio
  while (dia <= fin) {
    lista.push(dia)
    dia = sumarDias(dia, 1)
  }
  return lista
}

function texto(fecha: string, opciones: Intl.DateTimeFormatOptions): string {
  return new Date(`${fecha}T00:00:00Z`).toLocaleDateString('es-CO', {
    ...opciones,
    timeZone: 'UTC',
  })
}

function Dato({ titulo, valor, clase }: { titulo: string; valor: string; clase?: string }) {
  return (
    <div className="card dato">
      <p className="muted">{titulo}</p>
      <p className={`valor ${clase ?? ''}`}>{valor}</p>
    </div>
  )
}

export default function History() {
  const hoy = hoyBogota()
  const [modo, setModo] = useState<Modo>('semana')
  const [desfase, setDesfase] = useState(0)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { inicio, fin } = rango(modo, desfase, hoy)
  const clave = `${inicio}|${fin}`

  useEffect(() => {
    let vigente = true

    async function cargar() {
      const [d, c] = await Promise.all([
        supabase
          .from('daily_summary')
          .select('logged_on,buenos,malos,vida_perdida,xp,reales')
          .gte('logged_on', inicio)
          .lte('logged_on', fin),
        supabase
          .from('purchases')
          .select('id,item_name,price,purchased_at')
          .gte('purchased_at', `${inicio}T00:00:00-05:00`)
          .lt('purchased_at', `${sumarDias(fin, 1)}T00:00:00-05:00`)
          .order('purchased_at', { ascending: false }),
      ])

      if (!vigente) return

      const fallo = d.error ?? c.error
      if (fallo) {
        console.error(fallo)
        setError('No se pudo cargar el historial')
        return
      }
      setError(null)
      setResultado({ clave, dias: d.data as Dia[], compras: c.data as Compra[] })
    }

    void cargar()
    return () => {
      vigente = false
    }
  }, [inicio, fin, clave])

  const cargando = !resultado || resultado.clave !== clave

  const etiqueta =
    modo === 'semana'
      ? `Semana del ${texto(inicio, { day: 'numeric', month: 'long' })} al ${texto(fin, { day: 'numeric', month: 'long' })}`
      : texto(inicio, { month: 'long', year: 'numeric' })

  const porDia = new Map((resultado?.dias ?? []).map((d) => [d.logged_on, d]))
  const suma = (campo: keyof Omit<Dia, 'logged_on'>) =>
    (resultado?.dias ?? []).reduce((total, d) => total + d[campo], 0)
  const gastado = (resultado?.compras ?? []).reduce((total, c) => total + c.price, 0)

  return (
    <>
      <div className="periodo">
        <div className="tabs-modo" role="group" aria-label="Periodo">
          <button
            className={modo === 'semana' ? 'on' : ''}
            onClick={() => {
              setModo('semana')
              setDesfase(0)
            }}
          >
            Semana
          </button>
          <button
            className={modo === 'mes' ? 'on' : ''}
            onClick={() => {
              setModo('mes')
              setDesfase(0)
            }}
          >
            Mes
          </button>
        </div>

        <div className="navegar">
          <button className="act hecho" onClick={() => setDesfase(desfase - 1)}>
            Anterior
          </button>
          <strong>{etiqueta}</strong>
          <button className="act hecho" disabled={desfase >= 0} onClick={() => setDesfase(desfase + 1)}>
            Siguiente
          </button>
        </div>
      </div>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {cargando && !error && <p className="center">Cargando el historial…</p>}

      {!cargando && resultado && (
        <>
          <div className="resumen-grid">
            <Dato titulo="Hábitos buenos" valor={String(suma('buenos'))} clase="mint" />
            <Dato titulo="Hábitos malos" valor={String(suma('malos'))} clase="rojo" />
            <Dato titulo="Vida perdida" valor={`−${suma('vida_perdida')}`} clase="rojo" />
            <Dato titulo="XP ganado" valor={String(suma('xp'))} clase="mint" />
            <Dato titulo="Reales ganados" valor={money(suma('reales'))} clase="gold" />
            <Dato titulo="Reales gastados" valor={money(gastado)} clase="gold" />
          </div>

          <div className="historial-cols">
            <section className="card">
              <h2>Día por día</h2>
              <div className="tabla-scroll">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th scope="col">Día</th>
                      <th scope="col">Buenos</th>
                      <th scope="col">Malos</th>
                      <th scope="col">Vida</th>
                      <th scope="col">XP</th>
                      <th scope="col">Reales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fechas(inicio, fin).map((dia) => {
                      const d = porDia.get(dia)
                      return (
                        <tr key={dia} className={d ? '' : 'vacio'}>
                          <td>{texto(dia, { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                          <td>{d?.buenos ?? '–'}</td>
                          <td>{d?.malos ?? '–'}</td>
                          <td>{d && d.vida_perdida > 0 ? `−${d.vida_perdida}` : '–'}</td>
                          <td>{d?.xp ?? '–'}</td>
                          <td>{d ? money(d.reales) : '–'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="card">
              <h2>Compras</h2>
              {resultado.compras.length === 0 ? (
                <p className="muted">No hiciste compras en este periodo.</p>
              ) : (
                <ul className="compras-lista">
                  {resultado.compras.map((c) => (
                    <li key={c.id}>
                      <span>
                        {c.item_name}
                        <small className="muted">
                          {' '}
                          ·{' '}
                          {new Date(c.purchased_at).toLocaleDateString('es-CO', {
                            timeZone: 'America/Bogota',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </small>
                      </span>
                      <span>{money(c.price)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </>
  )
}