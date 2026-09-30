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

/**
 * Returns an optimal cell index for `player`, or null if the game is already over.
 * Equally good moves are picked at random so the computer does not play a fixed script;
 * `random` can be injected to make tests deterministic.
 */
export function findBestMove(board, player, random = Math.random) {
  if (findWinningLine(board)) return null;

  let bestMoves = [];
  let bestScore = -Infinity;

  for (const index of getAvailableMoves(board)) {
    // Scores are integers, so a window starting just below bestScore still reports
    // exact values for moves that tie with the best one found so far.
    const score = -negamax(
      place(board, index, player),
      otherPlayer(player),
      1,
      -Infinity,
      -(bestScore - 1),
    );
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [index];
    } else if (score === bestScore) {
      bestMoves.push(index);
    }
  }

  if (bestMoves.length === 0) return null;
  return bestMoves[Math.floor(random() * bestMoves.length)];
}
