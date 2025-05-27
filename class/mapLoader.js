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
    this.player.pre();
  }

  setup() {
    createCanvas(windowWidth, windowHeight);
    noSmooth();

    this.player.respawn();

    this.fileInput = createFileInput(file => this.handleFile(file));
    this.fileInput.hide();
    createButton('Load Map')
      .position(10, 10)
      .mousePressed(() => this.fileInput.elt.click());
  }

  draw() {
    background(220);

    const gridW = this.cols * this.tileSize;
    const gridH = this.rows * this.tileSize;
    const offsetX = (width - gridW) / 2;
    const offsetY = (height - gridH) / 2;

    push();
    translate(offsetX, offsetY);
    this.drawGrid();
    pop();

    this.player.doAll(this.walls);
  }

  drawGrid() {
    noStroke();
    fill(255);
    rect(0, 0, this.cols * this.tileSize, this.rows * this.tileSize);

    imageMode(CORNER); // <== this is the key fix

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
    if (!file || !file.data) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.json')) {
      alert('Please select a .json file');
      return;
    }

    try {
      const data = typeof file.data === 'string' ? JSON.parse(file.data) : file.data;

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

      this.buildWallColliders();
      this.player.respawn();
      console.log('Map loaded successfully!');

    }
    catch (err) {
      alert('Invalid map file: ' + err.message);
    }
  }

  buildWallColliders() {
    this.walls.forEach(s => s.remove());

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
        }
      }
    }
  }
}

window.MapLoader = MapLoader;
