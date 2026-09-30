import { saveJSON } from './storage.js';

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

  const render = () => {
    button.setAttribute('aria-pressed', String(root.dataset.theme === THEMES.LIGHT));
  };

  button.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    saveJSON(THEME_STORAGE_KEY, root.dataset.theme);
    render();
  });

  render();
}
