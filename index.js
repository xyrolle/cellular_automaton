import {SimplexNoise} from "./simplex.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const tickButton = document.getElementById("tick");
const autoplayButton = document.getElementById("autoplay");
const randomizeButton = document.getElementById("randomize");
const resetButton = document.getElementById("reset");

const ROWS = 75;
const COLS = 75;

const CELL_HEIGHT = 15;
const CELL_WIDTH = 15;

const CANVAS_WIDTH = CELL_WIDTH*COLS;
const CANVAS_HEIGHT = CELL_HEIGHT*ROWS;

const DEAD = 0;
const ALIVE = 1;
const DYING = 2;

// Set canvas dimensions
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Set canvas background color
ctx.fillStyle = "#412412";
ctx.fillRect(0, 0, canvas.width, canvas.height);

const colors = ["#414141", "#FFFFFF", "#FE0FE0"];
const grid = Array.from({length: ROWS}, () => Array.from({length: COLS}).fill(DEAD));

const render = (grid) => {
  grid.forEach((rowCells, row) => {
    rowCells.forEach((cell, col) => {
      ctx.fillStyle = colors[cell];
      ctx.fillRect(col*CELL_WIDTH + 1, row*CELL_HEIGHT + 1, CELL_WIDTH - 1, CELL_HEIGHT - 1);
    });
  });
};

render(grid);

const gol = (grid) => {
  const gridCopy = Array.from({length: ROWS}, (_, row) => [...grid[row]]);

  gridCopy.forEach((rowCells, row) => {
    rowCells.forEach((cell, col) => {
      const neighbours = moorsNeighbourhood(gridCopy, row, col);
      const liveNeighboursCount = neighbours.reduce((prev, cell) => prev += (cell === ALIVE), 0);

      const isAlive = cell === ALIVE;

      // A dead cell will be brought back to live if it has exactly three live neighbors.
      if (!isAlive && liveNeighboursCount === 3) {
        grid[row][col] = ALIVE;
      } 

      // A live cell dies if it has fewer than two live neighbors.
      // A live cell dies if it has more than three live neighbours.
      if (isAlive && (liveNeighboursCount < 2 || liveNeighboursCount > 3)) {
        grid[row][col] = DEAD;
      }
    });
  });
};

const seeds = (grid) => {
 const gridCopy = Array.from({length: ROWS}, (_, row) => [...grid[row]]);

  gridCopy.forEach((rowCells, row) => {
    rowCells.forEach((cell, col) => {
      const neighbours = moorsNeighbourhood(gridCopy, row, col);
      const liveNeighboursCount = neighbours.reduce((prev, cell) => prev += (cell === ALIVE), 0);

      if (cell === DEAD && liveNeighboursCount == 2) {
        grid[row][col] = ALIVE;
      } else {
        grid[row][col] = DEAD;
      }
    });
  });
}

const bb = (grid) => {
 const gridCopy = Array.from({length: ROWS}, (_, row) => [...grid[row]]);

  gridCopy.forEach((rowCells, row) => {
    rowCells.forEach((cell, col) => {
      const neighbours = moorsNeighbourhood(gridCopy, row, col);
      const liveNeighboursCount = neighbours.reduce((prev, cell) => prev += (cell === ALIVE), 0);

      const isAlive = cell === ALIVE;
      
      if (cell === DEAD && liveNeighboursCount === 2) {
        grid[row][col] = ALIVE;
      } else if (cell === ALIVE) {
        grid[row][col] = DYING;
      } else if (cell === DYING) {
        grid[row][col] = DEAD;
      }
    });
  });
}

const rbs = document.querySelectorAll("input[type='radio'][name='automaton']");

let ruleFunction = gol;
let numberOfStates = 2;
rbs.forEach(button => {
  button.addEventListener("change", (e) => {
    ruleFunction = getRuleFunction(e.target.value);
    numberOfStates = getNumberOfStates(e.target.value);
    grid.forEach(row => {
      row.forEach((_, index) => row[index] = DEAD);
    })

    render(grid);
  })
});

const getRuleFunction = (selected) => { 
  switch (selected) {
    case "game_of_life":
      return gol;
    case "seeds":
      return seeds;
    default:
      return bb; 
  }
}

const getNumberOfStates = (selected) => {
 switch (selected) {
    case "game_of_life":
     return 2;
    case "seeds":
     return 2;
    default:
     return 3;
  }
}

const mod = (a, b) => (a % b + b) % b;

const moorsNeighbourhood = (board, x0, y0) => {
  const neighbours = Array.from({length: 8});

  let index = 0;
  for (let dy = -1; dy <= 1; ++dy) {
    for (let dx = -1; dx <= 1; ++dx) {
      if (dy != 0 || dx != 0) {
        const y = mod(y0 + dy, ROWS);
        const x = mod(x0 + dx, COLS);
        neighbours[index++] = board[x][y];
      }
    }
  }
  
  return neighbours;
}

const handlePlaceCell = (e) => {
  const {top, left} = e.target.getBoundingClientRect();

  const x = e.clientX - left;
  const y = e.clientY - top;

  const row = Math.floor(y/CELL_HEIGHT);
  const col = Math.floor(x/CELL_WIDTH);

  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
    return;
  }

  grid[row][col] = ALIVE;

  render(grid);
}

const handleMouseUp = (e) => {
  canvas.removeEventListener("mousemove", handlePlaceCell);
}

canvas.addEventListener("mousedown", (e) => {
  handlePlaceCell(e);

  canvas.addEventListener("mousemove", handlePlaceCell);
  canvas.addEventListener("mouseup", handleMouseUp, {once: true});
  canvas.addEventListener("mouseleave", handleMouseUp, {once: true});
});

const map = (x, in_min, in_max, out_min, out_max) => {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

tickButton.addEventListener("click", () => {
  ruleFunction(grid);
  render(grid);
});

randomizeButton.addEventListener("click", () => {
  const sn = new SimplexNoise();
  const step = 1/10;

  for (let i = 0; i < ROWS; ++i) {
    for (let j = 0; j < COLS; ++j) {
      const randomOffFactor = Math.random() < 0.75 ? 0 : 1;
      grid[i][j] = Math.floor(map(sn.noise(i*step, j*step), -1, 1, 0, numberOfStates)) * randomOffFactor;
    }
  }

  render(grid);
})

let autoplayInterval;
autoplayButton.addEventListener("click", (e) => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval);
    autoplayInterval = null;
    autoplayButton.textContent = "autoplay on";
  } else {
    autoplayInterval = setInterval(() => {
      ruleFunction(grid);
      render(grid);
    }, 250);
    autoplayButton.textContent = "autoplay off";
  }
});

resetButton.addEventListener("click", (e) => {
  for (let i = 0; i < ROWS; ++i) {
    for (let j = 0; j < COLS; ++j) {
      grid[i][j] = DEAD;
    }
  }

  render(grid);
});

