import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { money } from '../lib/game'
import { hoyBogota } from '../lib/dates'
import { finPeriodo, inicioPeriodo, PREMIOS, progreso, type Boss } from '../lib/bosses'
import { useGameState } from '../game/context'
import NuevoJefe from '../components/NuevoJefe'

type AreaOpcion = { id: string; name: string }

function mesAnio(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-CO', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

type TarjetaProps = {
  jefe: Boss
  caido: boolean
  onCambiar: (jefe: Boss, etapaId: string, hecha: boolean) => void
}

function TarjetaJefe({ jefe, caido, onCambiar }: TarjetaProps) {
  const etapas = [...jefe.boss_steps].sort((a, b) => a.position - b.position)
  const { total, hechas } = progreso(jefe)
  const vida = total === 0 ? 0 : Math.round(((total - hechas) / total) * 100)
  const activo = jefe.status === 'active'

  return (
    <section className="card jefe">
      <p className="muted">
        {PREMIOS[jefe.kind].etiqueta}
        {jefe.areas ? ` · ${jefe.areas.name}` : ''}
      </p>
      <h2>{jefe.title}</h2>

      <div className="row">
        <span>Vida del jefe</span>
        <strong>{vida}%</strong>
      </div>
      <div
        className="bar"
        role="progressbar"
        aria-label="Vida del jefe"
        aria-valuenow={vida}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <i style={{ width: `${vida}%` }} />
      </div>

      <ul className="habit-list">
        {etapas.map((e, i) => (
          <li key={e.id} className="habit">
            <div>
              <span>{e.title}</span>
              <small>Etapa {i + 1}</small>
            </div>
            {e.done_at ? (
              activo ? (
                <button
                  className="act hecho"
                  disabled={caido}
                  onClick={() => onCambiar(jefe, e.id, false)}
                >
                  Deshacer
                </button>
              ) : (
                <span className="muted">Hecha</span>
              )
            ) : (
              <button
                className="act"
                disabled={!activo || caido}
                onClick={() => onCambiar(jefe, e.id, true)}
              >
                Completar
              </button>
            )}
          </li>
        ))}
      </ul>

      <p className="premio">
        <span className="mint">+{jefe.xp_reward} XP</span>
        <span className="gold">+{money(jefe.reales_reward)}</span>
      </p>
      {jefe.status === 'defeated' && <p className="aviso">¡Jefe derrotado!</p>}
    </section>
  )
}

export default function Bosses() {
  const { totals, recargar } = useGameState()
  const [jefes, setJefes] = useState<Boss[]>([])
  const [areas, setAreas] = useState<AreaOpcion[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const hoy = hoyBogota()
  const caido = !!totals && totals.hp <= 0

  const cargar = useCallback(async () => {
    const [b, a] = await Promise.all([
      supabase
        .from('bosses')
        .select(
          'id,title,kind,period_start,xp_reward,reales_reward,status,defeated_at,areas(name),boss_steps(id,title,position,done_at)',
        )
        .order('period_start', { ascending: false }),
      supabase.from('areas').select('id,name').order('position'),
    ])

    const fallo = b.error ?? a.error
    if (fallo) {
      console.error(fallo)
      setError('No se pudieron cargar tus jefes')
      setCargando(false)
      return
    }

    let lista = b.data as unknown as Boss[]

    // Un jefe activo cuyo periodo ya terminó se escapa
    const vencidos = lista.filter((j) => j.status === 'active' && hoy >= finPeriodo(j))
    if (vencidos.length > 0) {
      const { error: fallo2 } = await supabase
        .from('bosses')
        .update({ status: 'escaped' })
        .in(
          'id',
          vencidos.map((j) => j.id),
        )
      if (fallo2) {
        console.error(fallo2)
      } else {
        lista = lista.map((j) =>
          vencidos.some((v) => v.id === j.id) ? { ...j, status: 'escaped' as const } : j,
        )
      }
    }

    setJefes(lista)
    setAreas(a.data as AreaOpcion[])
    setError(null)
    setCargando(false)
  }, [hoy])

  useEffect(() => {
    void cargar()
  }, [cargar])

  async function cambiarEtapa(jefe: Boss, etapaId: string, hecha: boolean) {
    if (caido) return
    setAviso(null)

    const { error: fallo } = await supabase
      .from('boss_steps')
      .update({ done_at: hecha ? new Date().toISOString() : null })
      .eq('id', etapaId)
    if (fallo) {
      console.error(fallo)
      setError('No se pudo actualizar la etapa')
      return
    }

    const { total, hechas } = progreso(jefe)
    if (hecha && hechas + 1 === total) {
      const { error: fallo2 } = await supabase
        .from('bosses')
        .update({ status: 'defeated', defeated_at: new Date().toISOString() })
        .eq('id', jefe.id)
      if (fallo2) {
        console.error(fallo2)
        setError('No se pudo marcar al jefe como derrotado')
        return
      }
      setAviso(
        `¡Derrotaste a "${jefe.title}"! +${jefe.xp_reward} XP y +${money(jefe.reales_reward)}`,
      )
      await recargar()
    }

    await cargar()
  }

  const mensual = jefes.find(
    (j) => j.kind === 'monthly' && j.period_start === inicioPeriodo('monthly', hoy),
  )
  const grande = jefes.find((j) => j.kind === 'big' && j.period_start === inicioPeriodo('big', hoy))
  const anteriores = jefes.filter((j) => j !== mensual && j !== grande)

  return (
    <>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {aviso && (
        <p className="aviso" role="status">
          {aviso}
        </p>
      )}
      {caido && (
        <div className="card alerta">Estás caído: no puedes avanzar etapas hasta revivir.</div>
      )}
      {cargando && <p className="center">Cargando tus jefes…</p>}

      {!cargando && !error && (
        <div className="jefes-layout">
          <div>
            {mensual ? (
              <TarjetaJefe jefe={mensual} caido={caido} onCambiar={cambiarEtapa} />
            ) : (
              <section className="card">
                <h2>Crea tu jefe del mes</h2>
                <NuevoJefe kind="monthly" areas={areas} onCreado={cargar} />
              </section>
            )}
          </div>

          <div className="jefes-lado">
            {grande ? (
              <TarjetaJefe jefe={grande} caido={caido} onCambiar={cambiarEtapa} />
            ) : (
              <section className="card">
                <h2>Crea tu jefe grande</h2>
                <NuevoJefe kind="big" areas={areas} onCreado={cargar} />
              </section>
            )}

            <section className="card">
              <h2>Jefes anteriores</h2>
              {anteriores.length === 0 ? (
                <p className="muted">Todavía no hay jefes anteriores.</p>
              ) : (
                <ul className="habit-list">
                  {anteriores.map((j) => (
                    <li key={j.id} className="habit">
                      <div>
                        <span>{j.title}</span>
                        <small>{mesAnio(j.period_start)}</small>
                      </div>
                      {j.status === 'defeated' ? (
                        <strong className="mint">Derrotado</strong>
                      ) : (
                        <strong className="rojo">Se escapó</strong>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}
    </>
  )
}