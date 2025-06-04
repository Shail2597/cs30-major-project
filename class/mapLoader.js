// class/mapLoader.js
class MapLoader {
  constructor({ cols, rows, tileSize, bgCount, wallCount, decCount }) {
    this.cols = cols;
    this.rows = rows;
    this.tileSize = tileSize;
    this.bgCount = bgCount;
    this.wallCount = wallCount;
    this.decCount = decCount;

    this.layers = {
      base: Array.from({ length: rows }, () => Array(cols).fill(null)),
      decoration: Array.from({ length: rows }, () => Array(cols).fill(null))
    };

    this.images = {};
    this.bgPaths = [];
    this.wallPaths = [];
    this.decPaths = [];

    this.fileInput = null;
    this.player = new King();
    this.walls = new Group();
    this.pig = null; // Pig will only be created after map is loaded
  }

  preload() {
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
    this.kingSpriteSheet = loadImage("asset/king_human_full.png");
    this.pigSpriteSheet = loadImage("asset/pig.png");
  }

  setup(){
    world.gravity.y = 9; // Set gravity for the game
    createCanvas(windowWidth, windowHeight);
    noSmooth();

    //this.player.respawn();
    // Do NOT respawn pig here

    this.fileInput = createFileInput(file => this.handleFile(file));
    this.fileInput.hide();
    this.loadBtn = createButton('Load Map')
      .position(10, 10)
      .size(100, 30)
      .style('background-color', '#6a0dad')
      .style('color', '#ffffff')
      .style('border', 'none')
      .style('border-radius', '8px')
      .style('padding', '8px 0px')
      .style('font-size', '16px')
      .style('font-family', 'Arial, sans-serif')
      .mousePressed(() => this.fileInput.elt.click());
    this.backBtn = createButton('Back')
      .position(10, 50)
      .size(100, 30)
      .style('background-color', '#6a0dad')
      .style('color', '#ffffff')
      .style('border', 'none')
      .style('border-radius', '8px')
      .style('padding', '8px 0px')
      .style('font-size', '16px')
      .style('font-family', 'Arial, sans-serif')
      .mousePressed(() => location.reload());

    this.loadBtn.mouseOver(() => {
      this.loadBtn.style('background-color', '#8541ee');
    });
    this.loadBtn.mouseOut(() => {
      this.loadBtn.style('background-color', '#6a0dad');
    }); 

    this.backBtn.mouseOver(() => {
      this.backBtn.style('background-color', '#8541ee');
    });
    this.backBtn.mouseOut(() => {
      this.backBtn.style('background-color', '#6a0dad');
    }); 
  }

  draw() {
    background(62, 56, 80);

    const gridW = this.cols * this.tileSize;
    const gridH = this.rows * this.tileSize;
    const offsetX = (width - gridW) / 2;
    const offsetY = (height - gridH) / 2;

    push();
    translate(offsetX, offsetY);
    this.drawGrid();
    pop();

    if (this.player && this.player.hitBox) {
      if (this.pigs && this.player?.hitBox) {
        for (const pig of this.pigs) {
          pig.doAll(this.player.getX(), this.player.getY(), this.player);
        }
      }
      this.player.doAll(this.walls, this.pig);
    }
  }

  drawGrid() {
    noStroke();
    fill(255);
    rect(0, 0, this.cols * this.tileSize, this.rows * this.tileSize);

    imageMode(CORNER);

    // base
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const src = this.layers.base[y][x];
        if (src && this.images[src]) {
          image(this.images[src], x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
        }
      }
    }

    // decoration
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const src = this.layers.decoration[y][x];
        if (src && this.images[src]) {
          image(this.images[src], x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
        }
      }
    }

    // grid lines
    stroke(180);
    noFill();
    for (let i = 0; i <= this.cols; i++) {
      line(i * this.tileSize, 0, i * this.tileSize, this.rows * this.tileSize);
    }
    for (let i = 0; i <= this.rows; i++) {
      line(0, i * this.tileSize, this.cols * this.tileSize, i * this.tileSize);
    }
  }

  handleFile(file) {
    const PLAYER_SPAWN_TILE = "blocks/decoration/dec21.png";
    const PIG_SPAWN_TILE = "blocks/decoration/dec22.png";

    if (!file || !file.data) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.json')) {
      alert('Please select a .json file');
      return;
    }

    try {
      const data = typeof file.data === 'string' ? JSON.parse(file.data) : file.data;

      // Validate map structure
      if (!Array.isArray(data.base) || data.base.length !== this.rows ||
          !data.base.every(r => Array.isArray(r) && r.length === this.cols)) {
        throw new Error('Missing or malformed base layer');
      }

      this.layers.base = data.base;

      if (Array.isArray(data.decoration) && data.decoration.length === this.rows &&
          data.decoration.every(r => Array.isArray(r) && r.length === this.cols)) {
        this.layers.decoration = data.decoration;
      }
      else {
        this.layers.decoration = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
      }

      // Build wall colliders
      this.buildWallColliders();

      // Scan for special tiles
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

      // Create King
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

      // Create Pigs
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
        pig.pigSpi.visible = true; // <-- FIXED HERE
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


  buildWallColliders() {
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
}

window.MapLoader = MapLoader;
