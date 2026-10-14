import type { AttemptRecord } from './types'

const ATTEMPTS_KEY = 'codequest-attempts'
const PROGRESS_KEY = 'codequest-progress'

export const MAX_LIVES = 5

export type StudentProgress = {
  estudianteId: string
  completed: string[] // challengeIds como "nivel_1_secuenciacion:1.1"
  estrellasTotales: number
  /** Puntos acumulados por eficiencia (menos bloques = más puntos). */
  puntosTotales: number
  /** Mejor puntuación por reto. */
  bestScores: Record<string, number>
  badges: string[]
  attemptCounts: Record<string, number>
}

function challengeKey(levelId: string, retoId: string) {
  return `${levelId}:${retoId}`
}

function emptyProgress(estudianteId: string): StudentProgress {
  return {
    estudianteId,
    completed: [],
    estrellasTotales: 0,
    puntosTotales: 0,
    bestScores: {},
    badges: [],
    attemptCounts: {},
  }
}

export function loadAttempts(estudianteId?: string): AttemptRecord[] {
  try {
    const all = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '[]') as AttemptRecord[]
    return estudianteId ? all.filter((a) => a.estudianteId === estudianteId) : all
  } catch {
    return []
  }
}

export function saveAttempt(record: AttemptRecord) {
  const all = loadAttempts()
  all.push(record)
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(all))
}

export function loadProgress(estudianteId: string): StudentProgress {
  try {
    const map = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}') as Record<
      string,
      StudentProgress
    >
    const raw = map[estudianteId]
    if (!raw) return emptyProgress(estudianteId)
    return {
      ...emptyProgress(estudianteId),
      ...raw,
      bestScores: raw.bestScores ?? {},
      puntosTotales: raw.puntosTotales ?? 0,
    }
  } catch {
    return emptyProgress(estudianteId)
  }
}

function writeProgress(progress: StudentProgress) {
  const map = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}') as Record<
    string,
    StudentProgress
  >
  map[progress.estudianteId] = progress
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(map))
}

export function bumpAttemptCount(estudianteId: string, levelId: string, retoId: string) {
  const progress = loadProgress(estudianteId)
  const key = challengeKey(levelId, retoId)
  progress.attemptCounts[key] = (progress.attemptCounts[key] ?? 0) + 1
  writeProgress(progress)
  return progress.attemptCounts[key]
}

export function markChallengeComplete(
  estudianteId: string,
  levelId: string,
  retoId: string,
  badge?: string,
) {
  const progress = loadProgress(estudianteId)
  const key = challengeKey(levelId, retoId)
  if (!progress.completed.includes(key)) {
    progress.completed.push(key)
    progress.estrellasTotales += 1
  }
  if (badge && !progress.badges.includes(badge)) {
    progress.badges.push(badge)
  }
  writeProgress(progress)
  return progress
}

/** Guarda la mejor puntuación del reto y actualiza el total. */
export function recordChallengeScore(
  estudianteId: string,
  levelId: string,
  retoId: string,
  points: number,
) {
  const progress = loadProgress(estudianteId)
  const key = challengeKey(levelId, retoId)
  const prev = progress.bestScores[key] ?? 0
  if (points > prev) {
    progress.puntosTotales = Math.max(0, progress.puntosTotales - prev + points)
    progress.bestScores[key] = points
    writeProgress(progress)
  }
  return { progress, awarded: points, best: progress.bestScores[key] ?? points, improved: points > prev }
}

export function isChallengeComplete(estudianteId: string, levelId: string, retoId: string) {
  return loadProgress(estudianteId).completed.includes(challengeKey(levelId, retoId))
}

export function isLevelComplete(
  estudianteId: string,
  levelId: string,
  retoIds: string[],
) {
  const progress = loadProgress(estudianteId)
  return retoIds.every((id) => progress.completed.includes(challengeKey(levelId, id)))
}

export { challengeKey }
