import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { THEMES, THEME_STORAGE_KEY, resolveTheme, themeToStore } from '../js/theme.js';

describe('resolveTheme', () => {
  it('uses a stored choice over the system setting', () => {
    assert.equal(resolveTheme(THEMES.DARK, true), THEMES.DARK);
    assert.equal(resolveTheme(THEMES.LIGHT, false), THEMES.LIGHT);
  });

  it('follows the system without a valid stored choice', () => {
    assert.equal(resolveTheme(null, true), THEMES.LIGHT);
    assert.equal(resolveTheme(null, false), THEMES.DARK);
    assert.equal(resolveTheme('high-contrast', true), THEMES.LIGHT);
  });
});

describe('themeToStore', () => {
  it('stores a choice that differs from the system', () => {
    assert.equal(themeToStore(THEMES.DARK, true), THEMES.DARK);
    assert.equal(themeToStore(THEMES.LIGHT, false), THEMES.LIGHT);
  });

  it('clears the choice when it matches the system again', () => {
    assert.equal(themeToStore(THEMES.LIGHT, true), null);
    assert.equal(themeToStore(THEMES.DARK, false), null);
  });
});

describe('inline theme bootstrap', () => {
  it('reads the same storage key as theme.js', () => {
    // The pre-paint script in index.html cannot import modules, so guard the duplicate.
    const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    assert.ok(html.includes(`'${THEME_STORAGE_KEY}'`), `index.html must read ${THEME_STORAGE_KEY}`);
  });
});
