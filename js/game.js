// Pure game logic: no DOM access, so it can be unit-tested with Node.

export const PLAYERS = Object.freeze({ O: 'O', X: 'X' });

export const BOARD_SIZE = 9;

export const WINNING_LINES = Object.freeze([
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]);

export function otherPlayer(player) {
  return player === PLAYERS.O ? PLAYERS.X : PLAYERS.O;
}

export function findWinningLine(board) {
  return (
    WINNING_LINES.find(([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c]) ??
    null
  );
}

export function getAvailableMoves(board) {
  return board.flatMap((cell, index) => (cell === null ? [index] : []));
}

export function createGame(startingPlayer = PLAYERS.O) {
  return {
    board: Array(BOARD_SIZE).fill(null),
    currentPlayer: startingPlayer,
    winner: null,
    winningLine: null,
    isDraw: false,
  };
}

export function isGameOver(state) {
  return state.winner !== null || state.isDraw;
}

export function canPlay(state, index) {
  return (
    !isGameOver(state) &&
    Number.isInteger(index) &&
    index >= 0 &&
    index < BOARD_SIZE &&
    state.board[index] === null
  );
}

/** Returns the next state; an invalid move returns the given state unchanged. */
export function makeMove(state, index) {
  if (!canPlay(state, index)) return state;

  const board = [...state.board];
  board[index] = state.currentPlayer;

  const winningLine = findWinningLine(board);
  const isDraw = !winningLine && board.every((cell) => cell !== null);
  const isOver = Boolean(winningLine) || isDraw;

  return {
    board,
    currentPlayer: isOver ? state.currentPlayer : otherPlayer(state.currentPlayer),
    winner: winningLine ? state.currentPlayer : null,
    winningLine,
    isDraw,
  };
}
