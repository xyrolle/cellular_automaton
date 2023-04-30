const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const tickButton = document.getElementById("tick");
const autoplayButton = document.getElementById("autoplay");

const ROWS = 50;
const COLS = 50;

const CELL_HEIGHT = 20;
const CELL_WIDTH = 20;

const CANVAS_WIDTH = CELL_WIDTH*COLS;
const CANVAS_HEIGHT = CELL_HEIGHT*ROWS;


const ALIVE = 0;
const DEAD = 1;
const DYING = 2;

// Set canvas dimensions
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Set canvas background color
ctx.fillStyle = "#414141";
ctx.fillRect(0, 0, canvas.width, canvas.height);

const colors = ["#FFFFFF", "#414141", "#FE0FE0"];
const grid = Array.from({length: ROWS}, () => Array.from({length: COLS}).fill(DEAD));

const render = (grid) => {
  grid.forEach((rowCells, row) => {
    rowCells.forEach((cell, col) => {
      ctx.fillStyle = colors[cell];
      ctx.fillRect(col*CELL_WIDTH + 1, row*CELL_HEIGHT + 1, CELL_WIDTH - 1, CELL_HEIGHT - 1);
    });
  });
};

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

  render(grid);
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

  render(grid);
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

  render(grid);
}

const gameFn = seeds;

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

const handleMouseMove = (e) => {
  const {top, left} = e.target.getBoundingClientRect();

  const x = e.clientX - left;
  const y = e.clientY - top;

  const row = Math.floor(y/CELL_HEIGHT);
  const col = Math.floor(x/CELL_WIDTH);

  grid[row][col] = ALIVE;

  render(grid);
}

const handleMouseUp = (e) => {
  canvas.removeEventListener("mousemove", handleMouseMove);
  canvas.removeEventListener("mouseup", handleMouseUp);
}

canvas.addEventListener("mousedown", (e) => {
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);
});

tickButton.addEventListener("click", () => {
  gameFn(grid); 
});

let autoplayInterval;
autoplayButton.addEventListener("click", (e) => {
  console.log(autoplayInterval)
  if (autoplayInterval) {
    clearInterval(autoplayInterval);
    autoplayInterval = null;
    autoplayButton.textContent = "autoplay on";
  } else {
    autoplayInterval = setInterval(() => gameFn(grid), 250);
    autoplayButton.textContent = "autoplay off";
  }
})

