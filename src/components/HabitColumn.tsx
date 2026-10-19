import { detalle, statusOf, type Habit, type HabitLog } from '../lib/game'

type Props = {
  title: string
  kind: 'good' | 'bad'
  habits: Habit[]
  logs: HabitLog[]
  hoy: string
  caido: boolean
  activa: boolean
  onMarcar: (habit: Habit) => void
  onDeshacer: (logId: string) => void
}

export default function HabitColumn({
  title,
  kind,
  habits,
  logs,
  hoy,
  caido,
  activa,
  onMarcar,
  onDeshacer,
}: Props) {
  return (
    <section className={`card column ${kind} ${activa ? 'activa' : ''}`}>
      <h2>{title}</h2>
      <ul className="habit-list">
        {habits.map((habit) => {
          const estado = statusOf(habit, logs, hoy)
          const nota =
            estado.kind === 'locked'
              ? ` · ${estado.reason}`
              : estado.kind === 'done'
                ? kind === 'good'
                  ? ' · hecho hoy'
                  : ' · anotado hoy'
                : ''

          return (
            <li key={habit.id} className="habit">
              <div>
                <span>{habit.name}</span>
                <small>
                  {detalle(habit)}
                  {nota}
                </small>
              </div>
              {estado.kind === 'done' ? (
                <button className="act hecho" onClick={() => onDeshacer(estado.logId)}>
                  Deshacer
                </button>
              ) : (
                <button
                  className={`act ${kind}`}
                  disabled={caido || estado.kind === 'locked'}
                  onClick={() => onMarcar(habit)}
                >
                  {kind === 'good' ? 'Hecho' : 'Caí'}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}