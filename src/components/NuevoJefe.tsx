import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { money } from '../lib/game'
import { hoyBogota } from '../lib/dates'
import { inicioPeriodo, PREMIOS } from '../lib/bosses'

type Props = {
  kind: 'monthly' | 'big'
  areas: { id: string; name: string }[]
  onCreado: () => void
}

export default function NuevoJefe({ kind, areas, onCreado }: Props) {
  const [titulo, setTitulo] = useState('')
  const [etapas, setEtapas] = useState('')
  const [areaId, setAreaId] = useState(areas[0]?.id ?? '')
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const premio = PREMIOS[kind]

  async function crear(e: FormEvent) {
    e.preventDefault()
    const lineas = etapas
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    if (lineas.length === 0) {
      setError('Escribe al menos una etapa')
      return
    }

    setGuardando(true)
    setError(null)

    const { data, error: fallo } = await supabase
      .from('bosses')
      .insert({
        title: titulo.trim(),
        kind,
        period_start: inicioPeriodo(kind, hoyBogota()),
        area_id: areaId || null,
        xp_reward: premio.xp,
        reales_reward: premio.reales,
      })
      .select('id')
      .single()

    if (fallo) {
      console.error(fallo)
      setError('No se pudo crear el jefe')
      setGuardando(false)
      return
    }

    const { error: fallo2 } = await supabase
      .from('boss_steps')
      .insert(lineas.map((title, position) => ({ boss_id: data.id, title, position })))

    if (fallo2) {
      console.error(fallo2)
      await supabase.from('bosses').delete().eq('id', data.id)
      setError('No se pudieron guardar las etapas')
      setGuardando(false)
      return
    }

    setGuardando(false)
    setTitulo('')
    setEtapas('')
    onCreado()
  }

  return (
    <form className="form-jefe" onSubmit={crear}>
      <label>
        Nombre del jefe (tu meta)
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
      </label>

      <label>
        Etapas (una por línea)
        <textarea
          value={etapas}
          onChange={(e) => setEtapas(e.target.value)}
          placeholder={'Primera etapa\nSegunda etapa'}
          required
        />
      </label>

      <label>
        Área que recibe el XP
        <select value={areaId} onChange={(e) => setAreaId(e.target.value)}>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </label>

      <p className="muted">
        Premio al derrotarlo: {premio.xp} XP y {money(premio.reales)}
      </p>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <button className="btn" type="submit" disabled={guardando}>
        {guardando ? 'Creando…' : 'Crear jefe'}
      </button>
    </form>
  )
}