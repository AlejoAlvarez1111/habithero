import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { entero } from '../../lib/ajustes'

type Props = {
  tabla: 'shop_items' | 'revive_challenges'
  titulo: string
  conPrecio?: boolean
}

type Item = { id: string; name: string; is_active: boolean; price?: number; position?: number }

function FilaItem({
  item,
  tabla,
  conPrecio,
  onGuardado,
}: {
  item: Item
  tabla: Props['tabla']
  conPrecio: boolean
  onGuardado: () => Promise<void>
}) {
  const [nombre, setNombre] = useState(item.name)
  const [precio, setPrecio] = useState(String(item.price ?? 0))
  const [activo, setActivo] = useState(item.is_active)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  const cambiado =
    nombre !== item.name ||
    activo !== item.is_active ||
    (conPrecio && precio !== String(item.price ?? 0))

  async function guardar() {
    const nPrecio = entero(precio)
    if (!nombre.trim() || (conPrecio && nPrecio === null)) {
      setError('Revisa el nombre y que el precio sea un número entero')
      return
    }
    setGuardando(true)
    setError(null)
    const cambios = conPrecio
      ? { name: nombre.trim(), is_active: activo, price: nPrecio }
      : { name: nombre.trim(), is_active: activo }
    const { error: fallo } = await supabase.from(tabla).update(cambios).eq('id', item.id)
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

      {conPrecio && (
        <label className="campo num">
          <span>Precio</span>
          <input value={precio} onChange={(e) => setPrecio(e.target.value)} inputMode="numeric" />
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

export default function AjustesLista({ tabla, titulo, conPrecio = false }: Props) {
  const [items, setItems] = useState<Item[]>([])
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  const cargar = useCallback(async () => {
    const columnas = conPrecio ? 'id,name,price,is_active,position' : 'id,name,is_active'
    const { data, error: fallo } = await supabase
      .from(tabla)
      .select(columnas)
      .order(conPrecio ? 'price' : 'created_at')
    if (fallo) {
      console.error(fallo)
      setError('No se pudo cargar la lista')
      return
    }
    setItems(data as unknown as Item[])
    setError(null)
  }, [tabla, conPrecio])

  useEffect(() => {
    void cargar()
  }, [cargar])

  async function agregar(e: FormEvent) {
    e.preventDefault()
    const nPrecio = entero(precio)
    if (!nombre.trim() || (conPrecio && nPrecio === null)) {
      setError('Escribe un nombre y un precio que sea un número entero')
      return
    }

    setGuardando(true)
    setError(null)
        const nuevo: Record<string, string | number> = { name: nombre.trim() }
    if (conPrecio && nPrecio !== null) {
      nuevo.price = nPrecio
      nuevo.position = Math.max(0, ...items.map((i) => i.position ?? 0)) + 1
    }
    const { error: fallo } = await supabase.from(tabla).insert(nuevo)
    if (fallo) {
      console.error(fallo)
      setError('No se pudo agregar')
    } else {
      setNombre('')
      setPrecio('')
      await cargar()
    }
    setGuardando(false)
  }

  return (
    <section className="card ajustes-seccion">
      <h2>{titulo}</h2>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <details>
        <summary>Ver y editar ({items.length})</summary>
        <ul className="lista-ajustes">
          {items.map((item) => (
            <FilaItem
              key={item.id}
              item={item}
              tabla={tabla}
              conPrecio={conPrecio}
              onGuardado={cargar}
            />
          ))}
        </ul>
      </details>

      <details>
        <summary>Agregar uno nuevo</summary>
        <form className="form-jefe" onSubmit={agregar}>
          <label>
            Nombre
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </label>
          {conPrecio && (
            <label>
              Precio en Reales
              <input value={precio} onChange={(e) => setPrecio(e.target.value)} inputMode="numeric" />
            </label>
          )}
          <button className="btn" type="submit" disabled={guardando}>
            {guardando ? 'Agregando…' : 'Agregar'}
          </button>
        </form>
      </details>
    </section>
  )
}