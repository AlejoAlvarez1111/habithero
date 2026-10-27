import { money } from '../lib/game'
import { useGameState } from '../game/context'

export default function AvisoLogros() {
  const { nuevosLogros, descartarLogros } = useGameState()
  if (nuevosLogros.length === 0) return null

  return (
    <div className="card aviso-logro" role="status">
      <div>
        {nuevosLogros.map((l) => (
          <p key={l.code}>
            <strong>¡Logro desbloqueado: {l.name}!</strong> +{money(l.reales_reward)}
          </p>
        ))}
      </div>
      <button className="act hecho" onClick={descartarLogros}>
        Entendido
      </button>
    </div>
  )
}