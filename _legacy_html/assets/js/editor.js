const BlockEditor = {
  stack: [],
  history: [],
  workspace: null,
  blockStackEl: null,
  draggedBlock: null,
  dragSource: null,

  init() {
    this.workspace = document.getElementById('workspace');
    this.blockStackEl = document.getElementById('blockStack');
    this.bindPalette();
    this.bindCategories();
    this.bindWorkspace();
    document.getElementById('btnUndo')?.addEventListener('click', () => this.undo());
    document.getElementById('btnClear')?.addEventListener('click', () => this.clear());
    this.loadDefaultScript();
  },

  bindCategories() {
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderPalette(btn.dataset.cat);
        AudioManager.click();
      });
    });
    this.renderPalette('control');
  },

  renderPalette(category) {
    const palette = document.getElementById('blockPalette');
    const ids = CATEGORY_BLOCKS[category] || [];
    if (!ids.length) {
      palette.innerHTML = '<p style="font-weight:600;color:var(--text-secondary);padding:0.5rem">Próximamente más bloques 💜</p>';
      return;
    }
    palette.innerHTML = ids.map(renderPaletteBlock).join('');
    palette.querySelectorAll('.palette-block').forEach(el => {
      el.addEventListener('dragstart', e => {
        e.dataTransfer.setData('block-id', el.dataset.blockId);
        e.dataTransfer.setData('source', 'palette');
        AudioManager.snap();
      });
    });
  },

  bindPalette() {
    document.getElementById('blockPalette')?.addEventListener('dragover', e => e.preventDefault());
  },

  bindWorkspace() {
    [this.workspace, this.blockStackEl].forEach(el => {
      if (!el) return;
      el.addEventListener('dragover', e => {
        e.preventDefault();
        el.classList.add('drag-over');
      });
      el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
      el.addEventListener('drop', e => this.handleDrop(e, this.stack, this.blockStackEl));
    });
  },

  handleDrop(e, targetArray, containerEl, parentBlock = null) {
    e.preventDefault();
    e.currentTarget?.classList?.remove('drag-over');

    const blockId = e.dataTransfer.getData('block-id');
    const source = e.dataTransfer.getData('source');
    const instanceId = e.dataTransfer.getData('instance-id');

    if (source === 'palette' && blockId) {
      if (blockId === 'event_start' && !parentBlock) {
        if (!this.stack.find(b => b.blockId === 'event_start')) {
          this.pushHistory();
          this.stack.unshift(createBlockInstance('event_start'));
          this.render();
          AudioManager.snap();
        }
        return;
      }
      if (blockId === 'event_start') return;
      this.pushHistory();
      const block = createBlockInstance(blockId);
      if (parentBlock) parentBlock.body.push(block);
      else {
        const startIdx = targetArray.findIndex(b => b.blockId === 'event_start');
        if (startIdx >= 0 && blockId !== 'event_start') targetArray.splice(startIdx + 1, 0, block);
        else targetArray.push(block);
      }
      this.render();
      AudioManager.snap();
      return;
    }

    if (source === 'workspace' && instanceId) {
      const moved = this.removeBlockById(instanceId);
      if (!moved) return;
      this.pushHistory();
      if (parentBlock) parentBlock.body.push(moved);
      else targetArray.push(moved);
      this.render();
    }
  },

  removeBlockById(id, arr = this.stack) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].id === id) return arr.splice(i, 1)[0];
      if (arr[i].body) {
        const found = this.removeBlockById(id, arr[i].body);
        if (found) return found;
      }
    }
    return null;
  },

  pushHistory() {
    this.history.push(JSON.stringify(this.stack.map(serializeBlock)));
    if (this.history.length > 20) this.history.shift();
  },

  undo() {
    if (!this.history.length) return;
    const prev = this.history.pop();
    this.stack = JSON.parse(prev).map(blockFromData).filter(Boolean);
    this.render();
    AudioManager.click();
  },

  clear() {
    if (!confirm('¿Quieres borrar todos los bloques?')) return;
    this.pushHistory();
    this.stack = [];
    this.render();
  },

  loadDefaultScript() {
    const level = LEVELS_DATA[window.currentLevelIndex ?? 2];
    if (level?.defaultScript) {
      this.stack = level.defaultScript.map(blockFromData).filter(Boolean);
    } else {
      this.stack = [createBlockInstance('event_start')];
    }
    this.render();
  },

  getProgram() {
    const start = this.stack.find(b => b.blockId === 'event_start');
    if (!start) return [];
    const idx = this.stack.indexOf(start);
    const after = this.stack.slice(idx + 1);
    const body = start.body?.length ? start.body : after;
    return body;
  },

  render() {
    if (!this.blockStackEl) return;
    this.blockStackEl.innerHTML = this.stack.map(b => this.renderBlock(b)).join('');
    this.bindBlockEvents();
  },

  renderBlock(block) {
    const def = BLOCK_DEFS[block.blockId];
    if (!def) return '';

    let paramsHtml = '';
    if (def.param && def.options) {
      paramsHtml = `<select data-param="${def.param}">${def.options.map(o =>
        `<option value="${o.value}" ${block.params[def.param] === o.value ? 'selected' : ''}>${o.label}</option>`
      ).join('')}</select>`;
    } else if (def.param) {
      paramsHtml = `<input type="number" data-param="${def.param}" value="${block.params[def.param] ?? def.default}" min="1" max="30">`;
      if (def.suffix) paramsHtml += ` ${def.suffix}`;
    }

    const delBtn = block.blockId !== 'event_start' ? '<button class="block-delete" aria-label="Eliminar">✕</button>' : '';

    if (def.type === 'hat') {
      return `<div class="workspace-block block-hat" draggable="true" data-instance-id="${block.id}" data-block-id="${block.blockId}">
        ${delBtn}${def.label}
      </div>`;
    }

    if (def.type === 'c-block') {
      const bodyHtml = (block.body || []).map(b => this.renderBlock(b)).join('') ||
        '<span style="opacity:0.6;font-size:0.85rem">Arrastra bloques aquí</span>';
      return `<div class="workspace-block block-c-block" data-instance-id="${block.id}">
        ${delBtn}
        <div class="block-c-header" draggable="true" data-instance-id="${block.id}" data-block-id="${block.blockId}">
          ${def.label} ${paramsHtml}
        </div>
        <div class="block-c-body" data-body-for="${block.id}">${bodyHtml}</div>
      </div>`;
    }

    return `<div class="workspace-block block-statement" draggable="true" data-instance-id="${block.id}" data-block-id="${block.blockId}">
      ${delBtn}${def.label} ${paramsHtml}
    </div>`;
  },

  bindBlockEvents() {
    this.blockStackEl.querySelectorAll('[draggable="true"]').forEach(el => {
      el.addEventListener('dragstart', e => {
        e.dataTransfer.setData('instance-id', el.dataset.instanceId);
        e.dataTransfer.setData('block-id', el.dataset.blockId);
        e.dataTransfer.setData('source', 'workspace');
        e.stopPropagation();
      });
    });

    this.blockStackEl.querySelectorAll('.block-c-body').forEach(bodyEl => {
      const parentId = bodyEl.dataset.bodyFor;
      bodyEl.addEventListener('dragover', e => { e.preventDefault(); bodyEl.classList.add('drag-over'); });
      bodyEl.addEventListener('dragleave', () => bodyEl.classList.remove('drag-over'));
      bodyEl.addEventListener('drop', e => {
        const parent = this.findBlock(parentId);
        if (parent) this.handleDrop(e, parent.body, bodyEl, parent);
        bodyEl.classList.remove('drag-over');
      });
    });

    this.blockStackEl.querySelectorAll('[data-param]').forEach(input => {
      input.addEventListener('change', e => {
        const blockEl = e.target.closest('[data-instance-id]');
        const block = this.findBlock(blockEl?.dataset?.instanceId) ||
          this.findBlock(blockEl?.closest('.block-c-block')?.querySelector('.block-c-header')?.dataset?.instanceId);
        if (block) {
          const param = e.target.dataset.param;
          block.params[param] = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
        }
      });
    });

    this.blockStackEl.querySelectorAll('.block-delete').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = e.target.closest('.workspace-block')?.dataset?.instanceId ||
          e.target.closest('.workspace-block')?.querySelector('[data-instance-id]')?.dataset?.instanceId;
        this.pushHistory();
        this.removeBlockById(id);
        this.render();
      });
    });
  },

  findBlock(id, arr = this.stack) {
    for (const b of arr) {
      if (b.id === id) return b;
      if (b.body) {
        const f = this.findBlock(id, b.body);
        if (f) return f;
      }
    }
    return null;
  }
};
