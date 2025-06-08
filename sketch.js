// sketch.js

let mg, ml;
let state = "intro";      // "intro" | "mapEditor" | "mapLoader" | "keyBinds"
let prevState = null;     // remembers whether we came from "mapEditor" or "mapLoader"
let introImg;

// Intro‐screen buttons:
let btnMapEditor, btnAdventure, btnMapLoader;

// Pause/Key‐Binds UI:
let backButtonKB;

function preload() {
  introImg = loadImage("asset/introWindow.png");

  // Prepare MapGenerator and MapLoader:
  mg = new MapGenerator({
    cols: 20,
    rows: 14,
    tileSize: 64,
    bgCount: 47,
    wallCount: 47,
    decCount: 23,
  });
  mg.preload();

  ml = new MapLoader({
    cols: 20,
    rows: 14,
    tileSize: 64,
    bgCount: 47,
    wallCount: 47,
    decCount: 23,
  });
  ml.preload();
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  if (state === "intro") {
    setupIntroScreen();
  }
}

function draw() {
  background(62, 56, 80);

  if (state === "intro") {
    // Draw main menu background:
    imageMode(CORNER);
    image(introImg, 0, 0, width, height);
  }
  else if (state === "mapEditor") {
    mg.draw();
  }
  else if (state === "mapLoader") {
    ml.draw();
  }
  else if (state === "keyBinds") {
    // Pause overlay: show the same introWindow.png + title + Back button
    imageMode(CORNER);
    image(introImg, 0, 0, width, height);

    fill(255);
    textAlign(CENTER, TOP);
    textSize(36);
    text("Customizable Key Binds", width / 2, height * 0.15);

    // (Insert any key‐binding UI here if desired.)
  }
}


function setupIntroScreen() {
  // “Start Map Editor”:
  btnMapEditor = createButton("Start Map Editor");
  btnMapEditor.position(width / 2 - 100, height / 2 +  60);
  btnMapEditor.size(200, 40);
  styleButton(btnMapEditor);
  btnMapEditor.mousePressed(() => {
    removeIntroButtons();
    state = "mapEditor";
    mg.setup();
  });

  // “Adventure Mode” (placeholder):
  btnAdventure = createButton("Adventure Mode");
  btnAdventure.position(width / 2 - 100, height / 2 +  10);
  btnAdventure.size(200, 40);
  styleButton(btnAdventure);
  // If you implement Adventure Mode later, add a mousePressed handler here.

  // “Map Loader”:
  btnMapLoader = createButton("Map Loader");
  btnMapLoader.position(width / 2 - 100, height / 2 + 110);
  btnMapLoader.size(200, 40);
  styleButton(btnMapLoader);
  btnMapLoader.mousePressed(() => {
    removeIntroButtons();
    state = "mapLoader";
    ml.setup();
  });

  // Hover effects on intro buttons:
  [btnMapEditor, btnAdventure, btnMapLoader].forEach(btn => {
    btn.mouseOver(() => btn.style('background-color', '#8541ee'));
    btn.mouseOut(()  => btn.style('background-color', '#3E3850'));
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
  [btnMapEditor, btnAdventure, btnMapLoader].forEach(btn => {
    if (btn) btn.remove();
  });
  btnMapEditor = btnAdventure = btnMapLoader = null;
}



// -------------------------------------------------
// KEY PRESSED: toggle pause overlay when in mapLoader
// -------------------------------------------------
function keyPressed() {
  // If in mapEditor or mapLoader and user hits Esc, open the keyBinds (pause) overlay:
  if ((state === "mapEditor" || state === "mapLoader") && keyCode === 27) {
    prevState = state;
    state = "keyBinds";

    // *** Hide MapLoader UI and all sprites when pausing ***
    if (prevState === "mapLoader") {
      // Hide the “Load Map” and “Back” buttons from MapLoader (created here :contentReference[oaicite:1]{index=1})
      if (ml.loadBtn) ml.loadBtn.hide();
      if (ml.backBtn) ml.backBtn.hide();
      // Hide every sprite (King, pigs, walls, colliders):
      // p5.play exposes a global `allSprites` Group
      allSprites.visible = false;
    }

    setupKeyBindsScreen();
    return; // Don’t forward this key event to mg or ml while paused
  }

  // If we’re currently in the paused “keyBinds” overlay, do nothing else:
  if (state === "keyBinds") {
    return;
  }

  // Otherwise, delegate key presses to mapEditor or mapLoader:
  if (state === "mapEditor") {
    mg.keyPressed && mg.keyPressed();
  }
  if (state === "mapLoader") {
    ml.keyPressed && ml.keyPressed();
  }
}



// -------------------------------------------------
// BUILD the pause/“Customizable Key Binds” window
// -------------------------------------------------
function setupKeyBindsScreen() {
  // Create a styled Back button in the top‐left corner:
  backButtonKB = createButton("Back");
  backButtonKB.position(20, 20);
  backButtonKB.size(100, 40);
  styleButton(backButtonKB);

  backButtonKB.mousePressed(() => {
    // Remove the Back button from the DOM:
    if (backButtonKB) {
      backButtonKB.remove();
      backButtonKB = null;
    }

    // If we paused from mapLoader, restore its UI and sprites:
    if (prevState === "mapLoader") {
      state = "mapLoader";
      prevState = null;

      // *** Un‐pause: show MapLoader’s buttons and sprites again ***
      if (ml.loadBtn) ml.loadBtn.show();
      if (ml.backBtn) ml.backBtn.show();
      allSprites.visible = true;
    }
    else if (prevState === "mapEditor") {
      state = "mapEditor";
      prevState = null;
    }
    else {
      // Fallback: return to main menu if somehow keyBinds was opened from intro
      state = "intro";
      prevState = null;
      setupIntroScreen();
    }
  });
}



// -------------------------------------------------
// MOUSE handling for mapEditor and mapLoader
// -------------------------------------------------
function mousePressed() {
  if (state === "mapEditor") {
    mg.mousePressed && mg.mousePressed();
  }
  else if (state === "mapLoader") {
    ml.mousePressed && ml.mousePressed();
  }
}
