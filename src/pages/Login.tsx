import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/context'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const message = await signIn(email.trim(), password)
    if (message) setError(message)
    setBusy(false)
  }

  return (
    <main className="login">
      <form className="login-card" onSubmit={handleSubmit}>
        <img src="/brand/logo.svg" alt="Logo de HabitHero" width={120} height={120} />
        <h1>HabitHero</h1>
        <p className="tagline">Construye tu leyenda</p>

        <label>
          Correo
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}