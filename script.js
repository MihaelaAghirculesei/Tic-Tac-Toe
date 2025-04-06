let fields = Array(9).fill(null);
let currentPlayer = "circle";
let gameOver = false;

function init() {
  render();
  document
    .getElementById("restart-button")
    .addEventListener("click", restartGame);
}

function render() {
  const content = document.getElementById("content");
  content.innerHTML = `
        <table>${Array(3)
          .fill()
          .map(
            (_, i) =>
              `<tr>${Array(3)
                .fill()
                .map((_, j) => {
                  const index = i * 3 + j;
                  const symbol = fields[index]
                    ? generateSVG(fields[index])
                    : "";
                  return `<td onclick="handleClick(this, ${index})">${symbol}</td>`;
                })
                .join("")}</tr>`
          )
          .join("")}</table>
    `;
}

function generateSVG(player) {
  return player === "circle"
    ? `<svg width="70" height="70" viewBox="0 0 70 70"><circle cx="35" cy="35" r="30" fill="none" stroke="rgb(0,176,239)" stroke-width="5"><animate attributeName="stroke-dasharray" from="0 188.5" to="188.5 0" dur="125ms" fill="freeze"/></circle></svg>`
    : `<svg width="70" height="70" viewBox="0 0 70 70"><line x1="10" y1="10" x2="60" y2="60" stroke="rgb(155, 192, 0)" stroke-width="5"><animate attributeName="stroke-dasharray" from="0 70.71" to="70.71 0" dur="125ms" fill="freeze"/></line><line x1="60" y1="10" x2="10" y2="60" stroke="rgb(155, 192, 0)" stroke-width="5"><animate attributeName="stroke-dasharray" from="0 70.71" to="70.71 0" dur="125ms" fill="freeze"/></line></svg>`;
}

function checkForWin() {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  return (
    winningCombinations.find(
      (combo) =>
        fields[combo[0]] &&
        fields[combo[0]] === fields[combo[1]] &&
        fields[combo[0]] === fields[combo[2]]
    ) || null
  );
}

function showWinner() {
  const winnerText = document.getElementById("winner-text");
  winnerText.innerHTML = `Glückwunsch! Spieler ${
    currentPlayer === "circle" ? "O" : "X"
  }<br>hat gewonnen!`;
  winnerText.classList.add("winner-animation");
  document.getElementById("restart-button").style.display = "block";
}

function showDraw() {
  const winnerText = document.getElementById("winner-text");
  winnerText.innerHTML = "Unentschieden!";
  winnerText.classList.add("winner-animation");
  document.getElementById("restart-button").style.display = "block";
}

function drawWinningLine(combo) {}

function throwConfetti() {
  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
}

function restartGame() {
  fields = Array(9).fill(null);
  currentPlayer = "circle";
  gameOver = false;

  const winnerText = document.getElementById("winner-text");
  winnerText.innerHTML = "";
  winnerText.classList.remove("winner-animation");

  document.getElementById("restart-button").style.display = "none";

  const winningLine = document.querySelector(".winning-line");
  if (winningLine) winningLine.remove();

  render();
}

function drawWinningLine(combo) {
  const content = document.getElementById("content");
  const contentRect = content.getBoundingClientRect();
  const cells = combo.map(
    (index) => document.getElementsByTagName("td")[index]
  );
  const rects = cells.map((cell) => cell.getBoundingClientRect());

  const line = document.createElement("div");
  line.className = "winning-line";

  let startX, startY, endX, endY;
  const borderWidth = 5;

  if (combo[0] % 3 === combo[1] % 3) {
    startX = endX = rects[0].left + rects[0].width / 2 - contentRect.left;
    startY = borderWidth;
    endY = contentRect.height - borderWidth;
  } else if (Math.floor(combo[0] / 3) === Math.floor(combo[1] / 3)) {
    startX = borderWidth;
    endX = contentRect.width - borderWidth;
    startY = endY = rects[0].top + rects[0].height / 2 - contentRect.top;
  } else {
    startX = combo[0] === 0 ? borderWidth : contentRect.width - borderWidth;
    startY = borderWidth;
    endX = combo[0] === 0 ? contentRect.width - borderWidth : borderWidth;
    endY = contentRect.height - borderWidth;
  }

  const length = Math.sqrt(
    Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
  );
  const angle = (Math.atan2(endY - startY, endX - startX) * 180) / Math.PI;

  Object.assign(line.style, {
    width: `${length}px`,
    top: `${startY}px`,
    left: `${startX}px`,
    transform: `rotate(${angle}deg)`,
    transformOrigin: "left center",
    position: "absolute",
    backgroundColor: "red",
    height: "5px",
  });

  content.style.position = "relative";
  content.appendChild(line);
}

function handleClick(cell, index) {
  if (fields[index] === null && !gameOver) {
    fields[index] = currentPlayer;
    cell.innerHTML = generateSVG(currentPlayer);
    cell.onclick = null;

    const winningCombo = checkForWin();
    if (winningCombo) {
      gameOver = true;
      showWinner();
      drawWinningLine(winningCombo);
      throwConfetti();
    } else if (fields.every((field) => field !== null)) {
      showDraw();
    } else {
      currentPlayer = currentPlayer === "circle" ? "cross" : "circle";
    }
  }
}

init();
