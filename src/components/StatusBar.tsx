import { money, type Totals } from '../lib/game'

export default function StatusBar({ totals }: { totals: Totals }) {
  const porcentaje = Math.max(0, Math.min(100, (totals.hp / totals.max_hp) * 100))

  return (
    <section className="status" aria-label="Estado del héroe">
      <div className="card hero">
        <img className="avatar" src="/avatar/retrato.png" width={96} height={96} alt="Tu avatar" />
        <div>
          <h2>Tu héroe</h2>
          <p className="muted">Avatar 2D</p>
        </div>
      </div>

      <div className="card">
        <div className="row">
          <h2>Vida</h2>
          <strong>
            {totals.hp} / {totals.max_hp}
          </strong>
        </div>
        <div
          className="bar"
          role="progressbar"
          aria-label="Vida"
          aria-valuenow={totals.hp}
          aria-valuemin={0}
          aria-valuemax={totals.max_hp}
        >
          <i style={{ width: `${porcentaje}%` }} />
        </div>
      </div>

      <div className="card">
        <p className="muted">Reales</p>
        <p className="reales">{money(totals.reales)}</p>
      </div>
    </section>
  )
}