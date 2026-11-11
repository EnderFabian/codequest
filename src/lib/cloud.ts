import type { AttemptRecord } from '../game/types'
import type { StudentProgress } from '../game/progressStore'
import { supabase } from './supabase'

type ProgressRow = {
  usuario_id: string
  completed: string[]
  estrellas_totales: number
  puntos_totales: number
  best_scores: Record<string, number>
  badges: string[]
  attempt_counts: Record<string, number>
  tiempo_usado_seg: number
}

function toProgress(row: ProgressRow): StudentProgress {
  return {
    estudianteId: row.usuario_id,
    completed: row.completed ?? [],
    estrellasTotales: row.estrellas_totales ?? 0,
    puntosTotales: row.puntos_totales ?? 0,
    bestScores: row.best_scores ?? {},
    badges: row.badges ?? [],
    attemptCounts: row.attempt_counts ?? {},
  }
}

export async function pullProgress(userId: string) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('progreso')
    .select('usuario_id, completed, estrellas_totales, puntos_totales, best_scores, badges, attempt_counts, tiempo_usado_seg')
    .eq('usuario_id', userId)
    .maybeSingle()
  if (error || !data) return null
  return { progress: toProgress(data as ProgressRow), tiempoUsadoSeg: data.tiempo_usado_seg ?? 0 }
}

export async function pushProgress(progress: StudentProgress) {
  if (!supabase) return
  await supabase.from('progreso').upsert({
    usuario_id: progress.estudianteId,
    completed: progress.completed,
    estrellas_totales: progress.estrellasTotales,
    puntos_totales: progress.puntosTotales,
    best_scores: progress.bestScores,
    badges: progress.badges,
    attempt_counts: progress.attemptCounts,
    updated_at: new Date().toISOString(),
  })
}

export async function pushAttempt(record: AttemptRecord) {
  if (!supabase) return
  await supabase.from('intentos').upsert({
    id: record.id,
    usuario_id: record.estudianteId,
    challenge_id: record.challengeId,
    fecha_hora: record.fechaHora,
    aciertos: record.aciertos,
    numero_intentos: record.numeroIntentos,
    tiempo_resolucion_seg: record.tiempoResolucionSeg,
    secuencia: record.secuenciaBloquesUsada,
  })
}

export async function pullLimitMinutes() {
  if (!supabase) return null
  const { data } = await supabase.from('ajuste_tiempo').select('limite_min').eq('id', 1).maybeSingle()
  return data?.limite_min ?? null
}

export async function pushLimitMinutes(minutes: number) {
  if (!supabase) return
  await supabase.from('ajuste_tiempo').update({ limite_min: minutes }).eq('id', 1)
}

export async function pushUsedSeconds(userId: string, seconds: number) {
  if (!supabase) return
  await supabase.from('progreso').update({ tiempo_usado_seg: seconds, updated_at: new Date().toISOString() }).eq('usuario_id', userId)
}

export async function resetCloudUsage(username: string) {
  if (!supabase) return
  await supabase.rpc('reiniciar_tiempo', { p_username: username })
}
