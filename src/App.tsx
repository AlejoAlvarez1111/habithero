import { useAuth } from './auth/context'
import Login from './pages/Login'
import Home from './pages/Home'

export default function App() {
  const { session, loading } = useAuth()

  if (loading) return <p className="center">Cargando…</p>

  return session ? <Home /> : <Login />
}