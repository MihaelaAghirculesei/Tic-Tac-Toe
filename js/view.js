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

function createCell(index) {
  const cell = document.createElement('button');
  cell.type = 'button';
  cell.className = 'cell';
  cell.dataset.index = String(index);
  return cell;
}

export class BoardView {
  constructor(boardElement, lineElement) {
    this.boardElement = boardElement;
    this.lineElement = lineElement;
    this.cells = Array.from({ length: BOARD_SIZE }, (_, index) => createCell(index));
    this.boardElement.replaceChildren(...this.cells);
  }

  onCellSelect(handler) {
    this.boardElement.addEventListener('click', (event) => {
      const cell = event.target.closest('.cell');
      if (cell) handler(Number(cell.dataset.index));
    });
  }

  /** Arrow keys move the focus across the grid (Tab still works as usual). */
  enableArrowNavigation() {
    const steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -GRID_SIZE, ArrowDown: GRID_SIZE };

    this.boardElement.addEventListener('keydown', (event) => {
      const step = steps[event.key];
      const cell = event.target.closest('.cell');
      if (!step || !cell) return;

      event.preventDefault();
      const index = Number(cell.dataset.index);
      const row = Math.floor(index / GRID_SIZE);
      const target = index + step;
      const staysInRow = Math.abs(step) !== 1 || Math.floor(target / GRID_SIZE) === row;
      if (target >= 0 && target < BOARD_SIZE && staysInRow) this.cells[target].focus();
    });
  }

  focusFirstCell() {
    this.cells[0].focus();
  }

  render(state) {
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
      cell.setAttribute('aria-disabled', String(gameOver || player !== null));
    });

    this.boardElement.classList.toggle('is-over', gameOver);
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
