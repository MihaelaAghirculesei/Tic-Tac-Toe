import { createGame, isGameOver, makeMove } from './game.js';
import { BoardView } from './view.js';

function throwConfetti() {
  // The confetti script comes from a CDN; the game must keep working without it.
  if (typeof window.confetti !== 'function') return;
  window.confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    disableForReducedMotion: true,
  });
}

class TicTacToeApp {
  constructor() {
    this.statusElement = document.getElementById('status');
    this.restartButton = document.getElementById('restart-button');
    this.view = new BoardView(
      document.getElementById('board'),
      document.getElementById('winning-line'),
    );

    this.view.onCellSelect((index) => this.play(index));
    this.view.enableArrowNavigation();
    this.restartButton.addEventListener('click', () => {
      this.restart();
      // The button hides itself, so hand keyboard focus back to the board.
      this.view.focusFirstCell();
    });

    this.restart();
  }

  restart() {
    this.state = createGame();
    this.render();
  }

  play(index) {
    const next = makeMove(this.state, index);
    if (next === this.state) return;

    this.state = next;
    this.render();
    if (this.state.winner) throwConfetti();
  }

  render() {
    const { winner, isDraw, currentPlayer } = this.state;
    const gameOver = isGameOver(this.state);

    this.view.render(this.state);
    this.statusElement.textContent = this.statusText();
    this.statusElement.dataset.player = gameOver ? '' : currentPlayer;
    this.statusElement.classList.toggle('is-celebrating', winner !== null);
    this.statusElement.classList.toggle('is-draw', isDraw);
    this.restartButton.hidden = !gameOver;
  }

  statusText() {
    const { winner, isDraw, currentPlayer } = this.state;
    if (winner) return `Glückwunsch! Spieler ${winner}\nhat gewonnen!`;
    if (isDraw) return 'Unentschieden!\nNiemand hat gewonnen.';
    return `Spieler ${currentPlayer} ist dran`;
  }
}

new TicTacToeApp();
