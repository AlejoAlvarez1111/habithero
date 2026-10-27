import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { useGameState } from '../../game/context'
import { NIVELES_BUENOS, NIVELES_MALOS, entero, type Preset } from '../../lib/ajustes'

type Area = { id: string; name: string }
type Habito = {
  id: string
  name: string
  kind: 'good' | 'bad'
  xp: number
  reales: number
  hp_loss: number
  area_id: string | null
  is_active: boolean
  position: number
}

function Fila({
  h,
  areas,
  onGuardado,
}: {
  h: Habito
  areas: Area[]
  onGuardado: () => Promise<void>
}) {
  const bueno = h.kind === 'good'
  const [nombre, setNombre] = useState(h.name)
  const [xp, setXp] = useState(String(h.xp))
  const [reales, setReales] = useState(String(h.reales))
  const [hp, setHp] = useState(String(h.hp_loss))
  const [areaId, setAreaId] = useState(h.area_id ?? '')
  const [activo, setActivo] = useState(h.is_active)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  const cambiado =
    nombre !== h.name ||
    activo !== h.is_active ||
    (bueno
      ? xp !== String(h.xp) || reales !== String(h.reales) || areaId !== (h.area_id ?? '')
      : hp !== String(h.hp_loss))

  async function guardar() {
    const nXp = entero(xp)
    const nReales = entero(reales)
    const nHp = entero(hp)
    if (!nombre.trim() || nXp === null || nReales === null || nHp === null) {
      setError('Revisa los valores: deben ser números enteros')
      return
    }

    setGuardando(true)
    setError(null)
    const cambios = bueno
      ? { name: nombre.trim(), is_active: activo, xp: nXp, reales: nReales, area_id: areaId || null }
      : { name: nombre.trim(), is_active: activo, hp_loss: nHp }
    const { error: fallo } = await supabase.from('habits').update(cambios).eq('id', h.id)
    if (fallo) {
      console.error(fallo)
      setError('No se pudo guardar')
    } else {
      await onGuardado()
    }
    setGuardando(false)
  }

  return (
    <li className="fila-ajuste">
      <label className="campo ancho">
        <span>Nombre</span>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </label>

      {bueno ? (
        <>
          <label className="campo num">
            <span>XP</span>
            <input value={xp} onChange={(e) => setXp(e.target.value)} inputMode="numeric" />
          </label>
          <label className="campo num">
            <span>Reales</span>
            <input value={reales} onChange={(e) => setReales(e.target.value)} inputMode="numeric" />
          </label>
          <label className="campo">
            <span>Área</span>
            <select value={areaId} onChange={(e) => setAreaId(e.target.value)}>
              <option value="">Sin área</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
        </>
      ) : (
        <label className="campo num">
          <span>Vida que quita</span>
          <input value={hp} onChange={(e) => setHp(e.target.value)} inputMode="numeric" />
        </label>
      )}

      <label className="activo">
        <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
        Activo
      </label>

      <button className="act" disabled={!cambiado || guardando} onClick={guardar}>
        {guardando ? 'Guardando…' : 'Guardar'}
      </button>

      {error && (
        <p className="error ancho-total" role="alert">
          {error}
        </p>
      )}
    </li>
  )
}

function NuevoHabito({
  habitos,
  areas,
  onCreado,
}: {
  habitos: Habito[]
  areas: Area[]
  onCreado: () => Promise<void>
}) {
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState<'good' | 'bad'>('good')
  const [tier, setTier] = useState('normal')
  const [areaId, setAreaId] = useState('')
  const [xp, setXp] = useState('20')
  const [reales, setReales] = useState('1000')
  const [hp, setHp] = useState('0')
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  const niveles = tipo === 'good' ? NIVELES_BUENOS : NIVELES_MALOS

  function aplicar(p: Preset) {
    setTier(p.tier)
    setXp(String(p.xp))
    setReales(String(p.reales))
    setHp(String(p.hp))
  }

  function cambiarTipo(nuevo: 'good' | 'bad') {
    setTipo(nuevo)
    aplicar((nuevo === 'good' ? NIVELES_BUENOS : NIVELES_MALOS)[0])
  }

  function cambiarNivel(nuevo: string) {
    const p = niveles.find((n) => n.tier === nuevo)
    if (p) aplicar(p)
  }

  async function crear(e: FormEvent) {
    e.preventDefault()
    const preset = niveles.find((n) => n.tier === tier)
    const nXp = entero(xp)
    const nReales = entero(reales)
    const nHp = entero(hp)
    if (!nombre.trim() || !preset || nXp === null || nReales === null || nHp === null) {
      setError('Escribe un nombre y revisa que los valores sean números enteros')
      return
    }

    const posicion = Math.max(0, ...habitos.filter((h) => h.kind === tipo).map((h) => h.position)) + 1
    setGuardando(true)
    setError(null)
    const { error: fallo } = await supabase.from('habits').insert({
      name: nombre.trim(),
      kind: tipo,
      tier,
      area_id: tipo === 'good' ? areaId || areas[0]?.id || null : null,
      xp: tipo === 'good' ? nXp : 0,
      reales: tipo === 'good' ? nReales : 0,
      hp_loss: tipo === 'bad' ? nHp : 0,
      frequency: preset.frequency,
      position: posicion,
    })
    if (fallo) {
      console.error(fallo)
      setError('No se pudo crear el hábito')
    } else {
      setNombre('')
      await onCreado()
    }
    setGuardando(false)
  }

  return (
    <form className="form-jefe" onSubmit={crear}>
      <label>
        Nombre del hábito
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      </label>

      <label>
        Tipo
        <select value={tipo} onChange={(e) => cambiarTipo(e.target.value as 'good' | 'bad')}>
          <option value="good">Hábito bueno</option>
          <option value="bad">Hábito malo</option>
        </select>
      </label>

      <label>
        Nivel
        <select value={tier} onChange={(e) => cambiarNivel(e.target.value)}>
          {niveles.map((n) => (
            <option key={n.tier} value={n.tier}>
              {n.etiqueta}
            </option>
          ))}
        </select>
      </label>

      {tipo === 'good' ? (
        <>
          <label>
            Área
            <select value={areaId || areas[0]?.id || ''} onChange={(e) => setAreaId(e.target.value)}>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            XP
            <input value={xp} onChange={(e) => setXp(e.target.value)} inputMode="numeric" />
          </label>
          <label>
            Reales
            <input value={reales} onChange={(e) => setReales(e.target.value)} inputMode="numeric" />
          </label>
        </>
      ) : (
        <label>
          Vida que quita
          <input value={hp} onChange={(e) => setHp(e.target.value)} inputMode="numeric" />
        </label>
      )}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <button className="btn" type="submit" disabled={guardando}>
        {guardando ? 'Creando…' : 'Agregar hábito'}
      </button>
    </form>
  )
}

export default function AjustesHabitos() {
  const { recargar } = useGameState()
  const [habitos, setHabitos] = useState<Habito[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    const [h, a] = await Promise.all([
      supabase
        .from('habits')
        .select('id,name,kind,xp,reales,hp_loss,area_id,is_active,position')
        .order('position'),
      supabase.from('areas').select('id,name').order('position'),
    ])
    const fallo = h.error ?? a.error
    if (fallo) {
      console.error(fallo)
      setError('No se pudieron cargar los hábitos')
      return
    }
    setHabitos(h.data as Habito[])
    setAreas(a.data as Area[])
    setError(null)
  }, [])

  useEffect(() => {
    void cargar()
  }, [cargar])

  async function alCambiar() {
    await cargar()
    await recargar()
  }

  const buenos = habitos.filter((h) => h.kind === 'good')
  const malos = habitos.filter((h) => h.kind === 'bad')

  return (
    <section className="card ajustes-seccion">
      <h2>Hábitos</h2>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <details>
        <summary>Hábitos buenos ({buenos.length})</summary>
        <ul className="lista-ajustes">
          {buenos.map((h) => (
            <Fila key={h.id} h={h} areas={areas} onGuardado={alCambiar} />
          ))}
        </ul>
      </details>

      <details>
        <summary>Hábitos malos ({malos.length})</summary>
        <ul className="lista-ajustes">
          {malos.map((h) => (
            <Fila key={h.id} h={h} areas={areas} onGuardado={alCambiar} />
          ))}
        </ul>
      </details>

      <details>
        <summary>Agregar un hábito</summary>
        <NuevoHabito habitos={habitos} areas={areas} onCreado={alCambiar} />
      </details>
    </section>
  )
}