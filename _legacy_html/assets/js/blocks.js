const BLOCK_DEFS = {
  event_start: {
    type: 'hat',
    category: 'eventos',
    label: 'AL EMPEZAR A EJECUTAR',
    class: 'type-events'
  },
  move: {
    type: 'statement',
    category: 'movimiento',
    label: 'MOVER',
    param: 'steps',
    default: 1,
    suffix: 'PASOS',
    class: 'type-motion'
  },
  turn: {
    type: 'statement',
    category: 'movimiento',
    label: 'GIRAR',
    param: 'dir',
    options: [
      { value: 'right', label: 'DERECHA' },
      { value: 'left', label: 'IZQUIERDA' }
    ],
    class: 'type-motion'
  },
  repeat: {
    type: 'c-block',
    category: 'control',
    label: 'REPETIR',
    param: 'times',
    default: 4,
    suffix: 'VECES',
    class: 'type-control',
    body: []
  },
  say: {
    type: 'statement',
    category: 'apariencia',
    label: 'DECIR',
    param: 'text',
    default: '¡Hola!',
    class: 'type-appearance'
  },
  wait: {
    type: 'statement',
    category: 'control',
    label: 'ESPERAR',
    param: 'secs',
    default: 1,
    suffix: 'SEG',
    class: 'type-control'
  },
  sound_play: {
    type: 'statement',
    category: 'apariencia',
    label: 'TOCAR SONIDO',
    param: 'sound',
    options: [
      { value: 'pop', label: 'pop' },
      { value: 'win', label: 'victoria' }
    ],
    class: 'type-sound'
  },
  if_wall: {
    type: 'c-block',
    category: 'sensores',
    label: 'SI hay pared ENTONCES',
    class: 'type-control',
    body: []
  }
};

const CATEGORY_BLOCKS = {
  movimiento: ['move', 'turn'],
  apariencia: ['say', 'sound_play'],
  eventos: ['event_start'],
  control: ['repeat', 'wait', 'if_wall'],
  sensores: ['if_wall'],
  operadores: [],
  variables: [],
  misbloques: []
};

function createBlockInstance(blockId, overrides = {}) {
  const def = BLOCK_DEFS[blockId];
  if (!def) return null;
  const inst = {
    id: crypto.randomUUID?.() || `b_${Date.now()}_${Math.random()}`,
    blockId,
    ...JSON.parse(JSON.stringify(def)),
    params: {}
  };
  if (def.param) inst.params[def.param] = def.default ?? (def.options?.[0]?.value);
  if (def.type === 'c-block') inst.body = [];
  return { ...inst, ...overrides };
}

function blockFromData(data) {
  if (typeof data === 'string') return createBlockInstance(data);
  const b = createBlockInstance(data.type);
  if (!b) return null;
  if (data.steps !== undefined) b.params.steps = data.steps;
  if (data.times !== undefined) b.params.times = data.times;
  if (data.dir) b.params.dir = data.dir;
  if (data.body) b.body = data.body.map(blockFromData).filter(Boolean);
  return b;
}

function serializeBlock(block) {
  if (!block) return null;
  const o = { type: block.blockId };
  if (block.params?.steps !== undefined) o.steps = Number(block.params.steps);
  if (block.params?.times !== undefined) o.times = Number(block.params.times);
  if (block.params?.dir) o.dir = block.params.dir;
  if (block.body?.length) o.body = block.body.map(serializeBlock).filter(Boolean);
  return o;
}

function renderPaletteBlock(blockId) {
  const def = BLOCK_DEFS[blockId];
  if (!def) return '';
  let inner = def.label;
  if (def.param && def.options) {
    inner += ` <select disabled>${def.options.map(o => `<option>${o.label}</option>`).join('')}</select>`;
  } else if (def.param) {
    inner += ` <input type="number" value="${def.default}" min="1" max="20" disabled> `;
    if (def.suffix) inner += def.suffix;
  }
  return `<div class="palette-block ${def.class}" draggable="true" data-block-id="${blockId}">${inner}</div>`;
}
