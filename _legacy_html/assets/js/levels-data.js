const CHARACTERS = ['👦', '👧', '🧒', '👩', '🤖', '🦕', '🐱'];

const LEVELS_DATA = [
  {
    id: 1,
    title: 'Primeros pasos',
    subtitle: 'Mover un personaje',
    icon: '👣',
    mission: 'Tu misión: Mueve a tu amigo 3 pasos hacia la derecha usando el bloque MOVER.',
    gridSize: 5,
    map: [
      'ggggg',
      'ggggg',
      'gpppg',
      'ggggg',
      'ggggg'
    ],
    start: { row: 2, col: 1, dir: 1 },
    goal: { row: 2, col: 3 },
    goalType: 'flag',
    hint: ['event_start', { type: 'move', steps: 1 }, { type: 'move', steps: 1 }, { type: 'move', steps: 1 }],
    starsEarned: 0
  },
  {
    id: 2,
    title: 'Hacia el tesoro',
    subtitle: 'Llegar al tesoro',
    icon: '💎',
    mission: 'Tu misión: Guía a tu amigo hasta el tesoro dorado. ¡Tú puedes!',
    gridSize: 5,
    map: [
      'ggggg',
      'gpppg',
      'gpppg',
      'gpppg',
      'ggTgg'
    ],
    start: { row: 1, col: 1, dir: 1 },
    goal: { row: 4, col: 2 },
    goalType: 'treasure',
    hint: null,
    starsEarned: 0
  },
  {
    id: 3,
    title: 'El camino del tesoro',
    subtitle: 'El camino del tesoro',
    icon: '🗺️',
    mission: 'Tu misión: Lleva a nuestro amigo hasta el tesoro. Usa los bloques para crear un camino.',
    gridSize: 6,
    map: [
      'ggbggg',
      'gppppg',
      'gbppwg',
      'gppppp',
      'gbpppg',
      'ggppgg'
    ],
    start: { row: 1, col: 1, dir: 1 },
    goal: { row: 3, col: 5 },
    goalType: 'treasure',
    defaultScript: [
      'event_start',
      { type: 'repeat', times: 4, body: [
        { type: 'move', steps: 1 },
        { type: 'turn', dir: 'right' },
        { type: 'move', steps: 1 }
      ]}
    ],
    starsEarned: 2
  },
  {
    id: 4,
    title: 'El laberinto',
    subtitle: 'Resolver laberintos',
    icon: '🏰',
    mission: 'Tu misión: Encuentra la salida del laberinto usando giros y movimientos.',
    gridSize: 6,
    map: [
      'gppppg',
      'gbppbg',
      'gppppg',
      'gbpbpg',
      'gpppbg',
      'gggTgg'
    ],
    start: { row: 0, col: 1, dir: 1 },
    goal: { row: 5, col: 3 },
    goalType: 'treasure',
    starsEarned: 0
  },
  {
    id: 5,
    title: 'Maestro de ciclos',
    subtitle: 'Usar ciclos y repeticiones',
    icon: '🔁',
    mission: 'Tu misión: Usa REPETIR para llegar al tesoro con menos bloques. ¡Eres muy listo!',
    gridSize: 6,
    map: [
      'gppppg',
      'gppppg',
      'gppppg',
      'gppppg',
      'gppppg',
      'gggTgg'
    ],
    start: { row: 0, col: 1, dir: 2 },
    goal: { row: 5, col: 3 },
    goalType: 'treasure',
    starsEarned: 0
  },
  {
    id: 6,
    title: 'Desafío lógico',
    subtitle: 'Resolver problemas lógicos',
    icon: '🧠',
    mission: 'Tu misión: Combina movimientos, giros y repeticiones para resolver el puzzle final.',
    gridSize: 6,
    map: [
      'gppbpg',
      'gbpppg',
      'gppwpg',
      'gppppg',
      'gbppbg',
      'gggTgg'
    ],
    start: { row: 0, col: 1, dir: 2 },
    goal: { row: 5, col: 3 },
    goalType: 'treasure',
    starsEarned: 0
  }
];

// g=grass, p=path, b=bush, w=water, T=treasure cell, t=tree, r=rock
const TILE_EMOJI = {
  g: '',
  p: '',
  b: '🌿',
  w: '💧',
  T: '📦',
  t: '🌳',
  r: '🪨'
};
