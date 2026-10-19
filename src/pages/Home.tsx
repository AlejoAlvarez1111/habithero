import { useAuth } from '../auth/context'

export default function Home() {
  const { session, signOut } = useAuth()

  return (
    <main className="home">
      <h1>¡Bienvenido, héroe!</h1>
      <p>Sesión iniciada como {session?.user.email}</p>
      <button className="btn" onClick={signOut}>
        Cerrar sesión
      </button>
    </main>
  )
}