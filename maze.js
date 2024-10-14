const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");
const cellSize = 20;
let maze;
let rows, cols;

// Directions (right, down, left, up)
const directions = [
  [0, 1], [1, 0], [0, -1], [-1, 0]
];

// Function to generate the maze using DFS
function generateMaze(width, height) {
  rows = height;
  cols = width;
  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;

  maze = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({
    visited: false,
    walls: [true, true, true, true], // [right, bottom, left, top]
  })));

  const stack = [];
  const start = [0, 0];
  maze[0][0].visited = true;
  stack.push(start);

  while (stack.length > 0) {
    const [x, y] = stack.pop();
    const neighbors = getUnvisitedNeighbors(x, y);

    if (neighbors.length > 0) {
      stack.push([x, y]);

      // Randomly pick one of the unvisited neighbors
      const [nx, ny, direction] = neighbors[Math.floor(Math.random() * neighbors.length)];

      // Remove walls between current cell and neighbor
      removeWalls(x, y, nx, ny, direction);

      maze[nx][ny].visited = true;
      stack.push([nx, ny]);
    }
  }

  drawMaze();
  drawStartAndEnd(); // Highlight start and end points
}

// Get unvisited neighbors
function getUnvisitedNeighbors(x, y) {
  const neighbors = [];

  directions.forEach((direction, index) => {
    const [dx, dy] = direction;
    const nx = x + dx;
    const ny = y + dy;

    if (nx >= 0 && ny >= 0 && nx < rows && ny < cols && !maze[nx][ny].visited) {
      neighbors.push([nx, ny, index]);
    }
  });

  return neighbors;
}

// Remove walls between two cells
function removeWalls(x, y, nx, ny, direction) {
  if (direction === 0) { // Right
    maze[x][y].walls[0] = false;
    maze[nx][ny].walls[2] = false;
  } else if (direction === 1) { // Down
    maze[x][y].walls[1] = false;
    maze[nx][ny].walls[3] = false;
  } else if (direction === 2) { // Left
    maze[x][y].walls[2] = false;
    maze[nx][ny].walls[0] = false;
  } else if (direction === 3) { // Up
    maze[x][y].walls[3] = false;
    maze[nx][ny].walls[1] = false;
  }
}

// Draw the generated maze
function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let x = 0; x < rows; x++) {
    for (let y = 0; y < cols; y++) {
      const cell = maze[x][y];
      const cx = y * cellSize;
      const cy = x * cellSize;

      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;

      if (cell.walls[0]) ctx.strokeRect(cx + cellSize - 2, cy, 2, cellSize); // Right
      if (cell.walls[1]) ctx.strokeRect(cx, cy + cellSize - 2, cellSize, 2); // Bottom
      if (cell.walls[2]) ctx.strokeRect(cx - 2, cy, 2, cellSize); // Left
      if (cell.walls[3]) ctx.strokeRect(cx, cy - 2, cellSize, 2); // Top
    }
  }
}

// Draw the start (green) and end (blue) points
function drawStartAndEnd() {
  ctx.fillStyle = "green";
  ctx.fillRect(1, 1, cellSize - 2, cellSize - 2); // Start point (top-left)

  ctx.fillStyle = "blue";
  ctx.fillRect((cols - 1) * cellSize + 1, (rows - 1) * cellSize + 1, cellSize - 2, cellSize - 2); // End point (bottom-right)
}

// Function to solve the maze using BFS
function solveMaze() {
  const queue = [];
  const start = [0, 0];
  const end = [rows - 1, cols - 1];
  const parent = Array.from({ length: rows }, () => Array(cols).fill(null));

  queue.push(start);
  parent[0][0] = [-1, -1]; // Mark the start point

  while (queue.length > 0) {
    const [x, y] = queue.shift();

    if (x === end[0] && y === end[1]) {
      // We've reached the end, reconstruct the path
      reconstructPath(parent, end);
      return;
    }

    const neighbors = getValidNeighbors(x, y);

    neighbors.forEach(([nx, ny]) => {
      if (parent[nx][ny] === null) { // Only visit if not visited before
        queue.push([nx, ny]);
        parent[nx][ny] = [x, y];
      }
    });
  }
}

// Get valid neighbors (not blocked by walls)
function getValidNeighbors(x, y) {
  const neighbors = [];

  directions.forEach((direction, index) => {
    const [dx, dy] = direction;
    const nx = x + dx;
    const ny = y + dy;

    if (nx >= 0 && ny >= 0 && nx < rows && ny < cols && !maze[x][y].walls[index]) {
      neighbors.push([nx, ny]);
    }
  });

  return neighbors;
}

// Reconstruct the path from the end to the start
function reconstructPath(parent, end) {
  let [x, y] = end;

  while (parent[x][y] !== null && parent[x][y][0] !== -1) {
    const [px, py] = parent[x][y];
    drawPath(px, py, x, y);
    [x, y] = [px, py];
  }
}

// Draw the path from one cell to another
function drawPath(x, y, nx, ny) {
  const cx = y * cellSize + cellSize / 2;
  const cy = x * cellSize + cellSize / 2;
  const nCx = ny * cellSize + cellSize / 2;
  const nCy = nx * cellSize + cellSize / 2;

  ctx.strokeStyle = "red";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(nCx, nCy);
  ctx.stroke();
}

// Button actions
document.getElementById("generateMaze").addEventListener("click", () => generateMaze(20, 20));
document.getElementById("solveMaze").addEventListener("click", solveMaze);
