const GameEngine = {
  level: null,
  grid: [],
  player: { row: 0, col: 0, dir: 1 },
  charEmoji: '👦',
  running: false,
  stepMode: false,
  commandQueue: [],
  currentIndex: 0,
  onUpdate: null,
  onWin: null,
  onFail: null,

  // dir: 0=up, 1=right, 2=down, 3=left
  DIR_DELTA: [
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 0, col: -1 }
  ],

  init(level, charEmoji) {
    this.level = level;
    this.charEmoji = charEmoji || '👦';
    this.grid = this.normalizeMap(level);
    const start = level.start || { row: 0, col: 0, dir: 1 };
    this.player = {
      row: start.row,
      col: start.col,
      dir: start.dir ?? 1
    };
    this.running = false;
    this.commandQueue = [];
    this.currentIndex = 0;
    this.render();
  },

  normalizeMap(level) {
    const size = level.gridSize;
    return Array.from({ length: size }, (_, r) => {
      const row = (level.map[r] || '').padEnd(size, 'g').slice(0, size);
      return row.split('');
    });
  },

  render(highlightCell = null) {
    const gridEl = document.getElementById('gameGrid');
    if (!gridEl || !this.level) return;

    const size = this.level.gridSize;
    const cellPx = Math.min(56, Math.floor(280 / size));
    const gridPx = cellPx * size + (size - 1) * 3;

    gridEl.style.gridTemplateColumns = `repeat(${size}, ${cellPx}px)`;
    gridEl.style.gridTemplateRows = `repeat(${size}, ${cellPx}px)`;
    gridEl.style.width = `${gridPx}px`;
    gridEl.style.height = `${gridPx}px`;
    gridEl.innerHTML = '';

    const pr = this.player.row;
    const pc = this.player.col;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        let tile = this.grid[r][c] || 'g';
        if (tile === 'T') tile = 'p';

        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.setAttribute('aria-label', `Celda ${r + 1}, ${c + 1}`);

        if (tile === 'p') cell.classList.add('path');
        else if (tile === 'w') cell.classList.add('water');
        else if (tile === 'b') cell.classList.add('bush');
        else if (tile === 't') cell.classList.add('tree');
        else if (tile === 'r') cell.classList.add('rock');
        else cell.classList.add('grass');

        if (this.level.start.row === r && this.level.start.col === c) {
          cell.classList.add('is-start');
        }

        if (highlightCell && highlightCell.row === r && highlightCell.col === c) {
          cell.style.outline = '3px solid var(--orange-accent)';
        }

        const rawTile = this.grid[r][c];
        const deco = TILE_EMOJI[rawTile];
        if (deco && !(pr === r && pc === c)) {
          const span = document.createElement('span');
          span.className = 'cell-deco';
          span.textContent = deco;
          cell.appendChild(span);
        }

        const isGoal = this.level.goal.row === r && this.level.goal.col === c;
        if (isGoal && !(pr === r && pc === c)) {
          const t = document.createElement('span');
          t.className = 'treasure';
          t.textContent = this.level.goalType === 'treasure' ? '📦' : '🚩';
          cell.appendChild(t);
        }

        if (pr === r && pc === c) {
          const wrap = document.createElement('div');
          wrap.className = 'character';
          wrap.setAttribute('aria-label', 'Tu personaje');
          const inner = document.createElement('div');
          inner.className = 'character-inner';
          const rot = [0, 90, 180, 270][this.player.dir];
          inner.style.transform = `rotate(${rot}deg)`;
          const face = document.createElement('span');
          face.textContent = this.charEmoji;
          face.setAttribute('role', 'img');
          inner.appendChild(face);
          wrap.appendChild(inner);
          cell.appendChild(wrap);

          if (isGoal) {
            const t = document.createElement('span');
            t.className = 'treasure';
            t.style.opacity = '0.45';
            t.style.position = 'absolute';
            t.style.bottom = '2px';
            t.style.right = '2px';
            t.style.fontSize = '0.9rem';
            t.textContent = '📦';
            cell.appendChild(t);
          }
        }

        gridEl.appendChild(cell);
      }
    }
  },

  isWalkable(row, col) {
    const size = this.level.gridSize;
    if (row < 0 || col < 0 || row >= size || col >= size) return false;
    const t = this.grid[row][col];
    return t === 'p' || t === 'T' || t === 'g';
  },

  buildQueue(program) {
    const queue = [];
    const walk = (blocks) => {
      for (const b of blocks) {
        if (b.blockId === 'move') {
          const steps = Number(b.params.steps) || 1;
          for (let i = 0; i < steps; i++) queue.push({ action: 'move' });
        } else if (b.blockId === 'turn') {
          queue.push({ action: 'turn', dir: b.params.dir || 'right' });
        } else if (b.blockId === 'repeat') {
          const times = Number(b.params.times) || 1;
          const sub = [];
          const collect = (blocks2) => {
            for (const x of blocks2) {
              if (x.blockId === 'move') {
                const n = Number(x.params.steps) || 1;
                for (let i = 0; i < n; i++) sub.push({ action: 'move' });
              } else if (x.blockId === 'turn') {
                sub.push({ action: 'turn', dir: x.params.dir || 'right' });
              } else if (x.blockId === 'repeat' && x.body) {
                const inner = [];
                const innerCollect = () => collect(x.body);
                innerCollect();
              }
            }
          };
          collect(b.body || []);
          for (let t = 0; t < times; t++) queue.push(...sub);
        } else if (b.blockId === 'wait') {
          queue.push({ action: 'wait', ms: (Number(b.params.secs) || 1) * 500 });
        }
      }
    };
    walk(program);
    return queue;
  },

  async run(program, stepMode = false) {
    if (this.running) return;
    this.running = true;
    this.stepMode = stepMode;
    this.player = { ...this.level.start };
    this.commandQueue = this.buildQueue(program);
    this.currentIndex = 0;
    this.render();

    while (this.currentIndex < this.commandQueue.length && this.running) {
      const cmd = this.commandQueue[this.currentIndex];
      await this.executeCommand(cmd);
      this.currentIndex++;
      if (this.stepMode) {
        this.running = false;
        break;
      }
      await this.delay(400);
    }

    if (!this.stepMode) {
      const won = this.checkWin();
      if (won) {
        AudioManager.success();
        this.onWin?.();
      } else if (this.running) {
        this.onFail?.();
      }
      this.running = false;
    } else {
      this.running = false;
      if (this.checkWin()) {
        AudioManager.success();
        this.onWin?.();
      }
    }
  },

  async executeCommand(cmd) {
    if (cmd.action === 'move') {
      const d = this.DIR_DELTA[this.player.dir];
      const nr = this.player.row + d.row;
      const nc = this.player.col + d.col;
      if (this.isWalkable(nr, nc)) {
        this.player.row = nr;
        this.player.col = nc;
        AudioManager.step();
        trackSkill('movimiento', 2);
      } else {
        AudioManager.error();
        this.running = false;
        return;
      }
    } else if (cmd.action === 'turn') {
      if (cmd.dir === 'right') this.player.dir = (this.player.dir + 1) % 4;
      else this.player.dir = (this.player.dir + 3) % 4;
      AudioManager.click();
      trackSkill('logica', 1);
    } else if (cmd.action === 'wait') {
      await this.delay(cmd.ms);
    }
    this.render();
    this.onUpdate?.();
  },

  checkWin() {
    return this.player.row === this.level.goal.row &&
           this.player.col === this.level.goal.col;
  },

  stop() {
    this.running = false;
    this.player = { ...this.level.start };
    this.render();
  },

  delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
};
