const LIMIT_KEY = 'codequest-time-limit-min'
const USED_KEY = 'codequest-usage'
const CHANGE_EVENT = 'codequest-time'

export const DEFAULT_LIMIT_MIN = 120
export const MIN_LIMIT_MIN = 5
export const MAX_LIMIT_MIN = 8 * 60
export const WARN_AT_SEC = 5 * 60
export const DEMO_STUDENT_ID = 'estu-1'

type UsedMap = Record<string, number>

function readUsedMap(): UsedMap {
  try {
    return JSON.parse(localStorage.getItem(USED_KEY) || '{}') as UsedMap
  } catch {
    return {}
  }
}

function notify() {
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

type CloudHooks = {
  onLimit?: (minutes: number) => void
  onReset?: (estudianteId: string) => void
  onTick?: (estudianteId: string, usedSec: number) => void
}

let cloudHooks: CloudHooks = {}

export function setSessionCloudHooks(next: CloudHooks) {
  cloudHooks = next
}

export function writeLimitMinutes(minutes: number, announce = true) {
  const next = clampLimitMinutes(minutes)
  localStorage.setItem(LIMIT_KEY, String(next))
  if (announce) cloudHooks.onLimit?.(next)
  notify()
  return next
}

export function writeUsedSeconds(estudianteId: string, seconds: number) {
  const map = readUsedMap()
  map[estudianteId] = Math.max(0, Math.floor(seconds))
  localStorage.setItem(USED_KEY, JSON.stringify(map))
  notify()
}

export function clampLimitMinutes(minutes: number) {
  if (!Number.isFinite(minutes)) return DEFAULT_LIMIT_MIN
  return Math.min(MAX_LIMIT_MIN, Math.max(MIN_LIMIT_MIN, Math.round(minutes)))
}

export function readLimitSec() {
  const raw = Number(localStorage.getItem(LIMIT_KEY))
  return clampLimitMinutes(Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_LIMIT_MIN) * 60
}

export function readUsedSec(estudianteId: string) {
  return Math.max(0, readUsedMap()[estudianteId] ?? 0)
}

export function setLimitMinutes(minutes: number) {
  return writeLimitMinutes(minutes, true)
}

export function resetUsage(estudianteId: string) {
  const map = readUsedMap()
  map[estudianteId] = 0
  localStorage.setItem(USED_KEY, JSON.stringify(map))
  cloudHooks.onReset?.(estudianteId)
  notify()
}

export function tickUsage(estudianteId: string) {
  if (readUsedSec(estudianteId) >= readLimitSec()) return false
  const map = readUsedMap()
  map[estudianteId] = (map[estudianteId] ?? 0) + 1
  localStorage.setItem(USED_KEY, JSON.stringify(map))
  if (map[estudianteId] % 15 === 0) cloudHooks.onTick?.(estudianteId, map[estudianteId])
  return true
}

export function subscribeSessionTime(listener: () => void) {
  window.addEventListener(CHANGE_EVENT, listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener)
    window.removeEventListener('storage', listener)
  }
}

export function formatClock(totalSec: number) {
  const s = Math.max(0, Math.floor(totalSec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(sec).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`
}

export function formatMinutes(totalMin: number) {
  const m = Math.max(0, Math.round(totalMin))
  const h = Math.floor(m / 60)
  const min = m % 60
  if (h > 0 && min > 0) return `${h} h ${min} min`
  if (h > 0) return `${h} h`
  return `${min} min`
}
