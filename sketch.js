// sketch.js

let mg, ml;
let state = "intro";      // "intro" | "mapEditor" | "mapLoader" | "adventure" | "keyBinds"
let prevState = null;     // remembers previous state
let introImg;

// ─── CUSTOM KEY‐BIND MANAGER ───────────────────────────────────────
let controls;
let rebindAction = null;
let keyBindBtns = {};
// ───────────────────────────────────────────────────────────────────

// Utility: convert keyCode to human‐readable label
function codeToLabel(code) {
  switch (code) {
  case UP_ARROW:    return '↑';
  case DOWN_ARROW:  return '↓';
  case LEFT_ARROW:  return '←';
  case RIGHT_ARROW: return '→';
  default:          return String.fromCharCode(code);
  }
}

// Intro‐screen buttons:
let btnMapEditor, btnAdventure, btnMapLoader;
// Pause/Key‐Binds UI:
let backButtonKB;

function preload() {
  introImg = loadImage("asset/introWindow.png");
  mg = new MapGenerator({ cols: 20, rows: 14, tileSize: 64, bgCount: 47, wallCount: 47, decCount: 23 });
  mg.preload();
  ml = new MapLoader({ cols: 20, rows: 14, tileSize: 64, bgCount: 47, wallCount: 47, decCount: 23 });
  ml.preload();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Initialize controls after p5 constants are available
  controls = {
    up:    UP_ARROW,
    down:  DOWN_ARROW,
    left:  LEFT_ARROW,
    right: RIGHT_ARROW
  };

  if (state === "intro") {
    setupIntroScreen();
  }
}

function draw() {
  background(62, 56, 80);

  if (state === "intro") {
    imageMode(CORNER);
    image(introImg, 0, 0, width, height);
  }
  else if (state === "mapEditor") {
    mg.draw();
  }
  else if (state === "mapLoader") {
    ml.draw();
  }
  else if (state === "adventure") {
    // Placeholder for adventure mode
  }
  else if (state === "keyBinds") {
    imageMode(CORNER);
    image(introImg, 0, 0, width, height);

    if (prevState === "mapEditor") {
      // Map Generator instructions
      fill(255);
      textSize(16);
      textAlign(LEFT, TOP);
      text(
        "Map Generator Instructions:\n" +
        "- Click “Generate” to make a new random map.\n" +
        "- Use the tile palette to place walls or decorations.\n" +
        "- Click “Save” to download your layout.\n" +
        "- Press ESC or Back to resume.",
        50,
        height * 0.2,
        width - 100
      );
    }
    else {
      //key-bind UI for other modes
      const startY = height * 0.2;
      const lineH  = 50;
      fill(255);
      textSize(18);
      textAlign(LEFT, CENTER);
      ['up','down','left','right'].forEach((act,i) => {
        const y = startY + i * lineH;
        text(act.toUpperCase() + ':', 50, y);
      });
    }
  }
}


// -------------------------------------------------
// SETUP & UI: Intro Screen
// -------------------------------------------------
function setupIntroScreen() {
  btnMapEditor = createButton("Start Map Editor");
  btnMapEditor.position(width/2 - 100, height/2 + 60);
  btnMapEditor.size(200, 40);
  styleButton(btnMapEditor);
  btnMapEditor.mousePressed(() => {
    removeIntroButtons(); state = "mapEditor"; mg.setup(); 
  });

  btnAdventure = createButton("Adventure Mode");
  btnAdventure.position(width/2 - 100, height/2 + 10);
  btnAdventure.size(200, 40);
  styleButton(btnAdventure);

  btnMapLoader = createButton("Map Loader");
  btnMapLoader.position(width/2 - 100, height/2 + 110);
  btnMapLoader.size(200, 40);
  styleButton(btnMapLoader);
  btnMapLoader.mousePressed(() => {
    removeIntroButtons(); state = "mapLoader"; ml.setup(); 
  });

  [btnMapEditor, btnAdventure, btnMapLoader].forEach(btn => {
    btn.mouseOver(() => btn.style('background-color', '#8541ee'));
    btn.mouseOut (() => btn.style('background-color', '#3E3850'));
  });
}

function styleButton(btn) {
  btn.style("background-color", "#3E3850");
  btn.style("color", "#ffffff");
  btn.style("border", "none");
  btn.style("border-radius", "8px");
  btn.style("padding", "8px 0px");
  btn.style("font-size", "16px");
  btn.style("font-family", "Arial, sans-serif");
  btn.style("cursor", "pointer");
}

function removeIntroButtons() {
  [btnMapEditor, btnAdventure, btnMapLoader].forEach(b => b && b.remove());
  btnMapEditor = btnAdventure = btnMapLoader = null;
}

// -------------------------------------------------
// KEY PRESSED: Pause & Key-Bind Capture
// -------------------------------------------------
function keyPressed() {
  // 1) Enter pause
  if ((state === "mapEditor" || state === "mapLoader" || state === "adventure") && keyCode === ESCAPE) {
    prevState = state;
    state = "keyBinds";

    if (prevState === "mapLoader") {
      ml.loadBtn?.hide();
      ml.backBtn?.hide();
      allSprites.visible = false;
    }
    // hide adventure UI here if needed

    setupKeyBindsScreen();
    return;
  }

  // 2) Exit pause
  if (state === "keyBinds") {
    if (keyCode === ESCAPE) {
      cleanupKeyBindUI();
      backButtonKB.remove();
      backButtonKB = null;

      if (prevState === "mapLoader") {
        state = "mapLoader";
        ml.loadBtn?.show();
        ml.backBtn?.show();
        allSprites.visible = true;
      }
      else if (prevState === "mapEditor") {
        state = "mapEditor";
      }
      else if (prevState === "adventure") {
        state = "adventure";
      }
      else {
        state = "intro";
        setupIntroScreen();
      }
      prevState = null;
      return;
    }

    if (rebindAction) {
      controls[rebindAction] = keyCode;
      keyBindBtns[rebindAction].html(codeToLabel(keyCode));
      rebindAction = null;
    }
    return;
  }

  // 3) Normal delegation
  if (state === "mapEditor") {
    mg.keyPressed?.();
  }
  if (state === "mapLoader") {
    ml.keyPressed?.();
  }
  if (state === "adventure") /* adventure.keyPressed?.() */{
    ;
  }
}

// -------------------------------------------------
// BUILD Pause / Key-Binds UI
// -------------------------------------------------
function setupKeyBindsScreen() {
  backButtonKB = createButton("Back");
  backButtonKB.position(20, 20);
  backButtonKB.size(100, 40);
  styleButton(backButtonKB);
  backButtonKB.mousePressed(() => {
    cleanupKeyBindUI();
    backButtonKB.remove();
    backButtonKB = null;
    if (prevState === "mapLoader") {
      state = "mapLoader";
      ml.loadBtn?.show();
      ml.backBtn?.show();
      allSprites.visible = true;
    }
    else if (prevState === "mapEditor") {
      state = "mapEditor";
    }
    else if (prevState === "adventure") {
      state = "adventure";
    }
    else {
      state = "intro";
      setupIntroScreen();
    }
    prevState = null;
  });

  if (prevState !== "mapEditor") {
    ['up','down','left','right'].forEach((act,i) => {
      const y = height * 0.2 + i * 50 - 15;
      let btn = createButton(codeToLabel(controls[act]));
      btn.position(150, y);
      btn.size(80, 30);
      styleButton(btn);
      btn.mousePressed(() => {
        rebindAction = act; btn.html('Press…'); 
      });
      keyBindBtns[act] = btn;
    });
  }
}

function cleanupKeyBindUI() {
  Object.values(keyBindBtns).forEach(b => b.remove());
  keyBindBtns = {};
  rebindAction = null;
}

// -------------------------------------------------
// MOUSE handling
// -------------------------------------------------
function mousePressed() {
  if (state === "mapEditor") {
    mg.mousePressed?.();
  }
  else if (state === "mapLoader") {
    ml.mousePressed?.();
  }
  else if (state === "adventure") /* adventure.mousePressed?.() */{
    ;
  }
}
