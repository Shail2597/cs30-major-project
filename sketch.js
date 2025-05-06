// Platformer Game
// Hosain Javadi and Shail Chaudhari
// April 16th, 2025
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let lvl1Image;
let lvl1XOffset, lvl1YOffset;

let lvl1StartX, lvl1StartY;
let lvl1Bounds;

let player;

player = new King();


function preload() {
  new Canvas(1044,728);
  // Initialize lvl1StartX and lvl1StartY after windowWidth and windowHeight are available
  lvl1StartX = (windowWidth - 893) / 2;
  lvl1StartY = (windowHeight - 192) / 2;
  
  // Define the rectangle boundaries for lvl1
  lvl1Bounds = {
    topLeft: { x: lvl1StartX, y: lvl1StartY },
    bottomRight: { x: lvl1StartX + 893, y: lvl1StartY + 192 },
  };
  
  calculateLvl1Offsets();
  
  lvl1Image = loadImage("assets/lvl 1.png");
}

function setup() {
  world.gravity.y =10;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateLvl1Offsets();
  
  // Recalculate lvl1StartX and lvl1StartY on window resize
  lvl1StartX = (windowWidth - 893) / 2;
  lvl1StartY = (windowHeight - 192) / 2;
  
  // Update rectangle boundaries for lvl1
  lvl1Bounds = {
    topLeft: { x: lvl1StartX, y: lvl1StartY },
    bottomRight: { x: lvl1StartX + 893, y: lvl1StartY + 192 },
  };
}

function calculateLvl1Offsets() {
  lvl1XOffset = (windowWidth - lvl1Image.width) / 2;
  lvl1YOffset = (windowHeight - lvl1Image.height) / 2;
}

function draw() {
  background(62, 56, 80);

  // Draw lvl1
  image(lvl1Image, lvl1XOffset, lvl1YOffset);
console.log(mouseX, mouseY);
  //player.doAll();
}


