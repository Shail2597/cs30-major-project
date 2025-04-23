// Platformer Game
// Hosain Javadi and Shail Chaudhari
// April 16th, 2025
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let lvl1;
let xOffset, yOffset;
let p1;

// size of each tile in pixels
const tileWidth  = 80;  // ← whatever width you like
const tileHeight = 46;  // ← keep your original height

// 2D literal: 1 = solid block, 0 = empty
// Edit these rows/cols to change your collision layout
const levelMap = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
  [0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
  [0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
  [0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

let grid = [];
let gridRows, gridCols;

function preload() {
  lvl1 = loadImage("assets (final draft)/lvl 1.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  calculateOffsets();
  generateGrid();
  p1 = new Player(windowWidth/2,windowHeight/2 );
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateOffsets();
  // grid stays the same, since levelMap never changes here
}

function calculateOffsets() {
  xOffset = (windowWidth  - lvl1.width)  / 2;
  yOffset = (windowHeight - lvl1.height) / 2;
}

// Copy the literal into our working grid and set dimensions
function generateGrid() {
  grid = levelMap.map(row => row.slice());
  gridRows = grid.length;
  gridCols = grid[0].length;
}

function draw() {
  background(62, 56, 80);
  image(lvl1, xOffset, yOffset);
  drawGrid();
  
  p1.move();
  p1.checkGridCollision();
  p1.display();
}

function drawGrid() {
  const cols = ceil(width  / tileWidth);
  const rows = ceil(height / tileHeight);

  stroke(200,200,200,100);
  strokeWeight(1);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let px = c * tileWidth;
      let py = r * tileHeight;

      if (r < gridRows && c < gridCols && grid[r][c] === 1) {
        fill(255,0,0,120);
      } else {
        fill(200,200,200,30);
      }
      rect(px, py, tileWidth, tileHeight);
    }
  }
}



class Player {
  constructor(x, y) {
    this.x        = x;
    this.y        = y;
    this.size     = 50;
    this.speed    = 10;    // also jump strength
    this.vy       = 0;
    this.gravity  = 0.5;
    this.onGround = false;
  }

  move() {
    // horizontal movement
    let newX = this.x;
    if (keyIsDown(LEFT_ARROW))  newX -= this.speed;
    if (keyIsDown(RIGHT_ARROW)) newX += this.speed;
    this.x = constrain(newX, 0, width - this.size);

    // jump if on ground
    if (keyIsDown(UP_ARROW) && this.onGround) {
      this.vy = -this.speed;
      this.onGround = false;
    }

    // apply gravity
    this.vy += this.gravity;
    this.y  += this.vy;
  }

  checkGridCollision() {
    this.onGround = false;
    const left   = this.x;
    const right  = this.x + this.size;
    const top    = this.y;
    const bottom = this.y + this.size;
  
    // ── Vertical collisions ───────────────────
    if (this.vy > 0) {
      // falling → feet collision
      let row = floor((bottom - yOffset) / tileHeight);
      for (let footX of [left, right - 1]) {
        let col = floor((footX - xOffset) / tileWidth);
        if (this._isBlockAt(row, col)) {
          // snap on top of tile
          this.y        = yOffset + row * tileHeight - this.size;
          this.vy       = 0;
          this.onGround = true;
        }
      }
    } else if (this.vy < 0) {
      // rising → head bump
      let row = floor((top - yOffset) / tileHeight);
      for (let headX of [left, right - 1]) {
        let col = floor((headX - xOffset) / tileWidth);
        if (this._isBlockAt(row, col)) {
          this.y  = yOffset + (row + 1) * tileHeight;
          this.vy = 0;
        }
      }
    }
  
    // ── Horizontal collisions ────────────────
    for (let checkY of [top, bottom - 1]) {
      let row = floor((checkY - yOffset) / tileHeight);
  
      // left
      if (keyIsDown(LEFT_ARROW)) {
        let col = floor((left - xOffset) / tileWidth);
        if (this._isBlockAt(row, col)) {
          this.x = xOffset + (col + 1) * tileWidth;
        }
      }
      // right
      if (keyIsDown(RIGHT_ARROW)) {
        let col = floor((right - xOffset) / tileWidth);
        if (this._isBlockAt(row, col)) {
          this.x = xOffset + col * tileWidth - this.size;
        }
      }
    }
  
    // ── Floor fallback ───────────────────────
    if (this.y + this.size > height) {
      this.y        = height - this.size;
      this.vy       = 0;
      this.onGround = true;
    }
  }
  

  // safe check for block presence
  _isBlockAt(row, col) {
    return (
      row >= 0 && row < gridRows &&
      col >= 0 && col < gridCols &&
      grid[row][col] === 1
    );
  }

  display() {
    noStroke();
    fill(255, 100, 100);
    rect(this.x, this.y, this.size, this.size);
  }
}

