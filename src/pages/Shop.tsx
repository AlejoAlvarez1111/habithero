import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { money } from '../lib/game'
import { useGameState } from '../game/context'

type Item = { id: string; name: string; price: number }
type Compra = { id: string; item_name: string; price: number; purchased_at: string }
type Resumen = { cantidad: number; total: number }

const DIA = 24 * 60 * 60 * 1000

function resumir(compras: Compra[], dias: number): Resumen {
  const desde = Date.now() - dias * DIA
  const lista = compras.filter((c) => new Date(c.purchased_at).getTime() >= desde)
  return { cantidad: lista.length, total: lista.reduce((suma, c) => suma + c.price, 0) }
}

function fechaCorta(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    day: 'numeric',
    month: 'short',
  })
}

export default function Shop() {
  const { totals, recargar } = useGameState()
  const [items, setItems] = useState<Item[]>([])
  const [compras, setCompras] = useState<Compra[]>([])
  const [semana, setSemana] = useState<Resumen>({ cantidad: 0, total: 0 })
  const [mes, setMes] = useState<Resumen>({ cantidad: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    const desde = new Date(Date.now() - 30 * DIA).toISOString()
    const [i, c] = await Promise.all([
      supabase.from('shop_items').select('id,name,price').eq('is_active', true).order('price'),
      supabase
        .from('purchases')
        .select('id,item_name,price,purchased_at')
        .gte('purchased_at', desde)
        .order('purchased_at', { ascending: false }),
    ])

    const fallo = i.error ?? c.error
    if (fallo) {
      console.error(fallo)
      setError('No se pudo cargar la tienda')
      return
    }

    const lista = c.data as Compra[]
    setItems(i.data as Item[])
    setCompras(lista)
    setSemana(resumir(lista, 7))
    setMes(resumir(lista, 30))
    setError(null)
  }, [])

  useEffect(() => {
    void cargar()
  }, [cargar])

  const reales = totals?.reales ?? 0
  const caido = !!totals && totals.hp <= 0

  async function comprar(item: Item) {
    if (caido || reales < item.price) return
    if (!window.confirm(`¿Comprar "${item.name}" por ${money(item.price)}?`)) return

    const { error: fallo } = await supabase
      .from('purchases')
      .insert({ item_id: item.id, item_name: item.name, price: item.price })

    if (fallo) {
      console.error(fallo)
      setError('No se pudo registrar la compra')
      return
    }

    setAviso(`Compraste: ${item.name}. Disfrútalo con moderación.`)
    await Promise.all([cargar(), recargar()])
  }

  return (
    <>
      <div className="shop-head">
        <div>
          <h2 className="titulo">Tienda de recompensas</h2>
          <p className="muted">Comprar no baja vida. El precio es el freno.</p>
        </div>
        <div className="saldo">
          <p className="muted">Tus Reales</p>
          <p className="reales">{money(reales)}</p>
        </div>
      </div>

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
        <div className="card alerta">Estás caído: no puedes comprar hasta revivir.</div>
      )}

      <div className="shop-grid">
        <div className="items">
          {items.map((item) => (
            <div key={item.id} className="card item">
              <strong>{item.name}</strong>
              <p className="precio">{money(item.price)}</p>
              <button
                className="act comprar"
                disabled={caido || reales < item.price}
                onClick={() => comprar(item)}
              >
                Comprar
              </button>
            </div>
          ))}
        </div>

        <aside className="card">
          <h2>Mis compras</h2>
          <div className="resumen">
            <span>Últimos 7 días ({semana.cantidad})</span>
            <strong className="gold">{money(semana.total)}</strong>
          </div>
          <div className="resumen">
            <span>Últimos 30 días ({mes.cantidad})</span>
            <strong className="gold">{money(mes.total)}</strong>
          </div>

          {compras.length > 0 && (
            <ul className="compras-lista">
              {compras.slice(0, 8).map((c) => (
                <li key={c.id}>
                  <span>
                    {c.item_name}
                    <small className="muted"> · {fechaCorta(c.purchased_at)}</small>
                  </span>
                  <span>{money(c.price)}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="muted">Las recompensas que no te alcanzan salen apagadas.</p>
        </aside>
      </div>
    </>
  )
}