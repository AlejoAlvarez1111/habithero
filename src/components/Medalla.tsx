import { useId } from 'react'
import {
  Award, BookOpen, CalendarCheck, Coins, Crown, Droplets, Dumbbell, Flame, Footprints,
  HeartPulse, Languages, Leaf, PhoneOff, PiggyBank, Scale, Shield, ShieldCheck, Skull,
  Sparkles, Star, Sunrise, Swords, Target, Timer, TrendingUp, Trophy, Utensils, Zap,
  type LucideIcon,
} from 'lucide-react'
import { NIVELES, type Nivel } from '../lib/achievements'

const ICONOS: Record<string, LucideIcon> = {
  primer_paso: Footprints,
  semana_perfecta: CalendarCheck,
  racha_21: Flame,
  racha_100: Zap,
  imparable: ShieldCheck,
  sin_redes_7: PhoneOff,
  mes_ejercicio: Dumbbell,
  madrugador: Sunrise,
  hidratado: Droplets,
  lector: BookOpen,
  poliglota: Languages,
  primer_nivel: TrendingUp,
  nivel_5: Award,
  equilibrio: Scale,
  heroe_completo: Crown,
  sin_puntos_debiles: Star,
  primer_millon: Coins,
  ahorrador: PiggyBank,
  con_moderacion: Timer,
  cazador: Target,
  racha_jefes: Swords,
  jefe_grande: Skull,
  renacido: HeartPulse,
  intocable: Shield,
  semana_limpia: Sparkles,
  mes_limpio: Leaf,
  sin_domicilios: Utensils,
}

type Props = { code: string; tier: Nivel; bloqueada: boolean; tamano?: number }

export default function Medalla({ code, tier, bloqueada, tamano = 88 }: Props) {
  const id = 'm' + useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const nivel = NIVELES[tier]
  const Icono = ICONOS[code] ?? Trophy
  const claro = bloqueada ? '#3a3a42' : nivel.claro
  const oscuro = bloqueada ? '#24242a' : nivel.oscuro

  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`Medalla ${nivel.etiqueta}${bloqueada ? ' bloqueada' : ''}`}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={claro} />
          <stop offset="1" stopColor={oscuro} />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill={`url(#${id})`} />
      <circle cx="50" cy="50" r="36" fill="#0E0E11" opacity={0.85} />
      <Icono
        x={30}
        y={30}
        width={40}
        height={40}
        color={bloqueada ? '#6b6b74' : nivel.claro}
        strokeWidth={1.8}
        aria-hidden="true"
      />
      {tier === 'legendario' && !bloqueada && (
        <path d="M84 12 L87 21 L96 24 L87 27 L84 36 L81 27 L72 24 L81 21 Z" fill="#FBF1E6" />
      )}
    </svg>
  )
}