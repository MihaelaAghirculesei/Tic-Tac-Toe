import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { PLAYERS, createGame, makeMove } from '../js/game.js';
import { EMPTY_SCORE, recordResult, sanitizeScore } from '../js/score.js';

const play = (moves) => moves.reduce(makeMove, createGame());

describe('recordResult', () => {
  it('counts a win for the winner', () => {
    const score = recordResult(EMPTY_SCORE, play([0, 3, 1, 4, 2]));
    assert.deepEqual(score, { [PLAYERS.O]: 1, [PLAYERS.X]: 0, draw: 0 });
  });

  it('counts a draw', () => {
    const score = recordResult(EMPTY_SCORE, play([0, 1, 2, 4, 3, 5, 7, 6, 8]));
    assert.deepEqual(score, { [PLAYERS.O]: 0, [PLAYERS.X]: 0, draw: 1 });
  });

  it('leaves the score untouched while the game is running', () => {
    assert.equal(recordResult(EMPTY_SCORE, play([0])), EMPTY_SCORE);
  });
});

describe('sanitizeScore', () => {
  it('keeps valid counts', () => {
    assert.deepEqual(sanitizeScore({ O: 2, X: 1, draw: 3 }), { O: 2, X: 1, draw: 3 });
  });

  it('repairs corrupted or foreign data', () => {
    assert.deepEqual(sanitizeScore(null), EMPTY_SCORE);
    assert.deepEqual(sanitizeScore('oops'), EMPTY_SCORE);
    assert.deepEqual(sanitizeScore({ O: -1, X: 1.5, draw: '4', extra: 9 }), EMPTY_SCORE);
  });
});
