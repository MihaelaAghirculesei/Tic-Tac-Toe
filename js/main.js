import { createGame, isGameOver, makeMove } from './game.js';
import { EMPTY_SCORE, recordResult, sanitizeScore } from './score.js';
import { loadJSON, saveJSON } from './storage.js';
import { BoardView } from './view.js';

const SCORE_STORAGE_KEY = 'tic-tac-toe:score';

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
    this.scoreElements = {
      O: document.getElementById('score-o'),
      X: document.getElementById('score-x'),
      draw: document.getElementById('score-draw'),
    };
    this.score = sanitizeScore(loadJSON(SCORE_STORAGE_KEY, EMPTY_SCORE));
    this.view = new BoardView(
      document.getElementById('board'),
      document.getElementById('winning-line'),
    );

    this.view.onCellSelect((index) => this.play(index));
    this.view.enableArrowNavigation();
    this.restartButton.addEventListener('click', (event) => {
      this.restart();
      // The button hides itself, so hand keyboard focus back to the board.
      // detail === 0 means Enter/Space; mouse and touch users keep their scroll position.
      if (event.detail === 0) this.view.focusFirstCell();
    });
    document
      .getElementById('reset-score-button')
      .addEventListener('click', () => this.updateScore(EMPTY_SCORE));

    this.renderScore();
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
    if (isGameOver(this.state)) this.updateScore(recordResult(this.score, this.state));
    if (this.state.winner) throwConfetti();
  }

  updateScore(score) {
    this.score = score;
    saveJSON(SCORE_STORAGE_KEY, score);
    this.renderScore();
  }

  renderScore() {
    for (const [key, element] of Object.entries(this.scoreElements)) {
      element.textContent = String(this.score[key]);
    }
  }

  render() {
    const { winner, isDraw, currentPlayer } = this.state;
    const gameOver = isGameOver(this.state);

    this.view.render(this.state);
    this.statusElement.textContent = this.statusText();
    // Colour the status by the player it talks about; a draw keeps the neutral colour.
    const statusPlayer = winner ?? (isDraw ? null : currentPlayer);
    if (statusPlayer) this.statusElement.dataset.player = statusPlayer;
    else delete this.statusElement.dataset.player;
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
