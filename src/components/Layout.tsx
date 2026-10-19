import { NavLink, Outlet } from 'react-router'
import { useAuth } from '../auth/context'
import { GameProvider } from '../game/GameProvider'

const enlaces = [
  { to: '/', texto: 'Inicio' },
  { to: '/tienda', texto: 'Tienda' },
  { to: '/areas', texto: 'Áreas' },
  { to: '/jefes', texto: 'Jefes' },
  { to: '/logros', texto: 'Logros' },
  { to: '/historial', texto: 'Historial' },
  { to: '/ajustes', texto: 'Ajustes' },
]

export default function Layout() {
  const { signOut } = useAuth()

  return (
    <GameProvider>
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

        <nav className="nav" aria-label="Secciones">
          {enlaces.map((e) => (
            <NavLink
              key={e.to}
              to={e.to}
              end={e.to === '/'}
              className={({ isActive }) => (isActive ? 'on' : '')}
            >
              {e.texto}
            </NavLink>
          ))}
        </nav>

        <main>
          <Outlet />
        </main>
      </div>
    </GameProvider>
  )
}