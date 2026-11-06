let currentLevelIndex = 2;
const MAX_ATTEMPTS = 5;

function getQueryLevel() {
  const p = new URLSearchParams(location.search);
  const n = parseInt(p.get('nivel'), 10);
  if (n >= 1 && n <= LEVELS_DATA.length) return n - 1;
  return 2;
}

function initLevelPicker() {
  const picker = document.getElementById('levelPicker');
  picker.innerHTML = LEVELS_DATA.map((l, i) => {
    const prog = getLevelProgress(l.id);
    const stars = prog.stars || 0;
    return `<button class="level-picker-btn ${i === currentLevelIndex ? 'active' : ''}" data-level="${i}" role="tab">
      ${l.icon} Nivel ${i + 1}${stars ? ' ' + '★'.repeat(stars) : ''}
    </button>`;
  }).join('');

  picker.querySelectorAll('.level-picker-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLevelIndex = Number(btn.dataset.level);
      loadLevel(currentLevelIndex);
      initLevelPicker();
    });
  });
}

function initCharacters() {
  const list = document.getElementById('charList');
  const p = loadProgress();
  const selected = p.avatar || '👦';

  list.innerHTML = CHARACTERS.map(c => `
    <button class="char-option ${c === selected ? 'selected' : ''}" data-char="${c}" role="option" aria-selected="${c === selected}">
      ${c}
    </button>
  `).join('');

  list.querySelectorAll('.char-option').forEach(btn => {
    btn.addEventListener('click', () => {
      list.querySelectorAll('.char-option').forEach(b => {
        b.classList.remove('selected');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('selected');
      btn.setAttribute('aria-selected', 'true');
      const prog = loadProgress();
      prog.avatar = btn.dataset.char;
      saveProgress(prog);
      document.getElementById('headerAvatar').textContent = btn.dataset.char;
      GameEngine.charEmoji = btn.dataset.char;
      GameEngine.render();
      AudioManager.click();
    });
  });

  document.getElementById('headerAvatar').textContent = selected;
  return selected;
}

function loadLevel(index) {
  currentLevelIndex = index;
  window.currentLevelIndex = index;
  const level = LEVELS_DATA[index];
  const prog = getLevelProgress(level.id);

  document.getElementById('levelTitle').textContent = `Nivel ${level.id}: ${level.title}`;
  document.getElementById('missionText').textContent = level.mission;

  const stars = prog.stars ?? level.starsEarned ?? 0;
  document.getElementById('levelStars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);

  const progress = prog.progress ?? (index === 2 ? 66 : 0);
  document.getElementById('progressFill').style.width = `${progress}%`;
  document.getElementById('progressPct').textContent = `${progress}%`;

  const attempts = prog.attempts ?? 3;
  document.getElementById('attemptsCount').textContent = attempts;

  const avatar = loadProgress().avatar || '👦';
  GameEngine.init(level, avatar);

  BlockEditor.stack = [];
  if (level.defaultScript) {
    BlockEditor.stack = level.defaultScript.map(blockFromData).filter(Boolean);
  } else {
    BlockEditor.stack = [createBlockInstance('event_start')];
  }
  BlockEditor.render();

  history.replaceState(null, '', `?nivel=${level.id}`);
}

function showToast(msg) {
  const t = document.getElementById('toastPositive');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

function onLevelWin() {
  const level = LEVELS_DATA[currentLevelIndex];
  const prog = getLevelProgress(level.id);
  const newStars = Math.min(3, (prog.stars || 0) + 1);
  const newProgress = Math.min(100, (prog.progress || 0) + 34);

  updateLevelProgress(level.id, {
    completed: newProgress >= 100,
    stars: newStars,
    progress: newProgress,
    attempts: prog.attempts ?? 3
  });

  document.getElementById('levelStars').textContent = '★'.repeat(newStars) + '☆'.repeat(3 - newStars);
  document.getElementById('progressFill').style.width = `${newProgress}%`;
  document.getElementById('progressPct').textContent = `${newProgress}%`;

  trackSkill('movimiento', 5);
  trackSkill('repeticion', 5);
  logActivity('success', `Completó intento en nivel ${level.id}`);

  const messages = [
    '¡Increíble! ¡Lo lograste! 🌟',
    '¡Eres un programador estrella! ⭐',
    '¡Tu cerebro es súper poderoso! 🧠💜',
    '¡Cada paso te hace más fuerte! 💪'
  ];
  showToast(messages[Math.floor(Math.random() * messages.length)]);

  if (newStars >= 1) addAchievement(`level_${level.id}`, `Nivel ${level.id} completado`);
  if (newProgress >= 100) addAchievement(`master_${level.id}`, `Maestro del nivel ${level.id}`);

  initLevelPicker();
}

function onLevelFail() {
  const level = LEVELS_DATA[currentLevelIndex];
  const prog = getLevelProgress(level.id);
  const attempts = Math.max(0, (prog.attempts ?? 3) - 1);
  updateLevelProgress(level.id, { attempts });
  document.getElementById('attemptsCount').textContent = attempts;
  logActivity('retry', `Reintentó nivel ${level.id}`);
  showToast('¡No te rindas! Inténtalo otra vez. Tú puedes. 💜');
  AudioManager.error();
}

document.addEventListener('DOMContentLoaded', () => {
  currentLevelIndex = getQueryLevel();
  initCharacters();
  BlockEditor.init();
  initLevelPicker();
  loadLevel(currentLevelIndex);

  document.getElementById('btnRun')?.addEventListener('click', async () => {
    AudioManager.click();
    addAchievement('first_step', 'Primer paso');
    const program = BlockEditor.getProgram();
    if (!program.length) {
      showToast('Arrastra bloques debajo de «AL EMPEZAR A EJECUTAR»');
      return;
    }
    GameEngine.onWin = onLevelWin;
    GameEngine.onFail = onLevelFail;
    await GameEngine.run(program, false);
  });

  document.getElementById('btnStep')?.addEventListener('click', async () => {
    AudioManager.click();
    const program = BlockEditor.getProgram();
    GameEngine.onWin = onLevelWin;
    GameEngine.onFail = onLevelFail;
    await GameEngine.run(program, true);
  });

  document.getElementById('btnStop')?.addEventListener('click', () => {
    GameEngine.stop();
    AudioManager.click();
  });

  document.getElementById('btnSpeakMission')?.addEventListener('click', () => {
    const text = document.getElementById('missionText').textContent;
    AudioManager.speak(text);
  });

  document.getElementById('btnHelp')?.addEventListener('click', () => {
    const level = LEVELS_DATA[currentLevelIndex];
    AudioManager.speak('¡Hola! Soy Robi. ' + level.mission + ' Puedes arrastrar bloques azules de movimiento y naranjas de repetición.');
    showToast('💡 Arrastra bloques al área de programación. Usa REPETIR para hacer acciones varias veces.');
  });
});
