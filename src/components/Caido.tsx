import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useGameState } from '../game/context'

type Reto = { id: string; name: string }

export default function Caido() {
  const { caida, recargar } = useGameState()
  const [retos, setRetos] = useState<Reto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  useEffect(() => {
    async function cargar() {
      const { data, error: fallo } = await supabase
        .from('revive_challenges')
        .select('id,name')
        .eq('is_active', true)
        .order('created_at')
      if (fallo) {
        console.error(fallo)
        setError('No se pudieron cargar los retos')
      } else {
        setRetos(data as Reto[])
      }
    }
    void cargar()
  }, [])

  async function elegir(retoId: string) {
    if (!caida) return
    setOcupado(true)
    const { error: fallo } = await supabase
      .from('falls')
      .update({ challenge_id: retoId })
      .eq('id', caida.id)
    if (fallo) {
      console.error(fallo)
      setError('No se pudo elegir el reto')
    } else {
      await recargar()
    }
    setOcupado(false)
  }

  async function revivir() {
    if (!caida?.challenge_id) return
    if (!window.confirm('¿Cumpliste el reto de verdad? Vas a revivir con la vida completa.')) return
    setOcupado(true)
    const { error: fallo } = await supabase
      .from('falls')
      .update({ revived_at: new Date().toISOString() })
      .eq('id', caida.id)
    if (fallo) {
      console.error(fallo)
      setError('No se pudo revivir')
    } else {
      await recargar()
    }
    setOcupado(false)
  }

  return (
    <div className="caido-layout">
      <aside className="card heroe-cuerpo">
        <img className="cuerpo gris" src="/avatar/frente.png" alt="Tu héroe, caído" />
      </aside>

      <section className="card">
        <h2 className="titulo">Estás caído</h2>
        <p className="muted">
          Tu vida llegó a 0. Mientras estés caído no ganas XP ni Reales y no puedes comprar. Elige un
          reto y cúmplelo para revivir. Tú decides cuándo hacerlo: si estás enfermo o lesionado, primero
          recupérate.
        </p>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        {!caida ? (
          <p className="center">Preparando tu reto…</p>
        ) : (
          <>
            <ul className="habit-list">
              {retos.map((r) => (
                <li key={r.id} className="habit">
                  <span>{r.name}</span>
                  {caida.challenge_id === r.id ? (
                    <strong className="mint">Elegido</strong>
                  ) : (
                    <button className="act" disabled={ocupado} onClick={() => elegir(r.id)}>
                      Elegir
                    </button>
                  )}
                </li>
              ))}
            </ul>

            <button className="btn" disabled={!caida.challenge_id || ocupado} onClick={revivir}>
              Cumplí el reto: revivir
            </button>
          </>
        )}
      </section>
    </div>
  )
}