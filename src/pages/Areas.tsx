import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { nivelDe } from '../lib/game'

type Area = { area_id: string; name: string; xp: number }

export default function Areas() {
  const [areas, setAreas] = useState<Area[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargar() {
      const { data, error: fallo } = await supabase
        .from('area_totals')
        .select('area_id,name,xp')
        .order('position')

      if (fallo) {
        console.error(fallo)
        setError('No se pudieron cargar tus áreas')
      } else {
        setAreas(data as Area[])
      }
      setCargando(false)
    }
    void cargar()
  }, [])

  const conNivel = areas.map((a) => ({ ...a, ...nivelDe(a.xp) }))
  const xpTotal = areas.reduce((suma, a) => suma + a.xp, 0)

  let atencion: string[] = []
  let fuerte: (typeof conNivel)[number] | undefined
  if (conNivel.length > 0) {
    const nivelMinimo = Math.min(...conNivel.map((a) => a.nivel))
    atencion = conNivel
      .filter((a) => a.nivel === nivelMinimo)
      .sort((a, b) => a.xp - b.xp)
      .slice(0, 2)
      .map((a) => a.name)
    fuerte = [...conNivel].sort((a, b) => b.nivel - a.nivel || b.xp - a.xp)[0]
  }

  return (
    <>
      {cargando && <p className="center">Cargando tus áreas…</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {!cargando && !error && (
        <div className="areas-layout">
          <aside className="card heroe-cuerpo">
            <img className="cuerpo" src="/avatar/frente.png" alt="Tu héroe de cuerpo completo" />
            <h2>Tu héroe</h2>
            {fuerte && xpTotal > 0 && (
              <p className="muted">
                Área más fuerte: {fuerte.name}, nivel {fuerte.nivel}
              </p>
            )}
          </aside>

          <div>
            <div className="card alerta-areas">
              {xpTotal === 0 ? (
                <strong>Aún no tienes XP. Marca hábitos buenos para que tus áreas empiecen a subir.</strong>
              ) : (
                <>
                  <strong>Necesitan más atención: {atencion.join(' y ')}</strong>
                  <p className="muted">Son tus áreas con menor nivel.</p>
                </>
              )}
            </div>

            <div className="areas-grid">
              {conNivel.map((a) => (
                <div className="card" key={a.area_id}>
                  <div className="row">
                    <h3>{a.name}</h3>
                    <strong>Nivel {a.nivel}</strong>
                  </div>
                  <div
                    className="bar xp"
                    role="progressbar"
                    aria-label={`XP de ${a.name}`}
                    aria-valuenow={a.xpEnNivel}
                    aria-valuemin={0}
                    aria-valuemax={a.xpParaSubir}
                  >
                    <i style={{ width: `${(a.xpEnNivel / a.xpParaSubir) * 100}%` }} />
                  </div>
                  <p className="muted">
                    {a.xpEnNivel} / {a.xpParaSubir} XP para el siguiente nivel
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}