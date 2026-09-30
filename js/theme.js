import { loadJSON, saveJSON } from './storage.js';

// Also read by the inline script in index.html; tests/theme.test.js keeps both in sync.
export const THEME_STORAGE_KEY = 'tic-tac-toe:theme';
export const THEMES = Object.freeze({ LIGHT: 'light', DARK: 'dark' });

const isTheme = (value) => Object.values(THEMES).includes(value);

/** A stored choice wins; without one the page follows the system setting. */
export function resolveTheme(stored, systemPrefersLight) {
  if (isTheme(stored)) return stored;
  return systemPrefersLight ? THEMES.LIGHT : THEMES.DARK;
}

/** The toggle is a "light mode" switch: pressed means the light theme is active. */
export function initThemeToggle(button) {
  const root = document.documentElement;
  const systemLight = window.matchMedia('(prefers-color-scheme: light)');
  // Kept in memory as well, so the toggle still works when storage is unavailable.
  let stored = loadJSON(THEME_STORAGE_KEY, null);

  const apply = () => {
    root.dataset.theme = resolveTheme(stored, systemLight.matches);
    button.setAttribute('aria-pressed', String(root.dataset.theme === THEMES.LIGHT));
  };

  button.addEventListener('click', () => {
    stored = root.dataset.theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    saveJSON(THEME_STORAGE_KEY, stored);
    apply();
  });

  // Follow the OS switching light/dark (e.g. at sunset) while no choice is stored.
  systemLight.addEventListener('change', apply);

  // Keep other open tabs in sync.
  window.addEventListener('storage', (event) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    stored = loadJSON(THEME_STORAGE_KEY, null);
    apply();
  });

  apply();
}
