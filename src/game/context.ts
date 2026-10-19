import { createContext, useContext } from 'react'
import type { useGame } from '../hooks/useGame'

export type GameState = ReturnType<typeof useGame>

export const GameContext = createContext<GameState | null>(null)

export function useGameState(): GameState {
  const ctx = useContext(GameContext)
  if (!ctx) {
    throw new Error('useGameState debe usarse dentro de GameProvider')
  }
  return ctx
}