import type { Condition, Instruction } from './types'

/** Cuenta todos los bloques de acción del programa (incluye los de dentro de Repetir/Si). */
export function countProgramBlocks(instructions: Instruction[]): number {
  let n = 0
  for (const inst of instructions) {
    n += 1
    if (inst.type === 'repetir') n += countProgramBlocks(inst.body)
    if (inst.type === 'si') {
      n += countProgramBlocks(inst.entonces)
      if (inst.sino) n += countProgramBlocks(inst.sino)
      n += countConditionTokens(inst.condicion)
    }
  }
  return n
}

function countConditionTokens(c: Condition): number {
  switch (c.type) {
    case 'logica_y':
    case 'logica_o':
      return 1 + countConditionTokens(c.a) + countConditionTokens(c.b)
    case 'logica_no':
      return 1 + countConditionTokens(c.a)
    default:
      return 1
  }
}

/**
 * Estima bloques óptimos a partir de la solución ejemplo.
 * Cada entrada del arreglo cuenta como 1; si hay `{ ... }` se suman los del interior.
 */
export function estimateOptimalBlocks(solucionEjemplo: string[]): number {
  if (!solucionEjemplo.length) return 1
  let n = 0
  for (const line of solucionEjemplo) {
    n += 1
    const inner = line.match(/\{([^}]*)\}/)
    if (inner?.[1]) {
      const parts = inner[1]
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean)
      n += Math.max(0, parts.length)
    }
  }
  return Math.max(1, n)
}

/**
 * Puntos por eficiencia: entre menos bloques uses (respecto a la solución), más puntos.
 * Rango: 50–1000.
 */
export function scoreFromBlocks(used: number, optimal: number): number {
  const u = Math.max(1, used)
  const o = Math.max(1, optimal)
  // 1000 si usas la cantidad óptima o menos; baja al crecer el exceso.
  const ratio = o / u
  let points = Math.round(850 * Math.min(1.15, ratio))
  if (u <= o) points = Math.min(1000, points + 150)
  return Math.max(50, Math.min(1000, points))
}
