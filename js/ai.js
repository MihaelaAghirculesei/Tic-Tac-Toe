import { findWinningLine, getAvailableMoves, otherPlayer } from './game.js';

const WIN_SCORE = 10;

function place(board, index, player) {
  const next = [...board];
  next[index] = player;
  return next;
}

/**
 * Negamax with alpha-beta pruning, scored from the view of `player` (the side to move).
 * Faster wins score higher and slower losses score less badly, via `depth`.
 */
function negamax(board, player, depth, alpha, beta) {
  // A line on the board can only belong to the opponent, who moved last.
  if (findWinningLine(board)) return depth - WIN_SCORE;

  const moves = getAvailableMoves(board);
  if (moves.length === 0) return 0;

  let best = -Infinity;
  for (const index of moves) {
    const score = -negamax(
      place(board, index, player),
      otherPlayer(player),
      depth + 1,
      -beta,
      -alpha,
    );
    best = Math.max(best, score);
    alpha = Math.max(alpha, score);
    if (alpha >= beta) break;
  }
  return best;
}

/** Returns the optimal cell index for `player`, or null if the board is full. */
export function findBestMove(board, player) {
  let bestMove = null;
  let bestScore = -Infinity;

  for (const index of getAvailableMoves(board)) {
    const score = -negamax(
      place(board, index, player),
      otherPlayer(player),
      1,
      -Infinity,
      -bestScore,
    );
    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  }
  return bestMove;
}
