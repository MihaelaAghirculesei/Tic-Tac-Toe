import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { neighbourIndex } from '../js/view.js';

describe('neighbourIndex', () => {
  it('moves one cell in each direction from the centre', () => {
    assert.equal(neighbourIndex(4, 'ArrowLeft'), 3);
    assert.equal(neighbourIndex(4, 'ArrowRight'), 5);
    assert.equal(neighbourIndex(4, 'ArrowUp'), 1);
    assert.equal(neighbourIndex(4, 'ArrowDown'), 7);
  });

  it('stays on the board edge instead of wrapping to another row', () => {
    assert.equal(neighbourIndex(2, 'ArrowRight'), 2);
    assert.equal(neighbourIndex(3, 'ArrowLeft'), 3);
    assert.equal(neighbourIndex(0, 'ArrowUp'), 0);
    assert.equal(neighbourIndex(8, 'ArrowDown'), 8);
  });

  it('ignores other keys', () => {
    assert.equal(neighbourIndex(4, 'Enter'), null);
    assert.equal(neighbourIndex(4, 'a'), null);
  });
});
