import { LEVELS } from '../data/levels'
import { supabase } from './supabase'

export type AttemptView = {
  id: string
  challengeId: string
  fechaHora: string
  aciertos: boolean
  numeroIntentos: number
  tiempoResolucionSeg: number
}

export type StudentSnapshot = {
  id: string
  username: string
  nombre: string
  completed: string[]
  estrellas: number
  puntos: number
  badges: string[]
  attemptCounts: Record<string, number>
  tiempoUsadoSeg: number
  attempts: AttemptView[]
}

const SKILL: Record<string, { titulo: string; practica: string; familia: string; profesional: string }> = {
  secuenciacion: {
    titulo: 'Seguir una secuencia',
    practica: 'Ordena los pasos de principio a fin. Practica la atención, uno por uno.',
    familia: 'Antes de correr el programa, díganlo en voz alta: primero, después y al final.',
    profesional: 'Mire si se salta un paso o cambia el orden. Conviene reforzar un paso cada vez.',
  },
  bucles: {
    titulo: 'Repetir un patrón',
    practica: 'Descubre qué se repite y lo agrupa. Practica no empezar de cero cada vez.',
    familia: 'Pregunten: ¿qué movimiento se repite? Si lo ven, el reto se vuelve más corto.',
    profesional: 'Si copia el mismo bloque muchas veces, el siguiente paso es el bucle.',
  },
  condicionales: {
    titulo: 'Tomar una decisión',
    practica: 'Elige una acción según lo que hay adelante. Practica mirar antes de moverse.',
    familia: 'Señalen el camino y pregunten: ¿hay hueco o se puede avanzar?',
    profesional: 'Observe si actúa sin mirar el sensor. La pausa antes de decidir es la meta.',
  },
  logica_combinada: {
    titulo: 'Unir varias ideas',
    practica: 'Combina secuencia, repetición y decisión en un mismo plan.',
    familia: 'Dividan el reto en dos partes y celebren cuando termine la primera.',
    profesional: 'Si se bloquea, separen la tarea: primero el camino, luego la condición.',
  },
  estrellas: {
    titulo: 'Ir hacia un objetivo',
    practica: 'Planea cómo llegar a la estrella. Practica tener una meta clara.',
    familia: 'Marquen juntos dónde está la estrella antes de poner el primer bloque.',
    profesional: 'Valore si el plan apunta al objetivo o si se mueve sin rumbo.',
  },
  obstaculos: {
    titulo: 'Anticipar un obstáculo',
    practica: 'Ve el hueco o la pared y cambia el plan. Practica la precaución.',
    familia: 'Si cae en un hueco, no es un error grave: miren el camino y vuelvan a intentar.',
    profesional: 'Cuente los fallos por obstáculo. Muchos intentos aquí indican que aún no anticipa.',
  },
  maestria: {
    titulo: 'Usar todo junto',
    practica: 'Junta lo aprendido en una misión más larga. Es el reto más completo.',
    familia: 'Hagan este mundo en una sesión corta, cuando ya esté descansado.',
    profesional: 'Úsenlo como cierre: solo tiene sentido cuando las habilidades anteriores están firmes.',
  },
}

export type WorldProgress = {
  levelId: string
  nombre: string
  titulo: string
  practica: string
  familia: string
  profesional: string
  hechos: number
  total: number
  intentos: number
}

export type StudentInsight = {
  student: StudentSnapshot
  worlds: WorldProgress[]
  totalHechos: number
  totalRetos: number
  siguiente: WorldProgress | null
  aMejorar: WorldProgress | null
  fortalezas: WorldProgress[]
  limiteMin: number
}

export async function pullCompanionReport(): Promise<{
  students: StudentSnapshot[]
  limiteMin: number
  error: string | null
}> {
  if (!supabase) {
    return { students: [], limiteMin: 120, error: 'La nube no está configurada en este equipo.' }
  }

  const profiles = await supabase
    .from('perfiles')
    .select('id, username, nombre, rol')
    .eq('rol', 'estudiante')

  if (profiles.error) {
    return { students: [], limiteMin: 120, error: 'No se pudo leer el avance del estudiante.' }
  }

  const rows = profiles.data ?? []
  const ids = rows.map((row) => row.id)
  const progress = ids.length
    ? await supabase
        .from('progreso')
        .select('usuario_id, completed, estrellas_totales, puntos_totales, badges, attempt_counts, tiempo_usado_seg')
        .in('usuario_id', ids)
    : { data: [], error: null }

  const attempts = ids.length
    ? await supabase
        .from('intentos')
        .select('id, usuario_id, challenge_id, fecha_hora, aciertos, numero_intentos, tiempo_resolucion_seg')
        .in('usuario_id', ids)
        .order('fecha_hora', { ascending: false })
        .limit(40)
    : { data: [], error: null }

  const limit = await supabase.from('ajuste_tiempo').select('limite_min').eq('id', 1).maybeSingle()

  const byProgress = new Map((progress.data ?? []).map((row) => [row.usuario_id, row]))
  const byAttempts = new Map<string, AttemptView[]>()
  for (const row of attempts.data ?? []) {
    const list = byAttempts.get(row.usuario_id) ?? []
    list.push({
      id: row.id,
      challengeId: row.challenge_id,
      fechaHora: row.fecha_hora,
      aciertos: row.aciertos,
      numeroIntentos: row.numero_intentos,
      tiempoResolucionSeg: row.tiempo_resolucion_seg,
    })
    byAttempts.set(row.usuario_id, list)
  }

  const students: StudentSnapshot[] = rows.map((row) => {
    const remote = byProgress.get(row.id)
    return {
      id: row.id,
      username: row.username,
      nombre: row.nombre,
      completed: remote?.completed ?? [],
      estrellas: remote?.estrellas_totales ?? 0,
      puntos: remote?.puntos_totales ?? 0,
      badges: remote?.badges ?? [],
      attemptCounts: (remote?.attempt_counts ?? {}) as Record<string, number>,
      tiempoUsadoSeg: remote?.tiempo_usado_seg ?? 0,
      attempts: byAttempts.get(row.id) ?? [],
    }
  })

  return {
    students,
    limiteMin: limit.data?.limite_min ?? 120,
    error: progress.error || attempts.error ? 'Una parte del avance no se pudo cargar.' : null,
  }
}

export function buildInsight(student: StudentSnapshot, limiteMin: number): StudentInsight {
  const done = new Set(student.completed)
  const worlds: WorldProgress[] = LEVELS.map((level) => {
    const skill = SKILL[level.concepto] ?? {
      titulo: level.levelName,
      practica: 'Practica pensamiento lógico jugando.',
      familia: 'Acompañen el reto y celebren el intento.',
      profesional: 'Registre si completa el mundo o se detiene a mitad.',
    }
    const hechos = level.retos.filter((reto) => done.has(`${level.levelId}:${reto.retoId}`)).length
    const intentos = Object.entries(student.attemptCounts)
      .filter(([key]) => key.startsWith(`${level.levelId}:`))
      .reduce((sum, [, count]) => sum + count, 0)
    return {
      levelId: level.levelId,
      nombre: level.levelName,
      titulo: skill.titulo,
      practica: skill.practica,
      familia: skill.familia,
      profesional: skill.profesional,
      hechos,
      total: level.retos.length,
      intentos,
    }
  })

  const totalHechos = worlds.reduce((sum, world) => sum + world.hechos, 0)
  const totalRetos = worlds.reduce((sum, world) => sum + world.total, 0)
  const abiertos = worlds.filter((world) => world.hechos < world.total)
  const siguiente = abiertos[0] ?? null
  const empezados = abiertos.filter((world) => world.hechos > 0 || world.intentos > 0)
  const aMejorar =
    empezados.sort((a, b) => a.hechos / a.total - b.hechos / b.total || b.intentos - a.intentos)[0] ??
    siguiente
  const fortalezas = worlds.filter((world) => world.total > 0 && world.hechos === world.total)

  return { student, worlds, totalHechos, totalRetos, siguiente, aMejorar, fortalezas, limiteMin }
}

export function challengeLabel(challengeId: string) {
  const [levelId, retoId] = challengeId.split(':')
  const level = LEVELS.find((item) => item.levelId === levelId)
  if (!level || !retoId) return challengeId
  return `${level.levelName} · ${retoId}`
}
