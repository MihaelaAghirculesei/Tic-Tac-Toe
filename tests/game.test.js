import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  PLAYERS,
  canPlay,
  createGame,
  findWinningLine,
  getAvailableMoves,
  isGameOver,
  makeMove,
  otherPlayer,
} from '../js/game.js';

const play = (moves, startingPlayer) => moves.reduce(makeMove, createGame(startingPlayer));

describe('createGame', () => {
  it('starts with an empty board and O to move', () => {
    const state = createGame();
    assert.deepEqual(state.board, Array(9).fill(null));
    assert.equal(state.currentPlayer, PLAYERS.O);
    assert.equal(isGameOver(state), false);
  });

  it('accepts a custom starting player', () => {
    assert.equal(createGame(PLAYERS.X).currentPlayer, PLAYERS.X);
  });
});

describe('makeMove', () => {
  it('places the current player and switches turns', () => {
    const state = makeMove(createGame(), 4);
    assert.equal(state.board[4], PLAYERS.O);
    assert.equal(state.currentPlayer, PLAYERS.X);
  });

  it('does not mutate the previous state', () => {
    const initial = createGame();
    makeMove(initial, 0);
    assert.equal(initial.board[0], null);
  });

  it('ignores moves on occupied or out-of-range cells', () => {
    const state = makeMove(createGame(), 0);
    assert.equal(makeMove(state, 0), state);
    assert.equal(makeMove(state, -1), state);
    assert.equal(makeMove(state, 9), state);
    assert.equal(makeMove(state, 1.5), state);
  });

  it('detects a win and keeps the winner as current player', () => {
    // O: 0, 1, 2 — X: 3, 4
    const state = play([0, 3, 1, 4, 2]);
    assert.equal(state.winner, PLAYERS.O);
    assert.deepEqual(state.winningLine, [0, 1, 2]);
    assert.equal(state.currentPlayer, PLAYERS.O);
    assert.equal(isGameOver(state), true);
  });

  it('detects a draw', () => {
    // O X O / O X X / X O O
    const state = play([0, 1, 2, 4, 3, 5, 7, 6, 8]);
    assert.equal(state.winner, null);
    assert.equal(state.isDraw, true);
    assert.equal(isGameOver(state), true);
  });

  it('prefers a win over a draw on the last move', () => {
    // O X O / X O X / X O O  -> O wins on the diagonal with the ninth move
    const state = play([0, 1, 2, 3, 4, 5, 7, 6, 8]);
    assert.equal(state.winner, PLAYERS.O);
    assert.equal(state.isDraw, false);
  });

  it('rejects moves once the game is over', () => {
    const state = play([0, 3, 1, 4, 2]);
    assert.equal(canPlay(state, 8), false);
    assert.equal(makeMove(state, 8), state);
  });
});

describe('helpers', () => {
  it('findWinningLine finds every line type', () => {
    for (const line of [
      [3, 4, 5],
      [1, 4, 7],
      [2, 4, 6],
    ]) {
      const board = Array(9).fill(null);
      line.forEach((i) => (board[i] = PLAYERS.X));
      assert.deepEqual(findWinningLine(board), line);
    }
  });

  it('getAvailableMoves lists empty cells', () => {
    assert.deepEqual(getAvailableMoves(play([0, 4, 8]).board), [1, 2, 3, 5, 6, 7]);
  });

  it('otherPlayer toggles', () => {
    assert.equal(otherPlayer(PLAYERS.O), PLAYERS.X);
    assert.equal(otherPlayer(PLAYERS.X), PLAYERS.O);
  });
});
