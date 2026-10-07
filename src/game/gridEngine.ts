import { generarMapaAleatorio } from './generateRandomMap'
import type { Challenge, Condition, Instruction, StepResult, Tile } from './types'

function cloneTiles(tiles: Tile[]): Tile[] {
  return [...tiles]
}

function lookAhead(tiles: Tile[], pos: number): Tile | null {
  return pos + 1 < tiles.length ? tiles[pos + 1] : null
}

function evalCondition(
  cond: Condition,
  tiles: Tile[],
  pos: number,
): boolean {
  switch (cond.type) {
    case 'sensor_hueco_adelante':
      return lookAhead(tiles, pos) === '_'
    case 'sensor_pared_adelante':
      return lookAhead(tiles, pos) === '#'
    case 'sensor_estrella_adelante':
      return lookAhead(tiles, pos) === '★'
    case 'logica_y':
      return evalCondition(cond.a, tiles, pos) && evalCondition(cond.b, tiles, pos)
    case 'logica_o':
      return evalCondition(cond.a, tiles, pos) || evalCondition(cond.b, tiles, pos)
    case 'logica_no':
      return !evalCondition(cond.a, tiles, pos)
    default:
      return false
  }
}

function collectIfStar(tiles: Tile[], pos: number, stars: { n: number }) {
  if (tiles[pos] === '★') {
    tiles[pos] = '.'
    stars.n += 1
  }
}

/**
 * Interpreta el programa bloque a bloque sobre el mapa.
 * Devuelve la secuencia de estados para animar al personaje.
 */
export function runProgram(
  initialTiles: Tile[],
  program: Instruction[],
  options?: { estrellasRequeridas?: number },
): StepResult[] {
  const tiles = cloneTiles(initialTiles)
  let pos = tiles.findIndex((t) => t === 'M')
  if (pos < 0) pos = 0
  tiles[pos] = '.'

  const stars = { n: 0 }
  let jumps = 0
  const vars: Record<string, number> = {}
  const steps: StepResult[] = [
    { position: pos, tiles: cloneTiles(tiles), starsCollected: 0, status: 'running' },
  ]

  let finished = false

  const push = (extra?: Partial<StepResult>) => {
    steps.push({
      position: pos,
      tiles: cloneTiles(tiles),
      starsCollected: stars.n,
      status: 'running',
      ...extra,
    })
  }

  const fail = (status: StepResult['status']) => {
    finished = true
    push({ status })
  }

  const succeed = () => {
    finished = true
    const okStars =
      options?.estrellasRequeridas == null || stars.n >= options.estrellasRequeridas
    push({
      status: okStars ? 'success' : 'incomplete',
      message: okStars
        ? '¡Lo lograste!'
        : `Necesitas ${options?.estrellasRequeridas} estrellas. Llevas ${stars.n}.`,
    })
  }

  const moveForwardOne = (): boolean => {
    const next = pos + 1
    if (next >= tiles.length) {
      fail('incomplete')
      return false
    }
    const tile = tiles[next]
    if (tile === '_') {
      pos = next
      fail('fail_hole')
      return false
    }
    if (tile === '#') {
      fail('fail_wall')
      return false
    }
    pos = next
    collectIfStar(tiles, pos, stars)
    if (tile === 'F') {
      succeed()
      steps[steps.length - 1].move = 'walk'
      return false
    }
    push({ move: 'walk' })
    return true
  }

  const jumpForward = (pasos: number): boolean => {
    // saltar(n) avanza n+1 casillas en el aire (salta por encima de n obstáculos)
    const distancia = pasos + 1
    const jumpId = ++jumps
    for (let i = 0; i < distancia; i += 1) {
      const next = pos + 1
      if (next >= tiles.length) {
        fail('incomplete')
        return false
      }
      pos = next
      collectIfStar(tiles, pos, stars)
      push({ move: 'jump', jumpId })
      if (tiles[pos] === 'F') {
        succeed()
        return false
      }
    }
    return true
  }

  const runList = (list: Instruction[]) => {
    for (const inst of list) {
      if (finished) return
      runOne(inst)
    }
  }

  const runOne = (inst: Instruction) => {
    if (finished) return

    switch (inst.type) {
      case 'avanzar': {
        for (let i = 0; i < inst.pasos; i += 1) {
          if (finished) return
          if (!moveForwardOne()) return
        }
        break
      }
      case 'saltar': {
        if (!jumpForward(inst.pasos)) return
        break
      }
      case 'repetir': {
        for (let i = 0; i < inst.veces; i += 1) {
          if (finished) return
          runList(inst.body)
        }
        break
      }
      case 'si': {
        const ok = evalCondition(inst.condicion, tiles, pos)
        if (ok) runList(inst.entonces)
        else if (inst.sino) runList(inst.sino)
        break
      }
      case 'mostrar_mensaje': {
        push({ message: inst.texto })
        break
      }
      case 'crear_variable_contador': {
        vars[inst.nombre] = inst.valor
        push({ message: `${inst.nombre} = ${inst.valor}` })
        break
      }
      case 'cambiar_variable': {
        vars[inst.nombre] = (vars[inst.nombre] ?? 0) + inst.cantidad
        push({ message: `${inst.nombre} = ${vars[inst.nombre]}` })
        break
      }
      default:
        break
    }
  }

  runList(program)

  if (!finished) {
    const onFlag = tiles[pos] === 'F'
    const okStars =
      options?.estrellasRequeridas == null || stars.n >= options.estrellasRequeridas
    push({
      status: onFlag && okStars ? 'success' : 'incomplete',
      message:
        onFlag && okStars
          ? '¡Lo lograste!'
          : onFlag
            ? `Necesitas ${options?.estrellasRequeridas} estrellas.`
            : 'Casi lo tienes, ¡inténtalo de nuevo!',
    })
  }

  return steps
}

export function resolveChallengeGrid(challenge: Challenge): Tile[] {
  if (challenge.randomMap) {
    const { largo, nHuecos, nParedes, nEstrellas } = challenge.randomMap
    return generarMapaAleatorio(largo, nHuecos, nParedes, nEstrellas)
  }
  return [...challenge.grid]
}

/** Convierte instrucciones a strings tipo avanzar(3) para attempts */
export function instructionsToStrings(list: Instruction[]): string[] {
  const out: string[] = []
  const walk = (items: Instruction[]) => {
    for (const inst of items) {
      switch (inst.type) {
        case 'avanzar':
          out.push(`avanzar(${inst.pasos})`)
          break
        case 'saltar':
          out.push(`saltar(${inst.pasos})`)
          break
        case 'repetir':
          out.push(`repetir(${inst.veces}) { ${bodyPreview(inst.body)} }`)
          break
        case 'si':
          out.push(
            `si (${condPreview(inst.condicion)}) { ${bodyPreview(inst.entonces)} }${
              inst.sino ? ` sino { ${bodyPreview(inst.sino)} }` : ''
            }`,
          )
          break
        case 'mostrar_mensaje':
          out.push(`mostrar("${inst.texto}")`)
          break
        case 'crear_variable_contador':
          out.push(`crear variable "${inst.nombre}" = ${inst.valor}`)
          break
        case 'cambiar_variable':
          out.push(`cambiar variable "${inst.nombre}" + ${inst.cantidad}`)
          break
      }
    }
  }
  walk(list)
  return out
}

function bodyPreview(body: Instruction[]): string {
  return instructionsToStrings(body).join('; ')
}

function condPreview(c: Condition): string {
  switch (c.type) {
    case 'sensor_hueco_adelante':
      return '¿hay hueco adelante?'
    case 'sensor_pared_adelante':
      return '¿hay pared adelante?'
    case 'sensor_estrella_adelante':
      return '¿hay estrella adelante?'
    case 'logica_y':
      return `(${condPreview(c.a)}) Y (${condPreview(c.b)})`
    case 'logica_o':
      return `(${condPreview(c.a)}) O (${condPreview(c.b)})`
    case 'logica_no':
      return `No (${condPreview(c.a)})`
  }
}
