import type { Block, Workspace, WorkspaceSvg } from 'blockly'
import type { Condition, Instruction } from '../game/types'

function readCondition(block: Block | null): Condition | null {
  if (!block) return null
  switch (block.type) {
    case 'sensor_hueco_adelante':
      return { type: 'sensor_hueco_adelante' }
    case 'sensor_pared_adelante':
      return { type: 'sensor_pared_adelante' }
    case 'sensor_estrella_adelante':
      return { type: 'sensor_estrella_adelante' }
    case 'logica_y': {
      const a = readCondition(block.getInputTargetBlock('A'))
      const b = readCondition(block.getInputTargetBlock('B'))
      if (!a || !b) return null
      return { type: 'logica_y', a, b }
    }
    case 'logica_o': {
      const a = readCondition(block.getInputTargetBlock('A'))
      const b = readCondition(block.getInputTargetBlock('B'))
      if (!a || !b) return null
      return { type: 'logica_o', a, b }
    }
    case 'logica_no': {
      const a = readCondition(block.getInputTargetBlock('A'))
      if (!a) return null
      return { type: 'logica_no', a }
    }
    default:
      return null
  }
}

function readStatement(block: Block | null): Instruction[] {
  const list: Instruction[] = []
  let current = block
  while (current) {
    const inst = readOne(current)
    if (inst) list.push(inst)
    current = current.getNextBlock()
  }
  return list
}

function readOne(block: Block): Instruction | null {
  switch (block.type) {
    case 'iniciar':
      return null
    case 'avanzar':
      return { type: 'avanzar', pasos: Number(block.getFieldValue('PASOS')) || 1 }
    case 'saltar':
      return { type: 'saltar', pasos: Number(block.getFieldValue('PASOS')) || 1 }
    case 'repetir':
      return {
        type: 'repetir',
        veces: Number(block.getFieldValue('VECES')) || 1,
        body: readStatement(block.getInputTargetBlock('HACER')),
      }
    case 'si': {
      const condicion = readCondition(block.getInputTargetBlock('CONDICION'))
      if (!condicion) return null
      return {
        type: 'si',
        condicion,
        entonces: readStatement(block.getInputTargetBlock('HACER')),
      }
    }
    case 'si_sino': {
      const condicion = readCondition(block.getInputTargetBlock('CONDICION'))
      if (!condicion) return null
      return {
        type: 'si',
        condicion,
        entonces: readStatement(block.getInputTargetBlock('HACER_SI')),
        sino: readStatement(block.getInputTargetBlock('HACER_SINO')),
      }
    }
    case 'mostrar_mensaje':
      return { type: 'mostrar_mensaje', texto: String(block.getFieldValue('TEXTO') || '') }
    case 'crear_variable_contador':
      return {
        type: 'crear_variable_contador',
        nombre: String(block.getFieldValue('NOMBRE') || 'puntaje'),
        valor: Number(block.getFieldValue('VALOR_INICIAL')) || 0,
      }
    case 'cambiar_variable':
      return {
        type: 'cambiar_variable',
        nombre: String(block.getFieldValue('NOMBRE') || 'puntaje'),
        cantidad: Number(block.getFieldValue('CANTIDAD')) || 1,
      }
    default:
      return null
  }
}

export function getIniciarBlock(workspace: Workspace): Block | null {
  const found = workspace.getBlocksByType('iniciar', false)
  return found[0] ?? null
}

/**
 * Lee el programa desde Iniciar:
 * 1) bloques DENTRO del hueco HACER (preferido)
 * 2) bloques enganchados debajo (compatibilidad)
 */
export function serializeWorkspace(workspace: Workspace): Instruction[] {
  const iniciar = getIniciarBlock(workspace)
  if (!iniciar) return []

  const inside = iniciar.getInputTargetBlock('HACER')
  if (inside) return readStatement(inside)

  const below = iniciar.getNextBlock()
  if (below) return readStatement(below)

  return []
}

/** Cuenta bloques en la cadena principal dentro/bajo Iniciar */
export function countTopBlocks(workspace: Workspace): number {
  const iniciar = getIniciarBlock(workspace)
  if (!iniciar) return 0
  let current =
    iniciar.getInputTargetBlock('HACER') ?? iniciar.getNextBlock()
  let n = 0
  while (current) {
    n += 1
    current = current.getNextBlock()
  }
  return n
}

export function ensureIniciarBlock(workspace: Workspace): Block {
  let iniciar = getIniciarBlock(workspace)

  // Si quedó la versión vieja (sin hueco HACER), recrearlo
  if (iniciar && !iniciar.getInput('HACER')) {
    iniciar.dispose(false)
    iniciar = null
  }

  if (!iniciar) {
    const svgWs = workspace as WorkspaceSvg
    iniciar = svgWs.newBlock('iniciar')
    const blockSvg = iniciar as Block & { initSvg: () => void; render: () => void }
    blockSvg.initSvg()
    blockSvg.render()
    iniciar.moveBy(40, 40)
    iniciar.setDeletable(false)
    iniciar.setMovable(true)
  } else if (iniciar.isDeletable()) {
    iniciar.setDeletable(false)
  }
  return iniciar
}
