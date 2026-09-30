import { findBestMove } from './ai.js';
import { PLAYERS, createGame, isGameOver, makeMove } from './game.js';
import { EMPTY_SCORE, recordResult, sanitizeScore } from './score.js';
import { loadJSON, saveJSON } from './storage.js';
import { BoardView } from './view.js';

const SCORE_STORAGE_KEY = 'tic-tac-toe:score';
const SETTINGS_STORAGE_KEY = 'tic-tac-toe:settings';

const MODES = Object.freeze({ TWO_PLAYERS: 'two-players', COMPUTER: 'computer' });
const COMPUTER_PLAYER = PLAYERS.X;
// A short pause makes the computer's reply readable instead of instant.
const COMPUTER_DELAY_MS = 450;

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

function sanitizeSettings(value) {
  const mode = Object.values(MODES).includes(value?.mode) ? value.mode : MODES.TWO_PLAYERS;
  const startingPlayer = Object.values(PLAYERS).includes(value?.startingPlayer)
    ? value.startingPlayer
    : PLAYERS.O;
  return { mode, startingPlayer };
}

class TicTacToeApp {
  constructor() {
    this.statusElement = document.getElementById('status');
    this.restartButton = document.getElementById('restart-button');
    this.settingsForm = document.getElementById('settings');
    this.scoreElements = {
      O: document.getElementById('score-o'),
      X: document.getElementById('score-x'),
      draw: document.getElementById('score-draw'),
    };
    this.scoreLabels = {
      O: document.getElementById('score-label-o'),
      X: document.getElementById('score-label-x'),
    };
    this.score = sanitizeScore(loadJSON(SCORE_STORAGE_KEY, EMPTY_SCORE));
    this.settings = sanitizeSettings(loadJSON(SETTINGS_STORAGE_KEY, null));
    this.computerTimer = null;
    this.view = new BoardView(
      document.getElementById('board'),
      document.getElementById('winning-line'),
    );

    this.view.onCellSelect((index) => {
      if (!this.isComputerTurn()) this.play(index);
    });
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
    this.settingsForm.addEventListener('change', () => this.changeSettings());
    this.settingsForm.addEventListener('submit', (event) => event.preventDefault());

    this.settingsForm.elements.mode.value = this.settings.mode;
    this.settingsForm.elements.startingPlayer.value = this.settings.startingPlayer;
    this.renderScore();
    this.restart();
  }

  isComputerMode() {
    return this.settings.mode === MODES.COMPUTER;
  }

  isComputerTurn() {
    return (
      this.isComputerMode() &&
      !isGameOver(this.state) &&
      this.state.currentPlayer === COMPUTER_PLAYER
    );
  }

  changeSettings() {
    const { mode, startingPlayer } = this.settingsForm.elements;
    this.settings = sanitizeSettings({ mode: mode.value, startingPlayer: startingPlayer.value });
    saveJSON(SETTINGS_STORAGE_KEY, this.settings);
    this.renderScore();
    this.restart();
  }

  restart() {
    clearTimeout(this.computerTimer);
    this.state = createGame(this.settings.startingPlayer);
    this.render();
    this.scheduleComputerMove();
  }

  play(index) {
    const next = makeMove(this.state, index);
    if (next === this.state) return;

    this.state = next;
    this.render();

    if (isGameOver(this.state)) {
      this.updateScore(recordResult(this.score, this.state));
      if (this.state.winner && !this.isComputerWin()) throwConfetti();
    } else {
      this.scheduleComputerMove();
    }
  }

  scheduleComputerMove() {
    if (!this.isComputerTurn()) return;
    this.computerTimer = setTimeout(() => {
      this.play(findBestMove(this.state.board, COMPUTER_PLAYER));
    }, COMPUTER_DELAY_MS);
  }

  isComputerWin() {
    return this.isComputerMode() && this.state.winner === COMPUTER_PLAYER;
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
    this.scoreLabels.O.textContent = this.isComputerMode() ? 'Du (O)' : 'Spieler O';
    this.scoreLabels.X.textContent = this.isComputerMode() ? 'Computer (X)' : 'Spieler X';
  }

  render() {
    const { winner, isDraw, currentPlayer } = this.state;
    const gameOver = isGameOver(this.state);

    this.view.render(this.state, { locked: this.isComputerTurn() });
    this.statusElement.textContent = this.statusText();
    // Colour the status by the player it talks about; a draw keeps the neutral colour.
    const statusPlayer = winner ?? (isDraw ? null : currentPlayer);
    if (statusPlayer) this.statusElement.dataset.player = statusPlayer;
    else delete this.statusElement.dataset.player;
    this.statusElement.classList.toggle('is-celebrating', winner !== null && !this.isComputerWin());
    this.statusElement.classList.toggle('is-draw', isDraw);
    this.restartButton.hidden = !gameOver;
  }

  statusText() {
    const { winner, isDraw, currentPlayer } = this.state;
    if (this.isComputerWin()) return 'Der Computer hat gewonnen.\nVersuch es noch einmal!';
    if (winner && this.isComputerMode()) return 'Glückwunsch!\nDu hast gewonnen!';
    if (winner) return `Glückwunsch! Spieler ${winner}\nhat gewonnen!`;
    if (isDraw) return 'Unentschieden!\nNiemand hat gewonnen.';
    if (this.isComputerTurn()) return 'Der Computer denkt nach …';
    if (this.isComputerMode()) return 'Du bist dran';
    return `Spieler ${currentPlayer} ist dran`;
  }
}

new TicTacToeApp();
