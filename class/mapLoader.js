// class/mapLoader.js
// MapLoader class handles loading, displaying, and managing tile maps for the game
class MapLoader {
  constructor({ cols, rows, tileSize, bgCount, wallCount, decCount }) {
    // Store map dimensions and tile counts
    this.cols = cols;
    this.rows = rows;
    this.tileSize = tileSize;
    this.bgCount = bgCount;
    this.wallCount = wallCount;
    this.decCount = decCount;

    // Initialize map layers (base and decoration)
    this.layers = {
      base: Array.from({ length: rows }, () => Array(cols).fill(null)),
      decoration: Array.from({ length: rows }, () => Array(cols).fill(null))
    };

    // Store loaded images and paths for each tile type
    this.images = {};
    this.bgPaths = [];
    this.wallPaths = [];
    this.decPaths = [];

    // File input and game objects
    this.fileInput = null;
    this.player = new King();
    this.walls = new Group();
    this.pig = null; // Pig(s) will be created after map is loaded
  }

  // Preload all tile and sprite images
  preload() {
    // Load background tile images
    for (let i = 1; i <= this.bgCount; i++) {
      const p = `blocks/backgroundWalls/bg${i}.png`;
      this.bgPaths.push(p);
      this.images[p] = loadImage(p);
    }
    // Load wall tile images
    for (let i = 1; i <= this.wallCount; i++) {
      const p = `blocks/walls/wa${i}.png`;
      this.wallPaths.push(p);
      this.images[p] = loadImage(p);
    }
    // Load decoration tile images
    for (let i = 1; i <= this.decCount; i++) {
      const p = `blocks/decoration/dec${i}.png`;
      this.decPaths.push(p);
      this.images[p] = loadImage(p);
    }
    // Load player and pig sprite sheets
    this.kingSpriteSheet = loadImage("asset/king_human_full.png");
    this.pigSpriteSheet = loadImage("asset/pig.png");
  }

  // Setup canvas, UI buttons, and gravity
  setup(){
    world.gravity.y = 9; // Set gravity for the game
    createCanvas(windowWidth, windowHeight);
    noSmooth();

    // Setup file input for loading maps
    this.fileInput = createFileInput(file => this.handleFile(file));
    this.fileInput.hide();
    // Load Map button
    this.loadBtn = createButton('Load Map')
      .position(10, 10)
      .size(100, 30)
      .style('background-color', '#3E3850')
      .style('color', '#ffffff')
      .style('border', 'none')
      .style('border-radius', '8px')
      .style('padding', '8px 0px')
      .style('font-size', '16px')
      .style('font-family', 'Arial, sans-serif')
      .mousePressed(() => this.fileInput.elt.click());
    // Back button
    this.backBtn = createButton('Back')
      .position(10, 50)
      .size(100, 30)
      .style('background-color', '#3E3850')
      .style('color', '#ffffff')
      .style('border', 'none')
      .style('border-radius', '8px')
      .style('padding', '8px 0px')
      .style('font-size', '16px')
      .style('font-family', 'Arial, sans-serif')
      .mousePressed(() => location.reload());

    // Button hover effects
    this.loadBtn.mouseOver(() => {
      this.loadBtn.style('background-color', '#8541ee');
    });
    this.loadBtn.mouseOut(() => {
      this.loadBtn.style('background-color', '#3E3850');
    }); 

    this.backBtn.mouseOver(() => {
      this.backBtn.style('background-color', '#8541ee');
    });
    this.backBtn.mouseOut(() => {
      this.backBtn.style('background-color', '#3E3850');
    }); 
  }

  // Main draw loop: draws background, grid, player, and pigs
  draw() {
    background(62, 56, 80);

    // Center the grid on the canvas
    const gridW = this.cols * this.tileSize;
    const gridH = this.rows * this.tileSize;
    const offsetX = (width - gridW) / 2;
    const offsetY = (height - gridH) / 2;

    push();
    translate(offsetX, offsetY);
    this.drawGrid();
    pop();

    // Draw player and pigs if they exist
    if (this.player && this.player.hitBox) {
      // Remove any null pigs
      if (this.pigs) {
        this.pigs = this.pigs.filter(pig => pig && pig.pigSpi && pig.hitBoxPig);
      }

      if (this.pigs && this.pigs.length > 0) {
        // Update pigs only if player is alive
        if (!this.player.isDead) {
          for (const pig of this.pigs) {
            pig.doAll(this.player.getX(), this.player.getY(), this.player);
          }
        }
        else {
          // If player is dead, just draw pigs in current state
          for (const pig of this.pigs) {
            if (pig && pig.pigSpi) {
              pig.pigSpi.update();
              pig.pigSpi.draw();
            }
          }
        }
      }
      // Update and draw player
      this.player.doAll(this.walls, this.pigs);
    }
  }

  // Draws the tile grid, decorations, and grid lines
  drawGrid() {
    noStroke();
    fill(62, 56, 80);
    rect(0, 0, this.cols * this.tileSize, this.rows * this.tileSize);

    imageMode(CORNER);

    // Draw base tiles
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const src = this.layers.base[y][x];
        if (src && this.images[src]) {
          image(this.images[src], x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
        }
      }
    }

    // Draw decoration tiles
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const src = this.layers.decoration[y][x];
        if (src && this.images[src]) {
          image(this.images[src], x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
        }
      }
    }

    // Draw grid lines
    noStroke(1);
    fill(62, 56, 80);
    for (let i = 0; i <= this.cols; i++) {
      line(i * this.tileSize, 0, i * this.tileSize, this.rows * this.tileSize);
    }
    for (let i = 0; i <= this.rows; i++) {
      line(0, i * this.tileSize, this.cols * this.tileSize, i * this.tileSize);
    }
  }

  // Handles loading a map file and spawning objects
  handleFile(file) {
    const PLAYER_SPAWN_TILE = "blocks/decoration/dec21.png";
    const PIG_SPAWN_TILE = "blocks/decoration/dec22.png";

    // Remove previous player and pigs
    if (this.player instanceof King) {
      this.player.destroy();
      this.player = null;
    }

    if (Array.isArray(this.pigs)) {
      for (const oldPig of this.pigs) {
        if (typeof oldPig.destroy === 'function') {
          oldPig.destroy();
        }
        else if (oldPig.pigSpi && typeof oldPig.pigSpi.remove === 'function') {
          oldPig.pigSpi.remove();
        }
      }
      this.pigs = [];
    }
    
    // Validate file
    if (!file || !file.data) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.json')) {
      alert('Please select a .json file');
      return;
    }

    try {
      // Parse map data
      const data = typeof file.data === 'string' ? JSON.parse(file.data) : file.data;

      // Validate base layer structure
      if (!Array.isArray(data.base) || data.base.length !== this.rows ||
          !data.base.every(r => Array.isArray(r) && r.length === this.cols)) {
        throw new Error('Missing or malformed base layer');
      }

      this.layers.base = data.base;

      // Validate decoration layer structure
      if (Array.isArray(data.decoration) && data.decoration.length === this.rows &&
          data.decoration.every(r => Array.isArray(r) && r.length === this.cols)) {
        this.layers.decoration = data.decoration;
      }
      else {
        this.layers.decoration = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
      }

      // Build wall colliders for the map
      this.buildWallColliders();

      // Find player and pig spawn positions
      let playerSpawnPos = null;
      const pigSpawnPositions = [];

      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          const tile = this.layers.decoration[y][x];
          if (tile === PLAYER_SPAWN_TILE) {
            playerSpawnPos = { x, y };
            this.layers.decoration[y][x] = null;
          }
          else if (tile === PIG_SPAWN_TILE) {
            pigSpawnPositions.push({ x, y });
            this.layers.decoration[y][x] = null;
          }
        }
      }

      // Create player (King) and set spawn position
      this.player = new King();
      if (!this.kingSpriteSheet) {
        throw new Error("King sprite sheet not loaded.");
      }
      this.player.pre(this.kingSpriteSheet);

      const offsetX = (width - this.cols * this.tileSize) / 2;
      const offsetY = (height - this.rows * this.tileSize) / 2;

      if (playerSpawnPos) {
        this.player.hitBox.position.x = offsetX + playerSpawnPos.x * this.tileSize + this.tileSize / 2;
        this.player.hitBox.position.y = offsetY + playerSpawnPos.y * this.tileSize + this.tileSize / 2;
      }
      else {
        this.player.respawn();
      }

      this.player.spi.visible = true;

      // Create pigs at their spawn positions
      this.pigs = [];
      for (const pos of pigSpawnPositions) {
        if (!this.pigSpriteSheet) {
          throw new Error("Pig sprite sheet not loaded.");
        }

        const pig = new Pig(
          offsetX + pos.x * this.tileSize + this.tileSize / 2,
          offsetY + pos.y * this.tileSize + this.tileSize / 2
        );

        pig.pre(this.pigSpriteSheet);
        pig.pigSpi.visible = true;
        this.pigs.push(pig);
      }

      // Enable gravity
      world.gravity.y = 9;

      console.log('Map loaded successfully!');
    }
    catch (err) {
      alert('Invalid map file: ' + err.message);
      console.error(err);
    }
  }

  // Builds wall colliders for all wall and certain decoration tiles
  buildWallColliders() {
    // Remove previous wall sprites
    for (let i = this.walls.length - 1; i >= 0; i--) {
      this.walls[i].remove();
    }
    // Remove pigs and player if present
    if (this.pigs) {
      this.pigs.forEach(p => {
        if (typeof p.remove === "function") {
          p.remove();
        }
      });
      this.pigs = [];
      this.player = null;
    }

    // Calculate grid offset for centering
    const gridW = this.cols * this.tileSize;
    const gridH = this.rows * this.tileSize;
    const offsetX = (width - gridW) / 2;
    const offsetY = (height - gridH) / 2;

    // Add wall colliders for wall tiles
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const src = this.layers.base[y][x];
        if (src && this.wallPaths.includes(src)) {
          let s = new Sprite(
            offsetX + x * this.tileSize + this.tileSize / 2,
            offsetY + y * this.tileSize + this.tileSize / 2,
            this.tileSize, this.tileSize
          );
          s.collider = 'static';
          s.debug = true;
          s.color = color(255, 0, 0, 100);
          this.walls.add(s);
        }
      }
    }

    // Add wall colliders for certain decoration tiles (platforms, etc.)
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const src = this.layers.decoration[y][x];
        const match = src ? src.match(/dec(\d+)\.png$/) : null;
        if (match) {
          const num = parseInt(match[1]);

          if (num >= 1 && num <= 4) {
            // Platform type 1-4
            let s = new Sprite(
              offsetX + x * this.tileSize + this.tileSize / 2,
              offsetY + y * this.tileSize + this.tileSize / 4 - 4,
              this.tileSize,
              this.tileSize / 3
            );
            s.collider = 'static';
            s.debug = true;
            s.color = color(255, 0, 0, 100);
            this.walls.add(s);
          }
          else if (num >= 9 && num <= 12) {
            // Thin platform type 9-12
            let s = new Sprite(
              offsetX + x * this.tileSize + this.tileSize / 2,
              offsetY + y * this.tileSize + this.tileSize / 4 - 8,
              this.tileSize,
              this.tileSize / 8
            );
            s.collider = 'static';
            s.debug = true;
            s.color = color(255, 0, 0, 100);
            this.walls.add(s);
          }
          else if (num === 23) {
            // Special collider for decoration 23
            let s = new Sprite(
              offsetX + x * this.tileSize + this.tileSize / 3,
              offsetY + y * this.tileSize + this.tileSize * 0.75,
              this.tileSize/2 + 4,
              this.tileSize / 3 + 4
            );
            s.collider = 'static';
            s.debug = true;
            s.color = color(255, 0, 0, 100);
            this.walls.add(s);
          }
        }
      }
    }
  }
}

// Expose MapLoader globally
window.MapLoader = MapLoader;
