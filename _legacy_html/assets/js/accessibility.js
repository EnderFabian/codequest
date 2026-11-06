function applySettings() {
  const p = loadProgress();
  const s = p.settings || {};

  document.documentElement.setAttribute('data-theme', s.theme === 'dark' ? 'dark' : 'light');
  document.body.classList.toggle('reduce-motion', !!s.reduceMotion);

  const themes = {
    purple: { primary: '#7c5cbf', dark: '#5a3d9e' },
    blue: { primary: '#4a90d9', dark: '#357abd' },
    green: { primary: '#5cb85c', dark: '#449d44' }
  };
  const t = themes[s.colorTheme] || themes.purple;
  document.documentElement.style.setProperty('--purple-primary', t.primary);
  document.documentElement.style.setProperty('--purple-dark', t.dark);

  const themeToggle = document.getElementById('themeToggle');
  const reduceMotion = document.getElementById('reduceMotion');
  const soundToggle = document.getElementById('soundToggle');
  const musicToggle = document.getElementById('musicToggle');
  const colorTheme = document.getElementById('colorTheme');

  if (themeToggle) themeToggle.checked = s.theme === 'dark';
  if (reduceMotion) reduceMotion.checked = !!s.reduceMotion;
  if (soundToggle) soundToggle.checked = s.sound !== false;
  if (musicToggle) musicToggle.checked = !!s.music;
  if (colorTheme) colorTheme.value = s.colorTheme || 'purple';

  updateSoundIcon();
}

function updateSoundIcon() {
  const btn = document.getElementById('btnSound');
  if (btn) btn.textContent = AudioManager.enabled ? '🔊' : '🔇';
}

function bindAccessibilityUI() {
  const settingsPanel = document.getElementById('settingsPanel');
  const btnSettings = document.getElementById('btnSettings');
  const btnSound = document.getElementById('btnSound');

  btnSettings?.addEventListener('click', () => {
    settingsPanel?.classList.toggle('open');
    AudioManager.click();
  });

  btnSound?.addEventListener('click', () => {
    AudioManager.toggle();
    const p = loadProgress();
    p.settings.sound = AudioManager.enabled;
    saveProgress(p);
    updateSoundIcon();
    AudioManager.click();
  });

  document.getElementById('themeToggle')?.addEventListener('change', e => {
    const p = loadProgress();
    p.settings.theme = e.target.checked ? 'dark' : 'light';
    saveProgress(p);
    applySettings();
  });

  document.getElementById('reduceMotion')?.addEventListener('change', e => {
    const p = loadProgress();
    p.settings.reduceMotion = e.target.checked;
    saveProgress(p);
    applySettings();
  });

  document.getElementById('soundToggle')?.addEventListener('change', e => {
    AudioManager.enabled = e.target.checked;
    const p = loadProgress();
    p.settings.sound = e.target.checked;
    saveProgress(p);
    updateSoundIcon();
  });

  document.getElementById('musicToggle')?.addEventListener('change', e => {
    const p = loadProgress();
    p.settings.music = e.target.checked;
    saveProgress(p);
  });

  document.getElementById('colorTheme')?.addEventListener('change', e => {
    const p = loadProgress();
    p.settings.colorTheme = e.target.value;
    saveProgress(p);
    applySettings();
  });

  document.addEventListener('click', e => {
    if (settingsPanel?.classList.contains('open') &&
        !settingsPanel.contains(e.target) &&
        e.target !== btnSettings) {
      settingsPanel.classList.remove('open');
    }
  });

  applySettings();
}

document.addEventListener('DOMContentLoaded', () => {
  bindAccessibilityUI();
  startSession();
});

const mascotBtn = () => document.getElementById('mascotBtn');
const mascotTip = () => document.getElementById('mascotTip');

document.addEventListener('DOMContentLoaded', () => {
  mascotBtn()?.addEventListener('click', () => {
    mascotTip()?.classList.toggle('visible');
    AudioManager.speak('¡Hola! Soy Robi, tu mascota de CodeQuest. Estoy aquí para ayudarte.');
  });
});
