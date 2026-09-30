import { BOARD_SIZE, GRID_SIZE, PLAYERS, isGameOver } from './game.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
// The winning-line overlay uses a 300x300 viewBox, i.e. 100 units per cell,
// so it scales with the board instead of relying on pixel measurements.
const CELL_UNITS = 100;

const MARKS = {
  [PLAYERS.O]: `<svg class="mark mark--o" viewBox="0 0 70 70" aria-hidden="true">
        <circle cx="35" cy="35" r="30" pathLength="1" />
      </svg>`,
  [PLAYERS.X]: `<svg class="mark mark--x" viewBox="0 0 70 70" aria-hidden="true">
        <line x1="10" y1="10" x2="60" y2="60" pathLength="1" />
        <line x1="60" y1="10" x2="10" y2="60" pathLength="1" />
      </svg>`,
};

function cellCenter(index) {
  return {
    x: (index % GRID_SIZE) * CELL_UNITS + CELL_UNITS / 2,
    y: Math.floor(index / GRID_SIZE) * CELL_UNITS + CELL_UNITS / 2,
  };
}

const ARROW_STEPS = {
  ArrowLeft: { row: 0, col: -1 },
  ArrowRight: { row: 0, col: 1 },
  ArrowUp: { row: -1, col: 0 },
  ArrowDown: { row: 1, col: 0 },
};

/** Index of the cell an arrow key leads to; stays put at the board edge. Null for other keys. */
export function neighbourIndex(index, key) {
  const step = ARROW_STEPS[key];
  if (!step) return null;

  const clamp = (value) => Math.min(Math.max(value, 0), GRID_SIZE - 1);
  const row = clamp(Math.floor(index / GRID_SIZE) + step.row);
  const col = clamp((index % GRID_SIZE) + step.col);
  return row * GRID_SIZE + col;
}

function createCell(index) {
  const cell = document.createElement('button');
  cell.type = 'button';
  cell.className = 'cell';
  cell.dataset.index = String(index);
  // Roving tabindex: the board is a single Tab stop, arrow keys move inside it.
  cell.tabIndex = index === 0 ? 0 : -1;
  return cell;
}

export class BoardView {
  constructor(boardElement, lineElement) {
    this.boardElement = boardElement;
    this.lineElement = lineElement;
    this.cells = Array.from({ length: BOARD_SIZE }, (_, index) => createCell(index));
    this.boardElement.replaceChildren(...this.cells);

    this.boardElement.addEventListener('focusin', (event) => {
      const cell = event.target.closest('.cell');
      if (cell) this.setTabStop(cell);
    });
  }

  setTabStop(activeCell) {
    for (const cell of this.cells) cell.tabIndex = cell === activeCell ? 0 : -1;
  }

  onCellSelect(handler) {
    this.boardElement.addEventListener('click', (event) => {
      const cell = event.target.closest('.cell');
      if (cell) handler(Number(cell.dataset.index));
    });
  }

  /** Arrow keys move the focus across the grid. */
  enableArrowNavigation() {
    this.boardElement.addEventListener('keydown', (event) => {
      // Leave modified arrows (e.g. Alt+Left = back) to the browser and assistive tech.
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

      const cell = event.target.closest('.cell');
      const target = cell ? neighbourIndex(Number(cell.dataset.index), event.key) : null;
      if (target === null) return;

      event.preventDefault();
      this.cells[target].focus();
    });
  }

  focusFirstCell() {
    this.cells[0].focus({ preventScroll: true });
  }

  /** `locked` blocks input without ending the game, e.g. while the computer is moving. */
  render(state, { locked = false } = {}) {
    const gameOver = isGameOver(state);

    this.cells.forEach((cell, index) => {
      const player = state.board[index];

      // Only touch the markup when the cell changes, so the draw animation runs once.
      if ((cell.dataset.player ?? null) !== player) {
        cell.innerHTML = player ? MARKS[player] : '';
        if (player) cell.dataset.player = player;
        else delete cell.dataset.player;
      }

      cell.setAttribute('aria-label', `Feld ${index + 1}, ${player ?? 'leer'}`);
      cell.setAttribute('aria-disabled', String(gameOver || locked || player !== null));
    });

    this.boardElement.classList.toggle('is-over', gameOver);
    this.boardElement.setAttribute('aria-busy', String(locked));
    this.boardElement.classList.toggle('is-draw', state.isDraw);
    this.renderWinningLine(state.winningLine);
  }

  renderWinningLine(winningLine) {
    if (!winningLine) {
      this.lineElement.replaceChildren();
      return;
    }
    if (this.lineElement.firstChild) return;

    const start = cellCenter(winningLine[0]);
    const end = cellCenter(winningLine[winningLine.length - 1]);
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', start.x);
    line.setAttribute('y1', start.y);
    line.setAttribute('x2', end.x);
    line.setAttribute('y2', end.y);
    line.setAttribute('pathLength', '1');
    this.lineElement.replaceChildren(line);
  }
}
