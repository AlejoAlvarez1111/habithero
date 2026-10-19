export default function Pronto({
  titulo,
  mensaje = 'Esta pantalla se construye pronto.',
}: {
  titulo: string
  mensaje?: string
}) {
  return (
    <section className="card">
      <h2>{titulo}</h2>
      <p className="muted">{mensaje}</p>
    </section>
  )
}