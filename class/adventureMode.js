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

    this.currentMap = 1;

    this.levelComplete = false;
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

  setup() {
    // Create canvas sized to grid
    createCanvas(windowWidth, windowHeight);
    noSmooth();

    const offsetX = this.offsetX;
    const offsetY = this.offsetY;

    push();
    translate(offsetX, offsetY);
    this._drawGrid();
    pop();


    // Load JSON data into layers, build colliders & spawn
    this._applyMapData(this.mapData);

    // Back button: reload entire page to return to menu
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

    // Center the grid
    const gridW = this.cols * this.tileSize;
    const gridH = this.rows * this.tileSize;
    const offsetX = (width  - gridW) / 2;
    const offsetY = (height - gridH) / 2;

    push();
    translate(offsetX, offsetY);
    // Draw tiles + grid lines
    this._drawGrid();
    pop();

    // Draw entities
    this.player.doAll(this.walls, this.pigs);
    for (const pig of this.pigs) {
      pig.doAll(this.player.getX(), this.player.getY(), this.player);
    }
  }

  _applyMapData(data) {
    // Assign layers
    this.layers.base       = data.base.map(r => [...r]);
    this.layers.decoration = data.decoration.map(r => [...r]);

    // Build colliders for walls and decoration
    this._buildWallColliders();

    // Spawn player and pigs
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
    stroke(180);
    noFill();
    for (let i = 0; i <= this.cols; i++) {
      line(i*this.tileSize, 0, i*this.tileSize, this.rows*this.tileSize);
    }
    for (let j = 0; j <= this.rows; j++) {
      line(0, j*this.tileSize, this.cols*this.tileSize, j*this.tileSize);
    }
  }

  _buildWallColliders() {
    for (let i = this.walls.length - 1; i >= 0; i--) {
      this.walls[i].remove();
    }
    if (this.pigs) {
      this.pigs.forEach(p => {
        if (typeof p.remove === "function") {
          p.remove();
        }
      });
      this.pigs = [];
      this.player = null;
    }

    const gridW = this.cols * this.tileSize;
    const gridH = this.rows * this.tileSize;
    const offsetX = (width - gridW) / 2;
    const offsetY = (height - gridH) / 2;

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
    const oX = this.offsetX;
    const oY = this.offsetY;

    // King
    this.player = new King();
    this.player.pre(this.kingSheet);

    const PS = 'blocks/decoration/dec21.png';
    for (let y=0; y<this.rows; y++) {
      for (let x=0; x<this.cols; x++) {
        if (this.layers.decoration[y][x] === PS) {
          this.player.hitBox.position.x = oX + x*this.tileSize + this.tileSize/2;
          this.player.hitBox.position.y = oY + y*this.tileSize + this.tileSize/2;
          this.layers.decoration[y][x] = null;
        }
      }
    }

    const PG = 'blocks/decoration/dec22.png';
    this.pigs = [];

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.layers.decoration[y][x] === PG) {
          // compute the exact world‐position, including your offset:
          const spawnX = oX + x*this.tileSize + this.tileSize/2;
          const spawnY = oY + y*this.tileSize + this.tileSize/2;

          // hand those straight to the Pig constructor:
          const pig = new Pig(spawnX, spawnY);
          pig.pre(this.pigSheet);

          this.pigs.push(pig);
          this.layers.decoration[y][x] = null;
        }
      }
    }
  }
}



window.AdventureMode = AdventureMode;
