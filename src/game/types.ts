export type Tile = '.' | 'M' | '_' | '#' | '★' | 'F'

export type BlockType =
  | 'avanzar'
  | 'saltar'
  | 'repetir'
  | 'si'
  | 'si_sino'
  | 'sensor_hueco_adelante'
  | 'sensor_pared_adelante'
  | 'sensor_estrella_adelante'
  | 'logica_y'
  | 'logica_o'
  | 'logica_no'
  | 'crear_variable_contador'
  | 'cambiar_variable'
  | 'mostrar_mensaje'

export type Condition =
  | { type: 'sensor_hueco_adelante' }
  | { type: 'sensor_pared_adelante' }
  | { type: 'sensor_estrella_adelante' }
  | { type: 'logica_y'; a: Condition; b: Condition }
  | { type: 'logica_o'; a: Condition; b: Condition }
  | { type: 'logica_no'; a: Condition }

export type Instruction =
  | { type: 'avanzar'; pasos: number }
  | { type: 'saltar'; pasos: number }
  | { type: 'repetir'; veces: number; body: Instruction[] }
  | { type: 'si'; condicion: Condition; entonces: Instruction[]; sino?: Instruction[] }
  | { type: 'mostrar_mensaje'; texto: string }
  | { type: 'crear_variable_contador'; nombre: string; valor: number }
  | { type: 'cambiar_variable'; nombre: string; cantidad: number }

export type Challenge = {
  retoId: string
  grid: Tile[]
  /** Si true, el grid se regenera en cada intento */
  randomMap?: {
    largo: number
    nHuecos: [number, number]
    nParedes: [number, number]
    nEstrellas: [number, number]
  }
  instruccion: string
  solucionEjemplo: string[]
  maxTopBlocks?: number
  /** Estrellas mínimas requeridas al final (reto 4.2) */
  estrellasRequeridas?: number
}

export type LevelDef = {
  levelId: string
  levelName: string
  concepto: string
  bloquesDisponibles: BlockType[]
  insigniaAlCompletar: string
  retos: Challenge[]
}

export type StepResult = {
  position: number
  tiles: Tile[]
  starsCollected: number
  message?: string
  status: 'running' | 'success' | 'fail_hole' | 'fail_wall' | 'incomplete'
  /** Cómo llegó el personaje a esta casilla (para animarlo). */
  move?: 'walk' | 'jump'
  /** Pasos con el mismo jumpId son un solo salto (saltar n). */
  jumpId?: number
}

export type AttemptRecord = {
  id: string
  estudianteId: string
  challengeId: string
  fechaHora: string
  aciertos: boolean
  numeroIntentos: number
  tiempoResolucionSeg: number
  secuenciaBloquesUsada: string[]
}
