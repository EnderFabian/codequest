import type { LevelDef } from '../../game/types'
import { nivel1 } from './nivel1'
import { nivel2 } from './nivel2'
import { nivel3 } from './nivel3'
import { nivel4 } from './nivel4'

export const LEVELS: LevelDef[] = [nivel1, nivel2, nivel3, nivel4]

export function getLevel(levelId: string): LevelDef | undefined {
  return LEVELS.find((l) => l.levelId === levelId)
}

export function getChallenge(levelId: string, retoId: string) {
  const level = getLevel(levelId)
  if (!level) return undefined
  const challenge = level.retos.find((r) => r.retoId === retoId)
  if (!challenge) return undefined
  return { level, challenge }
}

export function getNextChallenge(levelId: string, retoId: string) {
  const level = getLevel(levelId)
  if (!level) return null
  const idx = level.retos.findIndex((r) => r.retoId === retoId)
  if (idx < 0) return null
  if (idx + 1 < level.retos.length) {
    return { levelId, retoId: level.retos[idx + 1].retoId }
  }
  const levelIdx = LEVELS.findIndex((l) => l.levelId === levelId)
  if (levelIdx >= 0 && levelIdx + 1 < LEVELS.length) {
    const nextLevel = LEVELS[levelIdx + 1]
    return { levelId: nextLevel.levelId, retoId: nextLevel.retos[0].retoId }
  }
  return null
}
