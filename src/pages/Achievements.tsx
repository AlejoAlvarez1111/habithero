import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { money } from '../lib/game'
import { CATEGORIAS, NIVELES, type Logro } from '../lib/achievements'
import Medalla from '../components/Medalla'

function fecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function Achievements() {
  const [logros, setLogros] = useState<Logro[]>([])
  const [conseguidos, setConseguidos] = useState<Record<string, string>>({})
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargar() {
      const [c, u] = await Promise.all([
        supabase
          .from('achievements')
          .select('id,code,name,description,category,tier,reales_reward'),
        supabase.from('user_achievements').select('achievement_id,unlocked_at'),
      ])

      const fallo = c.error ?? u.error
      if (fallo) {
        console.error(fallo)
        setError('No se pudieron cargar tus logros')
      } else {
        setLogros(c.data as Logro[])
        const mapa: Record<string, string> = {}
        for (const fila of u.data ?? []) mapa[fila.achievement_id] = fila.unlocked_at
        setConseguidos(mapa)
      }
      setCargando(false)
    }
    void cargar()
  }, [])

  const total = logros.length
  const hechos = Object.keys(conseguidos).length

  return (
    <>
      {cargando && <p className="center">Cargando tus medallas…</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {!cargando && !error && (
        <div className="logros-layout">
          <aside className="card heroe-cuerpo">
            <img className="cuerpo" src="/avatar/frente.png" alt="Tu héroe de cuerpo completo" />
            <h2>Tu héroe</h2>
            <p className="reales">
              {hechos} / {total}
            </p>
            <p className="muted">medallas conseguidas</p>
          </aside>

          <div className="logros-secciones">
            {CATEGORIAS.map((cat) => {
              const lista = logros
                .filter((l) => l.category === cat.clave)
                .sort((a, b) => a.reales_reward - b.reales_reward)
              if (lista.length === 0) return null

              return (
                <section key={cat.clave} className="card">
                  <h2>{cat.titulo}</h2>
                  <ul className="logros-lista">
                    {lista.map((l) => {
                      const desbloqueado = conseguidos[l.id]
                      return (
                        <li key={l.id} className={`logro ${desbloqueado ? '' : 'bloqueado'}`}>
                          <Medalla code={l.code} tier={l.tier} bloqueada={!desbloqueado} />
                          <div>
                            <strong>{l.name}</strong>
                            <p className="muted">{l.description}</p>
                            <p className="detalle">
                              {NIVELES[l.tier].etiqueta} ·{' '}
                              <span className="gold">+{money(l.reales_reward)}</span>
                            </p>
                            {desbloqueado && (
                              <p className="mint detalle">Conseguida el {fecha(desbloqueado)}</p>
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}