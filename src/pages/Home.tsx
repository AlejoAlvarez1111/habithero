import { useState } from 'react'
import { useGameState } from '../game/context'
import StatusBar from '../components/StatusBar'
import HabitColumn from '../components/HabitColumn'
import Caido from '../components/Caido'

export default function Home() {
  const { habits, logs, totals, loading, error, hoy, marcar, deshacer } = useGameState()
  const [pestana, setPestana] = useState<'good' | 'bad'>('good')

  const caido = !!totals && totals.hp <= 0
  const buenos = habits.filter((h) => h.kind === 'good')
  const malos = habits.filter((h) => h.kind === 'bad')

  return (
    <>
      {loading && <p className="center">Cargando tu aventura…</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {totals && (
        <>
          <StatusBar totals={totals} />

          {caido ? (
            <Caido />
          ) : (
            <>
              <div className="tabs" role="tablist" aria-label="Tipo de hábitos">
                <button
                  role="tab"
                  aria-selected={pestana === 'good'}
                  className={pestana === 'good' ? 'on' : ''}
                  onClick={() => setPestana('good')}
                >
                  Buenos
                </button>
                <button
                  role="tab"
                  aria-selected={pestana === 'bad'}
                  className={pestana === 'bad' ? 'on' : ''}
                  onClick={() => setPestana('bad')}
                >
                  Malos
                </button>
              </div>

              <div className="columns">
                <HabitColumn
                  title="Hábitos buenos"
                  kind="good"
                  habits={buenos}
                  logs={logs}
                  hoy={hoy}
                  caido={false}
                  activa={pestana === 'good'}
                  onMarcar={marcar}
                  onDeshacer={deshacer}
                />
                <HabitColumn
                  title="Hábitos malos"
                  kind="bad"
                  habits={malos}
                  logs={logs}
                  hoy={hoy}
                  caido={false}
                  activa={pestana === 'bad'}
                  onMarcar={marcar}
                  onDeshacer={deshacer}
                />
              </div>
            </>
          )}
        </>
      )}
    </>
  )
}