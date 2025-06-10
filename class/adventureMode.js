// class/adventureMode.js
class AdventureMode {
  constructor({ cols, rows, tileSize, bgCount, wallCount, decCount }) {
    this.cols      = cols;
    this.rows      = rows;
    this.tileSize  = tileSize;
    this.bgCount    = bgCount;
    this.wallCount  = wallCount;
    this.decCount   = decCount;

    // Layers for tiles
    this.layers = {
      base:       Array.from({ length: rows }, () => Array(cols).fill(null)),
      decoration: Array.from({ length: rows }, () => Array(cols).fill(null))
    };

    // Image assets
    this.images    = {};
    this.bgPaths    = [];
    this.wallPaths  = [];
    this.decPaths   = [];

    // Entities and colliders
    this.player = null;
    this.pigs   = [];
    this.walls  = new Group();

    this.currentMap = 1;  // Always start at 1
    this.totalMaps = 5;
    this.isTransitioning = false;
    this.canExit = false;
  }

  get offsetX() { 
    return (width  - this.cols * this.tileSize) / 2; 
  }
  get offsetY() { 
    return (height - this.rows * this.tileSize) / 2; 
  }

  preload() {
    // Preload tile images
    for (let i = 1; i <= this.bgCount; i++) {
      const p = `blocks/backgroundWalls/bg${i}.png`;
      this.bgPaths.push(p);
      this.images[p] = loadImage(p);
    }
    for (let i = 1; i <= this.wallCount; i++) {
      const p = `blocks/walls/wa${i}.png`;
      this.wallPaths.push(p);
      this.images[p] = loadImage(p);
    }
    for (let i = 1; i <= this.decCount; i++) {
      const p = `blocks/decoration/dec${i}.png`;
      this.decPaths.push(p);
      this.images[p] = loadImage(p);
    }
    // Preload sprites
    this.kingSheet = loadImage("asset/king_human_full.png");
    this.pigSheet  = loadImage("asset/pig.png");
    // Preload JSON map
    this.mapData   = loadJSON('asset/Map-1.json');
  }

  // Add new method to load maps
  loadMap(mapNumber) {
    this.isTransitioning = true;
    console.log("Attempting to load map:", mapNumber); // Debug log
    
    // First cleanup existing entities
    this._cleanupCurrentLevel();
    
    // Load new map
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
        
        // Store current level
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

  completeLevel() {
    if (this.isTransitioning) {
      return;
    }
    
    this.isTransitioning = true;
    console.log("Completing level:", this.currentMap); // Debug log

    // Use the game's background color for transition
    background(62, 56, 80);

    // Cleanup current level
    this._cleanupCurrentLevel();

    // Load next level after shorter delay
    setTimeout(() => {
      const nextLevel = this.currentMap + 1;
      console.log("Next level will be:", nextLevel); // Debug log
      
      if (nextLevel > this.totalMaps) {
        console.log("Game complete, returning to menu"); // Debug log
        location.reload();
        return;
      }

      this.loadMap(nextLevel);
    }, 500); // Reduced to 500ms for faster transition
  }

  // Add level completion check
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
        const zoneLeft = rightX - this.tileSize * 8;    // 8 tiles wide
        const zoneRight = rightX + this.tileSize;
        const zoneTop = exitY - this.tileSize * 6;      // 6 tiles up
        const zoneBottom = exitY + this.tileSize * 2;     // 2 tiles down

        const playerX = this.player.getX();
        const playerY = this.player.getY();

        // Debug visualization
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

  _cleanupCurrentLevel() {
    // Clean up all sprites and colliders
    if (this.walls) {
      // Remove all wall sprites
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

    // Reset layers
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

  setup() {
    // Create canvas sized to grid
    createCanvas(windowWidth, windowHeight);
    noSmooth();

    // Initialize game world
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

    // Add null checks for entities
    if (this.player && typeof this.player.doAll === 'function') {
      this.player.doAll(this.walls, this.pigs);
    }

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

    // Assign layers
    this.layers.base = data.base.map(r => [...r]);
    this.layers.decoration = data.decoration.map(r => [...r]);

    // Build new level
    this._buildWallColliders();
    this._spawnEntities();

    // Enable gravity
    world.gravity.y = 9;
  }

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
    // Grid lines
    noStroke(1);
    fill(62, 56, 80);
    for (let i = 0; i <= this.cols; i++) {
      line(i*this.tileSize, 0, i*this.tileSize, this.rows*this.tileSize);
    }
    for (let j = 0; j <= this.rows; j++) {
      line(0, j*this.tileSize, this.cols*this.tileSize, j*this.tileSize);
    }
  }

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

    // Build wall colliders
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

    // Add decoration colliders
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

    // Spawn new entities
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

window.AdventureMode = AdventureMode;
