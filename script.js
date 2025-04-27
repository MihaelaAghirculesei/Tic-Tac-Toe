const PLAYERS = {
  CIRCLE: 'circle',
  CROSS: 'cross'
};

class TicTacToe {
  constructor() {
    this.fields = Array(9).fill(null);
    this.currentPlayer = PLAYERS.CIRCLE;
    this.gameOver = false;
    this.winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]             
    ];

    this.contentElement = document.getElementById('content');
    this.winnerTextElement = document.getElementById('winner-text');
    this.restartButton = document.getElementById('restart-button');
    
    this.init();
  }
  
  init() {
    this.render();
    this.restartButton.addEventListener('click', () => this.restartGame());
  }
  
  render() {
    this.contentElement.style.position = 'relative';
    
    this.contentElement.innerHTML = `
      <div id="game-container">
        <table>
          ${Array(3).fill().map((_, row) => 
            `<tr>
              ${Array(3).fill().map((_, col) => {
                const index = row * 3 + col;
                const symbol = this.fields[index] ? this.generateSVG(this.fields[index]) : '';
                return `<td data-index="${index}">${symbol}</td>`;
              }).join('')}
            </tr>`
          ).join('')}
        </table>
        <svg id="winning-line-svg" width="100%" height="100%" style="position:absolute; top:0; left:0; pointer-events:none;">
          <!-- Qui verrà inserita la linea vincente -->
        </svg>
      </div>
    `;
    
    document.querySelectorAll('td').forEach(cell => {
      const index = parseInt(cell.getAttribute('data-index'));
      cell.addEventListener('click', () => this.handleClick(cell, index));
    });
  }
  
  generateSVG(player) {
    if (player === PLAYERS.CIRCLE) {
      return `<svg width="70" height="70" viewBox="0 0 70 70">
        <circle cx="35" cy="35" r="30" fill="none" stroke="rgb(0,176,239)" stroke-width="5">
          <animate attributeName="stroke-dasharray" from="0 188.5" to="188.5 0" dur="125ms" fill="freeze"/>
        </circle>
      </svg>`;
    } else {
      return `<svg width="70" height="70" viewBox="0 0 70 70">
        <line x1="10" y1="10" x2="60" y2="60" stroke="rgb(155, 192, 0)" stroke-width="5">
          <animate attributeName="stroke-dasharray" from="0 70.71" to="70.71 0" dur="125ms" fill="freeze"/>
        </line>
        <line x1="60" y1="10" x2="10" y2="60" stroke="rgb(155, 192, 0)" stroke-width="5">
          <animate attributeName="stroke-dasharray" from="0 70.71" to="70.71 0" dur="125ms" fill="freeze"/>
        </line>
      </svg>`;
    }
  }
  
  checkForWin() {
    return this.winningCombinations.find(combo => 
      this.fields[combo[0]] && 
      this.fields[combo[0]] === this.fields[combo[1]] && 
      this.fields[combo[0]] === this.fields[combo[2]]
    ) || null;
  }
  
  showWinner() {
    const symbol = this.currentPlayer === PLAYERS.CIRCLE ? 'O' : 'X';
    this.winnerTextElement.innerHTML = `Glückwunsch! Spieler ${symbol}<br>hat gewonnen!`;
    this.winnerTextElement.classList.add('winner-animation');
    this.restartButton.style.display = 'block';
  }
  
  showDraw() {
    this.winnerTextElement.innerHTML = 'Unentschieden!';
    this.winnerTextElement.classList.add('winner-animation');
    this.restartButton.style.display = 'block';
  }
  
  drawWinningLine(combo) {
    const svgElement = document.getElementById('winning-line-svg');
    if (!svgElement) return;
    
    svgElement.innerHTML = '';
    
    const tableRect = document.querySelector('table').getBoundingClientRect();
    svgElement.setAttribute('width', tableRect.width);
    svgElement.setAttribute('height', tableRect.height);
    
    let x1, y1, x2, y2;
    
    const getCellCenter = (index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      
      const cellWidth = tableRect.width / 3;
      const cellHeight = tableRect.height / 3;
      
      return {
        x: col * cellWidth + cellWidth / 2,
        y: row * cellHeight + cellHeight / 2
      };
    };
    
    const startCell = getCellCenter(combo[0]);
    const endCell = getCellCenter(combo[2]);
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', startCell.x);
    line.setAttribute('y1', startCell.y);
    line.setAttribute('x2', endCell.x);
    line.setAttribute('y2', endCell.y);
    line.setAttribute('stroke', 'red');
    line.setAttribute('stroke-width', '5');
    
    const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    animate.setAttribute('attributeName', 'stroke-dasharray');
    
    const length = Math.sqrt(
      Math.pow(endCell.x - startCell.x, 2) + 
      Math.pow(endCell.y - startCell.y, 2)
    );
    
    animate.setAttribute('from', `0 ${length}`);
    animate.setAttribute('to', `${length} 0`);
    animate.setAttribute('dur', '0.5s');
    animate.setAttribute('fill', 'freeze');
    
    line.appendChild(animate);
    svgElement.appendChild(line);
  }
  
  throwConfetti() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
  
  restartGame() {
    this.fields = Array(9).fill(null);
    this.currentPlayer = PLAYERS.CIRCLE;
    this.gameOver = false;
    
    this.winnerTextElement.innerHTML = '';
    this.winnerTextElement.classList.remove('winner-animation');
    this.restartButton.style.display = 'none';

    const svgElement = document.getElementById('winning-line-svg');
    if (svgElement) svgElement.innerHTML = '';
    
    this.render();
  }
  
  handleClick(cell, index) {
    if (this.fields[index] === null && !this.gameOver) {
      this.fields[index] = this.currentPlayer;
      cell.innerHTML = this.generateSVG(this.currentPlayer);
      cell.onclick = null;
      
      const winningCombo = this.checkForWin();
      if (winningCombo) {
        this.gameOver = true;
        this.showWinner();
        this.drawWinningLine(winningCombo);
        this.throwConfetti();
      } else if (this.fields.every(field => field !== null)) {
        this.showDraw();
      } else {
        this.currentPlayer = this.currentPlayer === PLAYERS.CIRCLE ? PLAYERS.CROSS : PLAYERS.CIRCLE;
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TicTacToe();
});