import { saveJSON } from './storage.js';

// Must match the key read by the inline script in index.html.
const THEME_STORAGE_KEY = 'tic-tac-toe:theme';

/** The toggle is a "light mode" switch: pressed means the light theme is active. */
export function initThemeToggle(button) {
  const root = document.documentElement;

  const render = () => {
    button.setAttribute('aria-pressed', String(root.dataset.theme === 'light'));
  };

  button.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    saveJSON(THEME_STORAGE_KEY, root.dataset.theme);
    render();
  });

  render();
}
