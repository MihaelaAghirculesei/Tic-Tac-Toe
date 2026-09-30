# Tic Tac Toe

> A sleek, animated Tic Tac Toe built with pure HTML, CSS & JavaScript — no framework, no build step.

<p align="center">
  <img src="tic_tac_toe.png" alt="Tic Tac Toe Screenshot" width="350">
</p>

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## Features

- **SVG-drawn symbols** — X and O animate onto the board as if hand-drawn
- **Dynamic winning line** — a red line sweeps across the winning combination
- **Confetti celebration** — canvas-confetti burst on victory
- **Fully responsive** — plays great on desktop and mobile
- **Zero build step** — plain ES modules, served as they are

## Tech Stack

| Layer   | Technology                                           |
| ------- | ---------------------------------------------------- |
| Markup  | Semantic HTML5                                       |
| Styling | CSS3 Custom Properties, Keyframe Animations, Flexbox |
| Logic   | Vanilla ES modules, pure game logic with unit tests  |
| Effects | canvas-confetti (CDN)                                |

## Quick Start

The game uses ES modules, which browsers do not load from `file://`. Serve the folder with any static server:

```bash
git clone https://github.com/MihaelaAghirculesei/Tic-Tac-Toe.git
cd Tic-Tac-Toe
npx serve .          # or: python -m http.server
```

## Development

```bash
npm install
npm test
npm run lint
npm run format:check
```

## License

MIT
