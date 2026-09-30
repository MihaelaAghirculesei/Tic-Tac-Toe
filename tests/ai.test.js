import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { findBestMove } from '../js/ai.js';
import { PLAYERS, createGame, getAvailableMoves, isGameOver, makeMove } from '../js/game.js';

const { O, X } = PLAYERS;
const _ = null;

describe('findBestMove', () => {
  it('takes an immediate win', () => {
    // X X _ / O O _ / _ _ _
    assert.equal(findBestMove([X, X, _, O, O, _, _, _, _], X), 2);
  });

  it('blocks an immediate threat', () => {
    // O O _ / X _ _ / _ _ _
    assert.equal(findBestMove([O, O, _, X, _, _, _, _, _], X), 2);
  });

  it('prefers winning over blocking', () => {
    // O O _ / X X _ / O _ _  -> X wins at 5 instead of blocking 2
    assert.equal(findBestMove([O, O, _, X, X, _, O, _, _], X), 5);
  });

  it('returns null on a full board', () => {
    assert.equal(findBestMove([O, X, O, O, X, X, X, O, O], X), null);
  });

  it('returns null when the game is already won', () => {
    assert.equal(findBestMove([X, X, X, O, O, _, _, _, _], O), null);
  });

  it('chooses randomly among equally good moves', () => {
    // On an empty board every opening leads to a draw, so all nine cells tie.
    const empty = Array(9).fill(null);
    assert.equal(
      findBestMove(empty, X, () => 0),
      0,
    );
    assert.equal(
      findBestMove(empty, X, () => 0.999),
      8,
    );
  });

  it('never picks a worse move to add variety', () => {
    // Only cell 2 wins immediately, whatever the random value is.
    for (const r of [0, 0.5, 0.999]) {
      assert.equal(
        findBestMove([X, X, _, O, O, _, _, _, _], X, () => r),
        2,
      );
    }
  });

  it('never loses, whatever the opponent plays', () => {
    // Explore every possible opponent line, with the computer on either side.
    const explore = (state, computer) => {
      if (isGameOver(state)) {
        assert.notEqual(state.winner, computer === X ? O : X, `lost: ${state.board}`);
        return;
      }
      if (state.currentPlayer === computer) {
        explore(makeMove(state, findBestMove(state.board, computer)), computer);
      } else {
        for (const index of getAvailableMoves(state.board)) {
          explore(makeMove(state, index), computer);
        }
      }
    };

    explore(createGame(O), X); // computer moves second
    explore(createGame(X), X); // computer moves first
  });
});
