// AdventureMode class handles the main logic for adventure mode gameplay
class AdventureMode {
  constructor({ cols, rows, tileSize, bgCount, wallCount, decCount }) {
    // Grid and tile setup
    this.cols      = cols;
    this.rows      = rows;
    this.tileSize  = tileSize;
    this.bgCount    = bgCount;
    this.wallCount  = wallCount;
    this.decCount   = decCount;

    // Tile layers for base and decoration
    this.layers = {
      base:       Array.from({ length: rows }, () => Array(cols).fill(null)),
      decoration: Array.from({ length: rows }, () => Array(cols).fill(null))
    };

    // Image asset storage
    this.images    = {};
    this.bgPaths    = [];
    this.wallPaths  = [];
    this.decPaths   = [];

    // Entities and colliders
    this.player = null;
    this.pigs   = [];
    this.walls  = new Group();

    // Map and state tracking
    this.currentMap = 1;  // Always start at 1
    this.totalMaps = 5;
    this.isTransitioning = false;
    this.canExit = false;
    // Track last completed level using localStorage
    this.lastCompletedLevel = parseInt(localStorage.getItem('lastCompletedLevel')) || 0;
  }

  // Calculate horizontal offset for centering grid
  get offsetX() { 
    return (width  - this.cols * this.tileSize) / 2; 
  }
  // Calculate vertical offset for centering grid
  get offsetY() { 
    return (height - this.rows * this.tileSize) / 2; 
  }

  // Preload all tile and sprite images
  preload() {
    // Preload background tiles
    for (let i = 1; i <= this.bgCount; i++) {
      const p = `blocks/backgroundWalls/bg${i}.png`;
      this.bgPaths.push(p);
      this.images[p] = loadImage(p);
    }
    // Preload wall tiles
    for (let i = 1; i <= this.wallCount; i++) {
      const p = `blocks/walls/wa${i}.png`;
      this.wallPaths.push(p);
      this.images[p] = loadImage(p);
    }
    // Preload decoration tiles
    for (let i = 1; i <= this.decCount; i++) {
      const p = `blocks/decoration/dec${i}.png`;
      this.decPaths.push(p);
      this.images[p] = loadImage(p);
    }
    // Preload player and pig sprites
    this.kingSheet = loadImage("asset/king_human_full.png");
    this.pigSheet  = loadImage("asset/pig.png");
  }

  // Load a map by number and set up the level
  loadMap(mapNumber) {
    this.isTransitioning = true;
    console.log("Attempting to load map:", mapNumber); // Debug log
    
    // Clean up any existing entities and sprites
    this._cleanupCurrentLevel();
    
    // Fetch map data from JSON file
    fetch(`adventure/${mapNumber}.json`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (!data || !data.base || !data.decoration) {
          throw new Error('Invalid map data structure');
        }
        
        this.mapData = data;
        this._applyMapData(this.mapData);
        
        // Update current map number
        this.currentMap = mapNumber;
        console.log("Successfully loaded map:", this.currentMap); // Debug log
        
        setTimeout(() => {
          this.isTransitioning = false;
        }, 500);
      })
      .catch(error => {
        console.error('Error loading map:', error);
        this.isTransitioning = false;
        // Don't reload on error, just log it
        console.error('Failed to load map:', mapNumber);
      });
  }

  // Save progress to localStorage
  _saveProgress() {
    localStorage.setItem('lastCompletedLevel', this.currentMap.toString());
  }

  // Handle level completion and transition to next level
  completeLevel() {
    if (this.isTransitioning) {
      return;
    }
    
    this.isTransitioning = true;
    console.log("Completing level:", this.currentMap);

    // Save progress when completing a level
    this._saveProgress();

    // Stage 1: Clean up current level and show purple background
    this._cleanupCurrentLevel();
    clear();
    background(62, 56, 80);

    const nextLevel = this.currentMap + 1;
    
    // If all levels are done, reload to menu
    if (nextLevel > this.totalMaps) {
      console.log("Game complete, returning to menu");
      location.reload();
      return;
    }

    // Stage 2: Show black screen after 0.5 seconds
    setTimeout(() => {
      background(0);

      // Stage 3: Load next level after black screen shown for 0.5 seconds
      setTimeout(() => {
        // Reset player stats
        if (this.player) {
          this.player.lives = MAX_LIVES;
          this.player.health = MAX_HITS;
          this.player.isDead = false;
        }

        // Load next level instead of reloading page
        this.loadMap(nextLevel);
        this.currentMap = nextLevel;
      }, 500);
      
    }, 500);
  }

  // Check if level is complete (all pigs dead, player alive, player at exit)
  checkLevelComplete() {
    // Only check if we have both player and pigs
    if (!this.player || !Array.isArray(this.pigs)) {
      return;
    }

    // Check if player is alive and all pigs are dead
    const allPigsDead = this.pigs.every(pig => pig && pig.dead);
    const playerAlive = !this.player.isDead;

    if (allPigsDead && playerAlive) {
      console.log("All pigs dead, player alive");

      // Find the exit row (first row with all wa44 tiles)
      let exitRow = -1;
      for (let y = this.rows - 1; y >= 0; y--) {  // Search from bottom up
        if (this.layers.base[y].every(tile => tile === 'blocks/walls/wa44.png')) {
          exitRow = y;
          break;
        }
      }

      if (exitRow !== -1) {
        // Find rightmost position in this row
        const rightX = this.offsetX + (this.cols - 1) * this.tileSize;
        const exitY = this.offsetY + exitRow * this.tileSize;

        // Define a MUCH larger exit zone
        const zoneLeft = rightX - this.tileSize * 2;    // 3 tiles wide
        const zoneRight = rightX + this.tileSize;
        const zoneTop = exitY - this.tileSize * 6;      // 6 tiles up
        const zoneBottom = exitY + this.tileSize ;     // 2 tiles down

        const playerX = this.player.getX();
        const playerY = this.player.getY();

        // Debug visualization for exit zone
        push();
        noFill();
        stroke(255, 0, 0);
        rect(zoneLeft, zoneTop, zoneRight - zoneLeft, zoneBottom - zoneTop);
        pop();

        // Add buffer to player position check
        const buffer = 10;
        if (playerX >= zoneLeft - buffer && 
            playerX <= zoneRight + buffer && 
            playerY >= zoneTop - buffer && 
            playerY <= zoneBottom + buffer) {
          console.log("COMPLETING LEVEL!");
          this.completeLevel();
        }
      }
    }
  }

  // Remove all sprites, colliders, and reset layers
  _cleanupCurrentLevel() {
    // Clean up all wall sprites
    if (this.walls) {
      for (let wall of this.walls) {
        if (wall) {
          wall.remove();
        }
      }
      this.walls = new Group();
    }

    // Clean up player
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
    
    // Clean up pigs
    if (this.pigs) {
      this.pigs.forEach(pig => {
        if (pig && typeof pig.destroy === 'function') {
          pig.destroy();
        }
      });
      this.pigs = [];
    }

    // Remove all remaining static colliders
    for (let sprite of allSprites) {
      if (sprite && sprite.collider === 'static') {
        sprite.remove();
      }
    }

    // Reset tile layers
    this.layers = {
      base: Array.from({ length: this.rows }, () => Array(this.cols).fill(null)),
      decoration: Array.from({ length: this.rows }, () => Array(this.cols).fill(null))
    };

    // Remove all sprites one by one instead of using clear()
    while (allSprites.length > 0) {
      if (allSprites[0]) {
        allSprites[0].remove();
      }
    }
  }

  // Set up canvas and UI
  setup() {
    // Create canvas sized to grid
    createCanvas(windowWidth, windowHeight);
    noSmooth();

    // Initialize game world gravity
    world.gravity.y = 9;

    // Back button setup
    this.backBtn = createButton('Back')
      .position(10, 10)
      .size(100, 30)
      .style('background-color', '#3E3850')
      .style('color','#ffffff')
      .style('border','none')
      .style('border-radius','6px')
      .style('font-size','16px')
      .style('font-family','Arial, sans-serif')
      .style('cursor','pointer')
      .mousePressed(() => location.reload());
    this.backBtn.mouseOver(() => this.backBtn.style('background-color', '#8541ee'));
    this.backBtn.mouseOut(() => this.backBtn.style('background-color', '#3E3850'));
  }

  // Main draw loop for adventure mode
  draw() {
    background(62, 56, 80);

    const gridW = this.cols * this.tileSize;
    const gridH = this.rows * this.tileSize;
    const offsetX = (width - gridW) / 2;
    const offsetY = (height - gridH) / 2;

    push();
    translate(offsetX, offsetY);
    this._drawGrid();
    pop();

    // Update player logic
    if (this.player && typeof this.player.doAll === 'function') {
      this.player.doAll(this.walls, this.pigs);
    }

    // Update pig logic
    if (Array.isArray(this.pigs)) {
      for (const pig of this.pigs) {
        if (pig && typeof pig.doAll === 'function' && this.player) {
          pig.doAll(this.player.getX(), this.player.getY(), this.player);
        }
      }
    }

    // Check level completion conditions
    if (!this.isTransitioning) {
      this.checkLevelComplete();
    }

    // Draw transition overlay if needed
    if (this.isTransitioning) {
      background(62, 56, 80);
    }
  }

  // Apply map data to layers and build level
  _applyMapData(data) {
    if (!data || !data.base || !data.decoration) {
      console.error('Invalid map data structure');
      return;
    }

    // Clear existing walls
    for (let wall of this.walls) {
      wall.remove();
    }
    this.walls = new Group();

    // Assign layers from map data
    this.layers.base = data.base.map(r => [...r]);
    this.layers.decoration = data.decoration.map(r => [...r]);

    // Build wall colliders and spawn entities
    this._buildWallColliders();
    this._spawnEntities();

    // Enable gravity
    world.gravity.y = 9;
  }

  // Draw the grid and all tiles
  _drawGrid() {
    imageMode(CORNER);
    // Draw base layer
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const src = this.layers.base[y][x];
        if (src) {
          image(this.images[src], x*this.tileSize, y*this.tileSize, this.tileSize, this.tileSize);
        }
      }
    }
    // Draw decoration layer
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const src = this.layers.decoration[y][x];
        if (src) {
          image(this.images[src], x*this.tileSize, y*this.tileSize, this.tileSize, this.tileSize);
        }
      }
    }
    // Draw grid lines
    noStroke(1);
    fill(62, 56, 80);
    for (let i = 0; i <= this.cols; i++) {
      line(i*this.tileSize, 0, i*this.tileSize, this.rows*this.tileSize);
    }
    for (let j = 0; j <= this.rows; j++) {
      line(0, j*this.tileSize, j*this.tileSize, this.rows*this.tileSize);
    }
  }

  // Build wall and decoration colliders for the level
  _buildWallColliders() {
    // Remove existing walls
    for (let i = this.walls.length - 1; i >= 0; i--) {
      this.walls[i].remove();
    }

    // Remove existing pigs
    if (this.pigs) {
      this.pigs.forEach(p => {
        if (typeof p.remove === "function") {
          p.remove();
        }
      });
      this.pigs = [];
    }

    const gridW = this.cols * this.tileSize;
    const gridH = this.rows * this.tileSize;
    const offsetX = (width - gridW) / 2;
    const offsetY = (height - gridH) / 2;

    // Build wall colliders from base layer
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

    // Add decoration colliders for certain decoration tiles
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const src = this.layers.decoration[y][x];
        const match = src ? src.match(/dec(\d+)\.png$/) : null;
        if (match) {
          const num = parseInt(match[1]);

          if (num >= 1 && num <= 4) {
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

  // Spawn player and pig entities based on decoration tiles
  _spawnEntities() {
    const PLAYER_SPAWN = 'blocks/decoration/dec21.png';
    const PIG_SPAWN = 'blocks/decoration/dec22.png';
    
    const gridW = this.cols * this.tileSize;
    const gridH = this.rows * this.tileSize;
    const offsetX = (width - gridW) / 2;
    const offsetY = (height - gridH) / 2;

    // Clean up existing entities
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }

    if (this.pigs) {
      this.pigs.forEach(pig => pig?.destroy());
      this.pigs = [];
    }

    // Spawn new entities based on map data
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const tile = this.layers.decoration[y][x];
        
        if (tile === PLAYER_SPAWN) {
          const spawnX = offsetX + x * this.tileSize + this.tileSize/2;
          const spawnY = offsetY + y * this.tileSize + this.tileSize/2;
          
          this.player = new King();
          this.player.pre(this.kingSheet);
          this.player.hitBox.position.x = spawnX;
          this.player.hitBox.position.y = spawnY;
          this.layers.decoration[y][x] = null;
        }
        else if (tile === PIG_SPAWN) {
          const spawnX = offsetX + x * this.tileSize + this.tileSize/2;
          const spawnY = offsetY + y * this.tileSize + this.tileSize/2;
          
          const pig = new Pig(spawnX, spawnY);
          pig.pre(this.pigSheet);
          this.pigs.push(pig);
          this.layers.decoration[y][x] = null;
        }
      }
    }

    // Make sure pigs array exists
    if (!this.pigs) {
      this.pigs = [];
    }

    console.log("Spawned entities:", {
      player: this.player ? "spawned" : "not spawned",
      pigs: this.pigs.length
    });
  }
}

// Expose AdventureMode
window.AdventureMode = AdventureMode;
