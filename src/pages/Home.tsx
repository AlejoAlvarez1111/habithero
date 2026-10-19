import { useState } from 'react'
import { useAuth } from '../auth/context'
import { useGame } from '../hooks/useGame'
import StatusBar from '../components/StatusBar'
import HabitColumn from '../components/HabitColumn'

export default function Home() {
  const { signOut } = useAuth()
  const { habits, logs, totals, loading, error, hoy, marcar, deshacer } = useGame()
  const [pestana, setPestana] = useState<'good' | 'bad'>('good')

  const caido = !!totals && totals.hp <= 0
  const buenos = habits.filter((h) => h.kind === 'good')
  const malos = habits.filter((h) => h.kind === 'bad')

  return (
    <div className="app">
      <header className="topbar">
        <img src="/brand/logo.svg" alt="" width={48} height={48} />
        <div>
          <h1>HabitHero</h1>
          <p className="muted">Construye tu leyenda</p>
        </div>
        <button className="btn ghost" onClick={signOut}>
          Cerrar sesión
        </button>
      </header>

      <main>
        {loading && <p className="center">Cargando tu aventura…</p>}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        {totals && (
          <>
            <StatusBar totals={totals} />

            {caido && (
              <div className="card alerta">
                <strong>Estás caído.</strong> No ganas XP ni Reales hasta cumplir un reto de
                revivir. Esa pantalla la construimos pronto.
              </div>
            )}

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
                caido={caido}
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
                caido={caido}
                activa={pestana === 'bad'}
                onMarcar={marcar}
                onDeshacer={deshacer}
              />
            </div>
          </>
        )}
      </main>
    </div>
  )
}