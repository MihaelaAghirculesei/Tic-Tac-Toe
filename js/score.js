import { PLAYERS } from './game.js';

export const EMPTY_SCORE = Object.freeze({ [PLAYERS.O]: 0, [PLAYERS.X]: 0, draw: 0 });

const toCount = (value) => (Number.isInteger(value) && value >= 0 ? value : 0);

/** Turns anything read from storage into a valid score object. */
export function sanitizeScore(value) {
  const source = value && typeof value === 'object' ? value : {};
  return Object.fromEntries(Object.keys(EMPTY_SCORE).map((key) => [key, toCount(source[key])]));
}

export function recordResult(score, state) {
  if (state.winner) return { ...score, [state.winner]: score[state.winner] + 1 };
  if (state.isDraw) return { ...score, draw: score.draw + 1 };
  return score;
}
