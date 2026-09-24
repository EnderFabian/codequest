import type { AttemptRecord } from './types'

const ATTEMPTS_KEY = 'codequest-attempts'
const PROGRESS_KEY = 'codequest-progress'

export type StudentProgress = {
  estudianteId: string
  completed: string[] // challengeIds como "nivel_1_secuenciacion:1.1"
  estrellasTotales: number
  badges: string[]
  attemptCounts: Record<string, number>
}

function challengeKey(levelId: string, retoId: string) {
  return `${levelId}:${retoId}`
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
    return (
      map[estudianteId] ?? {
        estudianteId,
        completed: [],
        estrellasTotales: 0,
        badges: [],
        attemptCounts: {},
      }
    )
  } catch {
    return {
      estudianteId,
      completed: [],
      estrellasTotales: 0,
      badges: [],
      attemptCounts: {},
    }
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
