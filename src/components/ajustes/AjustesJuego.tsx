import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../auth/context'
import { useGameState } from '../../game/context'

export default function AjustesJuego() {
  const { session } = useAuth()
  const { recargar } = useGameState()
  const [vida, setVida] = useState('')
  const [dias, setDias] = useState('')
  const [mult, setMult] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    async function cargar() {
      const { data, error: fallo } = await supabase
        .from('settings')
        .select('max_hp,streak_days,streak_multiplier')
        .single()
      if (fallo) {
        console.error(fallo)
        setError('No se pudo cargar la configuración')
        return
      }
      setVida(String(data.max_hp))
      setDias(String(data.streak_days))
      setMult(String(Number(data.streak_multiplier)))
    }
    void cargar()
  }, [])

  async function guardar(e: FormEvent) {
    e.preventDefault()
    const nVida = Number(vida)
    const nDias = Number(dias)
    const nMult = Number(mult)

    if (!Number.isInteger(nVida) || nVida < 50 || nVida > 5000) {
      setError('La vida máxima debe ser un número entero entre 50 y 5000')
      return
    }
    if (!Number.isInteger(nDias) || nDias < 2 || nDias > 60) {
      setError('Los días de racha deben ser un número entero entre 2 y 60')
      return
    }
    if (!(nMult >= 1 && nMult <= 5)) {
      setError('El multiplicador debe estar entre 1 y 5')
      return
    }

    setGuardando(true)
    setError(null)
    setAviso(null)
    const { error: fallo } = await supabase
      .from('settings')
      .update({ max_hp: nVida, streak_days: nDias, streak_multiplier: nMult })
      .eq('user_id', session?.user.id ?? '')
    if (fallo) {
      console.error(fallo)
      setError('No se pudo guardar')
    } else {
      setAviso('Configuración guardada')
      await recargar()
    }
    setGuardando(false)
  }

  return (
    <section className="card ajustes-seccion">
      <h2>Reglas del juego</h2>
      <form className="form-jefe" onSubmit={guardar}>
        <label>
          Vida máxima
          <input value={vida} onChange={(e) => setVida(e.target.value)} inputMode="numeric" />
        </label>
        <p className="muted">
          Si cambias la vida máxima, tu vida actual cambia en la misma cantidad.
        </p>
        <label>
          Días seguidos para la racha
          <input value={dias} onChange={(e) => setDias(e.target.value)} inputMode="numeric" />
        </label>
        <label>
          Multiplicador de la racha
          <input value={mult} onChange={(e) => setMult(e.target.value)} inputMode="decimal" />
        </label>

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

        <button className="btn" type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar reglas'}
        </button>
      </form>
    </section>
  )
}