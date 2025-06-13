// Main game variables and state
let mg, ml, adv; // MapGenerator, MapLoader, AdventureMode instances
let state = "intro"; // Current game state
let prevState = null; // Previous state for returning from menus
let introImg; // Intro screen image
let bgMusic; // Background music

// Controls and key binding UI
let controls; // Object holding key bindings
let rebindAction = null; // Which action is being rebound
let keyBindBtns = {}; // Buttons for key binding UI

// Converts key codes to display labels for UI
function codeToLabel(code) {
  switch (code) {
  case UP_ARROW:    return '↑';
  case 32:          return '␣';
  case LEFT_ARROW:  return '←';
  case RIGHT_ARROW: return '→';
  default:          return String.fromCharCode(code);
  }
}

// Main menu and keybind screen buttons
let btnMapEditor, btnAdventure, btnMapLoader, btnReset;
let backButtonKB;

// Preload assets and initialize game modes
function preload() {
  introImg = loadImage("asset/introWindow.png");
  bar1 =  loadImage("asset/Live Bar1.png");
  bar2 =  loadImage("asset/Live Bar2.png");
  bar3 =  loadImage("asset/Live Bar3.png");
  
  // Try to load background music, handle errors gracefully
  try {
    bgMusic = loadSound('asset/bgsound.mp3', 
      () => console.log("Sound loaded successfully"),
      (err) => {
        console.error("Error loading sound:", err);
        bgMusic = null;
      }
    );
  }
  catch (err) {
    console.error("Error loading sound:", err);
    bgMusic = null;
  }

  // Initialize and preload all game modes
  mg = new MapGenerator({ cols: 20, rows: 14, tileSize: 64, bgCount: 47, wallCount: 47, decCount: 24 });
  mg.preload();
  ml = new MapLoader({ cols: 20, rows: 14, tileSize: 64, bgCount: 47, wallCount: 47, decCount: 24 });
  ml.preload();
  adv = new AdventureMode({ cols: 20, rows: 14, tileSize: 64, bgCount: 47, wallCount: 47, decCount: 24 });
  adv.preload();
}

// Setup canvas, music, controls, and main menu
function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Start background music
  bgMusic.setVolume(0.5); 
  bgMusic.loop(); 
  
  // Default controls
  controls = {
    Jump:    UP_ARROW,
    Attack:  32,
    Left:  LEFT_ARROW,
    Right: RIGHT_ARROW
  };

  // Show intro or end screen as needed
  if (state === "intro") {
    setupIntroScreen();
  }
  if (state === "end") {
    endScreenBtn();
  }
}

// Main game loop: draws the current state
function draw() {
  background(62, 56, 80);

  if (state === "intro") {
    // Draw intro screen
    imageMode(CORNER);
    image(introImg, 0, 0, width, height);
  }
  else if (state === "mapEditor") {
    // Draw map editor
    mg.draw();
  }
  else if (state === "mapLoader") {
    // Draw map loader and check for player death
    ml.draw();
    if (ml.player && typeof ml.player.lives === 'number') {
      if (ml.player.lives === 3) {
        image(bar3, 100, 100, 198, 102);
      }
      else if (ml.player.lives === 2) {
        image(bar2, 100, 100, 198, 102);
      }
      else if (ml.player.lives === 1) {
        image(bar1, 100, 100, 198, 102);
      }
    }
    if (ml.player) {

      if (ml.player.isDead) {
        prevState = "mapLoader";
        ml.loadBtn?.hide();
        ml.player.spi.visible = false;
        for (let pig of ml.pigs) {
          if (pig && pig.pigSpi) {
            pig.pigSpi.visible = false;
          }
        }
        state = "end";
        endScreenBtn();
      }
    }
  }
  else if (state === "adventure") {
    // Draw adventure mode and check for player death
    adv.draw();
    if (adv.player && typeof adv.player.lives === 'number') {
      if (adv.player.lives === 3) {
        image(bar3, 100, 100, 198, 102);
      }
      else if (adv.player.lives === 2) {
        image(bar2, 100, 100, 198, 102);
      }
      else if (adv.player.lives === 1) {
        image(bar1, 100, 100, 198, 102);
      }
    }
    if (adv.player) {
      if (adv.player.isDead) {
        prevState = "adventure";
        adv.backBtn?.hide();
        adv.player.spi.visible = false;
        for (let pig of adv.pigs) {
          if (pig && pig.pigSpi) {
            pig.pigSpi.visible = false;
          }
        }
        state = "end";
        endScreenBtn();
      }
    }
  }
  else if (state === "end") {
    // Draw game over screen
    imageMode(CORNER);
    image(introImg, 0, 0, width, height);
    fill('#e6816d');
    stroke(0);
    strokeWeight(4);
    textSize(38);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("Game Over", width / 2, height / 2 - 60);
    textSize(24);
    strokeWeight(1);
  }
  else if (state === "keyBinds") {
    // Draw key binding and instructions screen
    imageMode(CORNER);
    image(introImg, 0, 0, width, height);

    if (prevState === "mapEditor") {
      // Map editor instructions
      fill('#e6816d');
      stroke(0);
      strokeWeight(4);
      textSize(24);
      textStyle(BOLD);
      textAlign(CENTER, CENTER);
      text(
        "Map Generator Instructions:\n" +
        "Click “Back” at the bottom of the page to go back to the main menu.\n" +
        "Use the tile palette to place walls or decorations.\n" +
        "Click “Save” to download your layout.\n" +
        "Click “Erase” to erase any unwanted tile.\n" +
        "Press ESC or Back button top left to resume.",
        width * 0.06,
        height * 0.5,
        width - 100
      );
      strokeWeight(1);
    }
    else {
      // Show key binding options
      const startY = height/2.5;
      const lineH  = 50;
      fill('#e6816d');
      stroke(0);
      strokeWeight(4);
      textSize(24);
      textStyle(BOLD);
      textAlign(LEFT, CENTER);
      ['Up','Attack','Left','Right'].forEach((act,i) => {
        const y = startY + i * lineH;
        text(act.toUpperCase() + ':', width/5, y);
      });
      strokeWeight(1);
    }
    if (prevState === "mapLoader") {
      // Map loader instructions
      fill('#e6816d');
      stroke(0);
      strokeWeight(4);
      textSize(24);
      textStyle(BOLD);
      textAlign(CENTER, CENTER);
      text(
        "Map Loader Instructions:\n" +
        "Click “Back” on map loader screen to go back to the main menu.\n" +
        "Use key binds to adjust controls.\n" +
        "Click “Load” to load your saved map (json files).\n" +
        "Press ESC or Back button top left to resume.",
        width * 0.06,
        height * 0.5,
        width - 100
      );
      strokeWeight(1);
    }
    if (prevState === "adventure") {
      // Adventure mode instructions
      fill('#e6816d');
      stroke(0);
      strokeWeight(4);
      textSize(24);
      textStyle(BOLD);
      textAlign(CENTER, CENTER);
      text(
        "Adventure Mode Instructions:\n" +
        "Click “Back” on Adventure Mode screen to go back to the main menu.\n" +
        "Use key binds to adjust controls.\n" +
        "Press “Space bar” to attack the enemies.\n" +
        "Press ESC or Back button top left to exit pause screen.",
        width * 0.06,
        height * 0.5,
        width - 100
      );
      strokeWeight(1);
    }
  }
}

// Setup the intro/main menu screen and its buttons
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
  btnAdventure.mousePressed(() => {
    removeIntroButtons(); 
    state = "adventure"; 
    adv.setup();

    // Load last completed level or start from 1
    const lastLevel = parseInt(localStorage.getItem('lastCompletedLevel')) || 0;
    const startLevel = lastLevel + 1;
    
    if (startLevel <= adv.totalMaps) {
      adv.loadMap(startLevel);
    }
    else {
      adv.loadMap(1);
    }
  });

  btnMapLoader = createButton("Map Loader");
  btnMapLoader.position(width/2 - 100, height/2 + 110);
  btnMapLoader.size(200, 40);
  styleButton(btnMapLoader);
  btnMapLoader.mousePressed(() => {
    removeIntroButtons(); state = "mapLoader"; ml.setup(); 
  });

  btnReset = createButton("Reset Progress");
  btnReset.position(width/2 - 100, height/2 + 160);
  btnReset.size(200, 40);
  styleButton(btnReset);
  btnReset.mousePressed(() => {
    localStorage.removeItem('lastCompletedLevel');
    alert('Progress reset! Game will start from Level 1');
  });

  // Add hover effects to all menu buttons
  [btnMapEditor, btnAdventure, btnMapLoader, btnReset].forEach(btn => {
    btn.mouseOver(() => btn.style('background-color', '#8541ee'));
    btn.mouseOut(() => btn.style('background-color', '#3E3850'));
  });
}

// Apply consistent styling to buttons
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

// Remove all main menu buttons from the screen
function removeIntroButtons() {
  [btnMapEditor, btnAdventure, btnMapLoader, btnReset].forEach(b => b && b.remove());
  btnMapEditor = btnAdventure = btnMapLoader = btnReset = null;
}

// Handle all key presses for game and menus
function keyPressed() {
  // Open keybinds/instructions screen with ESC in game modes
  if ((state === "mapEditor" || state === "mapLoader" || state === "adventure") && keyCode === ESCAPE) {
    prevState = state;
    state = "keyBinds";

    // Hide relevant UI and sprites
    if (prevState === "mapLoader") {
      ml.loadBtn?.hide();
      ml.backBtn?.hide();
      allSprites.visible = false;
    }
    
    if (prevState === "adventure") {
      adv.backBtn?.hide();
      allSprites.visible = false;
    }

    setupKeyBindsScreen();
    return;
  }

  // Handle keybinds/instructions screen logic
  if (state === "keyBinds") {
    if (keyCode === ESCAPE) {
      cleanupKeyBindUI();
      backButtonKB.remove();
      backButtonKB = null;

      // Restore previous state and UI
      if (prevState === "mapLoader") {
        state = "mapLoader";
        ml.loadBtn?.show();
        ml.backBtn?.show();
        ml.player.visible = true;
        ml.pigs.visible = true;
      }
      else if (prevState === "mapEditor") {
        state = "mapEditor";
      }
      else if (prevState === "adventure") {
        state = "adventure";
        adv.backBtn?.show();
        adv.player.visible = true;
        adv.pigs.visible = true;
      }
      else {
        state = "intro";
        setupIntroScreen();
      }
      prevState = null;
      return;
    }

    // Handle rebinding a control
    if (rebindAction) {
      controls[rebindAction] = keyCode;
      keyBindBtns[rebindAction].html(codeToLabel(keyCode));
      rebindAction = null;
    }
    return;
  }

  // Forward key presses to current game mode
  if (state === "mapEditor") {
    mg.keyPressed?.();
  }
  if (state === "mapLoader") {
    ml.keyPressed?.();
  }
  if (state === "adventure") {
    adv.keyPressed?.();
  }

  // Toggle background music with 'm'
  if (key === 'm' || key === 'M') {
    if (bgMusic.isPlaying()) {
      bgMusic.pause();
    }
    else {
      bgMusic.loop();
    }
  }
}

// Setup the key binding and instructions screen
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
      ml.player.visible = true;
      ml.pigs.visible = true;
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

  // Show key binding buttons if not in map editor
  if (prevState !== "mapEditor") {
    ['Jump','Attack','Left','Right'].forEach((act,i) => {
      const y = height/2.5 + i * 50 - 15;
      let btn = createButton(codeToLabel(controls[act]));
      btn.position(width/4, y);
      btn.size(80, 30);
      styleButton(btn);
      btn.mousePressed(() => {
        rebindAction = act; btn.html('Press…'); 
      });
      keyBindBtns[act] = btn;
    });
  }
}

// Remove key binding UI elements
function cleanupKeyBindUI() {
  Object.values(keyBindBtns).forEach(b => b.remove());
  keyBindBtns = {};
  rebindAction = null;
}

// Forward mouse presses to the current game mode
function mousePressed() {
  if (state === "mapEditor") {
    mg.mousePressed?.();
  }
  else if (state === "mapLoader") {
    ml.mousePressed?.();
  }
  else if (state === "adventure") {
    adv.mousePressed?.();
  }
}

// Show the "Game Over" screen with a button to return to main menu
function endScreenBtn() {
  btnBackMenu = createButton("Back to Main Menu");
  btnBackMenu.position(width / 2 - 100, height / 2);
  btnBackMenu.size(200, 40);
  styleButton(btnBackMenu);
  btnBackMenu.mousePressed(() => {
    location.reload();
  });
  btnBackMenu.mouseOver(() => btnBackMenu.style('background-color', '#8541ee'));
  btnBackMenu.mouseOut (() => btnBackMenu.style('background-color', '#3E3850'));
}
