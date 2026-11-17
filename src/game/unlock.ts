import { LEVELS } from '../data/levels'
import { isChallengeComplete } from './progressStore'

/** Orden real del mapa: 1.1, 1.2, … y después el siguiente mundo. */
export function challengeOrder() {
  return LEVELS.flatMap((level) =>
    level.retos.map((reto) => ({ levelId: level.levelId, retoId: reto.retoId })),
  )
}

/** Las cuentas antiguas traen acceso libre. Las nuevas solo abren el siguiente reto. */
export function isRetoUnlocked(
  estudianteId: string,
  levelId: string,
  retoId: string,
  accesoLibre: boolean,
) {
  if (accesoLibre) return true
  const order = challengeOrder()
  const index = order.findIndex((item) => item.levelId === levelId && item.retoId === retoId)
  if (index < 0) return false
  return order
    .slice(0, index)
    .every((item) => isChallengeComplete(estudianteId, item.levelId, item.retoId))
}
