import { BrowserRouter, Route, Routes } from 'react-router'
import { useAuth } from './auth/context'
import Login from './pages/Login'
import Layout from './components/Layout'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Pronto from './pages/Pronto'
import Areas from './pages/Areas'
import Bosses from './pages/Bosses'
import Achievements from './pages/Achievements'
import History from './pages/History'
import Settings from './pages/Settings'

export default function App() {
  const { session, loading } = useAuth()

  if (loading) return <p className="center">Cargando…</p>
  if (!session) return <Login />

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tienda" element={<Shop />} />
          <Route path="areas" element={<Areas />} />
          <Route path="jefes" element={<Bosses />} />
          <Route path="logros" element={<Achievements />} />
          <Route path="historial" element={<History />} />
          <Route path="ajustes" element={<Settings />} />
          <Route
            path="*"
            element={<Pronto titulo="Página no encontrada" mensaje="Esa dirección no existe." />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}