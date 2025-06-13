// MapGenerator class for creating and editing tile maps

class MapGenerator {
  constructor({ cols, rows, tileSize, bgCount, wallCount, decCount }) {
    // Set up grid dimensions and tile size
    this.COLS      = cols;
    this.ROWS      = rows;
    this.TILE_SIZE = tileSize;

    // Initialize map layers: base and decoration
    this.layers = {
      base:        Array.from({ length: rows }, () => Array(cols).fill(null)),
      decoration:  Array.from({ length: rows }, () => Array(cols).fill(null)),
    };

    // Store loaded images and current selection
    this.images  = {};
    this.current = null;
    this.mode    = 'base';

    // Prepare file paths for backgrounds, walls, and decorations
    this.BACKGROUNDS  = Array.from({ length: bgCount }, (_, i) =>
      `blocks/backgroundWalls/bg${i+1}.png`
    );
    this.WALLS        = Array.from({ length: wallCount }, (_, i) =>
      `blocks/walls/wa${i+1}.png`
    );
    this.DECORATIONS  = Array.from({ length: decCount }, (_, i) =>
      `blocks/decoration/dec${i+1}.png`
    );
  }

  // Preload all tile images
  preload() {
    [...this.BACKGROUNDS, ...this.WALLS, ...this.DECORATIONS].forEach(src => {
      this.images[src] = loadImage(src);
    });
  }

  // Set up canvas, UI, and event listeners
  setup() {
    // Sidebar width for selectors
    this.sidebarW = 3 * (this.TILE_SIZE + 14) + 16;

    // Create main canvas for map editing
    const cnv = createCanvas(
      this.COLS * this.TILE_SIZE,
      this.ROWS * this.TILE_SIZE
    );
    noSmooth();
    cnv.position(this.sidebarW, 0);

    // Build selectors and controls
    this._buildBaseSelector();
    this._buildDecSelector(this.sidebarW + this.COLS * this.TILE_SIZE + 16);
    this._buildControls();

    // Set default selection to first background
    this.current = this.BACKGROUNDS[0];
    this.mode    = 'base';
    this._highlightBase(0);

    // Disable default right-click menu on the page
    document.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  // Draw the map and grid, handle right-click drawing
  draw() {
    background(225);
    imageMode(CORNER);
    this._drawLayer('base');
    this._drawLayer('decoration');
    stroke(180); noFill();
    // Draw vertical grid lines
    for (let x = 0; x <= this.COLS; x++) {
      line(x*this.TILE_SIZE, 0, x*this.TILE_SIZE, height);
    }
    // Draw horizontal grid lines
    for (let y = 0; y <= this.ROWS; y++) {
      line(0, y*this.TILE_SIZE, width, y*this.TILE_SIZE);
    }

    // Allow drawing with right mouse button held down
    if (mouseIsPressed && mouseButton === RIGHT) {
      this._placeTile();
    }
  }

  // Handle left mouse button for placing tiles
  mousePressed() {
    if (mouseButton === LEFT) {
      this._placeTile();
    }
  }

  // Place or erase a tile at the mouse position
  _placeTile() {
    if (mouseX < width && mouseY < height) {
      const gx = floor(mouseX / this.TILE_SIZE);
      const gy = floor(mouseY / this.TILE_SIZE);
      if (gx >= 0 && gx < this.COLS && gy >= 0 && gy < this.ROWS) {
        if (this.mode === 'erase') {
          // Erase both layers at this cell
          this.layers.base[gy][gx]       = null;
          this.layers.decoration[gy][gx] = null;
        }
        else if (this.current) {
          // Place selected tile in the current layer
          this.layers[this.mode][gy][gx] = this.current;
          this._checkComplete();
        }
      }
    }
  }

  // Draw a specific layer (base or decoration)
  _drawLayer(name) {
    for (let y = 0; y < this.ROWS; y++) {
      for (let x = 0; x < this.COLS; x++) {
        const src = this.layers[name][y][x];
        if (src) {
          image(
            this.images[src],
            x*this.TILE_SIZE, y*this.TILE_SIZE,
            this.TILE_SIZE,  this.TILE_SIZE
          );
        }
      }
    }
  }

  // Build the sidebar for selecting backgrounds and walls
  _buildBaseSelector() {
    const w = 3*(this.TILE_SIZE+4) + 16;
    this.baseSel = createDiv().id('selector-base').style(`
      position:fixed; top:0; left:0;
      width:${w}px; height:100vh;
      display:grid; grid-template-columns:repeat(3, ${this.TILE_SIZE}px);
      gap:4px; padding:8px; background:#f0f0f0; overflow-y:auto;
    `);

    [...this.BACKGROUNDS, ...this.WALLS].forEach((src,i) => {
      createImg(src,'')
        .parent(this.baseSel)
        .size(this.TILE_SIZE,this.TILE_SIZE)
        .style('cursor:pointer;border:2px solid transparent')
        .mouseClicked(() => {
          this.current = src;
          this.mode    = 'base';
          this._highlightBase(i);
        });
    });
  }

  // Build the sidebar for selecting decorations
  _buildDecSelector(left) {
    const w = 3*(this.TILE_SIZE+4) + 16;
    this.decSel = createDiv().id('selector-dec').style(`
      position:fixed; top:0; left:${left}px;
      width:${w}px; height:100vh;
      display:grid; grid-template-columns:repeat(3, ${this.TILE_SIZE}px);
      gap:4px; padding:8px; background:#e8f7e8; overflow-y:auto;
    `);

    this.DECORATIONS.forEach((src,i) => {
      createImg(src,'')
        .parent(this.decSel)
        .size(this.TILE_SIZE,this.TILE_SIZE)
        .style('cursor:pointer;border:2px solid transparent')
        .mouseClicked(() => {
          this.current = src;
          this.mode    = 'decoration';
          this._highlightDec(i);
        });
    });
  }

  // Build control buttons (Save, Back, Erase)
  _buildControls() {
    this.controls = createDiv().id('controls').style(`
      position:fixed; left:${this.sidebarW}px; bottom:8px;
      display:flex; gap:8px;
    `);
    // Save button (disabled until map is complete)
    this.saveBtn = createButton('Save').parent(this.controls)
      .attribute('disabled','').size(100,40).style('background-color', '#3E3850').style('color','#ffffff').style('border', 'none').style('border-radius','6px').style('font-size', '16px').style('font-family', 'Ariel, sans-serif').style('cursor', 'pointer').mouseClicked(() => this._save());
    // Back button (reloads the page)
    this.backBtn = createButton('Back').parent(this.controls)
      .size(100,40).style('background-color', '#3E3850').style('color','#ffffff').style('border', 'none').style('border-radius','6px').style('font-size', '16px').style('font-family', 'Ariel, sans-serif').style('cursor', 'pointer').mouseClicked(() => location.reload());
    // Erase button (switches to erase mode)
    this.eraseBtn = createButton('Erase').parent(this.controls)
      .size(100, 40).style('background-color', '#a00').style('color', '#fff').style('border', 'none').style('border-radius', '6px').style('font-size', '16px').style('font-family', 'Arial, sans-serif').style('cursor', 'pointer').mouseClicked(() => {
        this.mode = 'erase';
      });
    // Button hover effects
    this.eraseBtn.mouseOver(() => this.eraseBtn.style('background-color', '#c33'));
    this.eraseBtn.mouseOut(() => this.eraseBtn.style('background-color', '#a00'));

    this.saveBtn.mouseOver(() => {
      this.saveBtn.style('background-color', '#8541ee');
    });
    this.saveBtn.mouseOut(() => {
      this.saveBtn.style('background-color', '#3E3850');
    });
    
    this.backBtn.mouseOver(() => {
      this.backBtn.style('background-color', '#8541ee');
    });
    this.backBtn.mouseOut(() => {
      this.backBtn.style('background-color', '#3E3850');
    }); 
  }

  // Highlight the selected base tile in the sidebar
  _highlightBase(idx) {
    this.baseSel.elt.querySelectorAll('img')
      .forEach((img,i) => img.style.borderColor = i===idx?'#0077cc':'transparent');
  }

  // Highlight the selected decoration tile in the sidebar
  _highlightDec(idx) {
    this.decSel.elt.querySelectorAll('img')
      .forEach((img,i) => img.style.borderColor = i===idx?'#0077cc':'transparent');
  }

  // Enable save button if all base tiles are filled
  _checkComplete() {
    const bgDone = this.layers.base.every(r=>r.every(c=>c));
    if (bgDone) {
      this.saveBtn.removeAttribute('disabled');
    }
    else {
      this.saveBtn.attribute('disabled','');
    }
  }

  // Save the map to localStorage and download as JSON
  _save() {
    const data = JSON.stringify(this.layers);
    localStorage.setItem('savedMap', data);
    const blob = new Blob([data],{type:'application/json'});
    const url  = URL.createObjectURL(blob);
    const a    = createA(url,'map.json').attribute('download','map.json').hide();
    a.elt.click(); URL.revokeObjectURL(url);
  }
}

// Make MapGenerator available globally
window.MapGenerator = MapGenerator;