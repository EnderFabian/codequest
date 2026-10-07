/**
 * Verifica que cada reto se pueda resolver: corre su `solucionEjemplo` en el
 * motor real del juego y avisa si el robot no llega a la meta.
 *
 *   npm run check:levels
 *
 * Los retos con mapa aleatorio se prueban con muchos mapas distintos.
 */
import { LEVELS } from '../src/data/levels'
import { resolveChallengeGrid, runProgram } from '../src/game/gridEngine'
import type { Condition, Instruction } from '../src/game/types'

class Parser {
  private i = 0
  constructor(private src: string) {}

  private ws() {
    while (/\s/.test(this.src[this.i] ?? '')) this.i += 1
  }
  private eat(token: string) {
    this.ws()
    if (!this.src.startsWith(token, this.i)) {
      throw new Error(`Se esperaba "${token}" en: ${this.src.slice(this.i, this.i + 30)}`)
    }
    this.i += token.length
  }
  private peek(token: string) {
    this.ws()
    return this.src.startsWith(token, this.i)
  }
  private num() {
    this.ws()
    const m = /^-?\d+/.exec(this.src.slice(this.i))
    if (!m) throw new Error(`Se esperaba un número en: ${this.src.slice(this.i, this.i + 30)}`)
    this.i += m[0].length
    return Number(m[0])
  }
  private str() {
    this.eat('"')
    const end = this.src.indexOf('"', this.i)
    const s = this.src.slice(this.i, end)
    this.i = end + 1
    return s
  }

  private cond(): Condition {
    this.ws()
    if (this.peek('No (')) {
      this.eat('No (')
      const a = this.cond()
      this.eat(')')
      return { type: 'logica_no', a }
    }
    let left: Condition
    if (this.peek('(')) {
      this.eat('(')
      left = this.cond()
      this.eat(')')
    } else if (this.peek('¿hay hueco adelante?')) {
      this.eat('¿hay hueco adelante?')
      left = { type: 'sensor_hueco_adelante' }
    } else if (this.peek('¿hay pared adelante?')) {
      this.eat('¿hay pared adelante?')
      left = { type: 'sensor_pared_adelante' }
    } else {
      this.eat('¿hay estrella adelante?')
      left = { type: 'sensor_estrella_adelante' }
    }
    if (this.peek('Y ')) {
      this.eat('Y ')
      return { type: 'logica_y', a: left, b: this.cond() }
    }
    if (this.peek('O ')) {
      this.eat('O ')
      return { type: 'logica_o', a: left, b: this.cond() }
    }
    return left
  }

  private block(): Instruction[] {
    this.eat('{')
    const list = this.list('}')
    this.eat('}')
    return list
  }

  list(end?: string): Instruction[] {
    const out: Instruction[] = []
    for (;;) {
      this.ws()
      if (this.i >= this.src.length || (end && this.peek(end))) return out
      out.push(this.stmt())
      if (this.peek(';')) this.eat(';')
    }
  }

  private stmt(): Instruction {
    if (this.peek('avanzar(')) {
      this.eat('avanzar(')
      const pasos = this.num()
      this.eat(')')
      return { type: 'avanzar', pasos }
    }
    if (this.peek('saltar(')) {
      this.eat('saltar(')
      const pasos = this.num()
      this.eat(')')
      return { type: 'saltar', pasos }
    }
    if (this.peek('repetir(')) {
      this.eat('repetir(')
      const veces = this.num()
      this.eat(')')
      return { type: 'repetir', veces, body: this.block() }
    }
    if (this.peek('si (')) {
      this.eat('si (')
      const condicion = this.cond()
      this.eat(')')
      const entonces = this.block()
      const sino = this.peek('sino') ? (this.eat('sino'), this.block()) : undefined
      return { type: 'si', condicion, entonces, sino }
    }
    if (this.peek('mostrar(')) {
      this.eat('mostrar(')
      const texto = this.str()
      this.eat(')')
      return { type: 'mostrar_mensaje', texto }
    }
    if (this.peek('crear variable')) {
      this.eat('crear variable')
      const nombre = this.str()
      this.eat('=')
      return { type: 'crear_variable_contador', nombre, valor: this.num() }
    }
    this.eat('cambiar variable')
    const nombre = this.str()
    this.eat('+')
    return { type: 'cambiar_variable', nombre, cantidad: this.num() }
  }
}

export function parseSolution(lines: string[]): Instruction[] {
  return lines.flatMap((line) => new Parser(line).list())
}

let failures = 0
for (const level of LEVELS) {
  for (const reto of level.retos) {
    const program = parseSolution(reto.solucionEjemplo)
    const tries = reto.randomMap ? 300 : 1
    let failed = 0
    let example = ''
    for (let t = 0; t < tries; t += 1) {
      const grid = resolveChallengeGrid(reto)
      const steps = runProgram(grid, program, { estrellasRequeridas: reto.estrellasRequeridas })
      const last = steps[steps.length - 1]
      if (last.status !== 'success') {
        failed += 1
        example ||= `${grid.join('')} → ${last.status} en casilla ${last.position}`
      }
    }
    const top = program.length
    const tooMany = reto.maxTopBlocks != null && top > reto.maxTopBlocks
    if (failed || tooMany) {
      failures += 1
      console.log(
        `✗ ${reto.retoId}: ${failed ? `falla ${failed}/${tries} (${example})` : ''}${
          tooMany ? ` usa ${top} bloques, máximo ${reto.maxTopBlocks}` : ''
        }`,
      )
    } else {
      console.log(`✓ ${reto.retoId}`)
    }
  }
}

if (failures) {
  console.log(`\n${failures} reto(s) con problemas.`)
  process.exit(1)
}
console.log('\nTodos los retos se pueden resolver.')
