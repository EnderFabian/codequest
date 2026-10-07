import * as Blockly from 'blockly'
import type { BlockType } from '../game/types'

const BLOCK_DEFS = [
  {
    type: 'iniciar',
    message0: 'Iniciar %1 %2',
    args0: [
      { type: 'input_dummy' },
      { type: 'input_statement', name: 'HACER' },
    ],
    colour: '#4D96FF',
    tooltip: 'Pon aquí adentro todos tus bloques. Este es el inicio del programa.',
  },
  {
    type: 'avanzar',
    message0: 'Avanzar %1',
    args0: [{ type: 'field_number', name: 'PASOS', value: 1, min: 1, max: 10 }],
    previousStatement: null,
    nextStatement: null,
    colour: '#22A06B',
    tooltip: 'Mueve al personaje hacia adelante el número de casillas indicado.',
  },
  {
    type: 'saltar',
    message0: 'Saltar %1',
    args0: [{ type: 'field_number', name: 'PASOS', value: 1, min: 1, max: 3 }],
    previousStatement: null,
    nextStatement: null,
    colour: '#8B5CF6',
    tooltip: 'El personaje salta hacia adelante, pasando por encima de huecos o paredes.',
  },
  {
    type: 'repetir',
    message0: 'Repetir %1 veces %2 %3',
    args0: [
      { type: 'field_number', name: 'VECES', value: 2, min: 1, max: 20 },
      { type: 'input_dummy' },
      { type: 'input_statement', name: 'HACER' },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: '#F07C2A',
    tooltip: 'Repite las instrucciones de adentro el número de veces indicado.',
  },
  {
    type: 'si',
    message0: 'Si %1 entonces %2 %3',
    args0: [
      { type: 'input_value', name: 'CONDICION', check: 'Boolean' },
      { type: 'input_dummy' },
      { type: 'input_statement', name: 'HACER' },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: '#E0558F',
    tooltip: 'Si la condición es verdadera, ejecuta las instrucciones de adentro.',
  },
  {
    type: 'si_sino',
    message0: 'Si %1 entonces %2 %3 si no %4 %5',
    args0: [
      { type: 'input_value', name: 'CONDICION', check: 'Boolean' },
      { type: 'input_dummy' },
      { type: 'input_statement', name: 'HACER_SI' },
      { type: 'input_dummy' },
      { type: 'input_statement', name: 'HACER_SINO' },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: '#E0558F',
    tooltip: 'Si es verdadero ejecuta la primera parte; si no, la segunda.',
  },
  {
    type: 'sensor_hueco_adelante',
    message0: '¿Hay hueco adelante?',
    output: 'Boolean',
    colour: '#0E9AA7',
    tooltip: 'Verdadero si la siguiente casilla es un hueco.',
  },
  {
    type: 'sensor_pared_adelante',
    message0: '¿Hay pared adelante?',
    output: 'Boolean',
    colour: '#0E9AA7',
    tooltip: 'Verdadero si la siguiente casilla es una pared.',
  },
  {
    type: 'sensor_estrella_adelante',
    message0: '¿Hay estrella adelante?',
    output: 'Boolean',
    colour: '#0E9AA7',
    tooltip: 'Verdadero si la siguiente casilla tiene una estrella.',
  },
  {
    type: 'logica_y',
    message0: '%1 Y %2',
    args0: [
      { type: 'input_value', name: 'A', check: 'Boolean' },
      { type: 'input_value', name: 'B', check: 'Boolean' },
    ],
    output: 'Boolean',
    colour: '#3F6FD8',
  },
  {
    type: 'logica_o',
    message0: '%1 O %2',
    args0: [
      { type: 'input_value', name: 'A', check: 'Boolean' },
      { type: 'input_value', name: 'B', check: 'Boolean' },
    ],
    output: 'Boolean',
    colour: '#3F6FD8',
  },
  {
    type: 'logica_no',
    message0: 'No %1',
    args0: [{ type: 'input_value', name: 'A', check: 'Boolean' }],
    output: 'Boolean',
    colour: '#3F6FD8',
  },
  {
    type: 'crear_variable_contador',
    message0: 'crear variable %1 = %2',
    args0: [
      { type: 'field_input', name: 'NOMBRE', text: 'puntaje' },
      { type: 'field_number', name: 'VALOR_INICIAL', value: 0 },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: '#B45309',
  },
  {
    type: 'cambiar_variable',
    message0: 'cambiar %1 en %2',
    args0: [
      { type: 'field_input', name: 'NOMBRE', text: 'puntaje' },
      { type: 'field_number', name: 'CANTIDAD', value: 1 },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: '#B45309',
  },
  {
    type: 'mostrar_mensaje',
    message0: 'mostrar mensaje %1',
    args0: [{ type: 'field_input', name: 'TEXTO', text: '¡Genial!' }],
    previousStatement: null,
    nextStatement: null,
    colour: '#5B6CF0',
  },
]

let definedVersion = 0
const BLOCKS_VERSION = 4

export function ensureBlocksDefined() {
  if (definedVersion === BLOCKS_VERSION) return
  for (const def of BLOCK_DEFS) {
    delete Blockly.Blocks[def.type]
  }
  Blockly.defineBlocksWithJsonArray(BLOCK_DEFS)
  definedVersion = BLOCKS_VERSION
}

const LABELS: Record<BlockType, string> = {
  avanzar: 'Avanzar',
  saltar: 'Saltar',
  repetir: 'Repetir',
  si: 'Si',
  si_sino: 'Si / Si no',
  sensor_hueco_adelante: '¿Hueco adelante?',
  sensor_pared_adelante: '¿Pared adelante?',
  sensor_estrella_adelante: '¿Estrella adelante?',
  logica_y: 'Y',
  logica_o: 'O',
  logica_no: 'No',
  crear_variable_contador: 'Crear variable',
  cambiar_variable: 'Cambiar variable',
  mostrar_mensaje: 'Mostrar mensaje',
}

export function buildToolbox(available: BlockType[]): Blockly.utils.toolbox.ToolboxDefinition {
  return {
    kind: 'flyoutToolbox',
    contents: available.map((type) => ({
      kind: 'block',
      type,
      // Blockly usa el type; el label ayuda en accesibilidad del flyout
      ...({} as object),
    })),
  }
}

export function blockLabel(type: BlockType) {
  return LABELS[type]
}
