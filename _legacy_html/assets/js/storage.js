const STORAGE_KEY = 'codequest_progress';

const defaultProgress = () => ({
  playerName: 'Explorador',
  avatar: '👦',
  totalTimeMinutes: 0,
  sessionStart: null,
  levels: {},
  achievements: [],
  emotionalLog: [],
  settings: {
    theme: 'light',
    sound: true,
    music: false,
    reduceMotion: false,
    colorTheme: 'purple'
  },
  skills: {
    movimiento: 0,
    repeticion: 0,
    condicionales: 0,
    logica: 0
  }
});

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    return { ...defaultProgress(), ...JSON.parse(raw) };
  } catch {
    return defaultProgress();
  }
}

function saveProgress(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  if (typeof syncToFirebase === 'function') syncToFirebase(data);
}

function getLevelProgress(levelId) {
  const p = loadProgress();
  return p.levels[levelId] || {
    completed: false,
    stars: 0,
    progress: 0,
    attempts: 3,
    bestTime: null
  };
}

function updateLevelProgress(levelId, updates) {
  const p = loadProgress();
  p.levels[levelId] = { ...getLevelProgress(levelId), ...updates };
  saveProgress(p);
  return p.levels[levelId];
}

function addAchievement(id, name) {
  const p = loadProgress();
  if (!p.achievements.find(a => a.id === id)) {
    p.achievements.push({ id, name, date: new Date().toISOString() });
    saveProgress(p);
  }
}

function logActivity(type, detail) {
  const p = loadProgress();
  p.emotionalLog = p.emotionalLog || [];
  p.emotionalLog.unshift({
    type,
    detail,
    date: new Date().toISOString()
  });
  if (p.emotionalLog.length > 50) p.emotionalLog.pop();
  saveProgress(p);
}

function trackSkill(skill, amount = 1) {
  const p = loadProgress();
  if (p.skills[skill] !== undefined) {
    p.skills[skill] = Math.min(100, (p.skills[skill] || 0) + amount);
    saveProgress(p);
  }
}

function startSession() {
  const p = loadProgress();
  p.sessionStart = Date.now();
  saveProgress(p);
}

function endSession() {
  const p = loadProgress();
  if (p.sessionStart) {
    const mins = Math.round((Date.now() - p.sessionStart) / 60000);
    p.totalTimeMinutes = (p.totalTimeMinutes || 0) + mins;
    p.sessionStart = null;
    saveProgress(p);
  }
}

window.addEventListener('beforeunload', endSession);
